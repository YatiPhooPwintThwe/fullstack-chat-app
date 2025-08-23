import { useAuthStore } from "../store/useAuthStore.js";
import SidebarNav from "../components/SidebarNav.jsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { Eye, EyeOff } from "lucide-react";

const SettingsPage = () => {
  const { authUser, changePassword, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgotButton, setShowForgotButton] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handlePasswordChange = async () => {
    setError("");
    setShowForgotButton(false);

    const res = await changePassword({ oldPassword, newPassword });

    if (res.success) {
      toast.success("Password changed");
      setShowPasswordForm(false);
      setOldPassword("");
      setNewPassword("");
    } else {
      setError(res.message || "Incorrect old password");
      if (res.message?.toLowerCase().includes("incorrect")) {
        setShowForgotButton(true);
      }
    }
  };

  const handleForgotPassword = async () => {
    try {
      await axiosInstance.post("/auth/forgot-password", { email: authUser.email });
      await logout();
      toast.success("Reset email sent! Check your inbox.");
      navigate("/login");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send reset email");
    }
  };

  return (
    <div className="min-h-screen flex bg-base-100 text-base-content transition-colors duration-300">
      <SidebarNav />

      <main className="relative flex-1 flex flex-col items-center p-6">
        <div className="backdrop-blur-md bg-white/5 dark:bg-white/10 rounded-xl p-8 shadow-lg w-full max-w-2xl border border-white/10">
          <h1 className="text-xl font-semibold text-center mb-10">Settings</h1>

          <div className="flex flex-col gap-10">
            {/* Profile info row */}
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <img
                  src={authUser?.profilePic || "/profile.png"}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4"
                />
                <span
                  className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white"
                  title="Active now"
                />
              </div>
              <p className="text-xl font-semibold">{authUser?.fullName}</p>
            </div>

            {/* Buttons and toggle */}
            <div className="flex flex-col gap-6 mt-10">
              <button
                className="btn btn-outline w-64 mx-auto rounded-full"
                onClick={() => setShowPasswordForm((prev) => !prev)}
              >
                Change Password
              </button>
              <button
                className="btn btn-outline w-64 mx-auto rounded-full"
                onClick={() => navigate("/theme")}
              >
                Change Theme
              </button>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 text-sm"
          >
            Back 
          </button>
        </div>

        {/* Password Form Overlay */}
        {showPasswordForm && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="bg-base-200 p-6 rounded-xl w-full max-w-sm shadow-lg relative">
              <h2 className="text-lg font-semibold mb-4 text-center">Change Password</h2>

              <div className="flex flex-col gap-4">
                {/* Old Password */}
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="input input-bordered w-full pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowOldPassword((prev) => !prev)}
                  >
                    {showOldPassword ? (
                      <EyeOff className="h-5 w-5 text-base-content/40" />
                    ) : (
                      <Eye className="h-5 w-5 text-base-content/40" />
                    )}
                  </button>
                </div>

                {/* New Password */}
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input input-bordered w-full pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-base-content/40" />
                    ) : (
                      <Eye className="h-5 w-5 text-base-content/40" />
                    )}
                  </button>
                </div>

                {/* Forgot button if password is incorrect */}
                {showForgotButton && (
                  <div className="text-right">
                    <button onClick={handleForgotPassword} className="text-xs text-blue-500 underline mt-1">
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Error message */}
                {error && <p className="text-red-500 text-sm">{error}</p>}

                {/* Action buttons */}
                <div className="flex gap-4 mt-2">
                  <button className="btn btn-primary flex-1" onClick={handlePasswordChange}>
                    Submit
                  </button>
                  <button className="btn btn-outline flex-1" onClick={() => setShowPasswordForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SettingsPage;
