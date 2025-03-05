import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { LogOut, Edit, Plus } from "lucide-react";
import PostForm from "@/components/posts/PostForm";
import DeletePostButton from "@/components/posts/DeletePostButton";
import { useErrorDialog } from "@/contexts/ErrorDialogContext";

interface Post {
  id: string;
  created_at: string;
  updated_at?: string;
  title: string;
  content: string;
  user_id: string;
}

const PostsPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { showError } = useErrorDialog();

  const fetchPosts = useCallback(async () => {
    try {
      // 投稿データを取得
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "投稿の取得に失敗しました";
      showError(errorMsg);
      console.error("投稿の取得に失敗しました:", err);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    // ユーザーの認証状態を確認
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        // 未認証の場合はログイン画面へリダイレクト
        navigate("/login");
        return;
      }

      setUser(data.session.user);
      fetchPosts();
    };

    checkAuth();
  }, [navigate, fetchPosts]);

  const handlePostSuccess = () => {
    fetchPosts();
    setShowPostForm(false);
    setEditingPost(null);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowPostForm(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">投稿一覧</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.user_metadata?.username || user.email}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-1"
            >
              <LogOut size={16} />
              <span>ログアウト</span>
            </Button>
          </div>
        )}
      </div>

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
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  {user && post.user_id === user.id && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit size={16} />
                      </Button>
                      <DeletePostButton
                        postId={post.id}
                        onSuccess={fetchPosts}
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
              </CardContent>
              <CardFooter className="py-2 text-xs text-muted-foreground flex justify-between">
                <span>
                  投稿者:{" "}
                  {user && post.user_id === user.id
                    ? user.user_metadata?.username || user.email
                    : "他のユーザー"}
                </span>
                <div>
                  {post.updated_at && post.updated_at !== post.created_at ? (
                    <span>
                      更新日時: {new Date(post.updated_at).toLocaleString()}
                    </span>
                  ) : (
                    <span>
                      投稿日時: {new Date(post.created_at).toLocaleString()}
                    </span>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsPage;
