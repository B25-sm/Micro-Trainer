import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, X, Loader2 } from "lucide-react";
import { chatQuickCheck } from "../api";
import useClipboardGuard from "../hooks/useClipboardGuard";

/**
 * Optional, skippable "Test yourself" card shown after a student learns a
 * concept on Home. Taking it produces a real scored signal (via /chat/quick-check)
 * that moves the student's readiness toward "Good".
 */
export default function QuickCheckCard({ topic }) {
  const [phase, setPhase] = useState("offer"); // offer | loading | answering | grading | result | dismissed
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useClipboardGuard(phase === "answering" || phase === "grading");

  if (phase === "dismissed") return null;

  const start = async () => {
    setPhase("loading");
    setError("");
    try {
      const res = await chatQuickCheck({ mode: "generate", topic });
      const qs = res.data?.questions || [];
      if (qs.length === 0) throw new Error("No questions");
      setQuestions(qs);
      setAnswers(qs.map(() => ""));
      setPhase("answering");
    } catch {
      setError("Couldn't start the quick check. Try again later.");
      setPhase("offer");
    }
  };

  const submit = async () => {
    setPhase("grading");
    setError("");
    try {
      const res = await chatQuickCheck({ mode: "grade", topic, questions, answers });
      setResult(res.data);
      setPhase("result");
    } catch {
      setError("Couldn't grade your answers. Try again.");
      setPhase("answering");
    }
  };

  const shortTopic = topic.length > 70 ? `${topic.slice(0, 70)}…` : topic;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-blue-200 dark:border-blue-900 bg-[#e8f0fe]/60 dark:bg-blue-950/30 px-4 py-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <GraduationCap className="h-5 w-5 shrink-0 text-[#7c3aed] dark:text-[#a78bfa] mt-0.5" strokeWidth={1.75} />
            <div className="min-w-0">
              {phase === "offer" && (
                <>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Test yourself on this
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    A quick 2-question check locks in your progress toward being mock-ready.
                  </p>
                </>
              )}
              {phase === "loading" && (
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Preparing your quick check…
                </p>
              )}
              {phase === "result" && result && (
                <>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {result.passed ? "Nice — you know this!" : "Good attempt — keep practicing"} ({result.score}/100)
                  </p>
                  {result.feedback && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{result.feedback}</p>
                  )}
                </>
              )}
              {(phase === "answering" || phase === "grading") && (
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Quick check: {shortTopic}
                </p>
              )}
              {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {phase === "offer" && (
              <button
                type="button"
                onClick={start}
                className="rounded-lg bg-[#7c3aed] dark:bg-[#a78bfa] px-3 py-1.5 text-xs font-medium text-white dark:text-gray-900 hover:opacity-90"
              >
                Test me
              </button>
            )}
            <button
              type="button"
              onClick={() => setPhase("dismissed")}
              className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Dismiss quick check"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {phase === "answering" && (
          <div className="mt-3 space-y-3">
            {questions.map((q, i) => (
              <div key={i}>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {i + 1}. {q}
                </p>
                <textarea
                  value={answers[i]}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#202124] px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  placeholder="Your answer…"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={submit}
              disabled={answers.every((a) => !a.trim())}
              className="rounded-lg bg-[#7c3aed] dark:bg-[#a78bfa] px-3 py-1.5 text-xs font-medium text-white dark:text-gray-900 hover:opacity-90 disabled:opacity-50"
            >
              Submit answers
            </button>
          </div>
        )}

        {phase === "grading" && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Grading…
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
