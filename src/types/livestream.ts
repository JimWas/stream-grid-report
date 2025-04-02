
export interface Livestream {
  id: string;
  title: string;
  url: string;
  timestamp: Date;
  isPinned?: boolean;
  html?: string; // Optional HTML content for embedding
}
