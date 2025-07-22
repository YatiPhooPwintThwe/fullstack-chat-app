import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";
import axios from "axios";

const LOCAL_KEY = "chattedUsers";

export const useChatStore = create((set, get) => ({
  messages: [],
  chattedUsers: JSON.parse(localStorage.getItem(LOCAL_KEY)) || [],
  selectedUser: null,
  isMessagesLoading: false,
  chatRequests: [],

  setChatRequests: (requests) => set({ chatRequests: requests }),

  setSelectedUser: async (user) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/users/${user._id}`);
      set({
        selectedUser: res.data,
        isMessagesLoading: false,
      });
    } catch (err) {
      console.error("Failed to fetch updated user", err);
      set({ selectedUser: user, isMessagesLoading: false });
    }
  },

  updateSelectedUser: (updatedUser) => {
    const { selectedUser } = get();
    if (selectedUser && selectedUser._id === updatedUser._id) {
      set({ selectedUser: { ...selectedUser, ...updatedUser } });
    }
  },
  addChattedUser: (user) => {
    const { chattedUsers } = get();
    const exists = chattedUsers.some((u) => u._id === user._id);

    const updated = exists
      ? chattedUsers.map((u) => (u._id === user._id ? { ...u, ...user } : u))
      : [...chattedUsers, user];

    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    set({ chattedUsers: updated });
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
      get().addChattedUser(selectedUser);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    const authUserId = useAuthStore.getState().authUser?._id;
    if (!socket || !authUserId) return;

    socket.off("newMessage");
    socket.off("updatedMessage");
    socket.off("chatRequest");
    socket.off("profileUpdated");

    socket.on("newMessage", async (newMessage) => {
      const {
        messages,
        selectedUser,
        chattedUsers,
        setSelectedUser,
        getMessages,
        addChattedUser,
      } = get();

      // If message not intended for current user, skip
      if (![newMessage.senderId, newMessage.receiverId].includes(authUserId))
        return;

      const isDuplicate = messages.some((msg) => msg._id === newMessage._id);
      if (isDuplicate) return;

      // If message is for current open chat
      if (
        selectedUser?._id === newMessage.senderId ||
        selectedUser?._id === newMessage.receiverId
      ) {
        set({ messages: [...messages, newMessage] });
        return;
      }

      // Message from a new/unselected sender
      // Message from a new/unselected sender
      const isSenderKnown = chattedUsers.some(
        (u) => u._id === newMessage.senderId
      );

      if (!isSenderKnown) {
        try {
          const res = await axiosInstance.get(`/users/${newMessage.senderId}`);
          const sender = res.data;

          addChattedUser(sender);
          toast.success(`${sender.fullName} sent you a message`);

          // Optional: auto open chat with them
          setSelectedUser(sender);
          await getMessages(sender._id);

          window.dispatchEvent(new Event("newChatRequest"));
        } catch (err) {
          console.error("❌ Failed to fetch sender info:", err);
        }
      } else {
        // Sender is known but not selected — just notify and don't switch chat
        const newUser = chattedUsers.find((u) => u._id === newMessage.senderId);
        toast.success(`${newUser.fullName} sent you a message`);
      }
    });

    socket.on("updatedMessage", (updatedMsg) => {
      const { messages } = get();
      set({
        messages: messages.map((msg) =>
          msg._id === updatedMsg._id ? updatedMsg : msg
        ),
      });
    });

    socket.on("chatRequest", async ({ senderId }) => {
      try {
        const res = await axiosInstance.get(`/users/${senderId}`);
        const sender = res.data;
        toast.success(`${sender.fullName} sent you a chat request`);

        // ✅ Update chatRequests list in Zustand store
        const { chatRequests, setChatRequests } = get();
        setChatRequests([...chatRequests, sender]);
      } catch (err) {
        console.error("❌ Failed to load chat request sender:", err);
      }
    });
    socket.on("profileUpdated", (updatedUser) => {
      const state = get();
      const { chattedUsers } = state;
      const { authUser } = useAuthStore.getState();

      get().updateSelectedUser(updatedUser);

      const updatedChattedUsers = chattedUsers.map((u) =>
        u._id === updatedUser._id ? { ...u, ...updatedUser } : u
      );
      set({ chattedUsers: updatedChattedUsers });

      if (authUser && authUser._id === updatedUser._id) {
        useAuthStore.setState({ authUser: { ...authUser, ...updatedUser } });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
    socket?.off("updatedMessage");
    socket?.off("chatRequest");
  },

  getMessages: async (userId, signal) => {
    try {
      const res = await axiosInstance.get(`/messages/${userId}`, { signal });
      set({ messages: res.data, isMessagesLoading: false });
    } catch (err) {
      if (
        axios.isCancel?.(err) ||
        err.name === "CanceledError" ||
        err.code === "ERR_CANCELED"
      ) {
        console.log("Message fetch cancelled.");
        return;
      }
      console.error("Fetch error:", err.message);
      toast.error("Failed to fetch messages");
      set({ isMessagesLoading: false });
    }
  },

  updateReaction: async (messageId, emoji) => {
    try {
      await axiosInstance.put(`/messages/${messageId}/reaction`, { emoji });
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reaction: emoji } : msg
        ),
      }));
    } catch {
      toast.error("Failed to react to message");
    }
  },

  updateMessage: async (messageId, text) => {
    try {
      const res = await axiosInstance.put(`/messages/${messageId}`, { text });
      set({
        messages: get().messages.map((msg) =>
          msg._id === messageId ? res.data : msg
        ),
      });
    } catch {
      toast.error("Failed to update message");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set({
        messages: get().messages.filter((msg) => msg._id !== messageId),
      });
    } catch {
      toast.error("Failed to delete message");
    }
  },

  deleteChat: async (userId) => {
    try {
      await axiosInstance.delete(`/messages/chat/${userId}`);
      const { chattedUsers, selectedUser } = get();
      const updated = chattedUsers.filter((u) => u._id !== userId);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));

      set({
        chattedUsers: updated,
        messages: [],
        selectedUser: selectedUser?._id === userId ? null : selectedUser,
      });
    } catch (err) {
      toast.error("Failed to delete chat");
    }
  },

  fetchChatRequests: async () => {
    try {
      const res = await axiosInstance.get("/messages/chat-requests");
      set({ chatRequests: res.data });
    } catch (err) {
      toast.error("Failed to fetch chat requests");
    }
  },

  acceptChatRequest: async (senderId) => {
    try {
      await axiosInstance.post(`/messages/accept-request/${senderId}`);
      await get().fetchChatRequests();

      const res = await axiosInstance.get(`/users/${senderId}`);
      get().addChattedUser(res.data);
      get().setSelectedUser(res.data);
      await get().getMessages(senderId);
    } catch (err) {
      toast.error("Failed to accept request");
    }
  },
}));
