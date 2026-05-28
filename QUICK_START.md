# ⚡ Quick Start - Deploy in 10 Minutes

## 🎯 For Students

### **Step 1: Get Groq API Key** ⏱️ 2 minutes

1. Go to https://console.groq.com/
2. Click "Sign Up" (it's free!)
3. Verify your email
4. Go to "API Keys" section
5. Click "Create API Key"
6. Copy your key (starts with `gsk_...`)

**Keep this key safe!** You'll need it in Step 3.

---

### **Step 2: Click Deploy Button** ⏱️ 1 click

Click this button:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**What happens:**
- Opens Render website
- Shows deployment form
- Lists 3 services to deploy

---

### **Step 3: Configure & Deploy** ⏱️ 1 minute

1. **Sign in to Render** (create free account if needed)

2. **Review Services:**
   - ✅ microtrainer-backend (Node.js)
   - ✅ microtrainer-piston (Docker)
   - ✅ microtrainer-frontend (Static)

3. **Add Your Groq API Key:**
   - Find `GROQ_API_KEY` field
   - Paste your key from Step 1
   - **Important:** Don't skip this!

4. **Click "Deploy"**

---

### **Step 4: Wait for Deployment** ⏱️ 5-10 minutes

**What's happening:**
- ✅ Building backend (2-3 min)
- ✅ Pulling Piston image (3-4 min)
- ✅ Building frontend (2-3 min)
- ✅ Connecting services (automatic)

**You'll see:**
```
microtrainer-backend: Building...
microtrainer-piston: Pulling image...
microtrainer-frontend: Building...
```

**When done:**
```
✅ microtrainer-backend: Live
✅ microtrainer-piston: Live
✅ microtrainer-frontend: Live
```

---

### **Step 5: Access Your App** ⏱️ 30 seconds

1. **Click on `microtrainer-frontend`**
2. **Copy the URL** (looks like: `https://your-app.onrender.com`)
3. **Open in browser**
4. **Start learning!** 🎉

---

## ✅ Verify Everything Works

### **Test 1: Frontend Loads**
- [ ] Open your frontend URL
- [ ] See MicroTrainer homepage
- [ ] Navigation works

### **Test 2: Learning Works**
- [ ] Click "Learn"
- [ ] See "Ask Anything" and "Guided Course"
- [ ] Click "Guided Course"
- [ ] See 11 technologies

### **Test 3: Code Execution Works**
- [ ] Click "Problems"
- [ ] Select a problem
- [ ] Choose a language (JavaScript, Python, Java, etc.)
- [ ] Write simple code:
  ```javascript
  function solution(input) {
    return input * 2;
  }
  ```
- [ ] Click "Run Code"
- [ ] See output with test results

**All checked?** You're ready! 🚀

---

## 🐛 Troubleshooting

### **Issue: "Deployment Failed"**

**Check:**
1. Did you add Groq API key?
2. Is the key valid? (starts with `gsk_`)
3. Check service logs in Render dashboard

**Solution:**
- Go to Render dashboard
- Click on failed service
- Check "Logs" tab
- Look for error message

---

### **Issue: "Frontend loads but can't connect to backend"**

**Check:**
1. Is backend service "Live"? (green status)
2. Is Piston service "Live"? (green status)
3. Wait 2-3 minutes for services to fully start

**Solution:**
- Refresh the page
- Check backend URL: `https://your-backend.onrender.com/`
- Should see: `{"message":"MicroTrainer API is running"}`

---

### **Issue: "Code execution not working"**

**Check:**
1. Is Piston service "Live"?
2. Did you write code in correct format?
3. Check browser console (F12) for errors

**Solution:**
- Make sure code has `function solution(input)` format
- Try simple code first
- Check Piston URL: `https://your-piston.onrender.com/api/v2/runtimes`
- Should see list of available languages

---

### **Issue: "Services keep sleeping"**

**This is normal on free tier!**

**What happens:**
- Services sleep after 15 minutes of inactivity
- Wake up on first request (~30 seconds)

**Solutions:**
1. **Accept it** (it's free!)
2. **Upgrade to paid** ($7/month per service for always-on)
3. **Use a pinger** (ping your URL every 10 minutes)

---

## 💰 Cost Management

### **Stay on Free Tier:**
- ✅ Use less than 750 hours/month per service
- ✅ That's ~100% uptime for one service
- ✅ Or 50% uptime for two services
- ✅ Most students stay free!

### **If You Exceed:**
- Backend: $7/month
- Piston: $7/month
- Frontend: Always free
- **Total: $7-14/month**

### **Monitor Usage:**
1. Go to Render dashboard
2. Click on service
3. Check "Metrics" tab
4. See hours used

---

## 🎓 Next Steps

### **1. Explore Features:**
- [ ] Try "Ask Anything" mode
- [ ] Try "Guided Course" mode
- [ ] Solve coding problems
- [ ] Try different languages

### **2. Track Progress:**
- [ ] Complete a concept
- [ ] See progress bar update
- [ ] Check scores
- [ ] Resume learning

### **3. Practice Coding:**
- [ ] Try JavaScript
- [ ] Try Python
- [ ] Try Java
- [ ] Try C++
- [ ] Try all 50+ languages!

---

## 📚 Learn More

- **[Full Deployment Guide](DEPLOYMENT_GUIDE.md)** - Detailed instructions
- **[README](README.md)** - Features and documentation
- **[Language Support](LANGUAGE_SUPPORT_ADDED.md)** - All supported languages

---

## 🎉 Success!

**You now have:**
- ✅ Your own MicroTrainer instance
- ✅ AI-powered learning
- ✅ 50+ language support
- ✅ Progress tracking
- ✅ $0 cost (free tier)

**Start learning at:** `https://your-app.onrender.com`

---

## 📞 Need Help?

1. **Check logs** in Render dashboard
2. **Read** [Deployment Guide](DEPLOYMENT_GUIDE.md)
3. **Open issue** on GitHub

---

**Happy Learning!** 🚀
