# 🔧 JINSI YA KUTATUA TATIZO LA GOOGLE OAUTH

## ❌ TATIZO
Google Authentication (Continue with Google / Sign up with Google) **HAIFANYI KAZI** kwa sababu Google OAuth credentials **HAZIJAWEKWA**.

## ✅ SULUHISHO

### HATUA 1: Nenda Google Cloud Console
1. Fungua browser yako
2. Nenda: https://console.cloud.google.com/apis/credentials
3. Login kwa Google account yako

### HATUA 2: Tengeneza OAuth 2.0 Client ID
1. Bofya button ya **"CREATE CREDENTIALS"** juu ya ukurasa
2. Chagua **"OAuth client ID"**
3. Kama hujatengeneza OAuth consent screen:
   - Bofya "CONFIGURE CONSENT SCREEN"
   - Chagua "External"
   - Jaza App name: **iSafari Global**
   - Jaza User support email
   - Jaza Developer contact email
   - Bofya "SAVE AND CONTINUE"
   - Skip scopes (bofya "SAVE AND CONTINUE")
   - Skip test users (bofya "SAVE AND CONTINUE")
4. Rudi kwenye "CREATE CREDENTIALS" > "OAuth client ID"
5. Application type: Chagua **"Web application"**
6. Name: **iSafari Global - Localhost**

### HATUA 3: Ongeza Authorized redirect URIs
Kwenye sehemu ya "Authorized redirect URIs", bofya **"ADD URI"** na ongeza:
```
http://localhost:5000/api/auth/google/callback
```

### HATUA 4: Ongeza Authorized JavaScript origins
Kwenye sehemu ya "Authorized JavaScript origins", bofya **"ADD URI"** na ongeza:
```
http://localhost:5173
```

### HATUA 5: Tengeneza Credentials
1. Bofya **"CREATE"**
2. Popup itaonyesha **Client ID** na **Client Secret**
3. **NAKILI** zote mbili (utazihitaji)

### HATUA 6: Weka Credentials kwenye .env File
1. Fungua file: `backend/.env`
2. Tafuta mistari hii:
   ```
   GOOGLE_CLIENT_ID=your-google-client-id-from-console-cloud-google
   GOOGLE_CLIENT_SECRET=your-google-client-secret-from-console-cloud-google
   ```
3. Badilisha na credentials zako:
   ```
   GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
   ```
   *(Tumia credentials zako halisi, si hizi za mfano)*

### HATUA 7: Restart Backend Server
1. Zima backend server (Ctrl+C kwenye terminal)
2. Anza tena:
   ```bash
   cd backend
   npm start
   ```

### HATUA 8: Test Google OAuth
1. Fungua browser: http://localhost:5173/login
2. Bofya **"Continue with Google"**
3. Inafaa kufanya kazi sasa! 🎉

## 🧪 JINSI YA KUTEST KAMA IMEFANYA KAZI

Run script hii kuangalia configuration:
```bash
node test-google-oauth-config.cjs
```

Kama imewekwa vizuri, utaona:
```
✅ ✅ ✅ GOOGLE OAUTH IMEWEKWA VIZURI! ✅ ✅ ✅
```

## 📝 MUHIMU KUJUA

1. **Credentials ni siri** - Usizishare na mtu yeyote
2. **Restart server** - Lazima restart backend baada ya kubadilisha .env
3. **Localhost tu** - Configuration hii ni kwa development (localhost) tu
4. **Production** - Kwa production, utahitaji kutengeneza OAuth client tofauti

## ❓ KAMA BADO HAIFANYI KAZI

1. Angalia backend logs kwa errors:
   ```bash
   cd backend
   npm start
   ```
   Tafuta message: `⚠️ Google OAuth not configured`

2. Hakikisha credentials zimewekwa vizuri:
   - Hakuna spaces za ziada
   - Hakuna quote marks (" au ')
   - Client ID inaishia na `.apps.googleusercontent.com`
   - Client Secret inaanza na `GOCSPX-`

3. Hakikisha URLs kwenye Google Console ni sahihi:
   - Redirect URI: `http://localhost:5000/api/auth/google/callback`
   - JavaScript origin: `http://localhost:5173`

4. Clear browser cache na cookies

## 🎯 MATOKEO YANAYOTARAJIWA

Baada ya kufuata hatua hizi:
- ✅ "Continue with Google" kwenye login page itafanya kazi
- ✅ "Sign up with Google" kwenye registration page itafanya kazi
- ✅ Users wataweza login/register kwa Google account zao
- ✅ Hakuna password required kwa Google users

---

**Imeandikwa na:** Kiro AI Assistant  
**Tarehe:** 2026-02-13
