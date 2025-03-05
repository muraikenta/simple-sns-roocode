-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  username TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT
);

-- Enable RLS (Row Level Security) for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users
-- Policy to allow users to read all users
CREATE POLICY "Anyone can read users" 
  ON public.users 
  FOR SELECT 
  USING (true);

-- Policy to allow users to insert their own user data
CREATE POLICY "Users can insert their own user data" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy to allow users to update their own user data
CREATE POLICY "Users can update their own user data" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create trigger to update updated_at column for users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically create a user record when a new auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS (Row Level Security) for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
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

-- Create trigger to update updated_at column for posts
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();