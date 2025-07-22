import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setAuthUser: (user) => set({ authUser: user }),

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });

      toast.success("Account created successfully");
      get().connectSocket();
      return true;
    } catch (error) {
      const msg = error?.response?.data?.message || "Signup failed";
      console.error("Signup error:", msg);
      toast.error(msg);
      return false;
      // ✅ Now user will see what's wrong
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (loginData) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", loginData);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
      return true;
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout", null, {
        withCredentials: true,
      });
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data, {
        withCredentials: true,
      });
      set({ authUser: res.data.user });
      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      console.log(
        "Error updating profile:",
        error?.response?.data || error.message
      );
      toast.error(error?.response?.data?.message || "Failed to update profile");
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  verifyEmail: async (code) => {
    try {
      const res = await axiosInstance.post("/auth/verify-email", { code });

      return res.data;
    } catch (error) {
      console.error("Verification failed:", error);
    }
  },
  changePassword: async ({ oldPassword, newPassword }) => {
    try {
      await axiosInstance.put(
        "/auth/change-password",
        { oldPassword, newPassword },
        { withCredentials: true }
      );
      toast.success("Password updated successfully!");
      return { success: true };
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to change password";
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    newSocket.connect();

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("profileUpdated", (updatedUser) => {
      const state = get();
  const { authUser, chattedUsers } = state;

  // Update your own profile if this is you
  if (authUser && authUser._id === updatedUser._id) {
    set({ authUser: { ...authUser, ...updatedUser } });
  }

  // Update chatted users
  if (chattedUsers && chattedUsers.length > 0) {
    const updatedChattedUsers = chattedUsers.map((u) =>
      u._id === updatedUser._id ? { ...u, ...updatedUser } : u
    );
    set({ chattedUsers: updatedChattedUsers });
    }});

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
  },
}));
