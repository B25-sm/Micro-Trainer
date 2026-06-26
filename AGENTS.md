# MicroTrainer — Agent Instructions

**What we are:** A practice-first learning platform for technical training batches — students learn, code, and do mock interviews; trainers see who is active and who needs help.

**Read first:** `docs/PURPOSE.md` (what we do and why)  
**Technical integration:** `docs/INTEGRATION_GUIDE.md`

## Quick orientation

| Package | Entry | Port |
|---------|-------|------|
| Backend | `microtrainer-backend/index.js` | 5000 |
| Frontend | `microtrainer-frontend/src/main.jsx` | 5173 |

## Integration surface

- **API:** `VITE_API_URL` / `API_BASE` in `microtrainer-frontend/src/api.js`
- **Auth:** JWT Bearer + optional `x-student-id` (`src/utils/authSession.js`)
- **OAuth:** Google + GitHub via `routes/authRoutes.js`
- **Persistence:** `microtrainer-backend/data/*.json` + Google Sheets

## Embed in another project

1. **Link** — deploy as-is, link to `/learn`, `/interview`, etc.
2. **Pages** — import React pages + set `VITE_API_URL` + OAuth provider
3. **API-only** — your UI calls MicroTrainer REST with JWT
4. **Backend module** — mount Express routes/services from `index.js`

## Do not commit

`.env`, `credentials.json`, VAPID private keys, SMTP passwords, `GROQ_API_KEY`.

## Related docs

- `docs/INTEGRATION_GUIDE.md` — full integration reference
- `OAUTH_SETUP.md` — OAuth setup
- `QUICK_START_GUIDE.md` — local run
- `STUDENT_SETUP_GUIDE.md` — student onboarding
