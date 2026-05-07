// =======================================================
// 🔒 ANTI-CHEAT SERVICE
// Stores and manages anti-cheat session data
// =======================================================

// In-memory storage (in production, use database)
const antiCheatSessions = {};

// =======================================================
// 🔹 Create Anti-Cheat Session
// =======================================================
function createAntiCheatSession(sessionId, studentId, subject) {
  antiCheatSessions[sessionId] = {
    sessionId,
    studentId,
    subject,
    status: "active",
    startTime: new Date().toISOString(),
    endTime: null,
    currentQuestion: 0,
    totalQuestions: 5,
    suspicionScore: 0,
    warningCount: 0,
    dismissalReason: null,
    events: []
  };

  console.log("✅ Anti-cheat session created:", sessionId);
  return antiCheatSessions[sessionId];
}

// =======================================================
// 🔹 Log Event
// =======================================================
function logEvent(sessionId, eventType, details = {}) {
  const session = antiCheatSessions[sessionId];
  
  if (!session) {
    console.error("❌ Session not found:", sessionId);
    return;
  }

  const event = {
    timestamp: new Date().toISOString(),
    eventType,
    details
  };

  session.events.push(event);
  console.log(`📝 Event logged [${sessionId}]:`, eventType);
}

// =======================================================
// 🔹 Update Suspicion Score
// =======================================================
function updateSuspicionScore(sessionId, points, reason) {
  const session = antiCheatSessions[sessionId];
  
  if (!session) {
    console.error("❌ Session not found:", sessionId);
    return;
  }

  session.suspicionScore += points;
  
  // Auto-flag if suspicion score is high
  if (session.suspicionScore >= 50 && session.status === "active") {
    session.status = "flagged";
  }

  logEvent(sessionId, "suspicion_added", { points, reason, newScore: session.suspicionScore });
  console.log(`⚠️ Suspicion score updated [${sessionId}]: ${session.suspicionScore}`);
}

// =======================================================
// 🔹 Increment Warning
// =======================================================
function incrementWarning(sessionId, reason) {
  const session = antiCheatSessions[sessionId];
  
  if (!session) {
    console.error("❌ Session not found:", sessionId);
    return;
  }

  session.warningCount++;
  logEvent(sessionId, "warning_issued", { warningCount: session.warningCount, reason });
  
  // Auto-dismiss if 3 warnings
  if (session.warningCount >= 3) {
    dismissSession(sessionId, reason);
  }

  console.log(`⚠️ Warning issued [${sessionId}]: ${session.warningCount}/3`);
}

// =======================================================
// 🔹 Dismiss Session
// =======================================================
function dismissSession(sessionId, reason) {
  const session = antiCheatSessions[sessionId];
  
  if (!session) {
    console.error("❌ Session not found:", sessionId);
    return;
  }

  session.status = "dismissed";
  session.dismissalReason = reason;
  session.endTime = new Date().toISOString();
  
  logEvent(sessionId, "interview_dismissed", { reason });
  console.log(`❌ Session dismissed [${sessionId}]:`, reason);
}

// =======================================================
// 🔹 Complete Session
// =======================================================
function completeSession(sessionId) {
  const session = antiCheatSessions[sessionId];
  
  if (!session) {
    console.error("❌ Session not found:", sessionId);
    return;
  }

  session.status = "completed";
  session.endTime = new Date().toISOString();
  
  logEvent(sessionId, "interview_completed", {});
  console.log(`✅ Session completed [${sessionId}]`);
}

// =======================================================
// 🔹 Get Session
// =======================================================
function getSession(sessionId) {
  return antiCheatSessions[sessionId] || null;
}

// =======================================================
// 🔹 Get All Sessions
// =======================================================
function getAllSessions() {
  return Object.values(antiCheatSessions);
}

// =======================================================
// 🔹 Get Sessions by Status
// =======================================================
function getSessionsByStatus(status) {
  return Object.values(antiCheatSessions).filter(s => s.status === status);
}

// =======================================================
// 🔹 Update Question Progress
// =======================================================
function updateQuestionProgress(sessionId, currentQuestion, totalQuestions) {
  const session = antiCheatSessions[sessionId];
  
  if (!session) {
    console.error("❌ Session not found:", sessionId);
    return;
  }

  session.currentQuestion = currentQuestion;
  session.totalQuestions = totalQuestions;
}

module.exports = {
  createAntiCheatSession,
  logEvent,
  updateSuspicionScore,
  incrementWarning,
  dismissSession,
  completeSession,
  getSession,
  getAllSessions,
  getSessionsByStatus,
  updateQuestionProgress
};
