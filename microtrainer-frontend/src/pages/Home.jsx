import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { chatWithMicroTrainer } from "../api";
import { pageShell, textMuted, card } from "../lib/ui";
import { createLessonMarkdownComponents } from "../utils/lessonMarkdown";
import ChatHistorySidebar from "../components/ChatHistorySidebar";
import { useChatHistoryPersistence } from "../hooks/useChatHistoryPersistence";
import MicroTrainerMark from "../components/brand/MicroTrainerMark";

const chatMdComponents = createLessonMarkdownComponents();
const HOME_CHAT_STORAGE = "microtrainer-chat-history-home";

const STARTER_CARDS = [
  {
    tag: "Concept",
    title: "React hooks",
    prompt: "Explain React hooks with a real-world example",
    accent: "border-l-[#1a73e8] dark:border-l-[#8ab4f8]",
  },
  {
    tag: "Interview",
    title: "MERN prep",
    prompt: "What MERN stack questions come up in interviews?",
    accent: "border-l-amber-500",
  },
  {
    tag: "SQL",
    title: "JOINs",
    prompt: "How do SQL JOINs work? Show me with a query",
    accent: "border-l-emerald-500",
  },
  {
    tag: "Code",
    title: "Two pointers",
    prompt: "Walk me through solving a two-pointer problem",
    accent: "border-l-violet-500",
  },
  {
    tag: "JavaScript",
    title: "let vs const",
    prompt: "What's the difference between let, const, and var?",
    accent: "border-l-sky-500",
  },
  {
    tag: "Interview",
    title: "Java OOP",
    prompt: "Help me prepare for a Java OOP interview",
    accent: "border-l-orange-500",
  },
];

const QUICK_ACTIONS = [
  {
    label: "Mock interview",
    desc: "Timed Q&A with feedback",
    path: "/interview",
    accent: "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20",
    glyph: "🎙",
  },
  {
    label: "Communication",
    desc: "How you say it",
    path: "/communication",
    accent: "bg-teal-500/10 text-teal-700 dark:text-teal-300 ring-teal-500/20",
    glyph: "💬",
  },
  {
    label: "Guided course",
    desc: "Step-by-step paths",
    path: "/learn",
    accent: "bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-blue-500/20",
    glyph: "📘",
  },
  {
    label: "Code practice",
    desc: "Problems & run code",
    path: "/problems",
    accent: "bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-violet-500/20",
    glyph: "⌨",
  },
  {
    label: "My progress",
    desc: "Scores & streaks",
    path: "/dashboard",
    accent: "bg-slate-500/10 text-slate-700 dark:text-slate-300 ring-slate-500/20",
    glyph: "📊",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const chatEndRef = useRef(null);
  const messageRefs = useRef({});
  const inputRef = useRef(null);

  const {
    sessions,
    activeSessionId,
    persistConversation,
    beginNewSession,
    selectSession,
    removeSession,
  } = useChatHistoryPersistence(HOME_CHAT_STORAGE);

  const isChatting = chatHistory.length > 0;
  const showHistorySidebar = sessions.length > 0 || isChatting;

  useEffect(() => {
    if (chatHistory.length > 0) {
      persistConversation({ messages: chatHistory, sessionId });
    }
  }, [chatHistory, sessionId, persistConversation]);

  useEffect(() => {
    if (!isChatting) {
      inputRef.current?.focus();
    }
  }, [isChatting]);

  useEffect(() => {
    if (highlightedIndex == null) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, highlightedIndex]);

  const sendMessage = async (rawText) => {
    const userQuestion = rawText.trim();
    if (!userQuestion || isLoading) return;

    setQuestion("");

    setChatHistory((prev) => [
      ...prev,
      {
        role: "user",
        content: userQuestion,
        timestamp: new Date().toISOString(),
      },
    ]);

    setIsLoading(true);

    try {
      const response = await chatWithMicroTrainer({
        question: userQuestion,
        sessionId: sessionId,
      });

      if (response.data.sessionId && !sessionId) {
        setSessionId(response.data.sessionId);
      }

      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.answer,
          timestamp: response.data.timestamp,
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong. Please try again.";

      setChatHistory((prev) => [
        ...prev,
        {
          role: "error",
          content: errorMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e, promptOverride) => {
    e?.preventDefault();
    sendMessage(promptOverride ?? question);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startNewChat = () => {
    beginNewSession();
    setChatHistory([]);
    setSessionId(null);
    setQuestion("");
    setHighlightedIndex(null);
  };

  const handleSelectSession = (session) => {
    selectSession(session.id);
    setChatHistory(session.messages || []);
    setSessionId(session.sessionId ?? null);
    setHighlightedIndex(null);
  };

  const handleSelectQuestion = (session, messageIndex) => {
    handleSelectSession(session);
    setTimeout(() => {
      messageRefs.current[messageIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setHighlightedIndex(messageIndex);
    }, 150);
  };

  const handleDeleteSession = (id) => {
    removeSession(id);
    if (activeSessionId === id) {
      setChatHistory([]);
      setSessionId(null);
      setHighlightedIndex(null);
    }
  };

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${pageShell}`}>
      <div className="flex flex-1 min-h-0 w-full max-w-6xl mx-auto">
        {showHistorySidebar && (
          <ChatHistorySidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onSelectQuestion={handleSelectQuestion}
            onNewChat={startNewChat}
            onDeleteSession={handleDeleteSession}
            title="Past questions"
            emptyHint="Your practice questions are saved here — reopen any session anytime."
          />
        )}

        <main className="flex-1 flex flex-col min-h-0 min-w-0">
          {isChatting ? (
            <ActiveChatView
              chatHistory={chatHistory}
              highlightedIndex={highlightedIndex}
              messageRefs={messageRefs}
              chatEndRef={chatEndRef}
              question={question}
              setQuestion={setQuestion}
              isLoading={isLoading}
              inputRef={inputRef}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              onNewChat={startNewChat}
            />
          ) : (
            <WelcomeView
              question={question}
              setQuestion={setQuestion}
              isLoading={isLoading}
              inputRef={inputRef}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              onStarterClick={(text) => handleSubmit(null, text)}
              onNavigate={navigate}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;

/* ================= WELCOME (EMPTY STATE) ================= */

function WelcomeView({
  question,
  setQuestion,
  isLoading,
  inputRef,
  onSubmit,
  onKeyDown,
  onStarterClick,
  onNavigate,
}) {
  return (
    <div className="home-practice-bg flex-1 flex flex-col min-h-0 overflow-y-auto">
      <div className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-12 px-4 sm:px-8 py-8 lg:py-12 max-w-5xl mx-auto w-full">
        {/* Hero — left-aligned, training-batch voice */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="lg:w-[42%] flex flex-col justify-center"
        >
          <MicroTrainerMark size="lg" className="mb-5" />
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1a73e8] dark:text-[#8ab4f8] mb-2">
            Practice desk
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-semibold text-gray-900 dark:text-gray-100 leading-tight tracking-tight">
            Ask. Practice. Get coached.
          </h1>
          <p className={`${textMuted} mt-3 text-base leading-relaxed`}>
            Built for technical training batches — concepts, interviews, and code in one place.
            Type a question below or pick a starter card.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1a73e8] dark:bg-[#8ab4f8]" />
              Answers adapt to your level
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Saved in your question history
            </li>
          </ul>
        </motion.div>

        {/* Interaction column */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex-1 flex flex-col gap-5 min-w-0"
        >
          <HomeChatInput
            question={question}
            setQuestion={setQuestion}
            isLoading={isLoading}
            inputRef={inputRef}
            onSubmit={onSubmit}
            onKeyDown={onKeyDown}
            placeholder="What do you want to practice today?"
            size="large"
            className="w-full"
          />

          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
              Quick starts
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STARTER_CARDS.map((item) => (
                <button
                  key={item.prompt}
                  type="button"
                  disabled={isLoading}
                  onClick={() => onStarterClick(item.prompt)}
                  className={`${card} border-l-4 ${item.accent} text-left px-3.5 py-3 hover:shadow-md transition disabled:opacity-50 group`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {item.tag}
                  </span>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5 group-hover:text-[#1a73e8] dark:group-hover:text-[#8ab4f8] transition-colors">
                    {item.title}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
              Dedicated spaces
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.path}
                  type="button"
                  onClick={() => onNavigate(action.path)}
                  className={`rounded-xl px-3 py-3 text-left ring-1 ring-inset transition hover:scale-[1.02] active:scale-[0.98] ${action.accent}`}
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {action.glyph}
                  </span>
                  <p className="text-xs font-semibold mt-2 leading-tight">{action.label}</p>
                  <p className="text-[10px] opacity-75 mt-0.5 leading-snug hidden sm:block">
                    {action.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            MicroTrainer coaches like a trainer, not a search engine — verify critical facts before interviews.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ================= ACTIVE CHAT ================= */

function ActiveChatView({
  chatHistory,
  highlightedIndex,
  messageRefs,
  chatEndRef,
  question,
  setQuestion,
  isLoading,
  inputRef,
  onSubmit,
  onKeyDown,
  onNewChat,
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0 home-practice-bg">
      <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-gray-200/80 dark:border-gray-800 bg-white/70 dark:bg-[#202124]/70 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <MicroTrainerMark size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
              Practice desk
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Live coaching session</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNewChat}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition shrink-0"
        >
          New topic
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence>
            {chatHistory.map((message, index) => (
              <motion.div
                key={index}
                ref={(el) => {
                  messageRefs.current[index] = el;
                }}
                data-chat-message-index={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={
                  message.role === "user"
                    ? "flex justify-end"
                    : "flex gap-3 items-start"
                }
              >
                {message.role !== "user" && message.role !== "error" && (
                  <MicroTrainerMark size="sm" className="mt-1 hidden sm:flex" />
                )}
                {message.role === "user" ? (
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl rounded-tr-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm leading-relaxed border border-gray-800/10 dark:border-gray-300 transition-shadow ${
                      highlightedIndex === index
                        ? "ring-2 ring-[#1a73e8] dark:ring-[#8ab4f8] ring-offset-2 dark:ring-offset-[#202124]"
                        : ""
                    }`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-1">
                      You
                    </p>
                    {message.content}
                  </div>
                ) : message.role === "error" ? (
                  <div className="flex-1 max-w-[90%] px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                    <span className="font-semibold shrink-0">!</span>
                    <span>{message.content}</span>
                  </div>
                ) : (
                  <div
                    className={`flex-1 max-w-[90%] px-4 py-4 rounded-2xl rounded-tl-sm bg-white dark:bg-[#292a2d] border border-gray-200 dark:border-gray-700 shadow-sm transition-shadow ${
                      highlightedIndex === index
                        ? "ring-2 ring-[#1a73e8]/50 dark:ring-[#8ab4f8]/50"
                        : ""
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#1a73e8] dark:text-[#8ab4f8] mb-2">
                      Coach
                    </p>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                      <ReactMarkdown components={chatMdComponents}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 items-start"
            >
              <MicroTrainerMark size="sm" className="hidden sm:flex" />
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-[#292a2d] border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#1a73e8] dark:text-[#8ab4f8] mb-2">
                  Coach
                </p>
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#1a73e8]/60 animate-pulse" />
                  <span className="h-2 w-2 rounded-full bg-[#1a73e8]/40 animate-pulse [animation-delay:200ms]" />
                  <span className="h-2 w-2 rounded-full bg-[#1a73e8]/25 animate-pulse [animation-delay:400ms]" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-[#202124]/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <HomeChatInput
            question={question}
            setQuestion={setQuestion}
            isLoading={isLoading}
            inputRef={inputRef}
            onSubmit={onSubmit}
            onKeyDown={onKeyDown}
            placeholder="Follow up or ask something new..."
            size="compact"
          />
        </div>
      </div>
    </div>
  );
}

/* ================= SHARED INPUT ================= */

function HomeChatInput({
  question,
  setQuestion,
  isLoading,
  inputRef,
  onSubmit,
  onKeyDown,
  placeholder,
  size = "compact",
  className = "",
}) {
  const isLarge = size === "large";

  return (
    <form
      onSubmit={onSubmit}
      className={`relative overflow-hidden ${className} ${
        isLarge
          ? "rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-[#292a2d] shadow-md focus-within:border-[#1a73e8] dark:focus-within:border-[#8ab4f8] transition-colors"
          : "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] focus-within:border-gray-300 dark:focus-within:border-gray-600 transition"
      }`}
    >
      {isLarge && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1a73e8] via-[#2563eb] to-[#ea580c] dark:from-[#8ab4f8] dark:via-[#60a5fa] dark:to-[#fb923c]"
          aria-hidden
        />
      )}
      <div
        className={`flex items-end gap-3 ${
          isLarge ? "px-4 py-3 sm:px-4 sm:py-4" : "px-3 py-2.5"
        }`}
      >
        {isLarge && <MicroTrainerMark size="sm" className="mb-0.5 hidden sm:flex" />}
        <textarea
          ref={inputRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          maxLength={500}
          rows={isLarge ? 2 : 1}
          className={`flex-1 resize-none bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 border-0 outline-none focus:ring-0 ${
            isLarge ? "text-base leading-relaxed pt-1" : "text-sm py-1"
          }`}
          style={{
            boxShadow: "none",
            WebkitAppearance: "none",
          }}
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className={`flex-shrink-0 font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed ${
            isLarge
              ? "px-4 py-2 rounded-lg bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-gray-900 text-sm hover:opacity-90"
              : "px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs hover:opacity-90"
          }`}
        >
          {isLoading ? "…" : "Ask →"}
        </button>
      </div>
      {question.length > 400 && (
        <div className="px-4 pb-2 text-xs text-gray-400 text-right">
          {question.length}/500
        </div>
      )}
    </form>
  );
}
