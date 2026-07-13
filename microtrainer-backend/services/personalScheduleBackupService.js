const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("./jwtAuthService");

const BACKUP_KIND = "personal_schedule_backup";
const BACKUP_EXPIRES_IN = process.env.PERSONAL_SCHEDULE_BACKUP_TTL || "90d";

function createScheduleBackup(schedule) {
  const secret = getJwtSecret();
  if (!secret || !schedule?.studentId) return null;

  return jwt.sign(
    {
      kind: BACKUP_KIND,
      studentId: schedule.studentId,
      schedule,
    },
    secret,
    { expiresIn: BACKUP_EXPIRES_IN }
  );
}

function verifyScheduleBackup(token, studentId) {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error("Schedule recovery is unavailable because JWT_SECRET is not configured.");
  }
  if (!token || typeof token !== "string") {
    throw new Error("Schedule backup token is required.");
  }

  let payload;
  try {
    payload = jwt.verify(token, secret);
  } catch {
    throw new Error("Schedule backup is invalid or expired.");
  }

  if (payload.kind !== BACKUP_KIND || payload.studentId !== studentId) {
    throw new Error("Schedule backup belongs to a different student.");
  }
  return payload.schedule;
}

module.exports = {
  createScheduleBackup,
  verifyScheduleBackup,
};
