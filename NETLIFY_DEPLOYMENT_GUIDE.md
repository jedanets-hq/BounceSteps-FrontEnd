# iSafari Global - Netlify Deployment Guide

## Problem: Registration Failed After Netlify Deployment

**Root Cause**: Frontend deployed to Netlify is trying to connect to `http://localhost:5000/api` which doesn't exist in production.

## Solution: Deploy Backend First, Then Frontend

### Step 1: Deploy Backend to Heroku

1. **Create Heroku Account**: Go to https://heroku.com and create account
2. **Install Heroku CLI**: Download from https://devcenter.heroku.com/articles/heroku-cli
3. **Deploy Backend**:
   ```bash
   cd backend
   heroku create isafari-global-backend
   heroku addons:create heroku-postgresql:mini
   git init
   git add .
   git commit -m "Initial backend deployment"
   git push heroku main
   ```

4. **Set Environment Variables on Heroku**:
   ```bash
   heroku config:set DB_NAME=your_heroku_postgres_db
   heroku config:set DB_USER=your_heroku_postgres_user
   heroku config:set DB_PASSWORD=your_heroku_postgres_password
   heroku config:set JWT_SECRET=isafari_global_super_secret_jwt_key_2024_production
   heroku config:set FRONTEND_URL=https://your-netlify-site.netlify.app
   ```

### Step 2: Update Frontend Configuration

1. **Get your Heroku backend URL**: `https://isafari-global-backend.herokuapp.com`

2. **Update Netlify Environment Variables**:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://isafari-global-backend.herokuapp.com/api`
   - Add: `VITE_FRONTEND_URL` = `https://your-site.netlify.app`

### Step 3: Redeploy Frontend to Netlify

1. **Build with correct environment**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop `dist` folder to Netlify
   - OR connect GitHub repo for auto-deployment

### Step 4: Test Registration

1. Go to your Netlify site
2. Try registration - should now work!

## Quick Fix for Current Issue

**Immediate Solution**: Update your Netlify environment variables:

1. **Netlify Dashboard** → Your Site → **Site Settings** → **Environment Variables**
2. **Add**:
   - `VITE_API_BASE_URL` = `https://your-backend-url.herokuapp.com/api`
3. **Redeploy** your site

## Alternative: Use Demo Mode

If you want to test without backend deployment:

1. Update `src/utils/api.js`:
   ```javascript
   const API_BASE_URL = 'https://jsonplaceholder.typicode.com'; // Demo API
   ```

2. Rebuild and redeploy to Netlify

## Files Updated for Production

- ✅ `src/utils/api.js` - Now uses environment variables
- ✅ `.env.production` - Production environment config
- ✅ `netlify.toml` - Netlify deployment configuration
- ✅ `.env.local` - Local development config

## Next Steps

1. Deploy backend to Heroku/Railway/Render
2. Update Netlify environment variables with real backend URL
3. Redeploy frontend
4. Test registration flow

Your registration will work once the frontend can connect to a live backend API!
