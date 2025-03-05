import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useErrorDialog } from "@/contexts/ErrorDialogContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { showError } = useErrorDialog();

  // バリデーション
  const isUsernameValid = username.trim() !== "";
  const isFormValid = isUsernameValid;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // 認証状態を確認
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          navigate("/login");
          return;
        }

        const userId = sessionData.session.user.id;

        // ユーザープロフィールを取得
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        setUser(sessionData.session.user);
        setUsername(profileData.username || "");
        setAvatarUrl(profileData.avatar_url || null);
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "プロフィールの取得に失敗しました";
        showError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setSaving(true);

    try {
      if (!user) {
        throw new Error("ユーザー情報が取得できませんでした");
      }

      const { error } = await supabase
        .from("users")
        .update({
          username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // 成功メッセージを表示して投稿一覧ページに遷移
      toast.success("プロフィールを更新しました", {
        description: "変更が正常に保存されました",
        duration: 5000,
      });
      navigate("/posts");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "プロフィールの更新に失敗しました";
      showError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            プロフィール編集
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              {user && (
                <ImageUpload
                  initialImageUrl={avatarUrl}
                  onImageUploaded={setAvatarUrl}
                  userId={user.id}
                />
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                ユーザー名 <span className="text-destructive">*</span>
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={saving}
                className="w-full"
                required
              />
              {username === "" && (
                <p className="text-sm text-destructive">ユーザー名は必須です</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/posts")}
              disabled={saving}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={!isFormValid || saving}>
              {saving ? "保存中..." : "保存する"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProfileEditPage;
