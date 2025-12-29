# System Maintenance and Bug Fixes - Complete Solution

## Problem Statement

The "Book Now" button is failing with error: **"Error adding to cart: API endpoint not found"**

This indicates that:
1. The frontend is trying to call `/api/cart/add` endpoint
2. The backend is returning 404 (endpoint not found)
3. Either the endpoint is not registered or the backend is not running

## Root Cause Analysis

### Verified Working Components:
✅ Backend server.js imports cart routes: `const cartRoutes = require('./routes/cart');`
✅ Backend server.js registers cart routes: `app.use('/api/cart', cartRoutes);`
✅ Backend routes/cart.js has POST /add endpoint defined
✅ Frontend src/utils/api.js has cartAPI.addToCart function
✅ Frontend CartContext properly calls cartAPI.addToCart
✅ CORS is configured to allow requests from frontend

### Potential Issues:
1. **Backend not running** - Most likely cause
2. **Database not connected** - Cart operations require database
3. **Environment variables not set** - API_BASE_URL pointing to wrong backend
4. **Authentication token missing** - Cart endpoints require JWT token
5. **Port conflicts** - Backend trying to run on port already in use

## Solution Steps

### Step 1: Start Backend Server

```bash
# Terminal 1 - Start Backend
cd backend
npm install
npm run dev
```

Expected output:
```
🚀 iSafari Global API server running on port 5000
📊 Environment: development
🌐 Frontend URL: http://localhost:4028
💾 Database: PostgreSQL
```

### Step 2: Verify Backend is Running

```bash
# Terminal 2 - Test backend health
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "iSafari Global API is running",
  "timestamp": "2025-12-28T..."
}
```

### Step 3: Start Frontend Server

```bash
# Terminal 3 - Start Frontend
npm install
npm run dev
```

Expected output:
```
VITE v... ready in ... ms

➜  Local:   http://localhost:4028/
```

### Step 4: Verify Frontend Configuration

Check that `.env.local` has:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 5: Test "Book Now" Button

1. Open http://localhost:4028 in browser
2. Login with traveler account
3. Navigate to a service provider profile
4. Click "Book Now" button
5. Check browser console (F12) for errors
6. Verify item appears in cart

## Troubleshooting

### Issue: "Cannot connect to backend"

**Solution:**
```bash
# Check if backend is running
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Mac/Linux

# If port is in use, kill the process
taskkill /PID <PID> /F         # Windows
kill -9 <PID>                  # Mac/Linux

# Restart backend
cd backend && npm run dev
```

### Issue: "API endpoint not found" (404)

**Solution:**
1. Verify backend/server.js has: `app.use('/api/cart', cartRoutes);`
2. Verify backend/routes/cart.js exists and has POST /add endpoint
3. Restart backend server
4. Clear browser cache (Ctrl+Shift+Delete)

### Issue: "Authentication error" (401)

**Solution:**
1. Make sure you're logged in
2. Check localStorage has `isafari_user` with token
3. Verify token is valid (not expired)
4. Try logging out and logging back in

### Issue: "Database error"

**Solution:**
1. Verify PostgreSQL is running
2. Check DATABASE_URL in backend/.env
3. Verify database exists and is accessible
4. Check cart_items table exists:
   ```sql
   SELECT * FROM cart_items LIMIT 1;
   ```

## Verification Checklist

- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 4028
- [ ] .env.local has VITE_API_BASE_URL=http://localhost:5000/api
- [ ] PostgreSQL is running and connected
- [ ] User is logged in with valid token
- [ ] Browser console shows no errors
- [ ] "Book Now" button adds item to cart
- [ ] Cart persists after page refresh
- [ ] Cart persists after logout/login

## Quick Start Commands

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev

# Terminal 3 - Test (optional)
node fix-book-now-button.js
```

## Environment Configuration

### Development (.env.local)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:4028
VITE_NODE_ENV=development
```

### Production (.env)
```
VITE_API_BASE_URL=https://isafarinetworkglobal-2.onrender.com/api
VITE_NODE_ENV=production
```

## API Endpoints

### Cart Endpoints
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart` - Get user's cart
- `PUT /api/cart/:cartItemId` - Update quantity
- `DELETE /api/cart/:cartItemId` - Remove item
- `DELETE /api/cart` - Clear entire cart

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user
- `GET /api/auth/verify` - Verify token

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (provider only)

## Database Schema

### cart_items table
```sql
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  service_id INTEGER NOT NULL REFERENCES services(id),
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, service_id)
);
```

## Next Steps

1. ✅ Start backend and frontend servers
2. ✅ Test "Book Now" button
3. ✅ Verify cart functionality
4. ✅ Check for any remaining errors
5. ✅ Deploy to production when ready

## Support

If issues persist:
1. Check browser console (F12) for detailed error messages
2. Check backend logs for API errors
3. Run diagnostic script: `node fix-book-now-button.js`
4. Review this document for troubleshooting steps
