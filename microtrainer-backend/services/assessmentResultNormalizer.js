const { scoreOpenAnswerWithLesson } = require("./quizQuestionUtils");

function feedbackSignal(feedback) {
  const text = String(feedback || "").toLowerCase();
  const positive = /\b(correctly|accurate(?:ly)?|matches?|valid|appropriate|demonstrates? (?:a )?(?:good|clear|strong) understanding)\b/.test(text);
  const negative = /\b(incorrect(?:ly)?|wrong|confuses?|misconception|unrelated|fails? to|does not|cannot|needs? improvement)\b/.test(text);
  if (positive && !negative) return "positive";
  if (negative && !positive) return "negative";
  return "neutral";
}

/**
 * Ensure every answer has a numeric score and that score does not contradict
 * the model's own feedback. Lesson matching remains the strongest fallback.
 */
function normalizeAssessmentRows({
  answers = [],
  questions = [],
  rawScores = [],
  feedback = [],
  lessonContext = "",
}) {
  return answers.map((answer, index) => {
    const raw = Number(rawScores[index]);
    const hasScore = rawScores[index] !== null && rawScores[index] !== undefined && Number.isFinite(raw);
    const rowFeedback = String(feedback[index] || "").trim();
    const signal = feedbackSignal(rowFeedback);
    const lessonHit = scoreOpenAnswerWithLesson(
      answer,
      questions[index],
      lessonContext
    );

    let score = hasScore ? Math.max(0, Math.min(10, raw)) : null;

    if (score == null) {
      if (lessonHit) score = lessonHit.score;
      else if (signal === "positive") score = 9;
      else if (signal === "negative") score = 2;
      else score = String(answer || "").trim() ? 6 : 0;
    } else if (signal === "positive" && score < 6) {
      score = lessonHit?.score >= 6 ? lessonHit.score : 9;
    } else if (signal === "negative" && score >= 6) {
      score = lessonHit?.score < 6 ? lessonHit.score : 3;
    }

    return {
      score: Math.round(score * 10) / 10,
      feedback: rowFeedback,
      recovered: !hasScore || score !== raw,
    };
  });
}

module.exports = {
  feedbackSignal,
  normalizeAssessmentRows,
};
