import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = ({ selectedUser }) => {
  const { setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

 const isOnline = onlineUsers.includes(selectedUser._id)

  return (
    <div className="p-3 border-b border-base-300 flex items-center justify-between">
      {/* Avatar + Info */}
      <div className="flex items-center gap-3">
        <div className="avatar relative">
          <div className="size-10 rounded-full">
            <img
              src={selectedUser.profilePic || "/profile.png"}
              alt={selectedUser.fullName}
              className="object-cover w-full h-full rounded-full"
            />
             {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
            )}
          </div>
        </div>

        <div>
          <h3 className="font-medium">{selectedUser.fullName}</h3>
          <p className="text-sm text-base-content/70">
             {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={() => {
          // Delay slightly to ensure abort happens first
          setTimeout(() => setSelectedUser(null), 50);
        }}
        className="btn btn-sm btn-ghost"
        title="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ChatHeader;
