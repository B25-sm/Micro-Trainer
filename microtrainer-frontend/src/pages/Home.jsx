import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowUp, Check, Mic, X } from "lucide-react";
import { chatWithMicroTrainer } from "../api";
import { pageShell, textMuted } from "../lib/ui";
import ConceptCards, { parseConceptSections } from "../components/ConceptCards";
import ConceptMarkdownAnswer from "../components/ConceptMarkdownAnswer";
import ChatHistorySidebar from "../components/ChatHistorySidebar";
import { useChatHistoryPersistence } from "../hooks/useChatHistoryPersistence";
import { getStudentId } from "../utils/studentAuth";
import QuickCheckCard from "../components/QuickCheckCard";
import OpportunityChip from "../components/OpportunityChip";
import TopNudgeBanner from "../components/TopNudgeBanner";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { useAttachments } from "../hooks/useAttachments";
import AttachButton from "../components/attachments/AttachButton";
import AttachmentChips from "../components/attachments/AttachmentChips";
import { ACCEPT_DOCUMENTS, documentsToContextText } from "../utils/fileAttachments";

const HOME_CHAT_STORAGE = "microtrainer-chat-history-home";

const Home = () => {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [lastConcept, setLastConcept] = useState(null);
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
  } = useChatHistoryPersistence(HOME_CHAT_STORAGE, getStudentId());

  const isChatting = chatHistory.length > 0;
  const hasSavedSessions = sessions.length > 0;
  const [historyOpen, setHistoryOpen] = useState(false);
  const attach = useAttachments();

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
    const typed = rawText.trim();
    const currentAttachments = attach.attachments;
    if ((!typed && !currentAttachments.length) || isLoading) return;

    // Without a typed question, use a default so the scoped tutor has an instruction.
    const userQuestion = typed || "Please review the attached document.";
    const attachmentText = documentsToContextText(currentAttachments);
    const chipMeta = currentAttachments.map((a) => ({
      id: a.id,
      name: a.name,
      kind: a.kind,
      size: a.size,
    }));

    setQuestion("");
    attach.clearAttachments();

    setChatHistory((prev) => [
      ...prev,
      {
        role: "user",
        content: userQuestion,
        attachments: chipMeta.length ? chipMeta : undefined,
        timestamp: new Date().toISOString(),
      },
    ]);

    setIsLoading(true);

    try {
      const response = await chatWithMicroTrainer({
        question: userQuestion,
        attachmentText: attachmentText || undefined,
        sessionId: sessionId,
        studentId: getStudentId(),
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

      // Offer an optional quick check for concept-like questions (skip greetings).
      if (userQuestion.length >= 10 && !/^(hi|hey|hello|thanks|thank you)\b/i.test(userQuestion)) {
        setLastConcept(userQuestion);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage =
        err?.error ||
        err?.message ||
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
      <div className="flex flex-1 min-h-0 w-full max-w-3xl mx-auto relative">
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
              lastConcept={lastConcept}
              attach={attach}
            />
          ) : (
            <WelcomeView
              question={question}
              setQuestion={setQuestion}
              isLoading={isLoading}
              inputRef={inputRef}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              attach={attach}
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
  attach,
}) {
  return (
    <div className="flex-1 flex flex-col items-center px-4 sm:px-6 pt-[18vh] pb-10 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-3xl flex flex-col items-center"
      >
        <div className="w-full mb-5">
          <TopNudgeBanner />
        </div>

        <div className="w-full mb-6 text-center">
          <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-tight break-words text-gray-900 dark:text-gray-100">
            What do you want to practice?
          </h1>
          <p className={`${textMuted} mt-1.5 text-[14px] break-words`}>
            Ask about any concept, interview topic, or coding problem.
          </p>
        </div>

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
          attach={attach}
        />

        <p className="w-full text-[11px] text-gray-400 dark:text-gray-500 text-center mt-2.5 break-words">
          Answers are AI-generated — double-check anything important.
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
        className={`w-full max-w-3xl transition-shadow ${
          highlighted ? "shadow-[0_0_0_2px] shadow-blue-400/70 dark:shadow-blue-500/60" : ""
        }`}
      >
        <ConceptCards sections={sections} seed={content} />
      </div>
    );
  }

  return (
    <ConceptMarkdownAnswer content={content} highlighted={highlighted} />
  );
}

function NewQuestionButton({ onConfirm }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return undefined;
    const t = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(t);
  }, [armed]);

  if (armed) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#7c3aed]/40 dark:border-[#a78bfa]/40 bg-blue-50 dark:bg-[#7c3aed]/15 px-2 py-1 text-xs">
        <span className="px-1 text-gray-600 dark:text-gray-300">Start a new question?</span>
        <button
          type="button"
          onClick={() => {
            setArmed(false);
            onConfirm();
          }}
          className="rounded-full bg-[#7c3aed] dark:bg-[#a78bfa] px-2.5 py-1 font-medium text-white dark:text-gray-900 hover:opacity-90 transition"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="rounded-full px-2 py-1 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setArmed(true)}
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2b2e] px-3.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm transition hover:border-[#7c3aed]/50 hover:text-[#7c3aed] dark:hover:border-[#a78bfa]/50 dark:hover:text-[#a78bfa]"
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10 4.5v11M4.5 10h11" />
      </svg>
      New question
    </button>
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
  lastConcept,
  attach,
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="w-full max-w-3xl mx-auto space-y-5">
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
                    className={`max-w-[85%] sm:max-w-xl px-4 py-3 rounded-2xl rounded-br-md bg-[#7c3aed] dark:bg-[#a78bfa] text-white dark:text-gray-900 text-sm leading-relaxed transition-shadow ${
                      highlightedIndex === index
                        ? "ring-2 ring-blue-300 dark:ring-blue-600 ring-offset-2 dark:ring-offset-[#202124]"
                        : ""
                    }`}
                  >
                    {message.content}
                  </div>
                ) : message.role === "error" ? (
                  <div className="max-w-2xl px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
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
      <div className="flex-shrink-0 px-4 sm:px-6 pb-4 pt-3 bg-white dark:bg-[#202124]">
        <div className="max-w-3xl mx-auto">
          {lastConcept && !isLoading && (
            <div className="mb-3">
              <QuickCheckCard key={lastConcept} topic={lastConcept} />
            </div>
          )}
          {lastConcept && !isLoading && <OpportunityChip tech={lastConcept} />}
          <div className="mb-2 flex justify-end">
            <NewQuestionButton onConfirm={onNewChat} />
          </div>
          <HomeChatInput
            question={question}
            setQuestion={setQuestion}
            isLoading={isLoading}
            inputRef={inputRef}
            onSubmit={onSubmit}
            onKeyDown={onKeyDown}
            placeholder="Ask a follow-up..."
            size="compact"
            attach={attach}
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
  attach,
}) {
  const isLarge = size === "large";
  const hasAttachments = attach?.attachments?.length > 0;
  const speech = useSpeechToText({
    getBaseText: () => question,
    onTranscript: setQuestion,
    disabled: isLoading,
  });

  useEffect(() => {
    if (isLoading && speech.isRecording) {
      speech.stopRecording();
    }
  }, [isLoading, speech.isRecording, speech.stopRecording]);

  return (
    <div className={`relative ${className}`}>
      {attach?.error && (
        <p className="text-xs text-red-500 px-1 pb-1.5">{attach.error}</p>
      )}
      {hasAttachments && (
        <AttachmentChips attachments={attach.attachments} onRemove={attach.removeAttachment} />
      )}
      <form
        onSubmit={onSubmit}
        className={`relative ${
          isLarge || hasAttachments
            ? "rounded-3xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#2f2f2f] shadow-sm dark:shadow-none focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors duration-200"
            : "rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2f2f2f] shadow-sm dark:shadow-none focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors"
        }`}
      >
      <div
        className={`flex items-center gap-1.5 ${
          isLarge ? "pl-2 pr-2 py-2" : "px-2 py-2 items-end"
        }`}
      >
        {!speech.isRecording && (
          <AttachButton
            accept={ACCEPT_DOCUMENTS}
            count={attach?.attachments?.length || 0}
            onAdd={attach?.addAttachments}
            onError={attach?.setError}
            disabled={isLoading}
          />
        )}
        {speech.isRecording ? (
          <div className="flex min-w-0 flex-1 items-center gap-3 px-1" role="status">
            <div className="flex h-7 shrink-0 items-center gap-[2px]" aria-hidden="true">
              {[9, 17, 12, 22, 14, 19, 10].map((height, index) => (
                <span
                  key={index}
                  className="w-[2px] shrink-0 animate-pulse rounded-full bg-gray-700 dark:bg-gray-200"
                  style={{ height, animationDelay: `${index * 70}ms`, animationDuration: "700ms" }}
                />
              ))}
            </div>
            <div
              className="max-h-20 min-w-0 flex-1 overflow-y-auto whitespace-pre-wrap py-1 text-[15px] leading-relaxed text-gray-800 dark:text-gray-100"
              aria-live="polite"
            >
              {question || speech.interimText ? (
                <>
                  {question}
                  {question && speech.interimText ? " " : ""}
                  <span className="text-gray-500 dark:text-gray-400">{speech.interimText}</span>
                </>
              ) : (
                <span className="text-gray-400 dark:text-gray-500">Start speaking...</span>
              )}
            </div>
          </div>
        ) : (
          <textarea
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            maxLength={500}
            rows={1}
            className={`flex-1 resize-none bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 border-0 outline-none focus:ring-0 ${
              isLarge ? "text-[15px] py-1.5 leading-relaxed" : "text-[15px] py-1 leading-relaxed"
            }`}
            style={{ boxShadow: "none", WebkitAppearance: "none" }}
          />
        )}
        {speech.isRecording ? (
          <>
            <button
              type="button"
              onClick={speech.cancelRecording}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-900 transition hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              title="Cancel dictation"
              aria-label="Cancel dictation"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={speech.stopRecording}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white transition hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              title="Finish dictation"
              aria-label="Finish dictation"
            >
              <Check className="h-4 w-4" strokeWidth={2.75} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={speech.startRecording}
            disabled={isLoading || !speech.supported}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
            title={speech.supported ? "Dictate" : "Voice input is not supported in this browser"}
            aria-label="Dictate"
          >
            <Mic className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        )}
        {!speech.isRecording && <button
          type="submit"
          disabled={(!question.trim() && !hasAttachments) || isLoading}
          className={`flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-b from-[#8b5cf6] to-[#7c3aed] dark:from-[#b7a3fb] dark:to-[#a78bfa] text-white dark:text-gray-900 shadow-[0_2px_8px_-2px_rgba(124,58,237,0.35)] dark:shadow-[0_2px_9px_-2px_rgba(167,139,250,0.28)] hover:opacity-90 transition disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed ${
            isLarge ? "h-9 w-9" : "h-9 w-9"
          }`}
          title="Send"
        >
          {isLoading ? (
            <svg
              className="animate-spin h-4 w-4"
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
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          )}
        </button>}
      </div>
      {speech.voiceError && (
        <div className="px-4 pb-2 text-xs text-amber-600 dark:text-amber-400" role="alert">
          {speech.voiceError}
        </div>
      )}
      {question.length > 400 && (
        <div className="px-4 pb-2 text-xs text-gray-400 text-right">
          {question.length}/500
        </div>
      )}
      </form>
    </div>
  );
}
