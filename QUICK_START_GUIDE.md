# 🚀 iSafari Global - Quick Start Guide

## 📋 Muhtasari (Summary)

**Tatizo:** Database ilikuwa tupu, data ya zamani ilikuwa kwenye database nyingine.

**Suluhisho:** Database sasa inafanya kazi vizuri! Jisajili upya na data itaongezwa.

## 🎯 Jinsi Ya Kuanza

### 1️⃣ Anza Development Servers

**Njia Rahisi (Recommended):**
```powershell
.\dev.ps1
```

**Njia ya Kawaida:**
```powershell
npm run dev
```

**Kama Kuna Port Conflicts:**
```powershell
.\kill-ports.ps1
npm run dev
```

### 2️⃣ Fungua Application

- **Frontend:** http://localhost:4028
- **Backend API:** http://localhost:5000
- **Admin Portal:** http://localhost:4028/admin

### 3️⃣ Jisajili (Register)

1. Nenda kwenye admin portal au registration page
2. Jaza form ya registration
3. Data itaongezwa kwenye MongoDB database (`iSafari-Global`)

## 🗄️ Database Information

**Type:** MongoDB Atlas (Cloud)
**Database Name:** `iSafari-Global`
**Status:** ✅ Connected & Working

### Angalia Database Status

```powershell
cd backend
node check-mongodb.js
```

Hii itakuonyesha:
- Collections zilizopo
- Idadi ya documents kwa kila collection
- Sample data

## 🛠️ Utility Scripts

### Port Management

**Futa processes kwenye ports:**
```powershell
.\kill-ports.ps1
```

**Anza servers (automatic port cleanup):**
```powershell
.\dev.ps1
```

### Database Management

**Angalia database:**
```powershell
cd backend
node check-mongodb.js
```

**Test registration:**
```powershell
cd backend
node test-registration.js
```

**Futa test data:**
```powershell
cd backend
node clear-test-data.js
```

## 📁 Project Structure

```
isafari_global/
├── backend/              # Backend API (Node.js + Express + MongoDB)
│   ├── config/          # Database & configuration
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── .env             # Environment variables
│   └── server.js        # Main server file
├── src/                 # Frontend (React + Vite)
│   ├── components/      # React components
│   ├── pages/          # Page components
│   └── utils/          # Utilities
├── dev.ps1             # Development startup script
├── kill-ports.ps1      # Port cleanup script
└── package.json        # Project dependencies
```

## 🔧 Common Issues & Solutions

### Issue 1: Port Already in Use

**Error:**
```
Error: Port 4028 is already in use
Error: Port 5000 is already in use
```

**Solution:**
```powershell
.\kill-ports.ps1
```

### Issue 2: Database Connection Failed

**Error:**
```
MongoDB connection error
```

**Solution:**
1. Check internet connection
2. Verify `.env` file has correct `MONGODB_URI`
3. Check MongoDB Atlas cluster is running

### Issue 3: No Data Showing

**Reason:** Database ni mpya (fresh), hakuna data ya zamani

**Solution:** Jisajili upya, data itaongezwa automatically

## 📊 Environment Variables

Angalia `backend/.env` file:

```env
# MongoDB (Active)
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=iSafari-Global

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:4028

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

## 🎓 Next Steps

1. ✅ **Servers Running** - Use `.\dev.ps1`
2. ✅ **Database Connected** - MongoDB Atlas working
3. 📝 **Register Users** - Create accounts via UI
4. 🔍 **Verify Data** - Use `node backend/check-mongodb.js`
5. 🚀 **Start Building** - Add features to your app

## 💡 Tips

- **Always use `.\dev.ps1`** - It handles port cleanup automatically
- **Check database regularly** - Use `check-mongodb.js` script
- **Keep `.env` secure** - Don't commit to Git
- **Test registration** - Use `test-registration.js` for quick tests

## 📞 Support

Kama una maswali au tatizo:
1. Angalia `DATABASE_SOLUTION.md` kwa maelezo zaidi
2. Tumia utility scripts zilizopo
3. Check console logs kwa errors

---

**Everything is working now! 🎉 Karibu uanze kutumia iSafari Global!**