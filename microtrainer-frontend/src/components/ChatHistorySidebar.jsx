import { useState } from "react";
import { formatHistoryTime, listUserQuestions } from "../utils/chatHistoryStorage";

export default function ChatHistorySidebar({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onSelectQuestion,
  onNewChat,
  onDeleteSession,
  title = "Chat history",
  emptyHint = "Questions you ask will appear here so you can reopen them anytime.",
  className = "",
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const panel = (
    <aside
      className={`flex flex-col h-full min-h-0 bg-white dark:bg-[#292a2d] border-r border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {sessions.length} saved
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onNewChat?.();
            setMobileOpen(false);
          }}
          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          New
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1">
        {sessions.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-4 leading-relaxed">
            {emptyHint}
          </p>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const expanded = expandedId === session.id;
            const userQuestions = listUserQuestions(session.messages);

            return (
              <div
                key={session.id}
                className={`rounded-lg border transition-colors ${
                  isActive
                    ? "border-blue-300 dark:border-blue-700 bg-blue-50/80 dark:bg-blue-950/30"
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                <div className="flex items-start gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSession?.(session);
                      setMobileOpen(false);
                    }}
                    className="flex-1 text-left px-3 py-2.5 min-w-0"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
                      {session.title}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      {formatHistoryTime(session.updatedAt)}
                      {userQuestions.length > 1
                        ? ` · ${userQuestions.length} questions`
                        : ""}
                    </p>
                  </button>
                  <div className="flex flex-col py-1 pr-1 gap-0.5">
                    {userQuestions.length > 1 && (
                      <button
                        type="button"
                        title={expanded ? "Collapse" : "Show questions"}
                        onClick={() =>
                          setExpandedId(expanded ? null : session.id)
                        }
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "Delete this conversation from history?"
                          )
                        ) {
                          onDeleteSession?.(session.id);
                        }
                      }}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {expanded && userQuestions.length > 1 && (
                  <ul className="px-2 pb-2 space-y-0.5 border-t border-gray-200/80 dark:border-gray-700/80 mt-1 pt-1">
                    {userQuestions.map((q) => (
                      <li key={q.index}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectQuestion?.(session, q.index);
                            setMobileOpen(false);
                          }}
                          className="w-full text-left text-xs px-2 py-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 line-clamp-2"
                        >
                          {q.content.trim()}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-24 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#292a2d] shadow-md text-sm font-semibold text-gray-800 dark:text-gray-100"
        aria-label="Open past questions"
      >
        <span className="text-xs font-bold text-[#1a73e8] dark:text-[#8ab4f8]">MT</span>
        Past questions
        {sessions.length > 0 && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-1.5 py-0.5 rounded-full">
            {sessions.length}
          </span>
        )}
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-72 flex-shrink-0 min-h-0">{panel}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close history"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-[min(100%,20rem)] h-full shadow-xl">{panel}</div>
        </div>
      )}
    </>
  );
}
