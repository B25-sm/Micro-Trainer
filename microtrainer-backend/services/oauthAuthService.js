// =======================================================
// 🔐 Google & GitHub OAuth
// =======================================================

const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const { signAuthToken } = require("./jwtAuthService");
const { getLink, upsertLink } = require("./oauthAccountStore");
const { isAuthorizedTrainerEmail } = require("./trainerAuthService");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

function getApiBase(req) {
  // Production: set API_PUBLIC_URL on Render so callback matches GitHub/Google exactly
  const explicit =
    process.env.API_PUBLIC_URL ||
    process.env.BACKEND_PUBLIC_URL ||
    process.env.DEPLOYMENT_URL;
  if (explicit && /^https?:\/\//i.test(String(explicit).trim())) {
    return String(explicit).trim().replace(/\/$/, "");
  }
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${proto}://${host}`;
}

function getFrontendUrl() {
  return (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
}

function resolveTrainerRole({ email }) {
  if (email && isAuthorizedTrainerEmail(email)) return "trainer";
  return "student";
}

function buildAuthResponse(user, link) {
  const role = user.role;
  const studentId = link?.studentId || user.studentId || null;

  let careerTrack = null;
  if (role === "student" && studentId) {
    try {
      const { getStudentProfile } = require("./studentProfileStore");
      careerTrack = getStudentProfile(studentId)?.careerTrack || null;
    } catch {
      careerTrack = null;
    }
  }

  const token = signAuthToken({
    sub: user.oauthKey,
    email: user.email,
    name: user.name,
    picture: user.picture,
    provider: user.provider,
    role,
    studentId,
    careerTrack,
    profileComplete: role === "trainer" ? true : Boolean(link?.profileComplete),
  });

  return {
    token,
    role,
    email: user.email,
    name: user.name,
    picture: user.picture,
    provider: user.provider,
    studentId: link?.studentId || null,
    careerTrack,
    profileComplete: role === "trainer" ? true : Boolean(link?.profileComplete),
    needsProfile: role === "student" && !link?.profileComplete,
  };
}

async function verifyGoogleIdToken(idToken) {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub) {
    throw new Error("Invalid Google token");
  }
  return {
    provider: "google",
    providerUserId: payload.sub,
    email: payload.email || "",
    name: payload.name || payload.email || "Google User",
    picture: payload.picture || "",
    oauthKey: `google:${payload.sub}`,
  };
}

async function handleGoogleLogin(idToken) {
  const profile = await verifyGoogleIdToken(idToken);
  const role = resolveTrainerRole(profile);

  const link = getLink(profile.provider, profile.providerUserId);
  upsertLink({
    ...profile,
    studentId: link?.studentId || null,
    profileComplete: link?.profileComplete || role === "trainer",
  });

  return buildAuthResponse({ ...profile, role }, link);
}

function getGitHubAuthorizeUrl(req) {
  if (!GITHUB_CLIENT_ID) {
    throw new Error("GITHUB_CLIENT_ID is not configured");
  }
  const redirectUri = `${getApiBase(req)}/auth/github/callback`;
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

async function handleGitHubCallback(req, code) {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error("GitHub OAuth is not configured");
  }

  const redirectUri = `${getApiBase(req)}/auth/github/callback`;

  const tokenRes = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    },
    {
      headers: { Accept: "application/json" },
    }
  );

  const accessToken = tokenRes.data?.access_token;
  if (!accessToken) {
    throw new Error(tokenRes.data?.error_description || "GitHub token exchange failed");
  }

  const [userRes, emailRes] = await Promise.all([
    axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  ]);

  const emails = emailRes.data || [];
  const primary =
    emails.find((e) => e.primary && e.verified) ||
    emails.find((e) => e.verified) ||
    emails[0];

  const profile = {
    provider: "github",
    providerUserId: String(userRes.data.id),
    email: primary?.email || userRes.data.email || "",
    name: userRes.data.name || userRes.data.login || "GitHub User",
    picture: userRes.data.avatar_url || "",
    oauthKey: `github:${userRes.data.id}`,
  };

  const role = resolveTrainerRole(profile);
  const link = getLink(profile.provider, profile.providerUserId);
  upsertLink({
    ...profile,
    studentId: link?.studentId || null,
    profileComplete: link?.profileComplete || role === "trainer",
  });

  return buildAuthResponse({ ...profile, role }, link);
}

function redirectWithToken(authResult, res) {
  const base = getFrontendUrl();
  const params = new URLSearchParams({
    token: authResult.token,
    role: authResult.role,
    needsProfile: authResult.needsProfile ? "1" : "0",
  });
  if (authResult.name) params.set("name", authResult.name);
  if (authResult.email) params.set("email", authResult.email);
  if (authResult.studentId) params.set("studentId", authResult.studentId);
  return res.redirect(`${base}/auth/callback?${params.toString()}`);
}

module.exports = {
  handleGoogleLogin,
  getGitHubAuthorizeUrl,
  handleGitHubCallback,
  redirectWithToken,
  getFrontendUrl,
};
