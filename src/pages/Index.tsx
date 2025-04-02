
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SubmissionForm from '@/components/SubmissionForm';
import LivestreamList from '@/components/LivestreamList';
import HeroStream from '@/components/HeroStream';
import AdminPanel from '@/components/AdminPanel';
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
  const [heroStream, setHeroStream] = useState<Livestream | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  // Simple admin login check - in a real app, use proper authentication
  const checkAdminPassword = () => {
    // Simple hard-coded password for demo purposes
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
    } else {
      setIsAdmin(false);
      localStorage.removeItem('isAdmin');
      alert('Incorrect password');
    }
  };

  useEffect(() => {
    // Check if admin is already logged in
    const adminLoggedIn = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminLoggedIn);
  }, []);

  useEffect(() => {
    // Save livestreams to localStorage whenever they change
    localStorage.setItem('livestreams', JSON.stringify(livestreams));
    
    // Update featured and hero streams whenever livestreams change
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
      // If no pinned stream and we have approved streams, feature the most recent approved one that isn't the hero
      const approvedStreams = livestreams.filter(s => s.isApproved && s.id !== heroStream?.id);
      if (approvedStreams.length > 0) {
        setFeaturedStream(approvedStreams[0]);
      }
    } else if (livestreams.length === 0) {
      setFeaturedStream(null);
    }
  }, [livestreams]);

  const handleSubmit = (newStream: Omit<Livestream, 'id' | 'timestamp'>) => {
    const stream: Livestream = {
      ...newStream,
      id: uuidv4(),
      timestamp: new Date(),
      isPinned: false,
      isApproved: isAdmin ? true : false // Auto-approve if submitted by admin
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

  // Get approved streams for public display
  const approvedStreams = livestreams.filter(s => s.isApproved);
  
  // Exclude hero stream from regular list
  const regularStreams = approvedStreams.filter(s => s.id !== heroStream?.id && s.id !== featuredStream?.id);

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Header />
        
        {!isAdmin && (
          <div className="text-right mb-4">
            <button 
              onClick={() => {
                const password = prompt('Enter admin password:');
                if (password) {
                  setAdminPassword(password);
                  checkAdminPassword();
                }
              }}
              className="text-xs font-mono underline"
            >
              ADMIN LOGIN
            </button>
          </div>
        )}
        
        {isAdmin && (
          <div className="mb-8">
            <AdminPanel 
              streams={livestreams} 
              onApprove={handleApprove} 
              onReject={handleReject} 
              onSetHero={handleSetHero}
              onPin={handlePin}
              onLogout={() => {
                setIsAdmin(false);
                localStorage.removeItem('isAdmin');
              }}
            />
          </div>
        )}
        
        {heroStream && (
          <div className="my-8 p-4 border-2 border-black">
            <h2 className="text-2xl font-bold font-mono uppercase text-center mb-4">STREAM OF THE HOUR</h2>
            <HeroStream stream={heroStream} />
          </div>
        )}
        
        <div className="md:flex md:gap-6 mt-8">
          <div className="md:w-1/3">
            <SubmissionForm onSubmit={handleSubmit} />
          </div>
          
          <div className="md:w-2/3">
            {featuredStream && <HeroStream stream={featuredStream} />}
          </div>
        </div>
        
        <LivestreamList 
          streams={regularStreams} 
          onPin={isAdmin ? handlePin : undefined} 
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
