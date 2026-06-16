import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { askAI } from "../api";
import { getStudentId } from "../utils/studentAuth";
import { isTrainerSession } from "../utils/trainerAuth";
import { createLessonMarkdownComponents } from "../utils/lessonMarkdown";
import ChatHistorySidebar from "../components/ChatHistorySidebar";
import { useChatHistoryPersistence } from "../hooks/useChatHistoryPersistence";

const teachingMdComponents = createLessonMarkdownComponents();
const ASK_CHAT_STORAGE = "microtrainer-chat-history-ask";

function resolveLearnStudentId() {
  const id = getStudentId();
  if (id) return id;
  if (isTrainerSession()) {
    const email = localStorage.getItem("userEmail");
    if (email) {
      return `trainer-preview-${email.replace(/[^a-z0-9]/gi, "_").slice(0, 40)}`;
    }
  }
  return "";
}
import TechnologySelection from "../components/TechnologySelection";
import ConceptList from "../components/ConceptList";
import StructuredTeaching from "../components/StructuredTeaching";

const Learn = () => {
  // Learning mode state
  const [learningMode, setLearningMode] = useState(() => {
    return localStorage.getItem("learningMode") || "ask-anything";
  });
  
  // Guided course navigation state
  const [currentView, setCurrentView] = useState("technology-selection");
  const [selectedTechnology, setSelectedTechnology] = useState(null);
  const [selectedConceptOrder, setSelectedConceptOrder] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  /** guided = sequential unlock | browse = study any topic */
  const [studyMode, setStudyMode] = useState("guided");
  
  // Ask Anything mode state
  const [concept, setConcept] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [studentId] = useState(() => resolveLearnStudentId());
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageRefs = useRef({});

  const {
    sessions,
    activeSessionId,
    persistConversation,
    beginNewSession,
    selectSession,
    removeSession,
  } = useChatHistoryPersistence(ASK_CHAT_STORAGE);

  const showHistoryDrawer =
    learningMode === "ask-anything" && sessions.length > 0;
  const [historyOpen, setHistoryOpen] = useState(false);

  const isAnsweringCheck =
    awaitingAnswer ||
    (conversation.length > 0 &&
      conversation[conversation.length - 1]?.crossQuestion);

  // Persist learning mode
  useEffect(() => {
    localStorage.setItem("learningMode", learningMode);
  }, [learningMode]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (highlightedIndex == null) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, highlightedIndex]);

  useEffect(() => {
    if (learningMode === "ask-anything" && conversation.length > 0) {
      persistConversation({
        messages: conversation,
        sessionId,
        meta: { currentLevel, awaitingAnswer },
      });
    }
  }, [
    conversation,
    sessionId,
    currentLevel,
    awaitingAnswer,
    learningMode,
    persistConversation,
  ]);

  // Block copy/paste when answering Quick Check questions
  useEffect(() => {
    if (!isAnsweringCheck) return undefined;

    const blockCopyPaste = (e) => {
      e.preventDefault();
    };

    document.addEventListener("copy", blockCopyPaste);
    document.addEventListener("paste", blockCopyPaste);
    document.addEventListener("cut", blockCopyPaste);

    return () => {
      document.removeEventListener("copy", blockCopyPaste);
      document.removeEventListener("paste", blockCopyPaste);
      document.removeEventListener("cut", blockCopyPaste);
    };
  }, [isAnsweringCheck]);

  // Fetch saved level when component mounts
  useEffect(() => {
    const fetchSavedLevel = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/student/${studentId}/level`);
        if (response.data.hasLevel) {
          setCurrentLevel(response.data.level);
          console.log(`📚 Welcome back! Your level: ${response.data.level}`);
        }
      } catch {
        console.log("No saved level found (first time user)");
      }
    };
    
    fetchSavedLevel();
  }, [studentId]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!concept.trim() || isLoading) return;

    const userInput = concept.trim();
    setConcept("");

    // Add user message
    setConversation(prev => [...prev, {
      role: "user",
      content: userInput,
      timestamp: new Date().toISOString()
    }]);

    setIsLoading(true);

    try {
      const response = await askAI({
        question: awaitingAnswer ? null : userInput,
        answer: awaitingAnswer ? userInput : null,
        sessionId: sessionId,
        level: currentLevel,
        studentId: studentId // Send studentId
      });

      // Update session
      if (response.data.sessionId && !sessionId) {
        setSessionId(response.data.sessionId);
      }

      // Update level
      if (response.data.level) {
        setCurrentLevel(response.data.level);
      }

      // Add AI response
      setConversation(prev => [...prev, {
        role: "assistant",
        content: response.data.explanation,
        crossQuestion: response.data.crossQuestion,
        level: response.data.level,
        timestamp: new Date().toISOString()
      }]);

      // Check if awaiting level detection
      if (response.data.awaitingLevelDetection) {
        setAwaitingAnswer(true);
      } else {
        setAwaitingAnswer(false);
      }

    } catch (err) {
      console.error("Teaching error:", err);
      setConversation(prev => [...prev, {
        role: "error",
        content:
          err?.response?.data?.error ||
          err?.error ||
          (typeof err === "string" ? err : null) ||
          "Something went wrong. Please try again.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startNewTopic = () => {
    beginNewSession();
    setConversation([]);
    setSessionId(null);
    setCurrentLevel(null);
    setAwaitingAnswer(false);
    setConcept("");
    setHighlightedIndex(null);
  };

  const handleSelectSession = (session) => {
    selectSession(session.id);
    setConversation(session.messages || []);
    setSessionId(session.sessionId ?? null);
    setCurrentLevel(session.meta?.currentLevel ?? null);
    setAwaitingAnswer(session.meta?.awaitingAnswer ?? false);
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
      setConversation([]);
      setSessionId(null);
      setCurrentLevel(null);
      setAwaitingAnswer(false);
      setHighlightedIndex(null);
    }
  };

  // Guided Course handlers
  const handleModeSwitch = (mode) => {
    if (mode === learningMode) return;
    
    // If switching from ask-anything with active conversation, confirm
    if (learningMode === "ask-anything" && conversation.length > 0) {
      if (!window.confirm("Switching modes will clear your current conversation. Continue?")) {
        return;
      }
    }
    
    setLearningMode(mode);
    
    // Reset state when switching modes
    if (mode === "ask-anything") {
      setCurrentView("technology-selection");
      setSelectedTechnology(null);
      setSelectedConceptOrder(null);
    } else {
      setConversation([]);
      setSessionId(null);
      setAwaitingAnswer(false);
      setConcept("");
    }
  };

  const handleTechnologySelect = (technology, mode = "guided") => {
    setSelectedTechnology(technology);
    setStudyMode(mode);
    setCurrentView("concept-list");
  };

  const handleConceptSelect = (conceptId, conceptOrder, isReview = false) => {
    setSelectedConceptOrder(conceptOrder);
    setIsReviewMode(isReview);
    setCurrentView("teaching");
  };

  const handleConceptComplete = () => {
    // Return to concept list to show updated progress
    setCurrentView("concept-list");
    setSelectedConceptOrder(null);
    setIsReviewMode(false);
  };

  const handleBackToTechnologies = () => {
    setCurrentView("technology-selection");
    setSelectedTechnology(null);
    setSelectedConceptOrder(null);
    setStudyMode("guided");
  };

  const handleBackToConcepts = () => {
    setCurrentView("concept-list");
    setSelectedConceptOrder(null);
    setIsReviewMode(false);
  };

  const suggestedTopics = [
    { title: "Closures in JavaScript", subtitle: "Understand scope and memory" },
    { title: "React Hooks", subtitle: "useState, useEffect, and more" },
    { title: "Promises and Async/Await", subtitle: "Asynchronous JavaScript" },
    { title: "OOP in Java", subtitle: "Classes, inheritance, polymorphism" },
    { title: "Python Decorators", subtitle: "Function wrappers and metaprogramming" },
    { title: "SQL Joins", subtitle: "INNER, LEFT, RIGHT, FULL joins" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#202124] read-mode:bg-[var(--read-surface)] transition-colors duration-300">
      <div className="flex flex-1 min-h-0 w-full relative">
        {showHistoryDrawer && (
          <ChatHistorySidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onSelectQuestion={handleSelectQuestion}
            onNewChat={startNewTopic}
            onDeleteSession={handleDeleteSession}
            title="Learning history"
            emptyHint="Concepts you ask about are saved here so you can pick up where you left off."
            open={historyOpen}
            onOpenChange={setHistoryOpen}
            docked={false}
          />
        )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 py-8 max-w-4xl mx-auto w-full min-h-0 overflow-y-auto">
        {currentLevel && (
          <span className="mb-4 inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
            {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)} level
          </span>
        )}
        
        {/* Mode Selection - Show when no conversation in ask-anything mode */}
        {learningMode === "ask-anything" && conversation.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100 text-center mb-2">
              What do you want to learn today?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm">
              Choose your learning style
            </p>

            {/* Mode Selection Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModeSwitch("ask-anything")}
                className="p-6 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#292a2d] text-left text-gray-900 dark:text-gray-100 shadow-sm"
              >
                <h3 className="text-lg font-medium mb-2">Ask anything</h3>
                <p className="text-sm opacity-80" style={{ color: "inherit" }}>
                  Free-form learning. Ask about any concept and I'll teach it at your level.
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModeSwitch("guided-course")}
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] hover:border-gray-300 dark:hover:border-gray-600 text-left text-gray-900 dark:text-gray-100 transition-all"
              >
                <h3 className="text-lg font-medium mb-2">Guided course</h3>
                <p className="text-sm opacity-80" style={{ color: "inherit" }}>
                  Structured learning path. Master technologies step-by-step with progress tracking.
                </p>
              </motion.button>
            </div>

            {/* Suggested Topics for Ask Anything */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-300 text-center mb-4">Or jump right in with a topic:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedTopics.map((topic, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setConcept(topic.title);
                      setTimeout(() => handleSubmit(), 100);
                    }}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#25262a] hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all text-left text-gray-900 dark:text-gray-100"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{topic.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{topic.subtitle}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Ask Anything Mode - Conversation */}
        {learningMode === "ask-anything" && conversation.length > 0 && (
          <div className="w-full mb-6">
            {/* New Topic Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={startNewTopic}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
              >
                ← Start New Topic
              </button>
            </div>

            {/* Messages */}
            <div className="space-y-6">
              <AnimatePresence>
                {conversation.map((message, index) => (
                  <motion.div
                    key={index}
                    ref={(el) => {
                      messageRefs.current[index] = el;
                    }}
                    data-chat-message-index={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`${
                      highlightedIndex === index
                        ? "ring-2 ring-blue-400 dark:ring-blue-500 rounded-2xl"
                        : ""
                    } ${
                      message.role === "user"
                        ? "flex justify-end"
                        : message.role === "error"
                        ? ""
                        : ""
                    }`}
                  >
                    {message.role === "user" ? (
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 max-w-2xl">
                        <p className="text-gray-800">{message.content}</p>
                      </div>
                    ) : message.role === "error" ? (
                      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3">
                        <div className="flex items-start gap-2 text-red-600">
                          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span>{message.content}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4">
                        {/* Level Badge */}
                        {message.level && (
                          <div className="mb-3">
                            <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              Teaching at {message.level} level
                            </span>
                          </div>
                        )}

                        {/* Explanation */}
                        <div className="prose prose-sm max-w-none text-gray-800 mb-4">
                          <ReactMarkdown components={teachingMdComponents}>
                            {message.content}
                          </ReactMarkdown>
                        </div>

                        {/* Cross Question */}
                        {message.crossQuestion && (
                          <div className="mt-4 pt-4 border-t border-gray-300">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              💭 Quick check:
                            </p>
                            <p className="text-gray-800">{message.crossQuestion}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* Guided Course Mode */}
        {learningMode === "guided-course" && (
          <>
            {currentView === "technology-selection" && (
              <TechnologySelection
                studentId={studentId}
                onTechnologySelect={handleTechnologySelect}
              />
            )}

            {currentView === "concept-list" && (
              <ConceptList
                technology={selectedTechnology}
                studentId={studentId}
                studyMode={studyMode}
                onStudyModeChange={setStudyMode}
                onConceptSelect={handleConceptSelect}
                onBack={handleBackToTechnologies}
              />
            )}

            {currentView === "teaching" &&
              selectedTechnology &&
              selectedConceptOrder != null && (
              <StructuredTeaching
                technology={selectedTechnology}
                conceptOrder={selectedConceptOrder}
                studentId={studentId}
                studentLevel={currentLevel}
                isReviewMode={isReviewMode}
                onComplete={handleConceptComplete}
                onBack={handleBackToConcepts}
              />
            )}
          </>
        )}

        {/* Input Box - Only for Ask Anything mode */}
        {learningMode === "ask-anything" && (
          <div className="w-full sticky bottom-6">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#2d2f35] rounded-full border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl focus-within:shadow-xl transition-all duration-200">
              <div className="flex items-center gap-3 px-6 py-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onCopy={(e) => isAnsweringCheck && e.preventDefault()}
                  onPaste={(e) => isAnsweringCheck && e.preventDefault()}
                  onCut={(e) => isAnsweringCheck && e.preventDefault()}
                  placeholder={
                    awaitingAnswer
                      ? "Answer in your own words..."
                      : conversation.length === 0
                      ? "What concept do you want to learn?"
                      : "Ask a follow-up question..."
                  }
                  disabled={isLoading}
                  className={`flex-1 bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 text-base disabled:opacity-50 ${isAnsweringCheck ? "select-none" : ""}`}
                  style={{ 
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    userSelect: isAnsweringCheck ? 'none' : 'auto'
                  }}
                />
                <button
                  type="submit"
                  disabled={!concept.trim() || isLoading}
                  className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  {isLoading ? (
                    <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  )}
                </button>
              </div>
            </form>

            {/* Helper Text */}
            <p className="text-xs text-gray-500 dark:text-gray-300 text-center mt-3">
              {awaitingAnswer 
                ? "Answer in your own words — copy and paste is disabled during Quick Check"
                : isAnsweringCheck
                ? "Answer the Quick Check in your own words — copy and paste is disabled"
                : "I'll adapt my teaching style based on your understanding"
              }
            </p>
          </div>
        )}

      </main>
      </div>
    </div>
  );
};

export default Learn;
