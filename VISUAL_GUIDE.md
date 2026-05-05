# 🎨 MICRO TRAINER - VISUAL GUIDE

A visual walkthrough of the system architecture, user flow, and deployment process.

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                           │
│                                                                   │
│  ┌──────────────┐  ┌─────────────────────────────────────┐     │
│  │  Any Website │  │  Micro Trainer Extension            │     │
│  │  (Google,    │  │  ┌───────────────────────────────┐  │     │
│  │   GitHub,    │  │  │  Side Panel (React App)       │  │     │
│  │   YouTube)   │  │  │  - Chat Interface             │  │     │
│  │              │  │  │  - Interview Mode             │  │     │
│  │              │  │  │  - Timer                      │  │     │
│  │              │  │  │  - Feedback Display           │  │     │
│  │              │  │  └───────────────────────────────┘  │     │
│  │              │  │  [🧠 Toggle Button]                 │     │
│  └──────────────┘  └─────────────────────────────────────┘     │
│                                    │                             │
└────────────────────────────────────┼─────────────────────────────┘
                                     │
                                     │ HTTPS API Calls
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Render.com)                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Node.js + Express Server                               │   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │ AI Service   │  │ Interview    │  │ Memory       │ │   │
│  │  │ (Groq SDK)   │  │ Service      │  │ Service      │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │ Tracking     │  │ Ranking      │  │ Analytics    │ │   │
│  │  │ Service      │  │ Service      │  │ Service      │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                    │                             │
└────────────────────────────────────┼─────────────────────────────┘
                                     │
                                     │ Google Sheets API
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE SHEETS (Database)                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Sheet 1: Student History                               │   │
│  │  - studentId | date | subject | score | feedback        │   │
│  │                                                          │   │
│  │  Sheet 2: Performance Tracking                          │   │
│  │  - studentId | avgScore | weakAreas | attempts          │   │
│  │                                                          │   │
│  │  Sheet 3: Leaderboard Data                              │   │
│  │  - rank | studentId | fullstackScore | subjectScores    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                    │                             │
└────────────────────────────────────┼─────────────────────────────┘
                                     │
                                     │ Read-only Access
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  TRAINER DASHBOARD (Vercel)                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  React Web App                                           │   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │ Fullstack    │  │ Subject-wise │  │ Weak Student │ │   │
│  │  │ Leaderboard  │  │ Rankings     │  │ Alerts       │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │   │
│  │  │ Performance  │  │ Trends       │  │ Analytics    │ │   │
│  │  │ Metrics      │  │ Over Time    │  │ Dashboard    │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👤 USER FLOW

### Teaching Mode

```
User on any website
    │
    ▼
Clicks 🧠 toggle button
    │
    ▼
Side panel appears
    │
    ▼
Types question: "What is React?"
    │
    ▼
Backend receives request
    │
    ▼
AI Service (Groq) processes
    │
    ▼
Returns structured answer:
    - WHY (Importance)
    - WHAT (Definition)
    - HOW (Mechanism)
    - CODE (Example)
    - USE CASE (Real-world)
    │
    ▼
User sees formatted response
    │
    ▼
Can ask follow-up questions
```

### Interview Mode

```
User clicks "Start Interview"
    │
    ▼
Selects subject (React/Java/Python)
    │
    ▼
Backend creates session
    │
    ▼
Generates first question
    │
    ▼
Timer starts (30 seconds)
    │
    ▼
User types answer
    │
    ▼
Submits answer
    │
    ▼
Backend evaluates:
    - Technical accuracy
    - Communication clarity
    - Completeness
    │
    ▼
Returns feedback:
    - Score (0-10)
    - What was good
    - What was missing
    - Improvement tips
    │
    ▼
Logs to Google Sheets
    │
    ▼
Updates student memory
    │
    ▼
Next question (adaptive)
    │
    ▼
Repeat until session complete
    │
    ▼
Final report with:
    - Overall score
    - Weak areas
    - Strong areas
    - Recommendations
```

---

## 🔄 DATA FLOW

### Question → Answer Flow

```
┌──────────────┐
│ User Input   │
│ "Question"   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Extension Content Script             │
│ - Captures input                     │
│ - Adds studentId from storage        │
└──────┬───────────────────────────────┘
       │
       │ POST /ask
       ▼
┌──────────────────────────────────────┐
│ Backend API                          │
│ - Validates input                    │
│ - Checks student memory              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ AI Service (Groq)                    │
│ - Processes with context             │
│ - Generates structured response      │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Backend Response                     │
│ - Formats answer                     │
│ - Adds metadata                      │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Extension Displays                   │
│ - Renders formatted answer           │
│ - Shows in chat bubble               │
└──────────────────────────────────────┘
```

### Interview Evaluation Flow

```
┌──────────────┐
│ User Answer  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Backend Interview Service            │
│ - Receives answer + question         │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ AI Evaluation                        │
│ - Compares to ideal answer           │
│ - Scores technical accuracy          │
│ - Scores communication               │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Tracking Service                     │
│ - Logs to Google Sheets              │
│ - Updates student stats              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Memory Service                       │
│ - Updates weak concepts              │
│ - Updates strong concepts            │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Response to User                     │
│ - Feedback card                      │
│ - Score display                      │
│ - Next question                      │
└──────────────────────────────────────┘
```

---

## 🚀 DEPLOYMENT FLOW

### Step 1: Backend Deployment

```
Local Code
    │
    ▼
Push to GitHub
    │
    ▼
┌─────────────────────────────────┐
│ Render.com                      │
│ 1. Create Web Service           │
│ 2. Connect GitHub repo          │
│ 3. Add ENV variables:           │
│    - GROQ_API_KEY               │
│    - SHEET_ID                   │
│    - PORT                       │
│ 4. Build: npm install           │
│ 5. Start: node index.js         │
└─────────────┬───────────────────┘
              │
              ▼
    Backend Live at:
    https://your-app.onrender.com
              │
              ▼
    Test Endpoints:
    ✅ GET  /
    ✅ POST /ask
    ✅ POST /interview/start
    ✅ GET  /trainer/leaderboard
```

### Step 2: Frontend Deployment

```
Local Code
    │
    ▼
Update API URL in src/api.js
    │
    ▼
Test Build: npm run build
    │
    ▼
Push to GitHub
    │
    ▼
┌─────────────────────────────────┐
│ Vercel.com                      │
│ 1. Import GitHub repo           │
│ 2. Framework: Vite              │
│ 3. Build: npm run build         │
│ 4. Output: dist                 │
│ 5. Deploy                       │
└─────────────┬───────────────────┘
              │
              ▼
    Frontend Live at:
    https://your-app.vercel.app
              │
              ▼
    Test Features:
    ✅ Home page
    ✅ Chat interface
    ✅ Interview mode
    ✅ Dashboard
```

### Step 3: Extension Build

```
Local Code
    │
    ▼
Update API URL in background.js
    │
    ▼
Run Build Script:
    ./build.sh (Mac/Linux)
    .\build.ps1 (Windows)
    │
    ▼
┌─────────────────────────────────┐
│ Build Process                   │
│ 1. Build React frontend         │
│ 2. Copy to extension/dist       │
│ 3. Validate manifest.json       │
│ 4. Create production ZIP        │
└─────────────┬───────────────────┘
              │
              ▼
    Extension Package Ready:
    microtrainer-extension.zip
              │
              ▼
    Test Locally:
    chrome://extensions/
    → Load unpacked
              │
              ▼
    Test on Multiple Sites:
    ✅ Google.com
    ✅ GitHub.com
    ✅ YouTube.com
```

### Step 4: Chrome Web Store

```
Extension Tested
    │
    ▼
Add Icons (16, 48, 128)
    │
    ▼
Create Screenshots
    │
    ▼
┌─────────────────────────────────┐
│ Chrome Web Store Dashboard      │
│ 1. Pay $5 developer fee         │
│ 2. Upload ZIP                   │
│ 3. Fill store listing           │
│ 4. Add screenshots              │
│ 5. Submit for review            │
└─────────────┬───────────────────┘
              │
              ▼
    Review (1-3 days)
              │
              ▼
    ✅ PUBLISHED!
              │
              ▼
    Users can install from:
    Chrome Web Store
```

---

## 🎯 EXTENSION UI LAYOUT

```
┌─────────────────────────────────────────────────────────┐
│                    ANY WEBSITE                           │
│                                                          │
│  ┌────────────────────────┐  ┌──────────────────────┐  │
│  │                        │  │  MICRO TRAINER       │  │
│  │                        │  │  ┌────────────────┐  │  │
│  │                        │  │  │ 🧠 Micro Trainer│ │  │
│  │   Website Content      │  │  └────────────────┘  │  │
│  │   (Google, GitHub,     │  │                      │  │
│  │    YouTube, etc.)      │  │  ┌────────────────┐  │  │
│  │                        │  │  │ Chat History   │  │  │
│  │                        │  │  │                │  │  │
│  │                        │  │  │ User: Question │  │  │
│  │                        │  │  │ AI: Answer     │  │  │
│  │                        │  │  │                │  │  │
│  │                        │  │  └────────────────┘  │  │
│  │                        │  │                      │  │
│  │                        │  │  ┌────────────────┐  │  │
│  │                        │  │  │ Input Box      │  │  │
│  │                        │  │  │ [Type here...] │  │  │
│  │                        │  │  └────────────────┘  │  │
│  │                        │  │                      │  │
│  │                        │  │  [Start Interview]   │  │
│  │                        │  │  [View Dashboard]    │  │
│  │                        │  │                      │  │
│  └────────────────────────┘  └──────────────────────┘  │
│                                                          │
│  [🧠] ← Toggle Button (fixed position)                  │
│                                                          │
└─────────────────────────────────────────────────────────┘

Width: 420px (desktop) | 100% (mobile)
Height: 100vh
Position: Fixed right
Z-index: Maximum (always on top)
```

---

## 📊 TRAINER DASHBOARD LAYOUT

```
┌─────────────────────────────────────────────────────────┐
│  MICRO TRAINER - TRAINER DASHBOARD                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Total        │  │ Active       │  │ Avg Score    │ │
│  │ Students     │  │ Today        │  │ This Week    │ │
│  │   150        │  │    45        │  │    7.8/10    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  FULLSTACK LEADERBOARD                          │   │
│  ├─────┬──────────────┬───────┬──────────────────┤   │
│  │ Rank│ Student ID   │ Score │ Subjects         │   │
│  ├─────┼──────────────┼───────┼──────────────────┤   │
│  │  1  │ student_123  │  9.2  │ React, Java, Py  │   │
│  │  2  │ student_456  │  8.9  │ React, Java      │   │
│  │  3  │ student_789  │  8.7  │ React, Python    │   │
│  └─────┴──────────────┴───────┴──────────────────┘   │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ React        │  │ Java         │  │ Python       │ │
│  │ Leaderboard  │  │ Leaderboard  │  │ Leaderboard  │ │
│  │              │  │              │  │              │ │
│  │ 1. student_A │  │ 1. student_X │  │ 1. student_P │ │
│  │ 2. student_B │  │ 2. student_Y │  │ 2. student_Q │ │
│  │ 3. student_C │  │ 3. student_Z │  │ 3. student_R │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  WEAK STUDENTS (Need Attention)                 │   │
│  ├──────────────┬───────┬──────────────────────────┤   │
│  │ Student ID   │ Score │ Weak Areas               │   │
│  ├──────────────┼───────┼──────────────────────────┤   │
│  │ student_999  │  4.2  │ State, Hooks, API        │   │
│  │ student_888  │  4.8  │ Rendering, Props         │   │
│  └──────────────┴───────┴──────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  PERFORMANCE TRENDS                             │   │
│  │  [Line Chart: Avg Score Over Time]              │   │
│  │                                                  │   │
│  │   10 ┤                                    ╭─    │   │
│  │    9 ┤                          ╭────╮───╯      │   │
│  │    8 ┤                    ╭─────╯    │          │   │
│  │    7 ┤              ╭─────╯          │          │   │
│  │    6 ┤        ╭─────╯                │          │   │
│  │    5 ┤  ╭─────╯                      │          │   │
│  │      └──┴────┴────┴────┴────┴────┴───┴────      │   │
│  │       Week1 Week2 Week3 Week4 Week5 Week6       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 BUILD PROCESS FLOW

```
┌─────────────────────────────────────────────────────────┐
│  BUILD SCRIPT EXECUTION                                  │
└─────────────────────────────────────────────────────────┘

Step 1: Build React Frontend
    │
    ├─ cd microtrainer-frontend
    ├─ npm install
    ├─ npm run build
    │
    ▼
    dist/ folder created
    ├─ index.html
    ├─ assets/
    │  ├─ index-[hash].js
    │  └─ index-[hash].css
    └─ ...

Step 2: Copy to Extension
    │
    ├─ cd microtrainer-extension
    ├─ rm -rf dist
    ├─ mkdir dist
    ├─ cp -r ../microtrainer-frontend/dist/* ./dist/
    │
    ▼
    Extension dist/ populated

Step 3: Validate Manifest
    │
    ├─ Check manifest.json exists
    ├─ Validate JSON syntax
    │
    ▼
    ✅ Manifest valid

Step 4: Create Production ZIP
    │
    ├─ Exclude: .git, node_modules, .DS_Store
    ├─ Include: manifest.json, content.js, background.js,
    │           popup.html, popup.js, styles.css, dist/
    │
    ▼
    microtrainer-extension.zip created

Step 5: Summary
    │
    ├─ ✅ Frontend built
    ├─ ✅ Files copied
    ├─ ✅ Manifest validated
    ├─ ✅ ZIP created
    │
    ▼
    Ready for Chrome Web Store!
```

---

## 🎨 COLOR SCHEME

```
Primary Colors:
┌────────────────────────────────────────┐
│ Purple Gradient                        │
│ #667eea → #764ba2                      │
│ Used for: Buttons, Headers, Branding  │
└────────────────────────────────────────┘

Secondary Colors:
┌────────────────────────────────────────┐
│ Pink Gradient (Active State)           │
│ #f093fb → #f5576c                      │
│ Used for: Active states, Highlights   │
└────────────────────────────────────────┘

Neutral Colors:
┌────────────────────────────────────────┐
│ White: #ffffff (Background)            │
│ Gray: #f3f4f6 (Secondary BG)           │
│ Dark: #1f2937 (Text)                   │
└────────────────────────────────────────┘

Status Colors:
┌────────────────────────────────────────┐
│ Success: #4ade80 (Green)               │
│ Warning: #fbbf24 (Yellow)              │
│ Error: #ef4444 (Red)                   │
│ Info: #3b82f6 (Blue)                   │
└────────────────────────────────────────┘
```

---

## 📱 RESPONSIVE BREAKPOINTS

```
Desktop (> 768px):
┌─────────────────────────────────────┐
│  Website Content  │  Side Panel     │
│  (Full width)     │  (420px fixed)  │
└─────────────────────────────────────┘

Mobile (≤ 768px):
┌─────────────────────────────────────┐
│  Side Panel (100% width)            │
│  (Covers entire screen when open)   │
└─────────────────────────────────────┘

Toggle Button:
- Desktop: Right side, moves when panel open
- Mobile: Fixed position, semi-transparent when panel open
```

---

## 🔐 SECURITY FLOW

```
Extension → Backend
    │
    ├─ HTTPS only
    ├─ CORS validation
    ├─ Input sanitization
    │
    ▼
Backend → AI Service
    │
    ├─ API key in ENV
    ├─ Rate limiting
    ├─ Error handling
    │
    ▼
Backend → Google Sheets
    │
    ├─ Service account auth
    ├─ Write-only access
    ├─ Data validation
    │
    ▼
Trainer Dashboard
    │
    ├─ Read-only access
    ├─ Role-based auth
    ├─ No sensitive data exposed
```

---

## 📈 MONITORING DASHBOARD

```
┌─────────────────────────────────────────────────────────┐
│  SYSTEM HEALTH DASHBOARD                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Backend (Render)                                        │
│  ├─ Status: ● Online                                    │
│  ├─ Uptime: 99.8%                                       │
│  ├─ Response Time: 1.2s avg                             │
│  └─ Error Rate: 0.1%                                    │
│                                                          │
│  Frontend (Vercel)                                       │
│  ├─ Status: ● Online                                    │
│  ├─ Load Time: 0.8s avg                                 │
│  ├─ Visitors: 1,234 today                               │
│  └─ Bounce Rate: 15%                                    │
│                                                          │
│  Extension (Chrome Web Store)                            │
│  ├─ Installs: 5,678 total                               │
│  ├─ Active Users: 3,456 daily                           │
│  ├─ Rating: ★★★★★ 4.8/5                                │
│  └─ Reviews: 234 total                                  │
│                                                          │
│  Database (Google Sheets)                                │
│  ├─ Status: ● Online                                    │
│  ├─ Records: 12,345 total                               │
│  ├─ Last Update: 2 min ago                              │
│  └─ Storage: 45% used                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

**This visual guide provides a comprehensive overview of the Micro Trainer system architecture, user flows, and deployment process.**

**For detailed instructions, see:**
- `DEPLOYMENT_GUIDE.md` - Full deployment guide
- `QUICK_START.md` - Fast-track guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist

---

**Last Updated:** May 5, 2026  
**Version:** 1.0.0
