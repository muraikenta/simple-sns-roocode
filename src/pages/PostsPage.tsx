import { useState, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useErrorDialog } from "@/contexts/ErrorDialogContext";
import { useAuthCheck } from "@/lib/hooks/useAuthCheck";
import PostForm from "@/components/posts/PostForm";
import PostCard, { PostData } from "@/components/posts/PostCard";
import PageHeader from "@/components/layout/PageHeader";

const PostsPage = () => {
  const { user, loading } = useAuthCheck();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<PostData | null>(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const { showError } = useErrorDialog();

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    try {
      setPostsLoading(true);
      // 投稿データとユーザー情報を一緒に取得
      const { data, error } = await supabase
        .from("posts")
        .select("*, users(username, avatar_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // ネストされたユーザーデータを平坦化
      const postsWithUserInfo =
        data?.map((post) => ({
          ...post,
          username: post.users?.username || "不明なユーザー",
          avatar_url: post.users?.avatar_url || null,
        })) || [];

      setPosts(postsWithUserInfo);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "投稿の取得に失敗しました";
      showError(errorMsg);
      console.error("投稿の取得に失敗しました:", err);
    } finally {
      setPostsLoading(false);
    }
  }, [user, showError]);

  // useEffectを使ってuser依存でfetchPostsを呼び出す
  useEffect(() => {
    if (user && postsLoading) {
      fetchPosts();
    }
  }, [user, postsLoading, fetchPosts]);

  const handlePostSuccess = () => {
    fetchPosts();
    setShowPostForm(false);
    setEditingPost(null);
  };

  const handleEditPost = (post: PostData) => {
    setEditingPost(post);
    setShowPostForm(true);
  };

  if (loading || (user && postsLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <PageHeader title="投稿一覧" user={user} />

      {user && (
        <>
          {showPostForm || editingPost ? (
            <PostForm
              onSuccess={handlePostSuccess}
              userId={user.id}
              initialData={
                editingPost
                  ? {
                      id: editingPost.id,
                      title: editingPost.title,
                      content: editingPost.content,
                    }
                  : undefined
              }
            />
          ) : (
            <Button
              onClick={() => setShowPostForm(true)}
              className="mb-6 flex items-center gap-1"
            >
              <Plus size={16} />
              <span>新規投稿</span>
            </Button>
          )}
        </>
      )}

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
              post={post}
              currentUserId={user?.id}
              onEdit={handleEditPost}
              onDeleteSuccess={fetchPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsPage;
