import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { supabase } from "./lib/supabase";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import PostsPage from "./pages/PostsPage";
import ProfileEditPage from "./pages/ProfileEditPage"; // 追加
import { ErrorDialogProvider } from "./contexts/ErrorDialogContext";
import { AlertDialogProvider } from "./contexts/AlertDialogContext";
import { Toaster } from "./components/ui/sonner"; // 追加

function App() {
  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // セッション状態が変更されたときの処理
      console.log("Auth state changed:", session ? "Logged in" : "Logged out");
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ErrorDialogProvider>
      <AlertDialogProvider>
        <BrowserRouter>
          <div className="app-container">
            <Toaster />
            <Routes>
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/profile/edit" element={<ProfileEditPage />} />
              <Route path="/" element={<Navigate to="/signup" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AlertDialogProvider>
    </ErrorDialogProvider>
  );
}

export default App;
