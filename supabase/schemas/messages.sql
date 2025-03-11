-- Schema for messages related tables
CREATE TABLE (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);

-- Add updated_at trigger for conversations table
CREATE TRIGGER update_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- メッセージが挿入されたときに会話のupdated_atを更新するトリガー
CREATE TRIGGER update_conversation_on_message_insert
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_updated_at();

-- メッセージが更新されたときに会話のupdated_atを更新するトリガー
CREATE TRIGGER update_conversation_on_message_update
AFTER UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_updated_at();

-- メッセージが削除されたときに会話のupdated_atを更新するトリガー
CREATE TRIGGER update_conversation_on_message_delete
AFTER DELETE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_updated_at_on_delete();

-- 全てのテーブルのRLSを有効化（API経由でのみアクセス可能）
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 注意: RLSポリシーが設定されていないため、これらのテーブルには直接アクセスできません。
-- すべてのアクセスはAPI（Edge Functions）経由で行う必要があります。