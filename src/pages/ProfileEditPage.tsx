import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
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
import { useAuthCheck } from "@/lib/hooks/useAuthCheck";
import PageHeader from "@/components/layout/PageHeader";

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthCheck();
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { showError } = useErrorDialog();

  // バリデーション
  const isUsernameValid = username.trim() !== "";
  const isFormValid = isUsernameValid;

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setProfileLoading(true);
      // ユーザープロフィールを取得
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      setUsername(profileData.username || "");
      setAvatarUrl(profileData.avatar_url || null);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "プロフィールの取得に失敗しました";
      showError(errorMsg);
    } finally {
      setProfileLoading(false);
    }
  }, [user, showError]);

  // 認証情報取得後、プロフィール情報を取得 (useEffectを使用)
  useEffect(() => {
    if (user && profileLoading) {
      fetchUserProfile();
    }
  }, [user, profileLoading, fetchUserProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || !user) return;

    setSaving(true);

    try {
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

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <PageHeader 
        showBackButton={true} 
        user={user}
        showProfileButton={false}
      />
      
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
