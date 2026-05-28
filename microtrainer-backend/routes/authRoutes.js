const express = require("express");
const { getUserFromRequest, signAuthToken } = require("../services/jwtAuthService");
const {
  handleGoogleLogin,
  getGitHubAuthorizeUrl,
  handleGitHubCallback,
  redirectWithToken,
} = require("../services/oauthAuthService");
const { bindStudentProfile, getLink } = require("../services/oauthAccountStore");
const { registerStudentProfile } = require("../services/studentProfileStore");
const router = express.Router();

function requireAuth(req, res, next) {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.authUser = user;
  next();
}

function optionalAuth(req, res, next) {
  req.authUser = getUserFromRequest(req) || null;
  next();
}

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body || {};
    if (!credential) {
      return res.status(400).json({ error: "Google credential is required" });
    }
    const result = await handleGoogleLogin(credential);
    res.json(result);
  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error.message);
    res.status(401).json({ error: error.message || "Google sign-in failed" });
  }
});

router.get("/github", (req, res) => {
  try {
    const url = getGitHubAuthorizeUrl(req);
    res.redirect(url);
  } catch (error) {
    console.error("GITHUB AUTH START ERROR:", error.message);
    res.status(503).json({ error: error.message });
  }
});

router.get("/github/callback", async (req, res) => {
  try {
    const { code, error: ghError } = req.query;
    if (ghError) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=github_denied`
      );
    }
    if (!code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }
    const result = await handleGitHubCallback(req, code);
    return redirectWithToken(result, res);
  } catch (error) {
    console.error("GITHUB CALLBACK ERROR:", error.message);
    const front = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    return res.redirect(`${front}/login?error=${encodeURIComponent(error.message)}`);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.authUser });
});

router.post("/complete-profile", requireAuth, (req, res) => {
  try {
    const user = req.authUser;
    if (user.role === "trainer") {
      return res.status(400).json({ error: "Trainers do not need a student profile" });
    }

    const { name, initial, batch, studentId: bodyStudentId } = req.body || {};
    const { buildDisplayName } = require("../services/studentProfileStore");

    const ini = String(initial || "").trim();
    const bat = String(batch || "").trim();
    const fullName = String(name || user.name || "").trim();

    if (!fullName || !ini || !bat) {
      return res.status(400).json({
        error: "name, initial, and batch are required",
      });
    }

    const { normalizePart } = require("../services/studentProfileStore");
    const studentId =
      bodyStudentId || `${normalizePart(ini)}_${normalizePart(bat)}`;

    if (!studentId) {
      return res.status(400).json({ error: "Invalid initial or batch" });
    }

    registerStudentProfile({
      studentId,
      name: fullName,
      initial: ini,
      batch: bat,
    });

    const [provider, providerUserId] = (user.sub || "").split(":");
    if (provider && providerUserId) {
      bindStudentProfile(provider, providerUserId, studentId);
    }

    const token = signAuthToken({
      sub: user.sub,
      email: user.email,
      name: fullName,
      picture: user.picture,
      provider: user.provider,
      role: "student",
      studentId,
      profileComplete: true,
    });

    res.json({
      token,
      role: "student",
      studentId,
      displayName: buildDisplayName(fullName, ini, bat),
      profileComplete: true,
      needsProfile: false,
    });
  } catch (error) {
    console.error("COMPLETE PROFILE ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports.requireAuth = requireAuth;
module.exports.optionalAuth = optionalAuth;
