// =======================================================
// 🎓 ADAPTIVE TEACHING ENGINE
// Detects student level and adapts explanation accordingly
// =======================================================

const axios = require("axios");
const { getAnalogy, detectLevel } = require("./analogyDatabase");
const {
  BASE_PERSONA,
  TEACHING_STRUCTURE,
  GUIDED_LESSON_FORMAT,
  TERSE_SUMMARY_FORMAT,
  TECHNOLOGY_ANALOGY_HINTS,
} = require("./personaConfig");
const {
  normalizeQuizQuestions,
  enforceQuestionMix,
  getQuestionMixCounts,
} = require("./quizQuestionUtils");
const { callGroq } = require("./groqClient");
const {
  generateLessonDiagram,
  buildDiagramFallback,
} = require("./lessonDiagramService");
const {
  stripForbiddenTerms,
  validateLessonQuality,
  buildRepairPrompt,
} = require("./lessonQualityService");

function buildCurriculumReferenceBlock(curriculumReference, lessonBrief) {
  const brief = lessonBrief ? String(lessonBrief).trim() : "";
  const ref = String(curriculumReference || "").trim();
  const combined = brief ? `${brief}\n\n---\n\n${ref}` : ref;
  const limit = brief ? 3200 : 1200;
  return combined.substring(0, limit);
}

/** Story-only lesson (no JSON) — much more reliable than combined JSON */
async function generateGuidedStoryOnly({
  technology,
  title,
  description,
  objectives = [],
  curriculumReference = "",
  lessonBrief = null,
  level = "beginner",
  reteach = false,
}) {
  const objectivesText =
    objectives.length > 0
      ? objectives.map((o, i) => `${i + 1}. ${o}`).join("\n")
      : description;

  const normalizedLevel = (level || "beginner").toLowerCase();
  let persona = LEVEL_1_PERSONA;
  let maxTokens = 1800;

  if (normalizedLevel === "intermediate") {
    persona = LEVEL_2_PERSONA;
    maxTokens = 1600;
  } else if (normalizedLevel === "advanced") {
    persona = LEVEL_3_PERSONA;
    maxTokens = 2000;
  }

  const reteachNote = reteach
    ? `The student failed the quiz. Keep the SAME analogy domain and SAME cast names from the reference below — only use simpler words and shorter sentences. Do NOT switch hospital↔restaurant or rename characters.\n`
    : "";

  const mappingBar = `
- **What** cast list is mandatory for ALL levels: 4-6 bullets, **Name** = **Term** (role)`;

  const levelExtras =
    normalizedLevel === "beginner"
      ? `${mappingBar}
- Pick ONE vivid analogy and go DEEP — name characters, actions, consequences
- In **How**: up to 3 inline commands allowed — each MUST have "This means…" after it
- No huge code blocks; explain every technical word the first time`
      : normalizedLevel === "intermediate"
      ? `${mappingBar}
- After **How**, add **Example** with ONE commented code block (8-15 lines)
- Tie every line of code back to the cast names from **What**`
      : `${mappingBar}
- **Example** with substantive code; **How** references cast names and includes one "gotcha"`;

  const techKey = (technology || "").toLowerCase();
  const analogyHint =
    TECHNOLOGY_ANALOGY_HINTS[techKey] ||
    TECHNOLOGY_ANALOGY_HINTS[techKey.replace(/\.js$/, "")] ||
    `
Pick an analogy that fits "${title}" (restaurant, post office, school, factory — not always restaurant).
**What** MUST end with 4-6 bullets: **Simple name** = **Technical term** (what it does in one phrase).
Example bullets:
- **Customer** = person using the site (you)
- **Waiter** = **View** (handles requests and returns responses)`;

  const prompt = `${reteachNote}Teach this guided-course lesson as Sai Mahendra for **${technology}**.

Concept: ${title}
Topic summary: ${description}

Learning objectives — EACH must appear clearly in **How** (say which step covers which):
${objectivesText}

DEPTH BAR: Strong enough that a beginner never opens Google. Shallow = failure.
${lessonBrief ? "\nCAREER MODULE BAR: In **How**, explicitly contrast Data Analyst vs Data Scientist vs ML Engineer vs Data Engineer with what each does on a typical workday.\n" : ""}

CONSISTENCY BAR: One cast, one mapping per character in Why/What/How. Never remap waiter/chef mid-lesson.

MAPPING CLARITY BAR: In **What**, after the definition, print 4-6 bullets: **Simple name** = **Tech term** (what it does). Same clarity as "Customer = you, Waiter = View". One bullet per line — no pipes.

HOW FLOW BAR: In **How**, use numbered steps that show the data flow using the SAME cast names from **What**. If **What** includes Data Warehouse, Model, and Dashboard, **How** MUST explain in order: (1) who provides data, (2) where data is stored, (3) how the model learns, (4) how the dashboard shows results — so quiz questions about this flow are answerable.

REAL-TIME BAR: In **Real-time use case** use a REAL website/app with "What user sees" vs "What happens internally" — NO hospital/waiter/kitchen metaphor in this section.

${GUIDED_LESSON_FORMAT}
${analogyHint ? `\nTECH-SPECIFIC CAST HINT:\n${analogyHint}` : ""}
${levelExtras}

${TEACHING_STRUCTURE}

Reference for accuracy only — do NOT copy-paste documentation:
${buildCurriculumReferenceBlock(curriculumReference, lessonBrief)}

Return ONLY the formatted lesson markdown.`;

  async function requestLesson(userPrompt, temp = 0.75) {
    const response = await callGroq({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: persona },
        { role: "user", content: userPrompt },
      ],
      temperature: temp,
      max_tokens: maxTokens,
    });
    return (response?.data?.choices?.[0]?.message?.content || "").trim();
  }

  let explanation = await requestLesson(prompt);
  explanation = stripForbiddenTerms(explanation, technology);

  let quality = validateLessonQuality({
    explanation,
    technology,
    objectives,
  });

  if (!quality.ok) {
    console.warn(`⚠️ Lesson quality failed (${technology}/${title}):`, quality.errors);
    const repairPrompt = `${buildRepairPrompt(quality.errors, technology, title)}\n\nReference:\n${buildCurriculumReferenceBlock(curriculumReference, lessonBrief).substring(0, 2000)}`;
    const repaired = await requestLesson(repairPrompt, 0.5);
    if (repaired && repaired.length > 400) {
      explanation = stripForbiddenTerms(repaired, technology);
      quality = validateLessonQuality({
        explanation,
        technology,
        objectives,
      });
    }
  }

  if (!quality.ok) {
    console.warn(`⚠️ Lesson still has issues after repair:`, quality.errors);
    // Allow through only if minimally structured — else throw
    const minLength = normalizedLevel === "beginner" ? 900 : 700;
    if (!explanation || explanation.length < minLength) {
      throw new Error(
        `Lesson quality check failed: ${quality.errors.join("; ")}`
      );
    }
  } else {
    console.log(
      `✅ Lesson quality OK (${technology}/${title}) — cast: ${quality.castNames.join(", ")}`
    );
  }

  return explanation;
}

/** Exactly 3 lines — quiz always generated from full lucid lesson */
function buildTerseFallback(lucidExplanation) {
  const stripMd = (s) =>
    (s || "")
      .replace(/\*\*/g, "")
      .replace(/^[-*]\s+/gm, "")
      .replace(/\s+/g, " ")
      .trim();

  const section = (name) => {
    const re = new RegExp(
      `\\*\\*${name}\\*\\*([\\s\\S]*?)(?=\\*\\*(?:Why|What|How|Real-time use case|Key takeaway|Example)\\*\\*|$)`,
      "i"
    );
    const m = lucidExplanation.match(re);
    return m ? stripMd(m[1]) : "";
  };

  const why = section("Why").split(/[.!?]/).find((s) => s.trim().length > 20);
  const what = section("What").split(/[.!?]/).find((s) => s.trim().length > 20);
  const how = section("How").split(/[.!?]/).find((s) => s.trim().length > 20);
  const mappings = (lucidExplanation.match(/\*\*[^*]+\*\*\s*=\s*[^\n]+/g) || [])
    .slice(0, 4)
    .map((line) => stripMd(line))
    .join("; ");

  const line1 = why ? `${why.trim()}.` : "This concept solves a real problem teams hit in production.";
  const line2 = mappings
    ? `${what ? `${what.trim()}. ` : ""}Map: ${mappings}.`
    : what || "Core idea: see the lucid lesson for the full cast list.";
  const flowSteps = (section("How").match(/^\s*\d+\.[^\n]+/gm) || [])
    .slice(0, 2)
    .map((s) => s.replace(/^\s*\d+\.\s*/, "").trim())
    .join(" → ");

  const line3 = flowSteps
    ? `Flow: ${flowSteps}.`
    : how
    ? `${how.trim()}.`
    : "Follow the numbered How steps in the lucid lesson.";

  const line4 =
    section("Key takeaway").split(/[.!?]/).find((s) => s.trim().length > 15) ||
    "Use the Real-time use case: what users see vs what runs internally.";

  return [line1, line2, line3, `${String(line4).trim()}.`].join("\n");
}

async function generateTerseSummary({ technology, title, lucidExplanation }) {
  const prompt = `Technology: ${technology}
Concept: ${title}

Lucid lesson (compress this — do not add new topics):
${lucidExplanation.substring(0, 2200)}

${TERSE_SUMMARY_FORMAT}

Return ONLY 4 lines of plain text (see TERSE format — line 3 must be the flow chain).`;

  try {
    const response = await callGroq({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You compress lessons into exactly 4 lines. No markdown headers. No bullets. Line 3 must be the process flow chain.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 280,
    });

    let text = (response?.data?.choices?.[0]?.message?.content || "").trim();
    text = text.replace(/^```[\w]*\n?/gm, "").replace(/```$/gm, "").trim();

    const lines = text
      .split(/\n+/)
      .map((l) => l.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean);

    if (lines.length >= 4) {
      return lines.slice(0, 4).join("\n");
    }
    if (lines.length >= 3) {
      return buildTerseFallback(lucidExplanation);
    }
  } catch (err) {
    console.warn("Terse summary Groq failed, using fallback:", err.message);
  }

  return buildTerseFallback(lucidExplanation);
}

// =======================================================
// 🎓 TEACHING PERSONAS (3 LEVELS)
// =======================================================

const LEVEL_1_PERSONA = `
${BASE_PERSONA}

You are teaching a COMPLETE BEGINNER who knows NOTHING about programming.

TEACHING STYLE:
- ONE strong analogy — go DEEP (names, actions, consequences — not a one-liner)
- Structured sections: **Why**, **What**, **How**, **Real-time use case**, **Key takeaway**
- **Real-time use case** = real app only: "What user sees" vs "What happens internally" — never more waiter/hospital story
- **What** must include the bullet cast list: **Name** = **Term** (role) — student scans and instantly gets it
- **How** is the longest section — each step references cast names from **What**, e.g. "the **Waiter** (View)…"
- Bold section titles AND map analogy parts to tech in the **What** list only
- Fierce, energetic, practical — student must feel "I actually get it now"

FORBIDDEN:
- Shallow 1-sentence sections
- Listing commands without explaining what they DO
- Multiple analogies
- Remapping the same character twice (e.g. waiter = user, then waiter = View)
- Pipe-separated cast on one line instead of separate bullets in **What**
- **What** without the 4-6 line **X = Y (role)** mapping list
- Continuing the analogy in **Real-time use case** (must be a real app: user sees vs internal)
- Wikipedia tone

${GUIDED_LESSON_FORMAT}
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
    throw new Error(`AI teaching unavailable: ${error.message}`);
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

// =======================================================
// 🎯 GUIDED COURSE LESSON (structured path)
// Teaches like Sai Mahendra — NOT raw documentation
// =======================================================

async function generateGuidedCourseLesson({
  technology,
  title,
  description,
  objectives = [],
  curriculumReference = "",
  lessonBrief = null,
  level = "beginner",
  questionCount = 4,
  reteach = false,
  previousExplanation = null,
}) {
  const normalizedLevel = (level || "beginner").toLowerCase();
  const objectivesText =
    objectives.length > 0
      ? objectives.map((o, i) => `${i + 1}. ${o}`).join("\n")
      : description;

  // Story lesson (plain text) + separate quiz generation
  try {
    const storyReference =
      reteach && previousExplanation
        ? `${curriculumReference}\n\n---\nPRIOR LESSON (keep SAME analogy + cast names; simplify only):\n${String(previousExplanation).substring(0, 2400)}`
        : curriculumReference;

    const explanation = await generateGuidedStoryOnly({
      technology,
      title,
      description,
      objectives,
      curriculumReference: storyReference,
      lessonBrief,
      level: normalizedLevel,
      reteach,
    });

    // Terse summary, wireframe, and quiz are independent — run in parallel
    const [contentTerse, diagram, questionsRaw] = await Promise.all([
      generateTerseSummary({
        technology,
        title,
        lucidExplanation: explanation,
      }),
      generateLessonDiagram({
        technology,
        title,
        lucidExplanation: explanation,
      }),
      generateLessonQuestions(
        technology,
        title,
        explanation,
        questionCount
      ),
    ]);

    const { alignQuizWithLesson } = require("./quizQuestionUtils");
    let questions = alignQuizWithLesson(
      questionsRaw,
      explanation,
      questionCount
    );

    return {
      explanation,
      contentTerse,
      diagram,
      questions,
      contentSource: "sai-mahendra-guided",
      level: normalizedLevel,
    };
  } catch (error) {
    console.error("Guided course lesson error:", error.message);

    const analogy = getAnalogy(title) || getAnalogy(description);
    if (analogy && normalizedLevel === "beginner" && !reteach) {
      const extra = await generateLessonQuestions(
        technology,
        title,
        analogy.story,
        questionCount
      );
      const contentTerse = buildTerseFallback(analogy.story);
      return {
        explanation: analogy.story,
        contentTerse,
        diagram: buildDiagramFallback(analogy.story, title),
        questions: enforceQuestionMix(extra, questionCount),
        contentSource: "analogy-database",
        level: normalizedLevel,
      };
    }

    if (error.isRateLimit) {
      throw error;
    }
    throw new Error(
      error.message || `Could not generate lesson for ${title}. Please try again.`
    );
  }
}

async function generateLessonQuestions(technology, title, explanation, count) {
  const { openCount, mcqCount } = getQuestionMixCounts(count);
  try {
    const response = await callGroq({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Generate quiz questions ONLY from the lesson text. Return ONLY JSON: {"questions":[...]}.
Rules:
- ~${openCount} "open", ~${mcqCount} "mcq" with "type","question","options","correctIndex" (0-based)
- Every question AND correct answer MUST be supported by the lesson — do NOT ask about topics not explained in **How**
- Do NOT ask the student to repeat an example already written in the question stem (e.g. if the question mentions hospital readmission, grade understanding of WHY/benefits, not repeating "readmission")
- MCQ correctIndex must match the lesson definition (e.g. Data Scientist = turn raw data into decisions / modeling — NOT "manage warehouse" unless the lesson says that)
- Never use "what do you already know"
- If the lesson does not explain warehouse+model+dashboard flow together, do NOT ask that combo question`,
        },
        {
          role: "user",
          content: `Technology: ${technology}\nConcept: ${title}\n\nFull lesson:\n${explanation.substring(0, 2800)}\n\nGenerate ${count} questions (${openCount} open, ${mcqCount} mcq). Use **What** cast mappings and **Real-time use case** only if those sections exist in the lesson above.`,
        },
      ],
      temperature: 0.35,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(
      response?.data?.choices?.[0]?.message?.content || "{}"
    );
    return enforceQuestionMix(
      Array.isArray(parsed.questions) ? parsed.questions : [],
      count
    );
  } catch {
    return [
      {
        type: "open",
        question: `In your own words, what is ${title} and why does it matter?`,
      },
      {
        type: "open",
        question: `How would you explain the main idea of ${title} to a friend?`,
      },
    ];
  }
}

module.exports = {
  adaptiveTeach,
  generateBeginnerExplanation,
  generateLeveledExplanation,
  generateGuidedCourseLesson,
};
