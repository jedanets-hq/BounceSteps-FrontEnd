# 🚀 QUICK START GUIDE - iSafari Admin Portal & Journey Planner

## ✅ KILA KITU KIMEKWISHA CONFIGURED!

### 1. BACKEND (Already Running)
```bash
cd backend
npm start
```
**Status**: ✅ Running on http://localhost:5000
**MongoDB**: ✅ Connected to Atlas
**Database**: isafari_global

---

### 2. ADMIN PORTAL

#### Option A: Development Server (Recommended for Testing)
```bash
cd admin-portal
npm run dev
```
**Access**: http://localhost:8080

#### Option B: Production Build (For Deployment)
```bash
cd admin-portal
npm run build
# Deploy dist/ folder to Netlify, Vercel, etc.
```

**Features**:
- ✅ Connected to production backend: https://backend-bncb.onrender.com
- ✅ No login required (direct access)
- ✅ Real-time data from MongoDB
- ✅ Dashboard, Users, Services, Bookings, Payments, Analytics

---

### 3. TRAVELER APP (Journey Planner)

```bash
# From root directory
npm run dev
```
**Access**: http://localhost:4028

**Journey Planner Features**:
- ✅ Real service categories from database
- ✅ Location-based provider search
- ✅ Multi-step journey planning
- ✅ Real providers and services display

---

## 📋 TESTING CHECKLIST

### Test Admin Portal:
1. ✅ Open http://localhost:8080
2. ✅ Check Dashboard - should show real stats
3. ✅ Navigate to Users - should show travelers & providers
4. ✅ Navigate to Services - should show all services
5. ✅ Check Analytics - should show charts with real data

### Test Journey Planner:
1. ✅ Login as traveler
2. ✅ Click "Plan Your Journey"
3. ✅ Select Location:
   - Region: Arusha
   - District: Arusha Urban
4. ✅ Select Dates
5. ✅ Select Service Categories (e.g., Accommodation, Tours)
6. ✅ View Providers - should show real providers from database
7. ✅ Select services from providers
8. ✅ View Summary

---

## 🔧 CONFIGURATION

### Backend (.env):
```
MONGODB_URI=mongodb+srv://d34911651_db_user:jeda%40123@cluster0.c8dw3ca.mongodb.net/isafari_global?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB_NAME=isafari_global
PORT=5000
```

### Admin Portal (config.js):
```javascript
API_BASE_URL: 'https://backend-bncb.onrender.com/api'
```

---

## 🎯 SERVICE CATEGORIES (All Available)

1. **Accommodation** - Hotels, Lodges, Guesthouses
2. **Transportation** - Car Rental, Drivers, Buses
3. **Tours & Activities** - Safari, City Tours, Adventures
4. **Food & Dining** - Restaurants, Cafes, Local Cuisine
5. **Shopping** - Markets, Malls, Souvenirs
6. **Health & Wellness** - Hospitals, Spas, Fitness
7. **Entertainment** - Nightlife, Museums, Events
8. **Services** - Banks, Travel Agencies, Laundry

---

## 🌐 DEPLOYMENT

### Admin Portal:
```bash
cd admin-portal
npm run build
# Upload dist/ folder to hosting
```

**Recommended Hosts**:
- Netlify (Free)
- Vercel (Free)
- GitHub Pages

### Backend:
Already deployed on Render: https://backend-bncb.onrender.com

---

## 📞 SUPPORT

### Common Issues:

**Admin Portal shows no data**:
- Check browser console for errors
- Verify backend is running
- Check CORS settings

**Journey Planner shows no providers**:
- Ensure location is selected
- Check if providers exist in database for that location
- Verify backend `/api/providers/search` endpoint

**Build errors**:
- Run `npm install` in admin-portal directory
- Clear node_modules and reinstall

---

## 🎉 EVERYTHING IS READY!

- ✅ Admin Portal connected to production backend
- ✅ Journey Planner shows real services
- ✅ All service categories available
- ✅ Location-based provider search working
- ✅ Production builds ready for deployment

**Karibu kutumia iSafari Admin Portal na Journey Planner!** 🚀
