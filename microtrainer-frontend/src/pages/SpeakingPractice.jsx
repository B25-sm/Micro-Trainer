import { useCallback, useEffect, useState } from "react";
import { Shuffle, Sparkles, RotateCcw } from "lucide-react";
import {
  communicationReviewAPI,
  COMMUNICATION_REVIEW_SCENARIOS,
} from "../api/communicationReview";
import { getStudentId } from "../utils/studentAuth";
import { useSpeechToText } from "../hooks/useSpeechToText";
import ReviewResultCard from "../components/communication/ReviewResultCard";
import SpeakableAnswerBox from "../components/communication/SpeakableAnswerBox";
import StreakBadge from "../components/communication/StreakBadge";
import { pageShell, headingPage, textMuted, btnPrimary, btnSecondary, card } from "../lib/ui";

function apiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const status = err?.response?.status;
  if (status === 404) {
    return "Speaking Practice is not available on the live server yet. Redeploy the MicroTrainer backend on Render (latest main branch), then try again.";
  }
  return err?.response?.data?.error || err?.error || err?.message || fallback;
}

export default function SpeakingPractice() {
  const studentId = getStudentId();
  const [topic, setTopic] = useState(null);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [streak, setStreak] = useState(null);

  const getBaseText = useCallback(() => response, [response]);
  const speech = useSpeechToText({ getBaseText, onTranscript: setResponse, disabled: submitting });

  useEffect(() => {
    if (!studentId) return;
    communicationReviewAPI
      .getStreak(studentId)
      .then((res) => setStreak(res.data.streak || null))
      .catch(() => {});
  }, [studentId]);

  const generateTopic = async () => {
    setError("");
    setResult(null);
    setResponse("");
    speech.stopRecording();

    let pool = COMMUNICATION_REVIEW_SCENARIOS;
    try {
      const res = await communicationReviewAPI.getScenarios();
      if (res.data.scenarios?.length) pool = res.data.scenarios;
    } catch {
      // fall back to the built-in pool silently — this is just topic selection
    }

    const next = pool[Math.floor(Math.random() * pool.length)];
    setTopic((prev) => {
      if (pool.length > 1 && prev && next.id === prev.id) {
        const others = pool.filter((s) => s.id !== prev.id);
        return others[Math.floor(Math.random() * others.length)];
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!response.trim() || submitting || !topic) return;

    speech.stopRecording();
    setSubmitting(true);
    setError("");
    setResult(null);

    try {
      const res = await communicationReviewAPI.submitReview(studentId || "anonymous", {
        studentId: studentId || "anonymous",
        scenarioId: topic.id,
        response: response.trim(),
      });
      setResult(res.data.review);
      if (res.data.streak) setStreak(res.data.streak);
    } catch (err) {
      setError(apiErrorMessage(err, "Review failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setTopic(null);
    setResponse("");
    setResult(null);
    setError("");
  };

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${pageShell}`}>
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col flex-1 min-h-0">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shuffle className="h-6 w-6 text-[#1a73e8] dark:text-[#8ab4f8]" strokeWidth={1.75} />
              <h1 className={headingPage}>Speaking Practice</h1>
            </div>
            <p className={`${textMuted} max-w-xl`}>
              Get a random topic and speak or write about it on the spot — builds thinking speed,
              confidence, and spontaneous communication.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StreakBadge streak={streak} />
            {(topic || result) && (
              <button type="button" onClick={resetAll} className={btnSecondary}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            )}
          </div>
        </header>

        <div className={`${card} p-5 sm:p-6 flex-1 flex flex-col min-h-0 gap-4`}>
          {!topic ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-12">
              <p className={textMuted}>
                Click the button below — your topic will appear only after you click.
              </p>
              <button type="button" onClick={generateTopic} className={btnPrimary}>
                <Shuffle className="h-4 w-4" />
                Get a random topic
              </button>
            </div>
          ) : (
            <>
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
                    Your topic
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-snug">
                    {topic.prompt}
                  </p>
                  {topic.hint && (
                    <p className={`${textMuted} mt-2 text-sm`}>Tip: {topic.hint}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={generateTopic}
                  title="Get a different topic"
                  className={`${btnSecondary} shrink-0`}
                >
                  <Shuffle className="h-4 w-4" />
                  New topic
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 gap-4">
                <SpeakableAnswerBox
                  value={response}
                  onChange={setResponse}
                  disabled={submitting}
                  speech={speech}
                  placeholder="Speak or type your response on the spot..."
                />

                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={!response.trim() || submitting}
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
          )}
        </div>

        <div className="mt-4">
          <ReviewResultCard result={result} />
        </div>
      </div>
    </div>
  );
}
