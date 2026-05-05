import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

export const startInterview = (data) => API.post("/interview/start", data);
export const sendAnswer = (data) => API.post("/interview/answer", data);
export const getReport = (id) => API.get(`/student/${id}/report`);
export const getLeaderboard = () => API.get("/leaderboard");
export const askAI = (data) => API.post("/ask", data);

export default API;