import { BaseController } from "../_shared/controllers/base.ts";
import { SendMessageUseCase } from "./usecase.ts";
import {
  SendMessageRequest,
  SendMessageResponse,
} from "../_shared/types/index.ts";

export class SendMessageController extends BaseController<
  SendMessageRequest,
  SendMessageResponse
> {
  private useCase: SendMessageUseCase;

  constructor() {
    super();
    this.useCase = new SendMessageUseCase();
  }

  protected isValidMethod(method: string): boolean {
    return method === "POST";
  }

  protected async parseRequest(
    req: Request,
  ): Promise<SendMessageRequest> {
    try {
      return await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      throw new Error("Invalid JSON in request body");
    }
  }

  protected validateRequest(data: SendMessageRequest): string | null {
    const { conversation_id, content } = data;

    if (!conversation_id) {
      return "conversation_id is required";
    }

    if (!content) {
      return "content is required";
    }

    if (typeof content !== "string" || content.trim() === "") {
      return "content must be a non-empty string";
    }

    return null;
  }

  protected async executeUseCase(
    data: SendMessageRequest,
    userId: string,
  ): Promise<SendMessageResponse> {
    return await this.useCase.execute(data, userId);
  }
}
