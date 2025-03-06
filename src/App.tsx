import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import PostsPage from "./pages/PostsPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import UserDetailPage from "./pages/UserDetailPage";
import { ErrorDialogProvider } from "./contexts/ErrorDialogContext";
import { AlertDialogProvider } from "./contexts/AlertDialogContext";
import { Toaster } from "./components/ui/sonner";
import RepositoryFactory from "./repositories/factory";

function App() {
  useEffect(() => {
    // Set up auth state listener using repository
    const authRepository = RepositoryFactory.getAuthRepository();
    const unsubscribe = authRepository.onAuthStateChange((user) => {
      // セッション状態が変更されたときの処理
      console.log("Auth state changed:", user ? "Logged in" : "Logged out");
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
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
              <Route path="/users/:userId" element={<UserDetailPage />} />
              <Route path="/" element={<Navigate to="/signup" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AlertDialogProvider>
    </ErrorDialogProvider>
  );
}

export default App;
