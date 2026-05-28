const {
  isTrainerRequest,
  canAccessStudentData,
} = require("../services/trainerAuthService");

function trainerOnly(req, res, next) {
  if (isTrainerRequest(req)) {
    return next();
  }

  return res.status(403).json({
    error: "Access denied (Trainer only)",
    hint: "Sign in with an authorized trainer Google or GitHub account",
  });
}

function studentSelfOrTrainer(req, res, next) {
  const studentId = req.params.studentId;
  if (!studentId) {
    return res.status(400).json({ error: "studentId required" });
  }

  if (canAccessStudentData(req, studentId)) {
    return next();
  }

  return res.status(403).json({
    error: "Access denied",
    hint: "You may only view your own progress",
  });
}

module.exports = {
  trainerOnly,
  studentSelfOrTrainer,
};
