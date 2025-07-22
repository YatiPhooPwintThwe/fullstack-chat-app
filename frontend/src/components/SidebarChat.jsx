import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { Users, ChevronLeft, ChevronRight, Search, Trash2 } from "lucide-react";
import { axiosInstance } from "../lib/axios.js";
import { useLayoutStore } from "../store/useLayoutStore.js";
import { socket } from "../lib/socket.js";

const SidebarChat = () => {
  const { chattedUsers, setSelectedUser, addChattedUser } =
    useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const { isSidebarCollapsed, toggleSidebar } = useLayoutStore();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) return setSearchResults([]);

    try {
      const res = await axiosInstance.get(`/users/search?query=${query}`);
      const filteredResults = res.data.filter(
        (user) => user._id !== authUser._id
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Search error", error);
    }
  };

  const handleUserClick = async (user) => {
    await setSelectedUser(user);
    addChattedUser(user);
    setShowSearch(false);
  };

  return (
    <aside
      className={`h-full border-r border-base-300 transition-all duration-300 flex flex-col shrink-0 ${
        isSidebarCollapsed ? "w-[5.5rem]" : "w-72"
      }`}
    >
      {/* Header */}
      <div className="border-b border-base-300 p-4 flex items-center justify-between">
        {!isSidebarCollapsed ? (
          <>
            <div className="flex items-center gap-2">
              <Users className="size-6" />
              <span className="font-medium">Chats</span>
            </div>
            <div className="flex items-center gap-2">
              <Search
                className="size-5 cursor-pointer"
                onClick={() => setShowSearch(true)}
                title="Search"
              />
              <ChevronLeft
                className="size-5 cursor-pointer"
                onClick={toggleSidebar}
                title="Collapse"
              />
            </div>
          </>
        ) : (
          <ChevronRight
            className="size-5 cursor-pointer mx-auto"
            onClick={toggleSidebar}
            title="Expand"
          />
        )}
      </div>

      {/* Chatted Users List */}
      <div className="overflow-y-auto flex-1 p-2">
        {chattedUsers.map((user) => (
          <SidebarUserItem key={user._id} user={user} />
        ))}

        {chattedUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            🔍 username to chat!
          </div>
        )}
      </div>

      {/* Search overlay */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-base-200 p-6 rounded-xl w-full max-w-sm shadow-lg relative">
            <input
              type="text"
              placeholder="Search usernames..."
              className="input input-bordered w-full mb-4"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {searchResults.length === 0 && searchQuery ? (
                <div className="text-center text-zinc-500 py-6">
                  <Search className="mx-auto mb-2" />
                  <p className="text-sm">No matching users found</p>
                </div>
              ) : (
                searchResults.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleUserClick(user)}
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
            <button
              onClick={() => setShowSearch(false)}
              className="btn btn-outline w-full mt-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

const SidebarUserItem = ({ user }) => {
  const { selectedUser, setSelectedUser, addChattedUser, deleteChat } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const { isSidebarCollapsed } = useLayoutStore();

  const [freshUser, setFreshUser] = useState(user);

  useEffect(() => {
    const fetchFreshUser = async () => {
      try {
        const res = await axiosInstance.get(`/users/user/${user._id}`);
        setFreshUser(res.data);
      } catch (err) {
        console.error("Failed to refresh user:", err);
      }
    };

    fetchFreshUser(); // initial
    const interval = setInterval(fetchFreshUser, 5000); // every 5s

    return () => clearInterval(interval);
  }, [user._id]);

  useEffect(() => {
    const handleProfileUpdated = (updatedUser) => {
      if (updatedUser._id === freshUser._id) {
        setFreshUser((prev) => ({ ...prev, ...updatedUser }));
      }
    };

    socket.on("profileUpdated", handleProfileUpdated);
    return () => socket.off("profileUpdated", handleProfileUpdated);
  }, [freshUser._id]);

  return (
    <div
      className={`group relative flex items-center justify-between p-3 rounded-lg hover:bg-base-300 transition-colors ${
        selectedUser?._id === freshUser._id
          ? "bg-base-300 ring-1 ring-base-300"
          : ""
      }`}
    >
      <button
        onClick={() => {
          setSelectedUser(freshUser);
          addChattedUser(freshUser);
        }}
        className="flex items-center gap-3 flex-1 text-left"
      >
        <div className="relative">
          <img
            src={freshUser.profilePic || "/profile.png"}
            alt={freshUser.fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
          {onlineUsers.includes(freshUser._id) && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
          )}
        </div>

        {!isSidebarCollapsed && (
          <div className="text-left min-w-0">
            <div className="font-medium truncate">{freshUser.fullName}</div>
            <div className="text-sm text-zinc-400">
              {onlineUsers.includes(freshUser._id) ? "Online" : "Offline"}
            </div>
          </div>
        )}
      </button>

      {!isSidebarCollapsed && (
        <Trash2
          className="size-4 text-zinc-500 hover:text-red-500 cursor-pointer ml-2"
          title="Delete chat"
          onClick={(e) => {
            e.stopPropagation();
            deleteChat(freshUser._id);
          }}
        />
      )}
    </div>
  );
};

export default SidebarChat;
