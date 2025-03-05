import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { LogOut } from "lucide-react";

interface Post {
  id: string;
  created_at: string;
  title: string;
  content: string;
  user_id: string;
  username?: string;
}

const PostsPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
  }, [navigate]);

  const fetchPosts = async () => {
    try {
      // 投稿データを取得（実際のテーブル名やカラム名に合わせて調整が必要）
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error("投稿の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
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
                <CardTitle className="text-xl">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{post.content}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{post.username || "匿名ユーザー"}</span>
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsPage;
