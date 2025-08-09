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

// Matches your app's styling tokens (bg-white, border-border, text-body, bg-accent, etc.)
const VoiceVisualizerMinimal: React.FC<AudioVisualizerProps> = ({ onTranscriptUpdate }) => {
  // State for speech recognition
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const recognitionRef = useRef<any>(null);
  
  const controls = useVoiceVisualizer({
    shouldHandleBeforeUnload: true,
    onStartRecording: () => {
      // Start speech recognition when recording starts via UI
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    },
    onStopRecording: () => {
      // Stop speech recognition when recording stops via UI
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  });
  const { startRecording, stopRecording, error } = controls;
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      // @ts-ignore - TypeScript doesn't know about the Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Set language to English for better recognition
      
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptText = result[0].transcript;
        const confidence = result[0].confidence;
        
        console.log(`Transcript: "${transcriptText}" (confidence: ${confidence})`);
        setTranscript(transcriptText);
        
        // If the result is final, add it to the transcript list
        if (result.isFinal && onTranscriptUpdate) {
          // Format timestamp as mm:ss
          const now = new Date();
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const seconds = now.getSeconds().toString().padStart(2, '0');
          const timestamp = `${minutes}:${seconds}`;
          
          onTranscriptUpdate({
            timestamp,
            speaker: "You", // Default speaker is the user
            message: transcriptText.trim()
          });
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        
        // Add error to transcript for visibility
        if (onTranscriptUpdate && event.error !== 'no-speech') {
          const now = new Date();
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const seconds = now.getSeconds().toString().padStart(2, '0');
          const timestamp = `${minutes}:${seconds}`;
          
          onTranscriptUpdate({
            timestamp,
            speaker: "System",
            message: `Speech recognition error: ${event.error}`
          });
        }
      };
      
      recognitionRef.current = recognition;
    }
  }, [onTranscriptUpdate]);
  
  // This function is no longer needed as we're using the built-in UI controls
  // and the onStartRecording/onStopRecording callbacks

  return (
    <div className="w-full flex flex-col">
      <div className="w-full">
        {/* Card */}
        <div className="bg-white shadow rounded-lg border border-border">
          {/* Visualizer */}
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
        
        {/* Microphone transcription is active when recording */}
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
