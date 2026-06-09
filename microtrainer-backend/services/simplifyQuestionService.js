/**
 * Re-phrase a Quick Check question in simpler language (same concept, same difficulty intent).
 */

const { callGroq } = require("./groqClient");
const { normalizeQuizQuestion } = require("./quizQuestionUtils");

function parseJsonFromGroq(raw) {
  let text = (raw || "").trim();
  text = text.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in simplify-question response");
  return JSON.parse(text.slice(start, end + 1));
}

function buildPrompt({ technology, conceptTitle, lessonSnippet, question }) {
  const q = question.type === "mcq"
    ? {
        type: "mcq",
        question: question.question,
        options: question.options,
        correctIndex: question.correctIndex,
      }
    : { type: "open", question: question.question };

  return `You help students understand quiz questions without giving away the answer.

Technology: ${technology}
Concept: ${conceptTitle}

Lesson context (prefer technical terms from the lesson — avoid story/analogy names):
${(lessonSnippet || "").slice(0, 1800)}

ORIGINAL QUESTION (JSON):
${JSON.stringify(q)}

Rewrite this question in SIMPLER English for a beginner:
- Shorter sentences, plain words, no jargon unless the lesson already used it
- Same topic and what is being tested — do NOT make it a different question
- Do NOT rewrite into story/analogy language (no waiter, backpack, locker metaphors)
- Do NOT include the correct answer, hints, or "Correct answer:" lines
- For MCQ: simplify question AND each option; keep the SAME correct option index (${question.correctIndex ?? 0})
- Max 2 short sentences for open questions; MCQ stem max 2 sentences

Return ONLY valid JSON:
{
  "type": "open" | "mcq",
  "question": "simplified question text",
  "options": ["only if mcq"],
  "correctIndex": 0
}`;
}

async function simplifyQuizQuestion({ technology, conceptTitle, lessonSnippet, question }) {
  if (!question?.question) {
    throw new Error("No question to simplify");
  }

  const response = await callGroq({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You output only valid JSON. Simplify quiz wording only — never reveal answers.",
      },
      { role: "user", content: buildPrompt({ technology, conceptTitle, lessonSnippet, question }) },
    ],
    temperature: 0.35,
    max_tokens: 450,
  });

  const parsed = parseJsonFromGroq(
    response?.data?.choices?.[0]?.message?.content || ""
  );

  if (question.type === "mcq") {
    parsed.type = "mcq";
    parsed.correctIndex =
      typeof parsed.correctIndex === "number"
        ? parsed.correctIndex
        : question.correctIndex;
  }

  const normalized = normalizeQuizQuestion(parsed);
  if (!normalized) {
    throw new Error("Could not simplify question");
  }

  if (question.type === "mcq" && normalized.type === "mcq") {
    normalized.correctIndex = Math.max(
      0,
      Math.min(
        typeof question.correctIndex === "number" ? question.correctIndex : 0,
        normalized.options.length - 1
      )
    );
  }

  return normalized;
}

module.exports = { simplifyQuizQuestion };
