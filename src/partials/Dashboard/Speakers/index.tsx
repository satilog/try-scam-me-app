import React from 'react';

export interface Speaker {
  id: string;
  name: string;
  role?: string;
  scamRisk?: 'low' | 'medium' | 'high';
}

interface SpeakersProps {
  speakers: Speaker[];
}

const Speakers: React.FC<SpeakersProps> = ({ speakers }) => {
  // Create a placeholder speaker component
  const PlaceholderSpeaker = () => (
    <div className="p-3 rounded-lg border border-border bg-elevation">
      <div className="flex items-center justify-between">
        <div className="font-medium text-dark-85 opacity-60">Unknown Speaker</div>
        <div className="text-xs px-2 py-1 rounded-full bg-elevation text-dark-85 opacity-75">
          Unidentified
        </div>
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
          {speakersToShow.map((speaker) => (
            <div 
              key={speaker.id} 
              className={`p-3 rounded-lg border ${
                speaker.scamRisk === 'high' 
                  ? 'border-red-200 bg-red-50' 
                  : speaker.scamRisk === 'medium'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{speaker.name}</div>
                {speaker.scamRisk && speaker.scamRisk !== 'low' && (
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    speaker.scamRisk === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {speaker.scamRisk === 'high' ? 'High Risk' : 'Medium Risk'}
                  </div>
                )}
              </div>
              {speaker.role && (
                <div className="text-sm text-dark-85 opacity-75 italic mt-1">{speaker.role}</div>
              )}
            </div>
          ))}
          
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
