// =======================================================
// 🎯 LEARNING PATH SERVICE
// Manages structured learning sessions with 60% threshold
// Progress is persisted to prevent data loss on reload
// =======================================================

const {
  getTeachingContent,
  getNextConcept,
  getConcept,
  getConceptByOrder,
} = require('./curriculumService');
const { generateGuidedCourseLesson } = require('./adaptiveTeachingService');
const { simplifyQuizQuestion } = require('./simplifyQuestionService');
const { callGroq } = require('./groqClient');
const { QUALITY_MODEL } = require('./aiModelConfig');
const {
  normalizeQuizQuestions,
  sanitizeQuestionsForClient,
  enforceQuestionMix,
  alignQuizWithLesson,
  applyLessonAwareOpenScores,
  gradeMcqAnswers,
  allMcqQuestions,
} = require('./quizQuestionUtils');
const {
  runRevalidatedGrading,
  lockMcqKeysFromLesson,
  MAX_REVALIDATION_PASSES,
} = require('./gradingRevalidationService');
const { getConceptReference } = require('./conceptReferenceService');
const { normalizeAssessmentRows } = require('./assessmentResultNormalizer');
const fs = require('fs');
const path = require('path');

// Data persistence paths
const DATA_DIR = path.join(__dirname, '../data/progress');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'student-progress.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load persisted data or initialize empty
let learningSessions = {};
let studentProgress = {};

try {
  if (fs.existsSync(SESSIONS_FILE)) {
    learningSessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    console.log(`📂 Loaded ${Object.keys(learningSessions).length} sessions from disk`);
  }
} catch (err) {
  console.error('Error loading sessions:', err.message);
}

try {
  if (fs.existsSync(PROGRESS_FILE)) {
    studentProgress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    console.log(`📂 Loaded progress for ${Object.keys(studentProgress).length} students from disk`);
  }
} catch (err) {
  console.error('Error loading progress:', err.message);
}

// Save data to disk
function saveSessionsToDisk() {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(learningSessions, null, 2));
  } catch (err) {
    console.error('Error saving sessions:', err.message);
  }
}

function reloadSessionsFromDisk() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      learningSessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reloading sessions:', err.message);
  }
}

function getSessionById(sessionId) {
  if (learningSessions[sessionId]) return learningSessions[sessionId];
  reloadSessionsFromDisk();
  return learningSessions[sessionId] || null;
}

/** Grade against the exact questions the browser displayed, with MCQ keys from internal store. */
function mergeClientQuestionsWithMcqKeys(clientQuestions, internalQuestions) {
  const client = Array.isArray(clientQuestions) ? clientQuestions : [];
  const internal = Array.isArray(internalQuestions) ? internalQuestions : [];

  if (client.length === 0) return internal;

  return client.map((cq, i) => {
    const match =
      internal.find((iq) => iq?.question === cq?.question) || internal[i];

    if (cq?.type === "mcq" && Array.isArray(cq.options)) {
      return {
        type: "mcq",
        question: cq.question,
        options: cq.options,
        correctIndex:
          typeof match?.correctIndex === "number" ? match.correctIndex : 0,
      };
    }

    return { type: "open", question: cq.question || match?.question || "" };
  });
}

/** Always return a gradable result — never leave quiz scoring in a broken state */
function coerceAssessment(assessment, answers, questions, lessonContext = '') {
  const valid =
    assessment &&
    typeof assessment.percentage === 'number' &&
    Array.isArray(assessment.detailedFeedback) &&
    assessment.detailedFeedback.length > 0;

  if (valid) return assessment;

  console.warn('⚠️ Coercing invalid assessment to safe fallback');

  const questionTexts = (questions || []).map((q) =>
    typeof q === 'string' ? q : q?.question || ''
  );

  if (allMcqQuestions(questions)) {
    return gradeMcqAnswers(answers, questions);
  }

  return intelligentFallbackScoring(answers, questionTexts, lessonContext);
}

function saveProgressToDisk() {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(studentProgress, null, 2));
    console.log(`💾 Progress saved to disk for ${Object.keys(studentProgress).length} students`);
  } catch (err) {
    console.error('Error saving progress:', err.message);
  }
}

function ensureStudentProgress(studentId, technology) {
  if (!studentProgress[studentId]) {
    studentProgress[studentId] = {};
  }
  if (!studentProgress[studentId][technology]) {
    studentProgress[studentId][technology] = {
      currentConceptOrder: 1,
      completedConcepts: [],
      conceptScores: {},
    };
  }
  return studentProgress[studentId][technology];
}

// Auto-save progress every 30 seconds
setInterval(() => {
  if (Object.keys(studentProgress).length > 0) {
    saveProgressToDisk();
  }
}, 30000);

// =======================================================
// START LEARNING PATH
// =======================================================
function startLearningPath(studentId, technology, conceptOrder) {
  const sessionId = `lp_${Date.now()}_${studentId}`;
  
  console.log(`🎯 Creating learning session: ${sessionId} for ${studentId} - ${technology}`);
  
  // Get or create student progress
  const progress = ensureStudentProgress(studentId, technology);
  const requestedOrder =
    conceptOrder != null && Number.isFinite(Number(conceptOrder))
      ? Number(conceptOrder)
      : null;
  const currentOrder = requestedOrder ?? progress.currentConceptOrder;
  
  // Create session
  learningSessions[sessionId] = {
    sessionId,
    studentId,
    technology,
    currentConceptOrder: currentOrder,
    conversationHistory: [],
    assessmentAttempts: 0,
    createdAt: new Date().toISOString()
  };
  
  saveSessionsToDisk();
  
  console.log(`✅ Session created. Total sessions: ${Object.keys(learningSessions).length}`);
  
  return {
    sessionId,
    technology,
    currentConceptOrder: currentOrder,
    progress: progress
  };
}

// =======================================================
// SELECT QUESTIONS ALIGNED WITH TAUGHT CONTENT
// =======================================================
function selectAssessmentQuestions(teachingContent, allQuestions, maxQuestions = 4) {
  if (!allQuestions?.length) return [];
  if (allQuestions.length <= maxQuestions) return [...allQuestions];

  const contentLower = (teachingContent || '').toLowerCase();

  const scored = allQuestions.map((question, index) => {
    const words = question
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 4);
    const matchCount = words.filter((w) => contentLower.includes(w)).length;
    return { question, index, matchCount };
  });

  scored.sort((a, b) => b.matchCount - a.matchCount || a.index - b.index);

  const selected = scored
    .slice(0, maxQuestions)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.question);

  return selected.length > 0 ? selected : allQuestions.slice(0, maxQuestions);
}

function getMaxQuestionsForLevel(studentLevel) {
  const level = (studentLevel || 'beginner').toLowerCase();
  if (level === 'advanced') return 6;
  if (level === 'intermediate') return 5;
  return 4;
}

// =======================================================
// GENERATE AI QUESTIONS
// =======================================================
async function generateAIQuestions(technology, conceptTitle, conceptContent, count = 3) {
  const axios = require('axios');
  
  console.log(`🤖 Generating ${count} AI questions for ${technology} - ${conceptTitle}`);
  
  const prompt = `You are an expert programming instructor creating assessment questions.

Technology: ${technology}
Concept: ${conceptTitle}
Lesson content (ONLY ask about topics covered here):
${conceptContent.substring(0, 2500)}

Generate exactly ${count} assessment questions based ONLY on the lesson content below.

REQUIREMENTS:
- Every question MUST be answerable using ONLY the lesson content provided
- Do NOT ask about topics, commands, or concepts not mentioned in the lesson
- Questions should be clear and specific
- Can be answered in 1-3 sentences
- Test understanding of what was actually taught

Return ONLY a JSON object: {"questions": ["Question 1?", "Question 2?"]}`;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: QUALITY_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert programming instructor. Generate clear, practical assessment questions. Return ONLY valid JSON array of questions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );
    
    const aiResponse = response?.data?.choices?.[0]?.message?.content || "{}";
    console.log(`✅ AI questions generated:`, aiResponse);
    
    // Parse response
    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
      
      // Handle different response formats
      let questions;
      if (Array.isArray(parsed)) {
        questions = parsed;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        questions = parsed.questions;
      } else if (typeof parsed === 'object') {
        // Try to extract array from object
        const values = Object.values(parsed);
        questions = values.find(v => Array.isArray(v)) || [];
      } else {
        questions = [];
      }
      
      // Validate and clean questions
      questions = questions
        .filter(q => typeof q === 'string' && q.length > 10)
        .slice(0, count);
      
      if (questions.length === 0) {
        throw new Error('No valid questions in AI response');
      }
      
      console.log(`✅ Parsed ${questions.length} AI questions`);
      return questions;
      
    } catch (parseError) {
      console.error('❌ Failed to parse AI questions:', parseError.message);
      console.error('Raw response:', aiResponse);
      return null;
    }
    
  } catch (error) {
    console.error('❌ AI question generation error:', error.message);
    if (error.response) {
      console.error('API response error:', error.response.status, error.response.data);
    }
    return null;
  }
}

// Resolve concept from curriculum by order (works for ALL technologies)
function getSessionConcept(technology, conceptOrder) {
  return getConceptByOrder(technology, conceptOrder);
}

// =======================================================
// GET CURRENT CONCEPT TEACHING
// Applies Sai Mahendra teaching style to EVERY technology
// =======================================================
async function getCurrentConceptTeaching(sessionId, studentLevel, useAIQuestions = false, reteach = false) {
  const session = learningSessions[sessionId];
  
  if (!session) {
    throw new Error('Session not found');
  }

  const concept = getSessionConcept(session.technology, session.currentConceptOrder);

  const teachingContent = getTeachingContent(
    session.technology,
    concept.id,
    studentLevel
  );

  const level = (studentLevel || 'beginner').toLowerCase();
  const maxQuestions = getMaxQuestionsForLevel(level);

  const curriculumReference = teachingContent.content;

  if (reteach) {
    session.reteachCount = (session.reteachCount || 0) + 1;
  }

  const cacheKey = `${concept.id}_${level}_r${session.reteachCount || 0}_fmt9${teachingContent.lessonBrief ? "_brief" : ""}`;

  if (!reteach && session.lessonCache?.[cacheKey]) {
    console.log(`📦 Serving cached lesson: ${cacheKey}`);
    const cached = session.lessonCache[cacheKey];
    // Use cached questions as shown — only refresh MCQ keys, never re-align (reorder) at serve time
    if (cached.quizQuestionsInternal?.length) {
      session.quizQuestionsInternal = lockMcqKeysFromLesson(
        cached.quizQuestionsInternal,
        cached.content || ""
      );
      session.activeCrossQuestions = sanitizeQuestionsForClient(
        session.quizQuestionsInternal
      );
    } else if (cached.crossQuestions?.length) {
      session.quizQuestionsInternal = lockMcqKeysFromLesson(
        normalizeQuizQuestions(cached.crossQuestions),
        cached.content || ""
      );
      session.activeCrossQuestions = sanitizeQuestionsForClient(
        session.quizQuestionsInternal
      );
    }
    saveSessionsToDisk();
    session.activeLessonContent = cached.content || "";
    return {
      ...cached,
      crossQuestions: session.activeCrossQuestions || cached.crossQuestions,
      conceptOrder: session.currentConceptOrder,
      sessionId,
    };
  }

  try {
    const priorLesson =
      reteach && session.lessonCache
        ? Object.values(session.lessonCache).find((l) => l?.content)?.content
        : null;

    const lesson = await generateGuidedCourseLesson({
      technology: session.technology,
      title: teachingContent.title,
      description: teachingContent.description,
      objectives: teachingContent.objectives || [],
      curriculumReference,
      lessonBrief: teachingContent.lessonBrief || null,
      level,
      questionCount: maxQuestions,
      reteach: Boolean(reteach),
      previousExplanation: priorLesson || null,
      conceptId: concept.id,
    });

    teachingContent.content = lesson.explanation;

    const normalizedQuestions = alignQuizWithLesson(
      lesson.questions,
      lesson.explanation,
      maxQuestions
    );
    teachingContent.contentTerse = lesson.contentTerse || null;
    teachingContent.diagram = lesson.diagram || null;
    teachingContent.contentSource = lesson.contentSource;
    const lessonForLock = teachingContent.content || "";
    session.quizQuestionsInternal = lockMcqKeysFromLesson(
      normalizedQuestions,
      lessonForLock
    );
    teachingContent.crossQuestions = sanitizeQuestionsForClient(
      session.quizQuestionsInternal
    );

    console.log(
      `✅ Guided lesson (${lesson.contentSource}): ${normalizedQuestions.length} quiz questions (answers hidden from client)`
    );
  } catch (err) {
    console.error('❌ Guided lesson failed for', session.technology, err.message);
    if (err.isRateLimit) {
      const rateErr = new Error(err.message);
      rateErr.isRateLimit = true;
      rateErr.retryAfterMs = err.retryAfterMs || 20000;
      throw rateErr;
    }
    throw err;
  }

  session.activeCrossQuestions = teachingContent.crossQuestions;
  if (!session.quizQuestionsInternal?.length) {
    session.quizQuestionsInternal = normalizeQuizQuestions(
      teachingContent.crossQuestions
    );
    teachingContent.crossQuestions = sanitizeQuestionsForClient(
      session.quizQuestionsInternal
    );
  }
  const result = {
    ...teachingContent,
    conceptOrder: session.currentConceptOrder,
    sessionId,
  };

  session.lessonCache = session.lessonCache || {};
  session.lessonCache[cacheKey] = {
    ...result,
    quizQuestionsInternal: session.quizQuestionsInternal,
  };
  session.activeLessonContent = teachingContent.content || "";
  saveSessionsToDisk();

  return result;
}

// =======================================================
// ASSESS UNDERSTANDING (AI-POWERED)
// =======================================================
function getLessonContextForSession(session) {
  if (session?.activeLessonContent) {
    return String(session.activeLessonContent).substring(0, 3500);
  }
  if (!session?.lessonCache) return '';
  for (const lesson of Object.values(session.lessonCache)) {
    if (lesson?.content) {
      return String(lesson.content).substring(0, 3500);
    }
  }
  return '';
}

async function assessUnderstanding(answers, crossQuestions, lessonContext = '', options = {}) {
  console.log(`🤖 Starting AI assessment for ${answers.length} answers`);
  console.log(`📝 Answers:`, answers);

  const { technology, conceptId } = options;
  const referenceFacts = getConceptReference(
    `${lessonContext} ${(crossQuestions || []).join(' ')}`,
    { technology, conceptId }
  );

  const lessonBlock = lessonContext
    ? `\n\nLESSON CONTENT (grade ONLY against what was taught here — accept synonymous wording):\n${lessonContext}\n`
    : '';
  const referenceBlock = referenceFacts
    ? `\n\nCURRICULUM REFERENCE (authoritative scope — do not penalize answers that match these facts):\n${referenceFacts}\n`
    : '';

  let evaluationText = `You are evaluating student answers like a FAIR human interviewer — score MEANING only, never length.

IMPORTANT SCORING RULES:
- Score ONLY whether the MEANING matches the LESSON CONTENT below (never generic textbook answers)
- NEVER score based on how many words, sentences, or lines the student wrote
- NEVER penalize a short answer if the meaning is correct — brief and correct = 10/10
- NEVER reward a long answer if the meaning is wrong or vague — length is irrelevant
- If the QUESTION already names an example (hospital, readmission, etc.), do NOT require repeating that example — grade the idea (why, benefit, decision-making)
- Data Analyst meaning = reports, BI tools, dashboards, insights from existing data
- Data Scientist meaning = builds/trains predictive models, experiments — NOT the Analyst role
- ML Engineer meaning = deploy/API/production; Data Engineer = pipeline/ETL/warehouse
- 9-10 when meaning clearly matches the lesson; 6-8 when mostly right, one small gap from the lesson
- 0-4 ONLY when meaning is clearly wrong or unrelated — NOT because the answer was short
- Do NOT say "add more detail" in feedback — vague answers should have been caught earlier; grade what was submitted on meaning alone
- Netflix/real-time: mentioning algorithms, collaborative filtering, embeddings, or backend recommendations = 8-10/10 if the lesson Real-time section mentions them — do NOT require extra algorithm depth not in the lesson
- Data Analyst = reports/insights/SQL/dashboards; Data Scientist = models/EDA/experiments; ML Engineer = deploy/production/API; Data Engineer = pipelines/warehouse/ETL
- Managing a data warehouse alone is NOT the primary role of a Data Scientist unless the lesson explicitly says so
${lessonBlock}${referenceBlock}

Questions and Answers:
`;
  
  answers.forEach((answer, index) => {
    evaluationText += `\nQuestion ${index + 1}: ${crossQuestions[index]}\n`;
    evaluationText += `Student Answer: ${answer}\n`;
  });
  
  evaluationText += `\n\nProvide ONLY a JSON response (no markdown, no explanation) with this exact format:
{
  "results": [
    {"questionNumber": 1, "score": 0, "feedback": "explanation for answer 1"}
  ]
}

Return exactly ${answers.length} result objects, one for every question, in the original order.
Never omit a score. For feedback, explain what was correct or incorrect about each answer.`;
  
  try {
    console.log(`🔑 Using API key: ${process.env.GROQ_API_KEY ? 'Present (length: ' + process.env.GROQ_API_KEY.length + ')' : 'MISSING!'}`);
    
    const response = await callGroq({
      model: QUALITY_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a fair interviewer. Score MEANING against the lesson only — never word count or sentence count. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: evaluationText,
        },
      ],
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });
    
    console.log(`✅ AI response received:`, response.data);
    
    const aiResponse = response?.data?.choices?.[0]?.message?.content || "{}";
    console.log(`📄 AI content:`, aiResponse);
    
    // Try to parse JSON from AI response
    let evaluation;
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
      }
      
      evaluation = JSON.parse(cleanedResponse);
      console.log(`✅ Parsed evaluation:`, evaluation);
    } catch (e) {
      console.error("❌ JSON parse error:", e.message);
      console.error("Raw AI response:", aiResponse);
      // Fallback to intelligent scoring
      return intelligentFallbackScoring(answers, crossQuestions, lessonContext);
    }
    
    const resultRows = Array.isArray(evaluation.results) ? evaluation.results : [];
    const rawScores = resultRows.length
      ? resultRows.map((row) => row?.score)
      : Array.isArray(evaluation.scores) ? evaluation.scores : [];
    const rawFeedback = resultRows.length
      ? resultRows.map((row) => row?.feedback)
      : Array.isArray(evaluation.feedback) ? evaluation.feedback : [];
    const normalizedRows = normalizeAssessmentRows({
      answers,
      questions: crossQuestions,
      rawScores,
      feedback: rawFeedback,
      lessonContext,
    });
    const normalizedScores = normalizedRows.map((row) => row.score);
    const totalScore = normalizedScores.reduce((a, b) => a + b, 0);
    const maxScore = answers.length * 10;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    // Generate detailed feedback for each question
    const detailedFeedback = answers.map((answer, index) => {
      const score = normalizedScores[index];
      const isPerfect = score >= 9;
      const isGood = score >= 7;
      
      return {
        questionNumber: index + 1,
        question: crossQuestions[index],
        yourAnswer: answer,
        score: score,
        maxScore: 10,
        status: isPerfect ? 'correct' : isGood ? 'partial' : 'incorrect',
        feedback: normalizedRows[index]?.feedback || (
          isPerfect ? '✅ Excellent! Your answer is correct.' :
          isGood ? '⚠️ Partially correct. Your answer shows some understanding but could be more complete.' :
          '❌ This answer needs improvement. Review the concept again.'
        )
      };
    });
    
    console.log(`📊 Final assessment: ${percentage}% (${totalScore}/${maxScore})`);

    let result = {
      score: totalScore,
      maxScore,
      percentage,
      passed: percentage >= 60,
      detailedFeedback,
    };

    result = applyLessonAwareOpenScores(
      result,
      answers,
      crossQuestions,
      lessonContext
    );
    console.log(`📊 After lesson-aware pass: ${result.percentage}%`);

    return result;
    
  } catch (error) {
    console.error("❌ AI assessment error:", error.message);
    if (error.response) {
      console.error("API response error:", error.response.status, error.response.data);
    }
    return intelligentFallbackScoring(answers, crossQuestions, lessonContext);
  }
}

// Intelligent fallback scoring when AI is unavailable
// This analyzes answer quality more fairly than simple length-based scoring
function intelligentFallbackScoring(answers, crossQuestions, lessonContext = "") {
  console.log(`⚠️ Using lesson-aware fallback scoring (not length-based)`);

  const detailedFeedback = answers.map((answer, index) => {
    const question = crossQuestions[index];
    const lessonHit = require("./quizQuestionUtils").scoreOpenAnswerWithLesson(
      answer,
      question,
      lessonContext
    );

    if (lessonHit) {
      return {
        questionNumber: index + 1,
        question,
        yourAnswer: answer,
        score: lessonHit.score,
        maxScore: 10,
        status: lessonHit.status,
        feedback: lessonHit.feedback,
      };
    }

    const score = answer?.trim() ? 6 : 0;
    return {
      questionNumber: index + 1,
      question,
      yourAnswer: answer,
      score,
      maxScore: 10,
      status: score >= 7 ? "partial" : "incorrect",
      feedback:
        score > 0
          ? "Your answer relates to the topic — compare with the lesson cast list and How steps."
          : "No answer provided.",
    };
  });

  const totalScore = detailedFeedback.reduce((s, d) => s + d.score, 0);
  const maxScore = answers.length * 10;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    score: totalScore,
    maxScore,
    percentage,
    passed: percentage >= 60,
    detailedFeedback,
  };
}

// Legacy simple fallback (kept for reference, not used)
function simpleFallbackScoring(answers) {
  let totalScore = 0;
  const maxScore = answers.length * 10;
  
  answers.forEach(answer => {
    const answerLength = answer.trim().length;
    
    // More lenient scoring - short answers can still be correct
    if (answerLength > 5) {
      totalScore += 8; // Assume most answers are reasonable
    } else if (answerLength > 2) {
      totalScore += 6;
    } else {
      totalScore += 3;
    }
  });
  
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  return {
    score: totalScore,
    maxScore,
    percentage,
    passed: percentage >= 60
  };
}

// =======================================================
// SIMPLIFY CURRENT QUICK CHECK QUESTION
// =======================================================
async function simplifyQuestionForSession(sessionId, questionIndex) {
  const session = learningSessions[sessionId];
  if (!session) {
    throw new Error('Session not found');
  }

  const idx = Number(questionIndex);
  if (!Number.isFinite(idx) || idx < 0) {
    throw new Error('Invalid question index');
  }

  const gradingQuestions =
    session.quizQuestionsInternal?.length > 0
      ? session.quizQuestionsInternal
      : normalizeQuizQuestions(session.activeCrossQuestions || []);

  if (idx >= gradingQuestions.length) {
    throw new Error('Question not found');
  }

  session.questionSimplifyCount = session.questionSimplifyCount || {};
  const simplifyKey = `${session.currentConceptOrder}_${idx}`;
  const prior = session.questionSimplifyCount[simplifyKey] || 0;
  if (prior >= 2) {
    const err = new Error(
      'This question was already simplified twice. Answer with your best guess or what you understood from the lesson.'
    );
    err.code = 'SIMPLIFY_LIMIT';
    throw err;
  }

  const concept = getSessionConcept(session.technology, session.currentConceptOrder);
  const teachingContent = getTeachingContent(
    session.technology,
    concept.id,
    'beginner'
  );

  const original = gradingQuestions[idx];
  const simplified = await simplifyQuizQuestion({
    technology: session.technology,
    conceptTitle: teachingContent.title,
    lessonSnippet: session.lessonCache
      ? Object.values(session.lessonCache).find((l) => l?.content)?.content
      : teachingContent.content,
    question: original,
  });

  gradingQuestions[idx] = simplified;
  session.quizQuestionsInternal = gradingQuestions;
  session.activeCrossQuestions = sanitizeQuestionsForClient(gradingQuestions);

  if (session.lessonCache) {
    for (const key of Object.keys(session.lessonCache)) {
      if (session.lessonCache[key]?.crossQuestions) {
        session.lessonCache[key].crossQuestions = [...session.activeCrossQuestions];
      }
    }
  }

  session.questionSimplifyCount[simplifyKey] = prior + 1;
  saveSessionsToDisk();

  console.log(`📘 Simplified question ${idx + 1} for session ${sessionId}`);

  return {
    questionIndex: idx,
    question: session.activeCrossQuestions[idx],
    simplifyCount: session.questionSimplifyCount[simplifyKey],
  };
}

// =======================================================
// SUBMIT CONCEPT ANSWERS
// =======================================================
async function submitConceptAnswers(sessionId, answers, options = {}) {
  const { lessonContentOverride = '', questionsSnapshot = null } = options;

  console.log(`📝 Submitting answers for session: ${sessionId}`);
  console.log(`📊 Available sessions: ${Object.keys(learningSessions).join(', ')}`);
  
  const session = getSessionById(sessionId);
  
  if (!session) {
    console.error(`❌ Session ${sessionId} not found after disk reload`);
    throw new Error('Session not found');
  }
  
  console.log(`✅ Session found: ${session.technology} - Concept ${session.currentConceptOrder}`);
  
  session.assessmentAttempts++;
  
  const concept = getSessionConcept(session.technology, session.currentConceptOrder);
  const conceptId = concept.id;

  if (
    Array.isArray(questionsSnapshot) &&
    questionsSnapshot.length > 0 &&
    questionsSnapshot.length === answers.length
  ) {
    session.activeCrossQuestions = sanitizeQuestionsForClient(questionsSnapshot);
    if (!session.quizQuestionsInternal?.length) {
      session.quizQuestionsInternal = normalizeQuizQuestions(questionsSnapshot);
    }
  }

  const gradingQuestions =
    session.activeCrossQuestions?.length > 0
      ? mergeClientQuestionsWithMcqKeys(
          session.activeCrossQuestions,
          session.quizQuestionsInternal
        )
      : session.quizQuestionsInternal?.length > 0
        ? session.quizQuestionsInternal
        : normalizeQuizQuestions(
            concept.crossQuestions.slice(0, getMaxQuestionsForLevel('beginner'))
          );

  if (answers.length !== gradingQuestions.length) {
    console.warn(
      `⚠️ Answer count (${answers.length}) != question count (${gradingQuestions.length}) — scores may not match what the student saw`
    );
  }

  if (gradingQuestions.length === 0) {
    throw new Error('No quiz questions found for this session');
  }

  const lessonContext =
    getLessonContextForSession(session) ||
    String(lessonContentOverride || '').substring(0, 3500);

  if (lessonContentOverride && !session.activeLessonContent) {
    session.activeLessonContent = String(lessonContentOverride).substring(0, 3500);
  }

  console.log(`🛡️ Starting revalidated grading (${MAX_REVALIDATION_PASSES || 3} passes max)…`);

  let assessment;
  let lockedQuestions = gradingQuestions;

  try {
    const graded = await runRevalidatedGrading({
      answers,
      questions: gradingQuestions,
      lessonContent: lessonContext,
      assessOpenFn: async (openAnswers, openQuestions) => {
        try {
          const openResult = await assessUnderstanding(
            openAnswers,
            openQuestions,
            lessonContext,
            { technology: session.technology, conceptId }
          );
          return coerceAssessment(
            openResult,
            openAnswers,
            openQuestions.map((t) => ({ type: 'open', question: t })),
            lessonContext
          );
        } catch (openErr) {
          console.error('Open-answer AI grading failed:', openErr.message);
          return intelligentFallbackScoring(
            openAnswers,
            openQuestions,
            lessonContext
          );
        }
      },
    });
    assessment = graded?.assessment;
    lockedQuestions = graded?.lockedQuestions || gradingQuestions;
  } catch (gradingErr) {
    console.error("❌ Revalidated grading failed, using lesson-aware fallback:", gradingErr.message);
    const questionTexts = gradingQuestions.map((q) =>
      typeof q === "string" ? q : q?.question || ""
    );
    assessment = intelligentFallbackScoring(
      answers,
      questionTexts,
      lessonContext
    );
  }

  assessment = coerceAssessment(
    assessment,
    answers,
    lockedQuestions,
    lessonContext
  );

  // Keep the question set the student answered; grading may only adjust MCQ correctIndex in-place
  session.quizQuestionsInternal = gradingQuestions.map((q, i) => {
    const locked = lockedQuestions[i];
    if (locked?.type === "mcq" && q?.type === "mcq") {
      return { ...q, correctIndex: locked.correctIndex };
    }
    return q;
  });
  session.activeCrossQuestions = sanitizeQuestionsForClient(
    session.quizQuestionsInternal
  );
  saveSessionsToDisk();

  console.log(
    `📊 Assessment result (revalidated): ${assessment.percentage}% (${assessment.passed ? 'PASSED' : 'FAILED'})`
  );

  try {
    const { logGuidedQuiz } = require('./studentLearningLedgerService');
    logGuidedQuiz({
      studentId: session.studentId,
      technology: session.technology,
      conceptId,
      topic: concept?.title || conceptId,
      score: assessment.percentage,
      passed: assessment.passed,
    });
  } catch (ledgerErr) {
    console.error('Ledger guided quiz log error:', ledgerErr.message);
  }

  if (assessment.passed) {
    try {
    const progress = ensureStudentProgress(session.studentId, session.technology);
    // Mark concept as completed
    if (!progress.completedConcepts.includes(conceptId)) {
      progress.completedConcepts.push(conceptId);
    }
    
    progress.conceptScores[conceptId] = assessment.percentage;
    
    // Move to next concept
    progress.currentConceptOrder++;
    session.currentConceptOrder++;
    progress.lastUpdated = new Date().toISOString();
    
    // Save progress to disk
    saveProgressToDisk();

    // Sync to Google Sheets for trainer visibility (non-blocking)
    syncLearningProgressToSheets(
      session.studentId,
      session.technology,
      conceptId,
      assessment.percentage
    ).catch((err) =>
      console.error('Sheets sync background error:', err.message)
    );

    try {
      const { recordSyncAttempt } = require('./syncStatusService');
      recordSyncAttempt(session.studentId, 'official_learning_progress', {
        success: true,
      });
    } catch (err) {
      console.error('Official progress heartbeat error:', err.message);
    }
    
    console.log(`✅ Concept ${conceptId} completed! Moving to concept ${progress.currentConceptOrder}`);
    
    return {
      passed: true,
      assessment,
      message: "Great! You've understood this concept. Moving to the next one.",
      nextConceptAvailable: true
    };
    } catch (progressErr) {
      console.error('Progress save failed (grading still returned):', progressErr.message);
      return {
        passed: true,
        assessment,
        message: "Great work on this quiz! Your score is shown below.",
        nextConceptAvailable: false,
      };
    }
  } else {
    console.log(`⚠️ Re-teaching required (scored ${assessment.percentage}%)`);
    
    // Need to re-teach
    return {
      passed: false,
      assessment,
      message: `You scored ${assessment.percentage}%. Review the feedback below, then choose whether to study a simpler explanation or retry the quiz.`,
      reteachRequired: false
    };
  }
}

// =======================================================
// GET STUDENT PROGRESS
// =======================================================
function getTotalConceptsForTechnology(technology) {
  const { getCurriculum } = require('./curriculumService');
  let totalConcepts = 5;
  try {
    const curriculum = getCurriculum(technology);
    totalConcepts = curriculum.totalConcepts || curriculum.concepts?.length || 5;
  } catch (err) {
    console.error('Error getting curriculum:', err.message);
  }
  return totalConcepts;
}

function enrichProgressForTechnology(technology, progress) {
  const totalConcepts = getTotalConceptsForTechnology(technology);
  const completed = progress.completedConcepts?.length || 0;
  const overallProgress =
    progress.overallProgress != null
      ? progress.overallProgress
      : Math.round((completed / totalConcepts) * 100);

  return {
    ...progress,
    totalConcepts,
    overallProgress,
  };
}

function getStudentProgress(studentId, technology) {
  if (!studentProgress[studentId] || !studentProgress[studentId][technology]) {
    return {
      currentConceptOrder: 1,
      completedConcepts: [],
      conceptScores: {},
      overallProgress: 0,
      totalConcepts: getTotalConceptsForTechnology(technology),
    };
  }

  const progress = studentProgress[studentId][technology];
  return enrichProgressForTechnology(technology, progress);
}

function getAllStudentsProgressRaw() {
  return JSON.parse(JSON.stringify(studentProgress));
}

async function syncLearningProgressToSheets(studentId, technology, conceptId, quizScore) {
  const progress = studentProgress[studentId]?.[technology];
  if (!progress) return;

  const enriched = enrichProgressForTechnology(technology, progress);

  try {
    const { logLearningProgress } = require('./learningProgressSheetsService');
    await logLearningProgress({
      studentId,
      technology,
      conceptId,
      event: 'concept_completed',
      currentConceptOrder: enriched.currentConceptOrder,
      overallProgress: enriched.overallProgress,
      quizScore,
      completedCount: enriched.completedConcepts?.length || 0,
      completedConcepts: (enriched.completedConcepts || []).join(', '),
    });
  } catch (err) {
    console.error('Learning progress Sheets sync:', err.message);
  }
}

// =======================================================
// GET ALL STUDENT PROGRESS
// =======================================================
function getAllStudentProgress(studentId) {
  const raw = studentProgress[studentId] || {};
  const enriched = {};
  for (const [technology, progress] of Object.entries(raw)) {
    enriched[technology] = enrichProgressForTechnology(technology, progress);
  }
  return enriched;
}

module.exports = {
  startLearningPath,
  getCurrentConceptTeaching,
  simplifyQuestionForSession,
  submitConceptAnswers,
  getStudentProgress,
  getAllStudentProgress,
  getAllStudentsProgressRaw,
  enrichProgressForTechnology,
  getTotalConceptsForTechnology,
  syncLearningProgressToSheets,
  saveProgressToDisk,
  saveSessionsToDisk,
};
