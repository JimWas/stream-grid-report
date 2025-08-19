
export interface Livestream {
  id: string;
  title: string;
  url: string;
  timestamp: Date;
  isPinned?: boolean;
  html?: string; // Optional HTML content for embedding
  platform?: 'twitch' | 'youtube' | 'kick' | 'rumble' | 'x'; // Platform type
  channelHandle?: string; // Username/channel ID
  isApproved?: boolean; // For moderation
  isHero?: boolean; // For stream of the hour
  userId?: string; // User who submitted the stream
  userEmail?: string; // User email for display purposes
}
