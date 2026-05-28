// =======================================================
// Quick Check question normalization & sanitization
// =======================================================

const BLOCKED_QUESTION_PATTERNS = [
  /what do you already know/i,
  /what do you know about this concept/i,
  /can you tell me what you already know/i,
];

function isBlockedQuestion(text) {
  if (!text || typeof text !== "string") return true;
  return BLOCKED_QUESTION_PATTERNS.some((p) => p.test(text));
}

function stripAnswerLeak(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/\n+\s*Correct answer\s*:.*$/gis, "")
    .replace(/\n+\s*Answer\s*:.*$/gis, "")
    .replace(/\n+\s*The correct (option|answer)\s+is.*$/gis, "")
    .trim();
}

function parseMcqFromString(text) {
  const raw = stripAnswerLeak(text);
  const answerMatch = text.match(/Correct answer\s*:\s*([A-D])\)?/i);
  const correctLetter = answerMatch ? answerMatch[1].toUpperCase() : null;

  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const options = [];
  const questionLines = [];

  for (const line of lines) {
    const optMatch = line.match(/^[A-D]\)\s*(.+)$/i);
    if (optMatch) {
      options.push(optMatch[1].trim());
    } else if (!line.match(/^Correct answer/i)) {
      questionLines.push(line);
    }
  }

  const question = questionLines.join("\n").trim();

  if (options.length >= 2) {
    let correctIndex = 0;
    if (correctLetter) {
      correctIndex = correctLetter.charCodeAt(0) - "A".charCodeAt(0);
    }
    if (correctIndex >= options.length) correctIndex = 0;

    return inferMcqCorrectIndex({
      type: "mcq",
      question,
      options,
      correctIndex,
    });
  }

  return { type: "open", question: raw };
}

/** Fix common AI mistakes when correctIndex is missing or wrong */
function inferMcqCorrectIndex(q) {
  if (!q || q.type !== "mcq" || !Array.isArray(q.options) || q.options.length < 2) {
    return q;
  }

  const questionLower = (q.question || "").toLowerCase();
  const options = q.options.map((o) => String(o).toLowerCase());

  if (/not a role|isn't a role|is not a role|not part of the.*landscape/.test(questionLower)) {
    const businessIdx = options.findIndex(
      (o) => o.includes("business user") || o.includes("business stakeholder")
    );
    if (businessIdx >= 0) {
      return { ...q, correctIndex: businessIdx };
    }
  }

  if (/recipe book|role of the ['"]?recipe/i.test(questionLower)) {
    const modelIdx = options.findIndex(
      (o) => o.includes("model") || o.includes("learned pattern")
    );
    if (modelIdx >= 0) {
      return { ...q, correctIndex: modelIdx };
    }
  }

  if (/data pipeline|data engineering/.test(questionLower) && /support|help/.test(questionLower)) {
    const etlIdx = options.findIndex(
      (o) =>
        o.includes("collect") ||
        o.includes("clean") ||
        o.includes("etl") ||
        o.includes("plumbing") ||
        o.includes("warehouse")
    );
    if (etlIdx >= 0) {
      return { ...q, correctIndex: etlIdx };
    }
  }

  if (/primary role|role of/.test(questionLower) && /data scientist/.test(questionLower)) {
    const scientistIdx = options.findIndex((o) => {
      const ol = o.toLowerCase();
      return (
        (ol.includes("turn raw") || ol.includes("into decisions")) &&
        (ol.includes("statistic") ||
          ol.includes("programming") ||
          ol.includes("domain") ||
          ol.includes("model") ||
          ol.includes("experiment"))
      );
    });
    if (scientistIdx >= 0) {
      return { ...q, correctIndex: scientistIdx };
    }
    const notWarehouseOnly = options.findIndex((o) => {
      const ol = o.toLowerCase();
      return (
        ol.includes("warehouse") &&
        !ol.includes("turn raw") &&
        !ol.includes("model") &&
        !ol.includes("statistic")
      );
    });
    if (q.correctIndex === notWarehouseOnly && scientistIdx < 0) {
      const alt = options.findIndex((o) =>
        /predict|optim|automat|insight|eda/i.test(o)
      );
      if (alt >= 0) return { ...q, correctIndex: alt };
    }
  }

  if (/primary goal|main goal|goal of data science/i.test(questionLower)) {
    const predictIdx = options.findIndex((o) =>
      /predict|optim|automat|turn raw|decisions/i.test(o.toLowerCase())
    );
    if (predictIdx >= 0) {
      return { ...q, correctIndex: predictIdx };
    }
  }

  if (
    /building and training predictive|builds? and trains? predictive|trains? predictive models|responsible for building.*model/i.test(
      questionLower
    )
  ) {
    const scientistIdx = options.findIndex((o) => /data scientist/i.test(o));
    const analystIdx = options.findIndex((o) => /data analyst/i.test(o));
    if (scientistIdx >= 0) {
      return { ...q, correctIndex: scientistIdx };
    }
    if (analystIdx >= 0 && q.correctIndex === analystIdx) {
      const modelIdx = options.findIndex((o) =>
        /predictive model|build.*model|train/i.test(o)
      );
      if (modelIdx >= 0) return { ...q, correctIndex: modelIdx };
    }
  }

  if (/data analyst/.test(questionLower) && /report|insight|bi\b/i.test(questionLower)) {
    const analystIdx = options.findIndex((o) => /data analyst/i.test(o));
    if (analystIdx >= 0) return { ...q, correctIndex: analystIdx };
  }

  return q;
}

function scoreOptionAgainstLesson(option, lessonContent) {
  const ol = String(option).toLowerCase();
  const lesson = String(lessonContent).toLowerCase();
  let score = 0;
  ol.split(/\W+/)
    .filter((w) => w.length > 4)
    .forEach((w) => {
      if (lesson.includes(w)) score += 2;
    });
  return score;
}

/** Pick MCQ correct answer from lesson text when AI stored the wrong index */
function alignMcqCorrectIndexWithLesson(q, lessonContent = "") {
  if (!q || q.type !== "mcq" || !lessonContent) {
    return inferMcqCorrectIndex(q);
  }

  let aligned = inferMcqCorrectIndex(q);
  const qLower = (aligned.question || "").toLowerCase();
  const lesson = lessonContent.toLowerCase();

  if (
    /building and training predictive|builds?.*predictive|trains? predictive|responsible for building/i.test(
      qLower
    )
  ) {
    const scientistIdx = aligned.options.findIndex((o) =>
      /data scientist/i.test(o)
    );
    if (scientistIdx >= 0) {
      aligned = { ...aligned, correctIndex: scientistIdx };
    }
  }

  if (/data scientist|primary role/.test(qLower)) {
    const ranked = aligned.options
      .map((opt, i) => {
        let s = scoreOptionAgainstLesson(opt, lessonContent);
        const ol = opt.toLowerCase();
        if (/turn raw|into decisions/.test(ol)) s += 25;
        if (/statistic|programming|domain knowledge/.test(ol)) s += 15;
        if (/eda|model|experiment/.test(ol)) s += 10;
        if (/warehouse/.test(ol) && !/turn raw|model|insight|decision/.test(ol)) {
          s -= 20;
        }
        return { i, s };
      })
      .sort((a, b) => b.s - a.s);

    if (ranked[0]?.s > 0) {
      aligned = { ...aligned, correctIndex: ranked[0].i };
    }
  }

  if (/customer|provides data|who provides/.test(qLower)) {
    const idx = aligned.options.findIndex((o) =>
      /customer|user|business|stakeholder|you\)/i.test(o)
    );
    if (idx >= 0) aligned = { ...aligned, correctIndex: idx };
  }

  return aligned;
}

/** Drop quiz items that require explaining flows the lesson never taught */
function isQuestionAnswerableFromLesson(q, lessonContent) {
  if (!q || !lessonContent) return true;
  if (q.type === "mcq") return true;

  const qt = (q.question || "").toLowerCase();
  const lesson = lessonContent.toLowerCase();
  const howSection = lesson.split(/\*\*how\*\*/i)[1]?.split(/\*\*real-time/i)[0] || "";

  if (/development to production|from development.*production|dev to prod/i.test(qt)) {
    const teachesProd =
      /ml engineer.*(api|production|ship|deploy|package)/i.test(howSection + lesson) ||
      /packages? it into a production/i.test(lesson) ||
      /ship.*production/i.test(lesson);
    return teachesProd;
  }

  if (/detail.*algorithm|explain.*algorithm|how.*algorithm/i.test(qt)) {
    const teachesAlgos =
      /collaborative filtering|embedding model|algorithm/i.test(lesson);
    return teachesAlgos;
  }

  const needsWarehouseModelDashboard =
    /warehouse/.test(qt) && /model/.test(qt) && /dashboard/.test(qt);

  if (needsWarehouseModelDashboard) {
    const hasTerms =
      /warehouse|data pipeline|kitchen/.test(lesson) &&
      /model|recipe book/.test(lesson) &&
      /dashboard|plate|template/.test(lesson);
    const hasFlow =
      /warehouse.*model|model.*dashboard|stores.*data|data warehouse|uses.*model|powered by.*model/i.test(
        howSection
      ) || howSection.split(/\d+\./).length >= 3;
    return hasTerms && hasFlow;
  }

  return true;
}

function buildFallbackQuestionsFromLesson(lessonContent, count = 4) {
  const lesson = String(lessonContent || "");
  const fallbacks = [];

  if (/predict|readmission|hospital/i.test(lesson)) {
    fallbacks.push({
      type: "open",
      question:
        "Why does data science matter for organizations? Use the hospital or business example from the lesson.",
    });
  }

  const castLines = lesson.match(/\*\*[^*]+\*\*\s*=\s*[^\n]+/g) || [];
  if (castLines.length >= 2) {
    fallbacks.push({
      type: "open",
      question: `What does "${castLines[0].replace(/\*\*/g, "").trim()}" mean in this lesson?`,
    });
  }

  if (/\*\*real-time use case\*\*/i.test(lesson)) {
    fallbacks.push({
      type: "open",
      question:
        "What does the user see on the app versus what happens internally? (from the Real-time use case section)",
    });
  }

  fallbacks.push({
    type: "open",
    question: "In your own words, what is the key takeaway from this lesson?",
  });

  return fallbacks.slice(0, count);
}

/**
 * Align every quiz item with the lesson actually shown (all technologies).
 */
function alignQuizWithLesson(questions, lessonContent, targetCount = 4) {
  const normalized = normalizeQuizQuestions(questions);
  const lesson = String(lessonContent || "");

  let aligned = normalized
    .filter((q) => isQuestionAnswerableFromLesson(q, lesson))
    .map((q) =>
      q.type === "mcq" ? alignMcqCorrectIndexWithLesson(q, lesson) : q
    );

  if (aligned.length < Math.min(targetCount, 2) && lesson.length > 200) {
    const extras = buildFallbackQuestionsFromLesson(lesson, targetCount);
    aligned = [...aligned, ...extras];
  }

  return enforceQuestionMix(aligned, targetCount);
}

/**
 * Ask to elaborate ONLY when meaning is genuinely unclear (topic stub).
 * NOT for refusals, nonsense, off-topic, or already-wrong answers — those get graded.
 */
function needsElaborationRequest(answer, question, _lessonContent = "", options = {}) {
  if (options.alreadyAsked) return null;

  const a = (answer || "").trim();
  if (!a) return null;

  const lower = a.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const q = (question || "").toLowerCase();

  if (
    /^(idk|i don't know|don't know|no idea|skip|pass|whatever|dunno|not sure|yes|no|ok|okay|test|asdf)$/i.test(
      lower
    )
  ) {
    return null;
  }

  if (!/[a-z]{3,}/i.test(lower) || /pizza|football|don't care|hate this|boring/i.test(lower)) {
    return null;
  }

  if (
    /data analyst/.test(q) &&
    (/role|contribute|decision|landscape|explain|how do they/.test(q) ||
      /what does.*analyst/.test(q)) &&
    /build.*model|train.*model|predictive model/i.test(lower) &&
    !/report/i.test(lower)
  ) {
    return null;
  }

  if (
    (/data scientist|predictive model|build.*model|who.*build/.test(q) ||
      /building and training/.test(q)) &&
    /data analyst/i.test(lower) &&
    !/data scientist|scientist/i.test(lower)
  ) {
    return null;
  }

  const clearMeaning =
    /report|reports|bi\b|business intelligence|dashboard|insight|visualiz|present|tool|sql|kpi/i.test(
      lower
    ) ||
    /data analyst|analyst.*report/i.test(lower) ||
    /data scientist|build.*model|train.*model|predictive/i.test(lower) ||
    /ml engineer|deploy|production|\bapi\b|ship|package/i.test(lower) ||
    /data engineer|pipeline|etl|warehouse|data quality/i.test(lower) ||
    /algorithm|collaborative|embedding|recommend|backend|internal/i.test(lower) ||
    /turn raw|into decisions|statistic|programming|domain/i.test(lower) ||
    /invest|benefit|stakeholder|customer.*data/i.test(lower);

  if (clearMeaning) return null;
  if (words.length >= 4) return null;

  const msg = "Can you elaborate on this? I want to be sure I understand what you mean.";

  if (
    /^(data|data science|algorithm|algorithms|model|models|predicting|prediction|ml|ai|analytics?|science)$/i.test(
      lower
    )
  ) {
    return { needsElaboration: true, message: msg };
  }

  if (words.length === 2 && /^(machine learning|big data|deep learning)$/i.test(lower)) {
    return { needsElaboration: true, message: msg };
  }

  return null;
}

/**
 * Meaning-based open-answer scoring from lesson text — NEVER by word count or sentence count.
 * Returns null if unclear (caller should ask to elaborate) or if AI should grade.
 */
function scoreOpenAnswerWithLesson(answer, question, lessonContent) {
  if (!answer?.trim() || !lessonContent) return null;

  const a = answer.toLowerCase().trim();
  const q = (question || "").toLowerCase();
  const lesson = lessonContent.toLowerCase();

  if (
    /data analyst/.test(q) &&
    (/role|contribute|decision|landscape|explain/.test(q) || /how do they/.test(q))
  ) {
    if (
      /report|reports|bi\b|business intelligence|dashboard|insight|visual|power bi|tableau|tool|present|existing data|kpi/i.test(
        a
      )
    ) {
      return {
        score: 10,
        status: "correct",
        feedback:
          "Correct — the lesson defines the Data Analyst as handling reporting, BI tools, and insights (not building predictive models).",
      };
    }
    if (/build.*model|train.*model|predictive model/i.test(a) && !/report/i.test(a)) {
      return {
        score: 4,
        status: "incorrect",
        feedback:
          "That describes a Data Scientist in this lesson. The Data Analyst focuses on reports and insights from existing data.",
      };
    }
  }

  if (
    /development to production|to production|ml engineer/.test(q) &&
    /data engineer|process/.test(q)
  ) {
    if (
      /deploy|production|api|ship|package|trained model|ml engineer|pipeline|feed.*data|data quality/i.test(
        a
      )
    ) {
      const lessonCovers =
        /ml engineer.*(api|production|package|ship)/i.test(lesson) ||
        /data engineer.*pipeline/i.test(lesson);
      if (lessonCovers) {
        return {
          score: 9,
          status: "correct",
          feedback:
            "Correct — your answer matches the lesson's How steps (ML Engineer deploys to production; Data Engineer maintains the pipeline).",
        };
      }
    }
  }

  if (
    /netflix|personalized|user experience|internal process|real-time|amazon.*recommend/i.test(
      q
    )
  ) {
    if (
      /algorithm|collaborative|embedding|recommend|backend|internal|model|filtering/i.test(
        a
      )
    ) {
      if (/collaborative|embedding|algorithm|recommend|internally|backend/i.test(lesson)) {
        return {
          score: 9,
          status: "correct",
          feedback:
            "Correct — the lesson's Real-time use case says recommendations are powered by collaborative filtering/embedding models and algorithms in the backend.",
        };
      }
    }
    if (/user see|homepage|recommendation|personalized|screen/i.test(a)) {
      return {
        score: 7,
        status: "partial",
        feedback:
          "Good start on what the user sees — also mention what runs internally (models/algorithms) as in the lesson.",
      };
    }
  }

  if (/data scientist/.test(q) && /data analyst|ml engineer|differ|relation/.test(q)) {
    if (/model|train|predict|experiment|statistic|programming/i.test(a)) {
      return {
        score: 9,
        status: "correct",
        feedback: "Correct — matches the lesson: Data Scientist builds/trains predictive models.",
      };
    }
  }

  return null;
}

/** Override AI scores when lesson text clearly supports the student's meaning */
function applyLessonAwareOpenScores(assessment, answers, questions, lessonContent) {
  if (!assessment?.detailedFeedback || !lessonContent) return assessment;

  let totalScore = 0;
  const maxScore = questions.length * 10;

  assessment.detailedFeedback = assessment.detailedFeedback.map((item, index) => {
    const qText =
      typeof questions[index] === "string"
        ? questions[index]
        : questions[index]?.question || item.question;
    const lessonScore = scoreOpenAnswerWithLesson(
      answers[index],
      qText,
      lessonContent
    );

    if (!lessonScore) {
      totalScore += item.score ?? 0;
      return item;
    }

    const aiScore = item.score ?? 0;
    const useLesson = lessonScore.score >= aiScore || aiScore < 7;
    const finalScore = useLesson ? lessonScore.score : aiScore;

    totalScore += finalScore;
    return {
      ...item,
      score: finalScore,
      maxScore: 10,
      status: lessonScore.status || item.status,
      feedback: useLesson ? lessonScore.feedback : item.feedback,
    };
  });

  assessment.score = totalScore;
  assessment.maxScore = maxScore;
  assessment.percentage =
    maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  assessment.passed = assessment.percentage >= 60;

  return assessment;
}

function normalizeQuizQuestion(item, index = 0) {
  if (!item) return null;

  if (typeof item === "string") {
    const trimmed = item.trim();
    if (trimmed.length < 5) return null;
    if (/^[A-D]\)\s/.test(trimmed) || /\n[A-D]\)\s/.test(trimmed)) {
      return parseMcqFromString(trimmed);
    }
    if (trimmed.includes("Correct answer")) {
      return parseMcqFromString(trimmed);
    }
    return { type: "open", question: stripAnswerLeak(trimmed) };
  }

  if (typeof item === "object") {
    const questionText = stripAnswerLeak(item.question || item.text || "");
    if (Array.isArray(item.options) && item.options.length >= 2) {
      const options = item.options.map((o) =>
        typeof o === "string" ? o.replace(/^[A-D]\)\s*/i, "").trim() : String(o)
      );
      let correctIndex =
        typeof item.correctIndex === "number" ? item.correctIndex : 0;
      if (typeof item.correctAnswer === "string") {
        const letter = item.correctAnswer.match(/^([A-D])/i);
        if (letter) {
          correctIndex = letter[1].toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
        }
      }
      correctIndex = Math.max(0, Math.min(correctIndex, options.length - 1));
      return inferMcqCorrectIndex({
        type: "mcq",
        question: questionText,
        options,
        correctIndex,
      });
    }
    if (questionText.length > 5 && !isBlockedQuestion(questionText)) {
      return { type: "open", question: questionText };
    }
  }

  return null;
}

function normalizeQuizQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  return questions
    .map((q, i) => normalizeQuizQuestion(q, i))
    .filter(Boolean);
}

/** Strip correct answers before sending to the browser */
function sanitizeQuestionsForClient(questions) {
  return normalizeQuizQuestions(questions).map((q) => {
    if (q.type === "mcq") {
      return {
        type: "mcq",
        question: q.question,
        options: q.options,
      };
    }
    return { type: "open", question: q.question };
  });
}

function gradeMcqAnswers(answers, questions) {
  const scores = [];
  const feedback = [];

  answers.forEach((answer, index) => {
    const q = questions[index];
    if (!q || q.type !== "mcq") {
      scores.push(0);
      feedback.push("Unable to grade this question.");
      return;
    }

    const selectedIndex = resolveSelectedIndex(answer, q.options);
    const correct = selectedIndex === q.correctIndex;

    scores.push(correct ? 10 : 0);
    feedback.push(
      correct
        ? `Correct! "${q.options[q.correctIndex]}" is the right choice.`
        : `Not quite. The best answer is "${q.options[q.correctIndex]}". You chose "${answer}".`
    );
  });

  const totalScore = scores.reduce((a, b) => a + b, 0);
  const maxScore = scores.length * 10;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    score: totalScore,
    maxScore,
    percentage,
    passed: percentage >= 60,
    detailedFeedback: answers.map((ans, index) => ({
      questionNumber: index + 1,
      question: questions[index]?.question || "",
      yourAnswer: ans,
      score: scores[index],
      maxScore: 10,
      status: scores[index] >= 10 ? "correct" : "incorrect",
      feedback: feedback[index],
    })),
    feedback,
    scores,
  };
}

function resolveSelectedIndex(answer, options) {
  if (typeof answer !== "string") return -1;
  const trimmed = answer.trim();

  const letterMatch = trimmed.match(/^([A-D])\)?$/i);
  if (letterMatch) {
    return letterMatch[1].toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
  }

  const idx = options.findIndex(
    (opt) =>
      opt.toLowerCase() === trimmed.toLowerCase() ||
      trimmed.toLowerCase().includes(opt.toLowerCase().substring(0, 20))
  );
  return idx;
}

function allMcqQuestions(questions) {
  return (
    questions.length > 0 && questions.every((q) => q && q.type === "mcq")
  );
}

/** ~70% written answers, ~30% multiple choice */
function getQuestionMixCounts(total) {
  if (total <= 1) return { openCount: 1, mcqCount: 0 };
  const mcqCount = Math.max(1, Math.round(total * 0.3));
  let openCount = total - mcqCount;
  if (openCount < 1) {
    return { openCount: total - 1, mcqCount: 1 };
  }
  return { openCount, mcqCount };
}

function interleaveQuestions(opens, mcqs) {
  const result = [];
  const total = opens.length + mcqs.length;
  if (total === 0) return result;

  const mcqSlots = new Set();
  if (mcqs.length > 0) {
    for (let i = 0; i < mcqs.length; i++) {
      const pos = Math.min(
        total - 1,
        Math.round(((i + 1) * total) / (mcqs.length + 1)) - 1
      );
      mcqSlots.add(Math.max(0, pos));
    }
  }

  let oi = 0;
  let mi = 0;
  for (let i = 0; i < total; i++) {
    if (mcqSlots.has(i) && mi < mcqs.length) {
      result.push(mcqs[mi++]);
    } else if (oi < opens.length) {
      result.push(opens[oi++]);
    } else if (mi < mcqs.length) {
      result.push(mcqs[mi++]);
    }
  }

  while (oi < opens.length) result.push(opens[oi++]);
  while (mi < mcqs.length) result.push(mcqs[mi++]);

  return result;
}

function enforceQuestionMix(questions, totalCount) {
  const targetTotal = totalCount || questions.length;
  const { openCount, mcqCount } = getQuestionMixCounts(targetTotal);

  const normalized = normalizeQuizQuestions(questions);
  const mcqs = normalized.filter((q) => q.type === "mcq");
  const opens = normalized.filter((q) => q.type !== "mcq");

  while (mcqs.length > mcqCount) {
    const extra = mcqs.pop();
    opens.push({ type: "open", question: extra.question });
  }

  const finalOpens = opens.slice(0, openCount);
  const finalMcqs = mcqs.slice(0, mcqCount);

  while (finalOpens.length + finalMcqs.length < targetTotal && opens.length > finalOpens.length) {
    finalOpens.push(opens[finalOpens.length]);
  }

  return interleaveQuestions(finalOpens, finalMcqs).slice(0, targetTotal);
}

async function gradeMixedAnswers(answers, questions, assessOpenFn) {
  const scores = new Array(questions.length);
  const feedback = new Array(questions.length);
  const openIndices = [];
  const openAnswers = [];
  const openQuestions = [];

  questions.forEach((q, i) => {
    if (q.type === "mcq") {
      const selectedIndex = resolveSelectedIndex(answers[i], q.options);
      const correct = selectedIndex === q.correctIndex;
      scores[i] = correct ? 10 : 0;
      feedback[i] = correct
        ? `Correct! "${q.options[q.correctIndex]}" is the right choice.`
        : `Not quite. The best answer is "${q.options[q.correctIndex]}". You chose "${answers[i] || "(no answer)"}".`;
    } else {
      openIndices.push(i);
      openAnswers.push(answers[i] || "");
      openQuestions.push(q.question);
    }
  });

  if (openIndices.length > 0 && typeof assessOpenFn === "function") {
    const openResult = await assessOpenFn(openAnswers, openQuestions);
    openIndices.forEach((origIdx, j) => {
      scores[origIdx] = openResult.scores?.[j] ?? 0;
      feedback[origIdx] =
        openResult.feedback?.[j] || "Review this concept and try again.";
    });
  }

  const totalScore = scores.reduce((a, b) => a + (b || 0), 0);
  const maxScore = questions.length * 10;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    score: totalScore,
    maxScore,
    percentage,
    passed: percentage >= 60,
    detailedFeedback: questions.map((q, i) => ({
      questionNumber: i + 1,
      question: q.question,
      yourAnswer: answers[i],
      score: scores[i],
      maxScore: 10,
      status:
        scores[i] >= 9 ? "correct" : scores[i] >= 6 ? "partial" : "incorrect",
      feedback: feedback[i],
    })),
    scores,
    feedback,
  };
}

module.exports = {
  stripAnswerLeak,
  normalizeQuizQuestions,
  sanitizeQuestionsForClient,
  gradeMcqAnswers,
  gradeMixedAnswers,
  allMcqQuestions,
  getQuestionMixCounts,
  enforceQuestionMix,
  parseMcqFromString,
  alignQuizWithLesson,
  alignMcqCorrectIndexWithLesson,
  isQuestionAnswerableFromLesson,
  scoreOpenAnswerWithLesson,
  applyLessonAwareOpenScores,
  needsElaborationRequest,
};
