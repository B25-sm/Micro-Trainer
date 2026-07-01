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

  const { getUserFromRequest } = require("../services/jwtAuthService");
  const jwtUser = getUserFromRequest(req);

  if (!jwtUser) {
    return res.status(401).json({
      error: "Authentication required",
      hint: "Sign in again — your session may have expired",
    });
  }

  if (canAccessStudentData(req, studentId)) {
    return next();
  }

  return res.status(403).json({
    error: "Access denied",
    hint: "You may only view your own progress",
  });
}

/**
 * Require a signed-in identity (student or trainer) for AI / practice routes
 * that were previously open to anonymous callers.
 *
 * - Rejects requests with no valid JWT (401).
 * - For students: overrides any client-supplied `studentId` in the body with
 *   the cryptographically verified one from the token (prevents spoofing and
 *   guarantees every action is attributed).
 * - For trainers: allowed through (e.g. previewing a student); the provided
 *   body `studentId` is left as-is.
 */
function requireStudentIdentity(req, res, next) {
  const { getUserFromRequest } = require("../services/jwtAuthService");
  const user = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({
      error: "Authentication required",
      hint: "Please sign in to MicroTrainer to continue.",
    });
  }

  req.authUser = user;

  if (user.role === "trainer") {
    return next();
  }

  if (!user.studentId) {
    return res.status(403).json({
      error: "Profile incomplete",
      hint: "Finish setting up your student profile to continue.",
    });
  }

  if (req.body && typeof req.body === "object") {
    req.body.studentId = user.studentId;
  }
  req.studentId = user.studentId;

  return next();
}

module.exports = {
  trainerOnly,
  studentSelfOrTrainer,
  requireStudentIdentity,
};
