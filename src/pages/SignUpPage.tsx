import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // バリデーション
  const isUsernameValid = username.trim() !== "" && username.length <= 20;
  const isEmailValid =
    /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/.test(
      email
    );
  const isPasswordValid = password.length >= 8;
  const isFormValid = isUsernameValid && isEmailValid && isPasswordValid;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    try {
      // Supabaseで新規ユーザー登録
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // 登録成功時は投稿一覧画面へ遷移
        navigate("/posts");
      }
    } catch (err: any) {
      // エラーメッセージを設定
      setError(err.message || "登録中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h1>新規登録</h1>

      {error && (
        <div className="error-dialog">
          <p>{error}</p>
          <button onClick={() => setError(null)}>閉じる</button>
        </div>
      )}

      <form onSubmit={handleSignUp}>
        <div className="form-group">
          <label htmlFor="username">アカウント名</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <div className="character-count">{username.length} / 20文字</div>
          {username && !isUsernameValid && (
            <p className="validation-error">
              アカウント名は20文字以下にしてください
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          {email && !isEmailValid && (
            <p className="validation-error">
              有効なメールアドレスを入力してください
            </p>
          )}
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
          {password && !isPasswordValid && (
            <p className="validation-error">
              パスワードは8文字以上にしてください
            </p>
          )}
        </div>

        <button
          type="submit"
          className={`signup-button ${!isFormValid ? "disabled" : ""}`}
          disabled={!isFormValid || loading}
        >
          {loading ? "登録中..." : "新規登録"}
        </button>
      </form>

      <div className="login-link">
        <p>
          すでにアカウントをお持ちの方は
          <a href="/login">ログイン</a>
          してください
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
