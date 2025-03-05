import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useErrorDialog } from "../contexts/ErrorDialogContext";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showError } = useErrorDialog();

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
    } catch (err: unknown) {
      // エラーメッセージを設定
      const errorMsg =
        err instanceof Error ? err.message : "登録中にエラーが発生しました";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">新規登録</CardTitle>
          <CardDescription className="text-center">
            アカウントを作成して始めましょう
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                アカウント名
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full"
              />
              <div className="text-xs text-right text-muted-foreground">
                {username.length} / 20文字
              </div>
              {username && !isUsernameValid && (
                <p className="text-sm text-destructive">
                  アカウント名は20文字以下にしてください
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full"
              />
              {email && !isEmailValid && (
                <p className="text-sm text-destructive">
                  有効なメールアドレスを入力してください
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                パスワード
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && !isPasswordValid && (
                <p className="text-sm text-destructive">
                  パスワードは8文字以上にしてください
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || loading}
            >
              {loading ? "登録中..." : "新規登録"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            すでにアカウントをお持ちの方は
            <a href="/login" className="text-primary font-medium ml-1">
              ログイン
            </a>
            してください
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpPage;
