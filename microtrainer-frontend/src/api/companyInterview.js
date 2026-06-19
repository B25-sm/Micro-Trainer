import axios from "axios";
import { API_BASE } from "../api";
import { getStudentApiHeaders } from "../utils/authSession";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

export const companyInterviewAPI = {
  getCompanies: () => client.get("/api/company-interviews/companies"),

  startSession: (payload) =>
    client.post("/api/company-interviews/start", payload),

  submitAnswer: (payload) =>
    client.post("/api/company-interviews/answer", payload, { timeout: 90000 }),

  abandonSession: (payload) =>
    client.post("/api/company-interviews/abandon", payload),

  getHistory: (studentId) =>
    client.get(`/api/company-interviews/history/${studentId}`, {
      headers: getStudentApiHeaders(studentId),
    }),
};
