
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Livestream } from "@/types/livestream";

export function useLivestreams() {
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
  const [heroStream, setHeroStream] = useState<Livestream | null>(null);

  useEffect(() => {
    // Save livestreams to localStorage whenever they change
    localStorage.setItem('livestreams', JSON.stringify(livestreams));
    
    // Update hero and featured streams
    const hero = livestreams.find(stream => stream.isHero);
    if (hero) {
      setHeroStream(hero);
    } else if (livestreams.length > 0 && !heroStream) {
      // If no hero stream and we have approved streams, pick the most recent approved one
      const approvedStreams = livestreams.filter(s => s.isApproved);
      if (approvedStreams.length > 0) {
        setHeroStream(approvedStreams[0]);
      }
    } else if (livestreams.length === 0) {
      setHeroStream(null);
    }
    
    const pinned = livestreams.find(stream => stream.isPinned);
    if (pinned) {
      setFeaturedStream(pinned);
    } else if (livestreams.length > 0 && !featuredStream) {
      // If no pinned, feature recent approved that's not hero
      const approvedStreams = livestreams.filter(s => s.isApproved && s.id !== heroStream?.id);
      if (approvedStreams.length > 0) {
        setFeaturedStream(approvedStreams[0]);
      }
    } else if (livestreams.length === 0) {
      setFeaturedStream(null);
    }
    // eslint-disable-next-line
  }, [livestreams]);

  // Get approved and regular streams
  const approvedStreams = livestreams.filter(s => s.isApproved);
  const regularStreams = approvedStreams.filter(s => s.id !== heroStream?.id && s.id !== featuredStream?.id);

  const handleSubmit = (newStream: Omit<Livestream, 'id' | 'timestamp'>) => {
    const stream: Livestream = {
      ...newStream,
      id: uuidv4(),
      timestamp: new Date(),
      isPinned: false,
      isApproved: true // Auto-approve all submissions
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

  const handleApprove = (id: string) => {
    setLivestreams(prev =>
      prev.map(stream => ({
        ...stream,
        isApproved: stream.id === id ? true : stream.isApproved
      }))
    );
  };

  const handleReject = (id: string) => {
    setLivestreams(prev => prev.filter(stream => stream.id !== id));
  };

  const handleSetHero = (id: string) => {
    setLivestreams(prev =>
      prev.map(stream => ({
        ...stream,
        isHero: stream.id === id ? true : false
      }))
    );
  };

  return {
    livestreams,
    setLivestreams,
    featuredStream,
    heroStream,
    approvedStreams,
    regularStreams,
    handleSubmit,
    handlePin,
    handleApprove,
    handleReject,
    handleSetHero,
  };
}
