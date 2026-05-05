const express = require("express");
const cors = require("cors");
require("dotenv").config();

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
const { getStudentMemory } = require("./services/studentMemoryService");
const { getStudentHistory } = require("./services/readSheetsService");

// 🔥 DASHBOARD
const {
  getOverview,
  getWeakStudents,
  getTrends
} = require("./services/dashboardService");

// 🔥 NEW RANKING SYSTEM
const { getLeaderboard } = require("./services/rankingService");

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
// 🔹 TEACHING MODE
// =======================================================
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required" });
    }

    const result = await getAnswer(question);

    return res.json({
      answer: result.answer,
      confidence: result.confidence,
      escalated: result.confidence === "low"
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
// 🔹 SERVER START
// =======================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Micro Trainer Backend running on port ${PORT}`);
});