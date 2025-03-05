import { supabase, adminSupabase } from "../setup";

/**
 * テストユーザーとその関連データをクリーンアップするヘルパー関数
 * @param userId クリーンアップするユーザーのID
 */
export async function cleanupTestUser(userId: string) {
  try {
    // 関連する投稿を削除
    await supabase.from("posts").delete().eq("user_id", userId);

    // ユーザーを削除
    await supabase.from("users").delete().eq("id", userId);

    // 認証ユーザーを削除（管理者権限が必要）
    // 注: 実際のテスト環境では、管理者権限を持つクライアントを使用する必要があります
    await adminSupabase.auth.admin.deleteUser(userId);
  } catch (error) {
    console.error(
      "テストユーザーのクリーンアップ中にエラーが発生しました:",
      error
    );
    throw error;
  }
}

/**
 * テスト投稿をクリーンアップするヘルパー関数
 * @param postId クリーンアップする投稿のID
 */
export async function cleanupTestPost(postId: string) {
  try {
    await supabase.from("posts").delete().eq("id", postId);
  } catch (error) {
    console.error("テスト投稿のクリーンアップ中にエラーが発生しました:", error);
    throw error;
  }
}

/**
 * 全てのテストデータをクリーンアップするヘルパー関数
 * 注意: このヘルパーは、テスト専用の環境でのみ使用してください。
 * 本番環境や開発環境で使用すると、全てのデータが削除されます。
 */
export async function cleanupAllTestData() {
  try {
    // テスト用のデータを識別するためのプレフィックスがある場合は、
    // それに基づいてデータをフィルタリングしてクリーンアップすることをお勧めします。
    // 例: test-* というプレフィックスを持つメールアドレスのユーザーのみを削除するなど

    // 以下は例として、全てのデータを削除する方法を示しています。
    // 実際のテストでは、より安全な方法を使用することをお勧めします。
    await supabase
      .from("posts")
      .delete()
      .filter("created_at", "gt", new Date(Date.now() - 3600000).toISOString());

    // 注: 認証ユーザーの一括削除は、Supabase Admin APIを使用する必要があります。
    // これは通常、テスト環境でのみ行うべきです。
  } catch (error) {
    console.error(
      "テストデータのクリーンアップ中にエラーが発生しました:",
      error
    );
    throw error;
  }
}
