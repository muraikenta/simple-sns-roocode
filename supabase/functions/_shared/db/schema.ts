import {
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "https://esm.sh/kysely@0.27.6";

export interface Database {
  conversations: ConversationsTable;
  conversation_participants: ConversationParticipantsTable;
  messages: MessagesTable;
  users: UsersTable;
}

export interface ConversationsTable {
  id: Generated<string>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface ConversationParticipantsTable {
  id: Generated<string>;
  conversation_id: string;
  user_id: string;
  created_at: Generated<Date>;
}

export interface MessagesTable {
  id: Generated<string>;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: Generated<Date>;
  is_read: boolean;
}

export interface UsersTable {
  id: string;
  username: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// 型エイリアス
export type Conversation = Selectable<ConversationsTable>;
export type NewConversation = Insertable<ConversationsTable>;
export type ConversationUpdate = Updateable<ConversationsTable>;

export type ConversationParticipant = Selectable<ConversationParticipantsTable>;
export type NewConversationParticipant =
  Insertable<ConversationParticipantsTable>;

export type Message = Selectable<MessagesTable>;
export type NewMessage = Insertable<MessagesTable>;
export type MessageUpdate = Updateable<MessagesTable>;

export type User = Selectable<UsersTable>;
