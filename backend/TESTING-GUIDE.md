# 🧪 Pre-Order System Testing Guide

## 📅 Created: 2025-10-16 @ 15:11

---

## 🎯 OBJECTIVE

Kuhakikisha Pre-Order System inafanya kazi kikamilifu kutoka Traveler hadi Service Provider.

---

## ✅ PRE-REQUISITES

### 1. System Requirements:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 4028
- ✅ Database connected (PostgreSQL)
- ✅ At least 1 service provider with services
- ✅ Services are active in database

### 2. Test Data Available:
```
Services in Database:
  - Service ID: 9  | Test Service | TZS 100.00
  - Service ID: 10 | chapati      | TZS 300.00
  - Service ID: 11 | NANCY        | TZS 200.00

Providers: 4 total
```

---

## 🚀 QUICK START

### Start Servers:
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
npm run dev

# OR use automated test:
./test-pre-order-flow.sh
```

---

## 📝 TESTING SCENARIOS

### Scenario 1: Complete Journey to Pre-Order ✅

#### Step 1: User Registration/Login
```
1. Open browser: http://localhost:4028
2. Click "Register" or "Login"
3. Register as TRAVELER
   - Email: test@example.com
   - Password: Test123!
   - User Type: Traveler
4. Login successfully
```

**Expected Result:**
- ✅ Redirect to Traveler Dashboard
- ✅ User info visible in header

---

#### Step 2: Start Journey Planning
```
1. Click "Plan Journey" button on dashboard
   OR navigate to Journey Planner from menu
2. Journey Planner opens with Step 1
```

**Expected Result:**
- ✅ Step 1: Location & Dates form visible
- ✅ Region dropdown populated

---

#### Step 3: Select Location & Dates
```
1. Select Region: "Dodoma"
2. Select District: "Dodoma Urban"
3. Select Start Date: (any future date)
4. Select End Date: (after start date)
5. Enter Number of Travelers: 2
6. Click "Next"
```

**Expected Result:**
- ✅ Move to Step 2: Accommodation
- ✅ Journey data saved

---

#### Step 4: Choose Accommodation
```
1. Select accommodation type (any option)
2. Click "Next"
```

**Expected Result:**
- ✅ Move to Step 3: Select Services

---

#### Step 5: Select Service Categories
```
1. Click on service categories you need:
   - Tours & Activities
   - Food & Dining
   - Transportation
   (Select at least one)
2. Click "Next"
```

**Expected Result:**
- ✅ Move to Step 4: Choose Providers
- ✅ Providers list starts loading

---

#### Step 6: Choose Providers & Services ⚠️ CRITICAL STEP

```
1. Wait for providers list to load
2. You'll see provider cards with:
   - Business name
   - Location
   - Services count
   - "View Services" button

3. Click "View Services" on ANY provider
4. 📋 PROVIDER MODAL OPENS showing:
   - Provider business info
   - List of their services
   - Service prices
   - Checkboxes for each service

5. ✅ SELECT AT LEAST ONE SERVICE (check the box)
6. Click "Add Selected Services" button
7. Modal closes

8. Repeat steps 3-7 for other providers if needed
```

**Expected Result:**
- ✅ Services added to journeyData.selectedServiceDetails
- ✅ Message: "X services added to journey"
- ✅ Continue to Step 5

**IMPORTANT:** 
❌ Don't just select providers (green checkmark)
✅ Must open modal and select ACTUAL SERVICES

---

#### Step 7: Review Summary
```
1. Summary page shows:
   - Selected location
   - Travel dates
   - Selected services (should list actual services)
   - Total estimated cost
   - Number of travelers

2. Verify services are listed (not just providers)
3. Click "Continue to Cart & Payment"
```

**Expected Result:**
- ✅ Redirect to Traveler Dashboard
- ✅ Cart & Payment tab active
- ✅ Cart populated with services

---

#### Step 8: Verify Cart Contents ⚠️ CRITICAL CHECK

```
Open Browser Console (F12) and check:

console.log(localStorage.getItem('isafari_cart_<user_id>'));

Cart items should have:
{
  "service_id": 9,  // ✅ Real service ID (number)
  "name": "Test Service",  // ✅ Service name
  "provider_name": "CHAPATI ZA MOTO",  // ✅ Provider name separate
  "price": 100,
  "quantity": 3
}

❌ BAD (Old way):
{
  "service_id": "provider_3",  // Wrong!
  "name": "CHAPATI ZA MOTO"  // This is provider name!
}
```

**Expected Result:**
- ✅ Cart has real services
- ✅ service_id is a NUMBER (9, 10, 11, etc)
- ✅ service_id matches database service IDs

---

#### Step 9: Submit Pre-Order
```
1. In Cart & Payment section, locate "Pre-Order Services" card
2. Review total amount
3. Click "Submit Pre-Order Request" button
4. Confirm dialog appears
5. Click "OK" to confirm
```

**Expected Result:**
- ✅ Loading indicator appears
- ✅ Success message: "✅ Pre-Order Successfully Submitted!"
- ✅ Additional message about provider confirmation
- ✅ Cart cleared
- ✅ Auto-redirect to Overview tab

**If Error Occurs:**
```
❌ Error: "Service not found or not available"

Troubleshooting:
1. Check browser console for logs:
   "Creating booking with: {serviceId: X, ...}"
   
2. Check backend logs:
   tail -f backend/server.log
   Should show: "📝 Looking for service with ID: X"
   
3. Verify service exists in database:
   Run: ./test-pre-order-flow.sh
```

---

#### Step 10: Verify Traveler Side
```
1. Check "Active Pre-Orders" section in Overview tab
2. Should show newly created pre-order with:
   - Service name
   - Provider name
   - Date
   - Status: Pending
   - Amount
```

**Expected Result:**
- ✅ Pre-order visible in active orders
- ✅ Status: 🟡 Pending

---

### Scenario 2: Service Provider Accept/Reject ✅

#### Step 1: Login as Service Provider
```
1. Logout from traveler account
2. Login with service provider credentials
   (The provider who owns the service that was booked)
3. Should redirect to Service Provider Dashboard
```

---

#### Step 2: Navigate to Pre-Order Management
```
1. Click on "Pre-Order Management" or "Bookings" tab
2. Should see tabs:
   - Pending Pre-Orders
   - Confirmed
   - Completed
   - Rejected
```

**Expected Result:**
- ✅ Pending Pre-Orders tab shows count (1+)

---

#### Step 3: Review Pre-Order Details
```
1. Click on "Pending Pre-Orders" tab
2. Should see booking card showing:
   - Traveler name
   - Service name (e.g., "Test Service")
   - Booking date
   - Participants: 2
   - Total amount: TZS XXX
   - Status: 🟡 Pending Review
   - Traveler contact info (email, phone)
   - Special requests (if any)
```

**Expected Result:**
- ✅ All booking details visible
- ✅ Accept and Reject buttons present

---

#### Step 4: Accept Pre-Order
```
1. Click "Accept Pre-Order" button (green)
2. Confirmation dialog appears
3. Click "OK" to confirm
```

**Expected Result:**
- ✅ Success message shown
- ✅ Booking moves to "Confirmed" tab
- ✅ Status changes to ✅ Confirmed
- ✅ Traveler receives notification (future: email/SMS)

---

#### Step 5: Verify Status Change
```
1. Click on "Confirmed" tab
2. Booking should appear there
3. New action buttons:
   - "Mark as Completed"
   - "Cancel Order"
```

**Expected Result:**
- ✅ Booking in confirmed state
- ✅ Can mark as completed

---

### Scenario 3: Test Reject Flow ✅

```
1. Create another pre-order (repeat Scenario 1)
2. Login as service provider
3. Go to Pending Pre-Orders
4. Click "Reject Pre-Order" (red button)
5. Confirm rejection
```

**Expected Result:**
- ✅ Booking moves to "Rejected" tab
- ✅ Status: ❌ Rejected
- ✅ Traveler sees rejection status

---

### Scenario 4: Complete Service ✅

```
1. Have a confirmed booking
2. Service provider marks as "Completed"
3. Status changes to ✅ Completed
```

**Expected Result:**
- ✅ Booking in "Completed" tab
- ✅ No more action buttons
- ✅ Historical record maintained

---

## 🐛 DEBUGGING GUIDE

### Problem 1: "Service not found" Error

**Symptoms:**
```
Error: Service not found or not available
```

**Diagnosis:**
```bash
# 1. Check console logs
Browser Console → Shows serviceId being sent

# 2. Check backend logs
tail -f backend/server.log
# Should show: "📝 Looking for service with ID: X"

# 3. Verify service exists
cd backend && node -e "
const db = require('./config/database');
db.query('SELECT id, title, is_active FROM services WHERE id = 9')
  .then(r => console.log(r.rows))
  .then(() => process.exit(0));
"
```

**Common Causes:**
1. ❌ Cart has provider ID instead of service ID
2. ❌ Service is inactive (is_active = false)
3. ❌ Service doesn't exist in database
4. ❌ User didn't select services from provider modal

**Solution:**
1. Clear cart: `localStorage.removeItem('isafari_cart_<user_id>')`
2. Start journey planning again
3. **IMPORTANT:** Open provider modal and SELECT SERVICES
4. Don't just select providers with checkmark

---

### Problem 2: Empty Cart

**Symptoms:**
- Cart shows "Your cart is empty"
- "Continue to Cart & Payment" doesn't populate cart

**Solution:**
```
1. In Step 4 (Choose Providers):
   - Don't just click provider card
   - Click "View Services" button
   - Select services from modal
   - Click "Add Selected Services"

2. Verify in Step 5 (Summary):
   - Should see list of services
   - Not just provider names
```

---

### Problem 3: Pre-Order Not Showing on Provider Side

**Diagnosis:**
```bash
# Check bookings in database
cd backend && node -e "
const db = require('./config/database');
db.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5')
  .then(r => console.log(JSON.stringify(r.rows, null, 2)))
  .then(() => process.exit(0));
"
```

**Common Causes:**
1. ❌ Provider not logged in with correct account
2. ❌ Booking created for different provider's service
3. ❌ Database query filtering incorrectly

---

## 📊 SUCCESS CRITERIA

### ✅ System is Working if:

1. **Journey Planning:**
   - [x] All 5 steps complete
   - [x] Services can be selected from providers
   - [x] Summary shows selected services
   - [x] Cart populated correctly

2. **Pre-Order Creation:**
   - [x] Submit button works
   - [x] Success message shown
   - [x] Cart cleared
   - [x] Booking in database

3. **Provider Dashboard:**
   - [x] Pre-orders visible
   - [x] Accept button works
   - [x] Reject button works
   - [x] Status updates correctly

4. **Data Integrity:**
   - [x] service_id is valid database ID
   - [x] provider_id matches service owner
   - [x] Amounts calculated correctly
   - [x] Dates stored properly

---

## 🎯 AUTOMATED TESTING

### Run Full Test Suite:
```bash
./test-pre-order-flow.sh
```

**Should Show:**
- ✅ Backend running
- ✅ Frontend running
- ✅ Database connected
- ✅ Services available
- ✅ Providers registered

---

## 📝 TEST RESULTS TEMPLATE

```
Date: ______________
Tester: ______________

Scenario 1: Complete Journey ✅ / ❌
- Step 1-3: Location selection ___
- Step 4: Provider/Service selection ___
- Step 5: Summary & Cart ___
- Pre-order submission ___

Scenario 2: Provider Accept ✅ / ❌
- View pre-order ___
- Accept pre-order ___
- Status update ___

Scenario 3: Provider Reject ✅ / ❌
- Reject pre-order ___
- Status update ___

Issues Found:
_________________________________
_________________________________

Notes:
_________________________________
_________________________________
```

---

## 🎉 FINAL CHECKLIST

Before declaring system ready:

- [ ] Backend server starts without errors
- [ ] Frontend loads correctly
- [ ] User can register/login
- [ ] Journey planner completes all steps
- [ ] Services can be selected from provider modal
- [ ] Cart shows correct service data
- [ ] Pre-order creates successfully
- [ ] Provider sees pre-order
- [ ] Provider can accept/reject
- [ ] Status updates work
- [ ] No console errors
- [ ] Backend logs show correct flow

---

**System Status:** 🟢 READY FOR TESTING

Run `./test-pre-order-flow.sh` to verify system health anytime!
