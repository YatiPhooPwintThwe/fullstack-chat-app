import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
const LoginPage = () => {
  const navigate = useNavigate(); // ✅ add this

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoggingIn } = useAuthStore();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData);
    if (!success) return;
    if (localStorage.getItem("emailChanged") === "true") {
      localStorage.removeItem("emailChanged");
      navigate("/verify-email");
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
      style={{
        backgroundImage: `url('http://getwallpapers.com/wallpaper/full/8/a/c/345446.jpg')`,
      }}
    >
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 w-full max-w-lg">
        <div className="backdrop-blur-md bg-white/5 rounded-2xl px-6 py-4 shadow-lg w-full max-w-sm border border-white/10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">Sign in to your account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                ></input>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span classame="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>
            {/* Forgot Password Button */}
            <div className="text-right mt-1 text-sm">
              <button
                type="button"
                onClick={() => setShowForgotPassword(!showForgotPassword)}
                className="link link-primary"
              >
                Forgot password?
              </button>
            </div>

            <div className="form-control pt-4">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading ...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
          {/* Forgot Password Form (Toggle View) */}
          {showForgotPassword && (
            <div className="absolute inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-base-200 p-6 rounded-xl w-full max-w-sm shadow-lg relative">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  Reset your password
                </h3>

                <input
                  type="email"
                  className="input input-bordered w-full mb-4"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />

                <button
                  className="btn btn-primary w-full"
                  onClick={async () => {
                    setIsSending(true);
                    try {
                      await axiosInstance.post("/auth/forgot-password", {
                        email: forgotEmail,
                      });
                      toast.success(
                        "Reset link sent! Please check your email."
                      );
                      setShowForgotPassword(false);
                    } catch (err) {
                      toast.error(
                        err?.response?.data?.message || "Failed to send email"
                      );
                    } finally {
                      setIsSending(false);
                    }
                  }}
                  disabled={isSending}
                >
                  {isSending ? "Sending..." : "Send Reset Link"}
                </button>

                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="btn btn-outline w-full mt-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mt-4">
            <p className="text-base-content/60 mb-0">
              Don&apos;t have an account?
            </p>
            <Link to="/signup" className="btn btn-outline btn-primary btn-sm">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
