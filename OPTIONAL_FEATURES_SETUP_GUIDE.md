# 🎯 Optional Features Setup Guide

This guide explains how to set up the 4 optional features that have been implemented:

1. Email Notification System (SendGrid)
2. Browser Push Notifications
3. Progress Sheet Export (Excel/CSV)
4. Notification Preferences UI

---

## 1. 📧 Email Notification System

### Overview
Sends automated emails for:
- Daily practice reminders
- Weekly progress summaries
- Streak congratulations (7, 30, 100 days)
- At-risk alerts

### Setup Steps

#### Step 1: Get SendGrid API Key
1. Sign up at [SendGrid.com](https://sendgrid.com)
2. Create an API key with "Mail Send" permissions
3. Verify your sender email address

#### Step 2: Configure Environment Variables
Add to `microtrainer-backend/.env`:
```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=MicroTrainer
```

#### Step 3: Test Email Service
```bash
cd microtrainer-backend
npm install
node -e "const {sendTestEmail} = require('./services/emailService'); sendTestEmail('test@example.com', 'Test', 'Test email');"
```

### Email Schedule
- **Daily Reminders**: 9:00 AM UTC (for inactive students)
- **Weekly Summaries**: Sunday 8:00 AM UTC (for all students)
- **Streak Congratulations**: Immediate (when milestone reached)
- **At-Risk Alerts**: Immediate (when status changes)

### Files Created
- ✅ `microtrainer-backend/services/emailService.js`
- ✅ Updated `microtrainer-backend/services/cronJobs.js`

---

## 2. 🔔 Browser Push Notifications

### Overview
Sends browser push notifications for:
- Daily practice reminders
- Streak risk alerts
- Badge earned
- Assessment available
- Mock test reminders

### Setup Steps

#### Step 1: Generate VAPID Keys
```bash
cd microtrainer-backend
npx web-push generate-vapid-keys
```

This will output:
```
Public Key: BNxxx...
Private Key: xxx...
```

#### Step 2: Configure Environment Variables
Add to `microtrainer-backend/.env`:
```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:admin@yourdomain.com
```

Add to `microtrainer-frontend/.env.local`:
```env
VITE_VAPID_PUBLIC_KEY=your_public_key_here
```

#### Step 3: Install Dependencies
```bash
cd microtrainer-backend
npm install web-push

cd ../microtrainer-frontend
# No additional dependencies needed (socket.io-client already installed)
```

#### Step 4: Enable HTTPS (Required for Push Notifications)
Push notifications require HTTPS. For development:
```bash
# Option 1: Use ngrok
ngrok http 5173

# Option 2: Use local SSL certificate
# (Configure Vite with HTTPS)
```

For production: Deploy with SSL certificate.

#### Step 5: Test Push Notifications
1. Start backend: `cd microtrainer-backend && npm start`
2. Start frontend: `cd microtrainer-frontend && npm run dev`
3. Navigate to `/settings/notifications`
4. Click "Enable Browser Notifications"
5. Grant permission when prompted
6. Click "Send Test Notification"

### Files Created
- ✅ `microtrainer-backend/services/pushNotificationService.js`
- ✅ `microtrainer-backend/services/notificationPreferencesService.js`
- ✅ `microtrainer-frontend/public/sw.js` (Service Worker)
- ✅ `microtrainer-frontend/src/hooks/usePushNotifications.js`
- ✅ `microtrainer-frontend/src/pages/NotificationSettings.jsx`
- ✅ Added endpoints in `microtrainer-backend/index.js`
- ✅ Added route in `microtrainer-frontend/src/App.jsx`

---

## 3. 📊 Progress Sheet Export (Excel/CSV)

### Overview
Exports student engagement data to CSV format:
- Daily progress sheets (per student or all students)
- Current day status snapshot
- Date range filtering
- Automated daily exports
- 90-day retention

### Setup Steps

#### Step 1: No Additional Setup Required
The export service uses built-in Node.js modules (no external dependencies).

#### Step 2: Test Export
```bash
# Start backend
cd microtrainer-backend
npm start

# Test export endpoint (requires trainer role)
curl -X POST http://localhost:5000/api/export/progress \
  -H "Content-Type: application/json" \
  -H "role: trainer" \
  -d '{"type":"current_status"}'
```

#### Step 3: Enable Automated Daily Exports (Optional)
Uncomment in `microtrainer-backend/services/progressSheetExportService.js`:
```javascript
// In your main server file or cron jobs
const { scheduleAutomatedExports } = require('./services/progressSheetExportService');
scheduleAutomatedExports();
```

### Export Types
1. **`current_status`**: Current day snapshot of all students
2. **`student_daily`**: Daily progress for a specific student (requires `studentId`, `startDate`, `endDate`)
3. **`all_students`**: Daily progress for all students (requires `startDate`, `endDate`)

### API Endpoints
```
POST /api/export/progress (trainer only)
GET /api/export/list (trainer only)
GET /api/export/download/:filename (trainer only)
```

### Export Location
Files are saved to: `microtrainer-backend/data/exports/`

### Files Created
- ✅ `microtrainer-backend/services/progressSheetExportService.js`
- ✅ Added endpoints in `microtrainer-backend/index.js`

---

## 4. ⚙️ Notification Preferences UI

### Overview
Allows students to customize:
- Browser notification on/off
- Email notification on/off
- Email frequency (daily, every 2 days, weekly)
- Quiet hours (no notifications during sleep)
- Notification types (which alerts to receive)

### Setup Steps

#### Step 1: No Additional Setup Required
The UI is already integrated and ready to use.

#### Step 2: Access Notification Settings
Navigate to: `http://localhost:5173/settings/notifications`

Or add a link in your navigation:
```jsx
<Link to="/settings/notifications">Notification Settings</Link>
```

### Features
- ✅ Toggle browser notifications (with permission request)
- ✅ Toggle email notifications
- ✅ Set email frequency
- ✅ Configure quiet hours (start/end time)
- ✅ Enable/disable specific notification types:
  - Daily practice reminders
  - Streak alerts
  - Mock test reminders
  - Progress alerts
  - Badge earned notifications
  - Assessment available notifications
- ✅ Send test notification button
- ✅ Real-time save with confirmation

### Files Created
- ✅ `microtrainer-frontend/src/pages/NotificationSettings.jsx`
- ✅ `microtrainer-backend/services/notificationPreferencesService.js`
- ✅ Added endpoints in `microtrainer-backend/index.js`
- ✅ Added route in `microtrainer-frontend/src/App.jsx`

---

## 🚀 Quick Start (All Features)

### 1. Install Dependencies
```bash
# Backend
cd microtrainer-backend
npm install

# Frontend (no new dependencies needed)
cd ../microtrainer-frontend
npm install
```

### 2. Configure Environment Variables

**Backend (`.env`):**
```env
# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=MicroTrainer

# Push Notifications (VAPID)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@yourdomain.com

# Existing variables
GROQ_API_KEY=your_groq_key
SHEET_ID=your_sheet_id
FRONTEND_URL=http://localhost:5173
```

**Frontend (`.env.local`):**
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### 3. Generate VAPID Keys
```bash
cd microtrainer-backend
npx web-push generate-vapid-keys
```

### 4. Start Services
```bash
# Terminal 1: Backend
cd microtrainer-backend
npm start

# Terminal 2: Frontend
cd microtrainer-frontend
npm run dev
```

### 5. Test Features

#### Test Email (if configured):
- Wait for scheduled time OR
- Trigger manually via cron job

#### Test Push Notifications:
1. Go to `http://localhost:5173/settings/notifications`
2. Enable browser notifications
3. Click "Send Test Notification"

#### Test Export:
```bash
curl -X POST http://localhost:5000/api/export/progress \
  -H "Content-Type: application/json" \
  -H "role: trainer" \
  -d '{"type":"current_status"}'
```

#### Test Preferences UI:
1. Go to `http://localhost:5173/settings/notifications`
2. Toggle settings
3. Click "Save Preferences"

---

## 📋 Feature Status

| Feature | Status | Setup Required | Dependencies |
|---------|--------|----------------|--------------|
| Email Notifications | ✅ Implemented | SendGrid API Key | None (axios) |
| Browser Push Notifications | ✅ Implemented | VAPID Keys + HTTPS | web-push |
| Progress Sheet Export | ✅ Implemented | None | None |
| Notification Preferences UI | ✅ Implemented | None | None |

---

## 🔧 Troubleshooting

### Email Not Sending
- ✅ Check `SENDGRID_API_KEY` is set
- ✅ Verify sender email is verified in SendGrid
- ✅ Check backend logs for errors
- ✅ Test with SendGrid API directly

### Push Notifications Not Working
- ✅ Ensure HTTPS is enabled (required for push)
- ✅ Check VAPID keys are correctly set
- ✅ Verify browser supports push notifications
- ✅ Check browser notification permission is granted
- ✅ Look for service worker registration errors in console

### Export Failing
- ✅ Ensure `data/exports` directory exists
- ✅ Check file permissions
- ✅ Verify trainer role header is sent
- ✅ Check backend logs for errors

### Preferences Not Saving
- ✅ Check `data/notifications` directory exists
- ✅ Verify API endpoint is reachable
- ✅ Check browser console for errors
- ✅ Ensure JSON is valid

---

## 📚 API Documentation

### Email Service
```javascript
const { sendDailyReminder, sendWeeklySummary, sendStreakCongratulations, sendAtRiskAlert } = require('./services/emailService');

// Send daily reminder
await sendDailyReminder('student@example.com', 'John', 5, 'JavaScript');

// Send weekly summary
await sendWeeklySummary('student@example.com', 'John', weeklyStats);

// Send streak congratulations
await sendStreakCongratulations('student@example.com', 'John', 7);

// Send at-risk alert
await sendAtRiskAlert('student@example.com', 'John', 3, 5);
```

### Push Notification Service
```javascript
const { sendDailyPracticeReminder, sendStreakRiskAlert, sendBadgeEarnedNotification } = require('./services/pushNotificationService');

// Send daily reminder
await sendDailyPracticeReminder('student123', 5, 'JavaScript');

// Send streak risk alert
await sendStreakRiskAlert('student123', 5, 6);

// Send badge earned
await sendBadgeEarnedNotification('student123', 'Week Warrior', '⚡');
```

### Export Service
```javascript
const { exportWithMetadata, getAvailableExports, getExportFile } = require('./services/progressSheetExportService');

// Export current status
const result = exportWithMetadata('current_status');

// Get available exports
const exports = getAvailableExports();

// Download export
const { filepath, content } = getExportFile('current_status_2026-01-15.csv');
```

---

## 🎉 Conclusion

All 4 optional features are now **fully implemented** and ready to use!

- ✅ Email notifications with beautiful HTML templates
- ✅ Browser push notifications with service worker
- ✅ Progress sheet export in CSV format
- ✅ Notification preferences UI with all controls

**Next Steps:**
1. Configure SendGrid API key for emails
2. Generate VAPID keys for push notifications
3. Enable HTTPS for production
4. Test all features
5. Deploy to production

**Need Help?** Check the troubleshooting section or review the implementation files.

---

**Last Updated:** January 2026  
**Status:** ✅ ALL FEATURES IMPLEMENTED
