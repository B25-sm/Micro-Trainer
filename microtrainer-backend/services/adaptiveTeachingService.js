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
  BEGINNER_GUIDED_LESSON_FORMAT,
  TERSE_SUMMARY_FORMAT,
  BEGINNER_TERSE_SUMMARY_FORMAT,
  QUIZ_STYLE_RULES,
  TECHNOLOGY_ANALOGY_HINTS,
  BEGINNER_TECHNOLOGY_ANALOGY_HINTS,
  ADAPTIVE_TEACHING_PERSONA,
  CONCEPT_QA_RESPONSE_STRUCTURE,
  TECHNICAL_ACCURACY_RULES,
  CODE_SNIPPET_RULES_BEGINNER,
  CODE_SNIPPET_RULES_INTERMEDIATE,
  CODE_SNIPPET_RULES_ADVANCED,
} = require("./personaConfig");
const {
  normalizeQuizQuestions,
  enforceQuestionMix,
  getQuestionMixCounts,
} = require("./quizQuestionUtils");
const { callGroq } = require("./groqClient");
const { getConceptReference, detectTechnologies } = require("./conceptReferenceService");
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
  const limit = brief ? 1200 : 600;
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
  conceptId = null,
}) {
  const objectivesText =
    objectives.length > 0
      ? objectives.map((o, i) => `${i + 1}. ${o}`).join("\n")
      : description;

  const normalizedLevel = (level || "beginner").toLowerCase();
  let persona = LEVEL_1_PERSONA;
  let maxTokens = 1100;

  if (normalizedLevel === "intermediate") {
    persona = LEVEL_2_PERSONA;
    maxTokens = 950;
  } else if (normalizedLevel === "advanced") {
    persona = LEVEL_3_PERSONA;
    maxTokens = 1200;
  }

  const reteachNote = reteach
    ? normalizedLevel === "beginner"
      ? `The student failed the quiz. Re-teach the SAME concept with even simpler plain English and shorter sentences. Keep the same real-world example app.\n`
      : `The student failed the quiz. Keep the SAME analogy domain and SAME cast names from the reference below — only use simpler words and shorter sentences. Do NOT switch hospital↔restaurant or rename characters.\n`
    : "";

  const isBeginner = normalizedLevel === "beginner";
  const lessonFormat = isBeginner
    ? BEGINNER_GUIDED_LESSON_FORMAT
    : GUIDED_LESSON_FORMAT;

  const mappingBar = `
- **What** concept map: 3-4 bullets, **Plain label** = **Technical term** (role)`;

  const levelExtras = isBeginner
    ? `
- **What**: 2-3 plain-English bullets (use "—" not "=")
- **How**: 3 short steps + ONE tiny snippet (3-5 lines)`
    : normalizedLevel === "intermediate"
    ? `${mappingBar}
- **How**: 3 steps + ONE snippet (5-8 lines) — no separate **Example** section`
    : `${mappingBar}
- **How**: 3 steps + ONE snippet; one optional gotcha sentence`;

  const levelBars = isBeginner
    ? `
BREVITY BAR: Under 90 seconds to read. Short sentences. No filler.
${lessonBrief ? "\nCAREER MODULE: One sentence each on Analyst vs Scientist vs ML Engineer — only if relevant.\n" : ""}`
    : `
BREVITY BAR: Scannable micro-lesson — fierce and short, not a textbook chapter.
${lessonBrief ? "\nCAREER MODULE: One sentence each on role differences — only if relevant.\n" : ""}
MAPPING BAR: 3-4 bullets in **What**. **How**: 3 steps max.`;

  const techKey = (technology || "").toLowerCase();
  const hintSource = isBeginner
    ? BEGINNER_TECHNOLOGY_ANALOGY_HINTS
    : TECHNOLOGY_ANALOGY_HINTS;
  const analogyHint =
    hintSource[techKey] ||
    hintSource[techKey.replace(/\.js$/, "")] ||
    "";

  const referenceFacts = getConceptReference(
    `${technology} ${title} ${description} ${objectivesText}`,
    { technology, conceptId }
  );

  const prompt = `${reteachNote}Teach this guided-course lesson as Sai Mahendra for **${technology}**.

Concept: ${title}
Topic summary: ${description}

Learning objectives — touch each briefly inside **How** (do not add extra sections):
${objectivesText}
${levelBars}

${TECHNICAL_ACCURACY_RULES}
${referenceFacts ? `\n${referenceFacts}\n` : ""}

${lessonFormat}
${analogyHint ? `\nTECH-SPECIFIC HINT:\n${analogyHint}` : ""}
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
    level: normalizedLevel,
  });

  if (!quality.ok) {
    console.warn(`⚠️ Lesson quality failed (${technology}/${title}):`, quality.errors);
    const repairPrompt = `${buildRepairPrompt(quality.errors, technology, title, normalizedLevel)}\n\nReference:\n${buildCurriculumReferenceBlock(curriculumReference, lessonBrief).substring(0, 2000)}`;
    const repaired = await requestLesson(repairPrompt, 0.5);
    if (repaired && repaired.length > 400) {
      explanation = stripForbiddenTerms(repaired, technology);
      quality = validateLessonQuality({
        explanation,
        technology,
        objectives,
        level: normalizedLevel,
      });
    }
  }

  if (!quality.ok) {
    console.warn(`⚠️ Lesson still has issues after repair:`, quality.errors);
    // Allow through only if minimally structured — else throw
    const minLength = normalizedLevel === "beginner" ? 400 : 350;
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

async function generateTerseSummary({
  technology,
  title,
  lucidExplanation,
  level = "beginner",
}) {
  const terseFormat =
    (level || "beginner").toLowerCase() === "beginner"
      ? BEGINNER_TERSE_SUMMARY_FORMAT
      : TERSE_SUMMARY_FORMAT;

  const prompt = `Technology: ${technology}
Concept: ${title}

Lucid lesson (compress this — do not add new topics):
${lucidExplanation.substring(0, 2200)}

${terseFormat}

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

${ADAPTIVE_TEACHING_PERSONA}

You are teaching a COMPLETE BEGINNER who knows NOTHING about programming.

TEACHING STYLE:
- Plain English, short sections — student should finish in under 90 seconds
- **How** is the main section but still only 3 steps + one tiny snippet

FORBIDDEN:
- Textbook definitions ("CSS declaration", "stylesheet block", "parser engine") without instant plain-English translation
- Cast-mapping lines like "**CSS Rule** = **CSS declaration**"
- Shallow 1-sentence sections
- Wikipedia or documentation tone
- Lessons with zero code — **How** must end with one tiny fenced snippet (3-6 lines, plain comments)

${CODE_SNIPPET_RULES_BEGINNER}

${BEGINNER_GUIDED_LESSON_FORMAT}
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

${CODE_SNIPPET_RULES_INTERMEDIATE}

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

${CODE_SNIPPET_RULES_ADVANCED}

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
  
  // STEP 1: First interaction — structured concept explanation + cross question
  if (!studentAnswer && !detectedLevel) {
    const analogy = getAnalogy(concept);
    const generated = await generateBeginnerExplanation(
      concept,
      analogy?.story ? `Optional context (do not copy verbatim): ${analogy.story}` : null
    );
    return {
      explanation: generated.explanation,
      crossQuestion: generated.crossQuestion,
      awaitingLevelDetection: true,
      level: null,
    };
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

async function generateBeginnerExplanation(concept, extraContext = null) {
  try {
    const referenceFacts = getConceptReference(concept, {
      technology: detectTechnologies(concept)[0],
    });
    const prompt = `Explain this concept for a beginner: ${concept}
${extraContext ? `\n${extraContext}\n` : ""}
${referenceFacts ? `\n${referenceFacts}\n` : ""}
Use this EXACT response structure in EXPLANATION (markdown headers required):
${CONCEPT_QA_RESPONSE_STRUCTURE}

Keep total EXPLANATION under ~200 words if listing multiple types/categories.

Cross-question rules:
- Ask about the REAL concept (purpose, trade-off, what breaks without it)
- NEVER ask about story props or "in our analogy what is…"
- Sound like a curious engineer

Return in this format:
EXPLANATION:
[Your full answer with **Concept Explanation**, **Real-World Application**, **Code Example**]

CROSS_QUESTION:
[A practical question about the real concept — no story references]`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: LEVEL_1_PERSONA },
          { role: "user", content: prompt }
        ],
        temperature: referenceFacts ? 0.35 : 0.55,
        max_tokens: 800
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
      crossQuestion: questionMatch
        ? questionMatch[1].trim()
        : `What real problem does ${concept} solve in a typical app?`
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
      maxTokens = 700;
    } else if (level === "intermediate") {
      persona = LEVEL_2_PERSONA;
      maxTokens = 700;
    } else {
      persona = LEVEL_3_PERSONA;
      maxTokens = 800;
    }
    
    // Build context from conversation history
    const contextMessages = history.slice(-4).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    const snippetRules =
      level === "beginner"
        ? CODE_SNIPPET_RULES_BEGINNER
        : level === "intermediate"
        ? CODE_SNIPPET_RULES_INTERMEDIATE
        : CODE_SNIPPET_RULES_ADVANCED;

    const referenceFacts = getConceptReference(concept, {
      technology: detectTechnologies(concept)[0],
    });
    const prompt = `Student asked about: ${concept}
Student's answer to cross-question: ${studentAnswer}
Detected level: ${level}
${referenceFacts ? `\n${referenceFacts}\n` : ""}

Provide a ${level}-appropriate explanation using this EXACT structure:
${CONCEPT_QA_RESPONSE_STRUCTURE}

Word limits: beginner ~150, intermediate ~180, advanced ~220 (extend if listing standard types/categories).
${snippetRules}`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: persona },
          ...contextMessages,
          { role: "user", content: prompt }
        ],
        temperature: referenceFacts ? 0.35 : 0.55,
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
  conceptId = null,
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
      conceptId,
    });

    const questionReference = getConceptReference(
      `${technology} ${title} ${explanation}`,
      { technology, conceptId }
    );

    // Terse summary, wireframe, and quiz are independent — run in parallel
    const [contentTerse, diagram, questionsRaw] = await Promise.all([
      generateTerseSummary({
        technology,
        title,
        lucidExplanation: explanation,
        level: normalizedLevel,
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
        questionCount,
        questionReference
      ),
    ]);

    return {
      explanation,
      contentTerse,
      diagram,
      questions: questionsRaw,
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

async function generateLessonQuestions(
  technology,
  title,
  explanation,
  count,
  referenceFacts = ""
) {
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
- If the lesson does not explain warehouse+model+dashboard flow together, do NOT ask that combo question
${QUIZ_STYLE_RULES}`,
        },
        {
          role: "user",
          content: `${referenceFacts ? `${referenceFacts}\n\n---\n\n` : ""}Technology: ${technology}\nConcept: ${title}\n\nFull lesson:\n${explanation.substring(0, 2800)}\n\nGenerate ${count} questions (${openCount} open, ${mcqCount} mcq). Use **What** cast mappings and **Real-time use case** only if those sections exist in the lesson above.`,
        },
      ],
      temperature: 0.35,
        max_tokens: 700,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(
      response?.data?.choices?.[0]?.message?.content || "{}"
    );
    return Array.isArray(parsed.questions) ? parsed.questions : [];
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
