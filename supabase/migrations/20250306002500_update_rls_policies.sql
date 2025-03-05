-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own user data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own user data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

-- Recreate policies with TO authenticated clause
-- Policy to allow authenticated users to insert their own user data
CREATE POLICY "Users can insert their own user data" 
  ON public.users 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy to allow authenticated users to update their own user data
CREATE POLICY "Users can update their own user data" 
  ON public.users 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id);

-- Policy to allow authenticated users to insert their own posts
CREATE POLICY "Users can insert their own posts" 
  ON public.posts 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow authenticated users to update their own posts
CREATE POLICY "Users can update their own posts" 
  ON public.posts 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow authenticated users to delete their own posts
CREATE POLICY "Users can delete their own posts" 
  ON public.posts 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);