# 🔧 JINSI YA KUFIX CORS ERRORS - HATUA KWA HATUA

## 📋 HATUA 1: UPDATE VERCEL ENVIRONMENT VARIABLES

### A) Ingia Vercel Dashboard
1. Fungua browser yako
2. Enda https://vercel.com/dashboard
3. Login kwa account yako ya Vercel

### B) Chagua Project Yako
1. Utaona list ya projects zako
2. Chagua project ya **"bouncesteps"** au **"bounce-steps-front-end"**
3. Bonyeza juu yake

### C) Enda Settings
1. Baada ya kufungua project, utaona tabs juu
2. Bonyeza tab ya **"Settings"**

### D) Chagua Environment Variables
1. Kwenye sidebar ya kushoto, bonyeza **"Environment Variables"**
2. Utaona list ya variables zilizopo

### E) Update Variables (Moja kwa Moja)

#### Variable 1: VITE_API_URL
1. Tafuta variable inayoitwa **"VITE_API_URL"**
2. Bonyeza **"Edit"** button (penseli icon)
3. **KEY:** `VITE_API_URL` (hii haibadiliki)
4. **VALUE:** `https://bouncesteps-backend-392429231515.us-central1.run.app/api`
5. **Environment:** Chagua **"Production"**
6. Bonyeza **"Save"**

#### Variable 2: VITE_API_BASE_URL
1. Tafuta variable inayoitwa **"VITE_API_BASE_URL"**
2. Bonyeza **"Edit"** button
3. **KEY:** `VITE_API_BASE_URL` (hii haibadiliki)
4. **VALUE:** `https://bouncesteps-backend-392429231515.us-central1.run.app/api`
5. **Environment:** Chagua **"Production"**
6. Bonyeza **"Save"**

#### Kama Variables Hazipo, Ziongeze:
1. Bonyeza **"Add New"** button
2. **KEY:** `VITE_API_URL`
3. **VALUE:** `https://bouncesteps-backend-392429231515.us-central1.run.app/api`
4. **Environment:** Chagua **"Production"**
5. Bonyeza **"Save"**
6. Rudia kwa `VITE_API_BASE_URL`

---

## 📋 HATUA 2: REDEPLOY PROJECT

### A) Enda Deployments Tab
1. Bonyeza tab ya **"Deployments"** juu ya page
2. Utaona list ya deployments zako

### B) Redeploy Latest Deployment
1. Tafuta deployment ya kwanza (latest) - ina status "Ready"
2. Bonyeza **"..." (three dots)** upande wa kulia
3. Chagua **"Redeploy"**
4. Bonyeza **"Redeploy"** tena kuconfirm

### C) Ngoja Deployment Ikamilike
1. Utaona status inabadilika kuwa "Building..."
2. Ngoja 2-3 minutes
3. Status itabadilika kuwa "Ready" ✅

---

## 📋 HATUA 3: TEST KAMA IMEWORK

### A) Fungua Website Yako
1. Enda https://www.bouncesteps.com
2. Fungua **Developer Tools** (F12 au Right-click > Inspect)
3. Bonyeza tab ya **"Console"**

### B) Check API URL
1. Refresh page (F5)
2. Tafuta message inayosema:
   ```
   🚨 API URL IN USE: https://bouncesteps-backend-392429231515.us-central1.run.app/api
   ```
3. Kama unaona hii, ni vizuri! ✅

### C) Test Login
1. Jaribu ku-login kwenye website
2. Kama hakuna CORS errors kwenye console, umefanikiwa! 🎉
3. Kama bado kuna errors, rudia hatua za juu

---

## 🎯 EXPECTED RESULTS

### ✅ Kabla ya Fix:
```
❌ Access to fetch at 'https://bouncesteps-backend-gvnqzuauoa-ew.a.run.app/api/...' 
   has been blocked by CORS policy
```

### ✅ Baada ya Fix:
```
✅ API URL IN USE: https://bouncesteps-backend-392429231515.us-central1.run.app/api
✅ No CORS errors
✅ Login inafanya kazi
✅ All API calls zinafanya kazi
```

---

## 🆘 KAMA BADO HAIFANYI KAZI

1. **Check Environment Variables Tena:**
   - Hakikisha VALUE ni correct: `https://bouncesteps-backend-392429231515.us-central1.run.app/api`
   - Hakikisha Environment ni "Production"

2. **Force Redeploy:**
   - Delete latest deployment
   - Push code change kidogo (ongeza space kwenye file)
   - Auto-deploy itafanya kazi

3. **Clear Browser Cache:**
   - Ctrl+Shift+R (hard refresh)
   - Au fungua incognito window

---

## 📞 CONTACT

Kama bado una shida, niambie:
1. Screenshot ya environment variables zako
2. Screenshot ya console errors
3. Nitakusaidia zaidi!