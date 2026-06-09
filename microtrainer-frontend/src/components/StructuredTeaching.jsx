import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { learningPathAPI } from "../api/learningPath";
import LessonDiagramPanel from "./LessonDiagramPanel";
import ExplanationModeToggle from "./ExplanationModeToggle";
import StoryLessonContent from "./StoryLessonContent";
import LessonCardThemeToggle from "./LessonCardThemeToggle";
import {
  loadLessonCardTheme,
  saveLessonCardTheme,
} from "../utils/lessonCardTheme";
import DisplayModeToggle from "./DisplayModeToggle";
import LessonLoadingScreen, { LESSON_LOAD_ESTIMATE_SEC } from "./LessonLoadingScreen";
import { needsElaborationRequest } from "../utils/quizAnswerUtils";

const stripAnswerLeak = (text) =>
  typeof text === "string"
    ? text.replace(/\n+\s*Correct answer\s*:.*$/gis, "").trim()
    : "";

const normalizeQuestion = (q) => {
  if (!q) return { type: "open", question: "" };
  if (typeof q === "string") {
    return { type: "open", question: stripAnswerLeak(q) };
  }
  if (q.type === "mcq" && Array.isArray(q.options)) {
    return {
      type: "mcq",
      question: stripAnswerLeak(q.question),
      options: q.options,
    };
  }
  return { type: "open", question: stripAnswerLeak(q.question || "") };
};

const formatQuestionMarkdown = (q, index, total) => {
  const n = normalizeQuestion(q);
  // MCQ options are shown as buttons below — not duplicated in chat
  return `**Question ${index + 1} of ${total}:**\n\n${n.question}`;
};

const StructuredTeaching = ({ 
  technology, 
  conceptOrder, 
  studentId, 
  studentLevel,
  isReviewMode = false,
  onComplete, 
  onBack 
}) => {
  const [sessionId, setSessionId] = useState(null);
  const [totalConcepts, setTotalConcepts] = useState(5);
  const [conceptData, setConceptData] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  /** First vague open answer — wait for elaboration before advancing (interview-style) */
  const [elaborationPending, setElaborationPending] = useState(null);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingHint, setLoadingHint] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isSimplifyingQuestion, setIsSimplifyingQuestion] = useState(false);
  const [showingQuestions, setShowingQuestions] = useState(false);
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [isReteachLoading, setIsReteachLoading] = useState(false);
  /** lucid = full lesson | terse = 3-line skim (quiz unchanged) */
  const [explanationMode, setExplanationMode] = useState("lucid");
  const [cardTheme, setCardTheme] = useState(loadLessonCardTheme);
  const chatEndRef = useRef(null);
  const answerInputRef = useRef(null);
  /** One elaboration prompt max per question — never coach through every wrong answer */
  const elaborationUsedRef = useRef(new Set());
  /** Ignore stale session/lesson responses when effect re-runs or Strict Mode double-mounts */
  const loadGenRef = useRef(0);
  /** Level can load async from parent — must not restart lesson fetch when it changes */
  const studentLevelRef = useRef(studentLevel || "beginner");
  useEffect(() => {
    studentLevelRef.current = studentLevel || "beginner";
  }, [studentLevel]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    saveLessonCardTheme(cardTheme);
  }, [cardTheme]);

  // Block copy/paste during Quick Check (same as interview section)
  useEffect(() => {
    if (!showingQuestions || assessmentResult) return undefined;

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
  }, [showingQuestions, assessmentResult]);

  useEffect(() => {
    if (showingQuestions && !assessmentResult) {
      answerInputRef.current?.focus();
    }
  }, [showingQuestions, assessmentResult, currentQuestionIndex]);

  const formatLoadError = (err) => {
    if (err.code === "ECONNABORTED" || /timeout/i.test(err.message || "")) {
      return (
        "Request timed out while generating the lesson. " +
        "Make sure **microtrainer-backend** is running (`npm start` in that folder) and **GROQ_API_KEY** is set in `.env`."
      );
    }
    if (err.code === "ERR_NETWORK" || !err.response) {
      return (
        "Cannot reach the server. Start the backend: open `microtrainer-backend` and run **npm start**, then click Retry below."
      );
    }
    return (
      err.response?.data?.error ||
      err.message ||
      "Failed to load lesson."
    );
  };

  const fetchLesson = async (sessionIdToUse, isRetry = false, loadGen) => {
    setConversation((prev) =>
      isRetry
        ? prev.filter((m) => m.role !== "error")
        : prev
    );

    setLoadingHint("Generating lesson and wireframe…");

    const conceptResponse = await learningPathAPI.getConcept(
      sessionIdToUse,
      studentLevelRef.current,
      false
    );

    if (loadGen != null && loadGen !== loadGenRef.current) return;

    setConceptData(conceptResponse.data);
    setExplanationMode("lucid");
    setConversation([
      {
        role: "assistant",
        content: conceptResponse.data.content,
        contentTerse: conceptResponse.data.contentTerse || null,
        level: studentLevelRef.current,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const getDisplayedLesson = (message) => {
    if (!message?.contentTerse || explanationMode !== "terse") {
      return message?.content || "";
    }
    return message.contentTerse;
  };

  // Initialize session and fetch concept
  useEffect(() => {
    if (!technology) return undefined;
    let cancelled = false;
    learningPathAPI
      .getCurriculum(technology)
      .then((res) => {
        if (cancelled) return;
        const total =
          res.data?.totalConcepts || res.data?.concepts?.length || 5;
        setTotalConcepts(total);
      })
      .catch(() => {
        if (!cancelled) setTotalConcepts(5);
      });
    return () => {
      cancelled = true;
    };
  }, [technology]);

  useEffect(() => {
    const initializeSession = async () => {
      const loadGen = ++loadGenRef.current;
      let deferLoadingOff = false;
      let newSessionId = null;

      try {
        setIsLoading(true);
        setConceptData(null);
        setConversation([]);

        const sessionResponse = await learningPathAPI.startSession(
          studentId,
          technology,
          conceptOrder
        );
        if (loadGen !== loadGenRef.current) return;

        newSessionId = sessionResponse.data.sessionId;
        setSessionId(newSessionId);

        await fetchLesson(newSessionId, false, loadGen);
        if (loadGen !== loadGenRef.current) return;
      } catch (err) {
        if (loadGen !== loadGenRef.current) return;

        console.error("Error initializing session:", err);
        const isRateLimit =
          err.response?.status === 429 ||
          err.response?.data?.code === "GROQ_RATE_LIMIT";
        const retryAfterMs = err.response?.data?.retryAfterMs || 20000;

        if (isRateLimit && newSessionId) {
          deferLoadingOff = true;
          const waitSec = Math.ceil(retryAfterMs / 1000);
          setLoadingHint(
            `AI rate limit — auto-retry in ${waitSec}s. Please wait…`
          );
          setTimeout(async () => {
            try {
              await fetchLesson(newSessionId, true, loadGen);
            } catch (retryErr) {
              if (loadGen !== loadGenRef.current) return;
              setConceptData(null);
              setConversation([
                {
                  role: "error",
                  content: formatLoadError(retryErr),
                  timestamp: new Date().toISOString(),
                },
              ]);
            } finally {
              if (loadGen === loadGenRef.current) {
                setIsLoading(false);
                setLoadingHint(null);
              }
            }
          }, retryAfterMs);
          return;
        }

        setConceptData(null);
        setConversation([
          {
            role: "error",
            content: formatLoadError(err),
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        if (loadGen === loadGenRef.current && !deferLoadingOff) {
          setIsLoading(false);
          setLoadingHint(null);
        }
      }
    };

    if (!technology || conceptOrder == null) {
      setIsLoading(false);
      return undefined;
    }

    initializeSession();

    return () => {
      loadGenRef.current += 1;
    };
  }, [technology, conceptOrder, studentId, loadAttempt]);

  const handleStartQuestions = () => {
    if (!conceptData?.crossQuestions || conceptData.crossQuestions.length === 0) {
      // No questions, auto-complete
      handleComplete();
      return;
    }

    if (explanationMode === "terse" && conceptData?.contentTerse) {
      setExplanationMode("lucid");
    }

    elaborationUsedRef.current = new Set();
    setElaborationPending(null);
    setShowingQuestions(true);
    setConversation(prev => [
      ...prev,
      {
        role: "system",
        content: "💭 **Quick Check**\n\nLet me ask you a few questions to check your understanding.",
        timestamp: new Date().toISOString()
      },
      {
        role: "assistant",
        content: formatQuestionMarkdown(
          conceptData.crossQuestions[currentQuestionIndex],
          currentQuestionIndex,
          conceptData.crossQuestions.length
        ),
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const advanceToNextQuestion = (newAnswers) => {
    const questions = conceptData.crossQuestions;
    if (currentQuestionIndex + 1 < questions.length) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeout(() => {
        setConversation((prev) => [
          ...prev,
          {
            role: "assistant",
            content: formatQuestionMarkdown(
              questions[nextIndex],
              nextIndex,
              questions.length
            ),
            timestamp: new Date().toISOString(),
          },
        ]);
      }, 400);
    } else {
      submitAssessment(newAnswers);
    }
  };

  const handleMcqSelect = (optionText) => {
    if (isAssessing) return;

    setConversation((prev) => [
      ...prev,
      {
        role: "user",
        content: optionText,
        timestamp: new Date().toISOString(),
      },
    ]);

    const newAnswers = [...answers, optionText];
    setAnswers(newAnswers);
    advanceToNextQuestion(newAnswers);
  };

  const handleSimplifyQuestion = async () => {
    if (!sessionId || isSimplifyingQuestion || isAssessing) return;

    setIsSimplifyingQuestion(true);
    try {
      const { data } = await learningPathAPI.simplifyQuestion(
        sessionId,
        currentQuestionIndex
      );

      const total = conceptData.crossQuestions.length;
      const simplified = data.question;

      setConceptData((prev) => {
        const crossQuestions = [...prev.crossQuestions];
        crossQuestions[currentQuestionIndex] = simplified;
        return { ...prev, crossQuestions };
      });

      setConversation((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "💡 **Simpler version** — same question, easier words. Your previous answers are unchanged.",
          timestamp: new Date().toISOString(),
        },
        {
          role: "assistant",
          content: formatQuestionMarkdown(
            simplified,
            currentQuestionIndex,
            total
          ),
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Could not simplify this question. Try again in a moment.";
      setConversation((prev) => [
        ...prev,
        {
          role: "error",
          content: msg,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSimplifyingQuestion(false);
    }
  };

  const handleAnswerSubmit = (e) => {
    e?.preventDefault();

    if (!currentAnswer.trim() || isAssessing) return;

    const answer = currentAnswer.trim();
    setCurrentAnswer("");

    const questionText = currentQuestion?.question || "";

    setConversation((prev) => [
      ...prev,
      {
        role: "user",
        content: answer,
        timestamp: new Date().toISOString(),
      },
    ]);

    // Follow-up after "Can you elaborate?" — combine both parts, then grade meaning
    if (
      elaborationPending &&
      elaborationPending.index === currentQuestionIndex
    ) {
      const combined = `${elaborationPending.partialAnswer} ${answer}`.trim();
      setElaborationPending(null);
      const newAnswers = [...answers, combined];
      setAnswers(newAnswers);
      advanceToNextQuestion(newAnswers);
      return;
    }

    const lessonContent = conceptData?.content || "";
    const elaboration = needsElaborationRequest(answer, questionText, lessonContent, {
      alreadyAsked: elaborationUsedRef.current.has(currentQuestionIndex),
    });
    if (elaboration) {
      elaborationUsedRef.current.add(currentQuestionIndex);
      setElaborationPending({
        index: currentQuestionIndex,
        partialAnswer: answer,
      });
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: elaboration.message,
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    advanceToNextQuestion(newAnswers);
  };

  const currentQuestion = showingQuestions && conceptData?.crossQuestions
    ? normalizeQuestion(conceptData.crossQuestions[currentQuestionIndex])
    : null;

  const submitAssessment = async (answersToSubmit) => {
    try {
      setIsAssessing(true);

      setConversation(prev => [
        ...prev,
        {
          role: "system",
          content: "⏳ Evaluating your understanding...",
          timestamp: new Date().toISOString()
        }
      ]);

      const response = await learningPathAPI.submitAnswers(sessionId, answersToSubmit);
      const result = response.data;

      setAssessmentResult(result);

      // Add assessment result to conversation
      setTimeout(() => {
        if (result.passed) {
          setShowDetailedFeedback(false);
          setConversation(prev => [
            ...prev.filter(msg => msg.content !== "⏳ Evaluating your understanding..."),
            {
              role: "success",
              content: `✅ **Great job! You scored ${result.assessment.percentage}%**\n\n${result.message}`,
              timestamp: new Date().toISOString()
            }
          ]);
        } else {
          setShowDetailedFeedback(true);
          setConversation(prev => [
            ...prev.filter(msg => msg.content !== "⏳ Evaluating your understanding..."),
            {
              role: "reteach",
              content: `📊 **You scored ${result.assessment.percentage}%**\n\n${result.message}`,
              timestamp: new Date().toISOString()
            }
          ]);
        }
      }, 1000);

    } catch (err) {
      console.error("Error submitting assessment:", err);
      const data = err.response?.data;
      const msg =
        data?.error ||
        err?.error ||
        (err.code === "ECONNABORTED"
          ? "Grading is taking longer than usual. Wait a moment and try again."
          : null) ||
        "Failed to submit assessment. Please try again.";
      const detail = data?.details;
      setConversation(prev => [
        ...prev.filter(msg => msg.content !== "⏳ Evaluating your understanding..."),
        {
          role: "error",
          content: detail && detail !== msg ? `${msg}\n\n(${detail})` : msg,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsAssessing(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const resetQuizForRetry = () => {
    elaborationUsedRef.current = new Set();
    setElaborationPending(null);
    setShowingQuestions(false);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer("");
    setAssessmentResult(null);
    setShowDetailedFeedback(false);
    setConversation((prev) =>
      prev.filter(
        (m) =>
          (m.role === "assistant" && m.level) ||
          m.role === "reteach" ||
          m.role === "success"
      )
    );
  };

  const handleStudySimplerExplanation = async () => {
    if (!sessionId || isReteachLoading) return;
    setIsReteachLoading(true);
    try {
      setIsLoading(true);
      const conceptResponse = await learningPathAPI.getConcept(
        sessionId,
        studentLevelRef.current,
        false,
        true
      );
      setConceptData(conceptResponse.data);
      setExplanationMode("lucid");
      resetQuizForRetry();
      setConversation((prev) => [
        ...prev.filter((m) => m.role !== "assistant" || !m.level),
        {
          role: "assistant",
          content: conceptResponse.data.content,
          contentTerse: conceptResponse.data.contentTerse || null,
          level: studentLevelRef.current,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Re-teach fetch failed:", err);
      setConversation((prev) => [
        ...prev,
        {
          role: "error",
          content:
            err.response?.data?.error ||
            "Could not load a simpler explanation. Try again in a moment.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsReteachLoading(false);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAnswerSubmit();
    }
  };

  if (isLoading) {
    return (
      <LessonLoadingScreen
        estimateSec={LESSON_LOAD_ESTIMATE_SEC}
        statusOverride={loadingHint}
      />
    );
  }

  if (!conceptData && !conversation.some((m) => m.role === "error")) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 px-4 text-center">
        <motion.div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8">
          <p className="text-gray-800 font-medium mb-2">Lesson didn&apos;t load</p>
          <p className="text-gray-600 text-sm mb-6">
            The request may have been interrupted. Click retry — generation usually takes about a minute.
          </p>
          <button
            type="button"
            onClick={() => setLoadAttempt((n) => n + 1)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Retry loading lesson
          </button>
          <button
            type="button"
            onClick={onBack}
            className="block w-full mt-3 text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to concepts
          </button>
        </motion.div>
      </div>
    );
  }

  if (!conceptData && conversation.some((m) => m.role === "error")) {
    const errMsg = conversation.find((m) => m.role === "error")?.content;
    return (
      <div className="w-full max-w-lg mx-auto py-16 px-4 text-center">
        <motion.div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8">
          <p className="text-red-800 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
            {errMsg}
          </p>
          <button
            type="button"
            onClick={() => setLoadAttempt((n) => n + 1)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Retry loading lesson
          </button>
          <button
            type="button"
            onClick={onBack}
            className="block w-full mt-3 text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to concepts
          </button>
        </motion.div>
      </div>
    );
  }

  const hasLoadError = conversation.some((m) => m.role === "error");
  const hasLessonReady = Boolean(
    conceptData?.content?.trim() &&
      conversation.some((m) => m.role === "assistant" && m.content?.trim())
  );

  const showDiagram =
    hasLessonReady &&
    !hasLoadError &&
    conceptData?.diagram?.nodes?.length > 0 &&
    !showingQuestions &&
    !assessmentResult &&
    !isLoading;

  return (
    <motion.div className="w-full max-w-7xl mx-auto flex flex-col h-full px-2 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 read-mode:text-[var(--read-text)] mb-4 transition"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Concepts
        </button>

        {conceptData && (
          <div>
            {isReviewMode && (
              <span className="inline-block mb-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Review mode
              </span>
            )}
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 read-mode:text-[var(--read-text-heading)] mb-2">
              Concept {conceptData.conceptOrder}: {conceptData.title}
            </h2>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 read-mode:bg-[var(--read-border)] rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (conceptData.conceptOrder / (totalConcepts || 1)) * 100
                  )}%`,
                }}
              />
            </div>
            {!showingQuestions && !assessmentResult && (
              <div className="space-y-0">
                <DisplayModeToggle />
                {conceptData.contentTerse && (
                  <ExplanationModeToggle
                    mode={explanationMode}
                    onChange={setExplanationMode}
                  />
                )}
                <LessonCardThemeToggle
                  theme={cardTheme}
                  onChange={setCardTheme}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`flex-1 flex flex-col gap-6 min-h-0 ${
          showDiagram
            ? "xl:grid xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-6 xl:items-start"
            : ""
        }`}
      >
        <div className="flex flex-col min-w-0 w-full order-1">
      <div className="flex-1 overflow-y-auto mb-6">
        <div className="space-y-6">
          <AnimatePresence>
            {conversation.map((message, index) => {
              const isConceptIntroSystem =
                message.role === "system" &&
                !showingQuestions &&
                !assessmentResult &&
                /Concept \d+:/i.test(message.content || "") &&
                conversation[index + 1]?.role === "assistant" &&
                conversation[index + 1]?.level;

              if (isConceptIntroSystem) return null;

              return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`${
                  message.role === "user" ? "flex justify-end" : ""
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
                ) : message.role === "system" ? (
                  <motion.div className="rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)] shadow-sm px-5 py-4 w-full border-l-4 border-l-blue-500">
                    <motion.div className="lesson-prose prose prose-sm max-w-none text-slate-700 dark:text-slate-300 read-mode:text-[var(--read-text)] [&_strong]:text-slate-900 dark:[&_strong]:text-slate-100 read-mode:[&_strong]:text-[var(--read-text-heading)]">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </motion.div>
                  </motion.div>
                ) : message.role === "success" ? (
                  <motion.div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
                    <motion.div className="prose prose-sm max-w-none text-gray-800">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </motion.div>
                  </motion.div>
                ) : message.role === "reteach" ? (
                  <StoryLessonContent
                    content={message.content}
                    badge="Simpler explanation"
                    cardTheme={cardTheme}
                  />
                ) : message.level ? (
                  <StoryLessonContent
                    content={getDisplayedLesson(message)}
                    level={message.level}
                    cardTheme={cardTheme}
                    isTerse={Boolean(
                      message.contentTerse && explanationMode === "terse"
                    )}
                  />
                ) : (
                  <motion.div className="bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-600 read-mode:bg-[var(--read-surface-elevated)] read-mode:border-[var(--read-border)] rounded-2xl px-5 py-4 w-full">
                    <motion.div className="lesson-prose prose prose-base prose-neutral max-w-none text-gray-800 dark:text-slate-200 read-mode:text-[var(--read-text)]">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            );
            })}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Action Area */}
      <div className="sticky bottom-0 bg-white pt-4">
        {/* Detailed Feedback Dropdown */}
        {assessmentResult?.assessment?.detailedFeedback && (
          <div className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowDetailedFeedback(!showDetailedFeedback)}
              className="w-full px-5 py-3 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-gray-800">
                  {showDetailedFeedback ? 'Hide' : 'Show'} Detailed Feedback
                </span>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-600 transition-transform ${showDetailedFeedback ? 'rotate-180' : ''}`}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <AnimatePresence>
              {showDetailedFeedback && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 space-y-4 bg-white">
                    {assessmentResult.assessment.detailedFeedback.map((item, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          item.status === 'correct' 
                            ? 'bg-green-50 border-green-200' 
                            : item.status === 'partial'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">
                            Question {item.questionNumber}
                          </h4>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.status === 'correct'
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'partial'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {item.score}/{item.maxScore} points
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-gray-600 font-medium mb-1">Question:</p>
                            <p className="text-gray-800">{item.question}</p>
                          </div>

                          <div>
                            <p className="text-gray-600 font-medium mb-1">Your Answer:</p>
                            <p className="text-gray-800 bg-white px-3 py-2 rounded border border-gray-200">
                              {item.yourAnswer}
                            </p>
                          </div>

                          <div className={`mt-3 p-3 rounded ${
                            item.status === 'correct'
                              ? 'bg-green-100'
                              : item.status === 'partial'
                              ? 'bg-yellow-100'
                              : 'bg-red-100'
                          }`}>
                            <p className="text-gray-800 leading-relaxed">
                              {item.feedback}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Overall Score:</span>
                        <span className="font-semibold text-gray-800">
                          {assessmentResult.assessment.score}/{assessmentResult.assessment.maxScore} 
                          <span className="ml-2 text-blue-600">
                            ({assessmentResult.assessment.percentage}%)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {!showingQuestions &&
          !assessmentResult &&
          !isLoading &&
          hasLessonReady &&
          !hasLoadError && (
          <button
            onClick={handleStartQuestions}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-sm"
          >
            Ready? Let&apos;s check your understanding ✨
          </button>
        )}

        {showingQuestions && !assessmentResult && currentQuestion?.type === "mcq" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleMcqSelect(option)}
                disabled={isAssessing}
                className="w-full text-left px-5 py-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition disabled:opacity-50"
              >
                <span className="font-semibold text-blue-600 mr-2">{String.fromCharCode(65 + i)})</span>
                <span className="text-gray-800">{option}</span>
              </button>
            ))}
            <p className="text-xs text-gray-500 text-center mt-2">
              Multiple choice — pick one option (about 30% of Quick Check questions).
            </p>
          </motion.div>
        )}

        {showingQuestions && !assessmentResult && currentQuestion?.type !== "mcq" && (
          <form onSubmit={handleAnswerSubmit} className="bg-white rounded-full border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 px-6 py-4">
              <input
                ref={answerInputRef}
                type="text"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                onCopy={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                placeholder="Type your answer in your own words..."
                disabled={isAssessing}
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-base disabled:opacity-50 select-none"
                style={{ 
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  userSelect: 'none'
                }}
                autoFocus
              />
              <button
                type="submit"
                disabled={!currentAnswer.trim() || isAssessing}
                className="p-2.5 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isAssessing ? (
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
        )}

        {showingQuestions && !assessmentResult && (
          <p className="text-xs text-gray-500 text-center mt-2 leading-relaxed">
            {currentQuestion?.type !== "mcq" && (
              <>
                Write in your own words — copy and paste is disabled.
                {" · "}
              </>
            )}
            <button
              type="button"
              onClick={handleSimplifyQuestion}
              disabled={isSimplifyingQuestion || isAssessing}
              className="text-gray-400 hover:text-blue-600 underline-offset-2 hover:underline disabled:opacity-40 disabled:no-underline transition"
            >
              {isSimplifyingQuestion
                ? "Getting a simpler version…"
                : "Didn't understand the question?"}
            </button>
          </p>
        )}

        {assessmentResult && !assessmentResult.passed && (
          <div className="space-y-3 mb-4">
            <p className="text-xs text-gray-500 text-center">
              Take your time — review each question above before retrying.
            </p>
            <button
              type="button"
              onClick={resetQuizForRetry}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Retry quiz (same lesson)
            </button>
            <button
              type="button"
              onClick={handleStudySimplerExplanation}
              disabled={isReteachLoading}
              className="w-full py-3.5 border-2 border-blue-300 text-blue-700 rounded-xl font-medium hover:bg-blue-50 transition disabled:opacity-50"
            >
              {isReteachLoading
                ? "Loading simpler explanation…"
                : "Study simpler explanation first"}
            </button>
          </div>
        )}

        {assessmentResult?.passed && (
          <button
            onClick={handleComplete}
            className="w-full py-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition"
          >
            Continue to Next Concept →
          </button>
        )}
      </div>
        </div>

        {showDiagram && (
          <div className="w-full order-2 xl:sticky xl:top-4">
            <LessonDiagramPanel
              diagram={conceptData.diagram}
              conceptTitle={conceptData.title}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StructuredTeaching;
