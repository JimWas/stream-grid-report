
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SubmissionForm from '@/components/SubmissionForm';
import LivestreamList from '@/components/LivestreamList';
import HeroStream from '@/components/HeroStream';
import { Livestream } from '@/types/livestream';
import { v4 as uuidv4 } from 'uuid';

const Index: React.FC = () => {
  const [livestreams, setLivestreams] = useState<Livestream[]>(() => {
    const saved = localStorage.getItem('livestreams');
    if (saved) {
      try {
        // Convert timestamp strings back to Date objects
        const parsed = JSON.parse(saved);
        return parsed.map((stream: any) => ({
          ...stream,
          timestamp: new Date(stream.timestamp)
        }));
      } catch (err) {
        console.error('Failed to parse saved livestreams', err);
        return [];
      }
    }
    return [];
  });

  const [featuredStream, setFeaturedStream] = useState<Livestream | null>(null);

  useEffect(() => {
    // Save livestreams to localStorage whenever they change
    localStorage.setItem('livestreams', JSON.stringify(livestreams));
    
    // Update featured stream whenever livestreams change
    const pinned = livestreams.find(stream => stream.isPinned);
    if (pinned) {
      setFeaturedStream(pinned);
    } else if (livestreams.length > 0 && !featuredStream) {
      // If no pinned stream and we have streams, feature the most recent
      setFeaturedStream(livestreams[0]);
    } else if (livestreams.length === 0) {
      setFeaturedStream(null);
    }
  }, [livestreams]);

  const handleSubmit = (newStream: Omit<Livestream, 'id' | 'timestamp'>) => {
    const stream: Livestream = {
      ...newStream,
      id: uuidv4(),
      timestamp: new Date(),
      isPinned: false
    };
    
    setLivestreams(prev => [stream, ...prev]);
  };

  const handlePin = (id: string) => {
    setLivestreams(prev => 
      prev.map(stream => ({
        ...stream,
        isPinned: stream.id === id ? !stream.isPinned : false
      }))
    );
  };

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Header />
        
        <div className="md:flex md:gap-6 mt-8">
          <div className="md:w-1/3">
            <SubmissionForm onSubmit={handleSubmit} />
          </div>
          
          <div className="md:w-2/3">
            <HeroStream stream={featuredStream} />
          </div>
        </div>
        
        <LivestreamList 
          streams={livestreams.filter(s => s.id !== featuredStream?.id)} 
          onPin={handlePin} 
        />
        
        <footer className="mt-8 pt-4 border-t border-black text-center">
          <p className="font-mono text-xs">
            &copy; {new Date().getFullYear()} LIVESTREAM REPORT - ALL RIGHTS RESERVED
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
