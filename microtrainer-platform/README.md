# 🎓 MicroTrainer Central Platform

**Student Progress Tracking & Analytics Dashboard**

---

## 🎯 Purpose

The Central Platform tracks student interview progress, skill growth, weaknesses, strengths, cheating behavior, and improvement trends across all institutions using the MicroTrainer system.

---

## 🏗️ Architecture

### Hybrid Self-Hosted + Centralized Tracking

- **Customer Deployment**: Handles heavy processing (AI, storage, bandwidth)
- **Central Platform**: Tracks lightweight analytics and progress metrics

### Cost Savings: 99.99%

- Customer pays for their infrastructure
- Platform owner only stores summaries (~2KB per interview)
- Scales to thousands of institutions at minimal cost

---

## 📊 Features

### Student Tracking
- ✅ Interview history (summaries only)
- ✅ Score trends over time
- ✅ Strengths & weaknesses identification
- ✅ Improvement percentage tracking
- ✅ Cheating risk scoring
- ✅ Performance trend analysis

### Leaderboards
- ✅ Global leaderboard
- ✅ Institution-specific leaderboards
- ✅ Student ranking & percentiles
- ✅ Top performers (weekly)
- ✅ Badge system

### Analytics
- ✅ Institution analytics
- ✅ Platform-wide analytics
- ✅ Cheating analytics
- ✅ Performance trends
- ✅ Score distribution
- ✅ Activity tracking

### Institution Management
- ✅ API key generation
- ✅ Multi-tenancy support
- ✅ Usage tracking
- ✅ Plan management (free/premium)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Server
```bash
npm start
```

Server runs on `http://localhost:6000`

---

## 📡 API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `GET /api/stats` - Platform statistics
- `GET /api/leaderboard/global` - Global leaderboard

### Sync Endpoints (Require API Key)
- `POST /api/sync/interview` - Sync interview summary
- `POST /api/sync/batch` - Batch sync interviews

### Student Endpoints (Require API Key)
- `GET /api/students/:student_id` - Get student profile
- `GET /api/students` - Get all students

### Leaderboard Endpoints
- `GET /api/leaderboard/institution/:id` - Institution leaderboard
- `GET /api/leaderboard/rank/:student_id` - Student rank

### Analytics Endpoints (Require API Key)
- `GET /api/analytics/institution/:id` - Institution analytics
- `GET /api/analytics/cheating` - Cheating analytics
- `GET /api/analytics/trends/:student_id` - Performance trends

### Admin Endpoints
- `POST /api/admin/institutions` - Create institution
- `GET /api/admin/institutions` - Get all institutions

---

## 🔑 Authentication

All authenticated endpoints require an API key in the header:

```bash
curl -H "X-API-Key: mt_your_api_key_here" \
  http://localhost:6000/api/students
```

---

## 📊 Data Synced

### ✅ Lightweight Summary (~2KB)
- Student ID
- Interview ID
- Scores (technical, communication, confidence, etc.)
- Anti-cheat metrics (warnings, suspicion score)
- Strengths & weak topics
- Progress metrics
- Duration & completion rate

### ❌ NOT Synced (Stays with Customer)
- Full video recordings
- Raw webcam streams
- Complete transcripts
- Detailed event logs
- Question/answer pairs

---

## 💰 Cost Analysis

### Traditional Centralized (10,000 interviews)
- AI: $50
- Storage: $20-50/month
- Bandwidth: $100+/month
- **Total: $170-200/month**

### Hybrid Architecture (10,000 interviews)
- Storage: $0.01/month (20MB)
- **Total: ~$0.01/month**

**Savings: 99.99%** 🎉

---

## 🔧 Configuration

### Environment Variables

```env
PORT=6000
NODE_ENV=production
PLATFORM_SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:5000,https://customer-backend.com
```

---

## 📈 Scalability

### Current (In-Memory)
- ~10,000 students
- ~100,000 interviews
- ~100 institutions

### Production (With Database)
- Unlimited students
- Unlimited interviews
- Unlimited institutions

---

## 🗄️ Database Integration

Currently uses in-memory storage. For production, integrate:

### MongoDB
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL);
```

### PostgreSQL
```javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

---

## 🚀 Deployment

### Render
1. Create new Web Service
2. Connect GitHub repo
3. Set environment variables
4. Deploy!

### Vercel
```bash
vercel deploy
```

### VPS
```bash
git clone https://github.com/your-repo/microtrainer-platform
cd microtrainer-platform
npm install
pm2 start index.js --name microtrainer-platform
```

---

## 📚 Documentation

- [Architecture Guide](../CENTRAL_PLATFORM_ARCHITECTURE.md)
- [Setup Guide](../CENTRAL_PLATFORM_SETUP.md)
- [API Documentation](#api-endpoints)

---

## 🎯 Business Model

### Free Tier
- Customer self-hosts backend
- Customer uses own API keys
- Customer stores own data
- **You provide**: Software + Dashboard access

### Premium Tier (Future)
- Fully managed hosting
- You handle infrastructure
- You provide API keys
- **Customer pays**: Monthly subscription

---

## 🔒 Security

- API key authentication
- Institution-specific access control
- No PII in central platform
- GDPR compliant
- Keys can be regenerated/deactivated

---

## 📊 Example Response

### Student Profile
```json
{
  "student_id": "STU101",
  "institution_id": "INST001",
  "total_interviews": 12,
  "average_score": 78.5,
  "strengths": ["React", "JavaScript"],
  "weak_topics": ["System Design"],
  "performance_trend": "improving",
  "recent_interviews": [...]
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🎉 Summary

The Central Platform provides:

- ✅ **Cost Efficiency**: 99.99% cost reduction
- ✅ **Scalability**: Handles thousands of institutions
- ✅ **Privacy**: Raw data stays with customer
- ✅ **Centralized Tracking**: Complete visibility
- ✅ **Flexibility**: Self-host or managed service

**Perfect for SaaS business model!** 🚀
