/**
 * OAuth JWT session (Google / GitHub)
 */

const TOKEN_KEY = "authToken";

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isPayloadExpired(payload) {
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

export function getAuthUser() {
  const token = getAuthToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload || isPayloadExpired(payload)) return null;
  return payload;
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setAuthSession(data) {
  const {
    token,
    role,
    name,
    email,
    studentId,
    profileComplete,
    needsProfile,
    provider,
  } = data;

  if (token) localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userRole", role || "student");

  if (name) localStorage.setItem("userName", name);
  if (email) localStorage.setItem("userEmail", email.toLowerCase());
  if (provider) localStorage.setItem("authProvider", provider);

  localStorage.removeItem("trainerKey");

  if (role === "trainer") {
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentInitial");
    localStorage.removeItem("studentBatch");
    localStorage.removeItem("studentFullName");
    localStorage.setItem("profileComplete", "true");
  } else if (studentId) {
    localStorage.setItem("studentId", studentId);
  }

  if (profileComplete || role === "trainer") {
    localStorage.setItem("profileComplete", "true");
  } else {
    localStorage.removeItem("profileComplete");
  }

  return Boolean(needsProfile);
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("authProvider");
  localStorage.removeItem("profileComplete");
  localStorage.removeItem("trainerKey");
  localStorage.removeItem("careerTrack");
}

export function isOAuthLoggedIn() {
  return Boolean(getAuthUser());
}

export function getSessionStudentId() {
  const fromToken = getAuthUser()?.studentId;
  if (fromToken) {
    const stored = localStorage.getItem("studentId");
    if (stored !== fromToken) {
      localStorage.setItem("studentId", fromToken);
    }
    return fromToken;
  }
  return localStorage.getItem("studentId") || "";
}

export function getBearerHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getTrainerApiHeaders() {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function getStudentApiHeaders(forStudentId) {
  const headers = { ...getBearerHeaders() };
  const id = forStudentId || getSessionStudentId();
  if (id) headers["x-student-id"] = id;
  return headers;
}

export function needsProfileCompletion() {
  const user = getAuthUser();
  if (!user) return false;
  if (user.role === "trainer") return false;
  return !user.profileComplete || !user.studentId;
}

export function isAuthError(error) {
  const status = error?.status ?? error?.response?.status;
  if (status === 401 || status === 403) return true;
  const message = String(error?.error || error?.message || "").toLowerCase();
  return (
    message.includes("access denied") ||
    message.includes("authentication required") ||
    message.includes("sign in")
  );
}
