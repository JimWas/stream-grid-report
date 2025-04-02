
import React from 'react';
import { Livestream } from '@/types/livestream';
import { formatTimestamp } from '@/utils/validation';

interface LivestreamListProps {
  streams: Livestream[];
  onPin: (id: string) => void;
}

const LivestreamList: React.FC<LivestreamListProps> = ({ streams, onPin }) => {
  if (streams.length === 0) {
    return (
      <div className="text-center my-8">
        <p className="font-mono">No livestreams added yet.</p>
      </div>
    );
  }

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold font-mono uppercase text-center mb-4 border-b-2 border-black pb-2">
        LATEST STREAMS
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {streams.map((stream) => (
          <div key={stream.id} className="p-2 border-b border-gray-300 relative">
            <a 
              href={stream.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-mono font-bold hover:underline block uppercase"
            >
              {stream.title}
            </a>
            <div className="flex justify-between items-center mt-1">
              <span className="font-mono text-xs">
                {formatTimestamp(stream.timestamp)}
              </span>
              <button 
                onClick={() => onPin(stream.id)} 
                className="font-mono text-xs underline"
                title={stream.isPinned ? "Unpin from featured" : "Pin as featured"}
              >
                {stream.isPinned ? "UNPIN" : "PIN"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LivestreamList;
