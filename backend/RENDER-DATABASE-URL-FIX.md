# 🔧 RENDER DATABASE_URL FIX - SOLVE BOOKING & CART ERRORS

## Problem
- Error: "Error adding to cart: API endpoint not found"
- Error: "Error creating booking: API endpoint not found"
- **Root Cause**: Backend is NOT running on Render because DATABASE_URL environment variable is NOT set

## Solution - 3 Steps

### Step 1: Get PostgreSQL Connection String from Render

1. Go to https://dashboard.render.com
2. Click on your PostgreSQL database (look for "dpg-" in the name)
3. Copy the **External Database URL** (looks like: `postgresql://user:password@host:port/database`)
4. Keep this URL safe - you'll need it in Step 2

### Step 2: Set DATABASE_URL on Render Backend Service

1. Go to https://dashboard.render.com
2. Click on **isafarinetworkglobal-2** service (the Node.js backend)
3. Go to **Settings** tab
4. Scroll to **Environment** section
5. Click **Add Environment Variable**
6. Set:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the PostgreSQL URL from Step 1
7. Click **Save**
8. Backend will automatically redeploy

### Step 3: Verify Backend is Running

1. Wait 2-3 minutes for backend to redeploy
2. Open browser and go to: https://isafarinetworkglobal-2.onrender.com/api/health
3. You should see:
   ```json
   {
     "status": "OK",
     "message": "iSafari Global API is running",
     "timestamp": "2025-01-01T12:00:00.000Z"
   }
   ```
4. If you see this, backend is working! ✅

### Step 4: Test Cart & Booking

1. Go to https://isafari-tz.netlify.app
2. Login as a traveler
3. Find a service and click "Add to Cart" - should work now ✅
4. Click "Book Now" - should work now ✅

## If Still Not Working

Check Render logs:
1. Go to https://dashboard.render.com
2. Click **isafarinetworkglobal-2** service
3. Click **Logs** tab
4. Look for errors like:
   - "DATABASE_URL not found" - means Step 2 didn't work
   - "Connection refused" - means DATABASE_URL is wrong
   - "ECONNREFUSED" - means PostgreSQL is down

## Quick Reference

**Current Backend URL**: https://isafarinetworkglobal-2.onrender.com/api

**API Endpoints**:
- Health: GET /api/health
- Cart: POST /api/cart/add
- Bookings: POST /api/bookings

**Environment Variables Needed on Render**:
- NODE_ENV = production
- PORT = 10000
- JWT_SECRET = isafari_global_super_secret_jwt_key_2024_production
- SESSION_SECRET = isafari_session_secret_key_2024
- FRONTEND_URL = https://isafari-tz.netlify.app
- **DATABASE_URL** = postgresql://... (THIS IS THE MISSING ONE!)
