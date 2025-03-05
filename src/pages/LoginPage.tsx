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

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showError } = useErrorDialog();

  // バリデーション
  const isEmailValid = email.trim() !== "";
  const isPasswordValid = password.trim() !== "";
  const isFormValid = isEmailValid && isPasswordValid;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setLoading(true);

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
    } catch (err: unknown) {
      // エラーメッセージを設定
      const errorMsg =
        err instanceof Error ? err.message : "ログイン中にエラーが発生しました";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">ログイン</CardTitle>
          <CardDescription className="text-center">
            アカウントにログインしてください
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || loading}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            アカウントをお持ちでない方は
            <a href="/signup" className="text-primary font-medium ml-1">
              新規登録
            </a>
            してください
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
