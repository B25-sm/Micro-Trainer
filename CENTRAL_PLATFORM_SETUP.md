# 🚀 CENTRAL PLATFORM - QUICK SETUP GUIDE

## Step 1: Install Dependencies

```bash
cd microtrainer-platform
npm install
```

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=6000
NODE_ENV=production
PLATFORM_SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:5000,https://your-customer-backend.com
```

## Step 3: Start Central Platform

```bash
npm start
```

Platform will run on `http://localhost:6000`

---

## Step 4: Create Institution

```bash
curl -X POST http://localhost:6000/api/admin/institutions \
  -H "Content-Type: application/json" \
  -d '{
    "institution_id": "INST001",
    "name": "Test University",
    "email": "admin@test.edu",
    "plan": "free"
  }'
```

Response:
```json
{
  "success": true,
  "institution": {
    "institution_id": "INST001",
    "name": "Test University",
    "api_key": "mt_abc123xyz789...",
    "plan": "free"
  }
}
```

**Save the API key!**

---

## Step 5: Configure Customer Backend

Add to `microtrainer-backend/.env`:

```env
# Central Platform Sync
CENTRAL_PLATFORM_URL=http://localhost:6000
PLATFORM_API_KEY=mt_abc123xyz789...
INSTITUTION_ID=INST001
```

---

## Step 6: Test Sync

### Start Customer Backend
```bash
cd microtrainer-backend
npm start
```

### Complete an Interview
1. Go to `http://localhost:5173`
2. Start an interview
3. Complete 5 questions
4. Check central platform logs

You should see:
```
✅ Interview synced: INT5001 for student STU101
```

---

## Step 7: View Analytics

### Get Platform Stats
```bash
curl http://localhost:6000/api/stats
```

### Get Student Profile
```bash
curl http://localhost:6000/api/students/STU101 \
  -H "X-API-Key: mt_abc123xyz789..."
```

### Get Leaderboard
```bash
curl http://localhost:6000/api/leaderboard/global?limit=10
```

### Get Institution Analytics
```bash
curl http://localhost:6000/api/analytics/institution/INST001 \
  -H "X-API-Key: mt_abc123xyz789..."
```

---

## 🎯 API Endpoints

### Public Endpoints (No Auth)
- `GET /health` - Health check
- `GET /api/stats` - Platform statistics
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/top-performers` - Top performers this week

### Authenticated Endpoints (Require API Key)
- `POST /api/sync/interview` - Sync interview summary
- `POST /api/sync/batch` - Batch sync interviews
- `GET /api/students/:student_id` - Get student profile
- `GET /api/students` - Get all students (institution)
- `GET /api/leaderboard/institution/:id` - Institution leaderboard
- `GET /api/leaderboard/rank/:student_id` - Student rank
- `GET /api/analytics/institution/:id` - Institution analytics
- `GET /api/analytics/cheating` - Cheating analytics
- `GET /api/analytics/trends/:student_id` - Performance trends

### Admin Endpoints (TODO: Add admin auth)
- `POST /api/admin/institutions` - Create institution
- `GET /api/admin/institutions` - Get all institutions
- `GET /api/analytics/platform` - Platform-wide analytics

---

## 🔧 Troubleshooting

### Sync Not Working?

1. **Check API Key**:
```bash
# In customer backend .env
echo $PLATFORM_API_KEY
```

2. **Check Central Platform Running**:
```bash
curl http://localhost:6000/health
```

3. **Check Logs**:
```bash
# Customer backend logs
npm start

# Central platform logs
cd microtrainer-platform
npm start
```

4. **Test Sync Manually**:
```bash
curl -X POST http://localhost:6000/api/sync/interview \
  -H "X-API-Key: mt_abc123xyz789..." \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "TEST001",
    "interview_id": "INT_TEST",
    "date": "2026-05-07",
    "subject": "JavaScript",
    "scores": {
      "technical": 80,
      "communication": 75,
      "confidence": 85,
      "problem_solving": 78,
      "overall": 79.5
    },
    "anti_cheat": {
      "warnings": 0,
      "suspicion_score": 0,
      "cheating_risk": "low",
      "flagged": false
    },
    "strengths": ["React", "JavaScript"],
    "weak_topics": ["System Design"],
    "progress": {},
    "duration_minutes": 30,
    "questions_answered": 5,
    "completion_rate": 100
  }'
```

---

## 📊 Example Responses

### Platform Stats
```json
{
  "total_students": 150,
  "total_interviews": 1250,
  "total_institutions": 5,
  "platform_average_score": "76.5",
  "flagged_students": 3,
  "active_students_today": 25
}
```

### Student Profile
```json
{
  "student_id": "STU101",
  "institution_id": "INST001",
  "name": "Student STU101",
  "total_interviews": 12,
  "average_score": 78.5,
  "strengths": ["React", "JavaScript", "APIs"],
  "weak_topics": ["System Design", "Algorithms"],
  "cheating_incidents": 0,
  "total_warnings": 1,
  "performance_trend": "improving",
  "recent_interviews": [...]
}
```

### Global Leaderboard
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "student_id": "STU042",
      "name": "Student STU042",
      "institution_id": "INST001",
      "average_score": "92.50",
      "total_interviews": 15,
      "badge": "🥇 Champion"
    },
    ...
  ],
  "total": 100
}
```

---

## 🚀 Production Deployment

### Deploy Central Platform

**Option 1: Render**
```bash
# Create new Web Service
# Connect GitHub repo
# Set environment variables
# Deploy!
```

**Option 2: Vercel**
```bash
vercel deploy
```

**Option 3: VPS**
```bash
# SSH to server
git clone https://github.com/your-repo/microtrainer-platform
cd microtrainer-platform
npm install
pm2 start index.js --name microtrainer-platform
```

### Update Customer Backend

```env
CENTRAL_PLATFORM_URL=https://platform.microtrainer.com
PLATFORM_API_KEY=mt_production_key_here
INSTITUTION_ID=INST001
```

---

## ✅ Verification Checklist

- [ ] Central platform running on port 6000
- [ ] Health check returns 200
- [ ] Institution created with API key
- [ ] Customer backend configured with API key
- [ ] Interview sync working (check logs)
- [ ] Student profile accessible
- [ ] Leaderboard showing data
- [ ] Analytics endpoints working

---

## 🎉 You're Done!

Your hybrid self-hosted + centralized tracking platform is now live!

**Next Steps**:
1. Build dashboard UI for visualizing analytics
2. Add admin authentication
3. Add database (MongoDB/PostgreSQL)
4. Deploy to production
5. Add more institutions

**Questions?** Check `CENTRAL_PLATFORM_ARCHITECTURE.md` for detailed documentation.
