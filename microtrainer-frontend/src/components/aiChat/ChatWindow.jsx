import { useEffect, useRef, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import MessageBubble from "./MessageBubble";

const NEAR_BOTTOM_THRESHOLD_PX = 80;

export default function ChatWindow({ messages, isLoadingMessages, error, onRetry, onEdit, onRegenerate }) {
  const scrollRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAutoScroll(distanceFromBottom < NEAR_BOTTOM_THRESHOLD_PX);
  };

  useEffect(() => {
    if (!autoScroll) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, autoScroll]);

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-3 sm:px-4"
    >
      <div className="max-w-3xl mx-auto py-4 space-y-5">
        {isLoadingMessages ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading conversation…</p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLastAssistant={message.id === lastAssistantId}
              onEdit={onEdit}
              onRegenerate={onRegenerate}
            />
          ))
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
