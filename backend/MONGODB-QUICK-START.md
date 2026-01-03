# 🚀 iSAFARI GLOBAL - MONGODB QUICK START

## ⚡ HARAKA SANA (VERY QUICK START)

### Swahili (Kiswahili)

**Hatua 1:** Weka password yako ya MongoDB
```powershell
.\setup-mongodb-password.ps1
```

**Hatua 2:** Anza mfumo
```powershell
.\start-with-new-mongodb.bat
```

**Hatua 3:** Fungua browser
- Traveller: http://localhost:4028
- Service Provider: http://localhost:4028
- Admin: http://localhost:5173

---

### English

**Step 1:** Set your MongoDB password
```powershell
.\setup-mongodb-password.ps1
```

**Step 2:** Start the system
```powershell
.\start-with-new-mongodb.bat
```

**Step 3:** Open browser
- Traveller: http://localhost:4028
- Service Provider: http://localhost:4028
- Admin: http://localhost:5173

---

## 📚 DETAILED GUIDES

For complete instructions, see:
- **Complete Guide:** `MONGODB-INTEGRATION-COMPLETE-GUIDE.md`
- **Summary:** `MONGODB-INTEGRATION-SUMMARY.md`

---

## 🔧 MANUAL SETUP

### 1. Set Password Manually

Edit `backend\.env` file:
```bash
# Find this line:
MONGODB_URI=mongodb+srv://mfungojoctan01_db_user:<db_password>@cluster0.yvx6dyz.mongodb.net/...

# Replace <db_password> with your actual password:
MONGODB_URI=mongodb+srv://mfungojoctan01_db_user:YourPassword123@cluster0.yvx6dyz.mongodb.net/...
```

**Important:** If password has special characters, URL encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`

### 2. Test Connection

```powershell
cd backend
node test-new-mongodb-connection.js
```

Expected output:
```
✅ Connected to MongoDB successfully!
🏓 Ping successful
✅ All tests passed!
```

### 3. Start Services

**Option A: All Together**
```powershell
.\start_system.bat
```

**Option B: Separately**

Terminal 1 - Backend:
```powershell
cd backend
npm start
```

Terminal 2 - Frontend:
```powershell
npm run dev
```

Terminal 3 - Admin:
```powershell
cd admin-portal
npm run dev
```

---

## ✅ VERIFY SYSTEM

### Test Backend
```powershell
curl http://localhost:5000/api/health
```

Expected:
```json
{
  "status": "OK",
  "message": "iSafari Global API is running"
}
```

### Test Frontend
1. Open http://localhost:4028
2. Register as traveller
3. Login
4. View services

### Test Admin
1. Open http://localhost:5173
2. View dashboard
3. Check users, services, bookings

---

## 🐛 TROUBLESHOOTING

### Error: "bad auth"
- Check password in `backend\.env`
- Ensure password is URL encoded
- Verify MongoDB Atlas credentials

### Error: "connection timeout"
- Add your IP to MongoDB Atlas whitelist
- Go to: MongoDB Atlas → Network Access → Add IP
- Use `0.0.0.0/0` to allow all IPs (development only)

### Error: "Port already in use"
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📊 SYSTEM OVERVIEW

```
Traveller Portal (4028) ──┐
                          │
Service Provider (4028) ──┼──▶ Backend API (5000) ──▶ MongoDB Atlas
                          │                            (Cloud)
Admin Portal (5173) ──────┘
```

---

## 🎯 WHAT'S CHANGED

✅ MongoDB connection string updated
✅ Test scripts created
✅ Setup scripts created
✅ Documentation created
✅ All models already use MongoDB (no changes needed)
✅ All routes already use MongoDB (no changes needed)

---

## 📞 NEED HELP?

1. Read: `MONGODB-INTEGRATION-COMPLETE-GUIDE.md`
2. Check: `MONGODB-INTEGRATION-SUMMARY.md`
3. Test: `node backend\test-new-mongodb-connection.js`
4. Logs: `backend\server.log`

---

## 🎉 SUCCESS CRITERIA

- [ ] Password set in `.env`
- [ ] Connection test passes
- [ ] Backend starts (port 5000)
- [ ] Frontend starts (port 4028)
- [ ] Admin starts (port 5173)
- [ ] Can register/login
- [ ] Can view services
- [ ] Can create bookings

---

**Last Updated:** 2025-12-02
**System:** iSafari Global v1.0
**Database:** MongoDB Atlas (iSafari-Global)
