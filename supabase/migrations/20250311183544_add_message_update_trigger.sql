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

-- メッセージが挿入されたときに会話のupdated_atを更新するトリガー
DROP TRIGGER IF EXISTS update_conversation_on_message_insert ON public.messages;
CREATE TRIGGER update_conversation_on_message_insert
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_updated_at();

-- メッセージが更新されたときに会話のupdated_atを更新するトリガー
DROP TRIGGER IF EXISTS update_conversation_on_message_update ON public.messages;
CREATE TRIGGER update_conversation_on_message_update
AFTER UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_updated_at();

-- メッセージが削除されたときに会話のupdated_atを更新するトリガー
DROP TRIGGER IF EXISTS update_conversation_on_message_delete ON public.messages;
CREATE TRIGGER update_conversation_on_message_delete
AFTER DELETE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_updated_at_on_delete(); 