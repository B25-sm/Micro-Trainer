const { evaluateAnswer } = require("./interviewService");
const { generateQuestion } = require("./questionService");
const { generateCoachReport } = require("./coachService"); // ✅ NEW
const { generateFollowUp } = require("./adaptiveFollowupService"); // 🔥 ADAPTIVE
const { syncInterviewToCentral } = require("./centralPlatformSync"); // 🔄 SYNC

const sessions = {};


// =======================================================
// 🔹 Create Interview Session
// =======================================================
async function createSession(subject, totalQuestions = 5, studentId) { // Changed from 20 to 5 for testing
  const sessionId = "sess_" + Date.now();

  const firstQuestion = await generateQuestion({
    subject,
    history: [],
    studentId
  });

  sessions[sessionId] = {
    studentId,
    subject,
    currentQuestion: 0,
    totalQuestions,
    history: [
      {
        question: firstQuestion,
        answer: null
      }
    ]
  };

  console.log("✅ Session created:", sessionId);
  console.log("📊 Total sessions:", Object.keys(sessions).length);

  return {
    sessionId,
    question: firstQuestion,
    currentQuestion: 1,
    totalQuestions
  };
}


// =======================================================
// 🔹 Submit Answer
// =======================================================
async function submitAnswer(sessionId, answer) {
  console.log("📝 Submit Answer - Session ID:", sessionId);
  console.log("📝 Available sessions:", Object.keys(sessions));
  
  const session = sessions[sessionId];

  if (!session) {
    console.error("❌ Session not found! ID:", sessionId);
    throw new Error("Invalid session ID");
  }

  const currentEntry = session.history[session.history.length - 1];

  if (!currentEntry || !currentEntry.question) {
    throw new Error("No active question found");
  }

  // 🔹 Evaluate Answer
  const result = await evaluateAnswer({
    question: currentEntry.question,
    answer,
    subject: session.subject,
    studentId: session.studentId
  });

  // 🔹 Update current entry
  currentEntry.answer = answer;
  Object.assign(currentEntry, result);

  session.currentQuestion++;

  console.log(`📊 Progress: ${session.currentQuestion}/${session.totalQuestions}`);

  // =======================================================
  // 🔹 Completion Check (BEFORE generating next question)
  // =======================================================
  if (session.currentQuestion >= session.totalQuestions) {
    console.log("🎉 Interview completed!");
    
    const final = calculateFinal(session.history);

    // 🔥 COACH REPORT (NEW)
    const coachReport = await generateCoachReport({
      history: session.history,
      studentId: session.studentId,
      subject: session.subject
    });

    // 🔄 SYNC TO CENTRAL PLATFORM (NEW)
    const syncData = {
      studentId: session.studentId,
      sessionId: sessionId,
      subject: session.subject,
      history: session.history,
      final: final,
      coachReport: coachReport,
      warningCount: 0, // TODO: Get from anti-cheat
      suspicionScore: 0, // TODO: Get from anti-cheat
      isDismissed: false, // TODO: Get from anti-cheat
      totalQuestions: session.totalQuestions,
      completionRate: 100,
      duration: 0 // TODO: Calculate duration
    };
    
    // Sync in background (don't wait)
    syncInterviewToCentral(syncData).catch(err => {
      console.error("Background sync error:", err.message);
    });

    delete sessions[sessionId];
    console.log("🗑️ Session deleted:", sessionId);

    return {
      completed: true,
      final,
      coachReport, // ✅ NEW
      message: "Interview complete! Here are your results..."
    };
  }

  // =======================================================
  // 🔹 Generate Next Question (ADAPTIVE HYBRID)
  // =======================================================
  
  // 🔥 CHECK IF FOLLOW-UP IS NEEDED (HYBRID - RULE-BASED + AI)
  let nextQuestion;
  
  if (result.shouldFollowUp) {
    // Try to generate adaptive follow-up (rule-based first, AI fallback)
    const followUp = await generateFollowUp(currentEntry.question, answer, session.subject);
    
    if (followUp) {
      console.log("🎯 Adaptive follow-up generated (hybrid)");
      nextQuestion = followUp;
    } else {
      // No follow-up found, generate new question
      nextQuestion = await generateQuestion({
        subject: session.subject,
        history: session.history,
        studentId: session.studentId
      });
    }
  } else {
    // No follow-up needed, generate new question
    nextQuestion = await generateQuestion({
      subject: session.subject,
      history: session.history,
      studentId: session.studentId
    });
  }

  // 🔹 Add next question
  session.history.push({
    question: nextQuestion,
    answer: null
  });

  return {
    completed: false,
    feedback: result.feedback,
    score: result.score,
    nextQuestion: nextQuestion,
    currentQuestion: session.currentQuestion + 1,
    totalQuestions: session.totalQuestions
  };
}


// =======================================================
// 🔹 Final Evaluation
// =======================================================
function calculateFinal(history) {
  const valid = history.filter(h => h.score !== undefined);

  const total = valid.reduce((sum, q) => sum + q.score, 0);
  const avg = total / valid.length;

  const communicationScores = valid.map(q =>
    q.communication === "Good" ? 3 :
    q.communication === "Average" ? 2 : 1
  );

  const technicalScores = valid.map(q =>
    q.technical === "Good" ? 3 :
    q.technical === "Average" ? 2 : 1
  );

  const avgComm = communicationScores.reduce((a, b) => a + b, 0) / valid.length;
  const avgTech = technicalScores.reduce((a, b) => a + b, 0) / valid.length;

  let verdict;

  if (avg >= 7 && avgTech >= 2.5) {
    verdict = "Strongly Selected";
  } else if (avg >= 6) {
    verdict = "Selected";
  } else if (avg >= 4) {
    verdict = "Borderline";
  } else {
    verdict = "Not Selected";
  }

  return {
    averageScore: avg.toFixed(2),
    communicationScore: avgComm.toFixed(2),
    technicalScore: avgTech.toFixed(2),
    totalQuestions: valid.length,
    verdict
  };
}


module.exports = {
  createSession,
  submitAnswer
};