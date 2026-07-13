// =======================================================
// Interview history — durable session records (completed + dismissed)
// Academic score (0–10) is separate from proctoring suspicion points.
// =======================================================

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data/progress");
const HISTORY_FILE = path.join(DATA_DIR, "interview-history.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let records = [];

function loadFromDisk() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      records = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
      if (!Array.isArray(records)) records = [];
      console.log(`📂 Loaded ${records.length} interview history records`);
    }
  } catch (err) {
    console.error("Error loading interview history:", err.message);
    records = [];
  }
}

function saveToDisk() {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(records, null, 2));
  } catch (err) {
    console.error("Error saving interview history:", err.message);
  }
}

loadFromDisk();

/** Mean of per-question AI scores (0–10) for answered questions only */
function computeAcademicAverage(history) {
  const scored = (history || []).filter(
    (h) => h && h.answer != null && h.answer !== "" && h.score !== undefined
  );
  if (scored.length === 0) return null;
  const sum = scored.reduce((acc, h) => acc + Number(h.score || 0), 0);
  return Number((sum / scored.length).toFixed(2));
}

function verdictFromAverage(avg) {
  if (avg == null) return null;
  if (avg >= 8) return "Strongly Selected";
  if (avg >= 6.5) return "Selected";
  if (avg >= 5) return "Borderline";
  return "Not Selected";
}

function summarizeQuestions(history) {
  return (history || [])
    .filter((h) => h && h.answer != null && h.answer !== "" && h.score !== undefined)
    .map((h, index) => {
      // The per-answer AI feedback text lives in h._evaluation (set in
      // interviewSessionService via Object.assign(currentEntry, result)).
      // Persist it here so trainers can read the actual strengths / mistakes /
      // improvement, not just the numeric score.
      const evalText = h._evaluation || {};
      const questionText =
        typeof h.question === "string" ? h.question : String(h.question || "");
      return {
        index: index + 1,
        score: Number(h.score),
        difficulty: h.difficulty || "medium",
        question: questionText,
        questionPreview: questionText.slice(0, 120),
        answerPreview: String(h.answer || "").slice(0, 400),
        strengths: evalText.strengths || h.strengths || "",
        mistakes: evalText.mistakes || h.mistakes || "",
        improvement: evalText.improvement || h.improvement || "",
        communication: h.communication || "",
        technical: h.technical || "",
      };
    });
}

/**
 * @param {object} opts
 * @param {string} opts.sessionId
 * @param {string} opts.studentId
 * @param {string} opts.subject
 * @param {'completed'|'dismissed'} opts.status
 * @param {Array} opts.history - interview Q&A entries
 * @param {object} [opts.final] - calculateFinal result when completed
 * @param {object} [opts.anticheat] - anti-cheat session snapshot
 * @param {string} [opts.dismissalReason]
 * @param {string} [opts.startedAt]
 */
function recordInterviewSession(opts) {
  const {
    sessionId,
    studentId,
    subject,
    status,
    history = [],
    final = null,
    anticheat = null,
    dismissalReason = null,
    startedAt = null,
  } = opts;

  if (!sessionId || !studentId) {
    console.error("recordInterviewSession: missing sessionId or studentId");
    return null;
  }

  const answered = summarizeQuestions(history);
  const partialAvg = computeAcademicAverage(history);
  const endedAt = new Date().toISOString();

  const isDismissed = status === "dismissed";
  const isAbandoned = status === "abandoned";

  const record = {
    sessionId,
    studentId,
    subject: subject || anticheat?.subject || "Unknown",
    status,
    startedAt: startedAt || anticheat?.startTime || endedAt,
    endedAt,
    questionsAnswered: answered.length,
    totalQuestions: anticheat?.totalQuestions || 20,
  /** Academic: mean AI score per answered question (0–10). Null if none answered. */
    averageScore:
      isDismissed || isAbandoned
        ? partialAvg
        : final?.averageScore != null
          ? Number(final.averageScore)
          : partialAvg,
    verdict: isDismissed
      ? "Dismissed — integrity violation"
      : isAbandoned
        ? "Ended early by student"
        : final?.verdict || verdictFromAverage(partialAvg),
    questionScores: answered,
    /** Proctoring — not mixed into academic average */
    suspicionScore: anticheat?.suspicionScore ?? 0,
    warningCount: anticheat?.warningCount ?? 0,
    dismissalReason: isDismissed
      ? dismissalReason || anticheat?.dismissalReason || "Policy violation"
      : isAbandoned
        ? dismissalReason || "Student chose to end the interview"
        : null,
    integrityStatus: isDismissed
      ? "dismissed"
      : isAbandoned
        ? "abandoned"
        : (anticheat?.suspicionScore ?? 0) >= 50
          ? "flagged"
          : "clean",
  };

  const existingIdx = records.findIndex((r) => r.sessionId === sessionId);
  if (existingIdx >= 0) {
    records[existingIdx] = record;
  } else {
    records.unshift(record);
  }

  saveToDisk();
  console.log(
    `✅ Interview history saved [${sessionId}] ${status} — academic ${record.averageScore ?? "n/a"}/10`
  );

  // Push the per-question feedback to the "Interview Feedback" Google Sheet tab
  // so trainers can forward real strengths/mistakes/improvement to placement.
  // Fire-and-forget — never block or fail the interview flow.
  try {
    const { logInterviewFeedback } = require("./placementSheetsService");
    logInterviewFeedback(record).catch(() => {});
  } catch (_) {
    /* sheets optional */
  }

  return record;
}

function getInterviewsByStudent(studentId, { limit = 100 } = {}) {
  return records
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
    .slice(0, limit);
}

function getInterviewBySessionId(sessionId) {
  return records.find((r) => r.sessionId === sessionId) || null;
}

module.exports = {
  recordInterviewSession,
  getInterviewsByStudent,
  getInterviewBySessionId,
  computeAcademicAverage,
  verdictFromAverage,
};
