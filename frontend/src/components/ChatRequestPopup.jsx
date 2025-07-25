import { useEffect, useState } from "react";

const NewMessagePopup = ({ sender, onClose }) => {
  if (!sender) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[300px] bg-white dark:bg-zinc-900 shadow-xl rounded-lg p-4 space-y-3 border border-base-300">
      <div className="font-semibold text-zinc-800 dark:text-white">New Message</div>
      <div className="flex items-center gap-2">
        <img
          src={sender.profilePic || "/profile.png"}
          alt={sender.fullName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="text-sm text-zinc-800 dark:text-white">{sender.fullName} sent you a message</span>
      </div>
      <button
        onClick={onClose}
        className="btn btn-xs btn-outline w-full"
      >
        Close
      </button>
    </div>
  );
};

export default NewMessagePopup;
