import { User, Post, PostWithUser } from "@/types/models";
import { User as SupabaseUser } from "@supabase/supabase-js";

// ユーザーリポジトリのインターフェース
export interface IUserRepository {
  getUserById(userId: string): Promise<User | null>;
  updateUser(userId: string, userData: Partial<User>): Promise<void>;
  getUserByEmail(email: string): Promise<User | null>;
}

// 投稿リポジトリのインターフェース
export interface IPostRepository {
  getAllPosts(): Promise<PostWithUser[]>;
  getPostsByUserId(userId: string): Promise<Post[]>;
  createPost(postData: Omit<Post, "id" | "created_at" | "updated_at">): Promise<Post>;
  updatePost(postId: string, userId: string, postData: Partial<Post>): Promise<void>;
  deletePost(postId: string, userId: string): Promise<void>;
}

// 認証リポジトリのインターフェース
export interface IAuthRepository {
  getCurrentUser(): Promise<SupabaseUser | null>;
  signIn(email: string, password: string): Promise<SupabaseUser | null>;
  signUp(email: string, password: string, username: string): Promise<SupabaseUser | null>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: (user: SupabaseUser | null) => void): () => void;
}

// ストレージリポジトリのインターフェース
export interface IStorageRepository {
  uploadFile(bucket: string, path: string, file: File): Promise<string>;
  getFileUrl(bucket: string, path: string): string;
  deleteFile(bucket: string, path: string): Promise<void>;
}