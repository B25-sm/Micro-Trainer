# 🧠 MICRO TRAINER - AI Interview Coach

**A browser extension that provides persistent AI mentorship for interview preparation and real-time learning.**

---

## 🎯 WHAT IS THIS?

Micro Trainer is a Chrome extension that injects a side panel AI coach into every webpage. It helps candidates:

- Practice technical interviews
- Get instant feedback
- Learn concepts in real-time
- Track progress over time
- Never leave their workflow

**Not just a chatbot. Not just a website. A persistent AI mentor that's always there.**

---

## 🏗️ ARCHITECTURE

```
Chrome Extension (React)
    ↓
Backend API (Node.js + Express)
    ↓
AI Service (Groq)
    ↓
Google Sheets (Analytics DB)
    ↓
Trainer Dashboard
```

---

## 📁 PROJECT STRUCTURE

```
microtrainer/
├── microtrainer-backend/       # Node.js API server
│   ├── index.js               # Main server
│   ├── services/              # 16 service modules
│   └── package.json
│
├── microtrainer-frontend/      # React web app
│   ├── src/
│   │   ├── pages/             # Home, Dashboard, Trainer
│   │   ├── components/        # Chat, Timer, Feedback
│   │   └── api.js             # API client
│   └── package.json
│
├── microtrainer-extension/     # Chrome extension
│   ├── manifest.json          # Extension config
│   ├── content.js             # Side panel injection
│   ├── background.js          # Service worker
│   ├── popup.html             # Extension popup
│   └── build.sh               # Build script
│
└── Documentation/
    ├── DEPLOYMENT_GUIDE.md    # Full deployment guide
    ├── QUICK_START.md         # Quick start guide
    ├── DEPLOYMENT_CHECKLIST.md # Step-by-step checklist
    └── STATUS_REPORT.md       # Current status
```

---

## 🚀 QUICK START

### Prerequisites

- Node.js 18+
- npm or yarn
- Chrome browser
- Render account (backend)
- Vercel account (frontend)

### 1. Backend Setup

```bash
cd microtrainer-backend
npm install
npm start
```

Backend runs on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd microtrainer-frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 3. Extension Setup

```bash
cd microtrainer-extension
./build.sh  # Mac/Linux
# OR
.\build.ps1  # Windows
```

Then:
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `microtrainer-extension` folder

---

## 🔧 ENVIRONMENT VARIABLES

Create `microtrainer-backend/.env`:

```bash
GROQ_API_KEY=your_groq_api_key
SHEET_ID=your_google_sheet_id
PORT=5000
```

---

## 📦 DEPLOYMENT

### Backend (Render)

1. Create web service on Render
2. Connect GitHub repository
3. Add environment variables
4. Deploy

**See:** `DEPLOYMENT_GUIDE.md` for detailed steps

### Frontend (Vercel)

1. Update API URL in `src/api.js`
2. Deploy to Vercel
3. Test functionality

**See:** `QUICK_START.md` for detailed steps

### Extension (Chrome Web Store)

1. Build extension
2. Test locally
3. Add icons
4. Create ZIP
5. Submit to Chrome Web Store

**See:** `microtrainer-extension/README.md` for detailed steps

---

## 🧪 TESTING

### Backend Tests

```bash
# Health check
curl http://localhost:5000/

# Teaching mode
curl -X POST http://localhost:5000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is React?"}'

# Interview start
curl -X POST http://localhost:5000/interview/start \
  -H "Content-Type: application/json" \
  -d '{"subject":"React","studentId":"test123"}'
```

### Frontend Tests

- Visit `http://localhost:5173`
- Test chat interface
- Start interview
- Check timer
- View feedback

### Extension Tests

- Load extension in Chrome
- Visit any website
- Toggle side panel
- Test chat
- Start interview

---

## 📚 DOCUMENTATION

| Document | Description |
|----------|-------------|
| `DEPLOYMENT_GUIDE.md` | Complete deployment instructions |
| `QUICK_START.md` | Fast-track deployment guide |
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step checklist |
| `STATUS_REPORT.md` | Current project status |
| `microtrainer-extension/README.md` | Extension-specific guide |

---

## 🎨 FEATURES

### For Students

- ✅ **Teaching Mode** - Ask any technical question
- ✅ **Interview Mode** - Practice with timed questions
- ✅ **Instant Feedback** - Get detailed evaluation
- ✅ **Progress Tracking** - See improvement over time
- ✅ **Memory System** - AI remembers your weak areas
- ✅ **Always Available** - Side panel on every website

### For Trainers

- ✅ **Leaderboard** - Fullstack and subject-wise rankings
- ✅ **Analytics** - Student performance metrics
- ✅ **Weak Student Identification** - Find who needs help
- ✅ **Trends** - Track improvement over time
- ✅ **Real-time Data** - Google Sheets integration

---

## 🔐 SECURITY

- ENV validation prevents silent failures
- CORS configured for security
- Input validation on all endpoints
- Error handling throughout
- No sensitive data in logs

---

## 🐛 TROUBLESHOOTING

### Backend Won't Start

```bash
# Check ENV variables
cat microtrainer-backend/.env

# Check logs
npm start
```

### Frontend Can't Connect

```javascript
// Check API URL in src/api.js
const API_BASE_URL = "http://localhost:5000";
```

### Extension Not Loading

1. Check `chrome://extensions/` for errors
2. Verify `dist/` folder exists
3. Reload extension
4. Refresh webpage

**See:** `DEPLOYMENT_GUIDE.md` for more troubleshooting

---

## 📊 TECH STACK

### Backend
- Node.js + Express
- Groq SDK (AI)
- Google Sheets API
- Axios

### Frontend
- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Recharts

### Extension
- Chrome Extension Manifest v3
- Content Scripts
- Service Workers

---

## 🎯 ROADMAP

### Phase 1 (Current)
- [x] Backend API
- [x] Frontend UI
- [x] Extension structure
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Test extension

### Phase 2
- [ ] Chrome Web Store submission
- [ ] User feedback collection
- [ ] Bug fixes
- [ ] Performance optimization

### Phase 3
- [ ] Voice input
- [ ] Code editor integration
- [ ] Team collaboration
- [ ] Premium features

---

## 📞 SUPPORT

For issues or questions:

1. Check documentation in `/Documentation`
2. Review troubleshooting guides
3. Check browser console for errors
4. Verify environment variables
5. Test API endpoints directly

---

## 📈 STATUS

| Component | Status |
|-----------|--------|
| Backend Code | ✅ 100% |
| Frontend Code | ✅ 100% |
| Extension Code | ✅ 100% |
| Backend Deployment | ⏳ Pending |
| Frontend Deployment | ⏳ Pending |
| Extension Testing | ⏳ Pending |
| **Overall** | 🟡 70% |

**Next Step:** Deploy backend to Render

---

## 🤝 CONTRIBUTING

This is a private project. For internal development:

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit for review

---

## 📄 LICENSE

Proprietary - All rights reserved

---

## 🎉 ACKNOWLEDGMENTS

Built with:
- Groq for AI inference
- Google Sheets for analytics
- Render for backend hosting
- Vercel for frontend hosting
- Chrome Extensions platform

---

**Version:** 1.0.0  
**Last Updated:** May 5, 2026  
**Status:** Production Ready (Deployment Pending)

---

## 🚀 GET STARTED NOW

```bash
# 1. Clone repository
git clone <repository-url>

# 2. Setup backend
cd microtrainer-backend
npm install
npm start

# 3. Setup frontend
cd ../microtrainer-frontend
npm install
npm run dev

# 4. Build extension
cd ../microtrainer-extension
./build.sh

# 5. Load in Chrome
# chrome://extensions/ → Load unpacked
```

**You're ready to go! 🎉**
