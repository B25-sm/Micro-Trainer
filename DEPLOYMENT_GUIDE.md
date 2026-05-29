# 🚀 MicroTrainer - One-Click Deployment Guide

## ✨ Deploy in 3 Simple Steps

### **Step 1: Get Your Groq API Key** (2 minutes)
1. Visit https://console.groq.com/
2. Sign up (free)
3. Go to "API Keys"
4. Click "Create API Key"
5. Copy your key (starts with `gsk_...`)

### **Step 2: Click Deploy Button** (1 click)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/microtrainer)

### **Step 3: Add Your API Key** (30 seconds)
1. Render will open
2. Find `GROQ_API_KEY` field
3. Paste your key
4. Click **"Deploy"**

### **Done! ✅**
Wait 5-10 minutes for deployment. You'll get 2 URLs:
- **Frontend:** `https://your-app.onrender.com`
- **Backend:** `https://your-app-backend.onrender.com`

---

## 📊 What Gets Deployed?

### **2 Services (All Automatic):**

1. **MicroTrainer Backend** (Node.js)
   - AI-powered teaching system
   - Progress tracking
   - Assessment engine
   - **Cost:** FREE (Render free tier)

2. **Frontend** (React Static Site)
   - Beautiful UI
   - Responsive design
   - Fast loading
   - **Cost:** FREE (Render free tier)

### **Total Cost: $0/month** ✅
(Render free tier: 750 hours/month per service)

---

## 🎯 Supported Languages

Your deployment supports browser-based problem solving for:

### **Popular Languages:**
- ✅ JavaScript
- ✅ Python

**No Piston server required for these two languages.** Java execution needs a future server runner such as Piston or Judge0.

---

## 🔧 Configuration (Optional)

### **Environment Variables:**

The deployment automatically configures everything, but you can customize:

#### **Backend (.env):**
```env
GROQ_API_KEY=your_key_here          # Required (you provide)
USE_LOCAL_CODE_FALLBACK=true        # Legacy backend fallback only
PORT=5000                            # Automatic
NODE_ENV=production                  # Automatic
```

#### **Frontend (.env):**
```env
VITE_API_URL=auto_configured        # Automatic
```

**You only need to provide GROQ_API_KEY!** Everything else is automatic.

---

## 🐛 Troubleshooting

### **Deployment Failed?**

1. **Check Groq API Key:**
   - Make sure it starts with `gsk_`
   - No extra spaces
   - Key is active

2. **Check Render Status:**
   - Go to Render dashboard
   - Check service logs
   - Look for error messages

3. **Common Issues:**

   **Issue:** "Build failed"
   - **Solution:** Check if all files are committed to GitHub

   **Issue:** "Frontend can't connect to backend"
   - **Solution:** Check if backend service is running

### **Still Having Issues?**

1. Check service logs in Render dashboard
2. Verify both services are "Live" (green)
3. Test backend: `https://your-backend.onrender.com/`

---

## 📈 Usage Limits

### **Render Free Tier:**
- **750 hours/month** per service
- **100GB bandwidth/month**
- **Automatic sleep** after 15 min inactivity
- **Wakes up** on first request (~30 seconds)

### **Groq Free Tier:**
- **30 requests/minute**
- **14,400 requests/day**
- **Plenty for learning!**

### **Problem Solving:**
- JavaScript and Python execute in the student's browser
- No execution server cost for these languages
- Java requires a future server runner

---

## 🔒 Security

### **Your Data:**
- ✅ Stored in YOUR deployment
- ✅ Not shared with anyone
- ✅ You control everything
- ✅ Can delete anytime

### **Code Execution:**
- ✅ Sandboxed (isolated)
- ✅ Time-limited (5 seconds max)
- ✅ Resource-limited (CPU, memory)
- ✅ No file system access

### **API Keys:**
- ✅ Stored as environment variables
- ✅ Never exposed to frontend
- ✅ Encrypted by Render
- ✅ Only you can see them

---

## 🎓 For Students

### **What You Get:**
1. ✅ Full MicroTrainer platform
2. ✅ AI-powered learning
3. ✅ Browser code execution for JavaScript and Python
4. ✅ Progress tracking
5. ✅ Assessment system
6. ✅ Structured learning paths

### **What You Need:**
1. ✅ GitHub account (free)
2. ✅ Render account (free)
3. ✅ Groq API key (free)
4. ✅ 10 minutes of time

### **What You Pay:**
- **$0/month** if you stay within free tiers
- **$7-14/month** if you exceed free tier (heavy usage)

---

## 🚀 Quick Start After Deployment

### **1. Open Your Frontend URL**
```
https://your-app.onrender.com
```

### **2. Start Learning!**
- Click "Learn" in navigation
- Choose "Guided Course" or "Ask Anything"
- Start coding!

### **3. Try Code Execution**
- Go to "Problems"
- Select a problem
- Choose any language (JavaScript, Python, Java, etc.)
- Write code
- Click "Run Code"
- See results instantly!

---

## 📚 Features

### **1. Adaptive Teaching System**
- AI adapts to your level
- Personalized explanations
- Cross-questions to verify understanding

### **2. Structured Learning Paths**
- 11 technologies (JavaScript, Python, Java, React, etc.)
- 5 concepts per technology
- Progressive difficulty
- Track your progress

### **3. Code Compiler**
- 50+ programming languages
- Real-time execution
- Test cases
- Detailed feedback

### **4. Progress Tracking**
- See completed concepts
- View scores
- Track learning journey
- Resume anytime

---

## 🔄 Updating Your Deployment

### **Automatic Updates:**
Render automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update"
git push
```

Render will:
1. ✅ Pull latest code
2. ✅ Rebuild services
3. ✅ Deploy automatically
4. ✅ Zero downtime

---

## 💡 Tips for Best Experience

### **1. Keep Services Awake:**
- Visit your app regularly
- Or upgrade to paid plan ($7/month) for always-on

### **2. Monitor Usage:**
- Check Render dashboard
- Watch for free tier limits
- Upgrade if needed

### **3. Backup Your Data:**
- Export progress regularly
- Download from backend API
- Keep local copy

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Frontend loads at your URL
- [ ] Can navigate to "Learn" page
- [ ] Can select "Guided Course"
- [ ] Can see 11 technologies
- [ ] Can select a technology
- [ ] Can see concepts
- [ ] Can start learning
- [ ] Can go to "Problems"
- [ ] Can select a language
- [ ] Can run code
- [ ] See output/results

**All checked?** You're ready to learn! 🚀

---

## 📞 Support

### **Need Help?**

1. **Check Logs:**
   - Render Dashboard → Your Service → Logs

2. **Test Endpoints:**
   - Backend: `https://your-backend.onrender.com/`

3. **Common Solutions:**
   - Restart service in Render dashboard
   - Check environment variables
   - Verify Groq API key is valid

---

## 🎯 Summary

### **What You Did:**
1. ✅ Got Groq API key
2. ✅ Clicked deploy button
3. ✅ Added API key
4. ✅ Waited 10 minutes

### **What You Got:**
1. ✅ Full learning platform
2. ✅ 50+ language support
3. ✅ AI-powered teaching
4. ✅ Progress tracking
5. ✅ $0 cost (free tier)

### **Next Steps:**
1. 🎓 Start learning!
2. 💻 Practice coding
3. 📈 Track progress
4. 🚀 Master technologies

---

**Congratulations! Your MicroTrainer is live!** 🎉

Start learning at: `https://your-app.onrender.com`
