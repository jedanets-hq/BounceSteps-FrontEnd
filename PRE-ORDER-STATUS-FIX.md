# 🔧 PRE-ORDER DRAFT STATUS FIX

## ❌ TATIZO LILIKUWA NINI?

Error: `new row for relation "bookings" violates check constraint "bookings_status_check"`

### Sababu:
Production database constraint `bookings_status_check` haikuwa na 'draft' status.

## ✅ SULUHISHO

Tumeongeza **automatic migration** ambayo inafanya kazi wakati server inaanza.

### Workflow Yako (Imehifadhiwa):

```
┌─────────────────────────────────────────────────────────────┐
│  CART PAGE                                                   │
│  ┌─────────────────┐                                        │
│  │ 🛒 Pre-Order    │  → Creates booking with status='draft' │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  TRAVELER DASHBOARD - My Pre-Orders                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📝 Draft - Not Submitted                             │   │
│  │                                                      │   │
│  │ ┌──────────────────────────────────────────────┐    │   │
│  │ │ 📤 Submit Pre-Order Request to Provider      │    │   │
│  │ └──────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  PROVIDER DASHBOARD                                          │
│  Provider sees booking with status='pending'                 │
│  Can: ✅ Confirm  or  ❌ Reject                              │
└─────────────────────────────────────────────────────────────┘
```

### Files Changed:

1. **backend/server.js**
   - Added startup migration import and call

2. **backend/migrations/run-on-startup.js** (NEW)
   - Automatically adds 'draft' to bookings_status_check constraint

3. **backend/routes/bookings.js**
   - Pre-orders start with `status: 'draft'`
   - Submit endpoint changes draft → pending

4. **src/pages/cart/index.jsx**
   - Message updated to tell user to submit from dashboard

## 🚀 DEPLOYMENT

Push to GitHub and Render will auto-deploy:

```bash
git add .
git commit -m "Fix: Add draft status to bookings constraint via startup migration"
git push origin main
```

Wakati server inaanza kwenye Render, migration itafanya kazi automatically!

## 📋 STATUS VALUES

| Status | Maana |
|--------|-------|
| `draft` | Pre-order imehifadhiwa, haijatumwa kwa provider |
| `pending` | Imetumwa kwa provider, inasubiri review |
| `confirmed` | Provider amekubali |
| `cancelled` | Provider amekataa au traveler amecancel |
| `completed` | Safari imekamilika |

---
**Date:** ${new Date().toISOString()}
**Status:** ✅ READY FOR DEPLOYMENT
