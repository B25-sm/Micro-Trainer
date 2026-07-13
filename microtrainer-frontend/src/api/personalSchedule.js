import axios from "axios";
import { getStudentApiHeaders, getTrainerApiHeaders } from "../utils/authSession";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BACKUP_KEY_PREFIX = "microtrainer-personal-schedule-backup:";

function backupKey(studentId) {
  return `${BACKUP_KEY_PREFIX}${studentId}`;
}

function getStoredBackup(studentId) {
  try {
    return localStorage.getItem(backupKey(studentId));
  } catch {
    return null;
  }
}

function storeBackup(studentId, token) {
  if (!studentId || !token) return;
  try {
    localStorage.setItem(backupKey(studentId), token);
  } catch {
    // Recovery is best-effort when browser storage is disabled or full.
  }
}

function removeBackup(studentId) {
  try {
    localStorage.removeItem(backupKey(studentId));
  } catch {
    // Nothing else to clean up.
  }
}

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

async function scheduleRequest(studentId, request) {
  const response = await request;
  storeBackup(studentId, response.data?.backupToken);
  return response;
}

async function getScheduleWithRecovery(studentId) {
  const response = await scheduleRequest(
    studentId,
    client(studentId).get(`/api/personal-schedule/${studentId}`)
  );
  if (response.data?.schedule) return response;

  const backupToken = getStoredBackup(studentId);
  if (!backupToken) return response;

  try {
    return await scheduleRequest(
      studentId,
      client(studentId).post(`/api/personal-schedule/${studentId}/restore`, { backupToken })
    );
  } catch (error) {
    if (error?.status === 400) {
      removeBackup(studentId);
      return response;
    }
    throw error;
  }
}

export const personalScheduleAPI = {
  getCategories: () => client().get(`/api/personal-schedule/categories`),

  getTechOptions: (category) =>
    client().get(`/api/personal-schedule/tech-options/${category}`),

  getSchedule: (studentId) => getScheduleWithRecovery(studentId),

  setCategory: (studentId, category) =>
    scheduleRequest(
      studentId,
      client(studentId).put(`/api/personal-schedule/${studentId}/category`, { category })
    ),

  setSkills: (studentId, body) =>
    scheduleRequest(
      studentId,
      client(studentId).put(`/api/personal-schedule/${studentId}/skills`, body)
    ),

  recordDiagnostic: (studentId, body) =>
    scheduleRequest(
      studentId,
      client(studentId).post(`/api/personal-schedule/${studentId}/diagnostic`, body)
    ),

  generatePlan: (studentId) =>
    scheduleRequest(
      studentId,
      client(studentId).post(`/api/personal-schedule/${studentId}/generate`)
    ),

  completeTask: (studentId, body) =>
    scheduleRequest(
      studentId,
      client(studentId).post(`/api/personal-schedule/${studentId}/complete-task`, body)
    ),

  getToday: (studentId) =>
    client(studentId).get(`/api/personal-schedule/${studentId}/today`),

  checkReminder: (studentId) =>
    client(studentId).post(`/api/personal-schedule/${studentId}/reminder`),

  reset: (studentId) =>
    scheduleRequest(
      studentId,
      client(studentId).post(`/api/personal-schedule/${studentId}/reset`)
    ),

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
