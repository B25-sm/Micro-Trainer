// =======================================================
// 🎓 ADAPTIVE TEACHING ENGINE
// Detects student level and adapts explanation accordingly
// =======================================================

const axios = require("axios");
const { getAnalogy, detectLevel } = require("./analogyDatabase");
const { BASE_PERSONA } = require("./personaConfig");

// =======================================================
// 🎓 TEACHING PERSONAS (3 LEVELS)
// =======================================================

const LEVEL_1_PERSONA = `
${BASE_PERSONA}

You are teaching a COMPLETE BEGINNER who knows NOTHING about programming.

TEACHING STYLE:
- Use real-life analogies and stories
- NO technical jargon
- Explain like talking to a friend
- Build understanding step by step
- Stay connected to the story throughout
- Use short paragraphs (2-3 sentences each)

STRUCTURE:
1. "Let me explain X in the simplest way possible."
2. Build a relatable story (3-5 short paragraphs)
3. "Here's the important part..." (key moment)
4. Reinforce the concept in different words
5. "That's EXACTLY how X works in programming."
6. Connect story elements to technical concepts
7. "Make sense?"

FORBIDDEN:
- NO code examples
- NO technical terms (lexical, scope chain, etc.)
- NO assumptions about prior knowledge
- Don't rush - let the story breathe

REMEMBER: Story continuity is KEY. Don't jump between metaphors.
`;

const LEVEL_2_PERSONA = `
${BASE_PERSONA}

You are teaching an INTERMEDIATE student who understands basics.

TEACHING STYLE:
- Quick story/analogy (2-3 sentences)
- Then show simple code
- Explain what each part does
- Connect code back to real-world use
- Mix of conceptual + practical

STRUCTURE:
1. Brief analogy or recap
2. "Here's how it looks in code..."
3. Simple code example with inline comments
4. "See how this works? It's like..."
5. Real-world use case
6. "Try it yourself and see!"

CODE RULES:
- Keep examples simple (5-10 lines max)
- Add comments explaining each part
- Use clear variable names
- Show practical, working code

REMEMBER: They understand concepts, now show them HOW to use it.
`;

const LEVEL_3_PERSONA = `
${BASE_PERSONA}

You are teaching an ADVANCED student who wants technical depth.

TEACHING STYLE:
- Skip analogies, go straight to mechanics
- Explain internal workings
- Show complex examples
- Discuss edge cases and gotchas
- Performance implications

STRUCTURE:
1. Technical explanation of how it works internally
2. Complex code example
3. Edge cases to watch out for
4. Performance considerations
5. Best practices
6. "Questions?"

TOPICS TO COVER:
- Memory model
- Execution context
- Scope chain / Lexical environment
- Performance implications
- Common pitfalls
- Advanced patterns

REMEMBER: They want depth. Don't hold back on technical details.
`;

// =======================================================
// 🎓 ADAPTIVE TEACHING FLOW
// =======================================================

async function adaptiveTeach({
  concept,
  studentAnswer = null,
  conversationHistory = [],
  detectedLevel = null
}) {
  
  // STEP 1: First interaction - Give simple explanation + cross question
  if (!studentAnswer && !detectedLevel) {
    const analogy = getAnalogy(concept);
    
    if (analogy) {
      // We have a pre-written analogy
      return {
        explanation: analogy.story,
        crossQuestion: analogy.crossQuestion,
        awaitingLevelDetection: true,
        level: null
      };
    } else {
      // Generate analogy using AI
      const generated = await generateBeginnerExplanation(concept);
      return {
        explanation: generated.explanation,
        crossQuestion: generated.crossQuestion,
        awaitingLevelDetection: true,
        level: null
      };
    }
  }
  
  // STEP 2: Student answered cross question - Detect level
  if (studentAnswer && !detectedLevel) {
    const level = detectLevel(studentAnswer);
    console.log(`📊 Detected Level: ${level.toUpperCase()}`);
    
    // Generate level-appropriate explanation
    const detailedExplanation = await generateLeveledExplanation(
      concept,
      level,
      studentAnswer,
      conversationHistory
    );
    
    return {
      explanation: detailedExplanation,
      level: level,
      awaitingLevelDetection: false,
      crossQuestion: null
    };
  }
  
  // STEP 3: Continue conversation with known level
  if (detectedLevel) {
    const response = await generateLeveledExplanation(
      concept,
      detectedLevel,
      studentAnswer,
      conversationHistory
    );
    
    return {
      explanation: response,
      level: detectedLevel,
      awaitingLevelDetection: false,
      crossQuestion: null
    };
  }
  
  // Fallback
  return {
    explanation: "I'm not sure I understand. Can you rephrase your question?",
    level: null,
    awaitingLevelDetection: false,
    crossQuestion: null
  };
}

// =======================================================
// 🎓 GENERATE BEGINNER EXPLANATION (AI)
// =======================================================

async function generateBeginnerExplanation(concept) {
  try {
    const prompt = `Generate a beginner-friendly explanation for: ${concept}

Use a real-life analogy/story. Follow this structure:
1. "Let me explain ${concept} in the simplest way possible."
2. Build a relatable story (use everyday scenarios)
3. "Here's the important part..." (key moment)
4. "That's EXACTLY how ${concept} works in programming."
5. Connect story to programming concept
6. "Make sense?"

Also generate a cross-question to test understanding.

Return in this format:
EXPLANATION:
[Your story-based explanation]

CROSS_QUESTION:
[A question to test their understanding]`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: LEVEL_1_PERSONA },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 600
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content || "";
    
    // Parse response
    const explanationMatch = content.match(/EXPLANATION:([\s\S]*?)(?=CROSS_QUESTION:|$)/);
    const questionMatch = content.match(/CROSS_QUESTION:([\s\S]*?)$/);
    
    return {
      explanation: explanationMatch ? explanationMatch[1].trim() : content,
      crossQuestion: questionMatch ? questionMatch[1].trim() : "Can you tell me why this concept is useful?"
    };

  } catch (error) {
    console.error("AI Generation Error:", error.message);
    return {
      explanation: `Let me explain ${concept}. It's a programming concept that helps you write better code. Can you tell me what you already know about it?`,
      crossQuestion: "What do you already know about this concept?"
    };
  }
}

// =======================================================
// 🎓 GENERATE LEVELED EXPLANATION (AI)
// =======================================================

async function generateLeveledExplanation(concept, level, studentAnswer, history) {
  try {
    // Select persona based on level
    let persona;
    let maxTokens;
    
    if (level === "beginner") {
      persona = LEVEL_1_PERSONA;
      maxTokens = 600;
    } else if (level === "intermediate") {
      persona = LEVEL_2_PERSONA;
      maxTokens = 500;
    } else {
      persona = LEVEL_3_PERSONA;
      maxTokens = 700;
    }
    
    // Build context from conversation history
    const contextMessages = history.slice(-4).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    const prompt = `Student asked about: ${concept}
Student's answer to cross-question: ${studentAnswer}
Detected level: ${level}

Now provide a ${level}-appropriate explanation.`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: persona },
          ...contextMessages,
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: maxTokens
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response?.data?.choices?.[0]?.message?.content || "I'm having trouble explaining this. Can you ask in a different way?";

  } catch (error) {
    console.error("AI Generation Error:", error.message);
    return "I'm having trouble generating an explanation right now. Please try again.";
  }
}

module.exports = {
  adaptiveTeach,
  generateBeginnerExplanation,
  generateLeveledExplanation
};
