const axios = require("axios");
const {
  isAbsurdQuestion,
  ensureInterviewQuestion,
} = require("./interviewQuestionQuality");

const CLARIFICATION_PATTERNS = [
  /\b(didn't|didnt|don't|dont|do not)\s+(get|understand|catch)\b/i,
  /\b(not|n't)\s+clear\b/i,
  /\bcan you\b.*\b(repeat|rephrase|clarify|explain)\b/i,
  /\bcould you\b.*\b(repeat|rephrase|clarify|explain)\b/i,
  /\bwhat do you mean\b/i,
  /\bplease\b.*\b(repeat|clarify|explain|rephrase)\b/i,
  /\bsay (that|it) again\b/i,
  /\bconfused\b/i,
  /\belaborate\b/i,
  /\bexplain\b.*\b(question|this|that|previous|again|same)\b/i,
  /\b(repeat|rephrase|clarify)\b.*\bquestion\b/i,
  /\b(previous|same|last)\s+question\b/i,
  /\bcan you explain\b/i,
  /\bi('m| am) (lost|confused)\b/i,
  /\bwhat (are|is) you asking\b/i,
  /\bwhat should i (write|answer|say|do)\b/i,
  /\bdid not understand\b/i,
  /\bunclear\b/i,
  /\bdon'?t\s+(give|ask|move to|jump to)\s+(new|another|next)\s+question/i,
  /\bno\s+new\s+questions?\b/i,
];

function isClarificationRequest(text) {
  const t = String(text || "").trim();
  if (!t || t.length > 300) return false;

  return CLARIFICATION_PATTERNS.some((pattern) => pattern.test(t));
}

function fixAbsurdQuestion(question, subject = "MERN Stack") {
  const q = String(question || "").trim();
  if (isAbsurdQuestion(q) || /^what is (mongodb|react|express|node)/i.test(q)) {
    return ensureInterviewQuestion(q, subject, "medium");
  }
  return q;
}

function fallbackClarification(question, studentMessage, subject) {
  const fairQuestion = fixAbsurdQuestion(question, subject);
  const opener = /didn't|didnt|don't|dont|confused|understand/i.test(studentMessage)
    ? "No worries — happy to clarify."
    : "Sure — let me put it another way.";

  return {
    message: `${opener} I'm not asking for everything about the topic — just a focused answer.\n\n**Rephrased:** ${fairQuestion}\n\nTake your time. A short example or explanation is fine.`,
    revisedQuestion: fairQuestion !== question ? fairQuestion : null,
  };
}

async function generateClarification({
  question,
  subject,
  studentMessage,
  clarificationCount = 1,
}) {
  const fairQuestion = fixAbsurdQuestion(question, subject);

  if (!process.env.GROQ_API_KEY) {
    return fallbackClarification(question, studentMessage, subject);
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a friendly, professional technical interviewer (like a real human).
The candidate asked for clarification — they have NOT answered yet.

Rules:
- Start with a brief, warm acknowledgment (1 short sentence)
- Rephrase the question clearly and specifically
- If the original question is vague or unfair (e.g. "show code for MongoDB"), replace it with ONE fair, specific task
- Give a tiny hint of what a good answer should include — do NOT give the full answer
- Sound conversational, not robotic
- Under 90 words
- End by inviting them to answer when ready

Return ONLY JSON:
{"message":"your reply to the candidate","revisedQuestion":"fair single-line question or null if original is fine"}`,
          },
          {
            role: "user",
            content: `Subject: ${subject}
Original question: ${question}
${fairQuestion !== question ? `Note: original question may be unfair. Prefer: ${fairQuestion}` : ""}
Candidate said: "${studentMessage}"
Clarification request #${clarificationCount} for this question`,
          },
        ],
        temperature: 0.45,
        max_tokens: 220,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = response?.data?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    const message = String(parsed.message || "").trim();
    const revisedQuestion = String(parsed.revisedQuestion || "").trim() || null;

    if (!message) {
      return fallbackClarification(question, studentMessage, subject);
    }

    return {
      message,
      revisedQuestion: revisedQuestion || (fairQuestion !== question ? fairQuestion : null),
    };
  } catch (err) {
    console.error("Clarification generation error:", err.message);
    return fallbackClarification(question, studentMessage, subject);
  }
}

module.exports = {
  isClarificationRequest,
  generateClarification,
  fixAbsurdQuestion,
};
