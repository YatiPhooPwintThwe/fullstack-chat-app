import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, {
        password: newPassword,
      });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reset failed");
    } finally {
      setIsSubmitting(false);
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
        <div className="flex flex-col justify-center items-center p-6 sm:p-12 w-full max-w-lg">
          <div className="backdrop-blur-md bg-white/5 rounded-2xl px-6 py-4 shadow-lg w-full max-w-sm h-[280px] border border-white/10 flex flex-col justify-between">
            <h2 className="text-xl font-bold text-center text-white mt-8">
              Reset Password
            </h2>

            {/* Form in middle space */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col h-full justify-between"
            >
              <div className="mt-12">
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="input input-bordered w-full"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-2">
                {" "}
                {/* Moves button a little higher */}
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
