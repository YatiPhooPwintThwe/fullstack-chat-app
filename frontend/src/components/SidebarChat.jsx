import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { Users, Search, Trash2 } from "lucide-react";
import { axiosInstance } from "../lib/axios.js";
import { useLayoutStore } from "../store/useLayoutStore.js";
import { socket } from "../lib/socket.js";

const SidebarChat = ({ open = false, onClose }) => {
  const { chattedUsers, setSelectedUser, addChattedUser } = useChatStore();
  const { isSidebarCollapsed } = useLayoutStore();
  const { onlineUsers, authUser } = useAuthStore();

  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  const doSearch = async (query) => {
    setQ(query);
    if (!query) return setResults([]);
    try {
      const res = await axiosInstance.get(`/users/search?query=${encodeURIComponent(query)}`);
      setResults((res.data || []).filter((u) => u._id !== authUser?._id));
    } catch {
      setResults([]);
    }
  };

  const pickUser = async (user, closeAfter = false) => {
    await setSelectedUser(user);
    addChattedUser(user);
    setShowSearch(false);
    if (closeAfter) onClose?.();
  };

  const List = (
    <div className="overflow-y-auto flex-1 p-2">
      {chattedUsers.length === 0 && (
        <div className="text-center text-zinc-500 py-8">Start a conversation</div>
      )}
      {chattedUsers.map((u) => (
        <SidebarUserItem key={u._id} userId={u._id} onPick={(user) => pickUser(user, !!onClose)} />
      ))}
    </div>
  );

  const SearchOverlay = !showSearch ? null : (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-base-200 p-6 rounded-xl w-full max-w-sm shadow-lg relative">
        <input
          type="text"
          placeholder="Search usernames..."
          className="input input-bordered w-full mb-4"
          value={q}
          onChange={(e) => doSearch(e.target.value)}
        />
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {results.length === 0 && q ? (
            <div className="text-center text-zinc-500 py-6">
              <Search className="mx-auto mb-2" />
              <p className="text-sm">No matching users found</p>
            </div>
          ) : (
            results.map((user) => (
              <button
                key={user._id}
                onClick={() => pickUser(user, !!onClose)}
                className="flex items-center gap-3 p-2 hover:bg-base-300 rounded-lg"
              >
                <img
                  src={user.profilePic || "/profile.png"}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-medium">{user.fullName}</span>
              </button>
            ))
          )}
        </div>
        <button onClick={() => setShowSearch(false)} className="btn btn-outline w-full mt-4">
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop column (hidden on mobile) */}
      <aside
        className={`hidden md:flex h-full border-r border-base-300 transition-all duration-300 flex-col shrink-0 ${
          isSidebarCollapsed ? "w-[5.5rem]" : "w-72"
        }`}
      >
        <Header onOpenSearch={() => setShowSearch(true)} />
        {List}
        {SearchOverlay}
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-base-100 border-r border-base-300 flex flex-col">
            <Header onClose={onClose} onOpenSearch={() => setShowSearch(true)} />
            {List}
          </aside>
          {SearchOverlay}
        </div>
      )}
    </>
  );
};

function Header({ onOpenSearch, onClose }) {
  return (
    <div className="border-b border-base-300 p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Users className="size-5" />
        <span className="font-medium">Chats</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn btn-ghost btn-sm" onClick={onOpenSearch} title="Search">
          <Search className="h-4 w-4" />
        </button>
        {onClose && (
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        )}
      </div>
    </div>
  );
}

function SidebarUserItem({ userId, onPick }) {
  const { deleteChat } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/users/user/${userId}`);
        if (alive) setUser(res.data);
      } catch {}
    };
    load();
    const iv = setInterval(load, 5000);
    const onUpdated = (u) => {
      if (alive && u._id === userId) setUser((prev) => ({ ...prev, ...u }));
    };
    socket.on("profileUpdated", onUpdated);
    return () => {
      alive = false;
      clearInterval(iv);
      socket.off("profileUpdated", onUpdated);
    };
  }, [userId]);

  if (!user) return null;

  const online = onlineUsers.includes(user._id);

  return (
    <div className="group relative flex items-center justify-between p-3 rounded-lg hover:bg-base-300 transition-colors">
      <button onClick={() => onPick(user)} className="flex items-center gap-3 flex-1 text-left">
        <div className="relative">
          <img
            src={user.profilePic || "/profile.png"}
            alt={user.fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
          {online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
          )}
        </div>
        <div className="text-left min-w-0">
          <div className="font-medium truncate">{user.fullName}</div>
          <div className="text-sm text-zinc-400">{online ? "Online" : "Offline"}</div>
        </div>
      </button>

      <Trash2
        className="size-4 text-zinc-500 hover:text-red-500 cursor-pointer ml-2"
        title="Delete chat"
        onClick={(e) => {
          e.stopPropagation();
          deleteChat(user._id);
        }}
      />
    </div>
  );
}

export default SidebarChat;
