import { BaseController } from "../_shared/controllers/base.ts";
import { CreateConversationUseCase } from "./usecase.ts";
import {
  CreateConversationRequest,
  CreateConversationResponse,
} from "../_shared/types/index.ts";

export class CreateConversationController extends BaseController<
  CreateConversationRequest,
  CreateConversationResponse
> {
  private useCase: CreateConversationUseCase;

  constructor() {
    super();
    this.useCase = new CreateConversationUseCase();
  }

  protected isValidMethod(method: string): boolean {
    return method === "POST";
  }

  protected async parseRequest(
    req: Request,
  ): Promise<CreateConversationRequest> {
    try {
      return await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      throw new Error("Invalid JSON in request body");
    }
  }

  protected validateRequest(data: CreateConversationRequest): string | null {
    const { participant_ids } = data;

    if (!participant_ids) {
      return "participant_ids is required";
    }

    if (!Array.isArray(participant_ids)) {
      return "participant_ids must be an array";
    }

    return null;
  }

  protected async executeUseCase(
    data: CreateConversationRequest,
    userId: string,
  ): Promise<CreateConversationResponse> {
    return await this.useCase.execute(data, userId);
  }
}
