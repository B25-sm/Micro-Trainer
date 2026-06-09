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

Register **both** URLs on the same OAuth app (GitHub allows multiple callback URLs in newer apps; if yours only allows one field, use the production URL for deploy and localhost for local dev, or create two OAuth apps).

| Environment | Authorization callback URL |
|-------------|----------------------------|
| Local | `http://localhost:5000/auth/github/callback` |
| Production (Render API) | `https://micro-trainer.onrender.com/auth/github/callback` |

Replace `micro-trainer.onrender.com` if your Render service has a different name.

**Homepage URL (production):** your live frontend, e.g. `https://your-app.vercel.app`

## Production (Render backend + Vercel/static frontend)

### Render — backend environment variables

```env
API_PUBLIC_URL=https://micro-trainer.onrender.com
FRONTEND_URL=https://YOUR-FRONTEND-DOMAIN
NODE_ENV=production

JWT_SECRET=long_random_string
TRAINER_EMAILS=saimahendra222@gmail.com,mahendra10kcoders@gmail.com

GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GITHUB_CLIENT_ID=Ov23linVcHpToEoFGoYl
GITHUB_CLIENT_SECRET=your_github_secret

GROQ_API_KEY=...
SHEET_ID=...
# ... other existing production vars
```

`API_PUBLIC_URL` must match the URL in GitHub’s callback (no trailing slash).  
`FRONTEND_URL` is where users land after login (your Vercel URL).

### Vercel — frontend environment variables

```env
VITE_API_URL=https://micro-trainer.onrender.com
VITE_GOOGLE_CLIENT_ID=same_as_GOOGLE_CLIENT_ID
```

Redeploy frontend after changing env vars.

### Google Cloud Console (production)

OAuth client → **Authorized JavaScript origins**:

- `http://localhost:5173`
- `https://YOUR-FRONTEND-DOMAIN`

(No redirect URI needed for the Google button flow used by MicroTrainer; it posts the credential to the backend.)

### GitHub (production)

Developer settings → OAuth Apps → your app → add callback:

`https://micro-trainer.onrender.com/auth/github/callback`

Keep localhost callback if you still develop locally.

### After updating

1. Save GitHub OAuth app settings  
2. Redeploy / restart Render backend (env vars apply on restart)  
3. Redeploy Vercel frontend  
4. Test: open `https://YOUR-FRONTEND-DOMAIN/login` → Continue with GitHub  

## Restart

```bash
cd microtrainer-backend && npm start
cd microtrainer-frontend && npm run dev
```
