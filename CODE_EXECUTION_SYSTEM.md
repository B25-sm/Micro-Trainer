# 🚀 Code Execution System - Complete Guide

## Overview
A complete code execution and problem-solving system integrated into the microtrainer platform, allowing students to write, run, and submit code solutions with real-time feedback.

---

## 🎯 Features

### ✅ Code Editor
- **Monaco Editor** (VS Code's editor) integration
- Syntax highlighting for JavaScript and Python
- Auto-completion and IntelliSense
- Line numbers and code folding
- Dark theme optimized for coding

### ✅ Code Execution
- **Sandboxed JavaScript execution** using VM2
- **Python code execution** via subprocess
- **Test case validation** with detailed results
- **Timeout protection** (5 seconds default)
- **Error handling** with clear messages

### ✅ Problem Solving
- **108 coding challenges** (Easy + Medium)
- **Multiple test cases** per problem
- **Hints system** for learning
- **Difficulty filtering** (Easy, Medium, Hard)
- **Random challenge** generator
- **Progress tracking** (coming soon)

### ✅ Security
- Code validation before execution
- Sandboxed environment for JavaScript
- Restricted imports and dangerous operations
- Timeout limits to prevent infinite loops
- Input sanitization

---

## 📁 Files Added/Modified

### Backend Files:
1. **`microtrainer-backend/services/codeExecutionService.js`** (NEW)
   - JavaScript execution (VM2 sandbox)
   - Python execution (subprocess)
   - Code validation
   - Template generation

2. **`microtrainer-backend/services/problemSolvingQuestionBank.js`** (EXISTING)
   - 108 coding problems
   - Test cases and hints

3. **`microtrainer-backend/index.js`** (MODIFIED)
   - Added 10+ new API endpoints
   - Problem fetching routes
   - Code execution routes
   - Submission handling

4. **`microtrainer-backend/package.json`** (MODIFIED)
   - Added `vm2` for sandboxed execution
   - Added `uuid` for unique file IDs

### Frontend Files:
1. **`microtrainer-frontend/src/components/CodeEditor.jsx`** (NEW)
   - Monaco Editor integration
   - Language selection
   - Run and Submit buttons
   - Test results display

2. **`microtrainer-frontend/src/pages/ProblemSolving.jsx`** (NEW)
   - Problem list sidebar
   - Problem details view
   - Hints system
   - Statistics dashboard

3. **`microtrainer-frontend/src/App.jsx`** (MODIFIED)
   - Added `/problems` route

4. **`microtrainer-frontend/package.json`** (MODIFIED)
   - Added `@monaco-editor/react`

---

## 🔌 API Endpoints

### Problem Management

#### 1. Get Random Problem
```http
GET /problems/random?difficulty=easy&category=easyArrays
```

**Response:**
```json
{
  "id": "easy-arr-1",
  "title": "Find Largest Element",
  "description": "Find the largest number in an array.",
  "testCases": [
    {
      "input": [3, 1, 4, 1, 5, 9],
      "output": 9,
      "explanation": "9 is the largest number"
    }
  ],
  "hints": ["Use Math.max", "Or iterate and track maximum"]
}
```

#### 2. Get Problem by ID
```http
GET /problems/:id
```

#### 3. Get Problems by Difficulty
```http
GET /problems/difficulty/:level
```

**Example:** `/problems/difficulty/easy`

#### 4. Get All Problems
```http
GET /problems
```

#### 5. Get Problem Statistics
```http
GET /problems/stats/all
```

**Response:**
```json
{
  "easy": 41,
  "medium": 67,
  "hard": 0,
  "total": 108,
  "categories": {
    "easyNumbers": {
      "topic": "Easy Number Problems",
      "difficulty": "easy",
      "count": 3
    }
  }
}
```

### Code Execution

#### 6. Execute Code
```http
POST /code/execute
```

**Request Body:**
```json
{
  "language": "javascript",
  "code": "function solution(arr) { return Math.max(...arr); }",
  "testCases": [
    {
      "input": [3, 1, 4, 1, 5, 9],
      "output": 9
    }
  ],
  "timeout": 5000
}
```

**Response:**
```json
{
  "success": true,
  "totalTests": 1,
  "passedTests": 1,
  "failedTests": 0,
  "results": [
    {
      "input": [3, 1, 4, 1, 5, 9],
      "expectedOutput": 9,
      "actualOutput": 9,
      "passed": true,
      "error": null,
      "executionTime": 12
    }
  ],
  "language": "javascript"
}
```

#### 7. Validate Code
```http
POST /code/validate
```

**Request Body:**
```json
{
  "language": "javascript",
  "code": "function solution() { return 42; }"
}
```

**Response:**
```json
{
  "valid": true,
  "errors": []
}
```

#### 8. Get Code Template
```http
GET /code/template/:language?problemId=easy-arr-1
```

**Response:**
```json
{
  "template": "// Write your solution here\nfunction solution(input) {\n  // Your code here\n  \n  return result;\n}",
  "language": "javascript"
}
```

#### 9. Submit Solution
```http
POST /problems/:id/submit
```

**Request Body:**
```json
{
  "language": "javascript",
  "code": "function solution(arr) { return Math.max(...arr); }",
  "studentId": "student123"
}
```

**Response:**
```json
{
  "success": true,
  "totalTests": 3,
  "passedTests": 3,
  "failedTests": 0,
  "score": 100,
  "problemId": "easy-arr-1",
  "studentId": "student123",
  "submittedAt": "2024-01-15T10:30:00.000Z",
  "results": [...]
}
```

---

## 🛠️ Installation & Setup

### 1. Install Backend Dependencies
```bash
cd microtrainer-backend
npm install
```

**New dependencies:**
- `vm2` - Sandboxed JavaScript execution
- `uuid` - Unique file ID generation

### 2. Install Frontend Dependencies
```bash
cd microtrainer-frontend
npm install
```

**New dependency:**
- `@monaco-editor/react` - Code editor component

### 3. Python Setup (Optional)
For Python code execution, ensure Python is installed:
```bash
python --version
```

### 4. Start Backend
```bash
cd microtrainer-backend
npm start
```

Backend runs on: `http://localhost:5000`

### 5. Start Frontend
```bash
cd microtrainer-frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🎮 How to Use

### For Students:

#### 1. Access Problem Solving
Navigate to: `http://localhost:5173/problems`

#### 2. Select Difficulty
- Click **Easy**, **Medium**, or **Hard** buttons
- Or click **Random Challenge** for a surprise

#### 3. Choose a Problem
- Browse the problem list on the left sidebar
- Click on any problem to view details

#### 4. Read Problem Description
- Understand the requirements
- Review test cases
- Click **Show Hints** if needed

#### 5. Write Code
- Select language (JavaScript or Python)
- Write your solution in the Monaco Editor
- Use auto-completion and syntax highlighting

#### 6. Run Code
- Click **Run Code** to test with sample cases
- View results in the output panel
- See which test cases passed/failed

#### 7. Submit Solution
- Click **Submit** when ready
- All test cases will be evaluated
- Get instant feedback and score

---

## 💻 Code Examples

### JavaScript Example:
```javascript
// Problem: Find Largest Element
function solution(arr) {
  return Math.max(...arr);
}

// Or using loop
function solution(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}
```

### Python Example:
```python
# Problem: Find Largest Element
def solution(arr):
    return max(arr)

# Or using loop
def solution(arr):
    max_val = arr[0]
    for num in arr[1:]:
        if num > max_val:
            max_val = num
    return max_val
```

---

## 🔒 Security Features

### 1. Code Validation
- Checks for dangerous operations
- Prevents file system access
- Blocks process manipulation
- Restricts imports

### 2. Sandboxed Execution
- JavaScript runs in VM2 sandbox
- Python runs in isolated subprocess
- No access to system resources
- Limited execution time

### 3. Timeout Protection
- Default 5-second timeout
- Prevents infinite loops
- Kills long-running processes
- Returns timeout error

### 4. Input Sanitization
- Validates all inputs
- Checks code length
- Verifies test case format
- Prevents injection attacks

---

## 📊 Supported Languages

### JavaScript
- ✅ ES6+ syntax
- ✅ Arrow functions
- ✅ Array methods (map, filter, reduce)
- ✅ Object destructuring
- ✅ Template literals
- ❌ Node.js modules (require, import)
- ❌ File system operations
- ❌ Process manipulation

### Python
- ✅ Python 3.x syntax
- ✅ List comprehensions
- ✅ Lambda functions
- ✅ Built-in functions
- ✅ Standard data structures
- ❌ os module
- ❌ subprocess module
- ❌ File operations

---

## 🎯 Problem Categories

### Easy Level (41 problems):
1. **Number Problems** (3)
   - Sum of Digits
   - Reverse Number
   - Factorial

2. **String Problems** (16)
   - Middle Character
   - Vowel Operations
   - Case Manipulation

3. **Array Problems** (9)
   - Find Largest/Second Largest
   - Remove Duplicates
   - Array Operations

4. **Object Problems** (6)
   - Object Manipulation
   - Key/Value Operations

### Medium Level (67 problems):
1. **Number & String** (6)
2. **Pattern Printing** (11)
3. **Array Algorithms** (12)
4. **String Algorithms** (12)
5. **Object Operations** (9)
6. **Fundamentals** (7)

---

## 🚀 Future Enhancements

### Phase 1: Core Features
- [ ] Add more languages (Java, C++, Go)
- [ ] Implement code sharing
- [ ] Add solution discussions
- [ ] Enable code comparison

### Phase 2: Learning Features
- [ ] Video explanations
- [ ] Step-by-step solutions
- [ ] Interactive tutorials
- [ ] Code visualization

### Phase 3: Social Features
- [ ] Leaderboards
- [ ] Peer code review
- [ ] Competitions
- [ ] Team challenges

### Phase 4: Advanced Features
- [ ] AI-powered hints
- [ ] Code optimization suggestions
- [ ] Performance analysis
- [ ] Custom test cases

---

## 🐛 Troubleshooting

### Issue: Monaco Editor not loading
**Solution:** Ensure `@monaco-editor/react` is installed
```bash
npm install @monaco-editor/react
```

### Issue: Python code not executing
**Solution:** Verify Python is installed and in PATH
```bash
python --version
```

### Issue: VM2 errors
**Solution:** Reinstall vm2
```bash
npm uninstall vm2
npm install vm2@3.9.19
```

### Issue: CORS errors
**Solution:** Backend CORS is already configured, ensure backend is running

### Issue: Timeout errors
**Solution:** Optimize your code or increase timeout in request

---

## 📝 Best Practices

### For Students:
1. **Read carefully** - Understand the problem before coding
2. **Use hints** - Don't hesitate to check hints
3. **Test incrementally** - Run code frequently
4. **Handle edge cases** - Consider empty inputs, negatives, etc.
5. **Optimize** - Think about time and space complexity

### For Developers:
1. **Validate inputs** - Always check user input
2. **Handle errors** - Provide clear error messages
3. **Set timeouts** - Prevent infinite loops
4. **Sanitize code** - Check for dangerous operations
5. **Log execution** - Track submissions for analytics

---

## 📈 Analytics (Coming Soon)

- Problem completion rates
- Average time per problem
- Most attempted problems
- Success rates by difficulty
- Language preferences
- Common errors

---

## ✅ System Status

### Backend:
- ✅ Code execution service
- ✅ Problem management APIs
- ✅ Validation system
- ✅ Template generation
- ✅ Security measures

### Frontend:
- ✅ Monaco Editor integration
- ✅ Problem solving page
- ✅ Test results display
- ✅ Hints system
- ✅ Responsive design

### Features:
- ✅ JavaScript execution
- ✅ Python execution
- ✅ 108 problems
- ✅ Test case validation
- ✅ Real-time feedback

---

## 🎉 Ready to Code!

Your microtrainer now has a **complete code execution system** where students can:
- ✅ Browse 108 coding problems
- ✅ Write code in Monaco Editor
- ✅ Run and test solutions
- ✅ Submit for evaluation
- ✅ Get instant feedback
- ✅ Learn with hints

**Access it at:** `http://localhost:5173/problems`

Happy Coding! 💻✨
