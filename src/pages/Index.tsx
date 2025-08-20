
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SubmissionForm from '@/components/SubmissionForm';
import LivestreamList from '@/components/LivestreamList';
import AdminPanel from '@/components/AdminPanel';
import UserDashboard from '@/components/UserDashboard';
import { Livestream } from '@/types/livestream';
import { useSupabaseLivestreams } from "@/hooks/useSupabaseLivestreams";
import StreamOfTheHour from '@/components/StreamOfTheHour';
import FeaturedStream from '@/components/FeaturedStream';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const Index: React.FC = () => {
  const {
    livestreams,
    loading,
    featuredStream,
    heroStream,
    approvedStreams,
    regularStreams,
    handleSubmit,
    handlePin,
    handleApprove,
    handleReject,
    handleSetHero,
  } = useSupabaseLivestreams();

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [showUserDashboard, setShowUserDashboard] = useState(false);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setShowUserDashboard(false);
      }
    });

    // Check if admin is already logged in
    const adminLoggedIn = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminLoggedIn);

    return () => subscription.unsubscribe();
  }, []);

  // Simple admin login check - in a real app, use proper authentication
  const checkAdminPassword = (password: string) => {
    setAdminPassword(password);
    // Simple hard-coded password for demo purposes
    if (password === 'admin123') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
    } else {
      setIsAdmin(false);
      localStorage.removeItem('isAdmin');
      alert('Incorrect password');
    }
  };

  // Check if Supabase is configured
  const supabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-white text-black font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">SUPABASE INTEGRATION REQUIRED</div>
          <p className="text-sm">Please connect to Supabase using the green button in the top right to enable authentication and data storage.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black font-mono flex items-center justify-center">
        <div className="text-2xl">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Header onAdminLogin={checkAdminPassword} isAdmin={isAdmin} />
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

        {user && !isAdmin && (
          <div className="mb-6 text-center">
            <button
              onClick={() => setShowUserDashboard(!showUserDashboard)}
              className="font-mono bg-black text-white px-4 py-2 hover:bg-gray-800"
            >
              {showUserDashboard ? 'HIDE' : 'MANAGE'} YOUR SUBMISSIONS
            </button>
          </div>
        )}

        {showUserDashboard && user && <UserDashboard user={user} />}

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
