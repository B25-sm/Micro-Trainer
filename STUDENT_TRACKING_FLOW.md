# 🔄 Student Tracking Flow - Visual Guide

## 📊 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STUDENT SIDE                                 │
│                                                                      │
│  ┌──────────────────┐         ┌──────────────────┐                 │
│  │  Chrome Extension│         │   Web Interface  │                 │
│  │  (Any Website)   │         │  (Browser)       │                 │
│  └────────┬─────────┘         └────────┬─────────┘                 │
│           │                            │                            │
│           │  Student completes         │  Student completes        │
│           │  interview (20 Q's)        │  interview (20 Q's)       │
│           │                            │                            │
│           └────────────┬───────────────┘                            │
│                        │                                            │
│                        │ HTTPS POST /interview/answer               │
│                        │ { sessionId, answer, studentId }           │
└────────────────────────┼────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND API SERVER                              │
│                   (microtrainer-backend)                             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  1. Receive Answer                                          │    │
│  │     • Extract studentId, sessionId, answer                  │    │
│  │     • Validate input                                        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                         │                                            │
│                         ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  2. AI Evaluation (aiService.js)                            │    │
│  │     • Send to Groq API                                      │    │
│  │     • Get AI feedback                                       │    │
│  │     • Calculate scores (0-10)                               │    │
│  │     • Identify mistakes                                     │    │
│  └────────────────────────────────────────────────────────────┘    │
│                         │                                            │
│                         ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  3. Score Calculation (interviewService.js)                 │    │
│  │     • Technical score (0-10)                                │    │
│  │     • Communication score (Poor/Average/Good)               │    │
│  │     • Overall score                                         │    │
│  │     • Weak areas detection                                  │    │
│  └────────────────────────────────────────────────────────────┘    │
│                         │                                            │
│                         ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  4. Data Storage (trackingService.js)                       │    │
│  │     • Format data for storage                               │    │
│  │     • Add timestamp                                         │    │
│  │     • Prepare for multiple destinations                     │    │
│  └────────────────────────────────────────────────────────────┘    │
│                         │                                            │
│           ┌─────────────┴─────────────┐                             │
│           │                           │                             │
│           ▼                           ▼                             │
│  ┌──────────────────┐      ┌──────────────────────┐               │
│  │ sheetsService.js │      │ centralPlatformSync  │               │
│  │                  │      │ (Optional)           │               │
│  │ Saves to:        │      │                      │               │
│  │ Google Sheets    │      │ Saves summary to:    │               │
│  │                  │      │ Central Platform     │               │
│  └──────────────────┘      └──────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
           │                           │
           │                           │
           ▼                           ▼
┌──────────────────────┐    ┌──────────────────────────┐
│   GOOGLE SHEETS      │    │   CENTRAL PLATFORM       │
│                      │    │   (Optional)             │
│   Stores:            │    │                          │
│   • Student ID       │    │   Stores:                │
│   • Date/Time        │    │   • Lightweight summary  │
│   • Subject          │    │   • Scores only          │
│   • Question         │    │   • No raw data          │
│   • Answer           │    │   • Multi-institution    │
│   • Score            │    │                          │
│   • Communication    │    │   Size: ~2KB/interview   │
│   • Technical        │    │                          │
│   • Mistakes         │    │                          │
│                      │    │                          │
│   Size: ~1KB/row     │    │                          │
└──────────┬───────────┘    └──────────────────────────┘
           │
           │ Trainer requests data
           │
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA RETRIEVAL LAYER                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  readSheetsService.js                                       │    │
│  │  • Reads all student history from Google Sheets             │    │
│  │  • Parses data into structured format                       │    │
│  │  • Returns array of interview records                       │    │
│  └────────────────────────────────────────────────────────────┘    │
│                         │                                            │
│                         ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  rankingService.js                                          │    │
│  │  • Groups data by student                                   │    │
│  │  • Calculates averages per subject                          │    │
│  │  • Calculates fullstack score                               │    │
│  │  • Sorts by score                                           │    │
│  │  • Assigns ranks                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                         │                                            │
│                         ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  API Endpoints                                              │    │
│  │  • GET /trainer/leaderboard                                 │    │
│  │  • GET /trainer/leaderboard/:subject                        │    │
│  │  • GET /student/:id/analytics                               │    │
│  │  • GET /dashboard/overview                                  │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ HTTP Response
           │
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       TRAINER DASHBOARD                              │
│                  (TrainerDashboard.jsx)                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Displays:                                                  │    │
│  │  • Leaderboard with rankings                                │    │
│  │  • Student scores                                           │    │
│  │  • Subject breakdown                                        │    │
│  │  • Performance metrics                                      │    │
│  │  • Weak students list                                       │    │
│  │  • Trends analysis                                          │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Trainer Actions:                                           │    │
│  │  • Filter by subject                                        │    │
│  │  • View individual student details                          │    │
│  │  • Identify weak students                                   │    │
│  │  • Track improvement trends                                 │    │
│  │  • Export data (future)                                     │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Detailed Step-by-Step Flow

### **Step 1: Student Completes Interview**

**Location:** Chrome Extension OR Web Interface

```javascript
// Student answers question
const response = await fetch(`${API_URL}/interview/answer`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session_123',
    answer: 'React is a JavaScript library...',
    studentId: 'student_456'
  })
});
```

**Data Sent:**
```json
{
  "sessionId": "session_123",
  "answer": "React is a JavaScript library for building user interfaces",
  "studentId": "student_456"
}
```

---

### **Step 2: Backend Processes Answer**

**File:** `microtrainer-backend/services/interviewSessionService.js`

```javascript
async function submitAnswer(sessionId, answer) {
  // 1. Get session
  const session = sessions[sessionId];
  
  // 2. Evaluate answer with AI
  const feedback = await evaluateAnswer({
    question: session.currentQuestion,
    answer: answer,
    subject: session.subject,
    studentId: session.studentId
  });
  
  // 3. Store result
  session.history.push({
    question: session.currentQuestion,
    answer: answer,
    score: feedback.score,
    communication: feedback.communication,
    technical: feedback.technical,
    mistakes: feedback.mistakes
  });
  
  // 4. Save to Google Sheets
  await updateStudentStats(session.studentId, {
    subject: session.subject,
    score: feedback.score,
    communication: feedback.communication,
    technical: feedback.technical,
    question: session.currentQuestion,
    answer: answer,
    mistakes: feedback.mistakes
  });
  
  // 5. Move to next question
  session.currentQuestionIndex++;
  
  return feedback;
}
```

---

### **Step 3: Data Saved to Google Sheets**

**File:** `microtrainer-backend/services/trackingService.js`

```javascript
async function updateStudentStats(studentId, result) {
  const today = new Date().toISOString().split("T")[0];
  
  await sheets.logInterview({
    studentId: studentId,
    date: today,
    subject: result.subject,
    question: result.question,
    answer: result.answer,
    score: result.score,
    communication: result.communication,
    technical: result.technical,
    mistakes: result.mistakes
  });
}
```

**Google Sheets Row:**
```
| Student ID  | Date       | Subject | Question      | Answer    | Score | Comm | Tech | Mistakes |
|-------------|------------|---------|---------------|-----------|-------|------|------|----------|
| student_456 | 2026-05-13 | React   | What is JSX?  | JSX is... | 8.5   | Good | Good | None     |
```

---

### **Step 4: Trainer Requests Leaderboard**

**Frontend:** `TrainerDashboard.jsx`

```javascript
const fetchLeaderboard = async () => {
  const url = subject === "fullstack"
    ? `${BASE_URL}/trainer/leaderboard`
    : `${BASE_URL}/trainer/leaderboard/${subject}`;
  
  const res = await axios.get(url, {
    headers: { role: "trainer" }
  });
  
  setStudents(res.data);
};
```

---

### **Step 5: Backend Builds Leaderboard**

**File:** `microtrainer-backend/services/rankingService.js`

```javascript
async function getLeaderboard(subject = null) {
  // 1. Read all student history from Google Sheets
  const data = await getAllStudentsHistory();
  
  // 2. Build student profiles
  const profiles = buildProfiles(data);
  
  // 3. Rank students
  const ranked = rankStudents(profiles, subject);
  
  return ranked;
}

function buildProfiles(data) {
  const students = {};
  
  data.forEach((row) => {
    const { studentId, subject, score } = row;
    
    if (!students[studentId]) {
      students[studentId] = {
        studentId,
        subjects: {},
        totalScore: 0,
        totalAttempts: 0
      };
    }
    
    if (!students[studentId].subjects[subject]) {
      students[studentId].subjects[subject] = {
        total: 0,
        count: 0
      };
    }
    
    students[studentId].subjects[subject].total += score;
    students[studentId].subjects[subject].count += 1;
    students[studentId].totalScore += score;
    students[studentId].totalAttempts += 1;
  });
  
  // Calculate averages
  return Object.values(students).map((s) => ({
    studentId: s.studentId,
    subjects: calculateSubjectAverages(s.subjects),
    fullstackScore: (s.totalScore / s.totalAttempts).toFixed(2)
  }));
}

function rankStudents(profiles, subject = null) {
  return profiles
    .map((s) => ({
      ...s,
      score: subject 
        ? parseFloat(s.subjects[subject] || 0)
        : parseFloat(s.fullstackScore)
    }))
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({
      rank: i + 1,
      ...s
    }));
}
```

---

### **Step 6: Trainer Sees Results**

**Dashboard Display:**

```
┌─────────────────────────────────────────────────────────────┐
│  TRAINER DASHBOARD                                           │
│                                                              │
│  Filter: [Fullstack ▼]                                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Rank │ Student ID    │ Score │ Subjects               │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  #1  │ student_456   │ 87.50 │ React: 92 | Java: 85  │ │ ← This student!
│  │  #2  │ student_789   │ 82.30 │ React: 88 | JS: 78    │ │
│  │  #3  │ student_012   │ 78.90 │ Python: 82 | Java: 76 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Points

### **1. Automatic Tracking**
- ✅ Every interview answer is automatically saved
- ✅ No manual action required from student or trainer
- ✅ Works for both extension and web users

### **2. Real-Time Updates**
- ✅ Data saved immediately after each answer
- ✅ Leaderboard reflects latest data
- ✅ No delay or batch processing

### **3. Unified Student Identity**
- ✅ Same student ID across extension and web
- ✅ Stored in browser localStorage (web) or Chrome storage (extension)
- ✅ Persists across sessions

### **4. Complete Visibility**
- ✅ Trainers see ALL student activity
- ✅ No difference between extension and web users
- ✅ All data flows to same Google Sheets

---

## 🔐 Student ID Management

### **How Student IDs Are Generated:**

**Web Interface:**
```javascript
// In frontend (Home.jsx or Interview.jsx)
let studentId = localStorage.getItem('studentId');

if (!studentId) {
  studentId = 'student_' + Date.now();
  localStorage.setItem('studentId', studentId);
}
```

**Chrome Extension:**
```javascript
// In background.js
chrome.storage.sync.get(['studentId'], (data) => {
  let studentId = data.studentId;
  
  if (!studentId) {
    studentId = 'student_' + Date.now();
    chrome.storage.sync.set({ studentId });
  }
});
```

### **Student ID Persistence:**

| Platform | Storage | Persistence |
|----------|---------|-------------|
| Web | localStorage | Until cache cleared |
| Extension | Chrome storage | Until extension removed |
| Both | Backend (Google Sheets) | Forever |

---

## 📊 Data Flow Summary

```
Student Answer
    ↓
Backend API
    ↓
AI Evaluation (Groq)
    ↓
Score Calculation
    ↓
Google Sheets Storage
    ↓
Trainer Dashboard Request
    ↓
Read from Google Sheets
    ↓
Build Leaderboard
    ↓
Display to Trainer
```

**Total Time:** < 2 seconds from answer to storage  
**Visibility:** Immediate (on next dashboard refresh)

---

## 🎉 Conclusion

**As a trainer, you have COMPLETE visibility into student progress, regardless of whether they use:**
- ✅ Chrome Extension
- ✅ Web Interface
- ✅ Mobile Browser

**All student activity flows through the same backend API and is stored in the same Google Sheets, making tracking seamless and unified!**

---

**Last Updated:** May 13, 2026  
**Version:** 1.0.0
