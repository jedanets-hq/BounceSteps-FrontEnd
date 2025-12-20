# 🧪 TEST DELETE FUNCTIONALITY - Quick Guide

## 🎯 How to Test Pre-Order Deletion

---

### Step 1: Create Test Pre-Orders

**As Traveler:**
```
1. Login as traveler
2. Go to: Journey Planner
3. Browse and add services to cart
4. Go to: Cart & Payment
5. Click: "Submit Pre-Order Request"
6. Confirm submission
✅ Pre-order created (pending status)
```

---

### Step 2: Complete the Pre-Orders

**As Provider (Mr. Joctan):**
```
1. Login as service provider
2. Go to: Bookings tab
3. See: "Pending Pre-Orders" tab
4. Click: "Accept Pre-Order" button
5. Order moves to "Confirmed" tab
6. Click: "Mark as Completed" button
7. Order moves to "Completed" tab
✅ Order now ready for deletion
```

---

### Step 3: Delete Completed Orders

**Still as Provider:**
```
1. Stay in: Bookings tab
2. Click: "Completed" tab
3. Should see completed orders with details:
   
   ┌─────────────────────────────────────┐
   │ Service: machapati                  │
   │ Traveler: John Doe                  │
   │ Status: ✅ Service Completed        │
   │ Amount: TZS 200                     │
   │ Date: Oct 16, 2025                  │
   │                                     │
   │ ✅ Service Completed                │
   │ [🗑️ Delete] ← RED BUTTON           │
   └─────────────────────────────────────┘

4. Click: "Delete" button (red with trash icon)
5. See confirmation dialog:
   "Are you sure you want to delete this pre-order? 
    This action cannot be undone."
6. Click: "OK"
7. ✅ Order deleted successfully!
8. Order disappears from list
```

---

### Step 4: Delete Rejected Orders

**For Cancelled/Rejected Orders:**
```
1. Go to: "Rejected" tab
2. See rejected orders with details
3. Click: "Delete" button
4. Confirm deletion
5. ✅ Order deleted!
```

---

## ⚠️ What You CANNOT Delete

### Protected Orders:

**Pending Orders:**
```
Status: ⏳ Awaiting Provider Response
Action: [Accept] or [Reject]
Delete: ❌ NOT AVAILABLE
Reason: Traveler waiting for response
```

**Confirmed Orders:**
```
Status: ✅ Confirmed
Action: [Cancel] or [Mark as Completed]
Delete: ❌ NOT AVAILABLE
Reason: Active booking in progress
```

---

## ✅ What You CAN Delete

**Completed Orders:**
```
Status: ✅ Service Completed
Action: [Delete]
Delete: ✅ AVAILABLE
Reason: Service already finished
```

**Rejected Orders:**
```
Status: ❌ Pre-Order Rejected
Action: [Delete]
Delete: ✅ AVAILABLE
Reason: Order was rejected, no longer active
```

---

## 🔍 Verify Deletion

### Method 1: Check UI
```
After deleting:
- Order disappears from tab
- Count decreases (e.g., "Completed (2)" → "Completed (1)")
- Success message appears
```

---

### Method 2: Check Database
```bash
cd backend && node -e "
const db = require('./config/database');
db.query('SELECT id, status FROM bookings WHERE provider_id = 5')
  .then(r => {
    console.log('Remaining bookings:', r.rows.length);
    r.rows.forEach(b => console.log(\`  ID:\${b.id} Status:\${b.status}\`));
  });
"
```

---

### Method 3: Check Backend Logs
```bash
tail -f backend.log | grep DELETE
```

**Expected Output:**
```
🗑️  [DELETE BOOKING] Request: { bookingId: 7, userId: XX, userType: 'service_provider' }
✅ [DELETE BOOKING] Booking deleted successfully: 7
```

---

## 🎯 Complete Test Scenario

### Full Workflow Test:

```
1. CREATE (as Traveler)
   - Add service to cart
   - Submit pre-order
   - Status: Pending

2. CONFIRM (as Provider)
   - Accept pre-order
   - Status: Confirmed

3. COMPLETE (as Provider)
   - Mark as completed
   - Status: Completed

4. DELETE (as Provider)
   - Click delete button
   - Confirm deletion
   - ✅ Order removed

5. VERIFY
   - Check completed tab → order gone
   - Check database → record deleted
   - Check logs → deletion successful
```

---

## 📊 Expected Behavior

### Before Delete:
```
Completed Tab:
┌──────────────────────────────┐
│ Completed (2)                │
├──────────────────────────────┤
│ Order 1 - machapati [Delete] │
│ Order 2 - safari [Delete]    │
└──────────────────────────────┘
```

### After Deleting Order 1:
```
Completed Tab:
┌──────────────────────────────┐
│ Completed (1)                │
├──────────────────────────────┤
│ Order 2 - safari [Delete]    │
└──────────────────────────────┘

✅ Success: "Pre-order deleted successfully!"
```

---

## 🚫 Error Cases to Test

### Test 1: Try Delete Pending (Should Fail)
```
Attempt: DELETE /api/bookings/X (pending status)
Expected: Error 400
Message: "Only completed or cancelled bookings can be deleted"
```

### Test 2: Try Delete as Wrong User (Should Fail)
```
Attempt: Provider A tries to delete Provider B's booking
Expected: Error 403
Message: "You do not have permission to delete this booking"
```

### Test 3: Try Delete Non-Existent (Should Fail)
```
Attempt: DELETE /api/bookings/9999
Expected: Error 404
Message: "Booking not found"
```

---

## ✅ Success Criteria

**Delete Functionality Working If:**

1. ✅ Delete button appears on completed orders
2. ✅ Delete button appears on rejected orders
3. ✅ No delete button on pending orders
4. ✅ No delete button on confirmed orders
5. ✅ Confirmation dialog shows before delete
6. ✅ Success message after deletion
7. ✅ Order disappears from list
8. ✅ Tab count updates correctly
9. ✅ Database record removed
10. ✅ Cannot delete other provider's bookings

---

**Ready to test!** 🧪

**Jaribu sasa - create pre-orders, complete them, then delete!** 🗑️✨
