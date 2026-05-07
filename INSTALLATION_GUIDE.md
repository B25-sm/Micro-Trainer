# 🚀 Quick Installation Guide - Code Execution System

## Prerequisites
- Node.js (v16 or higher)
- Python 3.x (for Python code execution)
- npm or yarn

---

## 📦 Step-by-Step Installation

### Step 1: Install Backend Dependencies
```bash
cd microtrainer-backend
npm install
```

This will install the new dependencies:
- `vm2` - For sandboxed JavaScript execution
- `uuid` - For generating unique file IDs

### Step 2: Install Frontend Dependencies
```bash
cd microtrainer-frontend
npm install
```

This will install:
- `@monaco-editor/react` - VS Code's editor for the browser

### Step 3: Verify Python Installation (Optional)
```bash
python --version
# or
python3 --version
```

If Python is not installed, download from: https://www.python.org/downloads/

### Step 4: Start Backend Server
```bash
cd microtrainer-backend
npm start
```

Backend will run on: **http://localhost:5000**

### Step 5: Start Frontend Development Server
```bash
cd microtrainer-frontend
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## ✅ Verify Installation

### 1. Check Backend Health
Open browser: `http://localhost:5000`

You should see:
```json
{
  "status": "OK",
  "service": "Micro Trainer Backend",
  "time": "2024-01-15T10:30:00.000Z"
}
```

### 2. Check Problem API
Open: `http://localhost:5000/problems/stats/all`

You should see:
```json
{
  "easy": 41,
  "medium": 67,
  "hard": 0,
  "total": 108,
  "categories": {...}
}
```

### 3. Access Problem Solving Page
Open: `http://localhost:5173/problems`

You should see:
- Problem list on the left
- Code editor in the center
- Problem description at the top

---

## 🎯 Quick Test

### Test JavaScript Execution:

1. Go to `http://localhost:5173/problems`
2. Select "Easy" difficulty
3. Click on "Find Largest Element"
4. Write this code:
```javascript
function solution(arr) {
  return Math.max(...arr);
}
```
5. Click "Run Code"
6. You should see all tests passing! ✅

### Test Python Execution:

1. Change language to "Python"
2. Write this code:
```python
def solution(arr):
    return max(arr)
```
3. Click "Run Code"
4. You should see all tests passing! ✅

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module 'vm2'"
**Solution:**
```bash
cd microtrainer-backend
npm install vm2
```

### Issue 2: "Cannot find module '@monaco-editor/react'"
**Solution:**
```bash
cd microtrainer-frontend
npm install @monaco-editor/react
```

### Issue 3: Python not found
**Solution:**
- Install Python from https://www.python.org/downloads/
- Add Python to PATH
- Restart terminal

### Issue 4: Port already in use
**Solution:**
```bash
# Kill process on port 5000 (Backend)
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (Frontend)
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

### Issue 5: CORS errors
**Solution:**
- Ensure backend is running on port 5000
- Check that CORS is enabled in backend (already configured)
- Clear browser cache

---

## 📝 Environment Variables

Make sure your `.env` file in `microtrainer-backend` has:
```env
GROQ_API_KEY=your_groq_api_key
SHEET_ID=your_google_sheet_id
PORT=5000
```

---

## 🎉 You're All Set!

Your code execution system is now ready! Students can:
- ✅ Browse 108 coding problems
- ✅ Write code in a professional editor
- ✅ Run and test their solutions
- ✅ Get instant feedback
- ✅ Submit solutions for evaluation

**Start coding at:** `http://localhost:5173/problems`

---

## 📚 Next Steps

1. **Explore Problems** - Try different difficulty levels
2. **Test Languages** - Switch between JavaScript and Python
3. **Use Hints** - Click "Show Hints" for guidance
4. **Submit Solutions** - Click "Submit" to evaluate all test cases
5. **Track Progress** - (Coming soon) View your statistics

---

## 🆘 Need Help?

- Check `CODE_EXECUTION_SYSTEM.md` for detailed documentation
- Review API endpoints in the documentation
- Check browser console for errors
- Verify backend logs for issues

Happy Coding! 💻✨
