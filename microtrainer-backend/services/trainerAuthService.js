// =======================================================
// 🔐 TRAINER AUTH — email allowlist only (OAuth)
// =======================================================

const DEFAULT_TRAINER_EMAILS = [
  "saimahendra222@gmail.com",
  "mahendra10kcoders@gmail.com",
];

function getAuthorizedTrainerEmails() {
  const fromEnv = process.env.TRAINER_EMAILS;
  if (!fromEnv || !fromEnv.trim()) {
    return DEFAULT_TRAINER_EMAILS;
  }
  return fromEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAuthorizedTrainerEmail(email) {
  if (!email || typeof email !== "string") return false;
  return getAuthorizedTrainerEmails().includes(email.trim().toLowerCase());
}

function isTrainerJwt(user) {
  return user?.role === "trainer";
}

function isTrainerRequest(req) {
  const { getUserFromRequest } = require("./jwtAuthService");
  const jwtUser = getUserFromRequest(req);
  if (jwtUser && isTrainerJwt(jwtUser)) {
    return Boolean(jwtUser.email && isAuthorizedTrainerEmail(jwtUser.email));
  }
  return false;
}

function canAccessStudentData(req, studentId) {
  if (isTrainerRequest(req)) return true;

  const { getUserFromRequest } = require("./jwtAuthService");
  const jwtUser = getUserFromRequest(req);
  if (jwtUser?.role === "student" && jwtUser.studentId === studentId) {
    return true;
  }

  return false;
}

function getRequestStudentId(req) {
  const { getUserFromRequest } = require("./jwtAuthService");
  const jwtUser = getUserFromRequest(req);
  if (jwtUser?.studentId) return jwtUser.studentId;
  return null;
}

module.exports = {
  getAuthorizedTrainerEmails,
  isAuthorizedTrainerEmail,
  isTrainerRequest,
  canAccessStudentData,
  getRequestStudentId,
};
