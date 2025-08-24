
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SubmissionForm from '@/components/SubmissionForm';
import LivestreamList from '@/components/LivestreamList';
import AdminPanel from '@/components/AdminPanel';
import { Livestream } from '@/types/livestream';
import { useLivestreams } from "@/hooks/useLivestreams";
import AdminLoginButton from '@/components/AdminLoginButton';
import StreamOfTheHour from '@/components/StreamOfTheHour';
import FeaturedStream from '@/components/FeaturedStream';

const Index: React.FC = () => {
  const {
    livestreams,
    featuredStream,
    heroStream,
    approvedStreams,
    regularStreams,
    handleSubmit,
    handlePin,
    handleApprove,
    handleReject,
    handleSetHero,
  } = useLivestreams();

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // Simple admin login check - in a real app, use proper authentication
  const checkAdminPassword = () => {
    // Simple hard-coded password for demo purposes
    if (adminPassword === 'Iloveaudrey061788!$') {
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

  // Admin password is now 'Iloveaudrey061788!$'.

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Header />
        {!isAdmin && (
          <AdminLoginButton
            onLogin={(password: string) => {
              setAdminPassword(password);
              checkAdminPassword();
            }}
          />
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

        <StreamOfTheHour stream={heroStream} />

        <div className="md:flex md:gap-6 mt-8">
          <div className="md:w-1/3">
            <SubmissionForm onSubmit={handleSubmit} />
          </div>
          <div className="md:w-2/3">
            <FeaturedStream stream={featuredStream} />
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
