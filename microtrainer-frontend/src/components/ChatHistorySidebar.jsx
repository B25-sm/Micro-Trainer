import { useState } from "react";
import { ChevronDown, MessageSquareText, Plus, Trash2, X } from "lucide-react";
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
  docked = false,
  open: controlledOpen,
  onOpenChange,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const mobileOpen = controlledOpen ?? internalOpen;
  const setMobileOpen = onOpenChange ?? setInternalOpen;
  const [expandedId, setExpandedId] = useState(null);

  const close = () => setMobileOpen(false);

  const panel = (
    <aside
      className={`flex h-full max-h-full min-h-0 flex-col border-r border-gray-200/80 bg-white dark:border-white/10 dark:bg-[#1f1f1f] ${className} ${
        docked ? "" : "shadow-xl"
      }`}
    >
      <header className="shrink-0 border-b border-gray-200/80 px-5 py-5 dark:border-white/10">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {sessions.length} saved {sessions.length === 1 ? "conversation" : "conversations"}
            </p>
          </div>
          {!docked && (
            <button
              type="button"
              onClick={close}
              className="-mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
              aria-label="Close history"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            onNewChat?.();
            close();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7c3aed] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6d28d9] dark:bg-[#a78bfa] dark:text-gray-950 dark:hover:bg-[#b7a3fb]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          New question
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-gray-500">
              <MessageSquareText className="h-5 w-5" />
            </span>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{emptyHint}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const expanded = expandedId === session.id;
              const userQuestions = listUserQuestions(session.messages);

              return (
                <div
                  key={session.id}
                  className={`group overflow-hidden rounded-xl transition-colors ${
                    isActive
                      ? "bg-violet-50 ring-1 ring-violet-200 dark:bg-[#2f2940] dark:ring-violet-400/25"
                      : "hover:bg-gray-100/80 dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-1 px-1.5 py-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSession?.(session);
                        close();
                      }}
                      className="min-w-0 flex-1 rounded-lg px-2 py-1.5 text-left"
                    >
                      <p className="truncate text-[13px] font-medium text-gray-800 dark:text-gray-100">
                        {session.title}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-gray-500 dark:text-gray-400">
                        {formatHistoryTime(session.updatedAt)}
                        {userQuestions.length > 1 ? ` · ${userQuestions.length} questions` : ""}
                      </p>
                    </button>

                    {userQuestions.length > 1 && (
                      <button
                        type="button"
                        title={expanded ? "Hide questions" : "Show questions"}
                        aria-label={expanded ? "Hide questions" : "Show questions"}
                        onClick={() => setExpandedId(expanded ? null : session.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}

                    <button
                      type="button"
                      title="Delete conversation"
                      aria-label={`Delete ${session.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (window.confirm("Delete this conversation from history?")) {
                          onDeleteSession?.(session.id);
                        }
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 opacity-60 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus:opacity-100 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {expanded && userQuestions.length > 1 && (
                    <ul className="mx-3 mb-2 border-l border-gray-200 pl-2 dark:border-white/10">
                      {userQuestions.map((question, index) => (
                        <li key={question.index}>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectQuestion?.(session, question.index);
                              close();
                            }}
                            className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-gray-600 transition hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-gray-100"
                          >
                            <span className="mt-px text-[10px] text-gray-400">{index + 1}</span>
                            <span className="line-clamp-2 leading-relaxed">
                              {question.content.trim()}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {docked && (
        <div className="sticky top-0 ml-1 hidden max-h-[min(70vh,28rem)] min-h-0 w-60 shrink-0 self-start overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 lg:flex">
          {panel}
        </div>
      )}

      {!docked && sessions.length > 0 && !mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-20 left-4 z-30 text-xs text-gray-500 underline-offset-2 transition hover:text-[#7c3aed] hover:underline dark:text-gray-400 dark:hover:text-[#a78bfa] lg:bottom-[4.5rem] lg:left-auto lg:right-6"
          aria-label="Open question history"
        >
          Past questions ({sessions.length})
        </button>
      )}

      {!docked && mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            aria-label="Close history"
            onClick={close}
          />
          <div className="relative h-full w-[min(100%,21rem)] lg:max-h-screen lg:shadow-2xl">
            {panel}
          </div>
        </div>
      )}
    </>
  );
}
