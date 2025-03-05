import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

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
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="posts-container">
      <div className="header">
        <h1>投稿一覧</h1>
        <div className="user-info">
          {user && (
            <>
              <span>{user.user_metadata?.username || user.email}</span>
              <button onClick={handleLogout} className="logout-button">
                ログアウト
              </button>
            </>
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="no-posts">
          <p>投稿がありません</p>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <h2>{post.title}</h2>
              <p>{post.content}</p>
              <div className="post-meta">
                <span>{post.username || "匿名ユーザー"}</span>
                <span>{new Date(post.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsPage;
