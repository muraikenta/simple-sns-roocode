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