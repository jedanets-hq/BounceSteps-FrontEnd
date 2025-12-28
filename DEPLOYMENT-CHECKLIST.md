# Deployment Checklist - Data Persistence Fix

## Pre-Deployment Verification

### Backend Files
- [x] `backend/routes/cart.js` - Created ✅
- [x] `backend/routes/plans.js` - Created ✅
- [x] `backend/routes/favorites.js` - Created ✅
- [x] `backend/config/postgresql.js` - Updated with tables ✅
- [x] `backend/server.js` - Routes registered ✅
- [x] `backend/migrations/migrate_localStorage_to_db.js` - Created ✅

### Frontend Files
- [x] `src/contexts/CartContext.jsx` - Updated ✅
- [x] `src/contexts/PlansContext.jsx` - Created ✅
- [x] `src/contexts/FavoritesContext.jsx` - Created ✅
- [x] `src/utils/api.js` - Updated with API functions ✅
- [x] `src/utils/migrateLocalStorage.js` - Created ✅
- [x] `src/contexts/AuthContext.jsx` - Updated with migration ✅
- [x] `src/App.jsx` - Updated with providers ✅

### Documentation
- [x] `DATA-PERSISTENCE-FIX-COMPLETE.md` - Created ✅
- [x] `QUICK-START-DATA-PERSISTENCE.md` - Created ✅
- [x] `test-data-persistence.js` - Created ✅
- [x] `IMPLEMENTATION-SUMMARY.md` - Created ✅

## Deployment Steps

### Step 1: Backend Deployment

```bash
# Navigate to backend directory
cd backend

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add data persistence for cart, plans, and favorites

- Create cart_items, trip_plans, and favorites tables
- Add cart, plans, and favorites API routes
- Implement CRUD operations for all features
- Add database indexes and triggers
- Register new routes in server.js"

# Push to main branch
git push origin main

# Wait for Render to auto-deploy (check Render dashboard)
```

**Expected Result:**
- Backend deploys successfully
- New tables created in PostgreSQL
- New API routes available
- No errors in logs

### Step 2: Frontend Deployment

```bash
# Navigate to frontend directory
cd frontend

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add data persistence contexts and API integration

- Create CartContext, PlansContext, FavoritesContext
- Add cartAPI, plansAPI, favoritesAPI functions
- Implement automatic data migration on login
- Update App.jsx with new providers
- Add localStorage to database migration utility"

# Push to main branch
git push origin main

# Wait for Netlify to auto-deploy (check Netlify dashboard)
```

**Expected Result:**
- Frontend builds successfully
- New contexts available
- API integration working
- No console errors

## Post-Deployment Verification

### 1. Backend Health Check
```bash
# Check if backend is running
curl https://isafarinetworkglobal-2.onrender.com/api/health

# Expected response:
# {"status":"OK","message":"iSafari Global API is running",...}
```

### 2. Database Tables Check
```bash
# Connect to PostgreSQL and verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cart_items', 'trip_plans', 'favorites');

# Expected: 3 rows returned
```

### 3. API Endpoints Check
```bash
# Test cart endpoint (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://isafarinetworkglobal-2.onrender.com/api/cart

# Expected: {"success":true,"cartItems":[],"total":0}
```

### 4. Frontend Functionality Check
1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for any errors
4. Go to Network tab
5. Perform test actions (add to cart, etc.)
6. Verify API calls are successful

## Manual Testing

### Test 1: Add to Cart
1. Navigate to any service page
2. Click "Add to Cart"
3. Verify item appears in cart
4. Refresh page (F5)
5. ✅ Item should still be in cart

### Test 2: Add to Plan
1. Navigate to Journey Planner
2. Click "Add to Plan"
3. Verify item appears in plan
4. Refresh page (F5)
5. ✅ Item should still be in plan

### Test 3: Add to Favorites
1. Navigate to provider profile
2. Click "Follow" (add to favorites)
3. Verify provider is favorited
4. Refresh page (F5)
5. ✅ Provider should still be favorited

### Test 4: Cross-Device Sync
1. Add item to cart on Device A
2. Log in on Device B
3. Navigate to cart
4. ✅ Item should appear in cart on Device B

### Test 5: Data Migration
1. Clear browser cache
2. Add items to cart (localStorage)
3. Log out
4. Log in
5. ✅ Old items should appear in cart (migrated)

### Test 6: Non-Logged-In Users
1. Open incognito/private window
2. Add items to cart
3. Refresh page
4. ✅ Items should still be in cart (localStorage)

## Rollback Plan

If issues occur, rollback is simple:

### Backend Rollback
```bash
cd backend
git revert HEAD
git push origin main
# Render will auto-deploy previous version
```

### Frontend Rollback
```bash
cd frontend
git revert HEAD
git push origin main
# Netlify will auto-deploy previous version
```

## Monitoring

### What to Monitor
- [ ] Backend error logs
- [ ] Database connection status
- [ ] API response times
- [ ] Frontend console errors
- [ ] User reports of issues

### Key Metrics
- API response time: Should be < 200ms
- Database query time: Should be < 100ms
- Error rate: Should be 0%
- User migration success: Should be 100%

## Troubleshooting Guide

### Issue: "Cannot POST /api/cart"
**Cause:** Routes not registered
**Solution:** Verify server.js has route registration

### Issue: "Table does not exist"
**Cause:** Database tables not created
**Solution:** Check postgresql.js initialization

### Issue: "Unauthorized" on API calls
**Cause:** Missing or invalid token
**Solution:** Verify user is logged in

### Issue: "Data not syncing"
**Cause:** API not responding
**Solution:** Check backend logs and network

### Issue: "Migration not working"
**Cause:** Migration utility not running
**Solution:** Check browser console for errors

## Success Indicators

✅ All API endpoints responding
✅ Database tables created
✅ Cart items persist after refresh
✅ Plans persist after refresh
✅ Favorites persist after refresh
✅ Data syncs across devices
✅ Old data migrates on login
✅ No console errors
✅ No backend errors
✅ Users can use all features

## Communication

### Notify Users
After successful deployment, consider notifying users:
- "Your cart, plans, and favorites now sync across all devices!"
- "Your data is now permanently saved"
- "No more losing your cart on refresh!"

## Final Checklist

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] All tests passing
- [ ] No console errors
- [ ] No backend errors
- [ ] Database tables verified
- [ ] API endpoints working
- [ ] Manual testing completed
- [ ] Cross-device sync verified
- [ ] Migration working
- [ ] Documentation updated
- [ ] Team notified
- [ ] Users notified

## Sign-Off

**Deployment Date:** _______________
**Deployed By:** _______________
**Verified By:** _______________
**Status:** ✅ COMPLETE

---

## Additional Resources

- Detailed Documentation: `DATA-PERSISTENCE-FIX-COMPLETE.md`
- Quick Start Guide: `QUICK-START-DATA-PERSISTENCE.md`
- Test Script: `test-data-persistence.js`
- Implementation Summary: `IMPLEMENTATION-SUMMARY.md`

## Support Contact

For deployment issues:
1. Check the troubleshooting guide
2. Review backend logs
3. Check frontend console
4. Verify database connection
5. Contact development team

---

**Status: Ready for Deployment ✅**
