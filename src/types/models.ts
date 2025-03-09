// Supabaseの生成型をインポート
import { Database } from "./supabase";

// 基本型のエイリアス
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Message =
  & Omit<Database["public"]["Tables"]["messages"]["Row"], "is_read">
  & { read: boolean };
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Participant =
  Database["public"]["Tables"]["conversation_participants"]["Row"];

// 挿入・更新用の型
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
export type MessageInsert =
  & Omit<Database["public"]["Tables"]["messages"]["Insert"], "is_read">
  & { read?: boolean };
export type ConversationInsert =
  Database["public"]["Tables"]["conversations"]["Insert"];
export type ParticipantInsert =
  Database["public"]["Tables"]["conversation_participants"]["Insert"];

// ユーザーに関するバリデーション関数
export const UserValidation = {
  isUsernameValid: (username: string): boolean => {
    return username.trim() !== "" && username.length <= 20;
  },
  isEmailValid: (email: string): boolean => {
    return /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/
      .test(email);
  },
  isPasswordValid: (password: string): boolean => {
    return password.length >= 8;
  },
};

// 投稿に関するバリデーション関数と定数
export const PostConstants = {
  MAX_TITLE_LENGTH: 100,
  MAX_CONTENT_LENGTH: 140,
};

export const PostValidation = {
  isTitleValid: (title: string): boolean => {
    return title.trim() !== "" &&
      title.length <= PostConstants.MAX_TITLE_LENGTH;
  },
  isContentValid: (content: string): boolean => {
    return content.trim() !== "" &&
      content.length <= PostConstants.MAX_CONTENT_LENGTH;
  },
  isPostValid: (post: Pick<Post, "title" | "content">): boolean => {
    return PostValidation.isTitleValid(post.title) &&
      PostValidation.isContentValid(post.content);
  },
};

// 投稿とユーザー情報を合わせた拡張型
export interface PostWithUser extends Post {
  username: string;
  avatar_url: string | null;
}

// 会話情報と参加者情報を合わせた拡張型
export interface ConversationWithParticipants extends Conversation {
  participants: (Participant & { user: User })[];
  last_message?: Message;
  unread_count: number;
}

// メッセージと送信者情報を合わせた拡張型
export interface MessageWithSender extends Message {
  sender: User;
}
