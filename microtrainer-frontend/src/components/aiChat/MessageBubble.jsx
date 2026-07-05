import { useState } from "react";
import { Check, Copy, Pencil, RotateCcw } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import TypingIndicator from "./TypingIndicator";
import AttachmentChips from "../attachments/AttachmentChips";
import { formatHistoryTime } from "../../utils/chatHistoryStorage";

function UsageBadge({ usage }) {
  if (!usage) return null;
  const total = usage.total_tokens ?? usage.totalTokens;
  if (!total) return null;
  return (
    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 inline-block">
      {total} tokens
    </span>
  );
}

export default function MessageBubble({ message, isLastAssistant, onEdit, onRegenerate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  const handleSaveEdit = () => {
    if (!draft.trim() || draft.trim() === message.content.trim()) {
      setIsEditing(false);
      return;
    }
    onEdit(message.id, draft.trim());
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex justify-end">
        <div className="w-full max-w-2xl">
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={Math.min(10, Math.max(2, draft.split("\n").length))}
            className="w-full rounded-xl border border-[#7c3aed] dark:border-[#a78bfa] bg-white dark:bg-[#2a2b2e] px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none resize-none"
          />
          <div className="flex justify-end gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => {
                setDraft(message.content);
                setIsEditing(false);
              }}
              className="text-xs px-2.5 py-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-[#7c3aed] dark:bg-[#a78bfa] text-white dark:text-gray-900 hover:opacity-90"
            >
              Save &amp; submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showTyping = message.role === "assistant" && message.streaming && !message.content.trim();

  return (
    <div className={`group flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-2xl w-full ${isUser ? "flex flex-col items-end" : ""}`}>
        {message.attachments?.length > 0 && (
          <AttachmentChips attachments={message.attachments} />
        )}
        {(!isUser || message.content) && (
        <div
          className={
            isUser
              ? "inline-block rounded-2xl bg-[#7c3aed] dark:bg-[#2a4a7f] text-white px-4 py-2.5 text-sm"
              : "text-gray-900 dark:text-gray-100"
          }
        >
          {showTyping ? (
            <TypingIndicator />
          ) : isUser ? (
            // Inline style, not a Tailwind class: this app's global `:where(p) { color: var(--text) }`
            // base rule lives outside any @layer, so it beats any layered utility class regardless
            // of specificity — only an inline style (or !important) can override it here.
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: "#fff" }}>
              {message.content}
            </p>
          ) : (
            <>
              <MarkdownRenderer content={message.content} />
              {message.streaming && (
                <span className="inline-block w-1.5 h-3.5 bg-gray-500 dark:bg-gray-300 align-middle animate-pulse ml-0.5" />
              )}
            </>
          )}
        </div>
        )}

        {message.errored && (
          <p className="text-xs text-red-500 mt-1">Failed to respond.</p>
        )}

        <div
          className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isUser ? "flex-row-reverse" : ""
          }`}
        >
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {formatHistoryTime(message.createdAt)}
          </span>
          <button
            type="button"
            title="Copy"
            onClick={handleCopy}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {isUser && (
            <button
              type="button"
              title="Edit"
              onClick={() => setIsEditing(true)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {!isUser && isLastAssistant && !message.streaming && (
            <button
              type="button"
              title="Regenerate"
              onClick={onRegenerate}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <UsageBadge usage={message.usage} />
      </div>
    </div>
  );
}
