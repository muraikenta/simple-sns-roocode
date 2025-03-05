-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Set up security policies for avatars bucket
-- Allow authenticated users to upload their own avatar
CREATE POLICY "認証済みユーザーのみアップロード可能" ON storage.objects
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own avatar
CREATE POLICY "認証済みユーザーは自分のファイルのみ更新可能" ON storage.objects
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own avatar
CREATE POLICY "認証済みユーザーは自分のファイルのみ削除可能" ON storage.objects
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow anyone to read avatars
CREATE POLICY "誰でも読み取り可能" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'avatars'
  );