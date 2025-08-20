
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { isValidUrl } from '@/utils/validation';
import { toast } from '@/components/ui/use-toast';
import { Livestream } from '@/types/livestream';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface SubmissionFormProps {
  onSubmit: (livestream: Omit<Livestream, 'id' | 'timestamp'>) => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [html, setHtml] = useState('');
  const [platform, setPlatform] = useState<'none' | 'twitch' | 'youtube' | 'kick' | 'rumble' | 'x'>('none');
  const [channelHandle, setChannelHandle] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const generateEmbedCode = () => {
    if (platform === 'twitch' && channelHandle) {
      return `<iframe src="https://player.twitch.tv/?channel=${channelHandle}&parent=${window.location.hostname}" frameborder="0" allowfullscreen="true" scrolling="no" height="100%" width="100%"></iframe>`;
    } else if (platform === 'youtube' && channelHandle) {
      return `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${channelHandle}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else if (platform === 'kick' && channelHandle) {
      return `<iframe src="https://player.kick.com/${channelHandle}" frameborder="0" allowfullscreen="true" scrolling="no" height="100%" width="100%"></iframe>`;
    } else if (platform === 'rumble' && channelHandle) {
      return `<iframe src="https://rumble.com/embed/${channelHandle}/" frameborder="0" allowfullscreen="true" scrolling="no" height="100%" width="100%"></iframe>`;
    } else if (platform === 'x' && channelHandle) {
      return `<iframe src="https://x.com/i/broadcasts/${channelHandle}" frameborder="0" allowfullscreen="true" scrolling="no" height="100%" width="100%"></iframe>`;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        description: "Please sign in to submit a livestream.",
        variant: "destructive"
      });
      return;
    }

    if (!title.trim()) {
      toast({
        description: "Please enter a title for the livestream.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidUrl(url)) {
      toast({
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate embed code if platform is selected
      const generatedHtml = platform !== 'none' ? generateEmbedCode() : html;

      const { error } = await supabase
        .from('livestreams')
        .insert({
          title: title.trim(),
          url,
          html: generatedHtml,
          platform: platform !== 'none' ? platform : null,
          channel_handle: channelHandle || null,
          user_id: user.id,
          user_email: user.email,
          is_approved: false, // Require admin approval
          is_hero: false,
          is_pinned: false
        });

      if (error) throw error;

      // Also call the legacy onSubmit for backward compatibility
      onSubmit({ 
        title, 
        url, 
        html: generatedHtml, 
        platform: platform !== 'none' ? platform : undefined,
        channelHandle: channelHandle || undefined,
        isApproved: false,
        isHero: false,
        userId: user.id,
        userEmail: user.email
      });
      
      setTitle('');
      setUrl('');
      setHtml('');
      setPlatform('none');
      setChannelHandle('');
      
      toast({
        description: "Livestream submitted for approval!",
      });
    } catch (error: any) {
      toast({
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-6 p-4 border border-black">
        <div className="text-center font-mono">LOADING...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-6 p-4 border border-black">
        <h2 className="text-xl font-bold font-mono uppercase mb-4 text-center">SUBMIT A LIVESTREAM</h2>
        <p className="text-center font-mono text-gray-600 mb-4">
          Please sign in to submit a livestream.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-6 p-4 border border-black">
      <h2 className="text-xl font-bold font-mono uppercase mb-4 text-center">SUBMIT A LIVESTREAM</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1 font-mono">TITLE:</label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-black font-mono"
            placeholder="Enter livestream title"
          />
        </div>
        <div>
          <label htmlFor="url" className="block mb-1 font-mono">URL:</label>
          <Input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border-black font-mono"
            placeholder="https://example.com/stream"
          />
        </div>
        
        <div>
          <label htmlFor="platform" className="block mb-1 font-mono">PLATFORM:</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Button 
              type="button" 
              onClick={() => setPlatform('none')}
              className={`font-mono ${platform === 'none' ? 'bg-black text-white' : 'bg-white text-black border border-black'}`}
            >
              NONE
            </Button>
            <Button 
              type="button" 
              onClick={() => setPlatform('twitch')}
              className={`font-mono ${platform === 'twitch' ? 'bg-black text-white' : 'bg-white text-black border border-black'}`}
            >
              TWITCH
            </Button>
            <Button 
              type="button" 
              onClick={() => setPlatform('youtube')}
              className={`font-mono ${platform === 'youtube' ? 'bg-black text-white' : 'bg-white text-black border border-black'}`}
            >
              YOUTUBE
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              type="button" 
              onClick={() => setPlatform('kick')}
              className={`font-mono ${platform === 'kick' ? 'bg-black text-white' : 'bg-white text-black border border-black'}`}
            >
              KICK
            </Button>
            <Button 
              type="button" 
              onClick={() => setPlatform('rumble')}
              className={`font-mono ${platform === 'rumble' ? 'bg-black text-white' : 'bg-white text-black border border-black'}`}
            >
              RUMBLE
            </Button>
            <Button 
              type="button" 
              onClick={() => setPlatform('x')}
              className={`font-mono ${platform === 'x' ? 'bg-black text-white' : 'bg-white text-black border border-black'}`}
            >
              X
            </Button>
          </div>
        </div>
        
        {platform !== 'none' && (
          <div>
            <label htmlFor="channelHandle" className="block mb-1 font-mono">
              {platform === 'twitch' && 'TWITCH USERNAME:'}
              {platform === 'youtube' && 'YOUTUBE VIDEO ID:'}
              {platform === 'kick' && 'KICK USERNAME:'}
              {platform === 'rumble' && 'RUMBLE VIDEO ID:'}
              {platform === 'x' && 'X BROADCAST ID:'}
            </label>
            <Input
              id="channelHandle"
              type="text"
              value={channelHandle}
              onChange={(e) => setChannelHandle(e.target.value)}
              className="w-full border-black font-mono"
              placeholder={
                platform === 'twitch' ? 'e.g. twitchuser' :
                platform === 'youtube' ? 'e.g. dQw4w9WgXcQ' :
                platform === 'kick' ? 'e.g. kickuser' :
                platform === 'rumble' ? 'e.g. v123456' :
                platform === 'x' ? 'e.g. 1234567890' : ''
              }
            />
            <p className="text-xs mt-1 text-gray-600 font-mono">
              {platform === 'twitch' && 'Enter your Twitch username only, not the full URL'}
              {platform === 'youtube' && 'Enter the YouTube video ID (found in the URL after v=)'}
              {platform === 'kick' && 'Enter your Kick username only, not the full URL'}
              {platform === 'rumble' && 'Enter the Rumble video ID (found in the URL after v)'}
              {platform === 'x' && 'Enter the X broadcast ID from the live stream URL'}
            </p>
          </div>
        )}
        
        {platform === 'none' && (
          <div>
            <label htmlFor="html" className="block mb-1 font-mono">EMBED HTML: <span className="text-xs">(Optional)</span></label>
            <Textarea
              id="html"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="w-full border-black font-mono h-24"
              placeholder="<iframe src='https://example.com/embed' width='100%' height='100%' frameborder='0'></iframe>"
            />
            <p className="text-xs mt-1 text-gray-600 font-mono">
              Paste iframe or embed code to display on the stream preview.
            </p>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-black text-white hover:bg-gray-800 font-mono uppercase"
        >
          SUBMIT
        </Button>
      </form>
    </div>
  );
};

export default SubmissionForm;
