import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useErrorDialog } from "@/contexts/ErrorDialogContext";
import { supabase } from "@/lib/supabase";

interface PostFormProps {
  onSuccess: () => void;
  userId: string;
  initialData?: {
    id: string;
    title: string;
    content: string;
  };
}

const PostForm = ({ onSuccess, userId, initialData }: PostFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [loading, setLoading] = useState(false);
  const { showError } = useErrorDialog();

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showError("タイトルと内容を入力してください");
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        // 投稿を更新
        const { error } = await supabase
          .from("posts")
          .update({
            title,
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id)
          .eq("user_id", userId); // 自分の投稿のみ更新可能

        if (error) throw error;
      } else {
        // 新規投稿を作成
        const { error } = await supabase.from("posts").insert({
          title,
          content,
          user_id: userId,
        });

        if (error) throw error;
      }

      // 成功したらフォームをリセット
      setTitle("");
      setContent("");
      onSuccess();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : isEditing
          ? "投稿の更新中にエラーが発生しました"
          : "投稿の作成中にエラーが発生しました";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{isEditing ? "投稿を編集" : "新規投稿"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              タイトル
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
              placeholder="タイトルを入力"
              disabled={loading}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              内容
            </label>
            <div className="space-y-1">
              <Textarea
                id="content"
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setContent(e.target.value)
                }
                placeholder="投稿内容を入力"
                disabled={loading}
                className="min-h-[120px]"
                maxLength={140}
              />
              <div className="text-xs text-right text-muted-foreground">
                {content.length}/140文字
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSuccess()}
              disabled={loading}
            >
              キャンセル
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading
              ? isEditing
                ? "更新中..."
                : "投稿中..."
              : isEditing
              ? "更新する"
              : "投稿する"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PostForm;
