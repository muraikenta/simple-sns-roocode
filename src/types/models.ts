// ユーザー関連の型定義
export interface User {
  id: string;
  created_at: string;
  updated_at: string | null;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

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

// 投稿関連の型定義
export interface Post {
  id: string;
  created_at: string;
  updated_at: string | null;
  title: string;
  content: string;
  user_id: string;
}

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

// メッセージ関連の型定義
export interface Message {
  id: string;
  created_at: string;
  updated_at: string | null;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
}

// 会話参加者の型定義
export interface Participant {
  id: string;
  created_at: string;
  updated_at: string | null;
  conversation_id: string;
  user_id: string;
}

// 会話の型定義
export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string | null;
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
