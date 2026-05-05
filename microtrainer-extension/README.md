# 🧠 Micro Trainer - Chrome Extension

## 📦 What This Is

A Chrome extension that injects a persistent AI mentor side panel into every webpage. Users can practice interviews, ask questions, and get real-time feedback without leaving their workflow.

## 🏗️ Architecture

```
Extension Components:
├── manifest.json          → Extension configuration
├── content.js            → Injects side panel into pages
├── background.js         → Service worker (lifecycle management)
├── popup.html/js         → Extension icon popup
├── styles.css            → Side panel styling
└── dist/                 → React app build (from frontend)
```

## 🚀 Build Process

### Step 1: Build React Frontend

```bash
cd ../microtrainer-frontend
npm install
npm run build
```

### Step 2: Copy Build to Extension

```bash
# From extension directory
mkdir -p dist
cp -r ../microtrainer-frontend/dist/* ./dist/
```

### Step 3: Update API URL

Edit `dist/assets/index-*.js` and replace:
```javascript
// Find and replace
const API_BASE_URL = "http://localhost:5000"
// With
const API_BASE_URL = "https://your-backend.onrender.com"
```

Or better, update `microtrainer-frontend/src/api.js` before building:
```javascript
const API_BASE_URL = import.meta.env.PROD 
  ? "https://your-backend.onrender.com"
  : "http://localhost:5000";
```

## 🧪 Testing (Development Mode)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `microtrainer-extension` folder
5. Extension should appear in toolbar

### Test Checklist

- [ ] Extension icon appears
- [ ] Click icon → popup opens
- [ ] Click "Toggle Side Panel" → panel appears on page
- [ ] Panel loads React app correctly
- [ ] Chat interface works
- [ ] Interview mode functions
- [ ] Panel persists across page navigation
- [ ] No console errors

## 📝 Configuration

### Update Backend URL

Edit `background.js`:
```javascript
apiUrl: data.apiUrl || 'https://your-backend.onrender.com'
```

### Add Icons

Place icon files in `icons/` folder:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

Use a brain emoji or custom logo.

## 🎨 Customization

### Change Panel Width

Edit `styles.css`:
```css
#microtrainer-panel {
  width: 420px; /* Change this */
}
```

### Change Toggle Button Position

Edit `styles.css`:
```css
#microtrainer-toggle {
  right: 20px; /* Horizontal position */
  top: 50%;    /* Vertical position */
}
```

## 🐛 Troubleshooting

### Panel Not Appearing

1. Check browser console for errors
2. Verify `dist/` folder exists and has React build
3. Reload extension: `chrome://extensions/` → Reload button
4. Refresh the webpage

### API Calls Failing

1. Check CORS settings in backend
2. Verify API URL is correct
3. Check Network tab in DevTools
4. Ensure backend is deployed and running

### Extension Not Loading

1. Check `manifest.json` syntax (use JSON validator)
2. Verify all file paths are correct
3. Check Chrome DevTools → Extensions → Errors

## 📦 Production Build

### Step 1: Prepare Files

```bash
# Build frontend with production API URL
cd ../microtrainer-frontend
npm run build

# Copy to extension
cd ../microtrainer-extension
rm -rf dist
cp -r ../microtrainer-frontend/dist ./dist
```

### Step 2: Create ZIP

```bash
# From extension directory
zip -r microtrainer-extension.zip . -x "*.git*" -x "node_modules/*" -x "*.DS_Store"
```

### Step 3: Upload to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 developer fee (if first time)
3. Click **New Item**
4. Upload `microtrainer-extension.zip`
5. Fill in store listing:
   - Name: Micro Trainer - AI Interview Coach
   - Description: Real-time AI mentor for interview preparation
   - Category: Productivity
   - Screenshots: (capture panel in action)
6. Submit for review (takes 1-3 days)

## 🔐 Permissions Explained

```json
"permissions": [
  "activeTab",    // Access current tab when user clicks extension
  "storage"       // Store user preferences
]

"host_permissions": [
  "https://*/*"   // Make API calls to backend
]
```

## 🎯 Key Features

- ✅ **Persistent Side Panel** - Always accessible, never blocks content
- ✅ **Works Everywhere** - Injects on all websites
- ✅ **Lightweight** - Minimal performance impact
- ✅ **Responsive** - Adapts to mobile and desktop
- ✅ **Offline Ready** - Core UI works without backend

## 📊 Analytics (Future)

Track usage with:
- Interview sessions started
- Questions asked
- Time spent in panel
- Most used features

Implement in `background.js` using Chrome Storage API.

## 🚀 Next Steps

1. ✅ Build extension structure
2. ⏳ Test locally
3. ⏳ Add icons
4. ⏳ Production build
5. ⏳ Submit to Chrome Web Store

## 📞 Support

For issues:
1. Check browser console
2. Check extension errors: `chrome://extensions/`
3. Verify backend is running
4. Test API endpoints directly

---

**Version:** 1.0.0  
**Last Updated:** May 5, 2026
