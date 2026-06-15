const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

// Always load .env from backend folder (works even if started from repo root)
require("dotenv").config({ path: path.join(__dirname, ".env") });

if (process.env.GROQ_API_KEY) {
  process.env.GROQ_API_KEY = process.env.GROQ_API_KEY.trim();
}
const groqConfigured = Boolean(process.env.GROQ_API_KEY);
console.log(
  groqConfigured
    ? "✅ GROQ_API_KEY loaded — AI lessons enabled"
    : "❌ GROQ_API_KEY missing — lessons will use fallback content only"
);

// =======================================================
// 🔒 LICENSE VALIDATION (MUST BE FIRST)
// =======================================================
const {
  validateLicense,
  validateLicenseOffline,
  startPeriodicCheck,
  checkAttribution
} = require("./services/licenseService");

console.log("================================================================================");
console.log("🎓 MICROTRAINER - AI-POWERED LEARNING PLATFORM");
console.log("📄 Copyright (c) 2026 [Your Name/Organization]");
console.log("📋 Licensed under Educational Use License");
console.log("================================================================================");
console.log("");

// Validate license on startup
(async () => {
  console.log("🔒 Validating license...");
  
  // Skip license validation in development
  if (process.env.NODE_ENV === 'development' || !process.env.LICENSE_KEY || process.env.LICENSE_KEY === 'your-email@example.com:abc123def456') {
    console.log("⚠️  Running in DEVELOPMENT mode - License validation skipped");
    console.log("");
    return;
  }
  
  // Try remote validation first
  let valid = await validateLicense();
  
  // If remote fails, try offline validation
  if (!valid && process.env.LICENSE_KEY) {
    console.log("⚠️  Remote validation failed, trying offline validation...");
    valid = validateLicenseOffline();
  }
  
  if (!valid) {
    console.error("");
    console.error("================================================================================");
    console.error("❌ LICENSE VALIDATION FAILED");
    console.error("================================================================================");
    console.error("");
    console.error("This software requires a valid license key to operate.");
    console.error("");
    console.error("📋 TO OBTAIN A LICENSE KEY:");
    console.error("   1. Contact: [your-email@example.com]");
    console.error("   2. Subject: 'MicroTrainer License Request'");
    console.error("   3. Include: Your name, email, and intended use");
    console.error("");
    console.error("📄 See LICENSE file for full terms and conditions");
    console.error("🌐 Website: [https://your-website.com]");
    console.error("");
    console.error("================================================================================");
    process.exit(1);
  }
  
  console.log("✅ License validated successfully");
  console.log("");
  
  // Check attribution
  checkAttribution();
  
  // Start periodic license checks (every 60 minutes)
  if (process.env.NODE_ENV === 'production') {
    startPeriodicCheck(60);
  }
})();

// =======================================================
// 🔐 ENV VALIDATION (PREVENT SILENT FAILURES)
// =======================================================
if (!process.env.GROQ_API_KEY) {
  throw new Error("❌ MISSING: GROQ_API_KEY in environment variables");
}

if (!process.env.SHEET_ID) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error("❌ MISSING: SHEET_ID in environment variables");
  }
  process.env.SHEET_ID = 'dev-no-google-sheet';
  console.warn(
    '⚠️ SHEET_ID not set — using dev placeholder. Google Sheets features need a real SHEET_ID in .env.'
  );
}

console.log("✅ Environment variables validated");

const { verifyGoogleSheetsSetup } = require("./services/googleSheetsAuth");

// ================= SERVICES =================
const { getAnswer } = require("./services/aiService");
const { evaluateAnswer } = require("./services/interviewService");
const {
  createSession,
  submitAnswer
} = require("./services/interviewSessionService");

const { getStudentReport } = require("./services/analyticsService");

// 🔥 NEW TRACKING + MEMORY
const { aggregateStudent } = require("./services/trackingService");
const { getStudentMemory } = require("./services/memoryService");
const {
  getStudentHistory,
  getStudentMemory: getStudentMemoryFromSheets,
} = require("./services/readSheetsService");

const EMPTY_STUDENT_ANALYTICS = {
  totalQuestions: 0,
  averageScore: "0.00",
  communicationScore: "0.00",
  technicalScore: "0.00",
  weakAreas: [],
};

const EMPTY_STUDENT_MEMORY = {
  level: "Beginner",
  trend: "Stable",
  consistency: "New",
  totalAttempts: 0,
  strongConcepts: [],
  weakConcepts: [],
  avgScore: 0,
  communication: 0,
  technical: 0,
};

// 🔥 DASHBOARD
const {
  getOverview,
  getWeakStudents,
  getTrends
} = require("./services/dashboardService");

// 🔥 NEW RANKING SYSTEM
const { getLeaderboard } = require("./services/rankingService");

// 🔥 CODE EXECUTION & PROBLEM SOLVING
const {
  executeCode,
  runCodeOnce,
  buildJudgeResponse,
  validateCode,
  getCodeTemplate
} = require("./services/codeExecutionService");

const {
  getRandomProblem,
  getProblemById,
  getProblemsByDifficulty,
  getAllProblems,
  getProblemStats
} = require("./services/problemSolvingQuestionBank");

const app = express();


// =======================================================
// 🔹 Middleware
// =======================================================
app.use(cors());
app.use(express.json({ limit: "15mb" }));

// =======================================================
// 🔹 HEALTH CHECK
// =======================================================
console.log('🔹 Registering /health endpoint...');
app.get('/health', (req, res) => {
  console.log('✅ Health endpoint called!');
  let mongoConnected = false;
  try {
    const { getMongoClient } = require('./services/mongoClient');
    mongoConnected = !!getMongoClient();
  } catch (_) {
    /* optional module */
  }
  res.json({
    status: 'healthy',
    service: 'MicroTrainer Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mongoConnected
  });
});


// =======================================================
// 🔐 ACCESS CONTROL (trainer key + student self-only)
// =======================================================
const {
  trainerOnly,
  studentSelfOrTrainer,
} = require("./middleware/accessControl");
const {
  getStudentSyncStatus,
  getAllSyncStatuses,
} = require("./services/syncStatusService");


// =======================================================
// 🔹 Health Check
// =======================================================
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "Micro Trainer Backend",
    time: new Date().toISOString()
  });
});

app.get("/api/sync/status/:studentId", studentSelfOrTrainer, (req, res) => {
  try {
    res.json(getStudentSyncStatus(req.params.studentId));
  } catch (error) {
    console.error("SYNC STATUS ERROR:", error.message);
    res.status(500).json({ error: "Failed to get sync status" });
  }
});

app.get("/api/certificate/eligibility/:studentId", studentSelfOrTrainer, (req, res) => {
  try {
    const syncStatus = getStudentSyncStatus(req.params.studentId);
    res.json({
      studentId: req.params.studentId,
      eligible: syncStatus.officialBenefitsEnabled,
      reason: syncStatus.officialBenefitsEnabled
        ? "Official sync is connected."
        : "Certificates require recent official progress sync.",
      syncStatus,
    });
  } catch (error) {
    console.error("CERTIFICATE ELIGIBILITY ERROR:", error.message);
    res.status(500).json({ error: "Failed to get certificate eligibility" });
  }
});

app.get("/trainer/sync-status", trainerOnly, (req, res) => {
  try {
    const statuses = getAllSyncStatuses();
    res.json({
      statuses,
      count: statuses.length,
      disconnected: statuses.filter((status) => !status.officialBenefitsEnabled).length,
    });
  } catch (error) {
    console.error("TRAINER SYNC STATUS ERROR:", error.message);
    res.status(500).json({ error: "Failed to get sync statuses" });
  }
});


// =======================================================
// 🔹 TEACHING MODE (ADAPTIVE)
// =======================================================
const { adaptiveTeach } = require("./services/adaptiveTeachingService");
const { CODE_SNIPPET_RULES_CHAT } = require("./services/personaConfig");
const { saveStudentLevel, getStudentLevel } = require("./services/memoryService");
const {
  logAskTopic,
  logAskQuickCheck,
  logChatQuestion,
  logCodingProblem,
  logMiniAssessment,
} = require("./services/studentLearningLedgerService");
const {
  buildStudentReadiness,
  getAllStudentsReadiness,
} = require("./services/technologyReadinessService");

// Teaching sessions storage (in-memory for now)
const teachingSessions = {};

app.post("/ask", async (req, res) => {
  try {
    const { 
      question, 
      answer, 
      sessionId, 
      level,
      studentId // NEW: Track student
    } = req.body;

    const hasQuestion = question && typeof question === "string";
    const hasAnswer = answer && typeof answer === "string";

    if (!hasQuestion && !hasAnswer) {
      return res.status(400).json({ error: "Question or answer is required" });
    }

    // Get or create session
    const sid = sessionId || "session_" + Date.now();
    if (!teachingSessions[sid]) {
      if (!hasQuestion) {
        return res.status(400).json({
          error: "Session expired. Please start a new topic and try again.",
        });
      }
      teachingSessions[sid] = {
        history: [],
        level: null,
        concept: null,
        studentId: studentId || "anonymous"
      };
    }

    const session = teachingSessions[sid];

    // Quick Check: frontend sends answer only — use concept stored from first message
    const concept = hasQuestion ? question : session.concept;
    if (!concept) {
      return res.status(400).json({
        error: "Session expired. Please start a new topic and try again.",
      });
    }

    if (hasQuestion) {
      session.concept = question;
    }

    // If student has a saved level, use it
    let detectedLevel = level || session.level;
    if (studentId && !detectedLevel) {
      detectedLevel = getStudentLevel(studentId);
      if (detectedLevel) {
        console.log(`📚 Retrieved saved level for ${studentId}: ${detectedLevel}`);
      }
    }

    // Adaptive teaching
    const result = await adaptiveTeach({
      concept,
      studentAnswer: hasAnswer ? answer : null,
      conversationHistory: session.history,
      detectedLevel: detectedLevel
    });

    // Update session
    if (result.level) {
      session.level = result.level;
      
      // Save level to persistent memory
      if (studentId) {
        saveStudentLevel(studentId, result.level);
      }
    }
    
    session.history.push({
      role: "user",
      content: hasAnswer ? answer : question
    });
    
    session.history.push({
      role: "assistant",
      content: result.explanation
    });

    const ledgerStudentId = studentId || session.studentId;
    if (ledgerStudentId && ledgerStudentId !== "anonymous") {
      try {
        if (hasQuestion) {
          logAskTopic({ studentId: ledgerStudentId, topic: concept });
        } else if (hasAnswer) {
          logAskQuickCheck({
            studentId: ledgerStudentId,
            topic: concept,
            level: result.level || session.level,
          });
        }
      } catch (ledgerErr) {
        console.error("Ledger ask log error:", ledgerErr.message);
      }
    }

    return res.json({
      sessionId: sid,
      explanation: result.explanation,
      crossQuestion: result.crossQuestion,
      level: result.level,
      awaitingLevelDetection: result.awaitingLevelDetection
    });

  } catch (error) {
    console.error("ASK ERROR:", error.message);
    res.status(500).json({ error: "Failed to process request" });
  }
});


// =======================================================
// 🔹 CHAT WITH MICROTRAINER (HOME PAGE)
// =======================================================

// Chat sessions storage (in-memory)
const chatSessions = {};

app.post("/chat/ask", async (req, res) => {
  try {
    const { question, sessionId, studentId } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required" });
    }

    if (question.length > 500) {
      return res.status(400).json({ error: "Question too long (max 500 characters)" });
    }

    // Get or create session
    const sid = sessionId || "chat_" + Date.now();
    if (!chatSessions[sid]) {
      chatSessions[sid] = {
        history: [],
        questionCount: 0,
        createdAt: Date.now()
      };
    }

    const session = chatSessions[sid];

    // Rate limiting: max 20 questions per session
    if (session.questionCount >= 20) {
      return res.status(429).json({ 
        error: "You've asked 20 questions! Time to start an interview and put your knowledge to the test! 🚀" 
      });
    }

    // Build conversation history
    const messages = [
      {
        role: "system",
        content: `You are MicroTrainer, a friendly AI interview coach helping students prepare for technical interviews.

Your role:
- Answer questions about interview preparation
- Explain technical concepts clearly and concisely
- Provide career guidance
- Help students understand the platform

Available interview types:
- MERN Stack Developer (MongoDB, Express, React, Node.js)
- Java Full Stack Developer (Spring Boot, Hibernate, React/Angular)
- Python Full Stack Developer (Django/Flask, PostgreSQL, React)
- Data Analyst (SQL, Excel, dashboards, A/B testing, storytelling)
- ML Engineer (ML, deployment, MLOps, LLMs, pipelines)
- Data Scientist / Data Science (general mix of analytics + ML)
- AI / ML Master (535-question bank: Python, stats, ML, DL, LLMs, RAG, agents, MLOps, system design)
- Individual technologies: React, JavaScript, Java, Python, SQL, Node.js, Angular, TypeScript
- Problem Solving & DSA (Algorithms, Data Structures)

Guidelines:
- Be concise (1-2 short paragraphs max, ~120-150 words)
- When explaining technical concepts, include ONE small fenced code snippet (3-6 lines)
- Be encouraging and supportive
- Suggest starting an interview when relevant
- Use simple, clear language
- Format responses with markdown (bold, lists, code blocks)
- If asked about platform features: scoring system tracks correctness, completeness, clarity, and code quality

${CODE_SNIPPET_RULES_CHAT}

Don't:
- Give overly long explanations
- Use complex jargon without explanation
- Discourage students
- Provide incorrect information`
      },
      ...session.history.slice(-6), // Last 3 exchanges
      {
        role: "user",
        content: question
      }
    ];

    // Call GROQ API
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: messages,
        temperature: 0.7,
        max_tokens: 650
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    const answer = response?.data?.choices?.[0]?.message?.content || "I'm having trouble responding right now. Please try again.";

    // Update session
    session.history.push({ role: "user", content: question });
    session.history.push({ role: "assistant", content: answer });
    session.questionCount++;

    if (studentId && studentId !== "anonymous") {
      try {
        logChatQuestion({ studentId, topic: question });
      } catch (ledgerErr) {
        console.error("Ledger chat log error:", ledgerErr.message);
      }
    }

    return res.json({
      sessionId: sid,
      answer: answer,
      questionCount: session.questionCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("CHAT ERROR:", error.message);
    
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return res.status(504).json({ 
        error: "This is taking longer than expected. Please try again." 
      });
    }
    
    res.status(500).json({ 
      error: "I'm having trouble connecting. Please try again." 
    });
  }
});


// =======================================================
// 🔹 SINGLE INTERVIEW
// =======================================================
app.post("/interview", async (req, res) => {
  try {
    const { question, answer, subject, studentId } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        error: "Question and answer required"
      });
    }

    const feedback = await evaluateAnswer({
      question,
      answer,
      subject: subject || "General",
      studentId: studentId || "anonymous"
    });

    return res.json({
      feedback,
      time: new Date().toISOString()
    });

  } catch (error) {
    console.error("INTERVIEW ERROR:", error.message);
    res.status(500).json({ error: "Interview failed" });
  }
});


// =======================================================
// 🔹 SESSION FLOW
// =======================================================
app.post("/interview/start", async (req, res) => {
  try {
    const { subject, studentId, totalQuestions } = req.body;
    const questionCount = Math.min(
      30,
      Math.max(1, Number(totalQuestions) || 20)
    );

    const session = await createSession(
      subject || "General",
      questionCount,
      studentId || "anonymous"
    );

    return res.json(session);

  } catch (error) {
    console.error("START ERROR:", error.message);
    res.status(500).json({ error: "Failed to start interview" });
  }
});

app.post("/interview/answer", async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({
        error: "sessionId and answer required"
      });
    }

    const result = await submitAnswer(sessionId, answer);

    return res.json(result);

  } catch (error) {
    console.error("SESSION ERROR:", error.message);
    res.status(500).json({ error: "Session failed" });
  }
});

app.post("/interview/abandon", async (req, res) => {
  try {
    const { sessionId, reason } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId required" });
    }
    const { abandonSession } = require("./services/interviewSessionService");
    const result = abandonSession(
      sessionId,
      reason || "Student ended interview"
    );
    return res.json(result);
  } catch (error) {
    console.error("ABANDON INTERVIEW ERROR:", error.message);
    const status = error.message === "Invalid session ID" ? 404 : 500;
    res.status(status).json({ error: error.message || "Failed to end interview" });
  }
});


// =======================================================
// 🔹 STUDENT APIs
// =======================================================

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const { registerStudentProfile } = require("./services/studentProfileStore");

app.post("/auth/student-register", (req, res) => {
  try {
    const { studentId, name, initial, batch } = req.body || {};
    if (!studentId || !name || !initial || !batch) {
      return res.status(400).json({
        error: "studentId, name, initial, and batch are required",
      });
    }
    const profile = registerStudentProfile({ studentId, name, initial, batch });
    res.json(profile);
  } catch (error) {
    console.error("STUDENT REGISTER ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Legacy
app.get("/student/:studentId/report", studentSelfOrTrainer, async (req, res) => {
  try {
    const report = await getStudentReport(req.params.studentId);
    return res.json(report);
  } catch (error) {
    console.error("REPORT ERROR:", error.message);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// Analytics
app.get("/student/:studentId/analytics", studentSelfOrTrainer, async (req, res) => {
  try {
    const history = await getStudentHistory(req.params.studentId);
    const report = aggregateStudent(history);
    return res.json(report || EMPTY_STUDENT_ANALYTICS);
  } catch (error) {
    console.error("ANALYTICS ERROR:", error.message);
    res.status(500).json({ error: "Analytics failed" });
  }
});

// Memory (AI adaptation + dashboard stats)
app.get("/student/:studentId/interviews", studentSelfOrTrainer, (req, res) => {
  try {
    const { getInterviewsByStudent } = require("./services/interviewHistoryService");
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const interviews = getInterviewsByStudent(req.params.studentId, { limit });
    res.json({ interviews, count: interviews.length });
  } catch (error) {
    console.error("GET INTERVIEW HISTORY ERROR:", error.message);
    res.status(500).json({ error: "Failed to load interview history" });
  }
});

app.get("/student/:studentId/interviews/:sessionId", studentSelfOrTrainer, (req, res) => {
  try {
    const { getInterviewBySessionId } = require("./services/interviewHistoryService");
    const record = getInterviewBySessionId(req.params.sessionId);
    if (!record || record.studentId !== req.params.studentId) {
      return res.status(404).json({ error: "Interview not found" });
    }
    res.json(record);
  } catch (error) {
    console.error("GET INTERVIEW DETAIL ERROR:", error.message);
    res.status(500).json({ error: "Failed to load interview" });
  }
});

app.get("/student/:studentId/memory", studentSelfOrTrainer, async (req, res) => {
  try {
    const memory =
      (await getStudentMemoryFromSheets(req.params.studentId)) ||
      (await getStudentMemory(req.params.studentId));
    return res.json({ ...EMPTY_STUDENT_MEMORY, ...(memory || {}) });
  } catch (error) {
    console.error("MEMORY ERROR:", error.message);
    res.status(500).json({ error: "Memory fetch failed" });
  }
});

// Get student's teaching level
app.get("/student/:studentId/level", studentSelfOrTrainer, async (req, res) => {
  try {
    const level = getStudentLevel(req.params.studentId);
    return res.json({ 
      studentId: req.params.studentId,
      level: level,
      hasLevel: !!level
    });
  } catch (error) {
    console.error("LEVEL FETCH ERROR:", error.message);
    res.status(500).json({ error: "Level fetch failed" });
  }
});


// =======================================================
// 🔥 TRAINER-ONLY LEADERBOARD
// =======================================================

// 🏆 FULLSTACK LEADERBOARD
app.get("/trainer/leaderboard", trainerOnly, async (req, res) => {
  try {
    const data = await getLeaderboard();
    return res.json(data);
  } catch (error) {
    console.error("LEADERBOARD ERROR:", error.message);
    res.status(500).json({ error: "Leaderboard failed" });
  }
});


// 🧠 SUBJECT LEADERBOARD (React / Java / Python)
app.get("/trainer/leaderboard/:subject", trainerOnly, async (req, res) => {
  try {
    const { subject } = req.params;

    const data = await getLeaderboard(subject.toLowerCase());

    return res.json(data);
  } catch (error) {
    console.error("SUBJECT LEADERBOARD ERROR:", error.message);
    res.status(500).json({ error: "Subject leaderboard failed" });
  }
});

// =======================================================
// 👨‍🏫 TRAINER — Guided course (learning path) progress
// =======================================================
const {
  getAllStudentsLearningProgress,
  getMergedProgressForStudent,
} = require("./services/learningProgressTrainerService");
const {
  syncAllLocalProgressToSheets,
} = require("./services/learningProgressSheetsService");
const {
  getAllStudentsProgressRaw,
  enrichProgressForTechnology,
} = require("./services/learningPathService");

app.get("/trainer/learning-progress", trainerOnly, async (req, res) => {
  try {
    const students = await getAllStudentsLearningProgress();
    res.json({ students, count: students.length });
  } catch (error) {
    console.error("TRAINER LEARNING PROGRESS ERROR:", error.message);
    res.status(500).json({ error: "Failed to get learning progress" });
  }
});

app.get("/trainer/learning-progress/:studentId", trainerOnly, async (req, res) => {
  try {
    const { studentId } = req.params;
    const detail = await getMergedProgressForStudent(studentId);
    res.json(detail);
  } catch (error) {
    console.error("TRAINER STUDENT LEARNING PROGRESS ERROR:", error.message);
    res.status(500).json({ error: "Failed to get student learning progress" });
  }
});

app.post("/trainer/learning-progress/sync", trainerOnly, async (req, res) => {
  try {
    const result = await syncAllLocalProgressToSheets(
      getAllStudentsProgressRaw,
      enrichProgressForTechnology
    );
    res.json({
      success: true,
      message: `Synced ${result.synced} technology records for ${result.students} students`,
      ...result,
    });
  } catch (error) {
    console.error("LEARNING PROGRESS SYNC ERROR:", error.message);
    res.status(500).json({
      error: "Failed to sync learning progress to Google Sheets",
      details: error.message,
    });
  }
});

app.get("/trainer/technology-readiness", trainerOnly, async (req, res) => {
  try {
    const data = await getAllStudentsReadiness();
    res.json(data);
  } catch (error) {
    console.error("TECHNOLOGY READINESS ERROR:", error.message);
    res.status(500).json({ error: "Failed to get technology readiness" });
  }
});

app.get("/trainer/technology-readiness/:studentId", trainerOnly, async (req, res) => {
  try {
    const detail = await buildStudentReadiness(req.params.studentId);
    res.json(detail);
  } catch (error) {
    console.error("STUDENT TECHNOLOGY READINESS ERROR:", error.message);
    res.status(500).json({ error: "Failed to get student technology readiness" });
  }
});

const {
  syncAllReadinessToSheets,
  syncStudentReadinessToSheets,
} = require("./services/technologyReadinessSheetsService");

app.post("/trainer/technology-readiness/sync", trainerOnly, async (req, res) => {
  try {
    const result = await syncAllReadinessToSheets();
    res.json({
      success: true,
      message: `Synced ${result.synced} technology readiness rows for ${result.students} students`,
      ...result,
    });
  } catch (error) {
    console.error("TECHNOLOGY READINESS SYNC ERROR:", error.message);
    res.status(500).json({
      error: "Failed to sync technology readiness to Google Sheets",
      details: error.message,
    });
  }
});

app.post("/trainer/technology-readiness/sync/:studentId", trainerOnly, async (req, res) => {
  try {
    const result = await syncStudentReadinessToSheets(req.params.studentId);
    res.json({
      success: result.success,
      message: result.success
        ? `Synced ${result.synced} technologies for ${req.params.studentId}`
        : "No assessed technologies to sync",
      ...result,
    });
  } catch (error) {
    console.error("STUDENT READINESS SYNC ERROR:", error.message);
    res.status(500).json({
      error: "Failed to sync student technology readiness",
      details: error.message,
    });
  }
});


// =======================================================
// 🔹 DASHBOARD APIs
// =======================================================
app.get("/dashboard/overview", async (req, res) => {
  try {
    const data = await getOverview();
    return res.json(data);
  } catch (error) {
    console.error("OVERVIEW ERROR:", error.message);
    res.status(500).json({ error: "Overview failed" });
  }
});

app.get("/dashboard/weak-students", async (req, res) => {
  try {
    const data = await getWeakStudents();
    return res.json(data);
  } catch (error) {
    console.error("WEAK STUDENTS ERROR:", error.message);
    res.status(500).json({ error: "Weak students failed" });
  }
});

app.get("/dashboard/trends", async (req, res) => {
  try {
    const data = await getTrends();
    return res.json(data);
  } catch (error) {
    console.error("TRENDS ERROR:", error.message);
    res.status(500).json({ error: "Trends failed" });
  }
});


// =======================================================
// 🔹 PROBLEM SOLVING APIs
// =======================================================

// Get random problem
app.get("/problems/random", async (req, res) => {
  try {
    const { difficulty, category } = req.query;
    const problem = getRandomProblem(difficulty, category);
    
    if (!problem) {
      return res.status(404).json({ error: "No problem found" });
    }
    
    return res.json(problem);
  } catch (error) {
    console.error("RANDOM PROBLEM ERROR:", error.message);
    res.status(500).json({ error: "Failed to fetch problem" });
  }
});

// Get problem by ID
app.get("/problems/:id", async (req, res) => {
  try {
    const problem = getProblemById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    
    return res.json(problem);
  } catch (error) {
    console.error("GET PROBLEM ERROR:", error.message);
    res.status(500).json({ error: "Failed to fetch problem" });
  }
});

// Get problems by difficulty
app.get("/problems/difficulty/:level", async (req, res) => {
  try {
    const problems = getProblemsByDifficulty(req.params.level);
    return res.json({ problems, count: problems.length });
  } catch (error) {
    console.error("GET PROBLEMS ERROR:", error.message);
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

// Get all problems
app.get("/problems", async (req, res) => {
  try {
    const problems = getAllProblems();
    return res.json({ problems, count: problems.length });
  } catch (error) {
    console.error("GET ALL PROBLEMS ERROR:", error.message);
    res.status(500).json({ error: "Failed to fetch problems" });
  }
});

// Get problem statistics
app.get("/problems/stats/all", async (req, res) => {
  try {
    const stats = getProblemStats();
    return res.json(stats);
  } catch (error) {
    console.error("PROBLEM STATS ERROR:", error.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Get code template
app.get("/code/template/:language", async (req, res) => {
  try {
    const { language } = req.params;
    const { problemId } = req.query;
    
    const template = getCodeTemplate(language, problemId);
    if (!template) {
      return res.status(400).json({
        error: "Unsupported language. Use javascript, python, or java.",
      });
    }
    return res.json({ template, language });
  } catch (error) {
    console.error("TEMPLATE ERROR:", error.message);
    res.status(500).json({ error: "Failed to fetch template" });
  }
});


// =======================================================
// 🔹 CODE EXECUTION APIs
// =======================================================

// Execute code — mode "run" = single raw execution; mode "judge" = all testcases
app.post("/code/execute", async (req, res) => {
  try {
    const { language, code, testCases, timeout, mode, input } = req.body;

    console.log("BODY:", req.body);
    console.log("📥 POST /code/execute", {
      language,
      mode: mode || "judge",
      testCaseCount: testCases?.length,
    });

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        error: "Language and code are required",
        passedTests: 0,
        totalTests: 0,
        failedTests: [],
      });
    }

    const validation = validateCode(language, code);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: "Code validation failed",
        errors: validation.errors,
        passedTests: 0,
        totalTests: testCases?.length || 0,
        failedTests: [],
      });
    }

    const runTimeout = timeout || 3000;

    if (mode === "run") {
      const runInput =
        input !== undefined ? input : testCases?.[0]?.input ?? null;
      const result = await runCodeOnce(language, code, runInput, runTimeout);
      console.log("📤 /code/execute (run) response:", {
        success: result.success,
        exitCode: result.exitCode,
        stdoutLen: result.stdout?.length,
      });
      return res.json(result);
    }

    if (!testCases || testCases.length === 0) {
      return res.status(400).json(
        buildJudgeResponse({
          language,
          error: "At least one test case is required",
        })
      );
    }

    const result = await executeCode(language, code, testCases, runTimeout);
    console.log("📤 /code/execute (judge) response:", {
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      allPassed: result.allPassed,
    });
    return res.json(result);
  } catch (error) {
    console.error("CODE EXECUTION ERROR:", error.message);
    res.status(500).json(
      buildJudgeResponse({
        language: req.body?.language,
        totalTests: req.body?.testCases?.length || 0,
        error: error.message || "Code execution failed",
      })
    );
  }
});

// Validate code without executing
app.post("/code/validate", async (req, res) => {
  try {
    const { language, code } = req.body;
    
    if (!language || !code) {
      return res.status(400).json({
        error: "Language and code are required"
      });
    }
    
    const validation = validateCode(language, code);
    return res.json(validation);
    
  } catch (error) {
    console.error("CODE VALIDATION ERROR:", error.message);
    res.status(500).json({ error: "Validation failed" });
  }
});

// Submit solution for a problem (judge all testcases)
app.post("/problems/:id/submit", async (req, res) => {
  try {
    const { language, code, studentId } = req.body;
    const problemId = req.params.id;

    console.log("📥 POST /problems/:id/submit", {
      problemId,
      language,
      studentId: studentId || "anonymous",
      codeLength: code?.length,
    });

    const problem = getProblemById(problemId);
    if (!problem) {
      return res.status(404).json(
        buildJudgeResponse({
          language,
          error: "Problem not found",
        })
      );
    }

    const totalTests = problem.testCases?.length || 0;

    const validation = validateCode(language, code);
    if (!validation.valid) {
      return res.status(400).json({
        ...buildJudgeResponse({
          totalTests,
          language,
          error: "Code validation failed",
        }),
        errors: validation.errors,
      });
    }

    const result = await executeCode(
      language,
      code,
      problem.testCases,
      3000
    );

    const payload = {
      ...result,
      mode: "submit",
      problemId,
      studentId: studentId || "anonymous",
      submittedAt: new Date().toISOString(),
    };

    console.log("📤 Submit response:", {
      passedTests: payload.passedTests,
      totalTests: payload.totalTests,
      allPassed: payload.allPassed,
      score: payload.score,
    });

    if (studentId && studentId !== "anonymous") {
      try {
        logCodingProblem({
          studentId,
          language,
          problemId,
          topic: problem.title || problemId,
          score: payload.score,
          passed: payload.allPassed,
        });
      } catch (ledgerErr) {
        console.error("Ledger problem log error:", ledgerErr.message);
      }
    }

    return res.json(payload);
  } catch (error) {
    console.error("SUBMIT SOLUTION ERROR:", error.message);
    res.status(500).json(
      buildJudgeResponse({
        language: req.body?.language,
        error: error.message || "Submission failed",
      })
    );
  }
});

// Record browser-graded JS/Python submissions without server-side execution.
app.post("/problems/:id/browser-submit", async (req, res) => {
  try {
    const problemId = req.params.id;
    const { language, studentId, result } = req.body || {};
    const problem = getProblemById(problemId);

    if (!problem) {
      return res.status(404).json({ success: false, error: "Problem not found" });
    }

    if (!["javascript", "js", "python", "py"].includes(String(language).toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: "Browser submissions are supported only for JavaScript and Python",
      });
    }

    if (!result || typeof result !== "object") {
      return res.status(400).json({ success: false, error: "Result summary is required" });
    }

    const totalTests = problem.testCases?.length || 0;
    const passedTests = Math.max(0, Number(result.passedTests || 0));
    const submittedAt = new Date().toISOString();
    const payload = {
      success: true,
      mode: "submit",
      problemId,
      studentId: studentId || "anonymous",
      language,
      passedTests,
      totalTests,
      failedCount: Math.max(0, totalTests - passedTests),
      score:
        typeof result.score === "number"
          ? result.score
          : totalTests > 0
            ? (passedTests / totalTests) * 100
            : 0,
      allPassed: totalTests > 0 && passedTests === totalTests,
      executionMode: result.executionMode || "browser",
      submittedAt,
      trustedExecution: false,
    };

    const dataDir = path.join(__dirname, "data");
    fs.mkdirSync(dataDir, { recursive: true });
    fs.appendFileSync(
      path.join(dataDir, "browser-submissions.jsonl"),
      `${JSON.stringify(payload)}\n`,
      "utf8"
    );

    if (studentId && studentId !== "anonymous") {
      try {
        logCodingProblem({
          studentId,
          language,
          problemId,
          topic: problem.title || problemId,
          score: payload.score,
          passed: payload.allPassed,
        });
      } catch (ledgerErr) {
        console.error("Ledger browser-submit log error:", ledgerErr.message);
      }
    }

    return res.json(payload);
  } catch (error) {
    console.error("BROWSER SUBMIT RECORD ERROR:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to record browser submission",
    });
  }
});


// =======================================================
// 🔒 ANTI-CHEAT ENDPOINTS
// =======================================================
const antiCheatService = require("./services/antiCheatService");

// Create anti-cheat session
app.post("/anticheat/session", (req, res) => {
  try {
    const { sessionId, studentId, subject } = req.body;
    
    if (!sessionId || !studentId || !subject) {
      return res.status(400).json({ error: "sessionId, studentId, and subject required" });
    }
    
    const session = antiCheatService.createAntiCheatSession(sessionId, studentId, subject);
    return res.json(session);
  } catch (error) {
    console.error("CREATE ANTICHEAT SESSION ERROR:", error.message);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Log event
app.post("/anticheat/event", (req, res) => {
  try {
    const { sessionId, eventType, details } = req.body;
    
    if (!sessionId || !eventType) {
      return res.status(400).json({ error: "sessionId and eventType required" });
    }
    
    antiCheatService.logEvent(sessionId, eventType, details || {});
    return res.json({ success: true });
  } catch (error) {
    console.error("LOG EVENT ERROR:", error.message);
    res.status(500).json({ error: "Failed to log event" });
  }
});

// Update suspicion score
app.post("/anticheat/suspicion", (req, res) => {
  try {
    const { sessionId, points, reason } = req.body;
    
    if (!sessionId || points === undefined) {
      return res.status(400).json({ error: "sessionId and points required" });
    }
    
    antiCheatService.updateSuspicionScore(sessionId, points, reason || "");
    return res.json({ success: true });
  } catch (error) {
    console.error("UPDATE SUSPICION ERROR:", error.message);
    res.status(500).json({ error: "Failed to update suspicion" });
  }
});

// Increment warning
app.post("/anticheat/warning", (req, res) => {
  try {
    const { sessionId, reason } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId required" });
    }
    
    antiCheatService.incrementWarning(sessionId, reason || "");
    return res.json({ success: true });
  } catch (error) {
    console.error("INCREMENT WARNING ERROR:", error.message);
    res.status(500).json({ error: "Failed to increment warning" });
  }
});

// Dismiss session
app.post("/anticheat/dismiss", (req, res) => {
  try {
    const { sessionId, reason } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId required" });
    }

    antiCheatService.dismissSession(sessionId, reason || "");

    const {
      getActiveSession,
      removeActiveSession,
    } = require("./services/interviewSessionService");
    const { recordInterviewSession } = require("./services/interviewHistoryService");

    const anticheat = antiCheatService.getSession(sessionId);
    const interview = getActiveSession(sessionId);

    if (anticheat) {
      recordInterviewSession({
        sessionId,
        studentId: anticheat.studentId,
        subject: anticheat.subject,
        status: "dismissed",
        history: interview?.history || [],
        anticheat,
        dismissalReason: reason || anticheat.dismissalReason,
        startedAt: interview?.startedAt || anticheat.startTime,
      });
      if (interview) {
        removeActiveSession(sessionId);
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("DISMISS SESSION ERROR:", error.message);
    res.status(500).json({ error: "Failed to dismiss session" });
  }
});

// Complete session
app.post("/anticheat/complete", (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId required" });
    }
    
    antiCheatService.completeSession(sessionId);
    return res.json({ success: true });
  } catch (error) {
    console.error("COMPLETE SESSION ERROR:", error.message);
    res.status(500).json({ error: "Failed to complete session" });
  }
});

// Get all sessions (Admin Dashboard)
app.get("/anticheat/sessions", (req, res) => {
  try {
    const sessions = antiCheatService.getAllSessions();
    return res.json(sessions);
  } catch (error) {
    console.error("GET SESSIONS ERROR:", error.message);
    res.status(500).json({ error: "Failed to get sessions" });
  }
});

// Get session by ID
app.get("/anticheat/session/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = antiCheatService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    return res.json(session);
  } catch (error) {
    console.error("GET SESSION ERROR:", error.message);
    res.status(500).json({ error: "Failed to get session" });
  }
});

// Get sessions by status
app.get("/anticheat/sessions/status/:status", (req, res) => {
  try {
    const { status } = req.params;
    const sessions = antiCheatService.getSessionsByStatus(status);
    return res.json(sessions);
  } catch (error) {
    console.error("GET SESSIONS BY STATUS ERROR:", error.message);
    res.status(500).json({ error: "Failed to get sessions" });
  }
});

// Update question progress
app.post("/anticheat/progress", (req, res) => {
  try {
    const { sessionId, currentQuestion, totalQuestions } = req.body;
    
    if (!sessionId || currentQuestion === undefined || totalQuestions === undefined) {
      return res.status(400).json({ error: "sessionId, currentQuestion, and totalQuestions required" });
    }
    
    antiCheatService.updateQuestionProgress(sessionId, currentQuestion, totalQuestions);
    return res.json({ success: true });
  } catch (error) {
    console.error("UPDATE PROGRESS ERROR:", error.message);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// =======================================================
// 🎯 STUDENT PROFILE ENDPOINTS (NEW)
// =======================================================
const {
  addTechnologyInterview,
  addProblemSolvingResult,
  getStudentProfile,
  getLeaderboard: getProfileLeaderboard,
  getLevelDescription
} = require("./services/studentProfileService");

// =======================================================
// 📚 LEARNING PATH ENDPOINTS (NEW)
// =======================================================
const {
  getAvailableTechnologies,
  getCurriculum
} = require("./services/curriculumService");

const {
  startLearningPath,
  getCurrentConceptTeaching,
  submitConceptAnswers,
  getStudentProgress,
  getAllStudentProgress
} = require("./services/learningPathService");

// Get available technologies for structured learning
app.get("/learning-path/technologies", (req, res) => {
  try {
    const technologies = getAvailableTechnologies();
    if (!technologies.length) {
      return res.status(503).json({
        error: "No guided courses are configured on this server",
        hint: "Add curriculum JSON files under microtrainer-backend/data/curriculums and redeploy",
        technologies: [],
      });
    }
    res.json(technologies);
  } catch (error) {
    console.error("GET TECHNOLOGIES ERROR:", error.message);
    res.status(500).json({ error: "Failed to get technologies" });
  }
});

// Get curriculum for a technology
app.get("/learning-path/curriculum/:technology", (req, res) => {
  try {
    const { technology } = req.params;
    const curriculum = getCurriculum(technology);
    res.json(curriculum);
  } catch (error) {
    console.error("GET CURRICULUM ERROR:", error.message);
    res.status(404).json({ error: error.message });
  }
});

// Start a learning path session
app.post("/learning-path/start", (req, res) => {
  try {
    const { studentId, technology, conceptOrder } = req.body;
    
    console.log(`🚀 POST /learning-path/start - studentId: ${studentId}, technology: ${technology}, conceptOrder: ${conceptOrder ?? "default"}`);
    
    if (!studentId || !technology) {
      return res.status(400).json({ error: "studentId and technology required" });
    }

    const requestedOrder = Number(conceptOrder || 1);
    if (
      process.env.TRAINER_BATCH_UNLOCK_REQUIRES_SYNC === "1" &&
      requestedOrder > 1 &&
      !getStudentSyncStatus(studentId).officialBenefitsEnabled
    ) {
      return res.status(423).json({
        error: "Official progress sync required",
        message:
          "Trainer-managed lessons after Lesson 1 require recent official progress sync.",
        syncStatus: getStudentSyncStatus(studentId),
      });
    }
    
    const session = startLearningPath(studentId, technology, conceptOrder);
    console.log(`✅ Session created: ${session.sessionId}`);
    res.json(session);
  } catch (error) {
    console.error("START LEARNING PATH ERROR:", error.message);
    res.status(500).json({ error: "Failed to start learning path" });
  }
});

// Test Groq API connection (for debugging)
app.get("/health/groq", async (req, res) => {
  try {
    const { testGroqConnection } = require("./services/groqClient");
    const result = await testGroqConnection();
    res.json({ status: "ok", ...result });
  } catch (error) {
    res.status(503).json({ status: "error", message: error.message });
  }
});

// Get current concept teaching content
app.get("/learning-path/concept/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { studentLevel, useAI, reteach } = req.query;
    
    const useAIQuestions = useAI === 'true';
    const isReteach = reteach === 'true';
    
    console.log(`📖 GET /learning-path/concept/${sessionId} level: ${studentLevel}, reteach: ${isReteach}`);
    
    const teaching = await getCurrentConceptTeaching(sessionId, studentLevel, useAIQuestions, isReteach);
    res.json(teaching);
  } catch (error) {
    console.error("GET CONCEPT ERROR:", error.message);
    if (error.isRateLimit) {
      return res.status(429).json({
        error: error.message,
        code: "GROQ_RATE_LIMIT",
        retryAfterMs: error.retryAfterMs || 20000,
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// Simplify current Quick Check question (same concept, easier wording)
app.post("/learning-path/simplify-question", async (req, res) => {
  try {
    const { sessionId, questionIndex } = req.body;
    if (!sessionId || questionIndex === undefined) {
      return res.status(400).json({ error: "sessionId and questionIndex required" });
    }

    const { simplifyQuestionForSession } = require("./services/learningPathService");
    const result = await simplifyQuestionForSession(sessionId, questionIndex);
    res.json(result);
  } catch (error) {
    console.error("SIMPLIFY QUESTION ERROR:", error.message);
    if (error.code === "SIMPLIFY_LIMIT") {
      return res.status(400).json({ error: error.message, code: error.code });
    }
    if (error.isRateLimit) {
      return res.status(429).json({
        error: error.message,
        code: "GROQ_RATE_LIMIT",
        retryAfterMs: error.retryAfterMs || 20000,
      });
    }
    res.status(500).json({ error: error.message || "Failed to simplify question" });
  }
});

// Submit concept answers for assessment
app.post("/learning-path/submit", async (req, res) => {
  try {
    const { sessionId, answers } = req.body;
    
    console.log(`📥 Received submit request:`, { sessionId, answerCount: answers?.length });
    
    if (!sessionId || !answers || !Array.isArray(answers)) {
      console.error(`❌ Invalid request: sessionId=${sessionId}, answers=${answers}`);
      return res.status(400).json({ error: "sessionId and answers array required" });
    }
    
    const result = await submitConceptAnswers(sessionId, answers);
    console.log(`✅ Assessment complete:`, result);
    res.json(result);
  } catch (error) {
    console.error("❌ SUBMIT ANSWERS ERROR:", error.message);
    console.error("Stack trace:", error.stack);
    const isSessionMissing = /session not found/i.test(error.message || "");
    res.status(isSessionMissing ? 404 : 500).json({
      error: isSessionMissing
        ? "Your lesson session expired. Go back and open the concept again."
        : "Failed to submit answers",
      details: error.message,
      code: isSessionMissing ? "SESSION_EXPIRED" : "SUBMIT_FAILED",
    });
  }
});

// Get student progress for a technology
app.get("/learning-path/progress/:studentId/:technology", studentSelfOrTrainer, (req, res) => {
  try {
    const { studentId, technology } = req.params;
    const progress = getStudentProgress(studentId, technology);
    res.json(progress);
  } catch (error) {
    console.error("GET PROGRESS ERROR:", error.message);
    res.status(500).json({ error: "Failed to get progress" });
  }
});

// Get all student progress across technologies
app.get("/learning-path/progress/:studentId", studentSelfOrTrainer, (req, res) => {
  try {
    const { studentId } = req.params;
    const progress = getAllStudentProgress(studentId);
    res.json(progress);
  } catch (error) {
    console.error("GET ALL PROGRESS ERROR:", error.message);
    res.status(500).json({ error: "Failed to get progress" });
  }
});

// =======================================================
// 📅 PERSONAL SCHEDULE (interview roadmap)
// =======================================================
const {
  getCategoryList,
  getTechOptionsForCategory,
  setCategory: setScheduleCategory,
  setDeclaredSkills: setScheduleSkills,
  recordDiagnosticResult,
  generatePlan: generatePersonalPlan,
  completeTask: completeScheduleTask,
  getTodayPlan,
  checkAndBuildReminder,
  sendScheduleReminder,
  resetSchedule,
  publicView: publicScheduleView,
  DIAGNOSTIC_QUESTIONS_PER_TECH,
} = require("./services/personalScheduleService");
const { getSchedule: getStoredSchedule } = require("./services/personalScheduleStore");

// =======================================================
// 🤖 AI / ML MASTER INTERVIEW BANK (535 questions)
// =======================================================
const {
  getBankMeta,
  getSections: getAiMlBankSections,
  getTierCounts,
} = require("./services/aiMlQuestionBank");

app.get("/api/ai-ml-bank/meta", (req, res) => {
  try {
    res.json({
      meta: getBankMeta(),
      sections: getAiMlBankSections(),
      tierCounts: getTierCounts(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/personal-schedule/categories", (req, res) => {
  try {
    res.json({ categories: getCategoryList() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/personal-schedule/tech-options/:category", (req, res) => {
  try {
    res.json({ technologies: getTechOptionsForCategory(req.params.category) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/personal-schedule/:studentId", studentSelfOrTrainer, (req, res) => {
  try {
    const { studentId } = req.params;
    const schedule = getStoredSchedule(studentId);
    res.json({
      schedule: schedule ? publicScheduleView(schedule) : null,
      diagnosticQuestionsPerTech: DIAGNOSTIC_QUESTIONS_PER_TECH,
    });
  } catch (error) {
    console.error("GET PERSONAL SCHEDULE ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/personal-schedule/:studentId/category", studentSelfOrTrainer, (req, res) => {
  try {
    const { category } = req.body;
    const result = setScheduleCategory(req.params.studentId, category);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/personal-schedule/:studentId/skills", studentSelfOrTrainer, (req, res) => {
  try {
    const result = setScheduleSkills(req.params.studentId, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/personal-schedule/:studentId/diagnostic", studentSelfOrTrainer, (req, res) => {
  try {
    const result = recordDiagnosticResult(req.params.studentId, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/personal-schedule/:studentId/generate", studentSelfOrTrainer, async (req, res) => {
  try {
    const result = await generatePersonalPlan(req.params.studentId);
    res.json(result);
  } catch (error) {
    console.error("GENERATE PLAN ERROR:", error.message);
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/personal-schedule/:studentId/complete-task", studentSelfOrTrainer, (req, res) => {
  try {
    const result = completeScheduleTask(req.params.studentId, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/personal-schedule/:studentId/today", studentSelfOrTrainer, (req, res) => {
  try {
    const result = getTodayPlan(req.params.studentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/personal-schedule/:studentId/reminder", studentSelfOrTrainer, async (req, res) => {
  try {
    const preview = checkAndBuildReminder(req.params.studentId);
    const sent = await sendScheduleReminder(req.params.studentId);
    res.json({ preview, ...sent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/personal-schedule/:studentId/reset", studentSelfOrTrainer, (req, res) => {
  try {
    const schedule = resetSchedule(req.params.studentId);
    res.json({ schedule: publicScheduleView(schedule) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student profile
app.get("/profile/:studentId", (req, res) => {
  try {
    const { studentId } = req.params;
    const profile = getStudentProfile(studentId);
    
    if (!profile) {
      return res.json({
        studentId,
        message: "No profile found. Start practicing to build your profile!"
      });
    }
    
    // Add level descriptions
    profile.technologyLevelInfo = getLevelDescription(profile.technologyLevel, 'technology');
    profile.problemSolvingLevelInfo = getLevelDescription(profile.problemSolvingLevel, 'problemSolving');
    
    res.json(profile);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error.message);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

// Get leaderboard with combined scores
app.get("/leaderboard/combined", (req, res) => {
  try {
    const { sortBy } = req.query; // 'overall', 'technology', 'problemSolving'
    const leaderboard = getProfileLeaderboard(sortBy || 'overall');
    
    res.json(leaderboard);
  } catch (error) {
    console.error("GET LEADERBOARD ERROR:", error.message);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});

// =======================================================
// 📊 EXPORT STUDENT STATUS TO GOOGLE SHEETS
// =======================================================
const {
  exportStudentStatus,
  exportSubjectStatus,
  scheduleAutoExport
} = require("./services/exportStudentStatusService");

// Export current student status to Google Sheets
app.post("/admin/export-status", trainerOnly, async (req, res) => {
  try {
    console.log("📊 Export student status requested");
    const result = await exportStudentStatus();
    
    res.json({
      success: true,
      message: "Student status exported successfully",
      ...result
    });
  } catch (error) {
    console.error("EXPORT STATUS ERROR:", error.message);
    res.status(500).json({ 
      error: "Failed to export student status",
      details: error.message 
    });
  }
});

// Export subject-specific status
app.post("/admin/export-status/:subject", trainerOnly, async (req, res) => {
  try {
    const { subject } = req.params;
    console.log(`📊 Export ${subject} status requested`);
    
    const result = await exportSubjectStatus(subject);
    
    res.json({
      success: true,
      message: `${subject} status exported successfully`,
      ...result
    });
  } catch (error) {
    console.error(`EXPORT ${req.params.subject} STATUS ERROR:`, error.message);
    res.status(500).json({ 
      error: `Failed to export ${req.params.subject} status`,
      details: error.message 
    });
  }
});

// Get export status/info
app.get("/admin/export-info", trainerOnly, (req, res) => {
  res.json({
    available: true,
    endpoints: {
      exportAll: "POST /admin/export-status",
      exportSubject: "POST /admin/export-status/:subject"
    },
    subjects: ["react", "java", "python", "javascript", "nodejs", "angular", "typescript"],
    sheetId: process.env.SHEET_ID,
    summarySheetName: "Student_Status_Summary",
    description: "Export current student rankings and analytics to Google Sheets"
  });
});

// =======================================================
// 🎯 ENGAGEMENT & ASSESSMENT SYSTEM (NEW)
// =======================================================
const {
  recordActivity,
  getStudentStatus,
  getStudentStreak,
  calculateAllStreaks,
  getAllStudentsEngagement
} = require("./services/engagementService");

const {
  generateMiniAssessment,
  getTodayMiniAssessment,
  submitMiniAssessment,
  generateMockTest,
  submitMockTest
} = require("./services/assessmentService");

const {
  checkAndAwardBadges,
  getStudentBadges,
  getAllBadgeDefinitions
} = require("./services/badgeService");

const {
  getStudentDashboardAnalytics,
  getAdminStudentsList,
  getActivityFeed,
  getStudentDetail
} = require("./services/engagementAnalyticsService");

// Import event broadcaster for real-time updates
const {
  broadcastStatusUpdate,
  broadcastActivityCompleted,
  broadcastStreakUpdate,
  broadcastBadgeEarned,
  broadcastAtRiskAlert
} = require("./services/eventBroadcaster");
const { notifyBadgeEarned, notifyAssessmentAvailable } = require("./services/notificationOrchestratorService");

// ===== ENGAGEMENT ENDPOINTS =====

// Record student activity
app.post("/api/engagement/activity", (req, res) => {
  try {
    const { studentId, activityType, technology, conceptId, timeSpent, score } = req.body;
    
    if (!studentId || !activityType || !technology) {
      return res.status(400).json({ error: "studentId, activityType, and technology required" });
    }
    
    const result = recordActivity(studentId, activityType, technology, conceptId, timeSpent, score);
    
    // Check for new badges
    const badges = checkAndAwardBadges(studentId, {
      currentStreak: result.streak || 0,
      lastScore: score,
      totalActivities: result.todaySummary.activitiesCompleted
    });
    
    // Broadcast real-time updates
    broadcastStatusUpdate(studentId, {
      status: result.status,
      todaySummary: result.todaySummary
    });
    
    broadcastActivityCompleted(studentId, {
      activityType,
      technology,
      score,
      timeSpent
    });
    
    // Broadcast badge earned if any
    if (badges && badges.length > 0) {
      badges.forEach((badge) => {
        broadcastBadgeEarned(studentId, badge);
        notifyBadgeEarned(studentId, {
          badgeName: badge.name || badge.title || badge.badgeId,
          badgeIcon: badge.icon,
        }).catch((err) => console.warn("Badge notification:", err.message));
      });
    }
    
    // Check if student is at risk
    if (result.status === 'At_Risk') {
      broadcastAtRiskAlert(studentId, {
        status: result.status,
        lastActivity: new Date().toISOString()
      });
    }
    
    res.json({
      ...result,
      badgesEarned: badges
    });
  } catch (error) {
    console.error("RECORD ACTIVITY ERROR:", error.message);
    res.status(500).json({ error: "Failed to record activity" });
  }
});

// Get student engagement status
app.get("/api/engagement/status/:studentId", (req, res) => {
  try {
    const { studentId } = req.params;
    const status = getStudentStatus(studentId);
    res.json(status);
  } catch (error) {
    console.error("GET STATUS ERROR:", error.message);
    res.status(500).json({ error: "Failed to get status" });
  }
});

// Get student streak
app.get("/api/engagement/streak/:studentId", (req, res) => {
  try {
    const { studentId } = req.params;
    const streak = getStudentStreak(studentId);
    res.json(streak);
  } catch (error) {
    console.error("GET STREAK ERROR:", error.message);
    res.status(500).json({ error: "Failed to get streak" });
  }
});

// Calculate streaks (admin only - can be called manually or by cron)
app.post("/api/engagement/streak/calculate", trainerOnly, (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (studentId) {
      // Calculate for specific student
      const { updateStreak } = require("./services/engagementService");
      const streak = updateStreak(studentId);
      res.json({ studentsProcessed: 1, streaksUpdated: 1, streak });
    } else {
      // Calculate for all students
      const result = calculateAllStreaks();
      res.json(result);
    }
  } catch (error) {
    console.error("CALCULATE STREAKS ERROR:", error.message);
    res.status(500).json({ error: "Failed to calculate streaks" });
  }
});

// ===== ASSESSMENT ENDPOINTS =====

// Get today's mini-assessment
app.get("/api/assessment/mini-assessment/:studentId", (req, res) => {
  try {
    const { studentId } = req.params;
    const { technology } = req.query;
    
    if (!technology) {
      return res.status(400).json({ error: "technology query parameter required" });
    }
    
    const assessment = getTodayMiniAssessment(studentId, technology);

    if (assessment.isNew) {
      notifyAssessmentAvailable(studentId, { technology }).catch((err) =>
        console.warn("Assessment notification:", err.message)
      );
    }

    res.json(assessment);
  } catch (error) {
    console.error("GET MINI-ASSESSMENT ERROR:", error.message);
    res.status(500).json({ error: "Failed to get assessment" });
  }
});

// Submit mini-assessment
app.post("/api/assessment/mini-assessment/submit", async (req, res) => {
  try {
    const { assessmentId, studentId, answers, timeSpent } = req.body;
    
    if (!assessmentId || !studentId || !answers) {
      return res.status(400).json({ error: "assessmentId, studentId, and answers required" });
    }
    
    const result = await submitMiniAssessment(assessmentId, studentId, answers, timeSpent);
    
    // Record activity
    const activityResult = recordActivity(
      studentId,
      'mini_assessment',
      result.technology || 'General',
      null,
      timeSpent,
      result.score
    );

    try {
      logMiniAssessment({
        studentId,
        technology: result.technology || "general",
        topic: result.topic || result.technology || "mini assessment",
        score: result.score,
      });
    } catch (ledgerErr) {
      console.error("Ledger mini-assessment log error:", ledgerErr.message);
    }
    
    // Check for badges
    const badges = checkAndAwardBadges(studentId, {
      currentStreak: activityResult.streak || 0,
      lastScore: result.score,
      totalActivities: activityResult.todaySummary.activitiesCompleted
    });

    if (badges && badges.length > 0) {
      badges.forEach((badge) => {
        broadcastBadgeEarned(studentId, badge);
        notifyBadgeEarned(studentId, {
          badgeName: badge.name || badge.title || badge.badgeId,
          badgeIcon: badge.icon,
        }).catch((err) => console.warn("Badge notification:", err.message));
      });
    }
    
    res.json({
      ...result,
      badgesEarned: badges
    });
  } catch (error) {
    console.error("SUBMIT MINI-ASSESSMENT ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Generate on-demand assessment
app.post("/api/assessment/generate", (req, res) => {
  try {
    const { studentId, technology, conceptIds } = req.body;
    
    if (!studentId || !technology) {
      return res.status(400).json({ error: "studentId and technology required" });
    }
    
    const assessment = generateMiniAssessment(studentId, technology, conceptIds);
    res.json(assessment);
  } catch (error) {
    console.error("GENERATE ASSESSMENT ERROR:", error.message);
    res.status(500).json({ error: "Failed to generate assessment" });
  }
});

// Get mock test
app.get("/api/assessment/mock-test/:studentId", (req, res) => {
  try {
    const { studentId } = req.params;
    const { technologies } = req.query;
    
    const techArray = technologies ? technologies.split(',') : ['JavaScript'];
    const mockTest = generateMockTest(studentId, techArray);
    
    res.json(mockTest);
  } catch (error) {
    console.error("GET MOCK TEST ERROR:", error.message);
    res.status(500).json({ error: "Failed to get mock test" });
  }
});

// Submit mock test
app.post("/api/assessment/mock-test/submit", async (req, res) => {
  try {
    const { mockTestId, studentId, answers } = req.body;
    
    if (!mockTestId || !studentId || !answers) {
      return res.status(400).json({ error: "mockTestId, studentId, and answers required" });
    }
    
    const result = await submitMockTest(mockTestId, studentId, answers);
    res.json(result);
  } catch (error) {
    console.error("SUBMIT MOCK TEST ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===== BADGE ENDPOINTS =====

// Get student badges
app.get("/api/badges/:studentId", (req, res) => {
  try {
    const { studentId } = req.params;
    const badges = getStudentBadges(studentId);
    res.json({ badges });
  } catch (error) {
    console.error("GET BADGES ERROR:", error.message);
    res.status(500).json({ error: "Failed to get badges" });
  }
});

// Get all badge definitions
app.get("/api/badges/definitions/all", (req, res) => {
  try {
    const definitions = getAllBadgeDefinitions();
    res.json({ badges: definitions });
  } catch (error) {
    console.error("GET BADGE DEFINITIONS ERROR:", error.message);
    res.status(500).json({ error: "Failed to get badge definitions" });
  }
});

// ===== PUSH NOTIFICATION ENDPOINTS =====

const {
  subscribe: subscribePush,
  unsubscribe: unsubscribePush,
} = require('./services/pushNotificationService');
const { notifyTest } = require('./services/notificationOrchestratorService');
const { setBrowserNotificationsEnabled } = require('./services/notificationPreferencesService');

// ===== STUDENT FEEDBACK / BUG REPORTS =====
const { requireAuth, optionalAuth } = require("./routes/authRoutes");
const {
  submitFeedbackReport,
  getRecentFeedbackReports,
  resolveScreenshotPath,
} = require("./services/feedbackService");

app.post("/api/feedback", optionalAuth, async (req, res) => {
  try {
    const { message, pageUrl, pagePath, userAgent, screenshots } = req.body || {};
    const result = await submitFeedbackReport({
      authUser: req.authUser,
      req,
      message,
      pageUrl,
      pagePath,
      userAgent,
      screenshots,
    });
    res.json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) {
      console.error("FEEDBACK ERROR:", error.message);
    }
    res.status(status).json({
      error: error.message || "Failed to submit report",
    });
  }
});

app.get("/trainer/feedback/recent", trainerOnly, (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 15, 50);
    const reports = getRecentFeedbackReports(limit);
    res.json({ reports, count: reports.length });
  } catch (error) {
    console.error("GET FEEDBACK RECENT ERROR:", error.message);
    res.status(500).json({ error: "Failed to load reports" });
  }
});

app.get("/trainer/feedback/screenshot/:reportId/:screenshotId", trainerOnly, (req, res) => {
  try {
    const filePath = resolveScreenshotPath(
      req.params.reportId,
      req.params.screenshotId
    );
    if (!filePath) {
      return res.status(404).json({ error: "Screenshot not found" });
    }
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error("FEEDBACK SCREENSHOT ERROR:", error.message);
    res.status(500).json({ error: "Failed to load screenshot" });
  }
});

// Subscribe to push notifications
app.post("/api/notifications/subscribe", (req, res) => {
  try {
    const { studentId, subscription } = req.body;
    
    if (!studentId || !subscription) {
      return res.status(400).json({ error: "studentId and subscription required" });
    }
    
    subscribePush(studentId, subscription);
    setBrowserNotificationsEnabled(studentId, true);
    res.json({ success: true, message: "Subscribed to push notifications" });
  } catch (error) {
    console.error("SUBSCRIBE PUSH ERROR:", error.message);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// Unsubscribe from push notifications
app.post("/api/notifications/unsubscribe", (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ error: "studentId required" });
    }
    
    unsubscribePush(studentId);
    setBrowserNotificationsEnabled(studentId, false);
    res.json({ success: true, message: "Unsubscribed from push notifications" });
  } catch (error) {
    console.error("UNSUBSCRIBE PUSH ERROR:", error.message);
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

// Send test notification
app.post("/api/notifications/test", async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ error: "studentId required" });
    }
    
    const result = await notifyTest(studentId);
    res.json(result);
  } catch (error) {
    console.error("TEST NOTIFICATION ERROR:", error.message);
    res.status(500).json({ error: "Failed to send test notification" });
  }
});

// Get notification preferences
app.get("/api/notifications/preferences/:studentId", (req, res) => {
  try {
    const { studentId } = req.params;
    const { getNotificationPreferences } = require('./services/notificationPreferencesService');
    
    const preferences = getNotificationPreferences(studentId);
    res.json(preferences);
  } catch (error) {
    console.error("GET PREFERENCES ERROR:", error.message);
    res.status(500).json({ error: "Failed to get preferences" });
  }
});

// Update notification preferences
app.put("/api/notifications/preferences/:studentId", (req, res) => {
  try {
    const { studentId } = req.params;
    const preferences = req.body;
    const { saveNotificationPreferences } = require('./services/notificationPreferencesService');
    
    saveNotificationPreferences(studentId, preferences);
    res.json({ success: true, message: "Preferences saved" });
  } catch (error) {
    console.error("SAVE PREFERENCES ERROR:", error.message);
    res.status(500).json({ error: "Failed to save preferences" });
  }
});

// ===== PROGRESS SHEET EXPORT ENDPOINTS =====

const {
  exportWithMetadata,
  getAvailableExports,
  getExportFile
} = require('./services/progressSheetExportService');

// Export student progress sheet
app.post("/api/export/progress", trainerOnly, (req, res) => {
  try {
    const { type, studentId, startDate, endDate } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: "Export type required" });
    }
    
    const result = exportWithMetadata(type, studentId || startDate, endDate);
    res.json(result);
  } catch (error) {
    console.error("EXPORT PROGRESS ERROR:", error.message);
    res.status(500).json({ error: "Failed to export progress sheet" });
  }
});

// Get available exports
app.get("/api/export/list", trainerOnly, (req, res) => {
  try {
    const exports = getAvailableExports();
    res.json({ exports });
  } catch (error) {
    console.error("LIST EXPORTS ERROR:", error.message);
    res.status(500).json({ error: "Failed to list exports" });
  }
});

// Download export file
app.get("/api/export/download/:filename", trainerOnly, (req, res) => {
  try {
    const { filename } = req.params;
    const { filepath, content } = getExportFile(filename);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  } catch (error) {
    console.error("DOWNLOAD EXPORT ERROR:", error.message);
    res.status(404).json({ error: "Export file not found" });
  }
});

// ===== ANALYTICS ENDPOINTS =====

// Get student dashboard analytics
app.get("/api/analytics/dashboard/:studentId", (req, res) => {
  try {
    const { studentId } = req.params;
    const analytics = getStudentDashboardAnalytics(studentId);
    res.json(analytics);
  } catch (error) {
    console.error("GET DASHBOARD ANALYTICS ERROR:", error.message);
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

// Get admin students list
app.get("/api/analytics/admin/students", trainerOnly, (req, res) => {
  try {
    const { filter, sortBy, limit, offset } = req.query;
    const result = getAdminStudentsList(
      filter,
      sortBy || 'last_activity',
      parseInt(limit) || 50,
      parseInt(offset) || 0
    );
    res.json(result);
  } catch (error) {
    console.error("GET ADMIN STUDENTS ERROR:", error.message);
    res.status(500).json({ error: "Failed to get students" });
  }
});

// Get activity feed
app.get("/api/analytics/admin/activity-feed", trainerOnly, (req, res) => {
  try {
    const { limit, since } = req.query;
    const activities = getActivityFeed(
      parseInt(limit) || 20,
      since
    );
    res.json({ activities });
  } catch (error) {
    console.error("GET ACTIVITY FEED ERROR:", error.message);
    res.status(500).json({ error: "Failed to get activity feed" });
  }
});

// Get student detail (for admin modal)
app.get("/api/analytics/admin/student/:studentId", trainerOnly, (req, res) => {
  try {
    const { studentId } = req.params;
    const detail = getStudentDetail(studentId);
    res.json(detail);
  } catch (error) {
    console.error("GET STUDENT DETAIL ERROR:", error.message);
    res.status(500).json({ error: "Failed to get student detail" });
  }
});

// =======================================================
// 🔹 SERVER START WITH SOCKET.IO
// =======================================================
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  
  // Handle authentication
  const { studentId, role } = socket.handshake.auth || {};
  
  if (studentId) {
    // Join student-specific room
    socket.join(`student:${studentId}`);
    console.log(`👤 Student ${studentId} joined their room`);
  }
  
  if (role === 'admin' || role === 'trainer') {
    // Join admin room for monitoring
    socket.join('admin');
    console.log(`👨‍💼 Admin joined monitoring room`);
  }
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
  
  // Handle ping for connection health
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Make io available globally for broadcasting events
global.io = io;

// Initialize cron jobs for background tasks
const { initializeCronJobs } = require('./services/cronJobs');
const { initOptionalMongo } = require('./services/mongoClient');

void initOptionalMongo().catch((e) =>
  console.warn('Optional MongoDB init:', e.message)
);

server.listen(PORT, async () => {
  console.log(`🚀 Micro Trainer Backend running on port ${PORT}`);
  console.log(`📊 Engagement & Assessment System: ACTIVE`);
  console.log(`🔌 WebSocket Server: ACTIVE`);

  await verifyGoogleSheetsSetup();

  // Initialize background jobs
  initializeCronJobs();
  
  // Optional: Enable auto-export every 60 minutes
  // Uncomment the line below to enable automatic exports
  // scheduleAutoExport(60);
});