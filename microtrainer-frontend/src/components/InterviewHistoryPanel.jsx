import { Fragment, useEffect, useState } from "react";
import { getInterviewHistory } from "../api";
import { card, headingSection, textMuted } from "../lib/ui";

const statusStyles = {
  completed: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800",
  dismissed:
    "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800",
  abandoned:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-200 dark:border-slate-600",
};

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function scoreLabel(record) {
  if (record.status === "dismissed") {
    if (record.averageScore != null) {
      return `${record.averageScore}/10 (partial)`;
    }
    return "No score — dismissed";
  }
  if (record.averageScore != null) {
    return `${record.averageScore}/10`;
  }
  return "—";
}

export default function InterviewHistoryPanel({ studentId, title = "Interview history" }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!studentId) {
      setStatus("empty");
      return;
    }
    let cancelled = false;
    (async () => {
      setStatus("loading");
      try {
        const res = await getInterviewHistory(studentId);
        if (cancelled) return;
        setItems(res.data?.interviews || []);
        setStatus((res.data?.interviews || []).length ? "ready" : "empty");
      } catch (err) {
        console.error("Interview history:", err);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  if (status === "loading") {
    return (
      <div className={`${card} p-6`}>
        <p className={textMuted}>Loading interview history…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={`${card} p-6`}>
        <p className="text-sm text-red-600 dark:text-red-400">
          Could not load interview history. Try again later.
        </p>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className={`${card} p-6`}>
        <h2 className={`${headingSection} mb-2`}>{title}</h2>
        <p className={textMuted}>No interviews recorded yet.</p>
      </div>
    );
  }

  return (
    <div className={`${card} p-6`}>
      <h2 className={`${headingSection} mb-1`}>{title}</h2>
      <p className={`${textMuted} mb-4`}>
        Academic score is the average AI rating per answer (0–10). Proctoring warnings are
        listed separately and do not change that average.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
              <th className="py-2 pr-3 font-medium">Date</th>
              <th className="py-2 pr-3 font-medium">Subject</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 pr-3 font-medium">Score</th>
              <th className="py-2 pr-3 font-medium">Progress</th>
              <th className="py-2 font-medium">Integrity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const expanded = expandedId === row.sessionId;
              return (
                <Fragment key={row.sessionId}>
                  <tr
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer"
                    onClick={() =>
                      setExpandedId(expanded ? null : row.sessionId)
                    }
                  >
                    <td className="py-3 pr-3 whitespace-nowrap text-gray-800 dark:text-gray-200">
                      {formatDate(row.endedAt)}
                    </td>
                    <td className="py-3 pr-3 text-gray-800 dark:text-gray-200">
                      {row.subject}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${
                          statusStyles[row.status] || statusStyles.completed
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 pr-3 font-medium text-gray-900 dark:text-gray-100">
                      {scoreLabel(row)}
                    </td>
                    <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">
                      {row.questionsAnswered}/{row.totalQuestions} Q
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">
                      {row.warningCount > 0
                        ? `${row.warningCount} warn · ${row.suspicionScore} pts`
                        : row.suspicionScore > 0
                          ? `${row.suspicionScore} pts`
                          : "Clean"}
                    </td>
                  </tr>
                  {expanded && (
                    <tr key={`${row.sessionId}-detail`}>
                      <td colSpan={6} className="pb-4 pt-0">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#202124]/60 p-4 text-sm space-y-2">
                          <p>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Verdict:
                            </span>{" "}
                            {row.verdict || "—"}
                          </p>
                          {row.dismissalReason && (
                            <p className="text-red-700 dark:text-red-300">
                              <span className="font-medium">Dismissal:</span>{" "}
                              {row.dismissalReason}
                            </p>
                          )}
                          {row.questionScores?.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Per-question feedback
                              </p>
                              <div className="space-y-3">
                                {row.questionScores.map((q) => {
                                  const hasFeedback =
                                    q.strengths || q.mistakes || q.improvement;
                                  return (
                                    <div
                                      key={q.index}
                                      className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-3"
                                    >
                                      <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="font-medium text-gray-800 dark:text-gray-200">
                                          Q{q.index}
                                          {q.question || q.questionPreview ? (
                                            <span className="font-normal text-gray-600 dark:text-gray-400">
                                              {" "}
                                              — {q.question || q.questionPreview}
                                            </span>
                                          ) : null}
                                        </span>
                                        <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                                          {q.score}/10 · {q.difficulty}
                                        </span>
                                      </div>
                                      {(q.communication || q.technical) && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                          {q.technical && (
                                            <>Technical: <span className="font-medium">{q.technical}</span></>
                                          )}
                                          {q.technical && q.communication ? " · " : ""}
                                          {q.communication && (
                                            <>Communication: <span className="font-medium">{q.communication}</span></>
                                          )}
                                        </p>
                                      )}
                                      {hasFeedback ? (
                                        <div className="space-y-1 text-sm">
                                          {q.strengths && (
                                            <p className="text-green-700 dark:text-green-300">
                                              <span className="font-medium">Strengths:</span> {q.strengths}
                                            </p>
                                          )}
                                          {q.mistakes && (
                                            <p className="text-red-700 dark:text-red-300">
                                              <span className="font-medium">Mistakes:</span> {q.mistakes}
                                            </p>
                                          )}
                                          {q.improvement && (
                                            <p className="text-amber-700 dark:text-amber-300">
                                              <span className="font-medium">Improve:</span> {q.improvement}
                                            </p>
                                          )}
                                        </div>
                                      ) : (
                                        <p className="text-xs text-gray-400 italic">
                                          No written feedback captured for this answer.
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
