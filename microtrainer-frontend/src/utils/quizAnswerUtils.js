/**
 * Ask to elaborate ONLY when meaning is genuinely unclear — not for wrong, lazy, or off-topic answers.
 * At most once per question (caller passes alreadyAsked).
 */

const ELABORATE_MSG =
  "Can you elaborate on this? I want to be sure I understand what you mean.";

function isRefusalOrNonAnswer(lower) {
  return /^(idk|i don't know|don't know|no idea|skip|pass|whatever|dunno|not sure|no clue|yes|no|ok|okay|sure|maybe|test|asdf|n\/a|none)$/i.test(
    lower
  );
}

function isOffTopicOrNonsense(lower) {
  if (!/[a-z]{3,}/i.test(lower)) return true;
  return /pizza|football|soccer|weather|movie|song|random|garbage|don't care|hate this|boring|no idea about/i.test(
    lower
  );
}

/** Lesson-aware: wrong role or idea is already clear — grade it, do not ask to elaborate */
function isClearlyWrongForQuestion(answer, questionText) {
  const a = answer.toLowerCase().trim();
  const q = (questionText || "").toLowerCase();

  if (
    /data analyst/.test(q) &&
    (/role|contribute|decision|landscape|explain|how do they/.test(q) ||
      /what does.*analyst/.test(q))
  ) {
    if (/build.*model|train.*model|predictive model/i.test(a) && !/report/i.test(a)) {
      return true;
    }
  }

  if (
    (/data scientist|predictive model|build.*model|train.*model|who.*build/.test(q) ||
      /building and training/.test(q)) &&
    /data analyst/i.test(a) &&
    !/data scientist|scientist/i.test(a)
  ) {
    return true;
  }

  if (/ml engineer|to production|deploy/.test(q) && /only report|just dashboard|bi only/i.test(a)) {
    return true;
  }

  if (
    /netflix|recommend|real-time|personalized|internal/.test(q) &&
    /only (ui|screen|homepage|button)|just show|user sees only/i.test(a) &&
    !/algorithm|model|collaborative|embedding|backend/i.test(a)
  ) {
    return true;
  }

  return false;
}

function hasClearMeaning(lower) {
  return (
    /report|reports|bi\b|business intelligence|dashboard|insight|visualiz|present|tool|sql|kpi/i.test(
      lower
    ) ||
    /data analyst|analyst.*report/i.test(lower) ||
    /data scientist|scientist.*model|build.*model|train.*model|predictive model/i.test(
      lower
    ) ||
    /ml engineer|deploy|production|\bapi\b|ship|package|production-ready/i.test(
      lower
    ) ||
    /data engineer|pipeline|etl|warehouse|data quality|feed.*data/i.test(lower) ||
    /algorithm|collaborative|embedding|recommend|backend|internal|filtering/i.test(
      lower
    ) ||
    /turn raw|into decisions|statistic|programming|domain/i.test(lower) ||
    /invest|benefit|stakeholder|decision|customer.*data/i.test(lower)
  );
}

/** Single-word topic stub — might be right once explained; not wrong, not a full answer */
function isAmbiguousTopicStub(lower, wordCount) {
  if (
    /^(data|data science|algorithm|algorithms|model|models|predicting|prediction|ml|ai|analytics?|science)$/i.test(
      lower
    )
  ) {
    return true;
  }
  if (wordCount === 2 && /^(machine learning|big data|deep learning)$/i.test(lower)) {
    return true;
  }
  return false;
}

export function needsElaborationRequest(
  answer,
  questionText,
  lessonContent = "",
  { alreadyAsked = false } = {}
) {
  void lessonContent;
  if (alreadyAsked) return null;

  const a = (answer || "").trim();
  if (!a) return null;

  const lower = a.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);

  if (isRefusalOrNonAnswer(lower)) return null;
  if (isOffTopicOrNonsense(lower)) return null;
  if (isClearlyWrongForQuestion(a, questionText)) return null;
  if (hasClearMeaning(lower)) return null;

  // Real attempt (even if wrong) — grader decides on meaning
  if (words.length >= 4) return null;

  if (isAmbiguousTopicStub(lower, words.length)) {
    return { needsElaboration: true, message: ELABORATE_MSG };
  }

  return null;
}
