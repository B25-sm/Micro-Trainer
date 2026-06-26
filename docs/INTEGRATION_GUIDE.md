# MicroTrainer — Project Overview & Integration Guide

This document explains the **entire MicroTrainer codebase** so another team (or Cursor in a different repo) can **embed, extend, or integrate** with it.

---

## What MicroTrainer Is

**MicroTrainer** is an AI-powered technical learning platform for students and trainers.

| Capability | Description |
|------------|-------------|
| **Guided courses** | Structured learning paths per technology (Django, React, CSS, etc.) with AI-generated lessons |
| **Mock interviews** | Groq-powered technical interviews with scoring |
| **Code practice** | Browser-side Python (Pyodide) + optional server Piston for other languages |
| **Engagement** | Streaks, badges, daily assessments, notifications |
| **Trainer dashboard** | Monitor students, exports, anti-cheat, analytics |
| **Personal schedule** | Student study plans with reminders |

**Production URLs (example deployment):**
- Frontend: `https://micro-trainer.vercel.app`
- Backend API: `https://micro-trainer.onrender.com`

---

## Repository Layout

```
Microtrainer/
├── microtrainer-backend/     # Main API (Express 5, port 5000)
├── microtrainer-frontend/    # Main SPA (Vite + React 19, port 5173)
├── license-server/             # Optional license validation service
├── microtrainer-platform/      # Optional central analytics (MongoDB)
├── microtrainer-extension/     # Chrome extension (side panel)
├── scripts/                    # Piston install helpers
├── data/piston/                # Self-hosted code runner packages
├── docs/                       # Integration & setup docs
├── render.yaml                 # Render deploy blueprint
└── docker-compose.piston.yml   # Optional Piston Docker
```

### Backend (`microtrainer-backend/`)

| Path | Role |
|------|------|
| `index.js` | **Main entry** — all HTTP routes, Socket.io, cron jobs |
| `routes/authRoutes.js` | Google/GitHub OAuth, JWT `/auth/me` |
| `middleware/accessControl.js` | `trainerOnly`, `studentSelfOrTrainer` |
| `services/` | Business logic (70+ services) |
| `data/` | **Primary persistence** — JSON files (sessions, progress, engagement) |
| `credentials.json` | Google Sheets service account (not in git) |

Key services:

| Service | Purpose |
|---------|---------|
| `adaptiveTeachingService.js` | AI lessons (Groq), guided course generation |
| `learningPathService.js` | Structured learning sessions, quiz, progress |
| `engagementService.js` | Activity, streaks, status |
| `assessmentService.js` | Mini-assessments, mock tests |
| `notificationOrchestratorService.js` | Push/email with preference gates |
| `pushNotificationService.js` | Web Push (VAPID) |
| `oauthAuthService.js` / `jwtAuthService.js` | Auth |
| `curriculumService.js` | Loads `data/curriculums/*.json` |

### Frontend (`microtrainer-frontend/`)

| Path | Role |
|------|------|
| `src/main.jsx` | Entry — Google OAuth provider, display mode |
| `src/App.jsx` | **All routes** |
| `src/api.js` | Axios client, `API_BASE` from `VITE_API_URL` |
| `src/utils/authSession.js` | JWT + `x-student-id` headers, localStorage |
| `src/pages/` | Full pages (Learn, Interview, Dashboard, etc.) |
| `src/components/` | Reusable UI |
| `public/sw.js` | Service worker for push notifications |

---

## Architecture Diagram

```
┌─────────────────┐     HTTPS + JWT      ┌──────────────────────────┐
│  React SPA      │ ◄──────────────────► │  Express API (index.js)  │
│  (Vite :5173)   │     REST + Socket.io │  (:5000)                 │
└────────┬────────┘                      └───────────┬──────────────┘
         │                                            │
         │ OAuth (Google/GitHub)                      ├── Groq API (AI)
         ▼                                            ├── Google Sheets
┌─────────────────┐                                  ├── SMTP (email)
│  Browser        │                                  ├── Web Push (VAPID)
│  Pyodide workers│                                  ├── Piston (optional)
└─────────────────┘                                  └── JSON files (data/)
```

---

## Authentication Contract

### Flow

1. User signs in via **Google** (`POST /auth/google`) or **GitHub** (`GET /auth/github` → callback).
2. Backend returns **JWT** (`authToken`) + `role` (`student` | `trainer`) + optional `studentId`.
3. New students complete profile at `/complete-profile` → `POST /auth/complete-profile`.
4. Frontend stores in `localStorage`:
   - `authToken`, `userRole`, `studentId`, `userEmail`, `profileComplete`

### API headers (required for protected routes)

```http
Authorization: Bearer <JWT>
x-student-id: <studentId>    # when acting as a specific student
```

Frontend helpers: `getBearerHeaders()`, `getStudentApiHeaders()` in `src/utils/authSession.js`.

### Roles

| Role | How assigned | Frontend guard |
|------|--------------|----------------|
| **trainer** | Email in `TRAINER_EMAILS` env | `TrainerOnly` |
| **student** | Everyone else | `RequireAuth` |

Trainer emails must match on **both** backend `TRAINER_EMAILS` and frontend `trainerAuth.js` allowlist.

---

## API Surface (integration endpoints)

Base URL: `VITE_API_URL` (e.g. `https://micro-trainer.onrender.com`)

### Auth
| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/google` | `{ credential }` from Google One Tap |
| GET | `/auth/github` | Redirect to GitHub |
| GET | `/auth/github/callback` | Redirects to frontend with `?token=` |
| GET | `/auth/me` | Current user (JWT) |
| POST | `/auth/complete-profile` | Bind student profile |

### Learning
| Method | Path | Notes |
|--------|------|-------|
| GET | `/learning-path/technologies` | List technologies |
| POST | `/learning-path/start` | Start session |
| GET | `/learning-path/:sessionId/current` | Current concept + lesson |
| POST | `/learning-path/:sessionId/submit` | Submit quiz answers |

### Student / Trainer
| Method | Path | Auth |
|--------|------|------|
| GET | `/student/:studentId/report` | self or trainer |
| GET | `/trainer/leaderboard` | trainer |
| GET | `/trainer/learning-progress` | trainer |

### Engagement & notifications
| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/engagement/activity` | Record activity |
| GET | `/api/engagement/status/:studentId` | Status + streak |
| GET/PUT | `/api/notifications/preferences/:studentId` | Settings |
| POST | `/api/notifications/subscribe` | Web push |
| POST | `/api/notifications/test` | Test push |

### Code & interviews
| Method | Path | Notes |
|--------|------|-------|
| POST | `/interview/start` | Start mock interview |
| POST | `/code/execute` | Server execution (Piston) |
| POST | `/problems/submit` | Problem solving |

Full route list: search `app.get|app.post` in `microtrainer-backend/index.js`.

---

## Data & Persistence

| Store | Location | Contents |
|-------|----------|----------|
| **JSON files** | `microtrainer-backend/data/` | Sessions, progress, engagement, notifications, schedules |
| **Google Sheets** | `SHEET_ID` + `credentials.json` | Exports, trainer analytics (production) |
| **MongoDB** | Optional `MONGODB_URI` | Not primary on main backend |
| **In-memory** | Runtime only | Anti-cheat sessions, some teaching caches |

**Student ID format:** typically `{initial}_{batch}` (e.g. `B25_2024`) after profile completion.

---

## External Services

| Service | Env vars | Required? |
|---------|----------|-----------|
| **Groq** | `GROQ_API_KEY` | Yes (AI lessons/interviews) |
| **Google OAuth** | `GOOGLE_CLIENT_ID`, `VITE_GOOGLE_CLIENT_ID` | For Google login |
| **GitHub OAuth** | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | For GitHub login |
| **Google Sheets** | `SHEET_ID`, `credentials.json` | Production parity |
| **JWT** | `JWT_SECRET` | Yes |
| **SMTP** | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Email notifications |
| **Web Push** | `VAPID_*` (backend), `VITE_VAPID_PUBLIC_KEY` (frontend) | Browser notifications |
| **Piston** | `PISTON_URL` | Optional server code run |
| **License** | `LICENSE_KEY`, `LICENSE_SERVER_URL` | Production startup gate |

---

## Local Development

```bash
# Terminal 1 — Backend
cd microtrainer-backend
npm install
cp .env.example .env   # fill GROQ_API_KEY, etc.
npm start              # http://localhost:5000

# Terminal 2 — Frontend
cd microtrainer-frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000
npm run dev            # http://localhost:5173
```

---

## How to Integrate Into Another Project

### Option A — iframe / link (simplest)

Host MicroTrainer as a separate app; link from your LMS:

```
https://micro-trainer.vercel.app/learn
```

Pass nothing — users sign in with their own OAuth account.

### Option B — Embed specific pages in your React app

1. Copy or import pages from `microtrainer-frontend/src/pages/`.
2. Set `VITE_API_URL` to the MicroTrainer backend.
3. Wrap app with `GoogleOAuthProvider` (same client ID as backend).
4. Reuse `authSession.js` for JWT storage and headers.
5. Mount routes under a basename, e.g. `/microtrainer/*`:

```jsx
<Route path="/microtrainer/*" element={<MicroTrainerRoutes />} />
```

6. Add your host origin to backend `FRONTEND_URL` (OAuth redirects).

### Option C — API-only (your UI, our backend)

1. Point your frontend at `https://micro-trainer.onrender.com`.
2. Implement OAuth flow or exchange your IdP token for MicroTrainer JWT.
3. Call learning-path, engagement, assessment APIs with Bearer token.
4. Required JWT claims: `role`, `studentId`, `email`, `profileComplete`.

### Option D — Backend as a module

1. Import services from `microtrainer-backend/services/`.
2. Mount route handlers from `index.js` on your Express app.
3. Ensure writable `data/` directory and env vars.
4. Run cron: `initializeCronJobs()` from `services/cronJobs.js`.

### Option E — Chrome extension panel

Use `/extension` route + `ExtensionAutoConnect` component for side-panel embedding.

---

## Environment Variables Cheat Sheet

### Backend (Render)

```
GROQ_API_KEY
JWT_SECRET
FRONTEND_URL=https://your-frontend.com
SHEET_ID
GOOGLE_CLIENT_ID
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
TRAINER_EMAILS=trainer1@x.com,trainer2@x.com
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT=mailto:you@example.com
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
LICENSE_KEY, LICENSE_SERVER_URL, STUDENT_EMAIL
```

### Frontend (Vercel)

```
VITE_API_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID
VITE_VAPID_PUBLIC_KEY   # must match backend VAPID_PUBLIC_KEY
```

---

## Key Frontend Routes

| Path | Page | Access |
|------|------|--------|
| `/login` | OAuth login | Public |
| `/` | Home | Auth |
| `/learn` | Guided courses | Auth |
| `/interview` | Mock interview | Auth |
| `/problems` | Code practice | Auth |
| `/dashboard` | Student dashboard | Auth |
| `/engagement` | Streaks & assessments | Auth |
| `/schedule` | Personal schedule | Auth |
| `/settings/notifications` | Push/email prefs | Auth |
| `/trainer` | Trainer dashboard | Trainer |
| `/trainer/student/:id` | Student detail | Trainer |

---

## Integration Checklist

- [ ] Backend deployed with `GROQ_API_KEY`, `JWT_SECRET`, `FRONTEND_URL`
- [ ] Frontend `VITE_API_URL` points to backend
- [ ] OAuth client IDs match on frontend + backend
- [ ] `TRAINER_EMAILS` synced frontend + backend
- [ ] Google Sheets credentials if using exports
- [ ] VAPID keys on Render **and** `VITE_VAPID_PUBLIC_KEY` on Vercel
- [ ] `data/` directory persisted (Render disk or external storage)
- [ ] CORS: backend uses open `cors()` — OAuth redirects need correct `FRONTEND_URL`

---

## Files to Read First (for Cursor / new developers)

1. `microtrainer-backend/index.js` — all routes
2. `microtrainer-frontend/src/App.jsx` — all pages
3. `microtrainer-frontend/src/api.js` — API client
4. `microtrainer-frontend/src/utils/authSession.js` — auth contract
5. `microtrainer-backend/services/learningPathService.js` — core learning flow
6. `microtrainer-backend/routes/authRoutes.js` — OAuth
7. `OAUTH_SETUP.md` — OAuth configuration
8. `render.yaml` — deployment

---

## Common Pitfalls

| Issue | Cause | Fix |
|-------|-------|-----|
| Push: "VAPID keys not configured" | Keys missing on **Render** | Add `VAPID_*` env vars, redeploy |
| Toggle invisible in dark mode | CSS override | See `SettingSwitch.jsx` + `.setting-switch-*` in `index.css` |
| OAuth redirect wrong | `FRONTEND_URL` mismatch | Set exact production URL |
| Trainer can't access dashboard | Email not in `TRAINER_EMAILS` | Add email on backend + `trainerAuth.js` |
| Lessons fail | No `GROQ_API_KEY` | Set on backend |
| Progress lost on Render free tier | Ephemeral disk | Use persistent volume or external DB |

---

*Last updated: integration guide for cross-project embedding. For OAuth details see `OAUTH_SETUP.md`; for student onboarding see `STUDENT_SETUP_GUIDE.md`.*
