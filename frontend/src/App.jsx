import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import EmailVerificationPage from "./pages/EmailVerificationPage.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore.js";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore.js";
import ThemePage from "./pages/ThemePage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import { useChatStore } from "./store/useChatStore.js";
const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const { subscribeToMessages, unsubscribeFromMessages } = useChatStore();

  useEffect(() => {
    if (!authUser) {
      checkAuth(); // only check if no user is set
    }
  }, []);

  useEffect(() => {
    if (authUser) {
      subscribeToMessages(); // ✅ Listen when authUser exists
      return () => unsubscribeFromMessages(); // ✅ Clean up
    }
  }, [authUser]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-base-100 text-base-content transition-colors duration-300"
    >
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" /> : <SignUpPage />}
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/theme" element={<ThemePage />} />
        <Route
          path="/verify-email"
          element={
            authUser ? (
              !authUser.isVerified ? (
                <EmailVerificationPage />
              ) : (
                <Navigate to="/" />
              )
            ) : localStorage.getItem("emailChanged") === "true" ? (
              <EmailVerificationPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
