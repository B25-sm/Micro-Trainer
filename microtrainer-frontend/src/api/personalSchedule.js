import axios from "axios";
import { getStudentApiHeaders, getTrainerApiHeaders } from "../utils/authSession";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function unwrapError(error) {
  console.error("PERSONAL SCHEDULE API ERROR:", error?.response || error.message);

  if (error.code === "ECONNABORTED") {
    return { error: "Request timed out — please try again.", status: 408 };
  }

  const status = error?.response?.status;
  const data = error?.response?.data || { error: "Something went wrong" };
  return { ...data, status };
}

function client(studentId) {
  const instance = axios.create({
    baseURL: API_BASE,
    timeout: 60000,
    headers: studentId ? getStudentApiHeaders(studentId) : undefined,
  });
  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(unwrapError(error))
  );
  return instance;
}

export const personalScheduleAPI = {
  getCategories: () => client().get(`/api/personal-schedule/categories`),

  getTechOptions: (category) =>
    client().get(`/api/personal-schedule/tech-options/${category}`),

  getSchedule: (studentId) =>
    client(studentId).get(`/api/personal-schedule/${studentId}`),

  setCategory: (studentId, category) =>
    client(studentId).put(`/api/personal-schedule/${studentId}/category`, { category }),

  setSkills: (studentId, body) =>
    client(studentId).put(`/api/personal-schedule/${studentId}/skills`, body),

  recordDiagnostic: (studentId, body) =>
    client(studentId).post(`/api/personal-schedule/${studentId}/diagnostic`, body),

  generatePlan: (studentId) =>
    client(studentId).post(`/api/personal-schedule/${studentId}/generate`),

  completeTask: (studentId, body) =>
    client(studentId).post(`/api/personal-schedule/${studentId}/complete-task`, body),

  getToday: (studentId) =>
    client(studentId).get(`/api/personal-schedule/${studentId}/today`),

  checkReminder: (studentId) =>
    client(studentId).post(`/api/personal-schedule/${studentId}/reminder`),

  reset: (studentId) =>
    client(studentId).post(`/api/personal-schedule/${studentId}/reset`),

  /** Trainer view — same endpoints, trainer Bearer auth */
  getScheduleForTrainer: (studentId) =>
    client().get(`/api/personal-schedule/${studentId}`, {
      headers: getTrainerApiHeaders(),
    }),

  getTodayForTrainer: (studentId) =>
    client().get(`/api/personal-schedule/${studentId}/today`, {
      headers: getTrainerApiHeaders(),
    }),
};
