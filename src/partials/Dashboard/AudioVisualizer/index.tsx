"use client";

import React from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";

interface AudioVisualizerProps {
  onMicrophoneToggle: () => void;
  isRecording: boolean;
}

const VoiceVisualizerMinimal: React.FC<AudioVisualizerProps> = ({ onMicrophoneToggle, isRecording }) => {
  // Create visualizer controls but override the start/stop functions
  const controls = useVoiceVisualizer({
    shouldHandleBeforeUnload: true,
    onStartRecording: () => {
      // Call parent's toggle function instead of handling audio here
      onMicrophoneToggle();
    },
    onStopRecording: () => {
      // Call parent's toggle function instead of handling audio here
      onMicrophoneToggle();
    },
  });

  // The visualizer will show the recording state based on the parent's isRecording prop
  // The actual audio recording is handled by the parent component

  return (
    <div className="w-full">
      <div className="bg-surface shadow rounded-lg border border-border">
        <VoiceVisualizer
          controls={controls}
          height={150}
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
