const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { getAnswer } = require("./services/aiService");
const { evaluateAnswer } = require("./services/interviewService");
const {
  createSession,
  submitAnswer
} = require("./services/interviewSessionService");

const { getStudentReport } = require("./services/analyticsService");
const { getLeaderboard } = require("./services/leaderboardService");

// 🔥 NEW (DASHBOARD)
const {
  getOverview,
  getWeakStudents,
  getTrends
} = require("./services/dashboardService");

const app = express();


// =======================================================
// 🔹 Middleware
// =======================================================
app.use(cors());
app.use(express.json());


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
// 🔹 TEACHING MODE (/ask)
// =======================================================
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string" || question.trim() === "") {
      return res.status(400).json({
        error: "Question is required"
      });
    }

    const result = await getAnswer(question);

    if (!result || typeof result !== "object") {
      return res.status(500).json({
        error: "Invalid AI response"
      });
    }

    const { answer, confidence } = result;
    const isLow = confidence === "low";

    console.log({
      type: "ASK",
      question,
      confidence,
      escalated: isLow,
      time: new Date().toISOString()
    });

    return res.json({
      answer,
      confidence,
      escalated: isLow
    });

  } catch (error) {
    console.error("Error in /ask:", error.message);

    return res.status(500).json({
      error: "Failed to process request"
    });
  }
});


// =======================================================
// 🔹 SINGLE INTERVIEW (/interview)
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

    console.log({
      type: "INTERVIEW_SINGLE",
      studentId,
      score: feedback.score,
      verdict: feedback.verdict,
      time: new Date().toISOString()
    });

    return res.json({
      feedback,
      time: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in /interview:", error.message);

    return res.status(500).json({
      error: "Interview failed"
    });
  }
});


// =======================================================
// 🔹 START INTERVIEW SESSION
// =======================================================
app.post("/interview/start", async (req, res) => {
  try {
    const { subject } = req.body;

    const session = await createSession(subject || "General");

    return res.json(session);

  } catch (error) {
    console.error("Error starting interview:", error.message);

    return res.status(500).json({
      error: "Failed to start interview"
    });
  }
});


// =======================================================
// 🔹 ANSWER SESSION QUESTION
// =======================================================
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
    console.error("Error in session:", error.message);

    return res.status(500).json({
      error: "Session failed"
    });
  }
});


// =======================================================
// 🔹 STUDENT REPORT
// =======================================================
app.get("/student/:studentId/report", async (req, res) => {
  try {
    const { studentId } = req.params;

    const report = await getStudentReport(studentId);

    console.log({
      type: "STUDENT_REPORT",
      studentId,
      time: new Date().toISOString()
    });

    return res.json(report);

  } catch (error) {
    console.error("Error in report:", error.message);

    return res.status(500).json({
      error: "Failed to fetch report"
    });
  }
});


// =======================================================
// 🔹 LEADERBOARD
// =======================================================
app.get("/leaderboard", async (req, res) => {
  try {
    const data = await getLeaderboard();

    console.log({
      type: "LEADERBOARD_VIEW",
      time: new Date().toISOString()
    });

    return res.json(data);

  } catch (error) {
    console.error("Error in leaderboard:", error.message);

    return res.status(500).json({
      error: "Failed leaderboard"
    });
  }
});


// =======================================================
// 🔹 DASHBOARD APIs (🔥 NEW)
// =======================================================

// 📊 Overview
app.get("/dashboard/overview", async (req, res) => {
  try {
    const data = await getOverview();

    console.log({
      type: "DASHBOARD_OVERVIEW",
      time: new Date().toISOString()
    });

    return res.json(data);

  } catch (error) {
    console.error("Overview error:", error.message);
    return res.status(500).json({ error: "Overview failed" });
  }
});


// ⚠️ Weak Students
app.get("/dashboard/weak-students", async (req, res) => {
  try {
    const data = await getWeakStudents();

    console.log({
      type: "WEAK_STUDENTS_VIEW",
      time: new Date().toISOString()
    });

    return res.json(data);

  } catch (error) {
    console.error("Weak students error:", error.message);
    return res.status(500).json({ error: "Weak students failed" });
  }
});


// 📈 Trends
app.get("/dashboard/trends", async (req, res) => {
  try {
    const data = await getTrends();

    console.log({
      type: "TRENDS_VIEW",
      time: new Date().toISOString()
    });

    return res.json(data);

  } catch (error) {
    console.error("Trends error:", error.message);
    return res.status(500).json({ error: "Trends failed" });
  }
});


// =======================================================
// 🔹 SERVER START
// =======================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});