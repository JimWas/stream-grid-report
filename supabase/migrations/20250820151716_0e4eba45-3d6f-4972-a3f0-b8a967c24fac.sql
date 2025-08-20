-- Create the livestreams table
CREATE TABLE public.livestreams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  html TEXT,
  platform TEXT,
  channel_handle TEXT,
  user_id UUID,
  user_email TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_hero BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access to approved streams
CREATE POLICY "Anyone can view approved livestreams" 
ON public.livestreams 
FOR SELECT 
USING (is_approved = true);

-- Create policies for authenticated users to manage their own submissions
CREATE POLICY "Users can view their own livestreams" 
ON public.livestreams 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own livestreams" 
ON public.livestreams 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own livestreams" 
ON public.livestreams 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own livestreams" 
ON public.livestreams 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_livestreams_updated_at
  BEFORE UPDATE ON public.livestreams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();