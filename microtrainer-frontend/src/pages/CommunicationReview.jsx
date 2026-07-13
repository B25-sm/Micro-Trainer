import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MessageSquareText,
  Sparkles,
  ChevronRight,
  History,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import {
  communicationReviewAPI,
  COMMUNICATION_REVIEW_SCENARIOS,
} from "../api/communicationReview";
import { getStudentId } from "../utils/studentAuth";
import { useSpeechToText } from "../hooks/useSpeechToText";
import ReviewResultCard from "../components/communication/ReviewResultCard";
import SpeakableAnswerBox from "../components/communication/SpeakableAnswerBox";
import StreakBadge from "../components/communication/StreakBadge";
import {
  pageShell,
  headingPage,
  textMuted,
  btnPrimary,
  btnSecondary,
  card,
} from "../lib/ui";

function apiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const status = err?.response?.status;
  if (status === 404) {
    return "Communication Practice is not available on the live server yet. Redeploy the MicroTrainer backend on Render (latest main branch), then try again.";
  }
  return err?.response?.data?.error || err?.error || err?.message || fallback;
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
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [streak, setStreak] = useState(null);

  const getBaseText = useCallback(() => response, [response]);
  const speech = useSpeechToText({ getBaseText, onTranscript: setResponse, disabled: submitting });

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
    setApiUnavailable(false);
    let serverMissing = false;

    try {
      let loadedScenarios = COMMUNICATION_REVIEW_SCENARIOS;
      try {
        const scenRes = await communicationReviewAPI.getScenarios();
        loadedScenarios = scenRes.data.scenarios?.length
          ? scenRes.data.scenarios
          : COMMUNICATION_REVIEW_SCENARIOS;
      } catch (err) {
        if (err?.response?.status === 404) {
          serverMissing = true;
          setApiUnavailable(true);
        } else {
          throw err;
        }
      }

      setScenarios(loadedScenarios);
      setSelectedId((prev) => prev || loadedScenarios[0]?.id || null);

      if (studentId && !serverMissing) {
        try {
          const histRes = await communicationReviewAPI.getHistory(studentId);
          setHistory(histRes.data.history || []);
        } catch (err) {
          if (err?.response?.status === 404) {
            serverMissing = true;
            setApiUnavailable(true);
            setHistory([]);
          } else {
            throw err;
          }
        }
        try {
          const streakRes = await communicationReviewAPI.getStreak(studentId);
          setStreak(streakRes.data.streak || null);
        } catch {
          // streak is a nice-to-have — ignore failures
        }
      } else {
        setHistory([]);
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to load communication practice."));
      setScenarios(COMMUNICATION_REVIEW_SCENARIOS);
      setSelectedId((prev) => prev || COMMUNICATION_REVIEW_SCENARIOS[0]?.id || null);
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

    speech.stopRecording();
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
      if (res.data.streak) setStreak(res.data.streak);
      if (studentId) {
        const histRes = await communicationReviewAPI.getHistory(studentId);
        setHistory(histRes.data.history || []);
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Review failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setResponse("");
    setResult(null);
    setError("");
  };

  const chooseRandomPrompt = () => {
    if (!scenarios.length) return;

    const alternatives = scenarios.filter((scenario) => scenario.id !== selectedId);
    const pool = alternatives.length ? alternatives : scenarios;
    const next = pool[Math.floor(Math.random() * pool.length)];

    speech.stopRecording();
    setSelectedId(next.id);
    setCustomPrompt("");
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

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[50vh] ${pageShell}`}>
        <p className={textMuted}>Loading communication practice...</p>
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
                className="h-6 w-6 text-[#7c3aed] dark:text-[#a78bfa]"
                strokeWidth={1.75}
              />
              <h1 className={headingPage}>Communication Practice</h1>
            </div>
            <p className={`${textMuted} max-w-xl`}>
              Build clarity, structure, and confidence with guided prompts, your own scenario, or
              a random speaking topic.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StreakBadge streak={streak} />
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

        {apiUnavailable && (
          <div className="mb-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
            Practice prompts are loaded, but AI review needs a backend update. Redeploy{" "}
            <strong>micro-trainer</strong> on Render from the latest <code className="text-xs">main</code> branch,
            then submit again.
          </div>
        )}

        <div className="flex flex-1 min-h-0 gap-6 flex-col lg:flex-row">
          {/* Scenario picker */}
          <aside className="lg:w-72 shrink-0 space-y-4">
            <div className={`${card} p-4 max-h-[420px] lg:max-h-none overflow-y-auto`}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Practice prompts
                </p>
                <button
                  type="button"
                  onClick={chooseRandomPrompt}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[#7c3aed] hover:bg-[#7c3aed]/10 dark:text-[#a78bfa] dark:hover:bg-[#a78bfa]/10 transition-colors"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  Random topic
                </button>
              </div>
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
                className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#202124] px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 dark:focus:ring-[#a78bfa]/20"
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
                        <span className="shrink-0 text-xs font-medium text-[#7c3aed] dark:text-[#a78bfa]">
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
                    <SpeakableAnswerBox
                      value={response}
                      onChange={setResponse}
                      disabled={submitting}
                      speech={speech}
                    />

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
            <ReviewResultCard result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
