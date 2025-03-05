import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useErrorDialog } from "@/contexts/ErrorDialogContext";
import { useAlertDialog } from "@/contexts/AlertDialogContext";
import { supabase } from "@/lib/supabase";

interface DeletePostButtonProps {
  postId: string;
  onSuccess: () => void;
}

const DeletePostButton = ({ postId, onSuccess }: DeletePostButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { showError } = useErrorDialog();
  const { showAlert } = useAlertDialog();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId); // RLSで自分の投稿のみ削除可能

      if (error) throw error;

      onSuccess();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "投稿の削除中にエラーが発生しました";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    showAlert({
      title: "投稿を削除しますか？",
      description: "この操作は元に戻せません。投稿は完全に削除されます。",
      confirmText: loading ? "削除中..." : "削除する",
      confirmVariant: "destructive",
      onConfirm: handleDelete,
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive hover:bg-destructive/10"
      onClick={confirmDelete}
    >
      <Trash2 size={16} />
    </Button>
  );
};

export default DeletePostButton;
