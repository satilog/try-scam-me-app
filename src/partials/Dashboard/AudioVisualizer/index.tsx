"use client";

import React, { useEffect, useState, useRef } from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";

interface TranscriptEntry {
  timestamp: string; // Format: mm:ss
  speaker: string;
  message: string;
}

interface AudioVisualizerProps {
  onTranscriptUpdate?: (entry: TranscriptEntry) => void;
}

const VoiceVisualizerMinimal: React.FC<AudioVisualizerProps> = ({ onTranscriptUpdate }) => {
  // State for WebSocket and audio streaming
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState("");

  // Refs for WebSocket and audio processing
  const wsRef = useRef<WebSocket | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // ---- helpers --------------------------------------------------------------

  const nowStamp = () => {
    const now = new Date();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const waitForOpen = async (ws: WebSocket, timeoutMs = 3000) => {
    if (ws.readyState === WebSocket.OPEN) return true;
    const start = Date.now();
    return await new Promise<boolean>((resolve) => {
      const check = () => {
        if (ws.readyState === WebSocket.OPEN) return resolve(true);
        if (Date.now() - start > timeoutMs) return resolve(false);
        setTimeout(check, 50);
      };
      check();
    });
  };

  // ---- websocket ------------------------------------------------------------

  const connectWebSocket = () => {
    // Prevent duplicate connections
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    // Get WebSocket URL from environment variable
    const wsBase = process.env.NEXT_PUBLIC_WS_API_URL || 'ws://172.16.1.76:8001';
    const wsUrl = `${wsBase}/ws/audio`;
    console.log('Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    // Keep onclose light: just update state. Do NOT stop audio here.
    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const response = JSON.parse(event.data);
          console.log("Received transcription:", response);

          if (response.transcript && onTranscriptUpdate) {
            const timestamp = nowStamp();
            const speaker = response.is_scam ? "Scam Alert" : "Caller";

            onTranscriptUpdate({
              timestamp,
              speaker,
              message: response.transcript,
            });

            if (response.is_scam && response.scam_details) {
              onTranscriptUpdate({
                timestamp,
                speaker: "AI Warning",
                message: `Potential scam detected: ${response.scam_details}`,
              });
            }
          }
        } catch {
          console.log("Received text message:", event.data);
        }
      } else if (event.data instanceof ArrayBuffer) {
        console.log("Received binary data:", event.data.byteLength, "bytes");
      }
    };

    wsRef.current = ws;
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
  };

  // ---- audio ---------------------------------------------------------------

  const stopAudioStream = () => {
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch {}
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current
        .close()
        .catch((err) => console.error("Error closing audio context:", err));
      audioContextRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    setIsListening(false);
  };

  // Connect to WebSocket when component mounts
  useEffect(() => {
    connectWebSocket();

    return () => {
      // Stop audio first so no more sends happen
      stopAudioStream();
      // Then close the socket
      disconnectWebSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const controls = useVoiceVisualizer({
    shouldHandleBeforeUnload: true,
    onStartRecording: async () => {
      // Ensure a single, open socket before streaming
      if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
        connectWebSocket();
      }
      if (!wsRef.current) {
        onTranscriptUpdate?.({
          timestamp: nowStamp(),
          speaker: "System",
          message: "Unable to initialize WebSocket.",
        });
        return;
      }
      const ok = await waitForOpen(wsRef.current);
      if (!ok) {
        onTranscriptUpdate?.({
          timestamp: nowStamp(),
          speaker: "System",
          message: "WebSocket not ready. Please try again.",
        });
        return;
      }

      try {
        // Get microphone stream
        audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Create audio context with 16kHz sample rate - exactly like the working example
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

        // Create source node
        sourceRef.current = audioContextRef.current.createMediaStreamSource(audioStreamRef.current);

        // Create processor node
        processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        // Connect nodes
        sourceRef.current.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);

        processorRef.current.onaudioprocess = (e) => {
          // Don't send if not listening or socket not OPEN
          if (!isListening || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

          // Get audio data
          const input = e.inputBuffer.getChannelData(0);
          
          // Convert Float32 [-1,1] to 16-bit PCM - directly matching the working example
          const pcm = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          // Send PCM data to WebSocket
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(pcm.buffer);
            console.log('Sent PCM chunk: ' + pcm.byteLength + ' bytes');
          }
        };

        setIsListening(true);
        console.log("Microphone streaming started");

        onTranscriptUpdate?.({
          timestamp: nowStamp(),
          speaker: "System",
          message: "Microphone active - streaming to AI for transcription and scam detection",
        });
      } catch (err: any) {
        console.error("Error starting microphone stream:", err);
        onTranscriptUpdate?.({
          timestamp: nowStamp(),
          speaker: "System",
          message: `Error accessing microphone: ${err?.message || "Unknown error"}`,
        });
      }
    },
    onStopRecording: () => {
      // Stop audio first, which stops further sends
      stopAudioStream();
      console.log("Microphone streaming stopped");

      onTranscriptUpdate?.({
        timestamp: nowStamp(),
        speaker: "System",
        message: "Microphone stopped",
      });
      // If you want to close the WS here, do it AFTER stopping audio:
      // disconnectWebSocket();
    },
  });

  const { startRecording, stopRecording, error } = controls;

  return (
    <div className="w-full flex flex-col">
      <div className="w-full">
        <div className="bg-white shadow rounded-lg border border-border">
          <VoiceVisualizer
            controls={controls}
            height={180}
            width={"100%"}
            backgroundColor="transparent"
            mainBarColor="#a3a3a3"
            secondaryBarColor="#a3a3a3"
            isDefaultUIShown={true}
            onlyRecording={false}
          />
        </div>

        {error && (
          <p className="mt-2 text-center text-body text-accent">{error.message}</p>
        )}

        {isListening && (
          <div className="mt-4 flex justify-center">
            <div className="text-xs text-gray-500 italic">
              Speech recognition active - speak clearly for best results
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceVisualizerMinimal;
