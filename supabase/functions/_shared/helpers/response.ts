import { ApiResponse } from "../types/index.ts";
import { corsHeaders } from "./cors.ts";

export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
): Response {
  const response = data;
  return new Response(JSON.stringify(response), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, unknown>,
): Response {
  const response: ApiResponse<null> = {
    error: { message, details },
  };
  return new Response(JSON.stringify(response), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
