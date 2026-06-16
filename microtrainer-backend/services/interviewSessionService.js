const {
  isClarificationRequest,
  generateClarification,
} = require("./interviewClarificationService");
const { evaluateAnswer } = require("./interviewService");
const { generateQuestion } = require("./questionService");
const { generateCoachReport } = require("./coachService"); // ✅ NEW
const { generateFollowUp } = require("./adaptiveFollowupService"); // 🔥 ADAPTIVE
const { syncInterviewToCentral } = require("./centralPlatformSync"); // 🔄 SYNC

const sessions = {};
const { recordInterviewSession } = require("./interviewHistoryService");
const antiCheatService = require("./antiCheatService");

function secondsForDifficulty(difficulty) {
  const d = String(difficulty || "easy").toLowerCase();
  if (d === "hard") return 300;
  if (d === "medium") return 120;
  return 60;
}

/** generateQuestion returns { question, difficulty } */
function unpackQuestion(gen, fallbackDifficulty = "easy") {
  if (gen && typeof gen === "object" && gen.question != null) {
    return {
      text: gen.question,
      difficulty: gen.difficulty || fallbackDifficulty,
    };
  }
  return { text: String(gen ?? ""), difficulty: fallbackDifficulty };
}


// =======================================================
// 🔹 Create Interview Session
// =======================================================
async function createSession(subject, totalQuestions = 20, studentId) {
  const sessionId = "sess_" + Date.now();

  const generated = await generateQuestion({
    subject,
    history: [],
    studentId
  });
  const { text: qText, difficulty } = unpackQuestion(generated);

  sessions[sessionId] = {
    studentId,
    subject,
    startedAt: new Date().toISOString(),
    currentQuestion: 0,
    totalQuestions,
    history: [
      {
        question: qText,
        difficulty,
        answer: null
      }
    ]
  };

  console.log("✅ Session created:", sessionId);
  console.log("📊 Total sessions:", Object.keys(sessions).length);

  return {
    sessionId,
    question: qText,
    difficulty,
    questionTimeSeconds: secondsForDifficulty(difficulty),
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

  // 🔹 Clarification — real interviews allow "can you repeat that?"
  if (isClarificationRequest(answer)) {
    currentEntry.clarificationCount = (currentEntry.clarificationCount || 0) + 1;

    const clarification = await generateClarification({
      question: currentEntry.question,
      subject: session.subject,
      studentMessage: answer,
      clarificationCount: currentEntry.clarificationCount,
    });

    if (clarification.revisedQuestion) {
      currentEntry.question = clarification.revisedQuestion;
    }

    console.log(
      `💬 Clarification #${currentEntry.clarificationCount} for: ${currentEntry.question}`
    );

    return {
      completed: false,
      isClarification: true,
      interviewerMessage: clarification.message,
      nextQuestion: currentEntry.question,
      difficulty: currentEntry.difficulty,
      questionTimeSeconds: secondsForDifficulty(currentEntry.difficulty),
      bonusSeconds: 45,
      currentQuestion: session.currentQuestion + 1,
      totalQuestions: session.totalQuestions,
    };
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

  try {
    const { logInterviewAnswer } = require("./studentLearningLedgerService");
    logInterviewAnswer({
      studentId: session.studentId,
      subject: session.subject,
      topic: currentEntry.question,
      score: result.score != null ? Number(result.score) : null,
      metadata: {
        communication: result.communication,
        technical: result.technical,
      },
    });
  } catch (ledgerErr) {
    console.error("Ledger interview log error:", ledgerErr.message);
  }

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

    // 🎯 UPDATE STUDENT PROFILE (NEW)
    const { addTechnologyInterview } = require("./studentProfileService");
    addTechnologyInterview(
      session.studentId,
      session.subject,
      parseFloat(final.averageScore),
      {
        communicationScore: final.communicationScore,
        technicalScore: final.technicalScore,
        verdict: final.verdict,
        totalQuestions: session.totalQuestions
      }
    );

    // 🔄 SYNC TO CENTRAL PLATFORM (NEW)
    const anticheat = antiCheatService.getSession(sessionId);
    if (anticheat) {
      antiCheatService.completeSession(sessionId);
    }

    recordInterviewSession({
      sessionId,
      studentId: session.studentId,
      subject: session.subject,
      status: "completed",
      history: session.history,
      final,
      anticheat,
      startedAt: session.startedAt,
    });

    const durationMs = session.startedAt
      ? Date.now() - new Date(session.startedAt).getTime()
      : 0;

    const syncData = {
      studentId: session.studentId,
      sessionId: sessionId,
      subject: session.subject,
      history: session.history,
      final: final,
      coachReport: coachReport,
      warningCount: anticheat?.warningCount ?? 0,
      suspicionScore: anticheat?.suspicionScore ?? 0,
      isDismissed: false,
      totalQuestions: session.totalQuestions,
      completionRate: 100,
      duration: Math.round(durationMs / 1000),
    };

    syncInterviewToCentral(syncData).catch((err) => {
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
  let nextQuestionText;
  let nextDifficulty;

  if (result.shouldFollowUp) {
    const followUp = await generateFollowUp(
      currentEntry.question,
      answer,
      session.subject
    );

    if (followUp) {
      console.log("🎯 Adaptive follow-up generated (hybrid)");
      nextQuestionText = followUp;
      nextDifficulty = "medium";
    } else {
      const gen = await generateQuestion({
        subject: session.subject,
        history: session.history,
        studentId: session.studentId
      });
      const u = unpackQuestion(gen);
      nextQuestionText = u.text;
      nextDifficulty = u.difficulty;
    }
  } else {
    const gen = await generateQuestion({
      subject: session.subject,
      history: session.history,
      studentId: session.studentId
    });
    const u = unpackQuestion(gen);
    nextQuestionText = u.text;
    nextDifficulty = u.difficulty;
  }

  session.history.push({
    question: nextQuestionText,
    difficulty: nextDifficulty,
    answer: null
  });

  return {
    completed: false,
    feedback: result.feedback,
    score: result.score,
    nextQuestion: nextQuestionText,
    difficulty: nextDifficulty,
    questionTimeSeconds: secondsForDifficulty(nextDifficulty),
    currentQuestion: session.currentQuestion + 1,
    totalQuestions: session.totalQuestions
  };
}


// =======================================================
// 🔹 Final Evaluation
// =======================================================
function calculateFinal(history) {
  const valid = history.filter(
    (h) => h.score !== undefined && h.answer != null && h.answer !== ""
  );

  if (valid.length === 0) {
    return {
      averageScore: "0.00",
      totalQuestions: 0,
      verdict: "Not Selected",
    };
  }

  const total = valid.reduce((sum, q) => sum + Number(q.score || 0), 0);
  const avg = total / valid.length;

  const { verdictFromAverage } = require("./interviewHistoryService");
  const verdict = verdictFromAverage(Number(avg.toFixed(2)));

  return {
    averageScore: avg.toFixed(2),
    totalQuestions: valid.length,
    verdict,
  };
}

function getActiveSession(sessionId) {
  return sessions[sessionId] || null;
}

function removeActiveSession(sessionId) {
  delete sessions[sessionId];
}

function abandonSession(sessionId, reason = "Student ended interview") {
  const session = sessions[sessionId];
  if (!session) {
    throw new Error("Invalid session ID");
  }

  const anticheat = antiCheatService.getSession(sessionId);
  if (anticheat) {
    antiCheatService.abandonSession(sessionId, reason);
  }

  const partial = calculateFinal(session.history);

  recordInterviewSession({
    sessionId,
    studentId: session.studentId,
    subject: session.subject,
    status: "abandoned",
    history: session.history,
    final: partial.totalQuestions > 0 ? partial : null,
    anticheat,
    dismissalReason: reason,
    startedAt: session.startedAt,
  });

  removeActiveSession(sessionId);

  const questionsAnswered = session.history.filter(
    (h) => h.answer != null && h.answer !== ""
  ).length;

  return {
    abandoned: true,
    questionsAnswered,
    totalQuestions: session.totalQuestions,
    partial,
  };
}

module.exports = {
  createSession,
  submitAnswer,
  getActiveSession,
  removeActiveSession,
  abandonSession,
};