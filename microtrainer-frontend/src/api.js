import axios from "axios";
import {
  getTrainerApiHeaders,
  getStudentApiHeaders,
  getBearerHeaders,
} from "./utils/authSession";

// =======================================================
// 🔹 BASE CONFIG
// =======================================================

// 🔥 Use ENV in production (Vercel / Extension)
export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// =======================================================
// 🔹 INTERCEPTORS (OPTIONAL BUT PRO LEVEL)
// =======================================================

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error?.response || error.message);

    if (error.code === "ECONNABORTED") {
      return Promise.reject({ error: "Request timed out — please try again." });
    }

    return Promise.reject(
      error?.response?.data || { error: "Something went wrong" }
    );
  }
);

// =======================================================
// 🔹 INTERVIEW FLOW
// =======================================================

export const startInterview = (data) =>
  API.post("/interview/start", data);

export const sendAnswer = (data) =>
  API.post("/interview/answer", data, { timeout: 120000 });

export const abandonInterview = (data) =>
  API.post("/interview/abandon", data);


// =======================================================
// 🔹 AI TEACHING MODE
// =======================================================

export const askAI = (data) =>
  API.post("/ask", data, { timeout: 60000 });


// =======================================================
// 🔹 CHAT WITH MICROTRAINER (HOME PAGE)
// =======================================================

export const chatWithMicroTrainer = (data) =>
  API.post("/chat/ask", data, { timeout: 60000 });


// =======================================================
// 🔹 STUDENT ANALYTICS
// =======================================================

// 🔹 Legacy report (optional)
export const getReport = (id) =>
  API.get(`/student/${id}/report`, { headers: getStudentApiHeaders(id) });

// 🔥 New analytics (USE THIS)
export const getAnalytics = (id) =>
  API.get(`/student/${id}/analytics`, { headers: getStudentApiHeaders(id) });

// 🔥 AI memory (adaptive system)
export const getMemory = (id) =>
  API.get(`/student/${id}/memory`, { headers: getStudentApiHeaders(id) });

export const getInterviewHistory = (studentId) =>
  API.get(`/student/${studentId}/interviews`, {
    headers: getStudentApiHeaders(studentId),
  });

export const getInterviewHistoryDetail = (studentId, sessionId) =>
  API.get(`/student/${studentId}/interviews/${sessionId}`, {
    headers: getStudentApiHeaders(studentId),
  });

export const getCertificateEligibility = (id) =>
  API.get(`/api/certificate/eligibility/${id}`, {
    headers: getStudentApiHeaders(id),
  });


// =======================================================
// 🔹 TRAINER DASHBOARD
// =======================================================

export const getLeaderboard = () =>
  API.get("/trainer/leaderboard", { headers: getTrainerApiHeaders() });

// =======================================================
// 🔹 ANTI-CHEAT (mock interview proctoring)
// =======================================================

export const createAnticheatSession = (data) =>
  API.post("/anticheat/session", data);

export const logAnticheatEvent = (data) =>
  API.post("/anticheat/event", data);

export const updateAnticheatSuspicion = (data) =>
  API.post("/anticheat/suspicion", data);

export const incrementAnticheatWarning = (data) =>
  API.post("/anticheat/warning", data);

export const dismissAnticheatSession = (data) =>
  API.post("/anticheat/dismiss", data);

export const completeAnticheatSession = (data) =>
  API.post("/anticheat/complete", data);

export const getOverview = () =>
  API.get("/dashboard/overview");

export const getWeakStudents = () =>
  API.get("/dashboard/weak-students");

export const getTrends = () =>
  API.get("/dashboard/trends");


// =======================================================
// 🔹 BUG / INCONVENIENCE REPORTS
// =======================================================

export const reportIssue = (data) =>
  API.post("/api/feedback", data, { headers: getBearerHeaders() });


// =======================================================
// 🔹 EXPORT DEFAULT
// =======================================================

export default API;