import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  startInterview,
  sendAnswer,
  API_BASE,
  createAnticheatSession,
  logAnticheatEvent,
  updateAnticheatSuspicion,
  incrementAnticheatWarning,
  dismissAnticheatSession,
  completeAnticheatSession,
} from "../api";
import { motion, AnimatePresence } from "framer-motion";
import CircularTimer from "../components/CircularTimer";
import WebcamProctor from "../components/WebcamProctor";

const Interview = () => {
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("MERN Stack");
  const [chatHistory, setChatHistory] = useState([]);
  const [questionSecondsTotal, setQuestionSecondsTotal] = useState(60);
  const [questionSecondsLeft, setQuestionSecondsLeft] = useState(60);
  const [questionDifficulty, setQuestionDifficulty] = useState("easy");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null); // For auto-focus

  // 🔒 ANTI-CHEAT STATE
  const [suspicionScore, setSuspicionScore] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [studentId] = useState(() => localStorage.getItem("studentId") || "");

  const postAnticheat = async (fn, payload) => {
    const sid = session?.sessionId;
    if (!sid) return;
    try {
      await fn(payload);
    } catch (err) {
      console.error("Anti-cheat sync failed:", err?.error || err?.message || err);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fromUrl = searchParams.get("subject");
    if (fromUrl) setSubject(fromUrl);
  }, [searchParams]);

  // Auto-focus input after question loads
  useEffect(() => {
    if (!loading && currentQuestion) {
      inputRef.current?.focus();
    }
  }, [loading, currentQuestion]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    if (!session || session.completed || isDismissed || loading) return undefined;
    const id = window.setInterval(() => {
      setQuestionSecondsLeft((x) => Math.max(0, x - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [session?.sessionId, session?.completed, isDismissed, loading, questionSecondsTotal]);

  // 🔒 ANTI-CHEAT: Handle Webcam Violations
  const handleWebcamViolation = (type, points, reason) => {
    addSuspicion(points, reason);

    // Count toward ⚠️ / 3 (WebcamProctor throttles repeats per violation type).
    // "no_face_detected" is suspicion-only — lighting/model flicker caused unfair dismissals.
    const warnsOnUi =
      type === "multiple_faces" ||
      type === "camera_denied" ||
      type === "head_turned" ||
      type === "looking_away";

    if (warnsOnUi) {
      incrementWarning(reason);
    }

    logEvent("webcam_" + type, { reason, points });
  };

  // 🔒 ANTI-CHEAT: Log Event
  const logEvent = (eventType, details = {}) => {
    const event = {
      timestamp: new Date().toISOString(),
      eventType,
      suspicionScore,
      warningCount,
      sessionId: session?.sessionId,
      ...details,
    };
    console.log("🚨 Anti-Cheat Event:", event);
    postAnticheat(logAnticheatEvent, {
      sessionId: session?.sessionId,
      eventType,
      details: event,
    });
  };

  // 🔒 ANTI-CHEAT: Add Suspicion Score
  const addSuspicion = (points, reason) => {
    const newScore = suspicionScore + points;
    setSuspicionScore(newScore);
    logEvent("suspicion_added", { points, reason, newScore });
    postAnticheat(updateAnticheatSuspicion, {
      sessionId: session?.sessionId,
      points,
      reason,
    });
  };

  // 🔒 ANTI-CHEAT: Increment Warning
  const incrementWarning = (reason) => {
    const newCount = warningCount + 1;
    setWarningCount(newCount);
    logEvent("warning_issued", { warningCount: newCount, reason });
    postAnticheat(incrementAnticheatWarning, {
      sessionId: session?.sessionId,
      reason,
    });

    if (newCount === 1) {
      alert("⚠️ WARNING #1: " + reason + "\n\nYou have 2 warnings left before dismissal.");
    } else if (newCount === 2) {
      alert("⚠️ FINAL WARNING #2: " + reason + "\n\nOne more violation and you will be dismissed!");
    } else if (newCount >= 3) {
      dismissInterview(reason);
    }
  };

  // 🔒 ANTI-CHEAT: Dismiss Interview
  const dismissInterview = (reason) => {
    setIsDismissed(true);
    logEvent("interview_dismissed", { reason, finalScore: suspicionScore });
    postAnticheat(dismissAnticheatSession, {
      sessionId: session?.sessionId,
      reason,
    });
    alert("❌ INTERVIEW DISMISSED\n\nReason: " + reason + "\n\nYou have been flagged for suspicious behavior.");
  };

  // 🔒 ANTI-CHEAT: Fullscreen Detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;

      if (!isNowFullscreen && session && !session.completed) {
        addSuspicion(20, "Exited fullscreen");
        incrementWarning("You exited fullscreen mode!");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [session, suspicionScore, warningCount]);

  // 🔒 ANTI-CHEAT: Tab Switch Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && session && !session.completed) {
        addSuspicion(20, "Tab switched");
        incrementWarning("You switched tabs or minimized the window!");
        logEvent("tab_switch");
      }
    };

    const handleBlur = () => {
      if (session && !session.completed) {
        addSuspicion(20, "Window lost focus");
        logEvent("window_blur");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [session, suspicionScore, warningCount]);

  // 🔒 ANTI-CHEAT: Block Copy/Paste/Cut (SILENT)
  useEffect(() => {
    const blockCopyPaste = (e) => {
      if (session && !session.completed) {
        e.preventDefault();
        // Silently block - no warning, just log
        const action = e.type;
        logEvent(action + "_blocked");
      }
    };

    document.addEventListener("copy", blockCopyPaste);
    document.addEventListener("paste", blockCopyPaste);
    document.addEventListener("cut", blockCopyPaste);

    return () => {
      document.removeEventListener("copy", blockCopyPaste);
      document.removeEventListener("paste", blockCopyPaste);
      document.removeEventListener("cut", blockCopyPaste);
    };
  }, [session]);

  // 🔒 ANTI-CHEAT: Block Right Click (SILENT)
  useEffect(() => {
    const blockRightClick = (e) => {
      if (session && !session.completed) {
        e.preventDefault();
        // Silently block - no warning, just log
        logEvent("right_click_blocked");
      }
    };

    document.addEventListener("contextmenu", blockRightClick);
    return () => document.removeEventListener("contextmenu", blockRightClick);
  }, [session]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await startInterview({
        subject,
        studentId,
      });
      setSession(response.data);
      setCurrentQuestion(response.data.question);
      const secs = response.data.questionTimeSeconds ?? 60;
      const diff = (response.data.difficulty || "easy").toLowerCase();
      setQuestionSecondsTotal(secs);
      setQuestionSecondsLeft(secs);
      setQuestionDifficulty(diff);
      setChatHistory([
        {
          type: "ai",
          content: response.data.question,
          timestamp: new Date(),
        },
      ]);

      try {
        await createAnticheatSession({
          sessionId: response.data.sessionId,
          studentId,
          subject,
        });
      } catch (err) {
        console.error("Failed to create anti-cheat session:", err);
      }

      // 🔒 ANTI-CHEAT: Enter fullscreen mode
      try {
        await document.documentElement.requestFullscreen();
        logEvent("interview_started", { fullscreen: true });
      } catch (err) {
        console.error("Fullscreen failed:", err);
        alert("⚠️ Please allow fullscreen mode for the interview.");
      }
    } catch (error) {
      console.error("Failed to start interview:", error);
      alert("Failed to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim() || loading) return; // CRITICAL: Prevent multiple submissions

    // Immediately set loading to prevent race conditions
    setLoading(true);

    // Add user message to chat
    const userMessage = {
      type: "user",
      content: answer,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, userMessage]);

    const currentAnswer = answer;
    setAnswer(""); // Clear input immediately

    try {
      // If interview is completed, handle as follow-up question
      if (session.completed) {
        await handleFollowUpQuestion(currentAnswer);
        return;
      }

      // Add 2-second delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await sendAnswer({
        sessionId: session.sessionId,
        answer: currentAnswer,
      });

      // During interview: NO feedback, just next question
      const aiMessages = [];
      
      // Check if interview is completed
      if (response.data.completed) {
        // Show final comprehensive feedback in chat
        const feedbackMessage = formatFinalFeedback(response.data.coachReport, response.data.final);
        
        aiMessages.push({
          type: "ai",
          content: feedbackMessage,
          isFinalFeedback: true,
          timestamp: new Date(),
        });
        
        setChatHistory((prev) => [...prev, ...aiMessages]);
        
        // Mark session as completed but KEEP CHAT ACTIVE for follow-up questions
        setSession({
          ...session,
          completed: true,
          finalReport: response.data.coachReport,
          finalScores: response.data.final
        });

        postAnticheat(completeAnticheatSession, {
          sessionId: session.sessionId,
        });
        
        return; // Stop here, but chat remains active
      } else if (response.data.nextQuestion) {
        const secs = response.data.questionTimeSeconds ?? 60;
        const diff = (response.data.difficulty || "easy").toLowerCase();
        setQuestionSecondsTotal(secs);
        setQuestionSecondsLeft(secs);
        setQuestionDifficulty(diff);
        // Just show next question, NO feedback
        aiMessages.push({
          type: "ai",
          content: response.data.nextQuestion,
          timestamp: new Date(),
        });
      }

      setChatHistory((prev) => [...prev, ...aiMessages]);
      setCurrentQuestion(response.data.nextQuestion);
    } catch (error) {
      console.error("Failed to submit answer:", error);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Enter = new line (default textarea). Ctrl/Cmd+Enter = send.
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle follow-up questions after interview completion
  const handleFollowUpQuestion = async (question) => {
    try {
      // Create context from the final report
      const context = `
Interview Feedback Summary:
${formatFinalFeedback(session.finalReport, session.finalScores)}

Student's message: "${question}"

IMPORTANT: 
- Detect the emotion behind their message (frustration, confusion, disappointment, curiosity)
- Acknowledge their feeling like a human would
- Then provide clear, actionable guidance
- Be conversational and empathetic, not robotic
`;

      const response = await fetch(`${API_BASE.replace(/\/$/, "")}/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: context }),
      });

      const chatData = await response.json();
      const followUpAnswer = chatData.answer || "I'm having trouble responding right now.";

      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          content: followUpAnswer,
          timestamp: new Date(),
        },
      ]);
      return;
    } catch (error) {
      console.error("Follow-up failed:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          content: "Sorry, I couldn't process that. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#202124]">
        
        {/* Setup Form - Gemini Style */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            <h2 className="text-4xl font-normal text-blue-500 dark:text-blue-400 text-center mb-12">
              Start your interview
            </h2>

            {/* Anti-cheat notice — mt-callout pairs bg + text in dark/light */}
            <div className="mt-callout mt-callout--warning mb-6" role="note">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-90" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold mb-1">Anti-cheat enabled</p>
                  <ul className="text-xs space-y-1 list-none opacity-95">
                    <li>• Fullscreen mode required</li>
                    <li>• Copy/paste disabled</li>
                    <li>• Tab switching monitored</li>
                    <li>• 3 warnings = dismissal</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-[#292a2d] rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Select Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="app-select w-full px-4 py-3 rounded-xl"
                >
                  <optgroup label="Full Stack Roles">
                    <option value="MERN Stack">MERN Stack Developer</option>
                    <option value="Java Full Stack">Java Full Stack Developer</option>
                    <option value="Python Full Stack">Python Full Stack Developer</option>
                  </optgroup>
                  <optgroup label="Data & ML Roles">
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="ML Engineer">ML Engineer</option>
                    <option value="Data Science">Data Scientist (General)</option>
                  </optgroup>
                  <optgroup label="Individual Technologies">
                    <option value="JavaScript">JavaScript</option>
                    <option value="React">React</option>
                    <option value="Node.js">Node.js</option>
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                    <option value="SQL">SQL</option>
                    <option value="Angular">Angular</option>
                    <option value="TypeScript">TypeScript</option>
                  </optgroup>
                </select>
              </div>

              <button
                onClick={handleStart}
                disabled={loading}
                className="w-full py-3.5 bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-gray-900 rounded-xl font-medium hover:opacity-90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Starting..." : "Begin Interview"}
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    );
  }

  // 🔒 DISMISSED SCREEN
  if (isDismissed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Dismissed</h2>
          <p className="text-gray-600 mb-4">You have been flagged for suspicious behavior.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Warnings:</span>
                <span className="font-semibold text-red-600">{warningCount}/3</span>
              </div>
              <div className="flex justify-between">
                <span>Suspicion Score:</span>
                <span className="font-semibold text-red-600">{suspicionScore}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">This session has been logged and flagged for review.</p>
        </motion.div>
      </div>
    );
  }

  return (
    /* Navbar + layout padding already consume viewport height — filling another full screen pushes the composer below the fold */
    <div className="flex flex-col w-full overflow-hidden bg-white h-[calc(100dvh-8rem)] min-h-[28rem] sm:h-[calc(100dvh-7rem)] sm:min-h-[360px]">
      
      {/* 🔒 WEBCAM PROCTORING */}
      <WebcamProctor 
        isActive={session && !session.completed && !isDismissed}
        onViolation={handleWebcamViolation}
      />

      {/* Unified Header with Interview Info */}
      <header className="flex-shrink-0 px-6 py-3 flex items-center justify-between border-b border-gray-200 bg-white">
        <div className="flex items-center gap-8">
          <button
            onClick={() => window.location.href = "/"}
            className="text-xl font-semibold text-gray-800 hover:text-blue-500 transition"
          >
            MicroTrainer
          </button>
          <div>
            <h1 className="text-lg font-normal text-gray-800">{subject} Interview</h1>
            <p className="text-xs text-gray-500">
              Question {session.currentQuestion || 1} of {session.totalQuestions || 20}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* 🔒 ANTI-CHEAT INDICATORS */}
          <div className="flex items-center gap-2 text-xs">
            <div className={`px-2 py-1 rounded ${warningCount === 0 ? 'bg-green-100 text-green-700' : warningCount === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              ⚠️ {warningCount}/3
            </div>
            <div className="px-2 py-1 rounded bg-gray-100 text-gray-700">
              Score: {suspicionScore}
            </div>
          </div>
          {session && !session.completed && (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  {questionDifficulty}
                </span>
                <span className="text-[9px] text-gray-400 tabular-nums">
                  {questionSecondsTotal >= 60
                    ? `${Math.round(questionSecondsTotal / 60)} min`
                    : `${questionSecondsTotal}s`}
                </span>
              </div>
              <CircularTimer
                timeLeft={questionSecondsLeft}
                total={questionSecondsTotal}
              />
            </div>
          )}
        </div>
      </header>

      {/* Chat scrolls; input stays visible (flex footer — min-h-0 lets flex-1 shrink inside viewport) */}
      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 overscroll-contain">
        <div className="max-w-3xl mx-auto space-y-6 pb-2">
          
          <AnimatePresence>
            {chatHistory.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-gray-500 text-sm"
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
              <span>Analyzing your answer...</span>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Composer pinned to bottom of interview panel (not below viewport) */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 sm:px-6 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-end gap-3 px-5 py-3">
              <textarea
                ref={inputRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={session?.completed ? "Ask me about your feedback..." : "Type your answer..."}
                rows={3}
                disabled={loading}
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 outline-none text-base resize-none max-h-32 disabled:opacity-50 disabled:cursor-not-allowed select-none"
                style={{ minHeight: "24px", userSelect: "none" }}
                onCopy={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !answer.trim()}
                className="p-2.5 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2 leading-relaxed">
            Press Enter for a new line. Ctrl+Enter (⌘+Enter on Mac) to send.
            <span className="block mt-1 text-gray-400">
              Answers are scored by AI on clarity and correctness (including code snippets if you paste them).
              Code is not executed here — use Problems for runnable coding.
            </span>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Interview;

/* ================= FORMAT FINAL FEEDBACK ================= */

const formatFinalFeedback = (coachReport, finalScores) => {
  if (!coachReport) {
    return "Interview Complete. Your feedback is being prepared...";
  }

  const { feedbackText, overallPerformance } = coachReport;
  const { averageScore, verdict } = finalScores || {};

  // If we have the formatted feedback text from backend, use it directly
  if (feedbackText && feedbackText.includes('OVERALL FEEDBACK')) {
    return `INTERVIEW COMPLETE

${feedbackText}

---

FINAL SCORE: ${averageScore}/10
VERDICT: ${verdict}

---

You can now ask questions about this feedback.`;
  }

  // Fallback format (shouldn't happen with new backend)
  return `INTERVIEW COMPLETE

OVERALL PERFORMANCE:
${overallPerformance || "Evaluation complete"}

FINAL SCORE: ${averageScore}/10
VERDICT: ${verdict}

---

You can now ask questions about this feedback.`;
};

/* ================= CHAT MESSAGE COMPONENT ================= */

const ChatMessage = ({ message }) => {
  const isUser = message.type === "user";
  const isFeedback = message.isFeedback;
  const isFinalFeedback = message.isFinalFeedback;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      )}
      
      <div className={`max-w-2xl ${isUser ? "ml-auto" : ""}`}>
        <div
          className={`rounded-2xl px-5 py-3 ${
            isUser
              ? "bg-blue-500 text-white"
              : isFinalFeedback
              ? "bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 text-gray-800"
              : isFeedback
              ? "bg-green-50 border border-green-200 text-gray-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {isFinalFeedback ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-400">
                <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-base font-bold text-green-800 uppercase tracking-wide">Final Feedback</span>
              </div>
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono">{message.content}</pre>
            </div>
          ) : isFeedback ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-green-700">Feedback</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </motion.div>
  );
};
