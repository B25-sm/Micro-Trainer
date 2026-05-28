// =======================================================
// 🔐 JWT session tokens (OAuth sign-in)
// =======================================================

const jwt = require("jsonwebtoken");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.TRAINER_SECRET;
  if (!secret || !String(secret).trim()) {
    return null;
  }
  return String(secret).trim();
}

function signAuthToken(payload) {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error("JWT_SECRET is not configured on the server");
  }
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
}

function verifyAuthToken(token) {
  const secret = getJwtSecret();
  if (!secret || !token) return null;
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== "string") return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function getUserFromRequest(req) {
  const token = getBearerToken(req);
  if (token) {
    const decoded = verifyAuthToken(token);
    if (decoded) return decoded;
  }
  return null;
}

module.exports = {
  signAuthToken,
  verifyAuthToken,
  getBearerToken,
  getUserFromRequest,
  getJwtSecret,
};
