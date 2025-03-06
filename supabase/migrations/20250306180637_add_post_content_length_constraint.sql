-- Add character limit constraint to posts.content
ALTER TABLE public.posts 
  ADD CONSTRAINT posts_content_length_check 
  CHECK (length(content) <= 140);