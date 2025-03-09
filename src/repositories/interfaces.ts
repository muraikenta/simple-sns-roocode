import {
  ConversationWithParticipants,
  MessageWithSender,
  Post,
  PostInsert,
  PostWithUser,
  User,
} from "@/types/models";
import { User as SupabaseUser } from "@supabase/supabase-js";

// ユーザーリポジトリのインターフェース
export interface IUserRepository {
  getUserById(userId: string): Promise<User | null>;
  updateUser(userId: string, userData: Partial<User>): Promise<void>;
}

// 投稿リポジトリのインターフェース
export interface IPostRepository {
  getAllPosts(): Promise<PostWithUser[]>;
  getPostsByUserId(userId: string): Promise<Post[]>;
  createPost(postData: PostInsert): Promise<Post>;
  updatePost(
    postId: string,
    userId: string,
    postData: Partial<Post>,
  ): Promise<void>;
  deletePost(postId: string, userId: string): Promise<void>;
}

// 認証リポジトリのインターフェース
export interface IAuthRepository {
  getCurrentUser(): Promise<SupabaseUser | null>;
  signIn(email: string, password: string): Promise<SupabaseUser | null>;
  signUp(
    email: string,
    password: string,
    username: string,
  ): Promise<SupabaseUser | null>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: (user: SupabaseUser | null) => void): () => void;
}

// ストレージリポジトリのインターフェース
export interface IStorageRepository {
  uploadFile(bucket: string, path: string, file: File): Promise<string>;
  getFileUrl(bucket: string, path: string): string;
  deleteFile(bucket: string, path: string): Promise<void>;
}

// メッセージリポジトリのインターフェース
export interface IMessageRepository {
  createConversation(participantIds: string[]): Promise<string>;
  addParticipant(conversationId: string, userId: string): Promise<void>;
  sendMessage(conversationId: string, content: string): Promise<string>;
  markMessagesAsRead(conversationId: string): Promise<void>;
  getUserConversations(): Promise<ConversationWithParticipants[]>;
  getConversationMessages(
    conversationId: string,
    limit?: number,
    offset?: number,
  ): Promise<MessageWithSender[]>;
}
