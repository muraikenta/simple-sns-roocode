// 基本的なレスポンス型
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    details?: Record<string, unknown>;
  };
}

// リクエスト型
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

// 会話作成リクエスト
export interface CreateConversationRequest {
  participant_ids: string[];
}

// 会話作成レスポンス
export interface CreateConversationResponse {
  id: string;
}

// 参加者追加リクエスト
export interface AddParticipantRequest {
  conversation_id: string;
  user_id: string;
}

// メッセージ送信リクエスト
export interface SendMessageRequest {
  conversation_id: string;
  content: string;
}

// メッセージ送信レスポンス
export interface SendMessageResponse {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
}

// メッセージ既読リクエスト
export interface MarkMessagesAsReadRequest {
  conversation_id: string;
}

// 会話一覧取得レスポンス
export interface GetUserConversationsResponse {
  conversations: {
    id: string;
    participants: {
      id: string;
      user_id: string;
      username?: string;
    }[];
    last_message?: {
      id: string;
      content: string;
      sender_id: string;
      created_at: string;
      is_read: boolean;
    };
  }[];
}

// 会話メッセージ取得リクエスト
export interface GetConversationMessagesRequest {
  conversation_id: string;
  limit?: number;
  offset?: number;
}

// 会話メッセージ取得レスポンス
export interface GetConversationMessagesResponse {
  messages: {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
  }[];
}
