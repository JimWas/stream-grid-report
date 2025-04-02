
import React from 'react';
import { Livestream } from '@/types/livestream';
import { formatTimestamp } from '@/utils/validation';

interface HeroStreamProps {
  stream: Livestream | null;
}

const HeroStream: React.FC<HeroStreamProps> = ({ stream }) => {
  if (!stream) {
    return (
      <div className="my-6 p-4 border border-black text-center">
        <h2 className="text-xl font-bold font-mono uppercase">FEATURED STREAM</h2>
        <p className="font-mono my-4">No featured stream yet. Be the first to submit!</p>
      </div>
    );
  }

  return (
    <div className="my-6 p-4 border border-black">
      <h2 className="text-xl font-bold font-mono uppercase text-center mb-4">FEATURED STREAM</h2>
      <div className="text-center">
        <a 
          href={stream.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-2xl font-bold font-mono hover:underline block mb-2 uppercase"
        >
          {stream.title}
        </a>
        <div className="h-40 bg-gray-100 flex items-center justify-center mb-2 border border-black">
          <span className="font-mono">[ STREAM PREVIEW ]</span>
        </div>
        <p className="font-mono text-sm mt-2">
          {formatTimestamp(stream.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default HeroStream;
