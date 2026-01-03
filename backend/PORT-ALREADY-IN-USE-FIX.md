# 🚫 TATIZO LA "PORT ALREADY IN USE" - SULUHISHO

## Swahili / English Guide

---

## 🔴 **TATIZO (THE PROBLEM)**

Unapata error hii:
```
[BACKEND] Error: listen EADDRINUSE: address already in use :::5000
[FRONTEND] Error: Port 4028 is already in use
```

### **Maana yake (What it means):**
- ✅ Backend tayari inafanya kazi kwenye port 5000
- ✅ Frontend tayari inafanya kazi kwenye port 4028
- ❌ Unajaribu ku-start servers tena (you're trying to start them again)

---

## ✅ **SULUHISHO 1: TUMIA SERVERS ZINAZO FANYA KAZI (Use Running Servers)**

### **Hauhitaji kufanya chochote! (You don't need to do anything!)**

Kila kitu tayari kinafanya kazi. Fungua browser tu:

### **Main Website:**
```
http://localhost:4028
```

### **Admin Portal:**
```
http://localhost:5173
```
(Or check your admin-portal terminal to confirm the port)

### **Backend API:**
```
http://localhost:5000/api/health
```

---

## 🔄 **SULUHISHO 2: RESTART KILA KITU (Fresh Start)**

Kama unataka ku-restart kila kitu:

### **Step 1: Stop All Servers**

Press `Ctrl + C` in EACH of these terminals:
- ❌ Backend terminal
- ❌ Frontend terminal  
- ❌ Admin portal terminal

### **Step 2: Confirm Ports are Free**

```powershell
# Check if any process is using the ports
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000,4028,5173 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue
```

If you see processes, kill them:
```powershell
# Kill process on specific port (example for port 5000)
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
}
```

### **Step 3: Start Fresh**

**Option A - Start Everything Together:**
```powershell
# From isafari_global directory
npm run dev
```

**Option B - Start Separately (Recommended):**

Terminal 1 - Backend:
```powershell
cd backend
npm start
```

Terminal 2 - Frontend:
```powershell
# From isafari_global directory
npm run frontend
```

Terminal 3 - Admin Portal:
```powershell
cd admin-portal
npm run dev
```

---

## 🔍 **QUICK CHECK: Ni Server Gani Zinafanya Kazi?**

### **Check Backend (Port 5000):**
```powershell
netstat -ano | findstr :5000
```
If you see output → Backend is running ✅

### **Check Frontend (Port 4028):**
```powershell
netstat -ano | findstr :4028
```
If you see output → Frontend is running ✅

### **Check Admin Portal (Port 5173):**
```powershell
netstat -ano | findstr :5173
```
If you see output → Admin portal is running ✅

---

## 🎯 **RECOMMENDED: USIPIGE "npm run dev" TENA!**

### **Why? (Kwa nini?)**

Kwa sasa, servers tayari zinafanya kazi:
- Backend: ✅ Running
- Frontend: ✅ Running
- Admin Portal: ✅ Running

Unapopiga `npm run dev` tena, inajaribu ku-start servers tena, na inagoma kwa sababu ports tayari zimetumika!

### **What to Do Instead:**

**Just open your browser:**
- Main site: `http://localhost:4028`
- Admin portal: `http://localhost:5173`

**Test admin dashboard:**
1. Open admin portal
2. Click "Dashboard"
3. Should load without errors! ✅

---

## 💡 **PRO TIP:**

### **Check Running Terminals:**

Angalia terminals zako (check your terminals):
- Terminal 1: Should show "Backend running on port 5000"
- Terminal 2: Should show "Vite dev server running"
- Terminal 3: Should show "Admin portal running"

### **If they're running:**
✅ Just use them! Open browser to the URLs shown

### **If they're not running:**
🔄 Follow "SULUHISHO 2" above to start fresh

---

## 🚨 **ERROR MESSAGES EXPLAINED:**

### **"EADDRINUSE"** 
= Port is already being used by another process
= Your server is already running!

### **"Port 4028 is already in use"**
= Vite server is already running!
= Your frontend is already up!

### **What to do:**
1. Don't panic! ✅
2. Don't run `npm run dev` again ❌
3. Just open browser to `http://localhost:4028` ✅

---

## ✅ **SUMMARY (MUHTASARI):**

| Tatizo | Suluhisho |
|--------|-----------|
| Port already in use | Servers tayari zinafanya kazi - tumia tu! |
| Can't start backend | Backend tayari inafanya kazi - check port 5000 |
| Can't start frontend | Frontend tayari inafanya kazi - fungua browser |
| Want fresh restart | Press Ctrl+C in all terminals, then restart |

---

**Kumbuka (Remember):** 
- Hakuna haja ya ku-run `npm run dev` kila mara!
- Servers zinaweza kufanya kazi kwa muda mrefu
- Fungua browser tu na tumia app!

🎉 **Kila kitu tayari kinafanya kazi!**
