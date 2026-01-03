# iSafari Global Backend - Render Deployment Guide

## Quick Deployment Steps for mfungojoctan01@gmail.com

### Step 1: Create Render Account & Connect GitHub

1. **Go to Render.com**: https://render.com
2. **Sign up** with email: `mfungojoctan01@gmail.com`
3. **Connect GitHub account** to Render
4. **Create new GitHub repository** for backend:
   - Repository name: `isafari-global-backend`
   - Make it public or private

### Step 2: Push Backend Code to GitHub

```bash
cd backend
git init
git add .
git commit -m "Initial backend deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/isafari-global-backend.git
git push -u origin main
```

### Step 3: Create PostgreSQL Database on Render

1. **Render Dashboard** → **New** → **PostgreSQL**
2. **Name**: `isafari-postgres`
3. **Plan**: Free
4. **Region**: Oregon (US West)
5. **Click Create Database**
6. **Copy connection details** (will be provided after creation)

### Step 4: Deploy Web Service on Render

1. **Render Dashboard** → **New** → **Web Service**
2. **Connect Repository**: Select `isafari-global-backend`
3. **Configuration**:
   - **Name**: `isafari-global-backend`
   - **Environment**: Node
   - **Region**: Oregon (US West)
   - **Branch**: main
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 5: Set Environment Variables

In Render Web Service → Environment:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=isafari_global_super_secret_jwt_key_2024_production
SESSION_SECRET=isafari_session_secret_key_2024
FRONTEND_URL=https://isafari-global.netlify.app

# Database (from PostgreSQL service)
DB_HOST=your-postgres-host.render.com
DB_PORT=5432
DB_NAME=isafari_postgres_xxxx
DB_USER=isafari_postgres_xxxx_user
DB_PASSWORD=your-generated-password
```

### Step 6: Deploy & Test

1. **Click Deploy** - Render will build and deploy automatically
2. **Your backend URL**: `https://isafari-global-backend.onrender.com`
3. **Test endpoints**:
   - Health: `https://isafari-global-backend.onrender.com/health`
   - Database: `https://isafari-global-backend.onrender.com/api/database/check`

### Step 7: Update Frontend Configuration

Update your Netlify environment variables:
- `VITE_API_BASE_URL` = `https://isafari-global-backend.onrender.com/api`

## Files Ready for Deployment

✅ `package.json` - Updated with correct start script
✅ `render.yaml` - Render deployment configuration  
✅ `full-server.js` - Production-ready server
✅ `.env` - Environment template

## Expected Backend URL

After deployment: `https://isafari-global-backend.onrender.com`

## Next Steps After Deployment

1. Test all API endpoints
2. Set up database tables: `POST /api/database/setup`
3. Update Netlify frontend configuration
4. Test full registration flow

Your backend will be live and ready for production use!
