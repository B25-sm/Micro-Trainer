import axios from 'axios';
import { getStudentApiHeaders } from '../utils/authSession';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/** Lesson generation (Groq story + terse + wireframe + quiz) — parallel on server */
const CONCEPT_TIMEOUT_MS = 180000;
const SESSION_TIMEOUT_MS = 20000;
/** Groq grading + revalidation for 4 questions can take 60–90s on cold start */
const SUBMIT_TIMEOUT_MS = 120000;

/**
 * Learning Path API Client
 * Provides functions to interact with the structured learning path backend
 */
export const learningPathAPI = {
  /**
   * Get all available technologies
   * @returns {Promise} Array of technologies with id, name, totalConcepts
   */
  getTechnologies: () =>
    axios.get(`${API_URL}/learning-path/technologies`, { timeout: 30000 }),
  
  /**
   * Get curriculum for a specific technology
   * @param {string} technology - Technology ID (e.g., "javascript")
   * @returns {Promise} Curriculum object with concepts array
   */
  getCurriculum: (technology) => 
    axios.get(`${API_URL}/learning-path/curriculum/${technology}`),
  
  /**
   * Start a new learning session
   * @param {string} studentId - Student identifier
   * @param {string} technology - Technology ID
   * @returns {Promise} Session object with sessionId, currentConceptOrder, progress
   */
  startSession: (studentId, technology, conceptOrder) =>
    axios.post(
      `${API_URL}/learning-path/start`,
      { studentId, technology, conceptOrder },
      { timeout: SESSION_TIMEOUT_MS }
    ),
  
  /**
   * Get teaching content for current concept
   * @param {string} sessionId - Active session ID
   * @param {string} studentLevel - Student level (beginner/intermediate/advanced)
   * @param {boolean} useAI - Whether to use AI-generated questions (default: false)
   * @returns {Promise} Concept teaching content with cross-questions
   */
  getConcept: (sessionId, studentLevel, useAI = false, reteach = false) =>
    axios.get(`${API_URL}/learning-path/concept/${sessionId}`, {
      params: { studentLevel, useAI, reteach: reteach ? "true" : "false" },
      timeout: CONCEPT_TIMEOUT_MS,
    }),
  
  /**
   * Submit answers for assessment
   * @param {string} sessionId - Active session ID
   * @param {Array<string>} answers - Array of student answers
   * @returns {Promise} Assessment result with passed status and percentage
   */
  submitAnswers: (sessionId, answers) =>
    axios.post(`${API_URL}/learning-path/submit`, { sessionId, answers }, {
      timeout: SUBMIT_TIMEOUT_MS,
    }),

  /**
   * Re-phrase the current Quick Check question in simpler language
   * @param {string} sessionId
   * @param {number} questionIndex - 0-based index of the active question
   */
  simplifyQuestion: (sessionId, questionIndex) =>
    axios.post(`${API_URL}/learning-path/simplify-question`, {
      sessionId,
      questionIndex,
    }),
  
  /**
   * Get student progress for a specific technology
   * @param {string} studentId - Student identifier
   * @param {string} technology - Technology ID
   * @returns {Promise} Progress object with completed concepts and scores
   */
  getProgress: (studentId, technology) =>
    axios.get(`${API_URL}/learning-path/progress/${studentId}/${technology}`, {
      headers: getStudentApiHeaders(studentId),
    }),

  /**
   * Get student progress across all technologies
   * @param {string} studentId - Student identifier
   * @returns {Promise} Object with progress for each technology
   */
  getAllProgress: (studentId) =>
    axios.get(`${API_URL}/learning-path/progress/${studentId}`, {
      headers: getStudentApiHeaders(studentId),
    }),
};
