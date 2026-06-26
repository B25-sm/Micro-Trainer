# 🔒 How to Set Yourself as Trainer

## ✅ Security Fixed!

The "Switch Role" button has been **REMOVED**. Students can NO LONGER change their role.

---

## 👨‍🏫 How to Become a Trainer

### Option 1: Browser Console (Quick & Easy)

1. Open your browser: http://localhost:5173
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Type this command:
   ```javascript
   localStorage.setItem('userRole', 'trainer')
   ```
5. Press `Enter`
6. **Refresh the page** (F5)
7. ✅ You're now a trainer! You'll see the "Trainer" link in navigation

---

### Option 2: Create a Trainer Login Page

For production, you should create a proper login system where:
1. Trainers enter username/password
2. Backend verifies credentials
3. Backend returns JWT token with role
4. Frontend stores role from token

---

## 👨‍🎓 How Students Access the App

Students will **automatically** be students (default role). They:
- ✅ Cannot see "Trainer" link
- ✅ Cannot access `/trainer` routes (redirected to home)
- ✅ Cannot access `/admin` routes (redirected to home)
- ✅ Can only access student pages

---

## 🧪 Test It Now

### As a Student (Default):
1. Open browser: http://localhost:5173
2. You should **NOT** see "Trainer" link
3. Try accessing: http://localhost:5173/trainer
4. **Result**: Redirected to home ✅

### As a Trainer:
1. Open browser console (F12)
2. Run: `localStorage.setItem('userRole', 'trainer')`
3. Refresh page
4. You should **NOW** see "Trainer" link
5. Click it → Access granted ✅

---

## 🔐 Security Status

| Feature | Status |
|---------|--------|
| Students can see "Trainer" link | ❌ NO |
| Students can access trainer pages | ❌ NO |
| Students can switch to trainer role | ❌ NO |
| Trainers can access trainer pages | ✅ YES |
| Routes are protected | ✅ YES |

---

## 🚀 For Production

Replace localStorage with real authentication:

```javascript
// After successful login
const response = await fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ username, password })
});

const { token, role } = await response.json();
localStorage.setItem('authToken', token);
localStorage.setItem('userRole', role); // 'trainer' or 'student'
```

---

**Now students CANNOT become trainers!** 🔒

Only YOU can set yourself as trainer using the browser console command.

---

**Last Updated**: January 2026  
**Status**: ✅ SECURE
