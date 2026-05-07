import { useState, useEffect, useRef } from "react";
import { startInterview, sendAnswer } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import CircularTimer from "../components/CircularTimer";
import FeedbackCard from "../components/FeedbackCard";
import WebcamProctor from "../components/WebcamProctor";

const Interview = () => {
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("JavaScript");
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null); // For auto-focus

  // 🔒 ANTI-CHEAT STATE
  const [suspicionScore, setSuspicionScore] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [eventLog, setEventLog] = useState([]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-focus input after question loads
  useEffect(() => {
    if (!loading && currentQuestion) {
      inputRef.current?.focus();
    }
  }, [loading, currentQuestion]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // 🔒 ANTI-CHEAT: Handle Webcam Violations
  const handleWebcamViolation = (type, points, reason) => {
    addSuspicion(points, reason);
    
    // Only warn for serious violations
    if (type === "multiple_faces" || type === "camera_denied") {
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
      ...details
    };
    setEventLog(prev => [...prev, event]);
    console.log("🚨 Anti-Cheat Event:", event);
  };

  // 🔒 ANTI-CHEAT: Add Suspicion Score
  const addSuspicion = (points, reason) => {
    const newScore = suspicionScore + points;
    setSuspicionScore(newScore);
    logEvent("suspicion_added", { points, reason, newScore });
  };

  // 🔒 ANTI-CHEAT: Increment Warning
  const incrementWarning = (reason) => {
    const newCount = warningCount + 1;
    setWarningCount(newCount);
    logEvent("warning_issued", { warningCount: newCount, reason });

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
    alert("❌ INTERVIEW DISMISSED\n\nReason: " + reason + "\n\nYou have been flagged for suspicious behavior.");
  };

  // 🔒 ANTI-CHEAT: Fullscreen Detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

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
        studentId: "student_" + Date.now(),
      });
      setSession(response.data);
      setCurrentQuestion(response.data.question);
      setChatHistory([
        {
          type: "ai",
          content: response.data.question,
          timestamp: new Date(),
        },
      ]);

      // 🔒 ANTI-CHEAT: Create session in backend
      try {
        await fetch("http://localhost:5000/anticheat/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: response.data.sessionId,
            studentId: "student_" + Date.now(),
            subject
          })
        });
      } catch (err) {
        console.error("Failed to create anti-cheat session:", err);
      }

      // 🔒 ANTI-CHEAT: Enter fullscreen mode
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
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
        
        return; // Stop here, but chat remains active
      } else if (response.data.nextQuestion) {
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle follow-up questions after interview completion
  const handleFollowUpQuestion = async (question) => {
    try {
      // Create context from the final report
      const context = `
You just completed an interview. Here was your feedback:

${formatFinalFeedback(session.finalReport, session.finalScores)}

The candidate is now asking: "${question}"

Respond as Sai Mahendra - be direct, helpful, and provide actionable advice.
`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY || ""}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You are Sai Mahendra, a direct and practical AI trainer. Answer follow-up questions about interview feedback clearly and actionably."
            },
            {
              role: "user",
              content: context
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || "I'm here to help! Can you rephrase that?";

      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          content: aiResponse,
          timestamp: new Date(),
        }
      ]);

    } catch (error) {
      console.error("Follow-up error:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          content: "Sorry, I couldn't process that. Try asking again!",
          timestamp: new Date(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-50">
        
        {/* Minimal Header */}
        <header className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-normal text-gray-800">MicroTrainer</h1>
          </div>
        </header>

        {/* Setup Form - Gemini Style */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            <h2 className="text-4xl font-normal text-blue-500 text-center mb-12">
              Start your interview
            </h2>

            {/* 🔒 ANTI-CHEAT WARNING */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-yellow-800 mb-1">Anti-Cheat Enabled</h3>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Fullscreen mode required</li>
                    <li>• Copy/paste disabled</li>
                    <li>• Tab switching monitored</li>
                    <li>• 3 warnings = dismissal</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="JavaScript">JavaScript</option>
                  <option value="React">React</option>
                  <option value="Node.js">Node.js</option>
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                </select>
              </div>

              <button
                onClick={handleStart}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-50">
      
      {/* 🔒 WEBCAM PROCTORING */}
      <WebcamProctor 
        isActive={session && !session.completed && !isDismissed}
        onViolation={handleWebcamViolation}
      />

      {/* Minimal Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
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
          <CircularTimer duration={30} />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Chat Area - Gemini Style */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          
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

      {/* Input Area - Fixed at Bottom - Gemini Style */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-end gap-3 px-5 py-3">
              <textarea
                ref={inputRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={session?.completed ? "Ask me about your feedback..." : "Type your answer..."}
                rows={1}
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
          <p className="text-xs text-gray-500 text-center mt-3">
            Press Enter to send, Shift+Enter for new line
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
