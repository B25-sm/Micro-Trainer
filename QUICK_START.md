# ⚡ MICRO TRAINER - QUICK START GUIDE

## 🎯 CURRENT STATUS

Your system is **95% complete**. Here's what needs to happen:

### ✅ DONE
- Backend code complete
- Frontend code complete
- Extension structure created
- ENV validation added
- All services working

### 🔄 IN PROGRESS
- Backend deployment (Render)
- Frontend deployment (Vercel)
- Extension testing

### ⏳ TODO
- Deploy backend
- Deploy frontend
- Build extension
- Chrome Web Store submission

---

## 🚀 DEPLOYMENT IN 3 STEPS

### STEP 1: Deploy Backend (15 minutes)

1. **Go to Render Dashboard**
   - https://dashboard.render.com

2. **Create New Web Service**
   - Connect GitHub repository
   - Select `microtrainer-backend` folder
   - Build Command: `npm install`
   - Start Command: `node index.js`

3. **Add Environment Variables**
   ```
   GROQ_API_KEY=your_groq_api_key_here
   SHEET_ID=your_google_sheet_id_here
   PORT=5000
   ```
   
   **Note:** Get actual values from `microtrainer-backend/.env` file

4. **Deploy & Test**
   ```bash
   # Test health endpoint
   curl https://your-app.onrender.com/
   
   # Should return: {"status":"OK","service":"Micro Trainer Backend"}
   ```

**✅ Success Criteria:** Backend returns 200 OK on health check

---

### STEP 2: Deploy Frontend (10 minutes)

1. **Update API URL**
   
   Edit `microtrainer-frontend/src/api.js`:
   ```javascript
   const API_BASE_URL = "https://your-backend.onrender.com";
   ```

2. **Deploy to Vercel**
   ```bash
   cd microtrainer-frontend
   npm install -g vercel
   vercel --prod
   ```
   
   OR use Vercel Dashboard:
   - Import GitHub repo
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`

3. **Test**
   - Visit deployed URL
   - Try chat interface
   - Start interview
   - Check console for errors

**✅ Success Criteria:** Frontend loads and connects to backend

---

### STEP 3: Build Extension (20 minutes)

1. **Build Extension**
   ```bash
   cd microtrainer-extension
   chmod +x build.sh
   ./build.sh
   ```

2. **Test Locally**
   - Open Chrome → `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `microtrainer-extension` folder

3. **Test Functionality**
   - Click extension icon
   - Toggle side panel
   - Test chat
   - Start interview
   - Check on multiple websites

4. **Add Icons** (before publishing)
   - Create 16x16, 48x48, 128x128 PNG icons
   - Place in `microtrainer-extension/icons/`
   - Use brain emoji or custom logo

**✅ Success Criteria:** Extension works on all websites without errors

---

## 🧪 TESTING CHECKLIST

### Backend Tests
```bash
# Health
curl https://your-backend.onrender.com/

# Teaching
curl -X POST https://your-backend.onrender.com/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is React?"}'

# Interview
curl -X POST https://your-backend.onrender.com/interview/start \
  -H "Content-Type: application/json" \
  -d '{"subject":"React","studentId":"test123"}'
```

### Frontend Tests
- [ ] Home page loads
- [ ] Chat works
- [ ] Interview starts
- [ ] Timer functions
- [ ] Feedback displays
- [ ] Dashboard shows data

### Extension Tests
- [ ] Installs without errors
- [ ] Panel injects on all sites
- [ ] Toggle button works
- [ ] Chat interface loads
- [ ] API calls succeed
- [ ] No console errors
- [ ] Works on: Google, GitHub, YouTube

---

## 🐛 TROUBLESHOOTING

### Backend Won't Start
```bash
# Check Render logs
# Verify ENV variables are set
# Ensure GROQ_API_KEY and SHEET_ID are correct
```

### Frontend Can't Reach Backend
```javascript
// Check CORS in backend index.js
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'chrome-extension://*']
}));
```

### Extension Not Loading
```bash
# Check manifest.json syntax
# Verify dist/ folder exists
# Reload extension in chrome://extensions/
# Refresh webpage
```

---

## 📦 PRODUCTION CHECKLIST

### Before Publishing

- [ ] Backend deployed and tested
- [ ] Frontend deployed and tested
- [ ] Extension tested on 5+ websites
- [ ] Icons added (16, 48, 128)
- [ ] No console errors
- [ ] API calls working
- [ ] Performance acceptable
- [ ] Mobile responsive

### Chrome Web Store

1. Create developer account ($5 one-time fee)
2. Upload `microtrainer-extension.zip`
3. Fill store listing:
   - Name: Micro Trainer - AI Interview Coach
   - Description: Real-time AI mentor for interview prep
   - Category: Productivity
   - Screenshots: 5 images showing features
4. Submit for review (1-3 days)

---

## 🎯 SUCCESS METRICS

### Technical
- Backend uptime: 99%+
- API response time: < 2s
- Extension load time: < 1s
- Zero console errors

### User Experience
- Panel loads instantly
- Chat responds in < 3s
- Interview flow smooth
- No page interference

---

## 📞 NEXT ACTIONS (RIGHT NOW)

1. **Deploy Backend**
   - Go to Render
   - Add ENV variables
   - Deploy

2. **Test Backend**
   - Run curl commands
   - Verify responses

3. **Deploy Frontend**
   - Update API URL
   - Deploy to Vercel
   - Test UI

4. **Build Extension**
   - Run build script
   - Test locally
   - Fix any issues

5. **Production**
   - Add icons
   - Create ZIP
   - Submit to Chrome Web Store

---

## 🔥 PRIORITY ORDER

1. **CRITICAL:** Backend deployment (blocks everything)
2. **HIGH:** Frontend deployment (needed for extension)
3. **HIGH:** Extension build (core product)
4. **MEDIUM:** Chrome Web Store submission
5. **LOW:** Analytics and monitoring

---

## 📊 TIME ESTIMATE

- Backend deployment: 15 min
- Frontend deployment: 10 min
- Extension build: 20 min
- Testing: 30 min
- **Total: ~75 minutes to production**

---

## 🎉 FINAL NOTES

Your system is **technically complete**. The remaining work is:
- Configuration (ENV variables)
- Deployment (Render + Vercel)
- Packaging (Extension ZIP)

No code changes needed. Just deploy and test.

**You're 75 minutes away from a working product.**

---

**Last Updated:** May 5, 2026  
**Status:** Ready for deployment
