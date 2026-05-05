import axios from "axios";

// =======================================================
// 🔹 BASE CONFIG
// =======================================================

// 🔥 Use ENV in production (Vercel / Extension)
const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// =======================================================
// 🔹 INTERCEPTORS (OPTIONAL BUT PRO LEVEL)
// =======================================================

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error?.response || error.message);

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
  API.post("/interview/answer", data);


// =======================================================
// 🔹 AI TEACHING MODE
// =======================================================

export const askAI = (data) =>
  API.post("/ask", data);


// =======================================================
// 🔹 STUDENT ANALYTICS
// =======================================================

// 🔹 Legacy report (optional)
export const getReport = (id) =>
  API.get(`/student/${id}/report`);

// 🔥 New analytics (USE THIS)
export const getAnalytics = (id) =>
  API.get(`/student/${id}/analytics`);

// 🔥 AI memory (adaptive system)
export const getMemory = (id) =>
  API.get(`/student/${id}/memory`);


// =======================================================
// 🔹 TRAINER DASHBOARD
// =======================================================

export const getLeaderboard = () =>
  API.get("/leaderboard");

export const getOverview = () =>
  API.get("/dashboard/overview");

export const getWeakStudents = () =>
  API.get("/dashboard/weak-students");

export const getTrends = () =>
  API.get("/dashboard/trends");


// =======================================================
// 🔹 EXPORT DEFAULT
// =======================================================

export default API;