import { createClient } from "@supabase/supabase-js";
import { expect, beforeAll, afterAll } from "vitest";

// テスト用のSupabaseクライアントを作成
// 環境変数から接続情報を取得するか、ローカル環境の場合はデフォルト値を使用
const supabaseUrl = process.env.SUPABASE_URL || "http://localhost:54321";
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

// 通常のクライアント（匿名ユーザー用）
export const supabase = createClient(supabaseUrl, supabaseKey);

// 管理者権限を持つクライアント（テストデータのクリーンアップなどに使用）
// 実際の環境では、管理者キーを環境変数から取得する
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

// グローバルなテスト設定
beforeAll(async () => {
  // テスト開始前の初期化処理
  console.log("テスト環境を初期化しています...");

  // Supabase接続を確認
  const { error } = await supabase.auth.getSession();
  if (error) {
    console.error("Supabase接続エラー:", error);
    throw error;
  }

  console.log("テスト環境の初期化が完了しました");
});

afterAll(async () => {
  // テスト終了後のクリーンアップ処理
  console.log("テスト環境をクリーンアップしています...");

  // 必要に応じて、テスト中に作成されたデータをクリーンアップする処理を追加

  console.log("テスト環境のクリーンアップが完了しました");
});

// カスタムマッチャーの拡張（必要に応じて）
expect.extend({
  // 例: toBeWithinRange マッチャー
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
