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

-- メッセージが更新されたときに会話のupdated_atを更新するトリガー関数
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- 関連する会話のupdated_atを現在時刻に更新
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 削除トリガー用の関数（OLDレコードを参照する必要があるため別関数）
CREATE OR REPLACE FUNCTION update_conversation_updated_at_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- 関連する会話のupdated_atを現在時刻に更新
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = OLD.conversation_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;