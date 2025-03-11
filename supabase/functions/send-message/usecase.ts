import { BaseUseCase } from "../_shared/usecases/base.ts";
import {
  SendMessageRequest,
  SendMessageResponse,
} from "../_shared/types/index.ts";
import { ParticipantRepository } from "../_shared/repositories/participant.ts";
import { messages } from "../_shared/db/schema.ts";
import { getDb } from "../_shared/db/client.ts";

export class SendMessageUseCase extends BaseUseCase<
  SendMessageRequest,
  SendMessageResponse
> {
  private participantRepository: ParticipantRepository;

  constructor() {
    super();
    const db = getDb();
    this.participantRepository = new ParticipantRepository(db);
  }

  async execute(
    params: SendMessageRequest,
    userId: string,
  ): Promise<SendMessageResponse> {
    const { conversation_id, content } = params;
    const db = getDb();

    // 会話の参加者であることを確認
    const isParticipant = await this.participantRepository.isUserInConversation(
      conversation_id,
      userId,
    );

    if (!isParticipant) {
      throw new Error("User is not a participant of this conversation");
    }

    // メッセージ内容の検証
    if (!content || content.trim() === "") {
      throw new Error("Message content cannot be empty");
    }

    // メッセージの保存
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversation_id,
        sender_id: userId,
        content,
      })
      .returning();

    return {
      id: newMessage.id,
      content: newMessage.content,
      sender_id: newMessage.sender_id,
      conversation_id: newMessage.conversation_id,
    };
  }
}
