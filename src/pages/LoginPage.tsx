import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // バリデーション
  const isEmailValid = email.trim() !== "";
  const isPasswordValid = password.trim() !== "";
  const isFormValid = isEmailValid && isPasswordValid;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    try {
      // Supabaseでログイン
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // ログイン成功時は投稿一覧画面へ遷移
        navigate("/posts");
      }
    } catch (err: any) {
      // エラーメッセージを設定
      setError(err.message || "ログイン中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>ログイン</h1>

      {error && (
        <div className="error-dialog">
          <p>{error}</p>
          <button onClick={() => setError(null)}>閉じる</button>
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <div className="password-input-container">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "非表示" : "表示"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={`login-button ${!isFormValid ? "disabled" : ""}`}
          disabled={!isFormValid || loading}
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <div className="signup-link">
        <p>
          アカウントをお持ちでない方は
          <a href="/signup">新規登録</a>
          してください
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
