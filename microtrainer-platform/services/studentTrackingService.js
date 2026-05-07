// =======================================================
// 🎓 STUDENT TRACKING SERVICE
// Tracks student progress across all institutions
// =======================================================

const Student = require('../models/Student');
const Interview = require('../models/Interview');
const { isDbConnected } = require('../config/database');

// Fallback in-memory storage (if database not connected)
const students = new Map();
const interviews = new Map();

// =======================================================
// 🎓 CREATE OR UPDATE STUDENT
// =======================================================
async function upsertStudent(studentData) {
  const { student_id, institution_id, name, email } = studentData;
  
  // Use MongoDB if connected
  if (isDbConnected()) {
    try {
      let student = await Student.findOne({ student_id });
      
      if (!student) {
        student = new Student({
          student_id,
          institution_id,
          name: name || `Student ${student_id}`,
          email: email || null,
          total_interviews: 0,
          average_score: 0,
          strengths: [],
          weak_topics: [],
          cheating_incidents: 0,
          performance_trend: 'new'
        });
        await student.save();
      }
      
      return student;
    } catch (error) {
      console.error('Database error in upsertStudent:', error.message);
      // Fall through to in-memory
    }
  }
  
  // Fallback: In-memory storage
  if (!students.has(student_id)) {
    students.set(student_id, {
      student_id,
      institution_id,
      name: name || `Student ${student_id}`,
      email: email || null,
      created_at: new Date(),
      total_interviews: 0,
      average_score: 0,
      strengths: [],
      weak_topics: [],
      cheating_incidents: 0,
      total_warnings: 0,
      interview_history: []
    });
  }
  
  return students.get(student_id);
}

// =======================================================
// 🎓 RECORD INTERVIEW SUMMARY
// =======================================================
async function recordInterview(interviewData) {
  const {
    student_id,
    institution_id,
    interview_id,
    date,
    scores,
    anti_cheat,
    strengths,
    weak_topics,
    progress,
    duration_minutes,
    questions_answered,
    completion_rate,
    subject
  } = interviewData;
  
  // Use MongoDB if connected
  if (isDbConnected()) {
    try {
      // Ensure student exists
      await upsertStudent({ student_id, institution_id });
      
      // Store interview summary
      const interview = new Interview({
        interview_id,
        student_id,
        institution_id,
        date: new Date(date),
        subject,
        scores: {
          technical: scores.technical || 0,
          communication: scores.communication || 0,
          confidence: scores.confidence || 0,
          problem_solving: scores.problem_solving || 0,
          overall: scores.overall || 0
        },
        anti_cheat: {
          warnings: anti_cheat.warnings || 0,
          suspicion_score: anti_cheat.suspicion_score || 0,
          cheating_risk: anti_cheat.cheating_risk || 'low',
          flagged: anti_cheat.flagged || false
        },
        strengths: strengths || [],
        weak_topics: weak_topics || [],
        progress: progress || {},
        duration_minutes: duration_minutes || 0,
        questions_answered: questions_answered || 0,
        completion_rate: completion_rate || 0
      });
      
      await interview.save();
      
      // Update student aggregates
      await updateStudentAggregates(student_id, interview);
      
      return interview;
    } catch (error) {
      console.error('Database error in recordInterview:', error.message);
      // Fall through to in-memory
    }
  }
  
  // Fallback: In-memory storage
  const student = await upsertStudent({ student_id, institution_id });
  
  const interviewSummary = {
    interview_id,
    student_id,
    institution_id,
    date: new Date(date),
    subject,
    scores: {
      technical: scores.technical || 0,
      communication: scores.communication || 0,
      confidence: scores.confidence || 0,
      problem_solving: scores.problem_solving || 0,
      overall: scores.overall || 0
    },
    anti_cheat: {
      warnings: anti_cheat.warnings || 0,
      suspicion_score: anti_cheat.suspicion_score || 0,
      cheating_risk: anti_cheat.cheating_risk || 'low',
      flagged: anti_cheat.flagged || false
    },
    strengths: strengths || [],
    weak_topics: weak_topics || [],
    progress: progress || {},
    duration_minutes: duration_minutes || 0,
    questions_answered: questions_answered || 0,
    completion_rate: completion_rate || 0
  };
  
  interviews.set(interview_id, interviewSummary);
  
  // Update student aggregate data
  await updateStudentAggregates(student_id, interviewSummary);
  
  return interviewSummary;
}

// =======================================================
// 🎓 UPDATE STUDENT AGGREGATES
// =======================================================
async function updateStudentAggregates(student_id, interviewSummary) {
  // Use MongoDB if connected
  if (isDbConnected()) {
    try {
      const student = await Student.findOne({ student_id });
      if (!student) return;
      
      // Get all interviews for this student
      const allInterviews = await Interview.find({ student_id }).sort({ date: -1 });
      
      // Update total interviews
      student.total_interviews = allInterviews.length;
      
      // Calculate average score
      const totalScore = allInterviews.reduce((sum, i) => sum + i.scores.overall, 0);
      student.average_score = totalScore / student.total_interviews;
      
      // Update strengths (merge and deduplicate)
      const allStrengths = new Set();
      allInterviews.forEach(i => i.strengths.forEach(s => allStrengths.add(s)));
      student.strengths = Array.from(allStrengths).slice(0, 10);
      
      // Update weak topics (merge and deduplicate)
      const allWeakTopics = new Set();
      allInterviews.forEach(i => i.weak_topics.forEach(w => allWeakTopics.add(w)));
      student.weak_topics = Array.from(allWeakTopics).slice(0, 10);
      
      // Update cheating stats
      student.cheating_incidents = allInterviews.filter(i => i.anti_cheat.flagged).length;
      
      // Update last interview date
      student.last_interview_date = allInterviews[0].date;
      
      // Calculate performance trend
      student.performance_trend = calculateTrend(allInterviews.map(i => ({
        overall_score: i.scores.overall,
        date: i.date
      })));
      
      await student.save();
      return;
    } catch (error) {
      console.error('Database error in updateStudentAggregates:', error.message);
      // Fall through to in-memory
    }
  }
  
  // Fallback: In-memory storage
  const student = students.get(student_id);
  if (!student) return;
  
  // Add to interview history
  student.interview_history.push({
    interview_id: interviewSummary.interview_id,
    date: interviewSummary.date,
    overall_score: interviewSummary.scores.overall,
    subject: interviewSummary.subject
  });
  
  // Update total interviews
  student.total_interviews = student.interview_history.length;
  
  // Calculate average score
  const totalScore = student.interview_history.reduce((sum, i) => sum + i.overall_score, 0);
  student.average_score = totalScore / student.total_interviews;
  
  // Update strengths (merge and deduplicate)
  const allStrengths = [...student.strengths, ...interviewSummary.strengths];
  student.strengths = [...new Set(allStrengths)].slice(0, 10); // Keep top 10
  
  // Update weak topics (merge and deduplicate)
  const allWeakTopics = [...student.weak_topics, ...interviewSummary.weak_topics];
  student.weak_topics = [...new Set(allWeakTopics)].slice(0, 10); // Keep top 10
  
  // Update cheating stats
  if (interviewSummary.anti_cheat.flagged) {
    student.cheating_incidents++;
  }
  student.total_warnings += interviewSummary.anti_cheat.warnings;
  
  // Update last activity
  student.last_activity = interviewSummary.date;
}

// =======================================================
// 🎓 GET STUDENT PROFILE
// =======================================================
async function getStudentProfile(student_id) {
  // Use MongoDB if connected
  if (isDbConnected()) {
    try {
      const student = await Student.findOne({ student_id });
      if (!student) return null;
      
      // Get recent interviews
      const recentInterviews = await Interview.find({ student_id })
        .sort({ date: -1 })
        .limit(10);
      
      return {
        student_id: student.student_id,
        institution_id: student.institution_id,
        name: student.name,
        email: student.email,
        total_interviews: student.total_interviews,
        average_score: student.average_score,
        strengths: student.strengths,
        weak_topics: student.weak_topics,
        cheating_incidents: student.cheating_incidents,
        performance_trend: student.performance_trend,
        last_interview_date: student.last_interview_date,
        created_at: student.created_at,
        recent_interviews: recentInterviews
      };
    } catch (error) {
      console.error('Database error in getStudentProfile:', error.message);
      // Fall through to in-memory
    }
  }
  
  // Fallback: In-memory storage
  const student = students.get(student_id);
  if (!student) return null;
  
  // Get recent interviews
  const recentInterviews = student.interview_history
    .slice(-10)
    .reverse()
    .map(h => {
      const interview = interviews.get(h.interview_id);
      return {
        ...h,
        details: interview
      };
    });
  
  return {
    ...student,
    recent_interviews: recentInterviews,
    performance_trend: calculateTrend(student.interview_history)
  };
}

// =======================================================
// 🎓 GET STUDENTS BY INSTITUTION
// =======================================================
async function getStudentsByInstitution(institution_id) {
  // Use MongoDB if connected
  if (isDbConnected()) {
    try {
      const institutionStudents = await Student.find({ institution_id })
        .select('student_id name email total_interviews average_score last_interview_date cheating_incidents')
        .sort({ average_score: -1 });
      
      return institutionStudents.map(s => ({
        student_id: s.student_id,
        name: s.name,
        email: s.email,
        total_interviews: s.total_interviews,
        average_score: s.average_score,
        last_activity: s.last_interview_date,
        cheating_incidents: s.cheating_incidents
      }));
    } catch (error) {
      console.error('Database error in getStudentsByInstitution:', error.message);
      // Fall through to in-memory
    }
  }
  
  // Fallback: In-memory storage
  const institutionStudents = Array.from(students.values())
    .filter(s => s.institution_id === institution_id)
    .map(s => ({
      student_id: s.student_id,
      name: s.name,
      email: s.email,
      total_interviews: s.total_interviews,
      average_score: s.average_score,
      last_activity: s.last_activity,
      cheating_incidents: s.cheating_incidents
    }));
  
  return institutionStudents;
}

// =======================================================
// 🎓 GET ALL STUDENTS (Platform-wide)
// =======================================================
async function getAllStudents(filters = {}) {
  // Use MongoDB if connected
  if (isDbConnected()) {
    try {
      let query = {};
      
      // Apply filters
      if (filters.institution_id) {
        query.institution_id = filters.institution_id;
      }
      
      if (filters.min_score) {
        query.average_score = { $gte: filters.min_score };
      }
      
      if (filters.flagged_only) {
        query.cheating_incidents = { $gt: 0 };
      }
      
      const studentList = await Student.find(query)
        .select('student_id institution_id name total_interviews average_score last_interview_date cheating_incidents')
        .sort({ average_score: -1 });
      
      return studentList.map(s => ({
        student_id: s.student_id,
        institution_id: s.institution_id,
        name: s.name,
        total_interviews: s.total_interviews,
        average_score: s.average_score,
        last_activity: s.last_interview_date,
        cheating_incidents: s.cheating_incidents
      }));
    } catch (error) {
      console.error('Database error in getAllStudents:', error.message);
      // Fall through to in-memory
    }
  }
  
  // Fallback: In-memory storage
  let studentList = Array.from(students.values());
  
  // Apply filters
  if (filters.institution_id) {
    studentList = studentList.filter(s => s.institution_id === filters.institution_id);
  }
  
  if (filters.min_score) {
    studentList = studentList.filter(s => s.average_score >= filters.min_score);
  }
  
  if (filters.flagged_only) {
    studentList = studentList.filter(s => s.cheating_incidents > 0);
  }
  
  // Sort by average score (descending)
  studentList.sort((a, b) => b.average_score - a.average_score);
  
  return studentList.map(s => ({
    student_id: s.student_id,
    institution_id: s.institution_id,
    name: s.name,
    total_interviews: s.total_interviews,
    average_score: s.average_score,
    last_activity: s.last_activity,
    cheating_incidents: s.cheating_incidents
  }));
}

// =======================================================
// 🎓 CALCULATE PERFORMANCE TREND
// =======================================================
function calculateTrend(history) {
  if (history.length < 2) return 'stable';
  
  const recent = history.slice(-5);
  const scores = recent.map(h => h.overall_score);
  
  const firstHalf = scores.slice(0, Math.ceil(scores.length / 2));
  const secondHalf = scores.slice(Math.ceil(scores.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const diff = secondAvg - firstAvg;
  
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

// =======================================================
// 🎓 GET PLATFORM STATISTICS
// =======================================================
async function getPlatformStats() {
  // Use MongoDB if connected
  if (isDbConnected()) {
    try {
      const totalStudents = await Student.countDocuments();
      const totalInterviews = await Interview.countDocuments();
      
      const allStudents = await Student.find();
      const totalScore = allStudents.reduce((sum, s) => sum + (s.average_score * s.total_interviews), 0);
      const totalInterviewCount = allStudents.reduce((sum, s) => sum + s.total_interviews, 0);
      const platformAverage = totalInterviewCount > 0 ? totalScore / totalInterviewCount : 0;
      
      const flaggedStudents = await Student.countDocuments({ cheating_incidents: { $gt: 0 } });
      
      // Get unique institutions
      const institutions = await Student.distinct('institution_id');
      
      // Get active students today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeToday = await Student.countDocuments({ 
        last_interview_date: { $gte: today } 
      });
      
      return {
        total_students: totalStudents,
        total_interviews: totalInterviews,
        total_institutions: institutions.length,
        platform_average_score: platformAverage.toFixed(2),
        flagged_students: flaggedStudents,
        active_students_today: activeToday
      };
    } catch (error) {
      console.error('Database error in getPlatformStats:', error.message);
      // Fall through to in-memory
    }
  }
  
  // Fallback: In-memory storage
  const totalStudents = students.size;
  const totalInterviews = interviews.size;
  
  const allStudents = Array.from(students.values());
  const totalScore = allStudents.reduce((sum, s) => sum + (s.average_score * s.total_interviews), 0);
  const totalInterviewCount = allStudents.reduce((sum, s) => sum + s.total_interviews, 0);
  const platformAverage = totalInterviewCount > 0 ? totalScore / totalInterviewCount : 0;
  
  const flaggedStudents = allStudents.filter(s => s.cheating_incidents > 0).length;
  
  // Get unique institutions
  const institutions = new Set(allStudents.map(s => s.institution_id));
  
  return {
    total_students: totalStudents,
    total_interviews: totalInterviews,
    total_institutions: institutions.size,
    platform_average_score: platformAverage.toFixed(2),
    flagged_students: flaggedStudents,
    active_students_today: getActiveStudentsToday()
  };
}

// =======================================================
// 🎓 GET ACTIVE STUDENTS TODAY
// =======================================================
function getActiveStudentsToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return Array.from(students.values())
    .filter(s => s.last_activity && new Date(s.last_activity) >= today)
    .length;
}

module.exports = {
  upsertStudent,
  recordInterview,
  getStudentProfile,
  getStudentsByInstitution,
  getAllStudents,
  getPlatformStats
};
