"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Transcript from "./Transcript";
import { Speaker } from "./Speakers";
import RiskAnalysis from "./RiskAnalysis";
import { SafeCaller, safeCallersData } from "@/data/safeCallers";
const Speakers = dynamic(() => import("./Speakers"), { ssr: false });

interface Highlight {
  text: string;
  type: "yellow" | "red";
  startIndex: number;
}

interface ScamReport {
  scamLevel: 'neutral' | 'cautious' | 'alert';
  probability: number;
}

interface TranscriptEntry {
  timestamp: string; // Format: mm:ss
  speaker: string;
  message: string;
  highlights?: Highlight[];
  scamReport?: ScamReport;
}

interface DashboardProps {
  transcription?: string;
  transcriptEntries?: TranscriptEntry[];
}

const AudioVisualizer = dynamic(
  () => import("@/partials/Dashboard/AudioVisualizer"),
  {
    ssr: false,
  }
);

// WebSocket server configuration
const HOST = "172.16.1.76:8001"; // Hardcoded server address
const WS_PATH = "/ws/audio";

const Dashboard = ({
  transcription,
  transcriptEntries = [],
}: DashboardProps) => {
  // State for real-time transcript entries
  const [liveTranscriptEntries, setLiveTranscriptEntries] = useState<
    TranscriptEntry[]
  >([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [uniqueSpeakerIds, setUniqueSpeakerIds] = useState<Set<string>>(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const [aggregatedScamLevel, setAggregatedScamLevel] = useState<'neutral' | 'safe' | 'cautious' | 'alert'>('neutral');
  const [aggregatedRationale, setAggregatedRationale] = useState<string>('');
  
  // Track processed message IDs to prevent duplicates
  const processedMessageIds = useRef<Set<string>>(new Set());

  // Debug: Log speakers whenever they change
  useEffect(() => {
    console.log("🎤 Speakers updated:", speakers);
    console.log("🎤 Unique speaker IDs:", Array.from(uniqueSpeakerIds));
  }, [speakers, uniqueSpeakerIds]);

  // WebSocket and audio refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isStreamingRef = useRef(false);

  // Helper function to get current timestamp in mm:ss format
  const nowStamp = () => {
    const now = new Date();
    return `${String(now.getMinutes()).padStart(2, "0")}:${String(
      now.getSeconds()
    ).padStart(2, "0")}`;
  };

  // Function to update speakers based on transcript entries
  const updateSpeakersFromTranscript = useCallback((speakerId: string) => {
    if (!speakerId || speakerId === "System" || speakerId === "AI Warning" || speakerId === "Scam Alert") {
      return; // Skip system messages
    }

    setUniqueSpeakerIds((prevIds) => {
      if (prevIds.has(speakerId)) {
        return prevIds; // Speaker already tracked
      }

      const newIds = new Set(prevIds);
      newIds.add(speakerId);

      // Update speakers list based on safe callers data
      setSpeakers((prevSpeakers) => {
        const existingSpeaker = prevSpeakers.find(s => s.id === speakerId);
        if (existingSpeaker) {
          return prevSpeakers; // Speaker already exists
        }

        // Find speaker in safe callers data
        const safeCaller = safeCallersData.find(caller => caller.id === speakerId);
        
        // Determine speaker type based on safe callers data
        let speakerType: 'you' | 'safe' | 'neutral' | 'scammer';
        if (safeCaller) {
          speakerType = safeCaller.isYou ? 'you' : 'safe';
        } else {
          speakerType = 'neutral'; // Default for unknown speakers
        }
        
        const newSpeaker: Speaker = {
          id: speakerId,
          name: safeCaller ? (safeCaller.isYou ? "You" : safeCaller.name) : `Speaker ${speakerId.replace('speaker_', '')}`,
          role: safeCaller ? (safeCaller.isYou ? "user" : "caller") : "unknown",
          speakerType: speakerType
        };

        return [...prevSpeakers, newSpeaker];
      });

      return newIds;
    });
  }, []);

  // Add a new transcript entry to the top of the list with deduplication
  const addTranscriptEntry = useCallback((entry: TranscriptEntry) => {
    // Create a unique ID for this message to prevent duplicates
    const messageId = `${entry.timestamp}-${entry.speaker}-${entry.message.substring(0, 50)}`;
    
    if (processedMessageIds.current.has(messageId)) {
      console.log('Duplicate message detected, skipping:', messageId);
      return;
    }
    
    processedMessageIds.current.add(messageId);
    setLiveTranscriptEntries((prev) => [entry, ...prev]);
    // Track unique speakers from transcript
    updateSpeakersFromTranscript(entry.speaker);
  }, [updateSpeakersFromTranscript]);

  // Default "no speech detected" entry when no transcripts exist
  const noSpeechEntry: TranscriptEntry = {
    timestamp: "",
    speaker: "System",
    message:
      "No speech detected. Start speaking after enabling the microphone.",
  };

  // Use live entries if available, otherwise use provided entries or the no speech message
  const displayEntries =
    liveTranscriptEntries.length > 0
      ? liveTranscriptEntries
      : transcriptEntries && transcriptEntries.length > 0
      ? transcriptEntries
      : [noSpeechEntry];

  // Clean up audio resources
  const stopMicStream = async () => {
    isStreamingRef.current = false;

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

    if (audioCtxRef.current) {
      try {
        await audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    setIsRecording(false);
  };

  // Start microphone and audio processing
  const startMicStream = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected. Cannot start microphone.");
      return;
    }

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Create audio context with 16kHz sample rate
      const ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      // Create audio source from microphone
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create processor node
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Connect audio nodes
      source.connect(processor);
      processor.connect(ctx.destination);

      // Set streaming flag
      isStreamingRef.current = true;

      // Process audio data
      processor.onaudioprocess = (e) => {
        if (
          !isStreamingRef.current ||
          !wsRef.current ||
          wsRef.current.readyState !== WebSocket.OPEN
        )
          return;

        // Get audio data
        const input = e.inputBuffer.getChannelData(0);

        // Convert Float32 [-1,1] to 16-bit PCM
        const pcm = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          const s = Math.max(-1, Math.min(1, input[i]));
          pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Send to WebSocket
        wsRef.current.send(pcm.buffer);
      };

      setIsRecording(true);
    } catch (err: any) {
      console.error("Error starting microphone:", err);
      // Remove system error messages to reduce transcript clutter
    }
  };

  // Toggle microphone on/off
  const toggleMicrophone = useCallback(() => {
    if (isRecording) {
      stopMicStream();
    } else {
      startMicStream();
    }
  }, [isRecording]);

  // Initialize WebSocket connection
  useEffect(() => {
    // Create WebSocket URL
    const scheme =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "wss://"
        : "ws://";
    const wsUrl = `${scheme}${HOST}${WS_PATH}`;
    console.log("Connecting to WebSocket:", wsUrl);

    // Create WebSocket
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    // WebSocket event handlers
    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");

      // Stop microphone if it's active
      if (isRecording) {
        stopMicStream();
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        console.log("Received binary data:", event.data.byteLength, "bytes");
      } else {
        console.log("Received from server:", event.data);

        // Try to parse JSON response
        try {
          const response = JSON.parse(event.data);
          console.log("Parsed response:", response);

          // Handle new response format - only process if text is present and not empty
          if (response.text && response.text.trim()) {
            // Format timestamp from server (if available)
            let displayTime = nowStamp();
            if (response.timestamp?.start) {
              try {
                const startTime = new Date(response.timestamp.start);
                displayTime = `${String(startTime.getMinutes()).padStart(
                  2,
                  "0"
                )}:${String(startTime.getSeconds()).padStart(2, "0")}`;
              } catch (e) {
                console.error("Error parsing timestamp:", e);
              }
            }

            // Use speaker ID from response or default to "Caller"
            const speaker = response.speakerId || "Caller";

            // Process highlights if available
            const highlights: Highlight[] = [];

            // Check for yellow highlights
            if (
              response.yellowHighlights &&
              Array.isArray(response.yellowHighlights)
            ) {
              response.yellowHighlights.forEach((highlight: any) => {
                if (
                  typeof highlight.text === "string" &&
                  typeof highlight.startIndex === "number"
                ) {
                  highlights.push({
                    text: highlight.text,
                    type: "yellow",
                    startIndex: highlight.startIndex,
                  });
                }
              });
            }

            // Check for red highlights
            if (
              response.redHighlights &&
              Array.isArray(response.redHighlights)
            ) {
              response.redHighlights.forEach((highlight: any) => {
                if (
                  typeof highlight.text === "string" &&
                  typeof highlight.startIndex === "number"
                ) {
                  highlights.push({
                    text: highlight.text,
                    type: "red",
                    startIndex: highlight.startIndex,
                  });
                }
              });
            }

            // Process speaker information if available
            if (response.speakers && Array.isArray(response.speakers)) {
              // Update speakers list with new information
              setSpeakers(prevSpeakers => {
                const updatedSpeakers = [...prevSpeakers];
                
                response.speakers.forEach((newSpeaker: any) => {
                  if (newSpeaker.id && newSpeaker.name) {
                    const existingIndex = updatedSpeakers.findIndex(s => s.id === newSpeaker.id);
                    
                    if (existingIndex >= 0) {
                      // Update existing speaker
                      updatedSpeakers[existingIndex] = {
                        ...updatedSpeakers[existingIndex],
                        ...newSpeaker
                      };
                    } else {
                      // Add new speaker
                      updatedSpeakers.push({
                        id: newSpeaker.id,
                        name: newSpeaker.name,
                        role: newSpeaker.role,
                        speakerType: newSpeaker.speakerType
                      });
                    }
                  }
                });
                
                return updatedSpeakers;
              });
            }
            
            // Update aggregated scam analysis if available
            if (response.aggregated) {
              setAggregatedScamLevel(response.aggregated.scamLevel || 'neutral');
              setAggregatedRationale(response.aggregated.rationale || '');
              console.log("📊 Aggregated scam analysis updated:", {
                level: response.aggregated.scamLevel,
                rationale: response.aggregated.rationale
              });
            }

            // Add transcript entry with highlights and scam report (only if text is meaningful)
            if (response.text.trim().length > 0) {
              addTranscriptEntry({
                timestamp: displayTime,
                speaker: speaker,
                message: response.text.trim(),
                highlights: highlights.length > 0 ? highlights : undefined,
                scamReport: response.scamReport ? {
                  scamLevel: response.scamReport.scamLevel,
                  probability: response.scamReport.probability
                } : undefined,
              });
            }

            // Note: AI Warning transcript entries removed per user request
            // All scam warnings are now handled visually in the RiskAnalysis component
          }
          // Handle legacy format for backward compatibility
          else if (response.transcript) {
            addTranscriptEntry({
              timestamp: nowStamp(),
              speaker: response.is_scam ? "Scam Alert" : "Caller",
              message: response.transcript,
            });

            // Note: AI Warning transcript entries removed per user request
            // Legacy scam detection warnings are now handled visually only
          }
        } catch (err) {
          // Non-JSON message
          console.log("Non-JSON message received:", event.data);
        }
      }
    };

    // Cleanup function
    return () => {
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, []);

  return (
    <div className="grid grid-rows-[auto,1fr] h-full min-h-0 py-8">
      {/* Row 1 — Audio visualizer takes natural height at the top */}
      <div className="flex-none">
        <AudioVisualizer
          onMicrophoneToggle={toggleMicrophone}
          isRecording={isRecording}
        />
      </div>

      {/* Row 2 — fills the remaining space */}
      <div className="min-h-0 overflow-hidden mt-6">
        <div className="flex h-full min-h-0 gap-4">
          {/* Left: Transcript (2/3) */}
          <div className="w-2/3 h-full min-h-0">
            <div className="h-full min-h-0 flex flex-col">
              {/* Make the transcript panel scrollable within the remaining space */}
              <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border-2 border-border">
                <Transcript
                  entries={displayEntries}
                  isRecording={isRecording}
                />
              </div>
            </div>
          </div>

          {/* Right: Risk Analysis and Speakers (1/3) */}
          <div className="w-1/3 h-full min-h-0 overflow-y-auto">
            <div className="h-full min-h-0 flex flex-col">
              {/* Risk Analysis Section - 2/3 height */}
              <div className="flex-grow h-3/5 mb-4">
                <div className="bg-surface rounded-lg shadow p-4 flex flex-col h-full border-2 border-border">
                  <h2 className="text-xl font-semibold mb-2 text-primary">Scam Analysis</h2>
                  <div className="flex items-center justify-center flex-1">
                    <RiskAnalysis 
                      defaultLevel={aggregatedScamLevel} 
                      defaultRationale={aggregatedRationale || "Analyzing conversation for potential scam indicators..."} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Speakers Identification Section - 1/3 height */}
              <div className="flex-grow h-2/5">
                <div className="bg-surface rounded-lg shadow flex flex-col h-full border-2 border-border">
                  <div className="flex-1">
                    <Speakers speakers={speakers} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
