# 🚀 DEPLOY BACKEND MANUALLY - HATUA KWA HATUA

## Tatizo Lililopo
Admin portal haifanyi kazi kwa sababu **backend iliyodeploy kwenye Cloud Run haijabuild latest code yenye admin routes**.

## ⚠️ MUHIMU: Service Gani Unatumia?

Kuna services mbili:
1. **bouncesteps-backend** → URL: `https://bouncesteps-backend-gvnqzuauoa-ew.a.run.app`
2. **bouncesteps-backend-git** → URL: `https://bouncesteps-backend-git-392429231515.europe-west1.run.app`

**Admin portal yako inatumia: `bouncesteps-backend` (service ya kwanza)**

## Suluhisho: Deploy Backend Manually

### HATUA 1: Nenda Google Cloud Console
1. Fungua: https://console.cloud.google.com/run
2. Chagua project: **project-df58b635-5420-42bc-809** (BOUNCE STEPS project)
3. Utaona services mbili - **CHAGUA: bouncesteps-backend** (sio bouncesteps-backend-git)

### HATUA 2: Deploy New Revision
1. Bonyeza service **bouncesteps-backend**
2. Bonyeza button **"EDIT & DEPLOY NEW REVISION"** juu ya page
3. Scroll chini mpaka **"BUILD CONFIGURATION"** section

### HATUA 3: Configure Build Source
Kwenye **"BUILD CONFIGURATION"** section:

1. **Source**: Chagua **"GitHub"**
2. **Repository**: Chagua repository yako ya **bouncesteps-backend**
3. **Branch**: Chagua **"main"** (au branch yenye latest code)
4. **Build Type**: Chagua **"Dockerfile"** (kama ipo) au **"Buildpacks"**

### HATUA 4: Set Environment Variables
Scroll chini mpaka **"VARIABLES & SECRETS"** tab:

Ongeza environment variables hizi:

```
NODE_ENV=production
DB_HOST=34.42.58.123
DB_PORT=5432
DB_NAME=bouncesteps-db
DB_USER=postgres
DB_PASSWORD=@JedaNets01
JWT_SECRET=isafari-jwt-secret-key-2024-production
SESSION_SECRET=isafari-oauth-session-secret
```

**Jinsi ya kuongeza:**
1. Bonyeza **"+ ADD VARIABLE"**
2. Weka **Name** (e.g., `NODE_ENV`)
3. Weka **Value** (e.g., `production`)
4. Rudia kwa kila variable hapo juu

### HATUA 5: Configure Container Settings
Kwenye **"CONTAINER"** tab:

1. **Container port**: `5000`
2. **Memory**: `1 GiB`
3. **CPU**: `1`
4. **Request timeout**: `300` seconds
5. **Maximum requests per container**: `80`

### HATUA 6: Configure Autoscaling
Kwenye **"AUTOSCALING"** section:

1. **Minimum number of instances**: `0`
2. **Maximum number of instances**: `10`

### HATUA 7: Deploy!
1. Scroll juu kabisa
2. Bonyeza button **"DEPLOY"** (blue button)
3. Subiri dakika 2-3 deployment ikamilike

### HATUA 8: Test Admin Endpoints
Baada ya deployment kukamilika:

1. Bonyeza tab **"LOGS"** ili kuona kama kuna errors
2. Test admin endpoints:
   - https://bouncesteps-backend-gvnqzuauoa-ew.a.run.app/api/admin/test
   - https://bouncesteps-backend-gvnqzuauoa-ew.a.run.app/api/admin/dashboard/stats
   - https://bouncesteps-backend-gvnqzuauoa-ew.a.run.app/api/admin/users

## ✅ Baada ya Deployment

Admin portal itaanza kufanya kazi na data kutoka database!

### Endpoints Zitakazopatikana:
- `/api/admin/dashboard/stats` - Dashboard statistics
- `/api/admin/dashboard/activity` - Recent activity
- `/api/admin/users` - User management
- `/api/admin/providers` - Provider management
- `/api/admin/services` - Service management
- `/api/admin/payments` - Payment management

## 🔧 Kama Bado Haifanyi Kazi

1. **Check Logs**: Nenda Cloud Run → bouncesteps-backend → LOGS tab
2. **Check Database Connection**: Angalia kama environment variables ziko set vizuri
3. **Check Admin Routes**: Angalia kama admin.js file iko kwenye repository

## 📞 Kama Unahitaji Msaada

Niambie kama:
- Deployment imefanikiwa lakini bado kuna errors
- Unahitaji msaada wa kuongeza environment variables
- Admin portal bado haifanyi kazi baada ya deployment
