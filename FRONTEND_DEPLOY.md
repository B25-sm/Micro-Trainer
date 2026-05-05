# 🎨 FRONTEND DEPLOYMENT GUIDE

## ✅ Backend URL Configured
Your backend is live at: `https://micro-trainer.onrender.com`

Frontend is configured to use this URL in production.

---

## 🚀 DEPLOY TO VERCEL (2 Options)

### Option 1: Vercel Dashboard (Recommended - 5 minutes)

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your repository: `B25-sm/Micro-Trainer`
   - Click "Import"

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: microtrainer-frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables** (Optional - already in .env.production)
   ```
   VITE_API_URL = https://micro-trainer.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your URL: `https://your-app.vercel.app`

---

### Option 2: Vercel CLI (Fast - 3 minutes)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd microtrainer-frontend
   vercel --prod
   ```

4. **Follow Prompts**
   - Set up and deploy? Yes
   - Which scope? (Select your account)
   - Link to existing project? No
   - Project name? micro-trainer-frontend
   - Directory? ./
   - Override settings? No

5. **Done!**
   - You'll get a URL like: `https://micro-trainer-frontend.vercel.app`

---

## 🧪 VERIFY DEPLOYMENT

After deployment, test these:

### 1. Visit Your Frontend URL
```
https://your-app.vercel.app
```

### 2. Check Home Page
- [ ] Page loads without errors
- [ ] No console errors (F12)
- [ ] Styling looks correct

### 3. Test Chat Interface
- [ ] Click "Start Learning" or similar
- [ ] Type a question
- [ ] Get AI response
- [ ] Response comes from backend

### 4. Test Interview Mode
- [ ] Click "Start Interview"
- [ ] Select subject (React/Java/Python)
- [ ] Get first question
- [ ] Timer starts
- [ ] Submit answer
- [ ] Get feedback

### 5. Check Network Tab
- [ ] Open DevTools (F12) → Network
- [ ] API calls go to: `https://micro-trainer.onrender.com`
- [ ] Status: 200 OK
- [ ] No CORS errors

---

## 🐛 TROUBLESHOOTING

### Issue: "Network Error" or "Failed to fetch"

**Check:**
1. Backend is running: https://micro-trainer.onrender.com
2. CORS is enabled in backend (already done)
3. API URL is correct in `.env.production`

**Fix:**
```bash
# Test backend directly
curl https://micro-trainer.onrender.com/

# Should return: {"status":"OK","service":"Micro Trainer Backend"}
```

### Issue: "404 Not Found" on routes

**Fix:** Vercel needs a `vercel.json` for SPA routing

Already created below ↓

### Issue: Build fails

**Check:**
```bash
# Test build locally first
cd microtrainer-frontend
npm install
npm run build

# Should create dist/ folder
```

---

## 📝 VERCEL CONFIGURATION

I'll create a `vercel.json` for proper routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This ensures all routes work correctly (SPA routing).

---

## 🎯 AFTER DEPLOYMENT

Once deployed, you'll have:

✅ Backend: `https://micro-trainer.onrender.com`  
✅ Frontend: `https://your-app.vercel.app`  
⏳ Extension: Next step (will use both URLs)

---

## 📊 DEPLOYMENT CHECKLIST

- [ ] Vercel account created
- [ ] Repository connected
- [ ] Project configured
- [ ] Deployed successfully
- [ ] Frontend URL obtained
- [ ] Home page loads
- [ ] Chat works
- [ ] Interview works
- [ ] No console errors
- [ ] API calls succeed

---

## 🚀 NEXT STEP: EXTENSION

After frontend is deployed:

1. Note your frontend URL
2. Update extension configuration
3. Build extension
4. Test locally
5. Submit to Chrome Web Store

---

**Ready to deploy? Choose Option 1 (Dashboard) or Option 2 (CLI) above!**
