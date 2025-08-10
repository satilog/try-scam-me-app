"use client";

import React, { useEffect, useRef, useState } from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";

interface TranscriptEntry {
  timestamp: string; // mm:ss
  speaker: string;
  message: string;
}
interface AudioVisualizerProps {
  onTranscriptUpdate?: (entry: TranscriptEntry) => void;
}

const HOST = "172.16.1.76:8001"; // your LAN host:port
const WS_PATH = "/ws/audio";

const VoiceVisualizerMinimal: React.FC<AudioVisualizerProps> = ({ onTranscriptUpdate }) => {
  // --- WS + audio refs ---
  const wsRef = useRef<WebSocket | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isStreamingRef = useRef(false);

  // --- UI state ---
  const [logText, setLogText] = useState("");
  const [wsReady, setWsReady] = useState(false);
  const [micActive, setMicActive] = useState(false);

  const log = (s: string) => setLogText((prev) => prev + s + "\n");
  const nowStamp = () => {
    const now = new Date();
    return `${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  };

  // Cleanly stop mic/audio pipeline
  const stopMicStream = async () => {
    isStreamingRef.current = false;

    if (processorRef.current) {
      try { processorRef.current.disconnect(); } catch {}
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (sourceRef.current) {
      try { sourceRef.current.disconnect(); } catch {}
      sourceRef.current = null;
    }
    if (audioCtxRef.current) {
      try { await audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }

    setMicActive(false);
    log("Mic recording stopped");
  };

  // Waveform controls (we’ll call start/stop from our button)
  const controls = useVoiceVisualizer({
    shouldHandleBeforeUnload: true,
    onStartRecording: async () => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        log("WebSocket not connected; cannot start mic");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioCtxRef.current = ctx;
        if (ctx.state === "suspended") await ctx.resume();

        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;

        const processor = ctx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(ctx.destination);

        isStreamingRef.current = true;

        processor.onaudioprocess = (e) => {
          if (!isStreamingRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
          const input = e.inputBuffer.getChannelData(0);
          const pcm = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          wsRef.current.send(pcm.buffer);
        };

        setMicActive(true);
        log("Mic recording started");
      } catch (err: any) {
        log("Mic error: " + (err?.message ?? String(err)));
      }
    },
    onStopRecording: () => {
      stopMicStream();
    },
  });

  // Auto-connect WS on mount (mic does NOT start automatically)
  useEffect(() => {
    const scheme = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss://" : "ws://";
    const url = `${scheme}${HOST}${WS_PATH}`;

    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      log("WebSocket connected");
      setWsReady(true);
    };

    ws.onclose = () => {
      log("WebSocket disconnected");
      setWsReady(false);
      stopMicStream();
    };

    ws.onerror = () => {
      log("WebSocket error");
    };

    ws.onmessage = (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        log(`Received binary data: ${event.data.byteLength} bytes`);
      } else {
        log(`Received: ${event.data}`);
        try {
          const resp = JSON.parse(event.data as string);
          if (resp?.transcript && onTranscriptUpdate) {
            onTranscriptUpdate({
              timestamp: nowStamp(),
              speaker: resp.is_scam ? "Scam Alert" : "Caller",
              message: resp.transcript,
            });
            if (resp.is_scam && resp.scam_details) {
              onTranscriptUpdate({
                timestamp: nowStamp(),
                speaker: "AI Warning",
                message: `Potential scam detected: ${resp.scam_details}`,
              });
            }
          }
        } catch { /* non-JSON text */ }
      }
    };

    wsRef.current = ws;

    return () => {
      stopMicStream();
      try { ws.close(); } catch {}
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Single button handler: start if off, stop if on
  const toggleMic = () => {
    if (!micActive) {
      if (!wsReady) {
        log("WebSocket not ready yet.");
        return;
      }
      controls.startRecording();
    } else {
      controls.stopRecording();
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Log window */}
      <pre className="bg-gray-100 p-3 h-52 overflow-auto whitespace-pre-wrap text-sm rounded border">
        {logText}
      </pre>

      {/* Waveform UI (visual only; capture handled above) */}
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
    </div>
  );
};

export default VoiceVisualizerMinimal;
