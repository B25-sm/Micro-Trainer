const axios = require("axios");

// 🔹 Persona Import (NEW)
const {
  BASE_PERSONA,
  TEACHING_PERSONA
} = require("./personaConfig");

// 🔹 Safe imports
let getRelevantContext, detectSubject;

try {
  ({ getRelevantContext } = require("./ragService"));
  ({ detectSubject } = require("./routerService"));
} catch (err) {
  console.error("Import Error:", err.message);
}

// 🔥 Gibberish detection
function isGibberish(text) {
  if (!text) return true;

  const cleaned = text.trim();

  if (cleaned.length < 5) return true;
  if (!/[a-zA-Z]{3,}/.test(cleaned)) return true;
  if (!cleaned.includes(" ") && cleaned.length > 8) return true;

  return false;
}

async function getAnswer(question) {
  try {
    // 🔴 Hard validation
    if (!question || typeof question !== "string") {
      return {
        answer: "Invalid question input.",
        confidence: "low"
      };
    }

    if (!getRelevantContext || !detectSubject) {
      return {
        answer: "System configuration error. Please contact admin.",
        confidence: "low"
      };
    }

    // 🔹 STEP 1: Detect subject
    const subject = detectSubject(question);

    // 🔹 STEP 2: Get context
    const context = getRelevantContext(question, subject);

    // 🔹 STEP 3: Build prompt
    const userPrompt = `
Subject: ${subject}

Context:
${context || "No additional context available"}

Question:
${question}
`;

    // 🔥 NEW: YOUR FULL SYSTEM PROMPT
    const SYSTEM_PROMPT = `
${BASE_PERSONA}

${TEACHING_PERSONA}

STRICT RULES:
- Be enthusiastic and slightly intense
- Push clarity
- No boring explanations
- Make the student understand deeply

If question is unclear:
Respond ONLY with:
"I don't understand the question. Please ask clearly."
`;

    // 🔹 STEP 4: Call Groq
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.6, // slightly more expressive
        max_tokens: 700
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // 🔹 STEP 5: Extract response
    const aiMessage = response?.data?.choices?.[0]?.message?.content;

    if (!aiMessage) {
      return {
        answer: "AI returned an empty response.",
        confidence: "low"
      };
    }

    // 🔥 CONFIDENCE SYSTEM (UNCHANGED BUT STRONG)
    let confidence = "high";
    const lowerAnswer = aiMessage.toLowerCase();

    if (isGibberish(question)) {
      confidence = "low";
    } 
    else if (
      lowerAnswer.includes("don't understand") ||
      lowerAnswer.includes("doesn't make sense") ||
      lowerAnswer.includes("not clear") ||
      lowerAnswer.includes("please ask clearly")
    ) {
      confidence = "low";
    } 
    else if (!context || context.trim() === "") {
      confidence = "medium";
    }

    if (!aiMessage || aiMessage.length < 80) {
      confidence = "low";
    }

    return {
      answer: aiMessage,
      confidence
    };

  } catch (error) {
    console.error("Groq API Error:", error.response?.data || error.message);

    return {
      answer: "Something went wrong while generating the answer. Please try again.",
      confidence: "low"
    };
  }
}

module.exports = { getAnswer };