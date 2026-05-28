# 🎓 MicroTrainer - AI-Powered Learning Platform

**Learn programming with AI-powered adaptive teaching, structured learning paths, and hands-on coding practice.**

⚠️ **License Required:** This software requires a license key. See [How to Get a License](HOW_TO_GET_LICENSE.md)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## 🔑 Quick Start

### **📚 [Complete Setup Guide →](STUDENT_SETUP_GUIDE.md)**

**3 Simple Steps:**

1. **Request License** (2 min) - Email your instructor
2. **Get Groq API Key** (5 min) - Free at [console.groq.com](https://console.groq.com/)
3. **Deploy** (10 min) - Click your personalized link

**Total Time:** 15 minutes | **Cost:** $0 | **Installation:** None

**[📖 Detailed Student Guide →](STUDENT_SETUP_GUIDE.md)**

---

## ✨ Features

### 🤖 **Adaptive Teaching System**
- AI adapts to your learning level
- Personalized explanations
- Interactive Q&A with cross-questions
- Verifies your understanding

### 📚 **Structured Learning Paths**
- **11 Technologies:** JavaScript, Python, Java, React, Node.js, TypeScript, MongoDB, Django, Spring Boot, HTML, CSS
- **5 Concepts per Technology:** Progressive difficulty
- **Track Progress:** See completed concepts and scores
- **Resume Anytime:** Your progress is saved

### 💻 **Code Compiler**
- **50+ Programming Languages** when using a self-hosted **[Piston](https://github.com/engineer-man/piston)** instance (see `docker-compose.piston.yml` in this repo).
- **Development fallback:** JavaScript and Python can run in-process when Piston is unreachable; other languages require Piston.
- **Real-time Execution:** Run code against your test cases
- **Detailed Feedback:** See what went wrong

### 📊 **Progress Tracking**
- View completed concepts
- Track scores and performance
- Resume your learning journey
- Persistent progress (survives page refresh)

---

## 🚀 Quick Deploy (10 Minutes)

### **Step 1: Get Groq API Key** (2 minutes)
1. Visit [console.groq.com](https://console.groq.com/)
2. Sign up (free)
3. Create API key
4. Copy your key (starts with `gsk_...`)

### **Step 2: Deploy to Render** (1 click)
Click the button above ☝️ or visit: [render.com/deploy](https://render.com/deploy)

### **Step 3: Configure** (30 seconds)
1. Paste your Groq API key
2. Click **"Deploy"**
3. Wait 10 minutes

### **Done!** ✅
You'll get 3 URLs:
- **Frontend:** Your learning platform
- **Backend:** API server
- **Piston:** Code execution engine

---

## 💰 Cost

### **Free Tier (Most Users):**
- ✅ **$0/month** with Render free tier
- ✅ 750 hours/month per service
- ✅ Plenty for learning!

### **If You Exceed Free Tier:**
- 💵 **$7-14/month** for heavy usage
- 💡 Most students stay within free tier

---

## 🎯 What You Get

### **3 Services (Deployed Automatically):**

1. **MicroTrainer Backend**
   - AI teaching engine
   - Progress tracking
   - Assessment system

2. **Piston Code Execution**
   - Runs code in 50+ languages
   - Secure sandboxed execution
   - No compiler installation needed

3. **Frontend**
   - Beautiful UI
   - Responsive design
   - Fast loading

---

## 🔧 Local Development

### **Prerequisites:**
- Node.js 18+
- npm or yarn

### **Backend Setup:**
```bash
cd microtrainer-backend
npm install
cp .env.example .env
# Add your GROQ_API_KEY to .env
npm start
```

### **Frontend Setup:**
```bash
cd microtrainer-frontend
npm install
npm run dev
```

### **Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 📚 How to Use

### **1. Guided Learning (Structured Path)**
1. Click **"Learn"** in navigation
2. Select **"Guided Course"**
3. Choose a technology (JavaScript, Python, etc.)
4. Start with Concept 1
5. Learn → Answer questions → Get assessed
6. Progress to next concept

### **2. Ask Anything (Free-form Learning)**
1. Click **"Learn"** in navigation
2. Select **"Ask Anything"**
3. Ask any programming question
4. Get personalized explanations
5. AI adapts to your level

### **3. Practice Coding (Problem Solving)**
1. Click **"Problems"** in navigation
2. Select a problem
3. Choose your language (50+ options!)
4. Write code
5. Click **"Run Code"**
6. See results and feedback

---

## 🔒 Security

### **Code Execution:**
- ✅ Sandboxed in Docker containers
- ✅ Time-limited (5 seconds max)
- ✅ Resource-limited (CPU, memory)
- ✅ No file system access
- ✅ No network access

### **Your Data:**
- ✅ Stored in YOUR deployment
- ✅ Not shared with anyone
- ✅ You control everything
- ✅ Can delete anytime

---

## 🎓 Supported Technologies

### **Programming Languages (50+):**
JavaScript, Python, Java, C++, C, C#, TypeScript, Go, Rust, Ruby, PHP, Swift, Kotlin, Scala, Haskell, Lua, Perl, R, Dart, Elixir, and more!

### **Learning Paths (11):**
1. **JavaScript** - Variables, Functions, Arrays, Objects, Async
2. **Python** - Basics, Data Structures, OOP, Modules, File I/O
3. **Java** - Syntax, OOP, Collections, Exceptions, Streams
4. **React** - Components, Props, State, Hooks, Context
5. **Node.js** - Modules, Express, Async, Databases, APIs
6. **TypeScript** - Types, Interfaces, Generics, Decorators, Advanced
7. **MongoDB** - CRUD, Queries, Aggregation, Indexing, Schema
8. **Django** - Models, Views, Templates, Forms, Authentication
9. **Spring Boot** - Basics, REST APIs, JPA, Security, Testing
10. **HTML** - Elements, Forms, Semantic, Accessibility, Best Practices
11. **CSS** - Selectors, Box Model, Flexbox, Grid, Responsive

---

## 🐛 Troubleshooting

### **Deployment Failed?**
1. Check your Groq API key is correct
2. Verify all files are committed to GitHub
3. Check Render service logs

### **Code Execution Not Working?**
1. Wait 30 seconds (services wake from sleep)
2. Check Piston service is running
3. Try a different language

### **Progress Not Saving?**
1. Check backend service is running
2. Verify you're logged in
3. Clear browser cache and retry

---

## 📞 Support

### **Need Help?**
1. Check service logs in Render dashboard
2. Verify all 3 services are "Live" (green)
3. Test backend: `https://your-backend.onrender.com/`
4. Test Piston: `https://your-piston.onrender.com/api/v2/runtimes`

---

## 🎉 Success Checklist

After deployment, verify:
- [ ] Frontend loads at your URL
- [ ] Can navigate to "Learn" page
- [ ] Can select "Guided Course"
- [ ] Can see 11 technologies
- [ ] Can start learning
- [ ] Can go to "Problems"
- [ ] Can select a language
- [ ] Can run code
- [ ] See output/results

**All checked?** You're ready to learn! 🚀

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 🚀 Get Started

**Ready to deploy?**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Time:** 10 minutes  
**Cost:** $0/month (free tier)  
**Result:** Your own AI-powered learning platform!

**Let's go!** 💪
