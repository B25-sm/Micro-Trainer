# Sign-In Setup (Google & GitHub)

## How it works

1. Everyone signs in with **Google** or **GitHub**.
2. **Students** → next screen: **Name**, **Initial**, **Batch** (once).
3. **Trainers** → only these emails (set in backend `.env`):
   - `saimahendra222@gmail.com`
   - `mahendra10kcoders@gmail.com`

No manual name login. No trainer password.

## Backend `.env`

```env
JWT_SECRET=long_random_string
TRAINER_EMAILS=saimahendra222@gmail.com,mahendra10kcoders@gmail.com

GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

FRONTEND_URL=http://localhost:5173
```

## Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=same_as_GOOGLE_CLIENT_ID
```

## Google Cloud Console

- OAuth Web client
- Authorized JavaScript origins: `http://localhost:5173` (+ production URL)

## GitHub OAuth App

- Callback URL: `http://localhost:5000/auth/github/callback`

## Restart

```bash
cd microtrainer-backend && npm start
cd microtrainer-frontend && npm run dev
```
