# 🧪 TEST MICRO TRAINER EXTENSION

## ✅ Extension is Ready!

The extension is configured with your production URLs:
- **Backend:** `https://micro-trainer.onrender.com`
- **Frontend:** `https://micro-trainer.vercel.app`

---

## 🚀 LOAD EXTENSION IN CHROME

### Step 1: Open Chrome Extensions

1. Open Chrome browser
2. Go to: `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top right)

### Step 2: Load Extension

1. Click **"Load unpacked"** button
2. Navigate to: `E:\Microtrainer\microtrainer-extension`
3. Click **"Select Folder"**

### Step 3: Verify Installation

You should see:
- ✅ Extension card appears
- ✅ Name: "Micro Trainer - AI Interview Coach"
- ✅ Version: 1.0.0
- ✅ No errors

---

## 🧪 TEST THE EXTENSION

### Test 1: Extension Icon

1. Look for the 🧠 icon in Chrome toolbar
2. Click it → Popup should open

### Test 2: Side Panel on Any Website

1. Visit any website (e.g., google.com)
2. Look for the 🧠 floating button (right side)
3. Click it → Side panel should slide in
4. Panel should load: `https://micro-trainer.vercel.app`

### Test 3: Interview Functionality

1. In the side panel, click "Start Interview"
2. Select subject (React/Java/Python)
3. Click "Start Interview"
4. Should get a question from backend
5. Type answer and submit
6. Should get feedback

### Test 4: Cross-Site Testing

Test on these sites:
- [ ] google.com
- [ ] github.com
- [ ] youtube.com
- [ ] stackoverflow.com

For each site:
- [ ] Panel injects correctly
- [ ] Toggle button works
- [ ] No page interference
- [ ] Interview works

---

## 🐛 TROUBLESHOOTING

### Issue: Extension won't load

**Check:**
- Developer mode is enabled
- Correct folder selected
- No syntax errors in manifest.json

**Fix:**
```bash
# Check manifest syntax
cd microtrainer-extension
cat manifest.json
```

### Issue: Panel doesn't appear

**Check:**
- Open browser console (F12)
- Look for errors
- Check if content.js loaded

**Fix:**
- Reload extension in `chrome://extensions/`
- Refresh the webpage

### Issue: Can't connect to backend

**Check:**
- Backend is running: https://micro-trainer.onrender.com
- Check Network tab in DevTools
- Look for CORS errors

**Fix:**
- Verify backend URL in background.js
- Check host_permissions in manifest.json

---

## 📝 KNOWN LIMITATIONS

### Icons Missing
The extension uses placeholder icons. For production:
1. Create 16x16, 48x48, 128x128 PNG icons
2. Place in `microtrainer-extension/icons/`
3. Reload extension

### No Build Step Needed
Since we're loading from Vercel, no build step is required!
The extension directly loads your deployed frontend.

---

## ✅ SUCCESS CRITERIA

Extension is working if:
- [x] Loads without errors
- [ ] Icon appears in toolbar
- [ ] Popup opens on click
- [ ] Side panel injects on all sites
- [ ] Toggle button works
- [ ] Frontend loads in iframe
- [ ] Interview functionality works
- [ ] No console errors

---

## 🎯 AFTER TESTING

Once everything works:

1. **Create proper icons**
   - Use a design tool or AI
   - Export as 16x16, 48x48, 128x128 PNG
   - Place in `icons/` folder

2. **Take screenshots**
   - Panel on different websites
   - Interview in action
   - Feedback display
   - (Needed for Chrome Web Store)

3. **Create ZIP for Chrome Web Store**
   ```bash
   cd microtrainer-extension
   # Exclude unnecessary files
   zip -r microtrainer-extension.zip . -x "*.md" -x "*.sh" -x "*.ps1"
   ```

4. **Submit to Chrome Web Store**
   - Go to: https://chrome.google.com/webstore/devconsole
   - Pay $5 developer fee (one-time)
   - Upload ZIP
   - Fill store listing
   - Submit for review

---

## 🚀 READY TO TEST!

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked"
5. Select `microtrainer-extension` folder
6. Test on any website!

---

**Good luck! 🎉**
