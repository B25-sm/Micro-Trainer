const { evaluateAnswer } = require("./interviewService");
const { generateQuestion } = require("./questionService");
const { generateCoachReport } = require("./coachService"); // ✅ NEW

const sessions = {};


// =======================================================
// 🔹 Create Interview Session
// =======================================================
async function createSession(subject, totalQuestions = 20, studentId) {
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

  return {
    sessionId,
    firstQuestion
  };
}


// =======================================================
// 🔹 Submit Answer
// =======================================================
async function submitAnswer(sessionId, answer) {
  const session = sessions[sessionId];

  if (!session) {
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

  // =======================================================
  // 🔹 Completion Check
  // =======================================================
  if (session.currentQuestion >= session.totalQuestions) {
    const final = calculateFinal(session.history);

    // 🔥 COACH REPORT (NEW)
    const coachReport = await generateCoachReport({
      history: session.history,
      studentId: session.studentId,
      subject: session.subject
    });

    delete sessions[sessionId];

    return {
      completed: true,
      final,
      coachReport // ✅ NEW
    };
  }

  // =======================================================
  // 🔹 Generate Next Question (ADAPTIVE)
  // =======================================================
  const nextQuestion = await generateQuestion({
    subject: session.subject,
    history: session.history,
    studentId: session.studentId
  });

  // 🔹 Add next question
  session.history.push({
    question: nextQuestion,
    answer: null
  });

  return {
    completed: false,
    progress: `${session.currentQuestion}/${session.totalQuestions}`,
    lastResult: result,
    nextQuestion
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