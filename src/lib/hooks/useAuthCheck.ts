import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import RepositoryFactory from "@/repositories/factory";

export const useAuthCheck = (redirectTo = "/login") => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authRepository = RepositoryFactory.getAuthRepository();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authRepository.getCurrentUser();

        if (!currentUser) {
          // 未認証の場合はリダイレクト
          navigate(redirectTo);
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error("認証チェックエラー:", error);
        navigate(redirectTo);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, redirectTo, authRepository]);

  return { user, loading };
};