import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { formatMessageTime } from "../lib/utils.js";
import { socket } from "../lib/socket.js";
import { axiosInstance } from "../lib/axios.js";

const ChatMessage = ({ message, authUser, selectedUser, onReply, onEdit }) => {
  const { updateReaction, deleteMessage } = useChatStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [freshUser, setFreshUser] = useState(selectedUser); // ✅ use freshUser
  const settingsRef = useRef(null);

  const isSender = message.senderId === authUser._id;

  useEffect(() => {
    setFreshUser(selectedUser);
  }, [selectedUser]);

  useEffect(() => {
    const fetchFreshUser = async () => {
      try {
        const res = await axiosInstance.get(`/users/user/${selectedUser._id}`);
        setFreshUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchFreshUser();
    const interval = setInterval(fetchFreshUser, 5000);
    return () => clearInterval(interval);
  }, [selectedUser._id]);

  useEffect(() => {
    const handleProfileUpdated = (updatedUser) => {
      if (updatedUser._id === selectedUser._id) {
        setFreshUser((prev) => ({
          ...prev,
          ...updatedUser,
        }));
      }
    };

    socket.on("profileUpdated", handleProfileUpdated);
    return () => socket.off("profileUpdated", handleProfileUpdated);
  }, [selectedUser._id]);

  const handleEmojiReact = (emoji) => {
    updateReaction(message._id, emoji);
    setShowEmojiPicker(false);
  };

  const handleEdit = () => {
    onEdit?.(message);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (confirm("Delete this message?")) {
      deleteMessage(message._id);
    }
    setShowMenu(false);
  };

  const handleReply = () => {
    onReply?.(message);
    setShowEmojiPicker(false);
    setShowMenu(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
    setShowMenu(false);
  };

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className={`flex items-end mb-4 ${isSender ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-end gap-2 ${isSender ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img
            src={
              isSender
                ? authUser.profilePic || "/profile.png"
                : freshUser?.profilePic || "/profile.png"
            }
            alt={isSender ? "sender" : "receiver"}
          />
        </div>

        <div className={`group flex items-center ${isSender ? "flex-row-reverse" : "flex-row"}`}>
          <div className="flex flex-col relative">
            <div className="text-center text-xs text-zinc-500 mb-1">
              {formatMessageTime(message.createdAt)}
            </div>

            {message.replyTo && (
              <div className="mb-1 px-3 py-2 bg-zinc-100 text-zinc-600 text-sm rounded-xl border-l-4 border-blue-400 max-w-[200px]">
                {message.replyTo.image && (
                  <img
                    src={message.replyTo.image}
                    alt="Replied"
                    className="rounded-md max-h-[100px] mb-1"
                  />
                )}
                {message.replyTo.text && <div>{message.replyTo.text}</div>}
              </div>
            )}

            <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl whitespace-pre-line break-words w-fit max-w-xs">
              {message.text}
              {message.edited && <span className="text-xs ml-1">(edited)</span>}
              {message.image && (
                <img
                  src={message.image}
                  alt="sent"
                  className="mt-2 rounded-lg max-w-[200px]"
                />
              )}
            </div>

            {message.reaction && (
              <div className="-mt-1 ml-2 w-fit bg-gray-100 px-2 py-1 rounded-full shadow text-base">
                {message.reaction}
              </div>
            )}

            {showEmojiPicker && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20">
                <div className="flex gap-2 px-2 py-1 bg-white rounded-full shadow-md w-fit">
                  {["❤️", "😂", "👍", "😢", "😡"].map((emoji) => (
                    <button
                      key={emoji}
                      className="text-md hover:scale-110 transition-transform"
                      onClick={() => handleEmojiReact(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="relative flex gap-2 ml-2">
            <div className="hidden group-hover:flex items-center gap-2 z-10 mt-3">
              {isSender && (
                <>
                  <button onClick={toggleMenu} title="More">⋮</button>
                  {showMenu && (
                    <div
                      ref={settingsRef}
                      className="absolute top-1/2 -translate-y-1/2 right-full mr-2 bg-white border shadow rounded-lg text-sm z-30 min-w-[120px]"
                    >
                      <button
                        className="flex justify-between items-center w-full px-4 py-2 hover:bg-gray-100 border-b"
                        onClick={handleEdit}
                      >
                        <span>Edit</span>
                        <span className="text-gray-600 text-lg">✏️</span>
                      </button>
                      <button
                        className="flex justify-between items-center w-full px-4 py-2 hover:bg-gray-100"
                        onClick={handleDelete}
                      >
                        <span>Delete</span>
                        <span className="text-red-500 text-lg">🗑️</span>
                      </button>
                    </div>
                  )}
                </>
              )}
              <button onClick={toggleEmojiPicker} title="React">😊</button>
              <button onClick={handleReply} title="Reply">↩️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
