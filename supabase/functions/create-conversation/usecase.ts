import { BaseUseCase } from "../_shared/usecases/base.ts";
import { ConversationRepository } from "../_shared/repositories/conversation.ts";
import { ParticipantRepository } from "../_shared/repositories/participant.ts";
import { UserRepository } from "../_shared/repositories/user.ts";
import { getDb } from "../_shared/db/client.ts";
import {
  CreateConversationRequest,
  CreateConversationResponse,
} from "../_shared/types/index.ts";

export class CreateConversationUseCase extends BaseUseCase<
  CreateConversationRequest,
  CreateConversationResponse
> {
  private conversationRepo: ConversationRepository;
  private participantRepo: ParticipantRepository;
  private userRepo: UserRepository;

  constructor() {
    super();
    const db = getDb();
    this.conversationRepo = new ConversationRepository(db);
    this.participantRepo = new ParticipantRepository(db);
    this.userRepo = new UserRepository(db);
  }

  async execute(
    params: CreateConversationRequest,
    userId: string,
  ): Promise<CreateConversationResponse> {
    const { participant_ids } = params;

    // 参加者リストに現在のユーザーが含まれていることを確認
    let participantIds = [...participant_ids];
    if (!participantIds.includes(userId)) {
      participantIds.push(userId);
    }

    // 重複を排除
    participantIds = [...new Set(participantIds)];

    // ユーザーIDの検証
    const { valid: validUserIds, invalid: invalidUserIds } = await this.userRepo
      .validateUserIds(participantIds);

    if (invalidUserIds.length > 0) {
      throw new Error(`Invalid user IDs: ${invalidUserIds.join(", ")}`);
    }

    // トランザクションを使用して会話と参加者を作成
    const db = getDb();
    return await db.transaction(async (tx: ReturnType<typeof getDb>) => {
      // トランザクション用のリポジトリを作成
      const txConversationRepo = new ConversationRepository(tx);
      const txParticipantRepo = new ParticipantRepository(tx);

      // 新しい会話を作成
      const conversation = await txConversationRepo.create();
      const conversationId = conversation.id;

      // 参加者を追加
      const participantInserts = validUserIds.map((userId) => ({
        conversation_id: conversationId,
        user_id: userId,
      }));

      await txParticipantRepo.addParticipants(participantInserts);

      return { id: conversationId };
    });
  }
}
