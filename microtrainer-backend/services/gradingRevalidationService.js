// =======================================================
// Grading revalidation — multi-pass, lesson-locked, anti-hallucination
// MCQ keys are fixed from lesson BEFORE scoring; open answers re-checked.
// =======================================================

const { callGroq } = require("./groqClient");
const {
  alignMcqCorrectIndexWithLesson,
  gradeMcqAnswers,
  gradeMixedAnswers,
  allMcqQuestions,
  scoreOpenAnswerWithLesson,
  applyLessonAwareOpenScores,
  normalizeQuizQuestion,
  stripAnswerLeak,
} = require("./quizQuestionUtils");

const MAX_REVALIDATION_PASSES = 3;

function questionText(q) {
  return typeof q === "string" ? q : q?.question || "";
}

/**
 * Prepare session questions for grading — same order and count the student saw.
 * NEVER call alignQuizWithLesson here; re-filtering/reordering causes answer↔question mismatches.
 */
function prepareQuestionsForGrading(questions, lessonContent) {
  const list = Array.isArray(questions) ? questions : [];

  const prepared = list.map((q) => {
    if (q && typeof q === "object" && q.question) {
      if (q.type === "mcq" && Array.isArray(q.options)) {
        return {
          type: "mcq",
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
        };
      }
      return { type: q.type || "open", question: q.question };
    }
    if (typeof q === "string") {
      const norm = normalizeQuizQuestion(q);
      return norm || { type: "open", question: stripAnswerLeak(q) || q };
    }
    return { type: "open", question: "" };
  });

  return lockMcqKeysFromLesson(prepared, lessonContent);
}

/**
 * Lock every MCQ correctIndex to the lesson — never trust AI-stored keys.
 */
function lockMcqKeysFromLesson(questions, lessonContent) {
  if (!lessonContent) return questions;

  return questions.map((q) => {
    if (q?.type !== "mcq") return q;
    const before = q.correctIndex;
    const locked = alignMcqCorrectIndexWithLesson(q, lessonContent);
    if (before !== locked.correctIndex) {
      console.warn(
        `🔧 MCQ key corrected (lesson lock): Q="${(q.question || "").slice(0, 60)}…" ` +
          `was option ${before} → now ${locked.correctIndex} ("${locked.options[locked.correctIndex]}")`
      );
    }
    return locked;
  });
}

/**
 * Sanity audit — fail loud if a known role question still has wrong key.
 */
function auditMcqKeysAgainstLesson(questions, lessonContent) {
  const issues = [];
  const lesson = String(lessonContent || "").toLowerCase();

  questions.forEach((q, i) => {
    if (q.type !== "mcq") return;
    const qLower = (q.question || "").toLowerCase();
    const correct = q.options[q.correctIndex] || "";

    if (
      /building and training predictive|trains? predictive|builds?.*predictive models/i.test(
        qLower
      )
    ) {
      const scientistOpt = q.options.findIndex((o) => /data scientist/i.test(o));
      if (scientistOpt >= 0 && q.correctIndex !== scientistOpt) {
        issues.push({
          index: i,
          question: q.question,
          wrong: correct,
          expected: q.options[scientistOpt],
        });
      }
    }

    if (/data analyst.*report|role of.*data analyst/i.test(qLower)) {
      const analystOpt = q.options.findIndex((o) => /data analyst/i.test(o));
      if (analystOpt >= 0 && /data scientist/i.test(correct) && !/report|bi/i.test(correct)) {
        issues.push({ index: i, question: q.question, wrong: correct });
      }
    }

    if (/data scientist.*primary|primary role.*data scientist/i.test(qLower)) {
      if (/warehouse/i.test(correct) && !/model|decision|statistic/i.test(correct)) {
        if (/turn raw|into decisions|build.*model/i.test(lesson)) {
          issues.push({ index: i, question: q.question, wrong: correct });
        }
      }
    }
  });

  return issues;
}

function buildAssessmentFromParts(questions, scores, feedbackList) {
  const detailedFeedback = questions.map((q, i) => {
    const score = scores[i] ?? 0;
    return {
      questionNumber: i + 1,
      question: questionText(q),
      yourAnswer: "",
      score,
      maxScore: 10,
      status: score >= 9 ? "correct" : score >= 6 ? "partial" : "incorrect",
      feedback: feedbackList[i] || "",
    };
  });

  const totalScore = scores.reduce((a, b) => a + (b || 0), 0);
  const maxScore = questions.length * 10;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    score: totalScore,
    maxScore,
    percentage,
    passed: percentage >= 60,
    detailedFeedback,
  };
}

/**
 * One revalidation pass: lesson rules override unfair AI scores.
 */
function revalidationPass(assessment, answers, questions, lessonContent) {
  if (!assessment?.detailedFeedback || !lessonContent) {
    return { assessment, changed: false };
  }

  let changed = false;

  assessment.detailedFeedback = assessment.detailedFeedback.map((item, index) => {
    const q = questions[index];
    if (q?.type === "mcq") {
      return item;
    }

    const lessonHit = scoreOpenAnswerWithLesson(
      answers[index],
      questionText(q),
      lessonContent
    );

    if (!lessonHit) return item;

    const aiScore = item.score ?? 0;
    const shouldOverride =
      lessonHit.score > aiScore ||
      (aiScore < 7 && lessonHit.score >= 8);

    if (!shouldOverride) return item;

    changed = true;
    console.log(
      `🔁 Revalidation pass: Q${index + 1} ${aiScore}→${lessonHit.score} (lesson match)`
    );

    return {
      ...item,
      score: lessonHit.score,
      status: lessonHit.status,
      feedback: lessonHit.feedback,
    };
  });

  if (changed) {
    const totalScore = assessment.detailedFeedback.reduce(
      (s, d) => s + (d.score || 0),
      0
    );
    const maxScore = questions.length * 10;
    assessment.score = totalScore;
    assessment.maxScore = maxScore;
    assessment.percentage =
      maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    assessment.passed = assessment.percentage >= 60;
  }

  return { assessment, changed };
}

/**
 * AI audit for a single disputed open answer — catches grader hallucination.
 */
async function aiAuditOpenAnswer({
  question,
  answer,
  lessonContent,
  priorScore,
}) {
  const lessonHit = scoreOpenAnswerWithLesson(answer, question, lessonContent);
  if (lessonHit && lessonHit.score >= 8 && priorScore < 7) {
    return {
      correctedScore: lessonHit.score,
      fair: false,
      reason: lessonHit.feedback,
      source: "lesson-rules",
    };
  }

  if (!process.env.GROQ_API_KEY || priorScore >= 8) {
    return null;
  }

  const prompt = `You are a grading AUDITOR. A student was scored ${priorScore}/10. Decide if that was FAIR using ONLY the lesson.

LESSON:
${lessonContent.substring(0, 3200)}

QUESTION: ${question}

STUDENT ANSWER: ${answer}

Rules:
- Score MEANING only — never word count or number of sentences
- If the answer meaning matches the lesson (even if brief), correctedScore must be 8-10
- If prior score was low only because the answer was short but meaning was right, set fair=false and raise score
- Data Analyst = reports/BI/insights; Data Scientist = builds/trains models

Return ONLY JSON: {"fair":true|false,"correctedScore":0-10,"reason":"one sentence"}`;

  try {
    const response = await callGroq({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You audit quiz fairness against lesson text only. Return valid JSON. No markdown.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    let raw = response?.data?.choices?.[0]?.message?.content || "{}";
    raw = raw.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(raw);

    if (
      typeof parsed.correctedScore === "number" &&
      parsed.correctedScore >= 0 &&
      parsed.correctedScore <= 10
    ) {
      if (!parsed.fair && parsed.correctedScore > priorScore) {
        return {
          correctedScore: parsed.correctedScore,
          fair: false,
          reason: parsed.reason || "Revalidated against lesson.",
          source: "ai-audit",
        };
      }
      if (parsed.fair && priorScore >= 6) {
        return null;
      }
    }
  } catch (err) {
    console.warn("AI audit skipped:", err.message);
  }

  return lessonHit && lessonHit.score > priorScore
    ? {
        correctedScore: lessonHit.score,
        fair: false,
        reason: lessonHit.feedback,
        source: "lesson-rules-fallback",
      }
    : null;
}

async function aiAuditPass(assessment, answers, questions, lessonContent) {
  let changed = false;

  if (!Array.isArray(assessment?.detailedFeedback)) {
    return { assessment, changed: false };
  }

  for (let i = 0; i < assessment.detailedFeedback.length; i++) {
    const q = questions[i];
    if (q?.type === "mcq") continue;

    const item = assessment.detailedFeedback[i];
    if ((item.score ?? 0) >= 8) continue;

    const audit = await aiAuditOpenAnswer({
      question: questionText(q),
      answer: answers[i],
      lessonContent,
      priorScore: item.score ?? 0,
    });

    if (audit && audit.correctedScore > (item.score ?? 0)) {
      changed = true;
      console.log(
        `🔁 AI audit Q${i + 1}: ${item.score}→${audit.correctedScore} (${audit.source})`
      );
      assessment.detailedFeedback[i] = {
        ...item,
        score: audit.correctedScore,
        status: audit.correctedScore >= 9 ? "correct" : "partial",
        feedback: audit.reason,
      };
    }
  }

  if (changed) {
    const totalScore = assessment.detailedFeedback.reduce(
      (s, d) => s + (d.score || 0),
      0
    );
    const maxScore = questions.length * 10;
    assessment.score = totalScore;
    assessment.percentage =
      maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    assessment.passed = assessment.percentage >= 60;
  }

  return { assessment, changed };
}

/**
 * Run multiple revalidation passes until stable or MAX_REVALIDATION_PASSES.
 */
async function runRevalidationLoop(assessment, answers, questions, lessonContent) {
  const initial = coerceAssessmentShape(assessment, answers, questions);
  let current = initial;

  for (let pass = 1; pass <= MAX_REVALIDATION_PASSES; pass++) {
    try {
      const passResult = revalidationPass(
        current,
        answers,
        questions,
        lessonContent
      );
      const next =
        passResult && typeof passResult === "object" && "assessment" in passResult
          ? passResult.assessment
          : passResult;
      const rulesChanged = Boolean(passResult?.changed);
      current = next && typeof next.percentage === "number" ? next : current;

      const { assessment: audited, changed: auditChanged } = await aiAuditPass(
        current,
        answers,
        questions,
        lessonContent
      );
      current =
        audited && typeof audited.percentage === "number" ? audited : current;

      current = applyLessonAwareOpenScores(
        current,
        answers,
        questions,
        lessonContent
      );

      if (!current || typeof current.percentage !== "number") {
        current = initial;
      }

      if (!rulesChanged && !auditChanged) {
        console.log(`✅ Revalidation stable after pass ${pass}`);
        break;
      }
      console.log(`🔁 Revalidation pass ${pass} adjusted scores`);
    } catch (passErr) {
      console.warn(`Revalidation pass ${pass} skipped:`, passErr.message);
      break;
    }
  }

  return current && typeof current.percentage === "number" ? current : initial;
}

function coerceAssessmentShape(assessment, answers, questions) {
  if (
    assessment &&
    typeof assessment.percentage === "number" &&
    Array.isArray(assessment.detailedFeedback) &&
    assessment.detailedFeedback.length > 0
  ) {
    return assessment;
  }
  return buildAssessmentFromParts(
    questions,
    answers.map((a) => (String(a || "").trim() ? 6 : 0)),
    questions.map(() => "Graded with safe fallback.")
  );
}

/**
 * Full pipeline: lock MCQ → grade → lesson override → multi-pass revalidation.
 */
async function runRevalidatedGrading({
  answers,
  questions,
  lessonContent,
  assessOpenFn,
}) {
  if (!lessonContent?.trim()) {
    console.warn("⚠️ No lesson context — grading without revalidation lock");
  }

  let lockedQuestions = prepareQuestionsForGrading(questions, lessonContent);

  if (lockedQuestions.length !== answers.length) {
    console.warn(
      `⚠️ Grading question count (${lockedQuestions.length}) != answer count (${answers.length})`
    );
  }

  const keyIssues = auditMcqKeysAgainstLesson(lockedQuestions, lessonContent);
  if (keyIssues.length > 0) {
    console.error("❌ MCQ key audit failed — force-correcting:", keyIssues);
    lockedQuestions = lockMcqKeysFromLesson(lockedQuestions, lessonContent);
  }

  let assessment;

  if (allMcqQuestions(lockedQuestions)) {
    assessment = gradeMcqAnswers(answers, lockedQuestions);
  } else if (!lockedQuestions.some((q) => q.type === "mcq")) {
    const openTexts = lockedQuestions.map((q) => questionText(q));
    const openResult = await assessOpenFn(answers, openTexts);
    assessment = openResult?.detailedFeedback?.length
      ? openResult
      : buildAssessmentFromParts(
          lockedQuestions,
          openResult?.scores || [],
          openResult?.feedback || []
        );
  } else {
    assessment = await gradeMixedAnswers(
      answers,
      lockedQuestions,
      async (openAnswers, openQuestions) => {
        const openResult = await assessOpenFn(openAnswers, openQuestions);
        const rows = openResult?.detailedFeedback || [];
        return {
          scores: rows.length
            ? rows.map((d) => d.score)
            : openResult?.scores || [],
          feedback: rows.length
            ? rows.map((d) => d.feedback)
            : openResult?.feedback || [],
        };
      }
    );
  }

  if (!assessment?.detailedFeedback) {
    assessment = buildAssessmentFromParts(
      lockedQuestions,
      answers.map((a) => (String(a || "").trim() ? 6 : 0)),
      lockedQuestions.map(() => "Graded with safe fallback.")
    );
  } else {
    assessment.detailedFeedback = assessment.detailedFeedback.map((item, i) => ({
      ...item,
      yourAnswer: answers[i] ?? item.yourAnswer,
      question: questionText(lockedQuestions[i]) || item.question,
    }));
  }

  assessment = applyLessonAwareOpenScores(
    assessment,
    answers,
    lockedQuestions,
    lessonContent
  );

  assessment = await runRevalidationLoop(
    assessment,
    answers,
    lockedQuestions,
    lessonContent
  );

  assessment = coerceAssessmentShape(assessment, answers, lockedQuestions);

  const finalIssues = auditMcqKeysAgainstLesson(lockedQuestions, lessonContent);
  if (finalIssues.length > 0) {
    console.error("❌ MCQ keys still invalid after revalidation:", finalIssues);
  } else {
    console.log("✅ MCQ keys audited OK against lesson");
  }

  return { assessment, lockedQuestions };
}

module.exports = {
  MAX_REVALIDATION_PASSES,
  lockMcqKeysFromLesson,
  prepareQuestionsForGrading,
  auditMcqKeysAgainstLesson,
  runRevalidatedGrading,
  runRevalidationLoop,
  revalidationPass,
};
