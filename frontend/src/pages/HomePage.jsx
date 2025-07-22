import { useChatStore } from "../store/useChatStore.js";
import SidebarNav from "../components/SidebarNav.jsx";
import SidebarChat from "../components/SidebarChat.jsx";
import { useLayoutStore } from "../store/useLayoutStore.js";
import ChatContainer from "../components/ChatContainer.jsx";
import NoChatSelected from "../components/NoChatSelected.jsx";
import ChatRequestPopup from "../components/ChatRequestPopup.jsx"; 


const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { isSidebarCollapsed } = useLayoutStore();

  return (
    <div className="h-screen flex bg-base-100 text-base-content transition-colors duration-300 overflow-hidden">
      {/* SidebarNav */}
      <SidebarNav />

      {/* Chat Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* SidebarChat */}
        <aside
          className={`transition-all duration-300 border-r border-base-300 overflow-y-auto ${
            isSidebarCollapsed ? "w-20" : "w-[280px]"
          }`}
        >
          <SidebarChat />
        </aside>

        {/* Chat content area */}
        <main className="flex-1 h-full overflow-hidden p-4 sm:p-4">
          <div className="h-full w-full bg-base-200/40 rounded-2xl shadow-lg flex flex-col">
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
          {/* ✅ ChatRequestPopup floats inside main */}
          <ChatRequestPopup />
        </main>
      </div>
    </div>
  );
};

export default HomePage;
