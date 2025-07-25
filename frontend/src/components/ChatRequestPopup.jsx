import { useChatStore } from "../store/useChatStore.js";
import { useEffect, useState } from "react";

const ChatRequestPopup = () => {
  const { chatRequests, fetchChatRequests, acceptChatRequest } = useChatStore();
  const [visible, setVisible] = useState(true);

  // ✅ Listen to window event
  useEffect(() => {
    fetchChatRequests(); // on first load

    const handleNewRequest = () => {
      fetchChatRequests();
      setVisible(true); // show popup
    };

    window.addEventListener("newChatRequest", handleNewRequest);
    return () => window.removeEventListener("newChatRequest", handleNewRequest);
  }, []);

  if (!chatRequests.length || !visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[300px] bg-white dark:bg-zinc-900 shadow-xl rounded-lg p-4 space-y-3 border border-base-300">
      <div className="font-semibold text-zinc-800 dark:text-white">Chat Requests</div>
      {chatRequests.map((req) => (
        <div key={req._id} className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src={req.profilePic || "/profile.png"}
              alt={req.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-sm text-zinc-800 dark:text-white">{req.fullName}</span>
          </div>
          <button
            onClick={() => {
              acceptChatRequest(req._id);
              setVisible(false);
            }}
            className="btn btn-xs btn-success"
          >
            Accept
          </button>
        </div>
      ))}

      <button
        onClick={() => setVisible(false)}
        className="btn btn-xs btn-outline w-full"
      >
        Close
      </button>
    </div>
  );
};

export default ChatRequestPopup;
