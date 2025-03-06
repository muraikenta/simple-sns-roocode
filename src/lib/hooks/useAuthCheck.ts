import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export const useAuthCheck = (redirectTo = "/login") => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          // 未認証の場合はリダイレクト
          navigate(redirectTo);
          return;
        }

        setUser(data.session.user);
      } catch (error) {
        console.error("認証チェックエラー:", error);
        navigate(redirectTo);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, redirectTo]);

  return { user, loading };
};