# ✅ MICRO TRAINER - DEPLOYMENT CHECKLIST

Use this checklist to track your deployment progress.

---

## 🔧 PRE-DEPLOYMENT

### Code Verification
- [x] Backend code complete
- [x] Frontend code complete
- [x] Extension code complete
- [x] ENV validation added
- [x] Error handling in place
- [x] CORS configured
- [x] All services tested locally

### Documentation
- [x] Deployment guide created
- [x] Quick start guide created
- [x] Extension README created
- [x] Status report created
- [x] Build scripts created

---

## 🚀 BACKEND DEPLOYMENT (Render)

### Setup
- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Select `microtrainer-backend` folder

### Configuration
- [ ] Build Command: `npm install`
- [ ] Start Command: `node index.js`
- [ ] Environment: Node 18+

### Environment Variables
- [ ] Add `GROQ_API_KEY`
- [ ] Add `SHEET_ID`
- [ ] Add `PORT=5000`

### Deployment
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Check logs for errors
- [ ] Note deployed URL

### Verification
- [ ] Test health endpoint: `curl https://your-app.onrender.com/`
- [ ] Test teaching mode: `/ask` endpoint
- [ ] Test interview start: `/interview/start` endpoint
- [ ] Test leaderboard: `/trainer/leaderboard` endpoint
- [ ] Check Google Sheets logging
- [ ] Verify no errors in logs

**Backend URL:** `_______________________________`

---

## 🎨 FRONTEND DEPLOYMENT (Vercel)

### Pre-Deployment
- [ ] Update API URL in `microtrainer-frontend/src/api.js`
- [ ] Replace with backend URL from above
- [ ] Test build locally: `npm run build`

### Vercel Setup
- [ ] Create Vercel account
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] OR use Vercel Dashboard

### Configuration (if using Dashboard)
- [ ] Import GitHub repository
- [ ] Framework Preset: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Root Directory: `microtrainer-frontend`

### Deployment
- [ ] Run `vercel --prod` OR deploy via dashboard
- [ ] Wait for build to complete
- [ ] Note deployed URL

### Verification
- [ ] Visit deployed URL
- [ ] Test home page loads
- [ ] Test chat interface
- [ ] Test interview start
- [ ] Test timer functionality
- [ ] Test feedback display
- [ ] Test dashboard
- [ ] Check mobile responsiveness
- [ ] Verify no console errors

**Frontend URL:** `_______________________________`

---

## 🧩 EXTENSION BUILD

### Pre-Build
- [ ] Backend deployed and working
- [ ] Frontend deployed and working
- [ ] Both URLs noted above

### Update Configuration
- [ ] Update API URL in `microtrainer-extension/background.js`
- [ ] Replace with backend URL

### Build Process (Windows)
- [ ] Open PowerShell in `microtrainer-extension`
- [ ] Run `.\build.ps1`
- [ ] Check for errors
- [ ] Verify `dist/` folder created
- [ ] Verify `microtrainer-extension.zip` created

### Build Process (Mac/Linux)
- [ ] Open Terminal in `microtrainer-extension`
- [ ] Run `chmod +x build.sh`
- [ ] Run `./build.sh`
- [ ] Check for errors
- [ ] Verify `dist/` folder created
- [ ] Verify `microtrainer-extension.zip` created

---

## 🧪 EXTENSION TESTING

### Local Installation
- [ ] Open Chrome
- [ ] Go to `chrome://extensions/`
- [ ] Enable "Developer mode" (top right)
- [ ] Click "Load unpacked"
- [ ] Select `microtrainer-extension` folder
- [ ] Extension appears in toolbar

### Basic Functionality
- [ ] Click extension icon → popup opens
- [ ] Click "Toggle Side Panel" → panel appears
- [ ] Panel loads React app
- [ ] Chat interface visible
- [ ] No console errors

### Cross-Site Testing
Test on these websites:
- [ ] Google.com
- [ ] GitHub.com
- [ ] YouTube.com
- [ ] LinkedIn.com
- [ ] StackOverflow.com

For each site, verify:
- [ ] Panel injects correctly
- [ ] Toggle button works
- [ ] Chat loads
- [ ] API calls succeed
- [ ] No page interference
- [ ] No console errors

### Feature Testing
- [ ] Start interview
- [ ] Ask teaching question
- [ ] Timer counts down
- [ ] Feedback displays
- [ ] Data persists across pages
- [ ] Panel remembers state

### Mobile Testing
- [ ] Test on mobile Chrome (if possible)
- [ ] Panel responsive
- [ ] Touch interactions work

---

## 🎨 EXTENSION POLISH

### Icons
- [ ] Create 16x16 icon
- [ ] Create 48x48 icon
- [ ] Create 128x128 icon
- [ ] Save as PNG files
- [ ] Place in `microtrainer-extension/icons/`
- [ ] Rebuild extension

### Screenshots (for Chrome Web Store)
- [ ] Screenshot 1: Side panel on website
- [ ] Screenshot 2: Chat interface
- [ ] Screenshot 3: Interview mode
- [ ] Screenshot 4: Feedback display
- [ ] Screenshot 5: Dashboard view
- [ ] All screenshots 1280x800 or 640x400

### Promotional Materials
- [ ] Create promotional tile (440x280)
- [ ] Write compelling description
- [ ] List key features
- [ ] Add demo video (optional)

---

## 📦 CHROME WEB STORE SUBMISSION

### Account Setup
- [ ] Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [ ] Pay $5 one-time developer fee
- [ ] Verify email

### Upload Extension
- [ ] Click "New Item"
- [ ] Upload `microtrainer-extension.zip`
- [ ] Wait for upload to complete

### Store Listing
- [ ] **Name:** Micro Trainer - AI Interview Coach
- [ ] **Summary:** Real-time AI mentor for interview preparation
- [ ] **Description:** (Write compelling description)
- [ ] **Category:** Productivity
- [ ] **Language:** English
- [ ] Upload 5 screenshots
- [ ] Upload promotional tile
- [ ] Add demo video URL (optional)

### Privacy & Permissions
- [ ] Explain why `activeTab` permission needed
- [ ] Explain why `storage` permission needed
- [ ] Explain why `host_permissions` needed
- [ ] Add privacy policy URL (if required)

### Pricing & Distribution
- [ ] Select "Free"
- [ ] Select regions (or worldwide)
- [ ] Set visibility (Public/Unlisted)

### Submit
- [ ] Review all information
- [ ] Click "Submit for Review"
- [ ] Wait for review (1-3 days typically)

---

## 📊 POST-DEPLOYMENT

### Monitoring Setup
- [ ] Set up Render monitoring
- [ ] Set up Vercel analytics
- [ ] Monitor Chrome Web Store metrics
- [ ] Set up error tracking (Sentry)
- [ ] Set up uptime monitoring

### Documentation
- [ ] Update README with live URLs
- [ ] Document any deployment issues
- [ ] Create user guide
- [ ] Create troubleshooting guide

### Communication
- [ ] Announce launch
- [ ] Share with beta testers
- [ ] Collect initial feedback
- [ ] Monitor reviews

---

## 🐛 TROUBLESHOOTING

### Backend Issues
- [ ] Check Render logs
- [ ] Verify ENV variables
- [ ] Test endpoints manually
- [ ] Check Google Sheets access

### Frontend Issues
- [ ] Check Vercel logs
- [ ] Verify API URL is correct
- [ ] Check browser console
- [ ] Test API calls in Network tab

### Extension Issues
- [ ] Check extension errors: `chrome://extensions/`
- [ ] Check browser console
- [ ] Verify manifest.json syntax
- [ ] Reload extension
- [ ] Refresh webpage

---

## ✅ LAUNCH CRITERIA

### Technical
- [ ] Backend uptime > 99%
- [ ] API response time < 2s
- [ ] Extension load time < 1s
- [ ] Zero critical errors
- [ ] Mobile responsive

### User Experience
- [ ] Panel loads instantly
- [ ] Chat responds quickly
- [ ] Interview flow smooth
- [ ] No page interference
- [ ] Works on major sites

### Business
- [ ] Chrome Web Store approved
- [ ] All documentation complete
- [ ] Support channels ready
- [ ] Monitoring in place

---

## 🎉 LAUNCH!

- [ ] Backend deployed ✅
- [ ] Frontend deployed ✅
- [ ] Extension tested ✅
- [ ] Chrome Web Store submitted ✅
- [ ] Monitoring active ✅
- [ ] Documentation complete ✅

**Launch Date:** `_______________`

**Status:** `_______________`

---

## 📈 POST-LAUNCH METRICS

Track these metrics weekly:

### Technical
- Backend uptime: ______%
- Average response time: ______ms
- Error rate: ______%
- Active users: ______

### User Engagement
- Daily active users: ______
- Average session time: ______
- Interview completions: ______
- Retention rate: ______%

### Chrome Web Store
- Total installs: ______
- Rating: ______/5
- Reviews: ______
- Uninstalls: ______

---

## 🔄 ITERATION PLAN

### Week 1
- [ ] Monitor for critical bugs
- [ ] Respond to user feedback
- [ ] Fix high-priority issues
- [ ] Optimize performance

### Week 2-4
- [ ] Implement user suggestions
- [ ] Add requested features
- [ ] Improve UX based on data
- [ ] Expand documentation

### Month 2+
- [ ] Plan major features
- [ ] Consider premium tier
- [ ] Expand to other browsers
- [ ] Build community

---

**Last Updated:** May 5, 2026  
**Version:** 1.0.0  
**Status:** Ready for Deployment
