import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore.js";

import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import useSound from "use-sound";

const MessageInput = ({
  replyingTo,
  setReplyingTo,
  editingMessage,
  setEditingMessage,
}) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const { sendMessage, updateMessage } = useChatStore();
  const [playSendSound] = useSound("/sound/sentSound.mp3", { volume: 0.5 });

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
    }
  }, [editingMessage]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      if (editingMessage) {
        await updateMessage(editingMessage._id, text.trim());
        setEditingMessage(null);
      } else {
        await sendMessage({
          text: text.trim(),
          image: imagePreview,
          replyTo: replyingTo?._id || null,
        });
        playSendSound();
      }
      setText("");
      removeImage();
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        !e.target.closest(".emoji-btn")
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      {replyingTo && (
        <div className="flex items-center justify-between px-4 pt-1 pb-2 border-l-4 border-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-t-md">
          <div className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
            <span className="font-semibold">
              {replyingTo.senderName || "You"}
            </span>{" "}
            replied to:{" "}
            <span className="italic truncate">{replyingTo.text}</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-xs text-zinc-500 hover:text-red-500 ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {editingMessage && (
        <div className="px-4 py-2 bg-yellow-100 rounded-t-xl flex justify-between items-center">
          <div className="text-sm text-yellow-800">
            Editing: <span className="font-medium">{editingMessage.text}</span>
          </div>
          <button
            onClick={() => {
              setEditingMessage(null);
              setText("");
            }}
            className="text-red-500 text-xs px-2"
          >
            Cancel
          </button>
        </div>
      )}

      {imagePreview && (
        <div className="mb-2 px-4">
          <div className="relative w-fit">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-base-300"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 px-2 py-1 bg-transparent"
      >
        <input
          type="text"
          className="w-full input input-bordered input-sm sm:input-md bg-base-200 text-base-content"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`hidden sm:flex btn btn-circle ${
            imagePreview ? "text-emerald-500" : "text-zinc-400"
          }`}
        >
          <Image size={20} />
        </button>

        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="btn btn-circle text-zinc-400 emoji-btn"
        >
          <Smile size={20} />
        </button>

        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={20} />
        </button>

        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="emoji-picker-wrapper absolute bottom-20 right-4 z-50"
          >
            <Picker
              data={data}
              onEmojiSelect={(emoji) => setText((prev) => prev + emoji.native)}
              theme="light"
            />
          </div>
        )}
      </form>
    </>
  );
};

export default MessageInput;
