import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Pause, Plus, Trash2 } from 'lucide-react';

interface SafeCaller {
  id: string;
  name: string;
  imageUrl: string;
  audioUrl: string;
  dateAdded: string;
}

const SafeList: React.FC = () => {
  // Sample data - in a real app, this would come from an API or database
  const [safeCallers, setSafeCallers] = useState<SafeCaller[]>([
    {
      id: '1',
      name: 'Sathyajit Loganathan',
      imageUrl: 'https://media.licdn.com/dms/image/v2/D5603AQEPNfAKkRkbHg/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1664529744668?e=2147483647&v=beta&t=7TGjBa44VEDkzhxAjrm1x94QU9UaowN15YTBqorwQ1c',
      audioUrl: '/audio/jane-sample.mp3',
      dateAdded: '2025-07-15',
    },
    {
      id: '2',
      name: 'Kapeesh Kaul',
      imageUrl: 'https://media.licdn.com/dms/image/v2/D5603AQFd9MBml-FexQ/profile-displayphoto-shrink_200_200/B56Zb08lIBG4AY-/0/1747866243931?e=2147483647&v=beta&t=87j0NSVdBCTzZe_j8WqB6FLv-apck0hTRA-VGJhK0wE',
      audioUrl: '/audio/john-sample.mp3',
      dateAdded: '2025-07-28',
    },
    {
      id: '3',
      name: 'Neil Jerome Tauro',
      imageUrl: 'https://media.licdn.com/dms/image/v2/D5603AQGyHbt9e2ZMtw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1724951605858?e=2147483647&v=beta&t=x93qgSXDimQQDtWPpAIXdpW9SNec9-ZrNXH-u_0rPB4',
      audioUrl: '/audio/sarah-sample.mp3',
      dateAdded: '2025-08-02',
    },
  ]);

  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  const handleDelete = (id: string) => {
    setSafeCallers(safeCallers.filter(caller => caller.id !== id));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="bg-surface rounded-lg shadow-lg p-6 border-2 border-border">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">Safe Caller List</h1>
            <p className="text-dark-85 mt-1">
              Manage your trusted contacts. These callers will be automatically recognized as safe during calls.
            </p>
          </div>
          <button 
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => alert('Add new caller functionality would go here')}
          >
            <Plus size={16} />
            <span>Add New</span>
          </button>
        </div>

        {safeCallers.length === 0 ? (
          <div className="text-center py-12 bg-elevation rounded-lg">
            <p className="text-dark-85">No safe callers added yet.</p>
            <p className="text-dark-85 text-sm mt-2 opacity-75">Add trusted contacts to your safe list to help identify them during calls.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {safeCallers.map((caller) => (
              <div key={caller.id} className="flex items-center p-4 border border-border rounded-lg hover:bg-elevation transition-colors">
                {/* Profile Image */}
                <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-accent">
                  <Image 
                    src={caller.imageUrl} 
                    alt={`${caller.name}'s profile`} 
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                    onError={(e) => {
                      // Fallback for missing images
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/default-avatar.jpg';
                    }}
                  />
                </div>

                {/* Caller Info */}
                <div className="ml-4 flex-1">
                  <h3 className="font-medium text-lg">{caller.name}</h3>
                  <p className="text-dark-85 text-sm opacity-75">Added on {new Date(caller.dateAdded).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</p>
                </div>

                {/* Audio Player */}
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handlePlay(caller.id)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${playingId === caller.id ? 'bg-accent-10 text-accent' : 'bg-elevation hover:bg-border text-dark-85'}`}
                    aria-label={playingId === caller.id ? 'Pause voice sample' : 'Play voice sample'}
                  >
                    {playingId === caller.id ? <Pause size={18} /> : <Play size={18} />}
                  </button>

                  <button 
                    onClick={() => handleDelete(caller.id)}
                    className="h-10 w-10 rounded-full flex items-center justify-center bg-elevation hover:bg-red-100 text-dark-85 hover:text-red-500 transition-colors"
                    aria-label="Remove from safe list"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Hidden audio element */}
                {playingId === caller.id && (
                  <audio 
                    src={caller.audioUrl} 
                    autoPlay 
                    onEnded={() => setPlayingId(null)}
                    className="hidden"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SafeList;
