-- Create the livestreams table
CREATE TABLE IF NOT EXISTS public.livestreams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    html TEXT,
    platform TEXT CHECK (platform IN ('twitch', 'youtube', 'kick', 'rumble', 'x')),
    channel_handle TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    is_approved BOOLEAN DEFAULT false,
    is_hero BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own livestreams
CREATE POLICY "Users can insert their own livestreams" ON public.livestreams
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own livestreams
CREATE POLICY "Users can view their own livestreams" ON public.livestreams
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own livestreams
CREATE POLICY "Users can update their own livestreams" ON public.livestreams
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own livestreams
CREATE POLICY "Users can delete their own livestreams" ON public.livestreams
    FOR DELETE USING (auth.uid() = user_id);

-- Policy: Everyone can view approved livestreams
CREATE POLICY "Everyone can view approved livestreams" ON public.livestreams
    FOR SELECT USING (is_approved = true);

-- Grant necessary permissions
GRANT ALL ON public.livestreams TO authenticated;
GRANT SELECT ON public.livestreams TO anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_livestreams_user_id ON public.livestreams(user_id);
CREATE INDEX IF NOT EXISTS idx_livestreams_is_approved ON public.livestreams(is_approved);
CREATE INDEX IF NOT EXISTS idx_livestreams_is_hero ON public.livestreams(is_hero);
CREATE INDEX IF NOT EXISTS idx_livestreams_is_pinned ON public.livestreams(is_pinned);
CREATE INDEX IF NOT EXISTS idx_livestreams_created_at ON public.livestreams(created_at DESC);