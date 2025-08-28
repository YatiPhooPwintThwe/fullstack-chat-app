import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { Camera, User, Mail, Loader2 } from "lucide-react";
import SidebarNav from "../components/SidebarNav.jsx";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { authUser, isUpdatingProfile, updateProfileImage, updateProfileInfo, logout } =
    useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName || "");
      setEmail(authUser.email || "");
    }
  }, [authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfileImage(base64Image);
    };
  };

  const handleSave = async () => {
    const emailChanged = email !== authUser.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error("Invalid email format");
    }

    const success = await updateProfileInfo({ fullName, email });

    if (success && emailChanged) {
      localStorage.setItem("emailChanged", "true");
      await logout();
      navigate("/verify-email");
    }
  };

  return (
    <div className="min-h-screen flex bg-base-100 text-base-content transition-colors duration-300">
      {/* Sidebar */}
      <SidebarNav />

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col items-center p-6">
        <div className="flex flex-col justify-center items-center p-6 sm:p-12 w-full max-w-lg">
          <div className="backdrop-blur-md bg-base-200/50 rounded-2xl px-6 py-6 shadow-lg w-full max-w-sm border border-base-300">
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold">Profile</h1>
            </div>

            {/* avatar upload section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={authUser?.profilePic || "/profile.png"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4"
                />

                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                    isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                  }`}
                >
                  <Camera className="w-4 h-4 text-base-200" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>
              <p className="text-sm text-zinc-400 mt-2 mb-4 text-center">
                {isUpdatingProfile ? "Uploading..." : "Click the camera to update your photo"}
              </p>
            </div>

            {/* Editable fields */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" /> Full Name
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400 flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="h-4" />

              <button
                className="btn btn-primary w-full"
                onClick={handleSave}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
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
      </main>
    </div>
  );
};

export default ProfilePage;
