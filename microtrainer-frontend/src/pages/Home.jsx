import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Mic, Code2, BookOpen, BarChart3, ArrowUp, MessageSquareText } from "lucide-react";
import { chatWithMicroTrainer } from "../api";
import { pageShell, textMuted } from "../lib/ui";
import { createLessonMarkdownComponents } from "../utils/lessonMarkdown";
import ConceptCards, { parseConceptSections } from "../components/ConceptCards";
import ChatHistorySidebar from "../components/ChatHistorySidebar";
import { useChatHistoryPersistence } from "../hooks/useChatHistoryPersistence";
import { filterStarterPrompts } from "../utils/chatHistoryStorage";

const chatMdComponents = createLessonMarkdownComponents();
const HOME_CHAT_STORAGE = "microtrainer-chat-history-home";

const STARTER_PROMPT_POOL = [
  "Explain React hooks with a real-world example",
  "What MERN stack questions come up in interviews?",
  "How do SQL JOINs work? Show me with a query",
  "Walk me through solving a two-pointer problem",
  "What's the difference between let, const, and var?",
  "Help me prepare for a Java OOP interview",
  "How does async/await work in JavaScript?",
  "Explain REST APIs in simple terms",
  "What is the difference between SQL and NoSQL?",
  "How do I approach a binary search problem?",
];

const QUICK_ACTIONS = [
  { label: "Mock interview", path: "/interview", icon: Mic },
  { label: "Communication", path: "/communication", icon: MessageSquareText },
  { label: "Guided course", path: "/learn", icon: BookOpen },
  { label: "Code practice", path: "/problems", icon: Code2 },
  { label: "My progress", path: "/dashboard", icon: BarChart3 },
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
  const hasSavedSessions = sessions.length > 0;
  const [historyOpen, setHistoryOpen] = useState(false);

  const starterPrompts = useMemo(
    () => filterStarterPrompts(STARTER_PROMPT_POOL, sessions, 6),
    [sessions]
  );

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
        "I can only help with technical concepts and interview preparation. Please ask me something technical — for example, React hooks, SQL joins, or how to prepare for a coding interview.";

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
      <div className="flex flex-1 min-h-0 w-full max-w-2xl mx-auto relative">
        {hasSavedSessions && (
          <ChatHistorySidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onSelectQuestion={handleSelectQuestion}
            onNewChat={startNewChat}
            onDeleteSession={handleDeleteSession}
            title="Your questions"
            emptyHint="Questions you ask are saved here so you can reopen them anytime."
            open={historyOpen}
            onOpenChange={setHistoryOpen}
            docked={false}
          />
        )}

        <main className="flex-1 flex flex-col min-h-0 min-w-0 w-full">
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
              starterPrompts={starterPrompts}
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
  starterPrompts = [],
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl flex flex-col items-center"
      >
        {/* Brand mark */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-[#202124] text-sm font-bold shadow-sm">
            MT
          </div>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-gray-100 tracking-tight">
              What do you want to practice?
            </h1>
            <p className={`${textMuted} mt-2 max-w-md mx-auto`}>
              Ask about any concept, interview topic, or coding problem — no menus required.
            </p>
          </div>
        </div>

        {/* Primary input */}
        <HomeChatInput
          question={question}
          setQuestion={setQuestion}
          isLoading={isLoading}
          inputRef={inputRef}
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
          placeholder="Ask a question..."
          size="large"
          className="w-full"
        />

        {/* Starter prompts */}
        <div className="w-full mt-6">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 text-center mb-3 uppercase tracking-wide">
            Try asking
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isLoading}
                onClick={() => onStarterClick(prompt)}
                className="text-left text-sm px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#292a2d] text-gray-700 dark:text-gray-300 hover:border-[#1a73e8]/40 dark:hover:border-[#8ab4f8]/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition disabled:opacity-50 max-w-full"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Quick actions — secondary, not overwhelming */}
        <div className="w-full mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-3">
            Or jump to a dedicated space
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_ACTIONS.map(({ label, path, icon: Icon }) => (
              <button
                key={path}
                type="button"
                onClick={() => onNavigate(path)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] hover:bg-gray-50 dark:hover:bg-gray-800/60 transition"
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-8">
          MicroTrainer adapts to your level. Answers may need a quick sanity check.
        </p>
      </motion.div>
    </div>
  );
}

/* ================= ACTIVE CHAT ================= */

function AssistantMessage({ content, highlighted }) {
  const sections = useMemo(() => parseConceptSections(content), [content]);

  if (sections) {
    return (
      <div
        className={`w-full rounded-3xl transition-shadow ${
          highlighted ? "ring-2 ring-blue-300 dark:ring-blue-600 ring-offset-4 dark:ring-offset-[#202124]" : ""
        }`}
      >
        <ConceptCards sections={sections} />
      </div>
    );
  }

  return (
    <div
      className={`max-w-[90%] px-4 py-4 rounded-2xl rounded-bl-md bg-gray-50 dark:bg-[#292a2d] border border-gray-200 dark:border-gray-700 transition-shadow ${
        highlighted ? "ring-2 ring-blue-300 dark:ring-blue-600" : ""
      }`}
    >
      <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
        <ReactMarkdown components={chatMdComponents}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

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
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 dark:border-gray-800">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          Practice chat
        </p>
        <button
          type="button"
          onClick={onNewChat}
          className="text-xs font-medium px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          New question
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
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
                    : "flex justify-start"
                }
              >
                {message.role === "user" ? (
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl rounded-br-md bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-gray-900 text-sm leading-relaxed transition-shadow ${
                      highlightedIndex === index
                        ? "ring-2 ring-blue-300 dark:ring-blue-600 ring-offset-2 dark:ring-offset-[#202124]"
                        : ""
                    }`}
                  >
                    {message.content}
                  </div>
                ) : message.role === "error" ? (
                  <div className="max-w-[90%] px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{message.content}</span>
                  </div>
                ) : (
                  <AssistantMessage
                    content={message.content}
                    highlighted={highlightedIndex === index}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#292a2d] border border-gray-200 dark:border-gray-700">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Pinned input */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#202124]/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <HomeChatInput
            question={question}
            setQuestion={setQuestion}
            isLoading={isLoading}
            inputRef={inputRef}
            onSubmit={onSubmit}
            onKeyDown={onKeyDown}
            placeholder="Ask a follow-up..."
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
      className={`relative ${className} ${
        isLarge
          ? "rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#292a2d] shadow-lg shadow-gray-200/50 dark:shadow-none focus-within:border-[#1a73e8]/50 dark:focus-within:border-[#8ab4f8]/50 focus-within:ring-2 focus-within:ring-[#1a73e8]/10 dark:focus-within:ring-[#8ab4f8]/10 transition"
          : "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] shadow-sm focus-within:border-gray-300 dark:focus-within:border-gray-600 transition"
      }`}
    >
      <div
        className={`flex items-end gap-2 ${
          isLarge ? "px-4 py-3 sm:px-5 sm:py-4" : "px-3 py-2.5"
        }`}
      >
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
            isLarge ? "text-base sm:text-lg leading-relaxed" : "text-sm py-1"
          }`}
          style={{
            boxShadow: "none",
            WebkitAppearance: "none",
          }}
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className={`flex-shrink-0 flex items-center justify-center rounded-xl bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-gray-900 hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed ${
            isLarge ? "h-10 w-10 sm:h-11 sm:w-11" : "h-8 w-8"
          }`}
          title="Send"
        >
          {isLoading ? (
            <svg
              className={`animate-spin ${isLarge ? "h-5 w-5" : "h-4 w-4"}`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <ArrowUp
              className={isLarge ? "h-5 w-5" : "h-4 w-4"}
              strokeWidth={2.5}
            />
          )}
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
