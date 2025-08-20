import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { Livestream } from '@/types/livestream';

interface UserDashboardProps {
  user: User;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [userStreams, setUserStreams] = useState<Livestream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStreams();
  }, [user]);

  const loadUserStreams = async () => {
    try {
      const { data, error } = await supabase
        .from('livestreams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const streams = data?.map(stream => ({
        ...stream,
        timestamp: new Date(stream.created_at)
      })) || [];
      
      setUserStreams(streams);
    } catch (error: any) {
      toast({
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStream = async (streamId: string) => {
    try {
      const { error } = await supabase
        .from('livestreams')
        .delete()
        .eq('id', streamId)
        .eq('user_id', user.id); // Ensure user can only delete their own streams

      if (error) throw error;
      
      setUserStreams(prev => prev.filter(stream => stream.id !== streamId));
      toast({
        description: "Stream deleted successfully!",
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
      <div className="max-w-4xl mx-auto my-6 p-4">
        <div className="font-mono text-center">LOADING YOUR STREAMS...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 p-4">
      <h2 className="text-2xl font-bold font-mono uppercase mb-6 text-center border-b-2 border-black pb-2">
        YOUR SUBMISSIONS
      </h2>
      
      {userStreams.length === 0 ? (
        <div className="text-center py-8">
          <p className="font-mono text-gray-600">No submissions yet. Submit your first livestream below!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {userStreams.map((stream) => (
            <Card key={stream.id} className="border-black">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="font-mono text-lg">{stream.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge 
                      variant={stream.isApproved ? "default" : "secondary"}
                      className="font-mono"
                    >
                      {stream.isApproved ? "APPROVED" : "PENDING"}
                    </Badge>
                    {stream.isHero && (
                      <Badge variant="outline" className="font-mono border-black">
                        HERO
                      </Badge>
                    )}
                    {stream.isPinned && (
                      <Badge variant="outline" className="font-mono border-black">
                        FEATURED
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-mono text-sm">
                    <strong>URL:</strong> <a href={stream.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{stream.url}</a>
                  </p>
                  {stream.platform && (
                    <p className="font-mono text-sm">
                      <strong>PLATFORM:</strong> {stream.platform.toUpperCase()}
                    </p>
                  )}
                  {stream.channelHandle && (
                    <p className="font-mono text-sm">
                      <strong>HANDLE:</strong> {stream.channelHandle}
                    </p>
                  )}
                  <p className="font-mono text-sm text-gray-600">
                    Submitted: {stream.timestamp.toLocaleDateString()} at {stream.timestamp.toLocaleTimeString()}
                  </p>
                  <div className="pt-2">
                    <Button 
                      onClick={() => handleDeleteStream(stream.id)}
                      variant="destructive"
                      className="font-mono"
                      size="sm"
                    >
                      DELETE
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;