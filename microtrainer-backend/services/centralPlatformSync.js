// =======================================================
// 🔄 CENTRAL PLATFORM SYNC SERVICE
// Syncs interview summaries to central platform
// =======================================================

const axios = require("axios");

const CENTRAL_PLATFORM_URL = process.env.CENTRAL_PLATFORM_URL || "http://localhost:6000";
const PLATFORM_API_KEY = process.env.PLATFORM_API_KEY;
const INSTITUTION_ID = process.env.INSTITUTION_ID;

// =======================================================
// 🔄 SYNC INTERVIEW TO CENTRAL PLATFORM
// =======================================================
async function syncInterviewToCentral(interviewData) {
  // Skip if no API key configured
  if (!PLATFORM_API_KEY) {
    console.log("⚠️ Central platform sync disabled (no API key)");
    return { success: false, reason: "no_api_key" };
  }
  
  try {
    // Prepare lightweight summary (NO raw data)
    const summary = {
      student_id: interviewData.studentId,
      institution_id: INSTITUTION_ID,
      interview_id: interviewData.sessionId,
      date: new Date().toISOString(),
      subject: interviewData.subject,
      scores: {
        technical: interviewData.final?.technicalScore || 0,
        communication: interviewData.final?.communicationScore || 0,
        confidence: interviewData.final?.confidenceScore || 0,
        problem_solving: interviewData.final?.problemSolvingScore || 0,
        overall: parseFloat(interviewData.final?.averageScore) || 0
      },
      anti_cheat: {
        warnings: interviewData.warningCount || 0,
        suspicion_score: interviewData.suspicionScore || 0,
        cheating_risk: calculateCheatingRisk(interviewData.suspicionScore),
        flagged: interviewData.isDismissed || false
      },
      strengths: extractStrengths(interviewData.history),
      weak_topics: extractWeakTopics(interviewData.history),
      progress: {
        compared_to_previous: interviewData.progress?.improvement || "N/A",
        consistency_score: interviewData.progress?.consistency || 0,
        interview_count: interviewData.progress?.totalInterviews || 1
      },
      duration_minutes: interviewData.duration || 0,
      questions_answered: interviewData.totalQuestions || 0,
      completion_rate: interviewData.completionRate || 100
    };
    
    // Send to central platform
    const response = await axios.post(
      `${CENTRAL_PLATFORM_URL}/api/sync/interview`,
      summary,
      {
        headers: {
          "X-API-Key": PLATFORM_API_KEY,
          "Content-Type": "application/json"
        },
        timeout: 5000 // 5 second timeout
      }
    );
    
    console.log(`✅ Interview synced to central platform: ${summary.interview_id}`);
    
    return {
      success: true,
      response: response.data
    };
    
  } catch (error) {
    console.error("❌ Central platform sync failed:", error.message);
    
    // Don't fail the interview if sync fails
    return {
      success: false,
      error: error.message
    };
  }
}

// =======================================================
// 🔄 CALCULATE CHEATING RISK
// =======================================================
function calculateCheatingRisk(suspicionScore) {
  if (suspicionScore >= 100) return "high";
  if (suspicionScore >= 50) return "medium";
  return "low";
}

// =======================================================
// 🔄 EXTRACT STRENGTHS
// =======================================================
function extractStrengths(history) {
  if (!history || history.length === 0) return [];
  
  const strengths = [];
  
  history.forEach(entry => {
    if (entry.score >= 8 && entry.question) {
      // Extract topic from question
      const topic = extractTopicFromQuestion(entry.question);
      if (topic && !strengths.includes(topic)) {
        strengths.push(topic);
      }
    }
  });
  
  return strengths.slice(0, 5); // Top 5 strengths
}

// =======================================================
// 🔄 EXTRACT WEAK TOPICS
// =======================================================
function extractWeakTopics(history) {
  if (!history || history.length === 0) return [];
  
  const weakTopics = [];
  
  history.forEach(entry => {
    if (entry.score < 5 && entry.question) {
      // Extract topic from question
      const topic = extractTopicFromQuestion(entry.question);
      if (topic && !weakTopics.includes(topic)) {
        weakTopics.push(topic);
      }
    }
  });
  
  return weakTopics.slice(0, 5); // Top 5 weak topics
}

// =======================================================
// 🔄 EXTRACT TOPIC FROM QUESTION
// =======================================================
function extractTopicFromQuestion(question) {
  // Simple keyword extraction
  const keywords = [
    "closure", "promise", "async", "await", "hoisting", "scope",
    "react", "hooks", "state", "props", "context", "redux",
    "python", "decorator", "generator", "comprehension",
    "sql", "join", "index", "query", "database",
    "java", "spring", "hibernate", "jpa",
    "node", "express", "middleware", "api"
  ];
  
  const lowerQuestion = question.toLowerCase();
  
  for (const keyword of keywords) {
    if (lowerQuestion.includes(keyword)) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  
  return null;
}

// =======================================================
// 🔄 BATCH SYNC (For backfilling)
// =======================================================
async function batchSyncInterviews(interviews) {
  if (!PLATFORM_API_KEY) {
    console.log("⚠️ Central platform sync disabled (no API key)");
    return { success: false, reason: "no_api_key" };
  }
  
  try {
    const summaries = interviews.map(interview => ({
      student_id: interview.studentId,
      institution_id: INSTITUTION_ID,
      interview_id: interview.sessionId,
      date: interview.date || new Date().toISOString(),
      subject: interview.subject,
      scores: {
        technical: interview.final?.technicalScore || 0,
        communication: interview.final?.communicationScore || 0,
        confidence: interview.final?.confidenceScore || 0,
        problem_solving: interview.final?.problemSolvingScore || 0,
        overall: parseFloat(interview.final?.averageScore) || 0
      },
      anti_cheat: {
        warnings: interview.warningCount || 0,
        suspicion_score: interview.suspicionScore || 0,
        cheating_risk: calculateCheatingRisk(interview.suspicionScore),
        flagged: interview.isDismissed || false
      },
      strengths: extractStrengths(interview.history),
      weak_topics: extractWeakTopics(interview.history),
      progress: interview.progress || {},
      duration_minutes: interview.duration || 0,
      questions_answered: interview.totalQuestions || 0,
      completion_rate: interview.completionRate || 100
    }));
    
    const response = await axios.post(
      `${CENTRAL_PLATFORM_URL}/api/sync/batch`,
      { interviews: summaries },
      {
        headers: {
          "X-API-Key": PLATFORM_API_KEY,
          "Content-Type": "application/json"
        },
        timeout: 30000 // 30 second timeout for batch
      }
    );
    
    console.log(`✅ Batch synced ${summaries.length} interviews to central platform`);
    
    return {
      success: true,
      response: response.data
    };
    
  } catch (error) {
    console.error("❌ Batch sync failed:", error.message);
    
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  syncInterviewToCentral,
  batchSyncInterviews
};
