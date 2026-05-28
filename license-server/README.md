# 🔒 MicroTrainer License Server

This is YOUR license validation server. Deploy this on Render to control who can use MicroTrainer.

---

## 🚀 Quick Deploy

### **Step 1: Deploy to Render**
1. Go to [render.com](https://render.com/)
2. New + → Web Service
3. Connect this repository
4. Configure:
   ```
   Name: microtrainer-license-server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free (or Starter for always-on)
   ```

### **Step 2: Set Environment Variables**
```
ADMIN_KEY=your-super-secret-admin-key
NODE_ENV=production
```

### **Step 3: Get Your URL**
```
https://microtrainer-license-server.onrender.com
```

### **Step 4: Update MicroTrainer Backend**
Students add to their `.env`:
```
LICENSE_SERVER_URL=https://microtrainer-license-server.onrender.com
```

---

## 🔑 How to Issue License Keys

### **Method 1: Generate via API (Recommended)**

```bash
curl -X POST https://your-license-server.onrender.com/api/admin/generate \
  -H "Content-Type: application/json" \
  -d '{
    "admin_key": "your-admin-key",
    "email": "student@example.com",
    "name": "Student Name"
  }'
```

**Response:**
```json
{
  "success": true,
  "email": "student@example.com",
  "name": "Student Name",
  "license_key": "student@example.com:abc123def456",
  "message": "Add this to APPROVED_STUDENTS array"
}
```

### **Method 2: Add Manually**

Edit `index.js` and add to `APPROVED_STUDENTS`:
```javascript
{
  email: 'student@example.com',
  name: 'Student Name',
  license_key: 'student@example.com:abc123def456', // From generate API
  issued_at: '2026-01-15',
  expires_at: null, // null = never expires
  deployment_url: 'student-microtrainer.onrender.com',
  status: 'active',
}
```

Then redeploy the license server.

---

## 📊 View Active Licenses

```bash
curl "https://your-license-server.onrender.com/api/admin/licenses?admin_key=your-admin-key"
```

**Response:**
```json
{
  "total": 10,
  "active": 8,
  "licenses": [
    {
      "email": "student1@example.com",
      "name": "Student One",
      "status": "active",
      "issued_at": "2026-01-01",
      "expires_at": null,
      "deployment_url": "student1-microtrainer.onrender.com"
    },
    ...
  ]
}
```

---

## 🔄 Student Workflow

### **Step 1: Student Requests License**
Student emails you:
```
To: your-email@example.com
Subject: MicroTrainer License Request

Hi,

I would like to request a license for MicroTrainer.

Name: John Doe
Email: john@example.com
Institution: XYZ University
Intended Use: Personal learning

Thank you!
```

### **Step 2: You Generate License**
```bash
curl -X POST https://your-license-server.onrender.com/api/admin/generate \
  -H "Content-Type: application/json" \
  -d '{
    "admin_key": "your-admin-key",
    "email": "john@example.com",
    "name": "John Doe"
  }'
```

### **Step 3: You Add to Approved List**
Add the generated license to `APPROVED_STUDENTS` in `index.js` and redeploy.

### **Step 4: You Send License to Student**
Email student:
```
Hi John,

Your MicroTrainer license has been approved!

License Key: john@example.com:abc123def456

Add these to your .env file:
LICENSE_KEY=john@example.com:abc123def456
STUDENT_EMAIL=john@example.com
LICENSE_SERVER_URL=https://microtrainer-license-server.onrender.com

Then deploy MicroTrainer and it will work!

Best regards,
[Your Name]
```

### **Step 5: Student Deploys**
Student adds to their `.env` and deploys. Backend validates license on startup.

---

## 🛠️ Management

### **Suspend a License**
Change `status` to `suspended`:
```javascript
{
  email: 'student@example.com',
  status: 'suspended', // ← Changed from 'active'
  ...
}
```

### **Expire a License**
Set `expires_at`:
```javascript
{
  email: 'student@example.com',
  expires_at: '2026-12-31', // ← License expires on this date
  ...
}
```

### **Revoke a License**
Remove from `APPROVED_STUDENTS` array or set status to `revoked`.

---

## 🔒 Security

### **Protect Your Admin Key**
- Never commit `.env` to git
- Use a strong random key
- Rotate periodically

### **HTTPS Only**
- Render provides HTTPS automatically
- Never use HTTP for license validation

### **Rate Limiting (Optional)**
Add rate limiting to prevent abuse:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Monitoring

### **Check Health**
```bash
curl https://your-license-server.onrender.com/health
```

### **View Logs**
Go to Render Dashboard → Your Service → Logs

### **Track Validations**
All validation requests are logged with timestamp and email.

---

## 💰 Cost

### **Free Tier:**
- 750 hours/month
- Sleeps after 15 min inactivity
- **Cost: $0/month**

### **Starter Plan ($7/month):**
- Always-on (no sleep)
- Better for production
- **Recommended for 100+ students**

---

## 🎯 Summary

1. **Deploy this license server** (10 minutes)
2. **Get your license server URL**
3. **Generate license keys** for students
4. **Students add license key** to their `.env`
5. **Students deploy MicroTrainer** (validates automatically)
6. **You control everything!** ✅

---

**Questions?** Contact: [your-email@example.com]
