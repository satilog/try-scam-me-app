import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Pause, Plus, Trash2 } from 'lucide-react';
import { SafeCaller, safeCallersData } from '@/data/safeCallers';

const SafeList: React.FC = () => {
  // Filter out "You" from the safe list display (only show actual contacts)
  const [safeCallers, setSafeCallers] = useState<SafeCaller[]>(
    safeCallersData.filter(caller => !caller.isYou)
  );

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
            <h1 className="text-2xl font-bold text-primary">Contact List</h1>
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
