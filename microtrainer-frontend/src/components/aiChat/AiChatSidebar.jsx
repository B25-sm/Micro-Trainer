import { useState } from "react";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { formatHistoryTime } from "../../utils/chatHistoryStorage";

function ConversationRow({ conversation, isActive, onSelect, onRename, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.title);

  const commitRename = () => {
    const trimmed = draft.trim();
    setIsEditing(false);
    if (trimmed && trimmed !== conversation.title) {
      onRename(conversation.id, trimmed);
    } else {
      setDraft(conversation.title);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 px-2 py-1.5">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") {
              setDraft(conversation.title);
              setIsEditing(false);
            }
          }}
          className="flex-1 text-sm px-2 py-1 rounded-md border border-[#7c3aed] dark:border-[#a78bfa] bg-white dark:bg-[#2a2b2e] text-gray-900 dark:text-gray-100 focus:outline-none"
        />
        <button type="button" onClick={commitRename} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 rounded-md">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft(conversation.title);
            setIsEditing(false);
          }}
          className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`group rounded-lg ${
        isActive
          ? "bg-blue-50/80 dark:bg-blue-950/30"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
    >
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onSelect(conversation.id)} className="flex-1 text-left px-3 py-2.5 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{conversation.title}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {formatHistoryTime(conversation.updatedAt)}
            {conversation.preview ? ` · ${conversation.preview}` : ""}
          </p>
        </button>
        <div className="hidden group-hover:flex items-center pr-1 gap-0.5">
          <button
            type="button"
            title="Rename"
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={() => {
              if (window.confirm("Delete this conversation?")) onDelete(conversation.id);
            }}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AiChatSidebar({
  conversations,
  activeId,
  isLoading,
  searchQuery,
  onSearchChange,
  onSelect,
  onNew,
  onRename,
  onDelete,
  open,
  onClose,
}) {
  const panel = (
    <aside className="flex flex-col h-full bg-white dark:bg-[#292a2d] border-r border-gray-200 dark:border-gray-700">
      <div className="flex-shrink-0 px-3 py-3 border-b border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Chat</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onNew}
              title="New chat"
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-[#7c3aed] dark:bg-[#a78bfa] text-white dark:text-gray-900 hover:opacity-90"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search chats"
            className="w-full text-sm pl-8 pr-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#202124] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] dark:focus:border-[#a78bfa]"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1">
        {isLoading ? (
          <p className="text-xs text-gray-400 px-2 py-4">Loading…</p>
        ) : conversations.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 px-3 py-4 leading-relaxed">
            {searchQuery ? "No chats match your search." : "Your conversations will appear here."}
          </p>
        ) : (
          conversations.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeId}
              onSelect={(id) => {
                onSelect(id);
                onClose?.();
              }}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:flex w-64 flex-shrink-0 h-full">{panel}</div>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close sidebar" onClick={onClose} />
          <div className="relative w-[min(85%,20rem)] h-full shadow-2xl">{panel}</div>
        </div>
      )}
    </>
  );
}
