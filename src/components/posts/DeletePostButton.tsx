import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useErrorDialog } from "@/contexts/ErrorDialogContext";
import { useAlertDialog } from "@/contexts/AlertDialogContext";
import { useAuthCheck } from "@/lib/hooks/useAuthCheck";
import RepositoryFactory from "@/repositories/factory";

interface DeletePostButtonProps {
  postId: string;
  onSuccess?: () => void;
}

const DeletePostButton = ({ postId, onSuccess }: DeletePostButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { showError } = useErrorDialog();
  const { showAlert } = useAlertDialog();

  const { user } = useAuthCheck();
  const postRepository = RepositoryFactory.getPostRepository();

  const handleDelete = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // リポジトリを使用して投稿を削除
      await postRepository.deletePost(postId, user.id); // ユーザーIDも渡してRLSポリシーを遵守
      if (onSuccess) {
        onSuccess();
      }
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
