import { useState, useEffect } from "react";
import { startInterview, sendAnswer, abandonInterview } from "../../api";
import { personalScheduleAPI } from "../../api/personalSchedule";
import { btnPrimary, btnSecondary, card, textMuted } from "../../lib/ui";

const QUESTIONS_PER_TECH = 5;

export default function ScheduleDiagnostic({
  studentId,
  technology,
  interviewSubject,
  remaining,
  onComplete,
  onError,
}) {
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [totalQ] = useState(QUESTIONS_PER_TECH);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(true);
  const [interviewerNote, setInterviewerNote] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setStarting(true);
      setSessionId(null);
      setQuestion("");
      setAnswer("");
      setCurrentQ(0);
      setInterviewerNote("");

      try {
        const res = await startInterview({
          subject: interviewSubject || technology,
          studentId,
          totalQuestions: QUESTIONS_PER_TECH,
        });
        if (cancelled) return;
        setSessionId(res.data.sessionId);
        setQuestion(res.data.question || res.data.nextQuestion);
        setCurrentQ(res.data.currentQuestion || 1);
      } catch (err) {
        onError?.(err?.error || err?.message || "Could not start skill check.");
      } finally {
        if (!cancelled) setStarting(false);
      }
    }

    start();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when technology changes
  }, [technology, interviewSubject, studentId]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!answer.trim() || !sessionId || loading) return;

    setLoading(true);
    try {
      const res = await sendAnswer({ sessionId, answer: answer.trim() });
      setAnswer("");

      if (res.data.completed) {
        const avg = parseFloat(res.data.final?.averageScore || "0");
        await personalScheduleAPI.recordDiagnostic(studentId, {
          technology,
          averageScore: avg,
          sessionId,
        });
        onComplete?.(res.data);
        return;
      }

      setInterviewerNote(res.data.isClarification ? res.data.interviewerMessage || "" : "");
      setQuestion(res.data.nextQuestion);
      setCurrentQ(res.data.currentQuestion || currentQ + 1);
    } catch (err) {
      onError?.(err?.error || err?.message || "Submit failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipTech = async () => {
    if (
      loading ||
      !window.confirm(
        `Skip assessment for ${technology}? We'll assume you need more practice in this area.`
      )
    ) {
      return;
    }
    setLoading(true);
    if (sessionId) {
      try {
        await abandonInterview({ sessionId });
      } catch {
        /* ignore */
      }
    }
    try {
      await personalScheduleAPI.recordDiagnostic(studentId, {
        technology,
        averageScore: 3,
        sessionId: sessionId || "skipped",
      });
      onComplete?.();
    } catch (err) {
      onError?.(err?.error || err?.message || "Could not skip skill check.");
    } finally {
      setLoading(false);
    }
  };

  if (starting) {
    return (
      <div className={`${card} p-8 text-center`}>
        <p className={textMuted}>Starting skill check for {technology}…</p>
      </div>
    );
  }

  return (
    <div className={`${card} p-6`}>
      <div className="flex justify-between items-start mb-4 gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Skill check: {technology}
          </h3>
          <p className={`${textMuted} text-sm`}>
            Question {currentQ} of {totalQ}
            {remaining > 1 ? ` · ${remaining - 1} more technology(ies) after this` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSkipTech}
          disabled={loading}
          className={btnSecondary}
        >
          {loading ? "Skipping…" : "Skip"}
        </button>
      </div>

      {interviewerNote && (
        <div className="mb-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 text-sm whitespace-pre-line">
          {interviewerNote}
        </div>
      )}

      <div className="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-[#1e1f22] text-gray-800 dark:text-gray-200 text-sm">
        {question}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={4}
          placeholder="Type your answer…"
          className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1e1f22] px-4 py-3 text-gray-900 dark:text-gray-100 text-sm"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !answer.trim()} className={btnPrimary}>
          {loading ? "Submitting…" : "Submit answer"}
        </button>
      </form>
    </div>
  );
}
