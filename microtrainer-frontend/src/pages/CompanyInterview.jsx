import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Building2, Sparkles, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { companyInterviewAPI } from "../api/companyInterview";
import { getStudentId } from "../utils/studentAuth";
import { btnPrimary, btnSecondary, card, textMuted } from "../lib/ui";
import CircularTimer from "../components/CircularTimer";

function eligibilityStyle(fitResult) {
  if (fitResult?.eligible) {
    return {
      ring: "border-emerald-300 dark:border-emerald-700",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-800 dark:text-emerald-200",
      badge: "ELIGIBLE",
      badgeClass: "bg-emerald-600 text-white dark:bg-emerald-500",
      icon: CheckCircle2,
    };
  }
  if (fitResult?.eligibilityStatus === "near_eligible") {
    return {
      ring: "border-amber-300 dark:border-amber-700",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-900 dark:text-amber-100",
      badge: "NOT ELIGIBLE YET",
      badgeClass: "bg-amber-600 text-white dark:bg-amber-500",
      icon: AlertCircle,
    };
  }
  return {
    ring: "border-red-200 dark:border-red-900",
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-800 dark:text-red-200",
    badge: "NOT ELIGIBLE",
    badgeClass: "bg-red-600 text-white dark:bg-red-500",
    icon: XCircle,
  };
}

export default function CompanyInterview() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const studentId = getStudentId();
  const inputRef = useRef(null);

  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [fitResult, setFitResult] = useState(null);
  const [questionSecondsTotal, setQuestionSecondsTotal] = useState(90);
  const [questionSecondsLeft, setQuestionSecondsLeft] = useState(90);
  const [questionDifficulty, setQuestionDifficulty] = useState("medium");
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    if (!session || session.completed || loading) return undefined;
    const id = window.setInterval(() => {
      setQuestionSecondsLeft((x) => Math.max(0, x - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [session?.sessionId, session?.completed, loading, questionSecondsTotal]);

  useEffect(() => {
    if (!loading && currentQuestion && !fitResult) {
      inputRef.current?.focus();
    }
  }, [loading, currentQuestion, fitResult]);

  const pushHistory = useCallback((entry) => {
    setChatHistory((prev) => [...prev, entry]);
  }, []);

  const handleStart = async () => {
    setStarting(true);
    setError("");
    try {
      const res = await companyInterviewAPI.startSession({
        companyId,
        studentId: studentId || "anonymous",
      });
      const data = res.data;
      setSession(data);
      setCurrentQuestion(data.question);
      setQuestionSecondsTotal(data.questionTimeSeconds || 90);
      setQuestionSecondsLeft(data.questionTimeSeconds || 90);
      setQuestionDifficulty(data.difficulty || "medium");
      pushHistory({
        type: "system",
        content: `${data.companyName} mock started — ${data.totalQuestions} questions, slightly above real company level.`,
      });
      pushHistory({ type: "question", content: data.question });
    } catch (err) {
      setError(err?.error || err?.message || "Could not start mock.");
    } finally {
      setStarting(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!answer.trim() || loading || !session || fitResult) return;

    const studentAnswer = answer.trim();
    setAnswer("");
    pushHistory({ type: "answer", content: studentAnswer });
    setLoading(true);
    setError("");

    try {
      const res = await companyInterviewAPI.submitAnswer({
        sessionId: session.sessionId,
        answer: studentAnswer,
      });
      const data = res.data;

      if (data.isClarification) {
        pushHistory({ type: "clarification", content: data.interviewerMessage });
        setCurrentQuestion(data.nextQuestion);
        setQuestionSecondsTotal((data.questionTimeSeconds || 90) + (data.bonusSeconds || 0));
        setQuestionSecondsLeft((data.questionTimeSeconds || 90) + (data.bonusSeconds || 0));
        pushHistory({ type: "question", content: data.nextQuestion });
        return;
      }

      if (data.score != null) {
        pushHistory({
          type: "feedback",
          content: `Score: ${data.score}/10`,
          detail: [data.strengths, data.mistakes, data.improvement].filter(Boolean).join(" "),
        });
      }

      if (data.completed) {
        setFitResult(data.fitResult);
        setSession((prev) => ({ ...prev, completed: true }));
        pushHistory({
          type: "fit",
          content: data.fitResult?.fitLabel || "Mock complete",
        });
        return;
      }

      setCurrentQuestion(data.nextQuestion);
      setQuestionSecondsTotal(data.questionTimeSeconds || 90);
      setQuestionSecondsLeft(data.questionTimeSeconds || 90);
      setQuestionDifficulty(data.difficulty || "medium");
      setSession((prev) => ({
        ...prev,
        currentQuestion: data.currentQuestion,
        totalQuestions: data.totalQuestions,
      }));
      pushHistory({ type: "question", content: data.nextQuestion });
    } catch (err) {
      setError(err?.error || err?.message || "Submit failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEndEarly = async () => {
    if (!session || fitResult) return;
    const ok = window.confirm("End this company mock early? Partial fit assessment will be saved.");
    if (!ok) return;

    setLoading(true);
    try {
      const res = await companyInterviewAPI.abandonSession({
        sessionId: session.sessionId,
        reason: "Student ended early",
      });
      if (res.data?.fitResult) {
        setFitResult(res.data.fitResult);
      }
      setSession((prev) => ({ ...prev, completed: true }));
    } catch (err) {
      setError(err?.error || err?.message || "Could not end session.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setSession(null);
    setFitResult(null);
    setChatHistory([]);
    setAnswer("");
    setError("");
    window.setTimeout(() => handleStart(), 0);
  };

  if (!session) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <button
          type="button"
          onClick={() => navigate("/company-interviews")}
          className={`${btnSecondary} mb-6`}
        >
          <ArrowLeft className="h-4 w-4" />
          All companies
        </button>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`${card} max-w-md w-full p-6 text-center`}>
          <Building2 className="h-10 w-10 mx-auto mb-3 text-[#1a73e8] dark:text-[#8ab4f8]" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Company mock interview
          </h2>
          <p className={`${textMuted} text-sm mb-6`}>
            We run a mock slightly harder than the real round, then decide if you are{" "}
            <strong>eligible to attend the real company interview</strong>.
          </p>
          {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}
          <button
            type="button"
            onClick={handleStart}
            disabled={starting}
            className={`${btnPrimary} w-full`}
          >
            {starting ? "Preparing questions..." : "Start mock interview"}
          </button>
        </motion.div>
      </div>
    );
  }

  const FitIcon = fitResult ? eligibilityStyle(fitResult).icon : null;
  const elig = fitResult ? eligibilityStyle(fitResult) : null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-3xl mx-auto w-full px-4 py-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <button type="button" onClick={() => navigate("/company-interviews")} className={btnSecondary}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="text-center flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wide text-gray-400">Company mock</p>
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{session.companyName}</p>
        </div>
        {!fitResult && (
          <button type="button" onClick={handleEndEarly} disabled={loading} className={btnSecondary}>
            End early
          </button>
        )}
      </div>

      {!fitResult && (
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-sm text-gray-500">
            Question {session.currentQuestion || 1} / {session.totalQuestions}
          </p>
          <CircularTimer
            secondsLeft={questionSecondsLeft}
            totalSeconds={questionSecondsTotal}
            size={48}
          />
        </div>
      )}

      <div className={`${card} flex-1 flex flex-col min-h-[320px] p-4 sm:p-5 mb-4 overflow-hidden`}>
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={
                msg.type === "answer"
                  ? "ml-8 text-right"
                  : msg.type === "question"
                    ? ""
                    : "text-center"
              }
            >
              {msg.type === "system" && (
                <p className="text-xs text-gray-400">{msg.content}</p>
              )}
              {msg.type === "question" && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                  <p className="text-[10px] uppercase tracking-wide text-blue-500 mb-1">Interviewer</p>
                  {msg.content}
                </div>
              )}
              {msg.type === "answer" && (
                <div className="inline-block rounded-xl bg-gray-100 dark:bg-[#202124] px-4 py-3 text-sm text-left text-gray-800 dark:text-gray-100 max-w-[90%]">
                  {msg.content}
                </div>
              )}
              {msg.type === "feedback" && (
                <p className="text-xs text-gray-500 mt-1">
                  {msg.content}
                  {msg.detail ? ` — ${msg.detail}` : ""}
                </p>
              )}
              {msg.type === "clarification" && (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">{msg.content}</p>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <AnimatePresence>
          {fitResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-5 ${elig.ring} ${elig.bg}`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`text-xs font-bold tracking-wider px-3 py-1 rounded-full ${elig.badgeClass}`}>
                  {elig.badge}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Pass bar: {fitResult.passScore}/10 · Your score: {fitResult.averageScore}/10
                </span>
              </div>

              <div className="flex items-start gap-3 mb-4">
                {FitIcon && <FitIcon className={`h-7 w-7 shrink-0 ${elig.text}`} />}
                <div>
                  <p className={`text-xl font-semibold ${elig.text}`}>
                    {fitResult.fitLabel}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {fitResult.fitReport?.headline || fitResult.fitSummary}
                  </p>
                  {fitResult.fitReport?.eligibilityAdvice && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {fitResult.fitReport.eligibilityAdvice}
                    </p>
                  )}
                  {!fitResult.eligible && fitResult.eligibilityReason && (
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-2">
                      {fitResult.eligibilityReason}
                    </p>
                  )}
                </div>
              </div>

              {fitResult.fitReport?.strengths?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium uppercase text-emerald-600 dark:text-emerald-400 mb-1">
                    Strengths
                  </p>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    {fitResult.fitReport.strengths.map((s, i) => (
                      <li key={i}>✓ {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {fitResult.fitReport?.gaps?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium uppercase text-amber-600 dark:text-amber-400 mb-1">
                    Gaps to fix
                  </p>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    {fitResult.fitReport.gaps.map((s, i) => (
                      <li key={i}>→ {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {fitResult.fitReport?.prepPlan?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium uppercase text-blue-600 dark:text-blue-400 mb-1">
                    {fitResult.eligible ? "Before the real interview" : "To become eligible"}
                  </p>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    {fitResult.fitReport.prepPlan.map((s, i) => (
                      <li key={i}>{i + 1}. {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => navigate("/company-interviews")} className={btnPrimary}>
                  Try another company
                </button>
                <button type="button" onClick={handleRetry} className={btnSecondary}>
                  Retry {session.companyName}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!fitResult && (
          <form onSubmit={handleSubmit} className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
              Your answer
            </label>
            <textarea
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={loading}
              rows={4}
              placeholder="Answer as you would in the interview..."
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#202124] px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 disabled:opacity-60"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !loading) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            {error && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>}
            <button
              type="submit"
              disabled={!answer.trim() || loading}
              className={`${btnPrimary} mt-3 w-full sm:w-auto`}
            >
              {loading ? (
                "Reviewing..."
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Submit answer
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-2">Ctrl+Enter to submit · {questionDifficulty} question</p>
          </form>
        )}
      </div>
    </div>
  );
}
