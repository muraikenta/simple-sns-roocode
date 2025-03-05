-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy to allow users to read all posts
CREATE POLICY "Anyone can read posts" 
  ON public.posts 
  FOR SELECT 
  USING (true);

-- Policy to allow users to insert their own posts
CREATE POLICY "Users can insert their own posts" 
  ON public.posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own posts
CREATE POLICY "Users can update their own posts" 
  ON public.posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own posts
CREATE POLICY "Users can delete their own posts" 
  ON public.posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at column
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();