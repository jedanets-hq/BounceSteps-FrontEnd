# 🚀 How to Start iSafari Application

## Quick Start Guide

### ✅ Current Status:
- ✅ Backend running on port 5000 (already started)
- ✅ Dependencies installed
- 🔄 Need to start frontend and admin portal

---

## Option 1: Start Everything with One Command (Recommended)

### From the root directory `isafari_global`:
```powershell
npm run frontend
```

This will start:
- Frontend on `http://localhost:4028` (or Vite's default port)

**Note:** Backend is already running on port 5000

---

## Option 2: Start Admin Portal Separately

### From the `admin-portal` directory:
```powershell
cd admin-portal
npm run dev
```

This will start the admin portal on its own dev server (usually `http://localhost:5173`)

---

## Option 3: Start Both Backend and Frontend Together (Fresh Start)

If you want to restart everything from scratch:

### 1. Stop the current backend (if needed)
Press `Ctrl+C` in the backend terminal

### 2. Run both together:
```powershell
# From root directory isafari_global
npm run dev
```

This will start BOTH:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:4028`

---

## 📊 Accessing the Applications

### Main iSafari Website:
- URL: `http://localhost:4028` (or check Vite output for actual port)
- This is the traveler/service provider facing app

### Admin Portal:
If running separately from `admin-portal` folder:
- URL: `http://localhost:5173` (or check Vite output)
- Dashboard: `http://localhost:5173/index.html`

### Backend API:
- URL: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`
- Admin dashboard data: `http://localhost:5000/api/admin/analytics/dashboard`

---

## 🔧 Troubleshooting

### "concurrently is not recognized"
✅ **FIXED** - Just ran `npm install` to install it

### "Missing script: start"
- Use `npm run dev` instead (for both backend + frontend)
- Or use `npm run frontend` (for just frontend)

### Admin portal not loading
1. Make sure you're in `admin-portal` directory
2. Run `npm run dev`
3. Open the URL shown in terminal output

### Backend not responding
Backend is currently running. Check with:
```powershell
netstat -ano | findstr :5000
```

If nothing, restart:
```powershell
cd backend
npm start
```

---

## 📝 Summary of Available Commands

### Root Directory (`isafari_global`):
- `npm run dev` - Start both backend and frontend
- `npm run backend` - Start only backend
- `npm run frontend` - Start only frontend (Vite)
- `npm run build` - Build for production

### Admin Portal (`admin-portal`):
- `npm run dev` - Start admin portal dev server
- `npm run build` - Build admin portal for production
- `npm run preview` - Preview production build

### Backend (`backend`):
- `npm start` - Start backend server
- `npm run dev` - Start with nodemon (auto-restart)

---

## 🎯 Recommended Next Steps

1. **Start the frontend:**
   ```powershell
   npm run frontend
   ```

2. **Open your browser to:**
   - Main site: Check terminal output for Vite URL
   - Admin portal: Navigate to `admin-portal` and run `npm run dev`

3. **Test the admin dashboard:**
   - Open admin portal URL
   - Click on Dashboard
   - Should see the dashboard with 0 values (empty database is normal)

---

## 💡 Pro Tip

Since backend is already running, you only need to start the frontend. The quickest way:

```powershell
# From isafari_global directory
npm run frontend
```

Then open `http://localhost:4028` or whatever Vite shows in the terminal!

---

**Ready to go!** 🚀
