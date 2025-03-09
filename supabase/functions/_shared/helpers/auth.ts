import { createClient } from "@supabase/supabase-js";

export async function getUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");

  // JWTからユーザーIDを取得
  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const supabaseServiceKey = Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY",
  ) as string;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required",
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}
