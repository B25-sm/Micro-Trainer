# 🚀 MICRO TRAINER — DEPLOYMENT GUIDE

## 📋 CURRENT STATUS

| Component | Status | Priority |
|-----------|--------|----------|
| Backend Code | ✅ 95% | CRITICAL |
| Frontend Code | ✅ 95% | HIGH |
| Backend Deployment | ❌ 10% | **CRITICAL** |
| Frontend Deployment | ❌ 0% | HIGH |
| Chrome Extension | ❌ 0% | **CRITICAL** |

---

## 🔥 STEP 1: BACKEND DEPLOYMENT (RENDER)

### ✅ Pre-Deployment Checklist

- [x] All services exist and are properly imported
- [x] ENV validation added to prevent silent failures
- [x] Error handling in place
- [ ] Environment variables configured in Render

### 🔐 Required Environment Variables

Configure these in **Render Dashboard → Environment**:

```bash
GROQ_API_KEY=your_groq_api_key_here
SHEET_ID=your_google_sheet_id_here
PORT=5000
```

**Note:** Get actual values from `microtrainer-backend/.env` file

### 📦 Render Configuration

```yaml
# Build Command
npm install

# Start Command
node index.js

# Environment
Node 18+
```

### ✅ Deployment Verification

After deployment, test these endpoints:

```bash
# Health Check
curl https://your-app.onrender.com/

# Teaching Mode
curl -X POST https://your-app.onrender.com/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is React?"}'

# Interview Start
curl -X POST https://your-app.onrender.com/interview/start \
  -H "Content-Type: application/json" \
  -d '{"subject": "React", "studentId": "test123"}'
```

**Expected Response:**
- Status: 200 OK
- JSON response with proper structure
- No error messages in logs

---

## 🎨 STEP 2: FRONTEND DEPLOYMENT (VERCEL)

### 📝 Pre-Deployment Steps

1. **Update API Base URL** in `microtrainer-frontend/src/api.js`:

```javascript
const API_BASE_URL = "https://your-backend.onrender.com";
```

2. **Build Test** (run locally first):

```bash
cd microtrainer-frontend
npm install
npm run build
```

### 🚀 Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd microtrainer-frontend
vercel --prod
```

**OR** use Vercel Dashboard:
1. Import GitHub repository
2. Framework: Vite
3. Build Command: `npm run build`
4. Output Directory: `dist`

### ✅ Verification

Visit deployed URL and test:
- [ ] Home page loads
- [ ] Chat interface works
- [ ] Interview flow starts
- [ ] Timer functions
- [ ] Feedback displays

---

## 🧩 STEP 3: CHROME EXTENSION (CORE PRODUCT)

### 🎯 Extension Architecture

```
microtrainer-extension/
├── manifest.json          # Extension config
├── content.js            # Inject UI into pages
├── background.js         # Service worker
├── popup.html            # Extension popup
├── styles.css            # Side panel styles
└── dist/                 # React build (from frontend)
    ├── index.html
    ├── assets/
    └── ...
```

### 📋 manifest.json

```json
{
  "manifest_version": 3,
  "name": "Micro Trainer - AI Interview Coach",
  "version": "1.0.0",
  "description": "Real-time AI mentor for learning and interview preparation",
  "permissions": [
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "https://your-backend.onrender.com/*"
  ],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["styles.css"],
      "run_at": "document_end"
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### 📝 content.js (Inject Side Panel)

```javascript
// Create side panel container
const panel = document.createElement('div');
panel.id = 'microtrainer-panel';
panel.innerHTML = `
  <iframe 
    id="microtrainer-iframe" 
    src="chrome-extension://${chrome.runtime.id}/dist/index.html"
    style="width: 100%; height: 100%; border: none;"
  ></iframe>
`;

// Inject into page
document.body.appendChild(panel);

// Toggle visibility
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    panel.classList.toggle('hidden');
  }
});
```

### 🎨 styles.css (Side Panel)

```css
#microtrainer-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  z-index: 999999;
  transition: transform 0.3s ease;
}

#microtrainer-panel.hidden {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  #microtrainer-panel {
    width: 100%;
  }
}
```

### 🔧 Build Process

```bash
# 1. Build React app
cd microtrainer-frontend
npm run build

# 2. Copy to extension folder
mkdir -p ../microtrainer-extension/dist
cp -r dist/* ../microtrainer-extension/dist/

# 3. Update API URL in built files
# Replace localhost with production URL
```

### 📦 Load Extension (Development)

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `microtrainer-extension` folder

### ✅ Extension Testing

- [ ] Extension icon appears in toolbar
- [ ] Side panel injects on any website
- [ ] Panel doesn't block page content
- [ ] Chat works across all sites
- [ ] Interview mode functions
- [ ] Data persists across pages

---

## 🏆 STEP 4: TRAINER DASHBOARD

### 🔗 Connect Dashboard to Backend

Update `microtrainer-frontend/src/pages/TrainerDashboard.jsx`:

```javascript
const API_URL = "https://your-backend.onrender.com";

// Fetch leaderboard
const response = await fetch(`${API_URL}/trainer/leaderboard`, {
  headers: {
    'role': 'trainer'
  }
});
```

### 📊 Dashboard Features

- [ ] Fullstack leaderboard
- [ ] Subject-wise rankings (React, Java, Python)
- [ ] Weak students identification
- [ ] Performance trends
- [ ] Real-time updates

---

## 🧪 TESTING CHECKLIST

### Backend Tests

```bash
# Health
curl https://your-backend.onrender.com/

# Teaching
curl -X POST https://your-backend.onrender.com/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Explain useState"}'

# Interview
curl -X POST https://your-backend.onrender.com/interview/start \
  -H "Content-Type: application/json" \
  -d '{"subject": "React", "studentId": "test123"}'

# Leaderboard
curl https://your-backend.onrender.com/trainer/leaderboard \
  -H "role: trainer"
```

### Frontend Tests

- [ ] Home page loads
- [ ] Chat interface responsive
- [ ] Interview timer works
- [ ] Feedback cards display
- [ ] Dashboard shows data

### Extension Tests

- [ ] Loads on all websites
- [ ] Side panel toggles
- [ ] API calls work
- [ ] No console errors
- [ ] Performance acceptable

---

## 🚨 COMMON ISSUES & FIXES

### Issue 1: Backend Crashes on Start

**Symptom:** "Cannot find module" or ENV errors

**Fix:**
```bash
# Check Render logs
# Verify ENV variables are set
# Ensure all dependencies in package.json
```

### Issue 2: CORS Errors

**Symptom:** Frontend can't reach backend

**Fix:**
```javascript
// In index.js
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'chrome-extension://*'
  ]
}));
```

### Issue 3: Extension Not Injecting

**Symptom:** Side panel doesn't appear

**Fix:**
- Check manifest.json permissions
- Verify content.js is loaded
- Check browser console for errors
- Reload extension

### Issue 4: Google Sheets Not Updating

**Symptom:** Data not logging

**Fix:**
- Verify SHEET_ID is correct
- Check Google Sheets API credentials
- Ensure service account has write access

---

## 📈 DEPLOYMENT ORDER

1. ✅ **Fix Backend** (ENV + validation) — DONE
2. 🔄 **Deploy Backend** (Render) — IN PROGRESS
3. ⏳ **Deploy Frontend** (Vercel) — WAITING
4. ⏳ **Build Extension** — WAITING
5. ⏳ **Test Integration** — WAITING
6. ⏳ **Production Launch** — WAITING

---

## 🎯 SUCCESS CRITERIA

### Backend
- ✅ All endpoints return 200
- ✅ No ENV errors in logs
- ✅ Google Sheets logging works
- ✅ AI responses generate

### Frontend
- ✅ Loads in < 3 seconds
- ✅ Mobile responsive
- ✅ No console errors
- ✅ API calls succeed

### Extension
- ✅ Installs without errors
- ✅ Works on all websites
- ✅ Side panel functional
- ✅ Data persists

---

## 📞 NEXT STEPS

1. **Deploy Backend to Render**
   - Add ENV variables
   - Deploy from GitHub
   - Test endpoints

2. **Deploy Frontend to Vercel**
   - Update API URL
   - Build and deploy
   - Test functionality

3. **Build Chrome Extension**
   - Create manifest.json
   - Build React app
   - Package extension
   - Test on Chrome

4. **Integration Testing**
   - End-to-end flow
   - Cross-browser testing
   - Performance optimization

---

## 🔐 SECURITY NOTES

- Never commit `.env` files
- Rotate API keys regularly
- Use HTTPS only
- Validate all inputs
- Implement rate limiting
- Add authentication for trainer routes

---

## 📊 MONITORING

- Render logs for backend errors
- Vercel analytics for frontend
- Chrome Web Store metrics for extension
- Google Sheets for usage data

---

**Last Updated:** May 5, 2026
**Status:** Backend ready for deployment
