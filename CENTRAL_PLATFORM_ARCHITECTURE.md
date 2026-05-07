# 🏗️ CENTRAL PLATFORM ARCHITECTURE

## Overview

The MicroTrainer platform uses a **Hybrid Self-Hosted + Centralized Tracking** architecture to minimize costs while maintaining comprehensive student progress tracking.

---

## 🎯 Architecture Goals

1. **Cost Efficiency**: Customers pay for their own infrastructure (AI, storage, bandwidth)
2. **Centralized Tracking**: Platform owner tracks all student progress
3. **Scalability**: System can handle thousands of institutions
4. **Privacy**: Raw data stays with customer, only summaries are synced

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│         CUSTOMER DEPLOYMENT (Self-hosted)               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Browser (Student)                                      │
│  ├── Anti-cheat logic (local)                          │
│  ├── Webcam monitoring (local)                         │
│  ├── Face detection (local)                            │
│  └── Interview UI                                      │
│                                                         │
│  Customer Backend (Render/Vercel/VPS)                  │
│  ├── Interview sessions                                │
│  ├── AI processing (customer's API key)                │
│  ├── Full transcripts storage                          │
│  ├── Video storage (optional)                          │
│  ├── Detailed logs                                     │
│  └── Customer's database                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         ↓
              (Sync lightweight analytics)
                         ↓
┌─────────────────────────────────────────────────────────┐
│      CENTRAL PLATFORM (Platform Owner)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Central Dashboard                                      │
│  ├── Student progress tracking                         │
│  ├── Interview history (summaries only)                │
│  ├── Scores & rankings                                 │
│  ├── Strengths & weaknesses                            │
│  ├── Improvement trends                                │
│  ├── Cheating risk scores                              │
│  ├── Leaderboards                                      │
│  └── Institution analytics                             │
│                                                         │
│  Lightweight Database                                   │
│  ├── Student profiles                                  │
│  ├── Interview summaries (NO raw data)                │
│  ├── Scores & metrics                                  │
│  └── Progress tracking                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 What Gets Synced

### ✅ SYNCED (Lightweight - ~1-2 KB per interview)

```json
{
  "student_id": "STU101",
  "institution_id": "INST001",
  "interview_id": "INT5001",
  "date": "2026-05-07",
  "subject": "JavaScript",
  "scores": {
    "technical": 81,
    "communication": 77,
    "confidence": 84,
    "problem_solving": 79,
    "overall": 80
  },
  "anti_cheat": {
    "warnings": 1,
    "suspicion_score": 25,
    "cheating_risk": "low",
    "flagged": false
  },
  "strengths": ["React", "APIs", "JavaScript"],
  "weak_topics": ["System Design", "DB Optimization"],
  "progress": {
    "compared_to_previous": "+14%",
    "consistency_score": 85,
    "interview_count": 12
  },
  "duration_minutes": 45,
  "questions_answered": 20,
  "completion_rate": 100
}
```

### ❌ NOT SYNCED (Heavy - stays with customer)

- ❌ Full video recordings
- ❌ Raw webcam streams
- ❌ Complete transcripts
- ❌ Entire AI conversation logs
- ❌ Detailed event logs
- ❌ Question/answer pairs

---

## 🔑 API Key Authentication

### Institution Setup

1. Platform owner creates institution:
```bash
POST /api/admin/institutions
{
  "institution_id": "INST001",
  "name": "ABC University",
  "email": "admin@abc.edu",
  "plan": "free"
}
```

2. Platform returns API key:
```json
{
  "institution_id": "INST001",
  "name": "ABC University",
  "api_key": "mt_abc123xyz789...",
  "plan": "free"
}
```

3. Customer adds to their `.env`:
```env
CENTRAL_PLATFORM_URL=https://platform.microtrainer.com
PLATFORM_API_KEY=mt_abc123xyz789...
INSTITUTION_ID=INST001
```

---

## 🔄 Sync Flow

### Automatic Sync (After Interview)

```javascript
// Customer Backend (interviewSessionService.js)
if (interview.completed) {
  // Prepare lightweight summary
  const syncData = {
    studentId: session.studentId,
    sessionId: sessionId,
    subject: session.subject,
    scores: final,
    anti_cheat: antiCheatData,
    strengths: extractedStrengths,
    weak_topics: extractedWeakTopics
  };
  
  // Sync in background (non-blocking)
  syncInterviewToCentral(syncData);
}
```

### Batch Sync (For Backfilling)

```javascript
// Sync historical data
const interviews = await getHistoricalInterviews();
await batchSyncInterviews(interviews);
```

---

## 📡 Central Platform API

### Sync Endpoints

#### Sync Single Interview
```
POST /api/sync/interview
Headers: X-API-Key: mt_abc123xyz789...
Body: { interview summary }
```

#### Batch Sync
```
POST /api/sync/batch
Headers: X-API-Key: mt_abc123xyz789...
Body: { interviews: [ ... ] }
```

### Student Endpoints

#### Get Student Profile
```
GET /api/students/:student_id
Headers: X-API-Key: mt_abc123xyz789...
```

#### Get All Students (Institution)
```
GET /api/students
Headers: X-API-Key: mt_abc123xyz789...
```

### Leaderboard Endpoints

#### Global Leaderboard
```
GET /api/leaderboard/global?limit=100
```

#### Institution Leaderboard
```
GET /api/leaderboard/institution/:institution_id
Headers: X-API-Key: mt_abc123xyz789...
```

#### Student Rank
```
GET /api/leaderboard/rank/:student_id?scope=global
Headers: X-API-Key: mt_abc123xyz789...
```

### Analytics Endpoints

#### Institution Analytics
```
GET /api/analytics/institution/:institution_id
Headers: X-API-Key: mt_abc123xyz789...
```

#### Platform Analytics (Admin)
```
GET /api/analytics/platform
```

#### Cheating Analytics
```
GET /api/analytics/cheating?institution_id=INST001
Headers: X-API-Key: mt_abc123xyz789...
```

#### Performance Trends
```
GET /api/analytics/trends/:student_id
Headers: X-API-Key: mt_abc123xyz789...
```

---

## 💰 Cost Comparison

### Current Architecture (Centralized)
- 1000 students × 10 interviews = 10,000 interviews
- AI cost: 10,000 × $0.005 = **$50**
- Storage: 10,000 × 100MB = **1TB** = **$20-50/month**
- Bandwidth: **$100+/month**
- **Total: $170-200/month**

### New Architecture (Hybrid)
- **Customer pays**: AI, storage, bandwidth
- **You pay**: Only lightweight analytics storage
- 10,000 interviews × 2KB = **20MB** = **$0.01/month**
- **Total: ~$0.01/month** (99.99% cost reduction!)

---

## 🚀 Deployment

### Central Platform

```bash
cd microtrainer-platform
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

### Customer Backend

Add to `.env`:
```env
CENTRAL_PLATFORM_URL=https://platform.microtrainer.com
PLATFORM_API_KEY=mt_your_api_key_here
INSTITUTION_ID=your_institution_id
```

---

## 🎯 Business Model

### Free/Open Source Tier
- Customer deploys their own backend
- Customer uses their own API keys
- Customer stores their own data
- **You provide**: Software + Central dashboard access

### Premium Tier (Future)
- Fully managed hosting
- You handle infrastructure
- You provide API keys
- **Customer pays**: Monthly subscription

---

## 📊 Dashboard Features

### Student View
- Interview history (summaries)
- Score trends over time
- Strengths & weaknesses
- Improvement percentage
- Cheating risk score
- Rank in institution/global

### Institution View
- All students in institution
- Average scores
- Top performers
- Students at risk
- Cheating incidents
- Progress trends

### Platform Owner View
- All institutions
- Total students
- Total interviews
- Platform-wide analytics
- Revenue tracking (if premium)
- Usage statistics

---

## 🔒 Security

### API Key Security
- API keys are institution-specific
- Keys can be regenerated
- Keys can be deactivated
- All requests are authenticated

### Data Privacy
- Raw data never leaves customer deployment
- Only aggregated summaries are synced
- Students can't be identified across institutions
- GDPR compliant (no PII in central platform)

---

## 📈 Scalability

### Current Capacity (In-Memory)
- ~10,000 students
- ~100,000 interviews
- ~100 institutions

### Production (With Database)
- Unlimited students
- Unlimited interviews
- Unlimited institutions

### Recommended Database
- MongoDB (flexible schema)
- PostgreSQL (relational)
- Redis (caching layer)

---

## ✅ Summary

The Hybrid Architecture provides:

1. ✅ **Cost Efficiency**: 99.99% cost reduction
2. ✅ **Scalability**: Handles thousands of institutions
3. ✅ **Privacy**: Raw data stays with customer
4. ✅ **Centralized Tracking**: Complete student progress visibility
5. ✅ **Flexibility**: Customers can self-host or use managed service

**Perfect for SaaS business model!** 🚀
