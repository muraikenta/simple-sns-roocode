import { supabase } from "../setup";

/**
 * テストユーザーを作成するヘルパー関数
 * @param email メールアドレス（省略時は一意のメールアドレスを生成）
 * @param password パスワード（デフォルト: password123）
 * @returns 作成されたユーザーの情報（id, email, password）
 */
export async function createTestUser(email?: string, password = "password123") {
  const testEmail =
    email ||
    `test-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}@example.com`;

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password,
    options: {
      data: { username: `user_${Date.now()}` },
    },
  });

  if (error) throw error;

  // ユーザーが作成されるまで少し待機（handle_new_userトリガーが実行されるため）
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id: data.user!.id,
    email: testEmail,
    password,
  };
}

/**
 * 指定したユーザーとして認証するヘルパー関数
 * @param email ユーザーのメールアドレス
 * @param password ユーザーのパスワード
 */
export async function authenticateAs(email: string, password: string) {
  // 現在のセッションをクリア
  await supabase.auth.signOut();

  // 指定したユーザーとしてログイン
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
}

/**
 * 認証状態をリセットするヘルパー関数
 */
export async function resetAuth() {
  await supabase.auth.signOut();
}
