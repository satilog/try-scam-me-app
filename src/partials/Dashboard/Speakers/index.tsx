import React from 'react';

export interface Speaker {
  id: string;
  name: string;
  role?: string;
  speakerType: 'you' | 'safe' | 'neutral' | 'scammer';
}

interface SpeakersProps {
  speakers: Speaker[];
}

const Speakers: React.FC<SpeakersProps> = ({ speakers }) => {
  // Create a placeholder speaker component
  const PlaceholderSpeaker = () => (
    <div className="p-3 rounded-lg border border-neutral-bg bg-neutral-bg">
      <div className="flex items-center justify-between">
        <div className="font-medium text-neutral opacity-60">Unknown Speaker</div>
        <div className="text-xs px-2 py-1 rounded-full bg-neutral-bg text-white">
          Unknown
        </div>
      </div>
      <div className="text-sm text-neutral opacity-75 italic mt-1">
        Unknown role
      </div>
    </div>
  );

  // Determine how many placeholders to show (always show 2 total speakers)
  const speakersToShow = speakers.slice(0, 2);
  const placeholdersNeeded = Math.max(0, 2 - speakersToShow.length);
  
  return (
    <div className="bg-surface rounded-lg shadow p-4 flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4 text-primary">Speakers</h2>
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-3">
          {/* Show actual speakers first */}
          {speakersToShow.map((speaker) => {
            // Determine colors based on speaker type
            let borderColor, bgColor, badgeColor, badgeText;
            
            switch (speaker.speakerType) {
              case 'you':
                borderColor = 'border-user';
                bgColor = 'bg-user-bg';
                badgeColor = 'bg-user text-white';
                badgeText = 'You';
                break;
              case 'safe':
                borderColor = 'border-success';
                bgColor = 'bg-success-bg';
                badgeColor = 'bg-success text-white';
                badgeText = 'Safe';
                break;
              case 'scammer':
                borderColor = 'border-danger';
                bgColor = 'bg-danger-bg';
                badgeColor = 'bg-danger text-white';
                badgeText = 'Scammer';
                break;
              default: // neutral
                borderColor = 'border-neutral';
                bgColor = 'bg-neutral-bg';
                badgeColor = 'bg-neutral text-white';
                badgeText = 'Unknown';
            }
            
            return (
              <div 
                key={speaker.id} 
                className={`p-3 rounded-lg border ${borderColor} ${bgColor}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-dark">{speaker.name}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}>
                    {badgeText}
                  </div>
                </div>
                {speaker.role && (
                  <div className="text-sm text-dark-85 opacity-75 italic mt-1">
                    {speaker.role === 'user' ? 'You' : speaker.role}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Add placeholder speakers to fill up to 2 total */}
          {Array.from({ length: placeholdersNeeded }).map((_, index) => (
            <PlaceholderSpeaker key={`placeholder-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Speakers;
