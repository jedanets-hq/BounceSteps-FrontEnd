# 🚀 Quick Start Guide - PostgreSQL Only

## ⚡ Hatua za Haraka (5 Minutes)

### 1️⃣ Futa Cache ya Browser (30 seconds)

```bash
# Fungua file hii kwenye browser
clear-all-cache.html
```

Bonyeza: **"Clear All Cache & Data"** → **"Reload Application"**

### 2️⃣ Futa Data za PostgreSQL (30 seconds)

```bash
cd backend
node clear-postgresql-data.js
```

### 3️⃣ Test PostgreSQL Setup (1 minute)

```bash
cd backend
node test-postgresql-complete.js
```

Unapaswa kuona: **"🎉 ALL TESTS PASSED!"**

### 4️⃣ Anzisha Backend (1 minute)

```bash
cd backend
npm run dev
```

Unapaswa kuona:
```
✅ Connected to PostgreSQL database
✅ PostgreSQL database initialized successfully
🚀 iSafari Global API server running on port 5000
💾 Database: PostgreSQL
```

### 5️⃣ Anzisha Frontend (1 minute)

```bash
# Kwenye terminal nyingine
npm run dev
```

Fungua: **http://localhost:4028**

### 6️⃣ Verify (1 minute)

```bash
# Kwenye terminal nyingine
cd backend
node check-postgresql-data.js
```

## ✅ Kama Kila Kitu Kinafanya Kazi

Unapaswa kuona:
- ✅ Backend inaanza bila errors
- ✅ Frontend inafunguka
- ✅ Database iko empty (0 records)
- ✅ Unaweza ku-register user mpya
- ✅ Data inasave kwenye PostgreSQL

## 🎯 Test Registration

```bash
# Test API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "user_type": "traveler"
  }'
```

Kisha angalia database:
```bash
cd backend
node check-postgresql-data.js
```

Unapaswa kuona: **users : 1 record**

## 🔧 Kama Kuna Tatizo

### Backend Haianzishi

```bash
# Check PostgreSQL status
pg_ctl status

# Start PostgreSQL
pg_ctl start
```

### "Connection refused"

Hakikisha password ni sahihi kwenye `backend/.env`:
```env
DB_PASSWORD=@Jctnftr01
```

### Bado Ninaona Data za MongoDB

1. Futa browser cache tena
2. Hard refresh (Ctrl + Shift + R)
3. Futa cookies za localhost
4. Restart browser

## 📞 Kama Bado Kuna Tatizo

Angalia file kamili: **POSTGRESQL-MIGRATION-COMPLETE.md**

---

**Muda wa Jumla: ~5 minutes** ⏱️
