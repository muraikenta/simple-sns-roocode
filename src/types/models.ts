// ユーザー関連の型定義
export interface User {
  id: string;
  created_at: string;
  updated_at: string | null;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

// 投稿関連の型定義
export interface Post {
  id: string;
  created_at: string;
  updated_at: string | null;
  title: string;
  content: string;
  user_id: string;
}

// 投稿とユーザー情報を合わせた拡張型
export interface PostWithUser extends Post {
  username: string;
  avatar_url: string | null;
}