import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareText,
  Sparkles,
  ChevronRight,
  History,
  RotateCcw,
} from "lucide-react";
import { communicationReviewAPI } from "../api/communicationReview";
import { getStudentId } from "../utils/studentAuth";
import {
  pageShell,
  headingPage,
  textMuted,
  btnPrimary,
  btnSecondary,
  card,
} from "../lib/ui";

const DIMENSION_ORDER = [
  "clarity",
  "structure",
  "conciseness",
  "confidence",
  "professionalism",
];

function scoreColor(score) {
  if (score >= 8) return "bg-emerald-500";
  if (score >= 6) return "bg-[#1a73e8] dark:bg-[#8ab4f8]";
  return "bg-amber-500";
}

function verdictStyle(verdict = "") {
  const v = verdict.toLowerCase();
  if (v.includes("strong")) {
    return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  }
  if (v.includes("solid") || v.includes("polish")) {
    return "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
  }
  return "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800";
}

export default function CommunicationReview() {
  const studentId = getStudentId();
  const [scenarios, setScenarios] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const selectedScenario = useMemo(
    () => scenarios.find((s) => s.id === selectedId) || null,
    [scenarios, selectedId]
  );

  const activePrompt =
    customPrompt.trim() || selectedScenario?.prompt || "";

  const groupedScenarios = useMemo(() => {
    const groups = {};
    scenarios.forEach((s) => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [scenarios]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [scenRes, histRes] = await Promise.all([
        communicationReviewAPI.getScenarios(),
        studentId
          ? communicationReviewAPI.getHistory(studentId)
          : Promise.resolve({ data: { history: [] } }),
      ]);
      setScenarios(scenRes.data.scenarios || []);
      setHistory(histRes.data.history || []);
      if (!selectedId && scenRes.data.scenarios?.length) {
        setSelectedId(scenRes.data.scenarios[0].id);
      }
    } catch (err) {
      setError(err?.error || err?.message || "Failed to load communication review.");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!response.trim() || submitting) return;

    setSubmitting(true);
    setError("");
    setResult(null);

    try {
      const res = await communicationReviewAPI.submitReview(studentId || "anonymous", {
        studentId: studentId || "anonymous",
        scenarioId: customPrompt.trim() ? null : selectedId,
        customPrompt: customPrompt.trim() || null,
        response: response.trim(),
      });
      setResult(res.data.review);
      if (studentId) {
        const histRes = await communicationReviewAPI.getHistory(studentId);
        setHistory(histRes.data.history || []);
      }
    } catch (err) {
      setError(err?.error || err?.message || "Review failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setResponse("");
    setResult(null);
    setError("");
  };

  const loadFromHistory = (entry) => {
    setResult(entry);
    setResponse(entry.response || "");
    if (entry.scenarioId) {
      setSelectedId(entry.scenarioId);
      setCustomPrompt("");
    } else {
      setCustomPrompt(entry.prompt || "");
      setSelectedId(null);
    }
    setShowHistory(false);
  };

  const wordCount = response.trim() ? response.trim().split(/\s+/).length : 0;

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[50vh] ${pageShell}`}>
        <p className={textMuted}>Loading communication review...</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${pageShell}`}>
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col flex-1 min-h-0">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquareText
                className="h-6 w-6 text-[#1a73e8] dark:text-[#8ab4f8]"
                strokeWidth={1.75}
              />
              <h1 className={headingPage}>Communication Review</h1>
            </div>
            <p className={`${textMuted} max-w-xl`}>
              Practice how you say things — clarity, structure, and confidence — separate from
              technical mock interviews.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                className={btnSecondary}
              >
                <History className="h-4 w-4" />
                Past reviews ({history.length})
              </button>
            )}
            {(response || result) && (
              <button type="button" onClick={resetForm} className={btnSecondary}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            )}
          </div>
        </header>

        <div className="flex flex-1 min-h-0 gap-6 flex-col lg:flex-row">
          {/* Scenario picker */}
          <aside className="lg:w-72 shrink-0 space-y-4">
            <div className={`${card} p-4 max-h-[420px] lg:max-h-none overflow-y-auto`}>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                Practice prompts
              </p>
              {Object.entries(groupedScenarios).map(([category, items]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mb-1.5 px-1">
                    {category}
                  </p>
                  <ul className="space-y-1">
                    {items.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(s.id);
                            setCustomPrompt("");
                            setResult(null);
                          }}
                          className={`w-full text-left text-sm px-3 py-2 rounded-lg transition flex items-start gap-2 ${
                            selectedId === s.id && !customPrompt.trim()
                              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                          }`}
                        >
                          <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 opacity-50" />
                          <span className="line-clamp-2">{s.prompt}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className={`${card} p-4`}>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">
                Or your own prompt
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => {
                  setCustomPrompt(e.target.value);
                  if (e.target.value.trim()) setSelectedId(null);
                }}
                rows={3}
                placeholder="e.g. Explain a gap in your resume..."
                className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#202124] px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 dark:focus:ring-[#8ab4f8]/20"
              />
            </div>
          </aside>

          {/* Main practice area */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {showHistory && history.length > 0 && (
              <div className={`${card} p-4`}>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Recent reviews
                </p>
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {history.map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => loadFromHistory(h)}
                        className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 flex justify-between gap-2"
                      >
                        <span className="truncate text-gray-700 dark:text-gray-300">
                          {h.prompt}
                        </span>
                        <span className="shrink-0 text-xs font-medium text-[#1a73e8] dark:text-[#8ab4f8]">
                          {h.overallScore}/10
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={`${card} p-5 sm:p-6 flex-1 flex flex-col min-h-0`}>
              {activePrompt ? (
                <>
                  <div className="mb-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
                      Interviewer asks
                    </p>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-snug">
                      {activePrompt}
                    </p>
                    {selectedScenario?.hint && !customPrompt.trim() && (
                      <p className={`${textMuted} mt-2 text-sm`}>
                        Tip: {selectedScenario.hint}
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 gap-4">
                    <div className="flex-1 flex flex-col min-h-[180px]">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Your answer (type as you would speak)
                      </label>
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        disabled={submitting}
                        rows={8}
                        placeholder="Start speaking your answer here — complete sentences, as in a real interview..."
                        className="flex-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#202124] px-4 py-3 text-sm sm:text-base text-gray-800 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 dark:focus:ring-[#8ab4f8]/20 disabled:opacity-60"
                      />
                      <p className="text-xs text-gray-400 mt-1.5 text-right">
                        {wordCount} words · aim for 80–150 for most prompts
                      </p>
                    </div>

                    {error && (
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={!response.trim() || submitting || !activePrompt}
                      className={`${btnPrimary} w-full sm:w-auto self-end`}
                    >
                      {submitting ? (
                        "Reviewing your delivery..."
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Get communication review
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <p className={textMuted}>Select a prompt or write your own to begin.</p>
              )}
            </div>

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`${card} p-5 sm:p-6 space-y-5`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        Your review
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                        {result.overallScore}
                        <span className="text-base font-normal text-gray-500"> / 10</span>
                      </p>
                    </div>
                    <span
                      className={`text-sm font-medium px-3 py-1.5 rounded-full border ${verdictStyle(
                        result.overallVerdict
                      )}`}
                    >
                      {result.overallVerdict}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {DIMENSION_ORDER.map((key) => {
                      const dim = result.dimensions?.[key];
                      if (!dim) return null;
                      const score = Number(dim.score) || 0;
                      return (
                        <div
                          key={key}
                          className="rounded-lg bg-gray-50 dark:bg-[#202124]/80 px-3 py-2.5"
                        >
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {dim.label || key}
                            </span>
                            <span className="text-gray-500">{score}/10</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${scoreColor(score)}`}
                              style={{ width: `${score * 10}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                            {dim.feedback}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {result.fillerWords?.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Filler words spotted:{" "}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {result.fillerWords.join(", ")}
                      </span>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    {result.strengths?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2">
                          What worked
                        </p>
                        <ul className="space-y-1.5">
                          {result.strengths.map((s, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-600 dark:text-gray-400 flex gap-2"
                            >
                              <span className="text-emerald-500">✓</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.improvements?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
                          Improve next time
                        </p>
                        <ul className="space-y-1.5">
                          {result.improvements.map((s, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-600 dark:text-gray-400 flex gap-2"
                            >
                              <span className="text-amber-500">→</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {result.rewrittenSample && (
                    <div className="rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">
                        Tighter version you could say
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {result.rewrittenSample}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
