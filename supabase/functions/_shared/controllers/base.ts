import { ApiResponse } from "../types/index.ts";
import { corsHeaders } from "../helpers/cors.ts";
import { getUserId } from "../helpers/auth.ts";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../helpers/response.ts";

export abstract class BaseController<TRequest, TResponse> {
  // 認証済みリクエストの処理
  async handleRequest(req: Request): Promise<Response> {
    try {
      // CORSチェック
      if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
      }

      // メソッドチェック
      if (!this.isValidMethod(req.method)) {
        return createErrorResponse("Method not allowed", 405);
      }

      // リクエストの検証
      const requestData = await this.parseRequest(req);
      const validationError = this.validateRequest(requestData);
      if (validationError) {
        return createErrorResponse(validationError, 400);
      }

      // ユーザーIDの取得と認証
      const userId = await getUserId(req);
      if (!userId) {
        return createErrorResponse("Unauthorized", 401);
      }

      // ビジネスロジックの実行
      const result = await this.executeUseCase(requestData, userId);

      // レスポンスの生成
      return createSuccessResponse(result);
    } catch (error) {
      console.error(`Error in ${this.constructor.name}:`, error);
      return createErrorResponse(error.message, 500);
    }
  }

  // リクエストメソッドの検証
  protected abstract isValidMethod(method: string): boolean;

  // リクエストの解析
  protected abstract parseRequest(req: Request): Promise<TRequest>;

  // リクエストの検証
  protected abstract validateRequest(data: TRequest): string | null;

  // ユースケースの実行
  protected abstract executeUseCase(
    data: TRequest,
    userId: string
  ): Promise<TResponse>;
}
