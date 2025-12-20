# 🚀 HOW TO START iSafari Global

## ✅ SIMPLE - One Command

```bash
npm run dev
```

**That's it!** ✨

---

## 📊 What This Does:

```
✅ Starts Backend (port 5000)
✅ Starts Frontend (port 4028)  
✅ Keeps both running together
✅ Shows color-coded logs
```

---

## 🌐 Access Your App:

**Frontend:** http://localhost:4028  
**Backend API:** http://localhost:5000/api/health

---

## 🛑 How to Stop:

```
Press: Ctrl+C
```

---

## ⚠️ If You Get "Backend Not Responding" Error:

**It means backend is not running!**

**Fix:**
```bash
# Use npm run dev to start BOTH
npm run dev
```

---

## 📖 Alternative Methods:

### Method 1: npm run dev (Recommended) ✅
```bash
npm run dev
```
Starts both backend and frontend

---

### Method 2: Bash Script
```bash
./START-BOTH.sh
```
Same as npm run dev, with port cleanup

---

### Method 3: Manual (NOT Recommended)
```bash
# Terminal 1
npm run backend

# Terminal 2  
npm run frontend
```
Need 2 terminals, easy to forget backend

---

## ✅ Verify Everything is Running:

### Check Backend:
```bash
curl http://localhost:5000/api/health
```

**Expected:**
```json
{"status":"OK","message":"iSafari Global API is running"}
```

---

### Check Frontend:
```
Open browser: http://localhost:4028
Should load the homepage
```

---

## 🎯 Daily Workflow:

```bash
# 1. Open terminal
cd /home/danford/Documents/isafari_global

# 2. Start everything
npm run dev

# 3. Open browser
# http://localhost:4028

# 4. Start coding!

# 5. When done, stop with Ctrl+C
```

---

## 🔧 Troubleshooting:

### Port Already in Use:
```bash
# Kill and restart
lsof -ti:5000 | xargs kill -9
lsof -ti:4028 | xargs kill -9
npm run dev
```

### Backend Error During Signin:
```bash
# Backend is not running
# Solution: Use npm run dev
npm run dev
```

---

**REMEMBER:** Always use `npm run dev` to start! 🚀

**No more backend errors!** ✅
