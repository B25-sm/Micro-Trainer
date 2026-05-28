/**
 * OAuth JWT session (Google / GitHub)
 */

const TOKEN_KEY = "authToken";

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
}

export function isOAuthLoggedIn() {
  return Boolean(getAuthToken());
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
  const id = forStudentId || localStorage.getItem("studentId") || "";
  if (id) headers["x-student-id"] = id;
  return headers;
}

export function needsProfileCompletion() {
  if (localStorage.getItem("userRole") === "trainer") return false;
  if (!getAuthToken()) return false;
  return localStorage.getItem("profileComplete") !== "true";
}
