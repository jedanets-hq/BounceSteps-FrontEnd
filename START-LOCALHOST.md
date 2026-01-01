# 🚀 Start Localhost - Quick Guide

## Starting the Application Locally

Follow these steps to preview the fixed system on localhost:

### Step 1: Start Backend Server

Open a terminal and run:

```bash
cd backend
node server.js
```

**Expected Output:**
```
🚀 Server running on port 5000
✅ PostgreSQL connected successfully
📊 Database: Production PostgreSQL on Render
```

**Backend will be available at:** `http://localhost:5000`

---

### Step 2: Start Frontend Development Server

Open a **NEW terminal** (keep backend running) and run:

```bash
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Frontend will be available at:** `http://localhost:5173`

---

## 🎯 What to Check

### 1. Open Browser Console
- Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Go to "Console" tab

### 2. Expected Console Logs (Good Signs ✅)

You should see:
```
🔄 [AuthContext] Initializing...
✅ [AuthContext] Initialization complete

🔄 [CartContext] Initializing...
✅ [CartContext] Initialization complete

🔄 [FavoritesContext] Initializing...
✅ [FavoritesContext] Initialization complete

🔄 [TripsContext] Initializing...
✅ [TripsContext] Initialization complete
```

### 3. What You Should NOT See ❌

- ❌ React Error #321
- ❌ "Something went wrong" error screen
- ❌ Context provider errors
- ❌ Minified React error messages

---

## 📱 Test the Application

### Test 1: Homepage
1. Navigate to `http://localhost:5173`
2. Should load without errors
3. Check console for initialization logs

### Test 2: Login
1. Click "Login" button
2. Try logging in with test credentials
3. Should redirect to dashboard

### Test 3: Dashboard
1. After login, go to traveler dashboard
2. Should load without "Something went wrong" error
3. All tabs should work (Overview, Trips, Favorites, Cart)

### Test 4: Database Connection
1. Try adding something to cart
2. Check console for database logs
3. Should see: `📥 [CartContext] Loading cart from PRODUCTION database...`

---

## 🔧 Troubleshooting

### Backend Won't Start

**Problem:** Port 5000 already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Then restart backend
cd backend
node server.js
```

### Frontend Won't Start

**Problem:** Port 5173 already in use

**Solution:**
```bash
# Kill the process and restart
npm run dev
```

### Database Connection Issues

**Problem:** Can't connect to PostgreSQL

**Check:**
1. `.env` file has correct `DATABASE_URL`
2. Internet connection is working
3. Render database is online

---

## 🎨 Quick Start Script (Windows)

I'll create a batch file to start both servers:

```batch
@echo off
echo Starting iSafari Local Development...
echo.

echo Starting Backend Server...
start cmd /k "cd backend && node server.js"

timeout /t 3

echo Starting Frontend Server...
start cmd /k "npm run dev"

echo.
echo ✅ Both servers starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause
```

Save this as `start-localhost.bat` and double-click to run!

---

## 📊 Expected Behavior

### ✅ Success Indicators

1. **No Error Screen** - App loads normally
2. **Console Logs** - See initialization messages
3. **Database Connected** - API calls work
4. **All Features Work** - Cart, Favorites, Trips all functional

### ❌ If You See Errors

1. Check both terminal windows for error messages
2. Verify `.env` file configuration
3. Check internet connection
4. Review console logs for specific errors

---

## 🚀 Next Steps After Testing

Once you confirm everything works locally:

1. **Build for Production:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   ```bash
   netlify deploy --prod
   ```

3. **Verify Production:**
   - Check deployed site
   - Test all features
   - Monitor console for errors

---

## 📝 Notes

- Backend connects to **PRODUCTION** PostgreSQL database on Render
- Frontend connects to backend at `http://localhost:5000` in development
- All context errors have been fixed
- Error boundary will catch any remaining issues gracefully

**Ready to start? Run the commands above!** 🎉
