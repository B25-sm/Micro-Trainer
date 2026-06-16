import axios from "axios";
import { API_BASE } from "../api";
import { getStudentApiHeaders } from "../utils/authSession";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

export const communicationReviewAPI = {
  getScenarios: () => client.get("/api/communication-review/scenarios"),

  submitReview: (studentId, payload) =>
    client.post("/api/communication-review/review", payload, {
      headers: getStudentApiHeaders(studentId),
    }),

  getHistory: (studentId) =>
    client.get(`/api/communication-review/history/${studentId}`, {
      headers: getStudentApiHeaders(studentId),
    }),
};
