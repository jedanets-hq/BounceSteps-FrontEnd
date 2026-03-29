# 📧 GMAIL SETUP GUIDE - Password Reset Email Configuration

## 🎯 TATIZO LILILOTATULIWA

**Tatizo:** Students na lecturers hawapati reset codes kwenye Gmail zao za kweli.

**Sababu:** System ilikuwa inatumia Ethereal Email (test service) badala ya Gmail.

**Suluhisho:** Configuration imebadilishwa kutumia Gmail SMTP. Sasa unahitaji tu kuweka Gmail credentials.

---

## ⚡ QUICK START (3 Steps)

### Step 1: Enable Gmail 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Click **"2-Step Verification"**
3. Follow prompts to enable (verify with phone)

### Step 2: Generate Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select:
   - **App:** Mail
   - **Device:** Other (Custom name)
   - **Name:** MUST LMS
3. Click **"Generate"**
4. **COPY** the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### Step 3: Configure Backend
Open `backend/server.js` and update lines 26-34:

```javascript
let CURRENT_ADMIN_EMAIL = process.env.GMAIL_USER || 'your-gmail@gmail.com';
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER || 'mustlms2024@gmail.com',  // ✅ Your Gmail
    pass: process.env.GMAIL_APP_PASSWORD || 'abcd efgh ijkl mnop'  // ✅ Your App Password
  }
};
```

**Replace:**
- `'mustlms2024@gmail.com'` → Your actual Gmail address
- `'abcd efgh ijkl mnop'` → Your 16-character app password

---

## 🔧 DETAILED SETUP INSTRUCTIONS

### Option A: Direct Configuration (Recommended for Testing)

**1. Update backend/server.js:**

```javascript
// Lines 26-34
let CURRENT_ADMIN_EMAIL = 'mustlms2024@gmail.com';  // Your Gmail
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'mustlms2024@gmail.com',      // Your Gmail
    pass: 'abcd efgh ijkl mnop'         // Your App Password (16 chars)
  }
};
```

**2. Update Admin Email in Database:**

**Method 1 - Via Admin Portal:**
1. Start backend: `cd backend && npm start`
2. Open Admin Portal: http://localhost:3000
3. Go to: **Password Management** → **Automatic Password Reset**
4. Click **"Edit"** next to admin email
5. Enter your Gmail address (same as above)
6. Click **"Save"**

**Method 2 - Via SQL:**
```sql
-- Connect to your PostgreSQL database
UPDATE admin_settings 
SET setting_value = 'mustlms2024@gmail.com' 
WHERE setting_key = 'admin_email';
```

**3. Restart Backend:**
```bash
cd backend
npm start
```

You should see:
```
✅ Gmail SMTP configured for: mustlms2024@gmail.com
✅ Real emails will be sent to users' Gmail accounts
```

---

### Option B: Environment Variables (Recommended for Production)

**1. Create .env file in backend folder:**

```bash
# backend/.env
GMAIL_USER=mustlms2024@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

**2. Install dotenv (if not installed):**
```bash
cd backend
npm install dotenv
```

**3. Update backend/server.js (top of file):**
```javascript
require('dotenv').config();
const express = require('express');
// ... rest of imports
```

**4. Restart backend:**
```bash
npm start
```

---

## 🧪 TESTING THE SETUP

### Test 1: Check Backend Logs

After starting backend, you should see:
```
✅ Gmail SMTP configured for: mustlms2024@gmail.com
✅ Real emails will be sent to users' Gmail accounts
✅ Password reset logs table created/verified
🚀 Server is ready to accept requests
```

**If you see this instead:**
```
⚠️  Using Ethereal test email (emails won't reach real Gmail)
📧 Test email account: uj23hiueddhpna2y@ethereal.email
💡 To send real emails, configure Gmail credentials in server.js
```
**→ Gmail credentials are not properly configured. Check Step 3.**

---

### Test 2: Student Password Reset

1. **Open Student Portal:** http://localhost:3001
2. **Click:** "Reset here" (Forgot password link)
3. **Enter:** Any student email (e.g., student@gmail.com)
4. **Click:** "Send Reset Code"
5. **Check Backend Logs:**
   ```
   📧 SENDING REAL EMAIL:
   📧 FROM: mustlms2024@gmail.com
   📧 TO: student@gmail.com
   📧 SUBJECT: Password Reset Code - MUST LMS
   ✅ Email sent successfully: <message-id>
   ✅ Reset code sent to user email: student@gmail.com
   ```
6. **Check Student's Gmail Inbox:**
   - Subject: "Password Reset Code - MUST LMS"
   - From: "MUST LMS <mustlms2024@gmail.com>"
   - Contains 6-digit code
7. **Enter code** in portal and reset password

---

### Test 3: Lecturer Password Reset

Same process as Student, but use:
- **Lecturer Portal:** http://localhost:3002
- **Lecturer email address**

---

## 📧 EMAIL TEMPLATE

Users will receive this professional email:

```
Subject: Password Reset Code - MUST LMS
From: MUST LMS <mustlms2024@gmail.com>

═══════════════════════════════════════════
    MUST Learning Management System
═══════════════════════════════════════════

Password Reset Request

Dear [User Name],

You have requested a password reset for your MUST LMS account.

┌─────────────────────────────────────┐
│  Your verification code is:         │
│                                      │
│           123456                     │
│                                      │
│  This code expires in 15 minutes    │
└─────────────────────────────────────┘

Important:
• Do not share this code with anyone
• If you did not request this reset, ignore this email
• Contact IT Support if you need assistance: +255 25 295 7544

═══════════════════════════════════════════
© 2026 Mbeya University of Science and Technology
This is an automated message, please do not reply.
═══════════════════════════════════════════
```

---

## 🔒 SECURITY BEST PRACTICES

### 1. Gmail App Password Security
- ✅ Never share your app password
- ✅ Use different app passwords for different applications
- ✅ Revoke unused app passwords regularly
- ✅ Don't commit app passwords to Git

### 2. Environment Variables (Production)
```bash
# .env file (add to .gitignore)
GMAIL_USER=mustlms2024@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

```javascript
// .gitignore
.env
*.env
```

### 3. Gmail Account Security
- ✅ Use strong Gmail password
- ✅ Keep 2-factor authentication enabled
- ✅ Monitor account activity regularly
- ✅ Enable login alerts

---

## 🐛 TROUBLESHOOTING

### Issue 1: "Invalid login" Error

**Symptoms:**
```
❌ Email sending failed: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solutions:**
1. **Check 2FA is enabled:** https://myaccount.google.com/security
2. **Generate new app password:** https://myaccount.google.com/apppasswords
3. **Use exact 16-character password** (include spaces if shown)
4. **Verify Gmail address** is correct
5. **Restart backend** after updating credentials

---

### Issue 2: Emails Still Using Ethereal

**Symptoms:**
```
⚠️  Using Ethereal test email (emails won't reach real Gmail)
```

**Solutions:**
1. **Check EMAIL_CONFIG in server.js:**
   - `user` should NOT be `'your-gmail@gmail.com'`
   - `pass` should NOT be `'your-16-char-app-password'`
2. **Update with real credentials**
3. **Restart backend server**

---

### Issue 3: Emails Go to Spam

**Solutions:**
1. **Check spam/junk folder** in Gmail
2. **Add sender to contacts:** mustlms2024@gmail.com
3. **Mark as "Not Spam"**
4. **Whitelist domain** in Gmail settings

---

### Issue 4: Admin Email Mismatch

**Symptoms:**
- Emails sent from wrong address
- Configuration not saving

**Solutions:**
1. **Check database admin email:**
   ```sql
   SELECT * FROM admin_settings WHERE setting_key = 'admin_email';
   ```
2. **Update to match Gmail:**
   ```sql
   UPDATE admin_settings 
   SET setting_value = 'mustlms2024@gmail.com' 
   WHERE setting_key = 'admin_email';
   ```
3. **Or use Admin Portal** to update

---

## 📊 COMPLETE WORKFLOW (After Setup)

```
┌─────────────────────────────────────────────────────────────┐
│  1. User clicks "Forgot Password"                           │
│     ↓                                                        │
│  2. User enters email address                               │
│     ↓                                                        │
│  3. Frontend fetches admin email from backend               │
│     ↓                                                        │
│  4. Frontend sends request to backend:                      │
│     - email: user@gmail.com                                 │
│     - userType: student/lecturer                            │
│     - adminEmail: mustlms2024@gmail.com                     │
│     ↓                                                        │
│  5. Backend processes:                                      │
│     ✅ Finds user in database                               │
│     ✅ Generates 6-digit code (e.g., 123456)                │
│     ✅ Saves code (expires in 15 minutes)                   │
│     ✅ Sends email via Gmail SMTP                           │
│     ↓                                                        │
│  6. User receives email in Gmail inbox                      │
│     Subject: "Password Reset Code - MUST LMS"               │
│     From: "MUST LMS <mustlms2024@gmail.com>"                │
│     Code: 123456                                            │
│     ↓                                                        │
│  7. User enters code in portal                              │
│     ↓                                                        │
│  8. Backend verifies code:                                  │
│     ✅ Valid code                                            │
│     ✅ Not expired                                           │
│     ✅ Not used before                                       │
│     ↓                                                        │
│  9. User sets new password                                  │
│     ↓                                                        │
│  10. Backend updates password:                              │
│      ✅ Updates students/lecturers table                    │
│      ✅ Updates password_records table                      │
│      ✅ Marks code as used                                  │
│      ↓                                                       │
│  11. Confirmation email sent                                │
│      ✅ "Password reset successful"                         │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ VERIFICATION CHECKLIST

Before going live, verify:

- [ ] Gmail 2-factor authentication enabled
- [ ] Gmail app password generated (16 characters)
- [ ] `EMAIL_CONFIG` updated in backend/server.js
- [ ] Admin email in database matches Gmail
- [ ] Backend restarted after configuration
- [ ] Backend logs show: "✅ Gmail SMTP configured"
- [ ] Student password reset test successful
- [ ] Lecturer password reset test successful
- [ ] Reset codes received in real Gmail inbox
- [ ] Codes work for password reset
- [ ] Confirmation emails sent after reset

---

## 🎉 SUCCESS INDICATORS

When everything is working correctly:

### Backend Logs:
```
✅ Gmail SMTP configured for: mustlms2024@gmail.com
✅ Real emails will be sent to users' Gmail accounts
✅ Password reset logs table created/verified
🚀 Server is ready to accept requests

📧 SENDING REAL EMAIL:
📧 FROM: mustlms2024@gmail.com
📧 TO: student@gmail.com
📧 SUBJECT: Password Reset Code - MUST LMS
✅ Email sent successfully: <550948cc-3a62-914f-492b-6c8029da16fc@gmail.com>
✅ Reset code sent to user email: student@gmail.com
```

### User Experience:
1. ✅ User requests password reset
2. ✅ Receives "Code sent to your email" message
3. ✅ **Checks Gmail and finds email** (not spam)
4. ✅ Enters 6-digit code from email
5. ✅ Sets new password successfully
6. ✅ Receives confirmation email
7. ✅ Can login with new password

---

## 📞 SUPPORT

### Gmail Setup Help:
- **2FA Setup:** https://support.google.com/accounts/answer/185839
- **App Passwords:** https://support.google.com/accounts/answer/185833
- **Gmail SMTP:** https://support.google.com/mail/answer/7126229

### System Issues:
- Check backend logs for errors
- Verify database connection
- Test with different email addresses
- Check spam/junk folders

---

## 🚀 DEPLOYMENT NOTES

### For Production (Render/Heroku/etc.):

**Set Environment Variables:**
```bash
GMAIL_USER=mustlms2024@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

**Render.com:**
1. Go to Dashboard → Your Service → Environment
2. Add variables:
   - `GMAIL_USER` = your-gmail@gmail.com
   - `GMAIL_APP_PASSWORD` = your-app-password
3. Save and redeploy

**Heroku:**
```bash
heroku config:set GMAIL_USER=mustlms2024@gmail.com
heroku config:set GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"
```

---

## 📝 SUMMARY

### What Changed:
1. ✅ Backend now uses Gmail SMTP (smtp.gmail.com)
2. ✅ Fallback to Ethereal if Gmail not configured
3. ✅ Student portal fetches admin email dynamically
4. ✅ Lecturer portal fetches admin email dynamically
5. ✅ Clear logging for debugging
6. ✅ Environment variable support

### What You Need to Do:
1. ⚠️ Enable Gmail 2FA
2. ⚠️ Generate Gmail App Password
3. ⚠️ Update EMAIL_CONFIG in server.js
4. ⚠️ Update admin email in database
5. ⚠️ Restart backend server
6. ⚠️ Test password reset workflow

### Result:
**Students na lecturers watapata reset codes kwenye Gmail zao za kweli!** 🎉

---

**Last Updated:** November 5, 2025
**Version:** 2.0
**Status:** Ready for Gmail Configuration
