const {
  getCompanyById,
  pickQuestionsForSession,
} = require("./companyInterviewBank");
const { elevateQuestionPatterns } = require("./companyQuestionElevator");
const { evaluateAnswer } = require("./interviewService");
const {
  isClarificationRequest,
  generateClarification,
} = require("./interviewClarificationService");
const { buildCompanyFitResult } = require("./companyInterviewFitService");
const { addAttempt } = require("./companyInterviewStore");

const sessions = {};

function secondsForDifficulty(difficulty) {
  const d = String(difficulty || "easy").toLowerCase();
  if (d === "hard") return 240;
  if (d === "medium") return 120;
  return 90;
}

async function createSession({ companyId, studentId, totalQuestions }) {
  const company = getCompanyById(companyId);
  if (!company) {
    throw new Error("Company not found");
  }

  const picked = pickQuestionsForSession(company, totalQuestions);
  if (!picked.length) {
    throw new Error("No questions available for this company");
  }

  const elevated = await elevateQuestionPatterns(company, picked);
  const sessionId = `ci_sess_${Date.now()}`;

  const first = elevated[0];
  sessions[sessionId] = {
    sessionId,
    studentId: studentId || "anonymous",
    companyId: company.id,
    companyName: company.name,
    role: company.role,
    fitThresholds: company.fitThresholds,
    startedAt: new Date().toISOString(),
    currentIndex: 0,
    questionQueue: elevated,
    totalQuestions: elevated.length,
    history: [
      {
        questionId: first.id,
        category: first.category,
        topic: first.topic,
        pattern: first.pattern,
        question: first.question,
        difficulty: first.difficulty,
        answer: null,
      },
    ],
  };

  return {
    sessionId,
    companyId: company.id,
    companyName: company.name,
    role: company.role,
    question: first.question,
    difficulty: first.difficulty,
    questionTimeSeconds: secondsForDifficulty(first.difficulty),
    currentQuestion: 1,
    totalQuestions: elevated.length,
  };
}

async function submitAnswer(sessionId, answer) {
  const session = sessions[sessionId];
  if (!session) {
    throw new Error("Invalid session ID");
  }

  const currentEntry = session.history[session.history.length - 1];
  if (!currentEntry?.question) {
    throw new Error("No active question found");
  }

  const subject = `${session.companyName} — ${session.role}`;

  if (isClarificationRequest(answer)) {
    currentEntry.clarificationCount = (currentEntry.clarificationCount || 0) + 1;
    const clarification = await generateClarification({
      question: currentEntry.question,
      subject,
      studentMessage: answer,
      clarificationCount: currentEntry.clarificationCount,
    });

    if (clarification.revisedQuestion) {
      currentEntry.question = clarification.revisedQuestion;
    }

    return {
      completed: false,
      isClarification: true,
      interviewerMessage: clarification.message,
      nextQuestion: currentEntry.question,
      difficulty: currentEntry.difficulty,
      questionTimeSeconds: secondsForDifficulty(currentEntry.difficulty),
      bonusSeconds: 45,
      currentQuestion: session.currentIndex + 1,
      totalQuestions: session.totalQuestions,
      companyName: session.companyName,
    };
  }

  const result = await evaluateAnswer({
    question: currentEntry.question,
    answer,
    subject,
    studentId: session.studentId,
  });

  currentEntry.answer = answer;
  Object.assign(currentEntry, {
    score: result.score,
    strengths: result._evaluation?.strengths || result.strengths,
    mistakes: result._evaluation?.mistakes || result.mistakes,
    improvement: result._evaluation?.improvement || result.improvement,
  });

  session.currentIndex++;

  if (session.currentIndex >= session.totalQuestions) {
    const company = getCompanyById(session.companyId);
    const fitResult = await buildCompanyFitResult({
      company,
      history: session.history,
      status: "completed",
    });

    if (session.studentId && session.studentId !== "anonymous") {
      addAttempt(session.studentId, {
        sessionId,
        companyId: session.companyId,
        companyName: session.companyName,
        role: session.role,
        status: "completed",
        ...fitResult,
        history: session.history,
      });
    }

    delete sessions[sessionId];

    return {
      completed: true,
      fitResult,
      message: `Mock complete — here's your ${session.companyName} fit assessment.`,
    };
  }

  const next = session.questionQueue[session.currentIndex];
  session.history.push({
    questionId: next.id,
    category: next.category,
    topic: next.topic,
    pattern: next.pattern,
    question: next.question,
    difficulty: next.difficulty,
    answer: null,
  });

  return {
    completed: false,
    score: result.score,
    strengths: result._evaluation?.strengths || result.strengths,
    mistakes: result._evaluation?.mistakes || result.mistakes,
    improvement: result._evaluation?.improvement || result.improvement,
    nextQuestion: next.question,
    difficulty: next.difficulty,
    questionTimeSeconds: secondsForDifficulty(next.difficulty),
    currentQuestion: session.currentIndex + 1,
    totalQuestions: session.totalQuestions,
    companyName: session.companyName,
  };
}

function calculatePartial(history) {
  const valid = (history || []).filter(
    (h) => h.score != null && h.answer != null && h.answer !== ""
  );
  if (!valid.length) {
    return { averageScore: "0.00", totalQuestions: 0 };
  }
  const avg =
    valid.reduce((sum, h) => sum + Number(h.score || 0), 0) / valid.length;
  return {
    averageScore: avg.toFixed(2),
    totalQuestions: valid.length,
  };
}

async function abandonSession(sessionId, reason = "Student ended mock") {
  const session = sessions[sessionId];
  if (!session) {
    throw new Error("Invalid session ID");
  }

  const company = getCompanyById(session.companyId);
  const partial = calculatePartial(session.history);
  let fitResult = null;

  if (company && partial.totalQuestions > 0) {
    fitResult = await buildCompanyFitResult({
      company,
      history: session.history,
      status: "abandoned",
    });
    fitResult.status = "partial";
    fitResult.abandonReason = reason;
  }

  if (session.studentId && session.studentId !== "anonymous" && fitResult) {
    addAttempt(session.studentId, {
      sessionId,
      companyId: session.companyId,
      companyName: session.companyName,
      role: session.role,
      status: "abandoned",
      ...fitResult,
      history: session.history,
    });
  }

  delete sessions[sessionId];

  return {
    partial,
    fitResult,
    questionsAnswered: partial.totalQuestions,
    totalQuestions: session.totalQuestions,
    companyName: session.companyName,
  };
}

function getActiveSession(sessionId) {
  return sessions[sessionId] || null;
}

module.exports = {
  createSession,
  submitAnswer,
  abandonSession,
  getActiveSession,
};
