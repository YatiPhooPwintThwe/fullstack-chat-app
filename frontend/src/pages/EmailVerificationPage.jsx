import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { MessageSquare } from "lucide-react";

const EmailVerficationPage = () => {
  const { verifyEmail } = useAuthStore();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setCode(["", "", "", "", "", ""]);
    setHasInteracted(false);
  }, []);

  const handleChange = (index, value) => {
    const newCode = [...code];
    setHasInteracted(true);

    // Handle pasted content
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6).split("");
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i] || "";
      if (inputRefs.current[i]) {
        inputRefs.current[i].value = pasted[i];
      }
    }
    setCode(newCode);

    if (pasted.length === 6 && pasted.every((digit) => digit !== "")) {
      setHasInteracted(true);
      handleSubmit({ preventDefault: () => {} });
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (
      !hasInteracted ||
      verificationCode.length !== 6 ||
      code.some((d) => d === "" || isNaN(d))
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await verifyEmail(verificationCode);
      toast.success("Email verified successfully");
      localStorage.removeItem("emailChanged");
      navigate("/login");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const allValidDigits = code.every((digit) => digit !== "" && !isNaN(digit));

    if (hasInteracted && allValidDigits) {
      const timeout = setTimeout(() => {
        handleSubmit({ preventDefault: () => {} });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [code, hasInteracted]);
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
      style={{
        backgroundImage: `url('http://getwallpapers.com/wallpaper/full/8/a/c/345446.jpg')`,
      }}
    >
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-md bg-white/5 rounded-2xl px-6 py-8 shadow-lg w-full max-w-sm border border-white/10"
        >
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-4 text-primary">
                Verify your email
              </h2>
              <p className="text-center text-sm text-base-content/60 mb-6">
                Enter the 6-digit code sent to your email address
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-xl font-bold rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading || code.some((digit) => !digit)}
              className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg shadow-md disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerficationPage;
