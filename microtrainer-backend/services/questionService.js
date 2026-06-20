const axios = require("axios");

const { BASE_PERSONA, INTERVIEW_PERSONA } = require("./personaConfig");
const { getStudentMemory } = require("./memoryService");

const {
  getRandomMongoQuestion,
  getRandomExpressQuestion,
  getRandomReactQuestionCurated,
  getRandomNodeQuestionCurated,
  getRandomJSQuestionCurated,
  getRandomJavaQuestionCurated,
  getRandomPythonQuestionCurated,
  getRandomSQLQuestionCurated,
} = require("./curatedInterviewBanks");

const {
  pickInterviewTopic,
  getRolePromptHint,
} = require("./dataScienceInterviewRoles");
const {
  getRandomAiMlQuestion,
  isAiMlMasterSubject,
  matchesRoleSubject,
} = require("./aiMlQuestionBank");

const {
  isInterviewQualityQuestion,
  ensureInterviewQuestion,
  getCuratedFallback,
  pickCuratedQuestion,
  normalizeQuestion,
  isAbsurdQuestion,
  isQuestionExcluded,
} = require("./interviewQuestionQuality");

function getAskedQuestions(history = []) {
  return history.map((h) => h.question).filter(Boolean);
}

function pickOptions(history) {
  return { excludeQuestions: getAskedQuestions(history) };
}

function getAdaptiveDifficulty(history = []) {
  if (history.length === 0) return "easy";
  const recent = history.slice(-3);
  const avg = recent.reduce((sum, h) => sum + (h.score || 0), 0) / recent.length;
  if (avg >= 7) return "hard";
  if (avg >= 4) return "medium";
  return "easy";
}

function getWeakFocus(history = []) {
  if (!history.length) return "";
  const mistakes = history.map((h) => h.mistakes || "").join(" ").toLowerCase();
  if (mistakes.includes("state")) return "state management";
  if (mistakes.includes("hook")) return "react hooks";
  if (mistakes.includes("api")) return "api handling";
  if (mistakes.includes("render")) return "rendering";
  if (mistakes.includes("props")) return "props usage";
  return "";
}

function cleanQuestion(q) {
  const cleaned = normalizeQuestion(q);
  if (!cleaned) return null;
  if (cleaned.length > 200) return cleaned.split(/[.!?]/)[0].trim();
  return cleaned;
}

function questionPack(questionText, difficulty, subject = "") {
  return {
    question: ensureInterviewQuestion(questionText, subject, difficulty),
    difficulty,
  };
}

function pickMernQuestion(difficulty, history = []) {
  const opts = pickOptions(history);
  const techs = [
    { getter: getRandomMongoQuestion, subject: "MongoDB" },
    { getter: getRandomExpressQuestion, subject: "Express" },
    { getter: getRandomReactQuestionCurated, subject: "React" },
    { getter: getRandomNodeQuestionCurated, subject: "Node.js" },
  ];
  const pick = techs[Math.floor(Math.random() * techs.length)];
  return questionPack(
    pickCuratedQuestion(pick.getter, pick.subject, difficulty, opts),
    difficulty,
    pick.subject
  );
}

async function generateQuestion({ subject, history = [], studentId }) {
  try {
    const difficulty = getAdaptiveDifficulty(history);
    const subjectLower = subject.toLowerCase();
    const isFullStack =
      subjectLower.includes("full stack") || subjectLower.includes("fullstack");
    const opts = pickOptions(history);

    if (subjectLower.includes("mern")) {
      return pickMernQuestion(difficulty, history);
    }

    if (subjectLower.includes("java") && isFullStack) {
      const stack = [
        { getter: getRandomJavaQuestionCurated, subject: "Java" },
        { getter: getRandomReactQuestionCurated, subject: "React" },
      ];
      const pick = stack[Math.floor(Math.random() * stack.length)];
      return questionPack(
        pickCuratedQuestion(pick.getter, pick.subject, difficulty, opts),
        difficulty,
        pick.subject
      );
    }

    const originalSubject = subject;
    const useAiMlBank =
      isAiMlMasterSubject(originalSubject) || matchesRoleSubject(originalSubject);

    if (!isAiMlMasterSubject(originalSubject)) {
      const dsTopic = pickInterviewTopic(subject);
      if (dsTopic) subject = dsTopic;
    }
    const dsRoleHint = getRolePromptHint(originalSubject);

    if (useAiMlBank) {
      let tier;
      if (difficulty === "easy") tier = 1;
      else if (difficulty === "hard") tier = Math.random() < 0.45 ? 3 : 2;
      else tier = Math.random() < 0.65 ? 1 : 2;

      const raw = getRandomAiMlQuestion(difficulty, {
        tier,
        excludeQuestions: opts.excludeQuestions,
      });
      return questionPack(raw, difficulty, originalSubject);
    }

    if (subjectLower.includes("python") && isFullStack) {
      const stack = [
        { getter: getRandomPythonQuestionCurated, subject: "Python" },
        { getter: getRandomReactQuestionCurated, subject: "React" },
      ];
      const pick = stack[Math.floor(Math.random() * stack.length)];
      return questionPack(
        pickCuratedQuestion(pick.getter, pick.subject, difficulty, opts),
        difficulty,
        pick.subject
      );
    }

    const curatedRoutes = [
      { match: (s) => s === "javascript" || s === "js", getter: getRandomJSQuestionCurated, label: "JavaScript" },
      { match: (s) => s === "react" || s === "reactjs", getter: getRandomReactQuestionCurated, label: "React" },
      { match: (s) => s === "mongodb", getter: getRandomMongoQuestion, label: "MongoDB" },
      { match: (s) => s === "express", getter: getRandomExpressQuestion, label: "Express" },
      { match: (s) => s === "node" || s === "nodejs" || s === "node.js", getter: getRandomNodeQuestionCurated, label: "Node.js" },
      { match: (s) => s === "java", getter: getRandomJavaQuestionCurated, label: "Java" },
      { match: (s) => s === "python", getter: getRandomPythonQuestionCurated, label: "Python" },
      { match: (s) => s === "sql", getter: getRandomSQLQuestionCurated, label: "SQL" },
    ];

    for (const route of curatedRoutes) {
      if (route.match(subjectLower)) {
        return questionPack(
          pickCuratedQuestion(route.getter, route.label, difficulty, opts),
          difficulty,
          route.label
        );
      }
    }

    const memory = await getStudentMemory(studentId);
    const previousQuestions = opts.excludeQuestions;

    const prompt = `
Subject: ${subject}
Difficulty: ${difficulty}
${dsRoleHint ? `\n${dsRoleHint}\n` : ""}
Weak: ${memory?.weakConcepts?.join(", ") || "None"}
Previous: ${previousQuestions.map((q) => "- " + q).join("\n") || "None"}

Generate ONE specific technical interview question with a clear task.

NEVER repeat or closely paraphrase any question listed under Previous.
NEVER: "What is [technology]?", "Show code for [framework]", vague prompts.
MUST: concrete skill, answerable in 2–5 minutes (verbal explanation or sketch — not a full IDE session), real interview tone.

Return ONLY the question (one line, max 22 words).
`;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: `${BASE_PERSONA}\n\n${INTERVIEW_PERSONA}` },
            { role: "user", content: prompt },
          ],
          temperature: 0.45 + attempt * 0.08,
          max_tokens: 80,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const question = cleanQuestion(response?.data?.choices?.[0]?.message?.content);

      if (!question || !isInterviewQualityQuestion(question, subject)) {
        break;
      }
      if (!isQuestionExcluded(question, previousQuestions)) {
        return questionPack(question, difficulty, subject);
      }
    }

    return questionPack(
      getCuratedFallback(subject, difficulty, opts),
      difficulty,
      subject
    );
  } catch (error) {
    console.error("Question Generation Error:", error.message);
    return questionPack(
      getCuratedFallback(subject, "easy", pickOptions(history)),
      "easy",
      subject
    );
  }
}

module.exports = {
  generateQuestion,
  isAbsurdQuestion,
  isInterviewQualityQuestion,
  ensureInterviewQuestion,
};
