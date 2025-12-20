# iSafari Global - Startup Guide

## ⚡ QUICK START (2 SIMPLE STEPS)

### After PC Restart/Reboot:

**Terminal 1 - Backend:**
```bash
cd /home/danford/Documents/isafari_global/backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd /home/danford/Documents/isafari_global
npm run dev
```

### OR Use the Script:
```bash
cd /home/danford/Documents/isafari_global
./start-all.sh
# Then open new terminal and run: npm run dev
```

**That's it! Both services will be running.**

---

## ✅ Complete Setup (First Time)

### 1. Install PM2 (One-time setup)
```bash
npm install -g pm2
```

### 2. Setup PM2 to Start on Boot
```bash
pm2 startup
# Copy and run the command it shows
pm2 save
```

### 3. Start Backend with PM2
```bash
cd /home/danford/Documents/isafari_global
pm2 start ecosystem.config.js
pm2 save
```

### 4. Verify Backend is Running
```bash
pm2 status
curl http://localhost:5000/api/health
```

---

## 📊 Service Status

### Check What's Running
```bash
pm2 list
```

### View Backend Logs
```bash
pm2 logs isafari-backend
```

### Stop Backend
```bash
pm2 stop isafari-backend
```

### Restart Backend
```bash
pm2 restart isafari-backend
```

### Delete Process (if needed)
```bash
pm2 delete isafari-backend
```

---

## 🔧 Troubleshooting

### Backend Not Starting?

**1. Check PostgreSQL:**
```bash
pg_isready -h localhost -p 5433
```
If not running, start PostgreSQL first.

**2. Check Backend Logs:**
```bash
pm2 logs isafari-backend --lines 50
```

**3. Restart Backend:**
```bash
pm2 restart isafari-backend
```

**4. Check if port 5000 is in use:**
```bash
lsof -i :5000
# Kill process if needed:
kill -9 <PID>
```

### Frontend Errors?

**1. Clear node_modules and reinstall:**
```bash
rm -rf node_modules
npm install
```

**2. Clear Vite cache:**
```bash
rm -rf node_modules/.vite
npm run dev
```

**3. Check if port 4028 is in use:**
```bash
lsof -i :4028
```

---

## 🗄️ Database Connection

**PostgreSQL Settings:**
- Host: localhost
- Port: 5433
- Database: ISAFARI
- User: postgres
- Password: dany@123

**Connect to Database:**
```bash
PGPASSWORD=dany@123 psql -h localhost -p 5433 -U postgres -d ISAFARI
```

---

## 👥 Test User Credentials

### Service Provider
- Email: `juma@gmail.com`
- Business: CHAPATI ZA MOTO
- Location: Mbeya

### Travelers
- Email: `traveler@test.com`
- Email: `dany@gmail.com`

*(Password: Use your registered password)*

---

## 🎯 Service URLs

- **Frontend:** http://localhost:4028
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

---

## 📝 Important Notes

### Auto-Save Features
✅ **Services:** Automatically saved to database
✅ **User Sessions:** Stored in localStorage
✅ **Journey Plans:** Can be saved
✅ **Bookings:** Persisted in database

### Data Persistence
- All data is stored in PostgreSQL database
- User sessions persist in browser localStorage
- PM2 keeps backend running permanently
- No data loss on restart

### Before Making Changes
1. Services are auto-active when created
2. Logout/login refreshes authentication token
3. Database changes are immediate and permanent

---

## 🔄 Daily Workflow

### Morning (After PC Start)
```bash
# 1. Check if backend is running
pm2 status

# 2. If not running, start it
pm2 start ecosystem.config.js

# 3. Start frontend
cd /home/danford/Documents/isafari_global
npm run dev
```

### During Development
- Backend runs continuously (managed by PM2)
- Frontend: `npm run dev` when needed
- Database: Always running

### Evening (Before Shutdown)
```bash
# Backend will auto-start on next boot if configured
# Just close frontend terminal
pm2 save  # Save current PM2 state
```

---

## 🛠️ Maintenance Commands

### Update Backend Code
```bash
pm2 restart isafari-backend
```

### View All Logs
```bash
pm2 logs
```

### Monitor Resources
```bash
pm2 monit
```

### Clear Logs
```bash
pm2 flush
```

---

## ✅ System Requirements

- Node.js v16+
- PostgreSQL 12+
- PM2 (npm install -g pm2)
- 2GB RAM minimum
- 10GB disk space

---

## 🎉 Success Checklist

- [ ] PM2 installed globally
- [ ] Backend running with PM2
- [ ] Frontend starts with `npm run dev`
- [ ] Can login as service provider
- [ ] Can add services
- [ ] Can view services as traveler
- [ ] Journey planner works
- [ ] No console errors

---

## 📞 Quick Commands Reference

| Action | Command |
|--------|---------|
| Start backend | `pm2 start ecosystem.config.js` |
| Stop backend | `pm2 stop isafari-backend` |
| Restart backend | `pm2 restart isafari-backend` |
| View logs | `pm2 logs isafari-backend` |
| Check status | `pm2 status` |
| Start frontend | `npm run dev` |
| Check DB | `pg_isready -h localhost -p 5433` |

---

## 🔐 Security Notes

- Change default passwords in production
- Update `.env` file with secure credentials
- Never commit `.env` to git
- Use HTTPS in production

---

**Last Updated:** 2025-10-14
**Version:** 1.0.0
**Status:** ✅ Production Ready
