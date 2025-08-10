"use client";

import React from 'react';
import { AlertTriangle, Siren } from 'lucide-react';

interface Highlight {
  text: string;
  type: 'yellow' | 'red';
  startIndex: number;
}

interface ScamReport {
  scamLevel: 'neutral' | 'safe' | 'cautious' | 'alert';
  probability: number;
}

interface TranscriptEntry {
  timestamp: string; // Format: mm:ss
  speaker: string;
  message: string;
  highlights?: Highlight[];
  scamReport?: ScamReport;
}

interface TranscriptProps {
  entries?: TranscriptEntry[];
  isRecording?: boolean;
}

const Transcript = ({ entries = [], isRecording = false }: TranscriptProps) => {
  // Reference to the scrollable container
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Effect to scroll to the top when new entries are added
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [entries]);
  // Function to render message with highlighted phrases
  const renderHighlightedMessage = (message: string, highlights: Highlight[]) => {
    // Sort highlights by startIndex to process them in order
    const sortedHighlights = [...highlights].sort((a, b) => a.startIndex - b.startIndex);
    
    // Check for invalid highlights and return plain message if found
    const isInvalidHighlight = sortedHighlights.some(
      h => h.startIndex < 0 || h.startIndex + h.text.length > message.length
    );
    
    if (isInvalidHighlight) {
      console.error('Invalid highlight range detected');
      return message;
    }
    
    // Build message parts with highlights
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    
    sortedHighlights.forEach((highlight, index) => {
      // Add text before the highlight
      if (highlight.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {message.substring(lastIndex, highlight.startIndex)}
          </span>
        );
      }
      
      // Add the highlighted text
      const highlightClass = highlight.type === 'yellow' 
        ? 'bg-yellow-200 px-0.5 rounded' 
        : 'bg-red-200 text-red-800 px-0.5 rounded';
      
      parts.push(
        <span key={`highlight-${index}`} className={highlightClass}>
          {highlight.text}
        </span>
      );
      
      lastIndex = highlight.startIndex + highlight.text.length;
    });
    
    // Add any remaining text after the last highlight
    if (lastIndex < message.length) {
      parts.push(
        <span key="text-end">
          {message.substring(lastIndex)}
        </span>
      );
    }
    
    return <>{parts}</>;
  };
  return (
    <div className="bg-surface rounded-lg shadow p-4 px-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-2 text-primary">Transcript</h2>
      <div ref={scrollContainerRef} className="space-y-0 overflow-y-auto flex-1">
        {/* Loading indicator when microphone is active - now at the top */}
        {isRecording && (
          <div className="text-center py-4 mb-4">
            <div className="inline-flex items-center px-4 py-2 bg-accent-10 rounded-full">
              <div className="mr-3">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                </span>
              </div>
              <span className="text-accent text-sm italic">Transcribing...</span>
            </div>
          </div>
        )}
        
        {entries.length > 0 ? (
          entries.map((entry, index) => {
            // Check if this is a system/event message
            const isSystemEvent = entry.speaker === "System";
            
            if (isSystemEvent) {
              // Render system/event message (centered, light styling)
              return (
                <div key={index} className="text-center py-4 px-4">
                  {entry.timestamp && (
                    <span className="text-dark-85 opacity-60 text-xs mr-2">{entry.timestamp}</span>
                  )}
                  <span className="text-dark-85 opacity-75 text-sm italic bg-elevation py-1 px-3 rounded-full">
                    {entry.message}
                  </span>
                </div>
              );
            } else {
              // Render transcript item (left-aligned, with speaker)
              // Determine speaker styling based on speaker type
              let speakerClass = "font-medium mr-3 min-w-[80px]";
              let messageClass = "italic flex-1";
              
              if (entry.speaker === "Caller") {
                speakerClass += " text-accent";
                messageClass += " text-dark-85";
              } else if (entry.speaker === "Scam Alert" || entry.speaker === "AI Warning") {
                speakerClass += " text-red-600";
                messageClass += " text-red-600 font-medium";
              } else {
                speakerClass += " text-accent";
                messageClass += " text-dark-85";
              }
              
              // Determine background color based on risk level
              let backgroundClass = "";
              if (entry.scamReport) {
                switch (entry.scamReport.scamLevel) {
                  case 'cautious':
                    backgroundClass = "bg-warning-bg";
                    break;
                  case 'alert':
                    backgroundClass = "bg-danger-bg";
                    break;
                  default:
                    backgroundClass = "";
                }
              }

              return (
                <div key={index} className={`flex items-start border-b border-border py-3 px-6 last:border-0 rounded-lg p-2 ${backgroundClass}`}>
                  {entry.timestamp && (
                    <span className="text-dark-85 opacity-75 mr-3 min-w-[50px]">{entry.timestamp}</span>
                  )}
                  <span className={speakerClass}>{entry.speaker}:</span>
                  <p className={messageClass}>
                    {entry.highlights && entry.highlights.length > 0 ? (
                      renderHighlightedMessage(entry.message, entry.highlights)
                    ) : (
                      entry.message
                    )}
                  </p>
                  {/* Risk level icon */}
                  {entry.scamReport && (entry.scamReport.scamLevel === 'cautious' || entry.scamReport.scamLevel === 'alert') && (
                    <div className="ml-2 flex-shrink-0 mr-4">
                      {entry.scamReport.scamLevel === 'cautious' ? (
                        <AlertTriangle className="h-6 w-6 text-warning" strokeWidth={1.5} />
                      ) : ( 
                        <Siren className="h-6 w-6 text-danger" strokeWidth={1.5} />
                      )}
                    </div>
                  )}
                </div>
              );
            }
          })
        ) : (
          <div className="text-center py-6">
            <span className="text-dark-85 opacity-75 text-sm italic bg-elevation py-1 px-3 rounded-full">
              No speech detected. Start speaking after enabling the microphone.
            </span>
          </div>
        )}
        
        {/* Loading indicator moved to the top */}
      </div>
    </div>
  );
};

export default Transcript;