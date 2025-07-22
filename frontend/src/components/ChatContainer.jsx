import { useChatStore } from "../store/useChatStore.js";
import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import useSound from "use-sound";
import ChatMessage from "./ChatMessage.jsx";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  const [playReceiveSound] = useSound("/sound/receive.mp3", { volume: 0.5 });

  useEffect(() => {
    if (!selectedUser || !selectedUser._id) return;

    const controller = new AbortController();
    getMessages(selectedUser._id, controller.signal);
    subscribeToMessages();

    const handleNewMessage = (newMessage) => {
      if (newMessage.senderId !== authUser._id) {
        playReceiveSound();
      }
    };

    window.addEventListener("newMessage", handleNewMessage);

    return () => {
      controller.abort();
      unsubscribeFromMessages();
      window.removeEventListener("newMessage", handleNewMessage);
    };
  }, [
    selectedUser,
    authUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    playReceiveSound,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader />
        <MessageSkeleton />
        {/* No wrapper around MessageInput */}
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden h-full pb-4">
      <ChatHeader />
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onClick={() => window.dispatchEvent(new Event("closeEmoji"))}
      >
        {messages.map((message, index) => (
          <div
            key={message._id}
            ref={index === messages.length - 1 ? messageEndRef : null}
          >
            <ChatMessage
              message={message}
              authUser={authUser}
              selectedUser={selectedUser}
              onReply={setReplyingTo}
              onEdit={setEditingMessage}
            />
          </div>
        ))}
      </div>

      {/* ✅ Removed border/bg wrapper */}
      <MessageInput
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}
      />
    </div>
  );
};

export default ChatContainer;
