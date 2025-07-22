import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Smile } from "lucide-react";
import { useState } from "react";

const EmojiPicker = ({ onChange }) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="text-zinc-500 hover:text-zinc-800"
        onClick={() => setShowPicker((prev) => !prev)}
      >
        <Smile size={20} />
      </button>

      {showPicker && (
        <div className="absolute bottom-10 right-0 z-50">
          <Picker
            data={data}
            emojiSize={20}
            theme="light"
            maxFrequentRows={1}
            onEmojiSelect={(emoji) => {
              onChange(emoji.native);
              setShowPicker(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
