"use client";

interface TranscriptEntry {
  timestamp: string; // Format: mm:ss
  speaker: string;
  message: string;
}

interface TranscriptProps {
  entries?: TranscriptEntry[];
}

const Transcript = ({ entries = [] }: TranscriptProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Transcript</h2>
      <div className="space-y-4">
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <div key={index} className="flex items-start border-b border-gray-100 pb-3 mb-3 last:border-0">
              <span className="text-gray-500 mr-3 min-w-[50px]">{entry.timestamp}</span>
              <span className="font-medium text-blue-600 mr-3 min-w-[80px]">{entry.speaker}:</span>
              <p className="text-gray-700 flex-1">{entry.message}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No transcript available yet.</p>
        )}
      </div>
    </div>
  );
};

export default Transcript;