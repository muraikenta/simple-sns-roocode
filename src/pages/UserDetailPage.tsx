import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useErrorDialog } from "@/contexts/ErrorDialogContext";
import { useAuthCheck } from "@/lib/hooks/useAuthCheck";
import PostCard, { PostData } from "@/components/posts/PostCard";
import UserProfileCard from "@/components/users/UserProfileCard";
import PageHeader from "@/components/layout/PageHeader";
import RepositoryFactory from "@/repositories/factory";
// User型は内部で定義しているのでimport不要

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

const UserDetailPage = () => {
  const { userId } = useParams();
  const { user, loading } = useAuthCheck();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { showError } = useErrorDialog();

  const userRepository = RepositoryFactory.getUserRepository();
  const postRepository = RepositoryFactory.getPostRepository();

  const fetchUserData = useCallback(async () => {
    if (!userId) return;

    try {
      setProfileLoading(true);
      
      // ユーザープロフィール情報を取得
      const userProfile = await userRepository.getUserById(userId);
      
      if (!userProfile) {
        throw new Error("ユーザーが見つかりませんでした");
      }
      
      setProfile(userProfile);

      // ユーザーの投稿を取得
      const userPosts = await postRepository.getPostsByUserId(userId);
      setPosts(userPosts);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "ユーザー情報の取得に失敗しました";
      showError(errorMsg);
      console.error("ユーザー情報の取得に失敗しました:", err);
    } finally {
      setProfileLoading(false);
    }
  }, [userId, showError, userRepository, postRepository]);

  // 認証後にデータ取得 (useEffectを使用)
  useEffect(() => {
    if (user && profileLoading && userId) {
      fetchUserData();
    }
  }, [user, profileLoading, userId, fetchUserData]);

  if (loading || (user && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <h2 className="text-xl">ユーザーが見つかりませんでした</h2>
          <Button variant="outline" onClick={() => window.history.back()}>
            戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <PageHeader 
        user={user} 
        showBackButton={true}
      />

      {/* ユーザープロフィール */}
      <UserProfileCard 
        username={profile.username}
        avatarUrl={profile.avatar_url}
        bio={profile.bio}
      />

      {/* 投稿一覧 */}
      <h2 className="text-xl font-semibold mb-4">{profile.username}の投稿</h2>

      {posts.length === 0 ? (
        <Card className="bg-muted/40">
          <CardContent className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">投稿がありません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                ...post,
                username: profile.username,
                avatar_url: profile.avatar_url
              }}
              currentUserId={user?.id}
              onDeleteSuccess={fetchUserData}
              showAuthor={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDetailPage;