# Google OAuth Fix Guide

## Problem
When clicking "Continue with Google" on the login page with an unregistered email, the system shows an old version of the page instead of redirecting to the login page with an error message.

## Root Cause
The issue is likely one of the following:
1. **Google Console Redirect URI** - The authorized redirect URI in Google Console might be pointing to an old URL
2. **FRONTEND_URL not set** - The FRONTEND_URL environment variable might not be set in Render Dashboard
3. **Browser Cache** - Old cached version of the application

## Solution Steps

### Step 1: Check Google Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Check **Authorized redirect URIs** - it should include:
   ```
   https://isafarinetworkglobal-2.onrender.com/api/auth/google/callback
   ```
6. Remove any old/localhost URIs if present

### Step 2: Check Render Environment Variables
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service (isafarinetworkglobal-2)
3. Go to **Environment** tab
4. Ensure these variables are set:
   ```
   FRONTEND_URL=https://isafari-tz.netlify.app
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://isafarinetworkglobal-2.onrender.com/api/auth/google/callback
   ```

### Step 3: Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Incognito/Private mode to test

### Step 4: Redeploy Backend
After making changes to environment variables:
1. Go to Render Dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete

## Expected Workflow

### Login Flow (Continue with Google)
1. User clicks "Continue with Google" on login page
2. User selects Google account
3. **If email is NOT registered:**
   - Redirect to `/login?error=not_registered&email=xxx@gmail.com`
   - Show error message: "This email is not registered. Please sign up first."
4. **If email IS registered:**
   - Generate JWT token
   - Redirect to appropriate dashboard

### Registration Flow (Register with Google)
1. User clicks "Sign up with Google" on register page
2. User is redirected to role selection page
3. User selects role (Traveler or Service Provider)
4. User clicks "Continue with Google"
5. User selects Google account
6. User fills in additional details (phone, company name if provider)
7. Account is created and user is redirected to dashboard

## Files Modified
- `backend/.env` - Added FRONTEND_URL
- `backend/routes/auth.js` - Added logging for debugging
- `src/pages/auth/login.jsx` - Changed error message to English

## Testing
After deployment, test by:
1. Go to https://isafari-tz.netlify.app/login
2. Click "Continue with Google"
3. Select an email that is NOT registered
4. You should see the error message on the login page
