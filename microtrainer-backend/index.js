const express = require("express");
const cors = require("cors");
require("dotenv").config();

// =======================================================
// 🔐 ENV VALIDATION (PREVENT SILENT FAILURES)
// =======================================================
if (!process.env.GROQ_API_KEY) {
  throw new Error("❌ MISSING: GROQ_API_KEY in environment variables");
}

if (!process.env.SHEET_ID) {
  throw new Error("❌ MISSING: SHEET_ID in environment variables");
}

console.log("✅ Environment variables validated");

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
const { getStudentHistory } = require("./services/readSheetsService");

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
app.use(express.json());


// =======================================================
// 🔐 SIMPLE TRAINER AUTH (UPGRADE LATER)
// =======================================================
function trainerOnly(req, res, next) {
  const role = req.headers.role;

  if (role !== "trainer") {
    return res.status(403).json({
      error: "Access denied (Trainer only)"
    });
  }

  next();
}


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


// =======================================================
// 🔹 TEACHING MODE (ADAPTIVE)
// =======================================================
const { adaptiveTeach } = require("./services/adaptiveTeachingService");

// Teaching sessions storage (in-memory for now)
const teachingSessions = {};

app.post("/ask", async (req, res) => {
  try {
    const { 
      question, 
      answer, 
      sessionId, 
      level 
    } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required" });
    }

    // Get or create session
    const sid = sessionId || "session_" + Date.now();
    if (!teachingSessions[sid]) {
      teachingSessions[sid] = {
        history: [],
        level: null,
        concept: null
      };
    }

    const session = teachingSessions[sid];

    // Adaptive teaching
    const result = await adaptiveTeach({
      concept: question,
      studentAnswer: answer || null,
      conversationHistory: session.history,
      detectedLevel: level || session.level
    });

    // Update session
    if (result.level) {
      session.level = result.level;
    }
    
    session.history.push({
      role: "user",
      content: answer || question
    });
    
    session.history.push({
      role: "assistant",
      content: result.explanation
    });

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
    const { subject, studentId } = req.body;

    const session = await createSession(
      subject || "General",
      20,
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


// =======================================================
// 🔹 STUDENT APIs
// =======================================================

// Legacy
app.get("/student/:studentId/report", async (req, res) => {
  try {
    const report = await getStudentReport(req.params.studentId);
    return res.json(report);
  } catch (error) {
    console.error("REPORT ERROR:", error.message);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// Analytics
app.get("/student/:studentId/analytics", async (req, res) => {
  try {
    const history = await getStudentHistory(req.params.studentId);
    const report = aggregateStudent(history);
    return res.json(report);
  } catch (error) {
    console.error("ANALYTICS ERROR:", error.message);
    res.status(500).json({ error: "Analytics failed" });
  }
});

// Memory (AI adaptation)
app.get("/student/:studentId/memory", async (req, res) => {
  try {
    const memory = await getStudentMemory(req.params.studentId);
    return res.json(memory);
  } catch (error) {
    console.error("MEMORY ERROR:", error.message);
    res.status(500).json({ error: "Memory fetch failed" });
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
    return res.json({ template, language });
  } catch (error) {
    console.error("TEMPLATE ERROR:", error.message);
    res.status(500).json({ error: "Failed to fetch template" });
  }
});


// =======================================================
// 🔹 CODE EXECUTION APIs
// =======================================================

// Execute code with test cases
app.post("/code/execute", async (req, res) => {
  try {
    const { language, code, testCases, timeout } = req.body;
    
    if (!language || !code) {
      return res.status(400).json({
        error: "Language and code are required"
      });
    }
    
    if (!testCases || testCases.length === 0) {
      return res.status(400).json({
        error: "At least one test case is required"
      });
    }
    
    // Validate code first
    const validation = validateCode(language, code);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Code validation failed",
        errors: validation.errors
      });
    }
    
    // Execute code
    const result = await executeCode(
      language,
      code,
      testCases,
      timeout || 5000
    );
    
    return res.json(result);
    
  } catch (error) {
    console.error("CODE EXECUTION ERROR:", error.message);
    res.status(500).json({
      error: "Code execution failed",
      message: error.message
    });
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

// Submit solution for a problem
app.post("/problems/:id/submit", async (req, res) => {
  try {
    const { language, code, studentId } = req.body;
    const problemId = req.params.id;
    
    // Get problem
    const problem = getProblemById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    
    // Validate code
    const validation = validateCode(language, code);
    if (!validation.valid) {
      return res.status(400).json({
        error: "Code validation failed",
        errors: validation.errors
      });
    }
    
    // Execute with problem's test cases
    const result = await executeCode(
      language,
      code,
      problem.testCases,
      5000
    );
    
    // Calculate score
    const score = (result.passedTests / result.totalTests) * 100;
    
    // TODO: Save submission to database/sheets
    // await saveSubmission(studentId, problemId, code, result, score);
    
    return res.json({
      ...result,
      score: score,
      problemId: problemId,
      studentId: studentId,
      submittedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("SUBMIT SOLUTION ERROR:", error.message);
    res.status(500).json({ error: "Submission failed" });
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
// 🔹 SERVER START
// =======================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Micro Trainer Backend running on port ${PORT}`);
});