# Troubleshooting Guide - iSafari Global Platform

**Last Updated:** December 28, 2025  
**Status:** All Systems Operational ✅

---

## Quick Start

### Start Backend
```bash
node backend/server.js
# Backend will run on http://localhost:5000
```

### Start Frontend
```bash
npm run dev
# Frontend will run on http://localhost:4028
```

### Access Application
```
http://localhost:4028
```

---

## Common Issues and Solutions

### 1. "Error adding to cart: API endpoint not found"

**Cause:** Backend server not running or cart routes not registered

**Solution:**
```bash
# 1. Kill any existing processes on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# 2. Start backend
node backend/server.js

# 3. Verify backend is running
curl http://localhost:5000/api/health
# Should return: {"status":"OK","message":"iSafari Global API is running"}
```

---

### 2. "Cannot connect to backend"

**Cause:** Frontend cannot reach backend API

**Solution:**
```bash
# 1. Check .env.local file
cat .env.local
# Should have: VITE_API_BASE_URL=http://localhost:5000/api

# 2. Verify backend is running
curl http://localhost:5000/api/health

# 3. Check browser console for errors
# Open DevTools (F12) → Console tab

# 4. Restart frontend
npm run dev
```

---

### 3. "Port 5000 already in use"

**Cause:** Another process is using port 5000

**Solution:**
```bash
# Windows - Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Then start backend
node backend/server.js
```

---

### 4. "Port 4028 already in use"

**Cause:** Another process is using port 4028

**Solution:**
```bash
# Windows - Find and kill process on port 4028
netstat -ano | findstr :4028
taskkill /PID <PID> /F

# Then start frontend
npm run dev
```

---

### 5. "Database connection failed"

**Cause:** PostgreSQL not running or DATABASE_URL incorrect

**Solution:**
```bash
# 1. Check backend/.env
cat backend/.env
# Should have: DATABASE_URL=postgresql://postgres:@Jctnftr01@localhost:5432/iSafari-Global-Network

# 2. Verify PostgreSQL is running
# Windows: Check Services or run
psql -U postgres -d iSafari-Global-Network -c "SELECT NOW();"

# 3. If PostgreSQL not running, start it
# Windows: Services → PostgreSQL → Start

# 4. Restart backend
node backend/server.js
```

---

### 6. "Authentication error / 401 Unauthorized"

**Cause:** User not logged in or token expired

**Solution:**
```bash
# 1. Clear browser cache and localStorage
# Open DevTools (F12) → Application → Clear Site Data

# 2. Login again with test account
# Email: traveler@isafari.com
# Password: password

# 3. Verify token is stored
# Open DevTools → Application → Local Storage
# Should see: isafari_user with token

# 4. If still failing, check JWT_SECRET in backend/.env
cat backend/.env | grep JWT_SECRET
```

---

### 7. "Cart items not persisting"

**Cause:** Cart not saving to database

**Solution:**
```bash
# 1. Verify user is logged in
# Check localStorage for isafari_user token

# 2. Check cart_items table
# Run diagnostic script
node backend/test-cart-api-diagnostic.js

# 3. Verify database connection
# Check backend logs for connection errors

# 4. Clear cart and try again
# Open DevTools → Application → Local Storage → Delete isafari_cart
```

---

### 8. "Service not found when adding to cart"

**Cause:** Service ID doesn't exist in database

**Solution:**
```bash
# 1. Verify services exist in database
node backend/check-postgresql-data.js

# 2. Check service ID is correct
# Open DevTools → Network tab
# Look at POST /api/cart/add request
# Verify serviceId is a valid number

# 3. Seed database with test data if needed
node backend/seed-data.js
```

---

### 9. "Frontend shows blank page"

**Cause:** Frontend build error or missing dependencies

**Solution:**
```bash
# 1. Clear node_modules and reinstall
rm -r node_modules
npm install

# 2. Clear Vite cache
rm -r .vite

# 3. Restart frontend
npm run dev

# 4. Check browser console for errors
# Open DevTools (F12) → Console tab
```

---

### 10. "CORS error in browser console"

**Cause:** Frontend and backend CORS configuration mismatch

**Solution:**
```bash
# 1. Verify CORS is enabled in backend/server.js
# Should have: app.use(cors({...}))

# 2. Check allowed origins include localhost:4028
# backend/server.js should have:
# 'http://localhost:4028'

# 3. Restart backend
node backend/server.js

# 4. Clear browser cache
# DevTools → Application → Clear Site Data
```

---

## Testing Commands

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Test Cart API (requires auth token)
```bash
# 1. Get token from browser localStorage
# 2. Run test
node backend/test-book-now-complete.js
```

### Test Database Connection
```bash
node backend/test-cart-api-diagnostic.js
```

### Check System Health
```bash
node system-health-check.js
```

---

## Database Queries

### Check Users
```bash
psql -U postgres -d iSafari-Global-Network -c "SELECT id, email, user_type FROM users LIMIT 5;"
```

### Check Services
```bash
psql -U postgres -d iSafari-Global-Network -c "SELECT id, title, price FROM services LIMIT 5;"
```

### Check Cart Items
```bash
psql -U postgres -d iSafari-Global-Network -c "SELECT * FROM cart_items;"
```

### Clear Cart
```bash
psql -U postgres -d iSafari-Global-Network -c "DELETE FROM cart_items;"
```

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:@Jctnftr01@localhost:5432/iSafari-Global-Network
JWT_SECRET=isafari_global_super_secret_jwt_key_2024_secure
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:4028
```

### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:4028
VITE_NODE_ENV=development
```

---

## Performance Optimization

### Clear Cache
```bash
# Browser cache
# DevTools → Application → Clear Site Data

# Backend cache
# Restart backend: node backend/server.js

# Database cache
# Restart PostgreSQL
```

### Monitor Performance
```bash
# Check backend response time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/api/health

# Check database performance
psql -U postgres -d iSafari-Global-Network -c "EXPLAIN ANALYZE SELECT * FROM cart_items;"
```

---

## Logs and Debugging

### Backend Logs
```bash
# Run backend with verbose logging
NODE_DEBUG=* node backend/server.js

# Check for errors in console output
```

### Frontend Logs
```bash
# Open DevTools (F12)
# Console tab - shows all errors and warnings
# Network tab - shows API requests and responses
# Application tab - shows localStorage and cookies
```

### Database Logs
```bash
# PostgreSQL logs location (Windows)
# C:\Program Files\PostgreSQL\<version>\data\log\

# Or check PostgreSQL service logs
```

---

## Recovery Procedures

### Full System Reset
```bash
# 1. Stop all processes
taskkill /F /IM node.exe

# 2. Clear caches
rm -r node_modules/.vite
rm -r .vite

# 3. Clear database (if needed)
psql -U postgres -d iSafari-Global-Network -c "DELETE FROM cart_items;"

# 4. Restart backend
node backend/server.js

# 5. Restart frontend
npm run dev
```

### Database Reset
```bash
# 1. Connect to database
psql -U postgres -d iSafari-Global-Network

# 2. Drop and recreate tables
DROP TABLE IF EXISTS cart_items CASCADE;
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, service_id)
);

# 3. Verify
SELECT * FROM cart_items;
```

---

## Support Resources

### Test Accounts
```
Traveler:
  Email: traveler@isafari.com
  Password: password

Service Provider:
  Email: provider@isafari.com
  Password: password

Admin:
  Email: admin@isafari.com
  Password: password
```

### Diagnostic Scripts
- `system-health-check.js` - Overall system health
- `backend/test-cart-api-diagnostic.js` - Cart API functionality
- `backend/test-book-now-complete.js` - Complete workflow test
- `backend/check-postgresql-data.js` - Database status

### Documentation
- `SYSTEM-MAINTENANCE-COMPLETE-REPORT.md` - Full maintenance report
- `backend/.env` - Backend configuration
- `.env.local` - Frontend configuration

---

## Contact & Escalation

If issues persist after following these steps:

1. Check all logs (browser console, backend console, database logs)
2. Run diagnostic scripts to identify the issue
3. Review the SYSTEM-MAINTENANCE-COMPLETE-REPORT.md
4. Check environment variables are correctly set
5. Verify all services are running (backend, frontend, database)

---

**Last Verified:** December 28, 2025  
**Status:** ✅ All Systems Operational

