# 🚀 Quick Start Guide

## ✅ Setup Complete!

All dependencies are installed and configured. Here's how to start your servers:

---

## Option 1: Manual Start (Recommended for Development)

### Terminal 1 - Backend Server
```bash
cd microtrainer-backend
npm start
```

**Expected Output:**
```
🚀 Micro Trainer Backend running on port 5000
📊 Engagement & Assessment System: ACTIVE
🔌 WebSocket Server: ACTIVE
✅ Web Push configured with VAPID keys
⏰ Initializing cron jobs...
✅ Cron jobs initialized
```

### Terminal 2 - Frontend Server
```bash
cd microtrainer-frontend
npm run dev
```

**Expected Output:**
```
VITE v8.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Option 2: Using PowerShell (Windows)

### Start Backend (in one PowerShell window):
```powershell
cd microtrainer-backend
npm start
```

### Start Frontend (in another PowerShell window):
```powershell
cd microtrainer-frontend
npm run dev
```

---

## 🎯 Access Your Application

Once both servers are running:

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:5000
3. **Health Check**: http://localhost:5000/health

---

## 🧪 Test the Features

### 1. Test Core Features
- Navigate to: http://localhost:5173/engagement
- You should see the Engagement Dashboard with real-time updates

### 2. Test Notification Settings
- Navigate to: http://localhost:5173/settings/notifications
- Enable browser notifications (requires HTTPS in production)
- Configure your preferences

### 3. Test Admin Dashboard
- Navigate to: http://localhost:5173/admin/engagement
- Monitor all students in real-time

### 4. Test Progress Export (Admin Only)
```bash
# Using curl (requires trainer role header)
curl -X POST http://localhost:5000/api/export/progress \
  -H "Content-Type: application/json" \
  -H "role: trainer" \
  -d '{"type":"current_status"}'
```

---

## 📧 Optional: Configure Email Notifications

If you want to enable email notifications:

1. Sign up at [SendGrid.com](https://sendgrid.com)
2. Get your API key
3. Update `microtrainer-backend/.env`:
   ```env
   SENDGRID_API_KEY=your_actual_sendgrid_api_key
   FROM_EMAIL=your-verified-email@yourdomain.com
   ```
4. Restart the backend server

---

## 🔔 Optional: Enable Push Notifications (Production)

Push notifications require HTTPS. For local testing:

### Option 1: Use ngrok
```bash
# Install ngrok: https://ngrok.com
ngrok http 5173
```

### Option 2: Use local SSL certificate
Configure Vite with HTTPS (see Vite documentation)

---

## 🛑 Stop Servers

Press `Ctrl+C` in each terminal window to stop the servers.

---

## 🐛 Troubleshooting

### Backend won't start
- ✅ Check if port 5000 is already in use
- ✅ Verify all environment variables are set
- ✅ Run `npm install` again

### Frontend won't start
- ✅ Check if port 5173 is already in use
- ✅ Verify `.env.local` exists
- ✅ Run `npm install` again

### WebSocket not connecting
- ✅ Ensure backend is running first
- ✅ Check browser console for errors
- ✅ Verify CORS settings

### Push notifications not working
- ✅ Requires HTTPS (use ngrok for local testing)
- ✅ Check VAPID keys are correctly set
- ✅ Verify browser supports push notifications

---

## 📚 Next Steps

1. ✅ Start both servers
2. ✅ Test the engagement dashboard
3. ✅ Test notification settings
4. ✅ Test admin dashboard
5. ✅ Configure SendGrid (optional)
6. ✅ Set up HTTPS for push notifications (optional)

---

## 🎉 You're All Set!

Everything is configured and ready to go. Just start the servers and begin testing!

**Need Help?** Check the documentation files:
- `OPTIONAL_FEATURES_SETUP_GUIDE.md` - Detailed setup instructions
- `ALL_FEATURES_COMPLETE.md` - Complete feature list
- `FINAL_IMPLEMENTATION_STATUS.md` - Implementation details

---

**Status**: ✅ Ready to Launch  
**Last Updated**: January 2026
