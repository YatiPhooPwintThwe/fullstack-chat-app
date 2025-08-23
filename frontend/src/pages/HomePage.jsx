import { useState } from "react";
import { useChatStore } from "../store/useChatStore.js";
import SidebarNav from "../components/SidebarNav.jsx";
import SidebarChat from "../components/SidebarChat.jsx";
import { useLayoutStore } from "../store/useLayoutStore.js";
import ChatContainer from "../components/ChatContainer.jsx";
import NoChatSelected from "../components/NoChatSelected.jsx";
import ChatRequestPopup from "../components/ChatRequestPopup.jsx";
import { MessageSquare, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { isSidebarCollapsed } = useLayoutStore();
  const [mobileChatsOpen, setMobileChatsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-base-100 text-base-content overflow-hidden">
      {/* -------- Desktop / Tablet -------- */}
      <div className="hidden md:flex h-full">
        {/* Left nav */}
        <SidebarNav />

        {/* Chat layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat list column */}
          <aside
            className={`transition-all duration-300 border-r border-base-300 overflow-y-auto ${
              isSidebarCollapsed ? "w-20" : "w-[280px]"
            }`}
          >
            <SidebarChat />
          </aside>

          {/* Chat content */}
          <main className="flex-1 h-full overflow-hidden p-4">
            <div className="h-full w-full bg-base-200/40 rounded-2xl shadow-lg flex flex-col">
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
            <ChatRequestPopup />
          </main>
        </div>
      </div>

      {/* -------- Mobile -------- */}
      <div className="md:hidden relative h-full pb-16">
        <div className="h-full w-full">
          {/* Show chat if selected, else empty state */}
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </div>

        {/* Bottom bar */}
        <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-white h-14 pb-[env(safe-area-inset-bottom)]">
          <div className="h-full grid grid-cols-3">
            <BarBtn onClick={() => setMobileChatsOpen(true)} icon={MessageSquare} label="Chats" />
            <BarBtn onClick={() => navigate("/profile")} icon={User} label="Profile" />
            <BarBtn onClick={() => navigate("/settings")} icon={Settings} label="Settings" />
          </div>
        </nav>

        {/* Chat drawer */}
        <SidebarChat open={mobileChatsOpen} onClose={() => setMobileChatsOpen(false)} />
      </div>
    </div>
  );
};

function BarBtn({ onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center text-xs text-gray-700"
    >
      <Icon className="h-5 w-5" />
      <span className="mt-0.5">{label}</span>
    </button>
  );
}

export default HomePage;
