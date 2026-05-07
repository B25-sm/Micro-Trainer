// =======================================================
// 🔹 ADAPTIVE FOLLOW-UP ENGINE (V1 - RULE-BASED)
// Cost: NEAR-ZERO (No AI API calls)
// =======================================================

// =======================================================
// 🔹 FOLLOW-UP QUESTION BANK
// =======================================================
const FOLLOWUP_BANK = {
  // JavaScript Follow-ups
  javascript: {
    closure: {
      triggers: ["closure", "scope", "lexical", "function inside function"],
      followups: [
        {
          condition: "mentions_scope",
          questions: [
            "Give me a real-world use case where closures are essential",
            "What happens to memory when you create too many closures?",
            "Write a practical example of closure - show me the code"
          ]
        },
        {
          condition: "mentions_memory",
          questions: [
            "How do closures cause memory leaks?",
            "Show me code that demonstrates a closure memory leak"
          ]
        },
        {
          condition: "vague_answer",
          questions: [
            "Can you explain that with a concrete example?",
            "Where would you actually use this in a real project?"
          ]
        }
      ]
    },
    promise: {
      triggers: ["promise", "async", "await", "asynchronous"],
      followups: [
        {
          condition: "mentions_async",
          questions: [
            "What's the difference between Promise.all() and Promise.race()?",
            "Write code showing how to handle Promise errors properly",
            "When would you NOT use async/await?"
          ]
        },
        {
          condition: "mentions_callback",
          questions: [
            "Why are Promises better than callbacks?",
            "Show me callback hell vs Promise chain - write the code"
          ]
        }
      ]
    },
    hoisting: {
      triggers: ["hoisting", "var", "let", "const", "temporal dead zone"],
      followups: [
        {
          condition: "mentions_var",
          questions: [
            "What's the difference between var and let hoisting?",
            "Write code that shows hoisting behavior with var vs let"
          ]
        },
        {
          condition: "mentions_tdz",
          questions: [
            "Explain temporal dead zone with a code example",
            "Why does TDZ exist? What problem does it solve?"
          ]
        }
      ]
    }
  },

  // React Follow-ups
  react: {
    context: {
      triggers: ["context", "context api", "provider", "consumer"],
      followups: [
        {
          condition: "mentions_performance",
          questions: [
            "Why do you think Context improves performance?",
            "What happens in large-scale applications with Context?",
            "What are the tradeoffs compared to Redux?"
          ]
        },
        {
          condition: "mentions_redux",
          questions: [
            "When would you prefer Redux instead of Context?",
            "How does Redux improve scalability?",
            "Write code showing when Context is NOT enough"
          ]
        }
      ]
    },
    hooks: {
      triggers: ["hooks", "useeffect", "usestate", "usememo", "usecallback"],
      followups: [
        {
          condition: "mentions_useeffect",
          questions: [
            "What's the cleanup function in useEffect? Give me an example",
            "When does useEffect run? Show me with code",
            "What happens if you forget the dependency array?"
          ]
        },
        {
          condition: "mentions_optimization",
          questions: [
            "When should you NOT use useMemo?",
            "Show me code where useMemo actually hurts performance"
          ]
        }
      ]
    },
    virtualdom: {
      triggers: ["virtual dom", "reconciliation", "diffing", "rendering"],
      followups: [
        {
          condition: "mentions_performance",
          questions: [
            "How does Virtual DOM actually improve performance?",
            "What are the limitations of Virtual DOM?",
            "When would Virtual DOM be slower than direct DOM manipulation?"
          ]
        }
      ]
    }
  },

  // Python Follow-ups
  python: {
    decorator: {
      triggers: ["decorator", "@", "wrapper", "function wrapper"],
      followups: [
        {
          condition: "mentions_syntax",
          questions: [
            "Write a custom decorator - show me the code",
            "Where would you use decorators in a real project?",
            "What's the difference between @decorator and decorator()?"
          ]
        }
      ]
    },
    generator: {
      triggers: ["generator", "yield", "iterator"],
      followups: [
        {
          condition: "mentions_memory",
          questions: [
            "Why are generators memory-efficient?",
            "Write code showing generator vs list - memory comparison",
            "When would you NOT use a generator?"
          ]
        }
      ]
    }
  },

  // SQL Follow-ups
  sql: {
    join: {
      triggers: ["join", "inner join", "left join", "right join"],
      followups: [
        {
          condition: "mentions_inner",
          questions: [
            "Write an INNER JOIN query with two tables - show me the syntax",
            "What's the difference between INNER JOIN and LEFT JOIN?",
            "Give me a real scenario where you'd use LEFT JOIN"
          ]
        }
      ]
    },
    index: {
      triggers: ["index", "indexing", "performance", "optimization"],
      followups: [
        {
          condition: "mentions_performance",
          questions: [
            "When does an index actually hurt performance?",
            "Write a query showing index usage",
            "How do you decide which columns to index?"
          ]
        }
      ]
    }
  }
};

// =======================================================
// 🔹 REASONING QUESTION TEMPLATES
// =======================================================
const REASONING_TEMPLATES = [
  "Why is that approach better than alternatives?",
  "What are the tradeoffs of your solution?",
  "Can you give me a real-world scenario where this matters?",
  "What happens if you scale this to 1 million users?",
  "Show me the code - write a practical example",
  "What would break if you did it differently?",
  "When would you NOT use this approach?",
  "Explain like I'm a junior developer - make it simple"
];

// =======================================================
// 🔹 DETECT VAGUE ANSWERS
// =======================================================
function isVagueAnswer(answer) {
  const vagueIndicators = [
    answer.length < 30, // Too short
    !answer.includes("example"), // No example
    !answer.includes("because"), // No reasoning
    answer.split(" ").length < 10, // Too few words
    /^(yes|no|maybe|i think|probably|basically)$/i.test(answer.trim()) // One-word answers
  ];

  return vagueIndicators.filter(Boolean).length >= 2;
}

// =======================================================
// 🔹 DETECT KEYWORDS IN ANSWER
// =======================================================
function detectKeywords(answer, triggers) {
  const lowerAnswer = answer.toLowerCase();
  return triggers.some(trigger => lowerAnswer.includes(trigger.toLowerCase()));
}

// =======================================================
// 🔹 DETECT CONDITION IN ANSWER
// =======================================================
function detectCondition(answer, condition) {
  const lowerAnswer = answer.toLowerCase();
  
  const conditionMap = {
    mentions_scope: ["scope", "lexical", "variable scope"],
    mentions_memory: ["memory", "leak", "garbage", "heap"],
    mentions_async: ["async", "await", "asynchronous"],
    mentions_callback: ["callback", "callback hell"],
    mentions_var: ["var", "variable declaration"],
    mentions_tdz: ["temporal dead zone", "tdz", "reference error"],
    mentions_performance: ["performance", "faster", "slower", "optimize", "speed"],
    mentions_redux: ["redux", "state management"],
    mentions_useeffect: ["useeffect", "side effect"],
    mentions_optimization: ["optimize", "performance", "memo", "cache"],
    mentions_syntax: ["syntax", "@", "decorator syntax"],
    mentions_inner: ["inner", "inner join"],
    vague_answer: isVagueAnswer(answer)
  };

  const keywords = conditionMap[condition] || [];
  return keywords.some(keyword => lowerAnswer.includes(keyword));
}

// =======================================================
// 🔹 GENERATE ADAPTIVE FOLLOW-UP (HYBRID V1.5)
// Uses rule-based FIRST, falls back to AI for complex cases
// =======================================================
async function generateFollowUp(previousQuestion, answer, subject) {
  const lowerSubject = subject.toLowerCase();
  const lowerQuestion = previousQuestion.toLowerCase();
  const lowerAnswer = answer.toLowerCase();

  // Get subject-specific follow-ups
  const subjectBank = FOLLOWUP_BANK[lowerSubject] || {};

  // 🔥 STEP 1: TRY RULE-BASED FIRST (FREE)
  for (const [concept, data] of Object.entries(subjectBank)) {
    // Check if question or answer mentions this concept
    if (detectKeywords(lowerQuestion + " " + lowerAnswer, data.triggers)) {
      // Find matching condition
      for (const followup of data.followups) {
        if (detectCondition(answer, followup.condition)) {
          // Return random question from matching followup
          const questions = followup.questions;
          console.log("✅ Rule-based follow-up (FREE)");
          return questions[Math.floor(Math.random() * questions.length)];
        }
      }
    }
  }

  // 🔥 STEP 2: IF RULE-BASED FAILS, USE AI (CHEAP - GROQ)
  // Only for complex/edge cases
  if (answer.length > 50 && !isVagueAnswer(answer)) {
    console.log("🤖 AI-powered follow-up (Groq - cheap)");
    return await generateAIFollowUp(previousQuestion, answer, subject);
  }

  // 🔥 STEP 3: IF ANSWER IS VAGUE, USE REASONING TEMPLATE (FREE)
  if (isVagueAnswer(answer)) {
    console.log("✅ Reasoning template (FREE)");
    return REASONING_TEMPLATES[Math.floor(Math.random() * REASONING_TEMPLATES.length)];
  }

  // No follow-up needed - return null
  return null;
}

// =======================================================
// 🔹 GENERATE AI FOLLOW-UP (GROQ - CHEAP)
// Only called when rule-based fails
// =======================================================
async function generateAIFollowUp(previousQuestion, answer, subject) {
  try {
    const axios = require("axios");
    
    const prompt = `You are Sai Mahendra conducting a technical interview.

Previous Question: ${previousQuestion}
Candidate Answer: ${answer}
Subject: ${subject}

Generate ONE sharp follow-up question that:
1. Tests deeper understanding
2. Asks for practical examples or code
3. Explores tradeoffs or edge cases
4. Is direct and specific (not vague)

Return ONLY the question, nothing else.`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are Sai Mahendra, a direct and practical technical interviewer. Generate sharp, specific follow-up questions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 100 // Keep it short to save tokens
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const followUp = response?.data?.choices?.[0]?.message?.content?.trim();
    return followUp || null;

  } catch (error) {
    console.error("AI Follow-up Error:", error.message);
    // Fallback to reasoning template if AI fails
    return REASONING_TEMPLATES[Math.floor(Math.random() * REASONING_TEMPLATES.length)];
  }
}

// =======================================================
// 🔹 SHOULD ASK FOLLOW-UP?
// =======================================================
function shouldAskFollowUp(answer, score) {
  // Ask follow-up if:
  // 1. Answer is vague
  // 2. Score is medium (5-7) - test deeper understanding
  // 3. Answer mentions advanced concepts but lacks depth
  
  if (isVagueAnswer(answer)) return true;
  if (score >= 5 && score <= 7) return true;
  
  // Check if answer mentions advanced concepts
  const advancedKeywords = [
    "performance", "optimization", "scale", "tradeoff",
    "memory", "complexity", "architecture"
  ];
  
  const mentionsAdvanced = advancedKeywords.some(keyword => 
    answer.toLowerCase().includes(keyword)
  );
  
  if (mentionsAdvanced && answer.length < 100) return true;
  
  return false;
}

module.exports = {
  generateFollowUp,
  shouldAskFollowUp,
  isVagueAnswer
};
