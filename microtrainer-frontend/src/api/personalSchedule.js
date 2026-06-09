import axios from "axios";
import { getStudentApiHeaders, getTrainerApiHeaders } from "../utils/authSession";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function client(studentId) {
  return axios.create({
    baseURL: API_BASE,
    timeout: 60000,
    headers: getStudentApiHeaders(studentId),
  });
}

export const personalScheduleAPI = {
  getCategories: () => axios.get(`${API_BASE}/api/personal-schedule/categories`),

  getTechOptions: (category) =>
    axios.get(`${API_BASE}/api/personal-schedule/tech-options/${category}`),

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
    axios.get(`${API_BASE}/api/personal-schedule/${studentId}`, {
      headers: getTrainerApiHeaders(),
    }),

  getTodayForTrainer: (studentId) =>
    axios.get(`${API_BASE}/api/personal-schedule/${studentId}/today`, {
      headers: getTrainerApiHeaders(),
    }),
};
