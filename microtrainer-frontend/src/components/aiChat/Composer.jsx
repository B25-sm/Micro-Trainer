import { useEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import AttachButton from "../attachments/AttachButton";
import AttachmentChips from "../attachments/AttachmentChips";
import { useAttachments } from "../../hooks/useAttachments";

const MAX_HEIGHT_PX = 200;

export default function Composer({ onSend, onStop, isStreaming, showContinue, onContinue }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);
  const {
    attachments,
    error,
    setError,
    addAttachments,
    removeAttachment,
    clearAttachments,
  } = useAttachments();

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const canSend = (value.trim() || attachments.length) && !isStreaming;

  const handleSubmit = () => {
    if (!canSend) return;
    onSend(value.trim(), attachments);
    setValue("");
    clearAttachments();
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

      <div className="max-w-3xl mx-auto">
        {error && (
          <p className="text-xs text-red-500 px-1 pb-1.5">{error}</p>
        )}
        <div className="rounded-3xl border border-black/[0.08] dark:border-transparent bg-white dark:bg-[#242424] px-2 py-2 shadow-sm dark:shadow-none focus-within:border-black/20 dark:focus-within:border-white/10 transition-colors duration-200">
          {attachments.length > 0 && (
            <div className="pt-1">
              <AttachmentChips attachments={attachments} onRemove={removeAttachment} />
            </div>
          )}
          <div className="flex items-end gap-1.5">
            <AttachButton
              allowImages
              count={attachments.length}
              onAdd={addAttachments}
              onError={setError}
              disabled={isStreaming}
            />
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
                disabled={!canSend}
                title="Send"
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-950 dark:bg-[#ececec] text-white dark:text-gray-950 flex items-center justify-center hover:opacity-85 transition disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
