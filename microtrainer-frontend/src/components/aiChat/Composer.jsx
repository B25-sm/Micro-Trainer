import { useEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";

const MAX_HEIGHT_PX = 200;

export default function Composer({ onSend, onStop, isStreaming, showContinue, onContinue }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
      {showContinue && !isStreaming && (
        <div className="flex justify-center mb-2">
          <button
            type="button"
            onClick={onContinue}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Continue generating
          </button>
        </div>
      )}
      <div className="max-w-3xl mx-auto flex items-end gap-2 rounded-full border border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#2f2f2f] px-4 py-2 shadow-sm dark:shadow-none focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors duration-200">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Message AI Chat… (Shift+Enter for a new line)"
          className="flex-1 resize-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none py-1.5 max-h-[200px]"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            title="Stop generating"
            className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center hover:opacity-90"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim()}
            title="Send"
            className="flex-shrink-0 w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
