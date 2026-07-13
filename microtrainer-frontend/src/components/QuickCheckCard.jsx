import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, X, Loader2 } from "lucide-react";
import { chatQuickCheck } from "../api";
import useClipboardGuard from "../hooks/useClipboardGuard";

const PREPARATION_TURNS = 3;
const PREPARATION_MS = 6 * 60 * 1000;

/** Adaptive two-stage knowledge check for a focused Home chat session. */
export default function QuickCheckCard({
  topic,
  sessionId,
  userTurnCount = 0,
  focusStartedAt,
  forceOffer = false,
  onOutcome,
}) {
  const [phase, setPhase] = useState("offer");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [dismissedDuringForcedOffer, setDismissedDuringForcedOffer] = useState(false);
  const [attemptTurn, setAttemptTurn] = useState(null);
  const recordedOffers = useRef(new Set());

  useClipboardGuard(phase === "answering" || phase === "grading");

  useEffect(() => {
    let active = true;
    chatQuickCheck({ mode: "status", topic })
      .then((res) => {
        if (active) setProgress(res.data);
      })
      .catch(() => {
        if (active) setProgress({ hasHistory: false, eligible: true, status: "not_offered" });
      });
    return () => {
      active = false;
    };
  }, [topic]);

  useEffect(() => {
    if (!focusStartedAt || userTurnCount >= PREPARATION_TURNS) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, [focusStartedAt, userTurnCount]);

  const prepared =
    userTurnCount >= PREPARATION_TURNS ||
    (focusStartedAt && now - Number(focusStartedAt) >= PREPARATION_MS);
  const spacedRecallDue = Boolean(progress?.hasHistory && progress?.eligible);
  const preparedOffer = Boolean(
    prepared && progress && (!progress.hasHistory || progress.eligible)
  );
  const shouldOffer = Boolean(forceOffer || preparedOffer || spacedRecallDue);
  const effectivePhase = phase === "dismissed" && forceOffer && !dismissedDuringForcedOffer
    ? "offer"
    : phase;
  const visible = shouldOffer && effectivePhase !== "dismissed";

  useEffect(() => {
    if (!visible || effectivePhase !== "offer") return;
    const stage = forceOffer ? "end" : spacedRecallDue ? "spaced" : "prepared";
    if (recordedOffers.current.has(stage)) return;
    recordedOffers.current.add(stage);
    chatQuickCheck({ mode: "event", event: "offered", topic, sessionId }).catch(() => {});
  }, [effectivePhase, forceOffer, sessionId, spacedRecallDue, topic, visible]);

  const start = async () => {
    setAttemptTurn(userTurnCount);
    setPhase("loading");
    setError("");
    try {
      const res = await chatQuickCheck({ mode: "generate", topic, sessionId });
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
      const res = await chatQuickCheck({
        mode: "grade",
        topic,
        sessionId,
        questions,
        answers,
      });
      setResult(res.data);
      setPhase("result");
      onOutcome?.("submitted", { forced: forceOffer, result: res.data });
    } catch {
      setError("Couldn't grade your answers. Try again.");
      setPhase("answering");
    }
  };

  const dismiss = () => {
    const event = phase === "answering" || phase === "grading" ? "abandoned" : "dismissed";
    chatQuickCheck({ mode: "event", event, topic, sessionId }).catch(() => {});
    if (forceOffer) setDismissedDuringForcedOffer(true);
    setPhase("dismissed");
    onOutcome?.(event, { forced: forceOffer });
  };

  const shortTopic = topic.length > 70 ? `${topic.slice(0, 70)}…` : topic;
  const retryReady = Boolean(
    phase === "result" && result && !result.passed && attemptTurn != null && userTurnCount >= attemptTurn + 2
  );
  const offerCopy = useMemo(() => {
    if (forceOffer) return "Before you move on, take a 2-question check—or skip it for later.";
    if (spacedRecallDue) return "A quick recall check will show what you still remember.";
    return "You've explored this topic enough for a quick 2-question check.";
  }, [forceOffer, spacedRecallDue]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-blue-200 bg-[#e8f0fe]/60 px-4 py-3 dark:border-blue-900 dark:bg-blue-950/30"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[#7c3aed] dark:text-[#a78bfa]" strokeWidth={1.75} />
            <div className="min-w-0">
              {effectivePhase === "offer" && (
                <>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {forceOffer ? "Check understanding before moving on?" : spacedRecallDue ? "Time for a recall check" : "Ready to test yourself?"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{offerCopy}</p>
                </>
              )}
              {effectivePhase === "loading" && (
                <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Loader2 className="h-4 w-4 animate-spin" /> Preparing your quick check…
                </p>
              )}
              {effectivePhase === "result" && result && (
                <>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {result.passed ? "Verified — you know this!" : "Keep practicing, then retry"} ({result.score}/100)
                  </p>
                  {result.feedback && <p className="text-xs text-gray-500 dark:text-gray-400">{result.feedback}</p>}
                  {!result.passed && !retryReady && (
                    <p className="mt-1 text-xs text-violet-600 dark:text-violet-300">
                      Ask a couple of follow-ups, then a fresh check will unlock.
                    </p>
                  )}
                  {retryReady && (
                    <button
                      type="button"
                      onClick={start}
                      className="mt-2 rounded-lg border border-violet-300 px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-950/40"
                    >
                      Try a fresh check
                    </button>
                  )}
                </>
              )}
              {(effectivePhase === "answering" || effectivePhase === "grading") && (
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Quick check: {shortTopic}</p>
              )}
              {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {effectivePhase === "offer" && (
              <button
                type="button"
                onClick={start}
                className="rounded-lg bg-[#7c3aed] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 dark:bg-[#a78bfa] dark:text-gray-900"
              >
                Test me
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label={forceOffer ? "Skip quick check for later" : "Dismiss quick check"}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {effectivePhase === "answering" && (
          <div className="mt-3 space-y-3">
            {questions.map((q, i) => (
              <div key={q}>
                <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">{i + 1}. {q}</p>
                <textarea
                  value={answers[i]}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-[#202124] dark:text-gray-100"
                  placeholder="Your answer…"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={submit}
              disabled={answers.every((answer) => !answer.trim())}
              className="rounded-lg bg-[#7c3aed] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 dark:bg-[#a78bfa] dark:text-gray-900"
            >
              Submit answers
            </button>
          </div>
        )}

        {effectivePhase === "grading" && (
          <p className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" /> Grading…
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
