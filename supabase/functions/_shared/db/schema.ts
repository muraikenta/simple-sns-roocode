import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// テーブル定義
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: text("username").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const conversationParticipants = pgTable("conversation_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversation_id: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversation_id: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id),
  sender_id: uuid("sender_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  is_read: boolean("is_read").default(false).notNull(),
});

// リレーションシップ定義
export const usersRelations = relations(users, ({ many }) => ({
  participations: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationsRelations = relations(
  conversations,
  ({ many }) => ({
    participants: many(conversationParticipants),
    messages: many(messages),
  }),
);

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversation_id],
      references: [conversations.id],
    }),
    user: one(users, {
      fields: [conversationParticipants.user_id],
      references: [users.id],
    }),
  }),
);

export const messagesRelations = relations(
  messages,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [messages.conversation_id],
      references: [conversations.id],
    }),
    sender: one(users, {
      fields: [messages.sender_id],
      references: [users.id],
    }),
  }),
);

// 型定義
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type ConversationParticipant =
  typeof conversationParticipants.$inferSelect;
export type NewConversationParticipant =
  typeof conversationParticipants.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
