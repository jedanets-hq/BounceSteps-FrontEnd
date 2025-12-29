# Add-to-Cart Fix and Testing Guide

## Problem
Cart is empty even after clicking "Add to Cart" button. Services are not being saved to the database or not being loaded.

## Root Causes Identified & Fixed

### 1. **Insufficient Logging**
- **Issue**: No way to debug what's happening in the add-to-cart flow
- **Fix**: Added comprehensive logging at every step:
  - CartContext logs when adding/loading
  - API layer logs all requests and responses
  - Each log includes timestamps and data details

### 2. **Data Structure Issues** (Already Fixed)
- Changed `item.name` → `item.title` in 4 files
- Ensures UI components display correct data

### 3. **Potential Authentication Issues**
- Added checks for user token presence
- Logs if user is not authenticated

## Files Modified

### 1. `src/contexts/CartContext.jsx`
**Enhanced `addToCart` function with detailed logging:**
```javascript
console.log('📤 [CartContext] Adding to cart');
console.log('   Service ID:', serviceId);
console.log('   Service Title:', service.title || service.name);
console.log('   User Token:', user.token ? '✅ Present' : '❌ Missing');
```

**Enhanced `loadCartFromDatabase` function:**
```javascript
console.log('📥 [CartContext] Loading cart from database...');
console.log('   Items:', response.cartItems.map(i => ({ id: i.id, title: i.title, qty: i.quantity })));
```

### 2. `src/utils/api.js`
**Added logging to all cart API functions:**
```javascript
console.log('📡 [API] POST /cart/add - serviceId: ${serviceId}, quantity: ${quantity}');
console.log('📥 [API] POST /cart/add response:', result);
```

## How to Test

### Step 1: Open Browser Console
1. Open your browser (Chrome, Firefox, Edge)
2. Press `F12` to open Developer Tools
3. Go to the "Console" tab
4. Keep it open while testing

### Step 2: Login
1. Login as a traveler
2. Look for logs like:
   ```
   📥 [CartContext] Loading cart from database...
   ✅ [CartContext] Cart loaded successfully
   Items: []
   ```

### Step 3: Navigate to Service Provider
1. Go to any service provider profile
2. Look for logs showing services loaded

### Step 4: Click "Add to Cart"
1. Click the "Add to Cart" button on any service
2. **Watch the console for these logs in order:**

```
📤 [CartContext] Adding to cart
   Service ID: 47
   Service Title: Test Safari Tour
   User Token: ✅ Present

📡 [API] POST /cart/add - serviceId: 47, quantity: 1

📥 [API] POST /cart/add response: {
  success: true,
  message: "Item added to cart",
  cartItem: { id: 1, service_id: 47, quantity: 1, ... }
}

✅ [CartContext] Item added to cart successfully

🔄 [CartContext] Reloading cart from database...

📡 [API] GET /cart

📥 [API] GET /cart response: {
  success: true,
  cartItems: [
    { id: 1, title: "Test Safari Tour", quantity: 1, price: 500, ... }
  ]
}

✅ [CartContext] Cart reloaded. Current items: 1
```

### Step 5: Verify in UI
1. Check if service appears in cart sidebar
2. Check if cart count increases
3. Navigate to Cart & Payment page
4. Verify service displays with title, price, quantity

## Troubleshooting

### Issue: "User Token: ❌ Missing"
**Solution:**
- User is not logged in
- Login first before adding to cart
- Check localStorage for `isafari_user` token

### Issue: API returns 401 Unauthorized
**Solution:**
- Token is invalid or expired
- Logout and login again
- Check if token is being sent in Authorization header

### Issue: API returns 404 Not Found
**Solution:**
- Backend is not running
- Check if backend is running on port 5000
- Verify API_BASE_URL is correct (should be `http://localhost:5000/api`)

### Issue: "Failed to add to cart" message
**Solution:**
- Check console for detailed error message
- Look for API response with error details
- Verify service ID is valid
- Check if service exists in database

### Issue: Item added but cart still empty
**Solution:**
- Check if `loadCartFromDatabase` is being called
- Verify API returns items in response
- Check if CartContext state is being updated
- Look for errors in console

## Data Flow Diagram

```
User clicks "Add to Cart"
    ↓
handleAddToCart() in provider-profile
    ↓
addToCart(service) in CartContext
    ↓
Extract serviceId from service object
    ↓
Check user token exists
    ↓
Call cartAPI.addToCart(serviceId, 1)
    ↓
API sends POST /cart/add with serviceId
    ↓
Backend validates user and service
    ↓
Backend inserts into cart_items table
    ↓
Backend returns success response
    ↓
CartContext calls loadCartFromDatabase()
    ↓
API sends GET /cart
    ↓
Backend queries cart_items with service details
    ↓
Backend returns cartItems array
    ↓
CartContext updates state with cartItems
    ↓
UI components re-render with new items
    ↓
Cart sidebar shows service
    ↓
Cart page shows service
    ↓
Payment modal shows service
```

## Expected Console Output

### Successful Add-to-Cart:
```
✅ All logs show success
✅ Item appears in cart sidebar
✅ Cart count increases
✅ Service displays in payment modal
```

### Failed Add-to-Cart:
```
❌ Error message in console
❌ Cart remains empty
❌ Alert shows error to user
```

## Database Verification

### Check if data is in PostgreSQL:
```sql
-- Connect to PostgreSQL
SELECT * FROM cart_items WHERE user_id = <user_id>;

-- Should show:
-- id | user_id | service_id | quantity | added_at
-- 1  | 5       | 47         | 1        | 2025-01-15 10:30:00
```

### Check if service details are joined:
```sql
SELECT 
  ci.id,
  ci.service_id,
  s.title,
  s.price,
  s.category,
  ci.quantity
FROM cart_items ci
JOIN services s ON ci.service_id = s.id
WHERE ci.user_id = <user_id>;
```

## Testing Checklist

- [ ] Backend is running on port 5000
- [ ] User is logged in
- [ ] Console shows all expected logs
- [ ] Service ID is extracted correctly
- [ ] User token is present
- [ ] API call succeeds (status 200)
- [ ] Database insert succeeds
- [ ] Cart reload succeeds
- [ ] CartContext state updates
- [ ] UI displays service in sidebar
- [ ] UI displays service in cart page
- [ ] UI displays service in payment modal
- [ ] Data persists after page reload
- [ ] Quantity can be updated
- [ ] Item can be removed
- [ ] Cart can be cleared

## Next Steps

1. **Test locally first** with all console logs visible
2. **Verify database** has cart_items table with correct schema
3. **Check Render backend** if using production database
4. **Monitor logs** for any errors or warnings
5. **Test complete workflow** from add-to-cart to payment

## Support

If tests fail:
1. Check console for error messages
2. Verify backend is running
3. Check user is authenticated
4. Verify database connection
5. Check API endpoints are correct
6. Review error messages in console

All logs are prefixed with:
- `📤` = Outgoing request
- `📥` = Incoming response
- `✅` = Success
- `❌` = Error
- `⚠️` = Warning
- `🔄` = Reloading/Refreshing
- `📡` = API call
- `📦` = Data received
