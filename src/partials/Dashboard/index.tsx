"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Transcript from "./Transcript";

interface TranscriptEntry {
  timestamp: string; // Format: mm:ss
  speaker: string;
  message: string;
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

const Dashboard = ({
  transcription,
  transcriptEntries = [],
}: DashboardProps) => {
  // State for real-time transcript entries
  const [liveTranscriptEntries, setLiveTranscriptEntries] = useState<TranscriptEntry[]>([]);
  
  // Sample transcript entries for demonstration
  const sampleEntries: TranscriptEntry[] = [
    {
      timestamp: "00:05",
      speaker: "Agent",
      message: "Hello, how can I help you today?",
    },
    {
      timestamp: "00:12",
      speaker: "Caller",
      message: "Hi, I received a call about my car's extended warranty.",
    },
    {
      timestamp: "00:18",
      speaker: "Agent",
      message: "I see. Can you tell me more about what they said?",
    },
  ];

  // Handle new transcript entries from the AudioVisualizer
  const handleTranscriptUpdate = useCallback((entry: TranscriptEntry) => {
    setLiveTranscriptEntries(prev => [...prev, entry]);
  }, []);

  // Use live entries if available, otherwise use provided entries or sample entries
  const displayEntries = liveTranscriptEntries.length > 0 
    ? liveTranscriptEntries 
    : (transcriptEntries && transcriptEntries.length > 0 ? transcriptEntries : sampleEntries);

  return (
    <div className="flex flex-col justify-start h-full space-y-4">
      {/* First Row - Transcript */}

      {/* Second Row - Audio Visualizer */}
      <div className="flex-1">
        <AudioVisualizer onTranscriptUpdate={handleTranscriptUpdate} />
      </div>

      {/* Third Row - Two Column Layout */}
      <div className="flex-1 flex">
        {/* First Column - Transcription (4/5 width) */}
        <div className="flex-1 w-2/3 pr-4">
          <div className="flex-1">
            <Transcript entries={displayEntries} />
          </div>
        </div>

        {/* Second Column - Placeholder (1/5 width) */}
        <div className="w-1/3">
          {/* Add your content for the right column here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
