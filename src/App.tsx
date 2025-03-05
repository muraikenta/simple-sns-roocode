import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { supabase } from "./lib/supabase";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import PostsPage from "./pages/PostsPage";

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
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/" element={<Navigate to="/signup" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
