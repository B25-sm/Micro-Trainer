const axios = require("axios");

// 🔹 Persona
const {
  BASE_PERSONA,
  INTERVIEW_PERSONA
} = require("./personaConfig");

// 🔹 Memory (NEW)
const { getStudentMemory } = require("./memoryService");

// 🔹 JavaScript Question Bank
const { getRandomJSQuestion } = require("./javascriptQuestionBank");

// 🔹 React Question Bank
const { getRandomReactQuestion } = require("./reactQuestionBank");

// 🔹 Node.js Question Bank
const { getRandomNodeQuestion } = require("./nodejsQuestionBank");

// 🔹 Java Question Bank
const { getRandomJavaQuestion } = require("./javaQuestionBank");


// =======================================================
// 🔹 ADAPTIVE DIFFICULTY
// =======================================================
function getAdaptiveDifficulty(history = []) {
  if (history.length === 0) return "easy";

  const recent = history.slice(-3);

  const avg =
    recent.reduce((sum, h) => sum + (h.score || 0), 0) / recent.length;

  if (avg >= 7) return "hard";
  if (avg >= 4) return "medium";
  return "easy";
}


// =======================================================
// 🔹 WEAK AREA DETECTION (SESSION LEVEL)
// =======================================================
function getWeakFocus(history = []) {
  if (!history.length) return "";

  const mistakes = history
    .map(h => h.mistakes || "")
    .join(" ")
    .toLowerCase();

  if (mistakes.includes("state")) return "state management";
  if (mistakes.includes("hook")) return "react hooks";
  if (mistakes.includes("api")) return "api handling";
  if (mistakes.includes("render")) return "rendering";
  if (mistakes.includes("props")) return "props usage";

  return "";
}


// =======================================================
// 🔹 FALLBACK QUESTION
// =======================================================
function getFallbackQuestion(subject, difficulty) {
  if (difficulty === "easy") {
    return `What is ${subject}? Where is it used?`;
  }

  if (difficulty === "medium") {
    return `Give one real-world use of ${subject}.`;
  }

  return `Why do we need ${subject}? Give a real example.`;
}


// =======================================================
// 🔹 CLEAN OUTPUT
// =======================================================
function cleanQuestion(q) {
  if (!q) return null;

  let cleaned = q
    .replace(/^["'\n]+|["'\n]+$/g, "")
    .trim();

  if (cleaned.length > 140) {
    cleaned = cleaned.split(".")[0];
  }

  return cleaned;
}


// =======================================================
// 🔹 TRANSFORM QUESTION TO SAI MAHENDRA'S STYLE
// =======================================================
function transformToSaiMahendraStyle(question) {
  // Randomly decide if this should be a CODE/SYNTAX question (40% chance)
  const shouldBePractical = Math.random() < 0.4;
  
  // If question starts with "What is", transform it
  if (question.startsWith("What is ")) {
    const concept = question.replace("What is ", "").replace("?", "").trim();
    
    if (shouldBePractical) {
      // PRACTICAL - Ask for code/syntax
      const practicalTransformations = [
        `Write the syntax for ${concept} with a real example`,
        `Show me the code for ${concept}`,
        `Write a working example of ${concept}`,
        `Give me the syntax of ${concept} with live data`,
        `Code ${concept} - show me a practical implementation`
      ];
      return practicalTransformations[Math.floor(Math.random() * practicalTransformations.length)];
    } else {
      // THEORETICAL - But still practical
      const theoreticalTransformations = [
        `${concept} - explain with a real-time use case`,
        `${concept} - give me a practical example`,
        `${concept} - where do you use this in real projects?`,
        `${concept} - how does it work internally?`,
        `Purpose of ${concept} - explain with an example`
      ];
      return theoreticalTransformations[Math.floor(Math.random() * theoreticalTransformations.length)];
    }
  }
  
  // If question starts with "Explain", make it more direct
  if (question.startsWith("Explain ")) {
    const concept = question.replace("Explain ", "").replace("?", "").replace(".", "").trim();
    
    if (shouldBePractical) {
      return `Write the code for ${concept} with a real example`;
    } else {
      return `${concept} - give me a live example`;
    }
  }
  
  // If question has "difference between", keep it but add example requirement
  if (question.includes("difference between")) {
    if (shouldBePractical) {
      return question.replace("?", "") + " - show me with code examples";
    } else {
      return question.replace("?", "") + " - with practical examples";
    }
  }
  
  // If question asks "How do you", it's already practical - keep it
  if (question.startsWith("How do you") || question.startsWith("How does")) {
    return question;
  }
  
  // Otherwise return as is
  return question;
}


// =======================================================
// 🔹 GENERATE QUESTION (FINAL)
// =======================================================
async function generateQuestion({ subject, history = [], studentId }) {
  try {
    const difficulty = getAdaptiveDifficulty(history);
    
    // 🔥 NEW: If subject is JavaScript, use JS question bank
    if (subject.toLowerCase() === "javascript" || subject.toLowerCase() === "js") {
      const question = getRandomJSQuestion(difficulty);
      return transformToSaiMahendraStyle(question); // Transform to your style
    }
    
    // 🔥 NEW: If subject is React, use React question bank
    if (subject.toLowerCase() === "react" || subject.toLowerCase() === "reactjs") {
      const question = getRandomReactQuestion(difficulty);
      return transformToSaiMahendraStyle(question); // Transform to your style
    }
    
    // 🔥 NEW: If subject is Node.js, use Node question bank
    if (subject.toLowerCase() === "node" || subject.toLowerCase() === "nodejs" || subject.toLowerCase() === "node.js") {
      const question = getRandomNodeQuestion(difficulty);
      return transformToSaiMahendraStyle(question); // Transform to your style
    }
    
    // 🔥 NEW: If subject is Java, use Java question bank
    if (subject.toLowerCase() === "java") {
      const question = getRandomJavaQuestion(difficulty);
      return transformToSaiMahendraStyle(question); // Transform to your style
    }
    
    const weakFocus = getWeakFocus(history);

    // 🔹 MEMORY FETCH (NEW)
    const memory = await getStudentMemory(studentId);

    const weakConcepts = memory?.weakConcepts?.join(", ") || "";
    const strongConcepts = memory?.strongConcepts?.join(", ") || "";

    const previousQuestions = history
      .map(h => h.question)
      .filter(Boolean)
      .slice(-10);

    const prompt = `
Subject: ${subject}
Difficulty: ${difficulty}

Weak Concepts (Long-Term):
${weakConcepts || "None"}

Strong Concepts:
${strongConcepts || "None"}

Session Weak Focus:
${weakFocus || "None"}

Previous Questions:
${previousQuestions.map(q => "- " + q).join("\n") || "None"}

Generate ONE interview question in Sai Mahendra's style.

CRITICAL RULES - YOUR QUESTIONING STYLE:
- PRACTICAL, not theoretical
- SPECIFIC, not vague  
- MUST demand a REAL EXAMPLE or LIVE SCENARIO
- Test DEPTH and UNDERSTANDING
- Ask about PURPOSE, WHEN TO USE, HOW IT WORKS

GOOD EXAMPLES (Your Style):
✓ "Purpose of Self in Python - explain with an example"
✓ "Inner Join - give me a live example with two tables"
✓ "Correlated subquery - explain with a real scenario"
✓ "Virtual Environment - why do we need it? When?"
✓ "Garbage Collector in Python - how does it work?"
✓ "Runtime vs compile time polymorphism - where do you use each?"
✓ "useEffect cleanup function - give me a practical use case"
✓ "Second Highest Salary in SQL - write the query"

BAD EXAMPLES (Not Your Style):
✗ "What is closure?" (too vague)
✗ "Explain React" (too broad)
✗ "What is SQL?" (too basic)
✗ "Define polymorphism" (theoretical)

ADAPTIVE RULES:
- Focus on weak concepts first
- If student is strong → ask about edge cases and internals
- If weak → ask about purpose and basic usage
- Do NOT repeat previous questions

QUESTION FORMAT:
- One line only
- Max 15 words
- Must be answerable in 30-60 seconds
- Must test practical understanding

Return ONLY the question text.
`;

    const SYSTEM_PROMPT = `
${BASE_PERSONA}

${INTERVIEW_PERSONA}

You generate questions like Sai Mahendra:

- Sharp
- Direct
- No fluff
- Real-world focused
- Adaptive to student performance
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 60
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let question = response?.data?.choices?.[0]?.message?.content;

    question = cleanQuestion(question);

    // =======================================================
    // 🔥 SAFETY CHECKS
    // =======================================================

    if (!question) {
      return getFallbackQuestion(subject, difficulty);
    }

    if (previousQuestions.includes(question)) {
      return getFallbackQuestion(subject, difficulty);
    }

    return question;

  } catch (error) {
    console.error("Question Generation Error:", error.message);
    return getFallbackQuestion(subject, "easy");
  }
}

module.exports = { generateQuestion };