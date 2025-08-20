import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Livestream } from "@/types/livestream";
import { toast } from "@/components/ui/use-toast";

export function useSupabaseLivestreams() {
  const [livestreams, setLivestreams] = useState<Livestream[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredStream, setFeaturedStream] = useState<Livestream | null>(null);
  const [heroStream, setHeroStream] = useState<Livestream | null>(null);

  useEffect(() => {
    loadLivestreams();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('livestreams_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'livestreams' },
        () => {
          loadLivestreams();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadLivestreams = async () => {
    try {
      const { data, error } = await supabase
        .from('livestreams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const streams = data?.map(stream => ({
        id: stream.id,
        title: stream.title,
        url: stream.url,
        timestamp: new Date(stream.created_at),
        isPinned: stream.is_pinned || false,
        html: stream.html,
        platform: stream.platform,
        channelHandle: stream.channel_handle,
        isApproved: stream.is_approved || false,
        isHero: stream.is_hero || false,
        userId: stream.user_id,
        userEmail: stream.user_email
      })) || [];
      
      setLivestreams(streams);
      
      // Update hero and featured streams
      const hero = streams.find(stream => stream.isHero);
      if (hero) {
        setHeroStream(hero);
      } else {
        const approvedStreams = streams.filter(s => s.isApproved);
        setHeroStream(approvedStreams.length > 0 ? approvedStreams[0] : null);
      }
      
      const pinned = streams.find(stream => stream.isPinned);
      if (pinned) {
        setFeaturedStream(pinned);
      } else {
        const approvedStreams = streams.filter(s => s.isApproved && s.id !== hero?.id);
        setFeaturedStream(approvedStreams.length > 0 ? approvedStreams[0] : null);
      }
      
    } catch (error: any) {
      toast({
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get approved and regular streams
  const approvedStreams = livestreams.filter(s => s.isApproved);
  const regularStreams = approvedStreams.filter(s => s.id !== heroStream?.id && s.id !== featuredStream?.id);

  const handleSubmit = (newStream: Omit<Livestream, 'id' | 'timestamp'>) => {
    // This is handled by the SubmissionForm component directly with Supabase
    // Keeping for backward compatibility
    loadLivestreams();
  };

  const handlePin = async (id: string) => {
    try {
      // First, unpin all streams
      await supabase
        .from('livestreams')
        .update({ is_pinned: false })
        .neq('id', id);

      // Then toggle the current stream
      const stream = livestreams.find(s => s.id === id);
      await supabase
        .from('livestreams')
        .update({ is_pinned: !stream?.isPinned })
        .eq('id', id);

      loadLivestreams();
    } catch (error: any) {
      toast({
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await supabase
        .from('livestreams')
        .update({ is_approved: true })
        .eq('id', id);

      loadLivestreams();
    } catch (error: any) {
      toast({
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await supabase
        .from('livestreams')
        .delete()
        .eq('id', id);

      loadLivestreams();
    } catch (error: any) {
      toast({
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSetHero = async (id: string) => {
    try {
      // First, remove hero status from all streams
      await supabase
        .from('livestreams')
        .update({ is_hero: false })
        .neq('id', id);

      // Then set the current stream as hero
      await supabase
        .from('livestreams')
        .update({ is_hero: true })
        .eq('id', id);

      loadLivestreams();
    } catch (error: any) {
      toast({
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
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
    loadLivestreams
  };
}
