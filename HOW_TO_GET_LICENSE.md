# 🔑 How to Get Your MicroTrainer License

MicroTrainer requires a license key to operate. This ensures proper usage and helps us support you better.

---

## 📋 Step 1: Request a License

### **Send an Email:**
```
To: [your-email@example.com]
Subject: MicroTrainer License Request

Hi,

I would like to request a license for MicroTrainer.

Name: [Your Full Name]
Email: [Your Email]
Institution: [Your School/University] (optional)
Intended Use: Personal learning / Course project / etc.

Thank you!
```

### **What to Include:**
- ✅ Your full name
- ✅ Your email address
- ✅ Your institution (if applicable)
- ✅ How you plan to use MicroTrainer

---

## 📧 Step 2: Receive Your License

You'll receive an email with your license key:

```
Hi [Your Name],

Your MicroTrainer license has been approved!

License Key: your-email@example.com:abc123def456

Add these to your .env file:
LICENSE_KEY=your-email@example.com:abc123def456
STUDENT_EMAIL=your-email@example.com
LICENSE_SERVER_URL=https://microtrainer-license-server.onrender.com

Then deploy MicroTrainer and it will work!

Best regards,
[Instructor Name]
```

---

## ⚙️ Step 3: Add License to Your Deployment

### **Option A: Deploy to Render (Recommended)**

When deploying to Render, add these environment variables:

```
GROQ_API_KEY=your_groq_key_here
LICENSE_KEY=your-email@example.com:abc123def456
STUDENT_EMAIL=your-email@example.com
LICENSE_SERVER_URL=https://microtrainer-license-server.onrender.com
```

### **Option B: Local Development**

Create/update `microtrainer-backend/.env`:

```env
# Your Groq API Key
GROQ_API_KEY=your_groq_key_here

# Your License (from email)
LICENSE_KEY=your-email@example.com:abc123def456
STUDENT_EMAIL=your-email@example.com
LICENSE_SERVER_URL=https://microtrainer-license-server.onrender.com

# Other settings
PISTON_URL=https://emkc.org/api/v2/piston
SHEET_ID=your_sheet_id
PORT=5000
```

---

## ✅ Step 4: Verify License

When you start the backend, you should see:

```
================================================================================
🎓 MICROTRAINER - AI-POWERED LEARNING PLATFORM
📄 Copyright (c) 2026 [Your Instructor]
📋 Licensed under Educational Use License
================================================================================

🔒 Validating license...
🔍 License validation request...
✅ License validated successfully
   Student: [Your Name]
   Expires: Never

✅ License validated successfully
```

If you see this, your license is working! 🎉

---

## ❌ Troubleshooting

### **Error: LICENSE_KEY not found**
```
❌ LICENSE_KEY not found in environment variables
```

**Solution:** Add `LICENSE_KEY` to your `.env` file

---

### **Error: STUDENT_EMAIL not found**
```
❌ STUDENT_EMAIL not found in environment variables
```

**Solution:** Add `STUDENT_EMAIL` to your `.env` file

---

### **Error: Invalid license key**
```
❌ License validation failed: Invalid license key or email
```

**Solutions:**
1. Check that `LICENSE_KEY` matches exactly what was sent to you
2. Check that `STUDENT_EMAIL` matches your registered email
3. Contact [your-email@example.com] if the issue persists

---

### **Error: License validation failed**
```
❌ License validation failed during periodic check
```

**Solutions:**
1. Check your internet connection
2. Verify license server is running
3. Contact [your-email@example.com] if the issue persists

---

### **Error: Could not connect to license server**
```
⚠️  Could not connect to license server
```

**Solutions:**
1. Check `LICENSE_SERVER_URL` is correct
2. Check your internet connection
3. In development mode, the app will continue with a warning

---

## 📋 License Terms

### **You MAY:**
- ✅ Use MicroTrainer for personal learning
- ✅ Deploy your own instance
- ✅ Modify the code for learning purposes

### **You MAY NOT:**
- ❌ Use commercially without permission
- ❌ Redistribute the software
- ❌ Remove copyright notices
- ❌ Rebrand or rename the software

### **Full Terms:**
See the `LICENSE` file in the repository for complete terms and conditions.

---

## 🔄 License Renewal

### **Does My License Expire?**
Most licenses are issued without expiration. Check your license email for details.

### **How to Renew:**
If your license has an expiration date, contact [your-email@example.com] before it expires.

---

## 📞 Support

### **Need Help?**
- 📧 Email: [your-email@example.com]
- 🌐 Website: [https://your-website.com]
- 📄 License Terms: See `LICENSE` file

### **Common Questions:**

**Q: Is the license free?**  
A: Yes, for educational use!

**Q: Can I share my license key?**  
A: No, license keys are personal and non-transferable.

**Q: Can I use this for a course project?**  
A: Yes! Just mention it in your license request.

**Q: Can I modify the code?**  
A: Yes, for personal learning. See LICENSE for details.

**Q: Can I deploy multiple instances?**  
A: One license = one deployment. Contact us for multiple deployments.

---

## 🎉 Ready to Start!

Once you have your license key:

1. ✅ Add to `.env` file
2. ✅ Deploy to Render
3. ✅ Start learning!

**Questions?** Contact: [your-email@example.com]

---

**Happy Learning!** 🚀
