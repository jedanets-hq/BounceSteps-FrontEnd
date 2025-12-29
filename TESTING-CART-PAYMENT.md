# Cart and Payment Testing Guide

## Quick Test Steps

### Test 1: Add Service to Cart
1. Login as a traveler
2. Navigate to any service provider profile
3. Click "Book Now" button on any service
4. **Expected**: Service appears in cart sidebar with:
   - ✅ Service title
   - ✅ Category
   - ✅ Location
   - ✅ Price
   - ✅ Quantity controls

### Test 2: View Cart Sidebar
1. After adding service, cart sidebar should open
2. **Expected**: Service displays with all details
3. Try quantity controls (+ and -)
4. **Expected**: Quantity updates correctly

### Test 3: Proceed to Payment
1. Click "Proceed to Payment" button
2. **Expected**: Payment modal opens with order summary
3. **Expected**: Service shows as: "Service Title x1 = $Price"
4. **Expected**: Total amount is calculated correctly

### Test 4: View in Traveler Dashboard
1. Go to traveler dashboard
2. Look for "Your Cart" section
3. **Expected**: Added services display with:
   - ✅ Service title
   - ✅ Category
   - ✅ Location
   - ✅ Price

### Test 5: View in Cart Page
1. Navigate to dedicated cart page (if available)
2. **Expected**: Services display with:
   - ✅ Service title
   - ✅ Category
   - ✅ Location
   - ✅ Price
   - ✅ Quantity

### Test 6: Add Multiple Services
1. Add 2-3 different services to cart
2. **Expected**: All services display in sidebar
3. **Expected**: All services display in payment modal
4. **Expected**: Total is sum of all items

### Test 7: Remove Service
1. Add service to cart
2. Click remove button (trash icon)
3. **Expected**: Service is removed from cart
4. **Expected**: Cart count decreases

### Test 8: Complete Payment
1. Add service to cart
2. Click "Proceed to Payment"
3. Select payment method
4. Enter payment details
5. Click "Pay" button
6. **Expected**: Payment confirmation appears
7. **Expected**: Booking reference is generated

## What Should Work Now

✅ Services display in cart sidebar
✅ Services display in payment modal
✅ Services display in traveler dashboard
✅ Services display in cart page
✅ Quantity controls work
✅ Remove button works
✅ Payment flow works
✅ Booking confirmation works

## If Something Doesn't Work

1. Check browser console for errors
2. Verify user is logged in
3. Verify backend is running on port 5000
4. Check that services exist in database
5. Clear browser cache and reload

## API Endpoints Used

```
GET /api/services              - Get available services
POST /api/cart/add             - Add item to cart
GET /api/cart                  - Get cart items
PUT /api/cart/:cartItemId      - Update quantity
DELETE /api/cart/:cartItemId   - Remove item
DELETE /api/cart               - Clear cart
```

## Expected Data Structure

```javascript
// Cart item from backend
{
  id: 47,
  title: "Test Safari Tour",        // ← Used in UI
  category: "Tours",
  location: "Dar es Salaam",
  price: 500.00,
  quantity: 1,
  provider_name: "Provider Name",
  description: "...",
  images: [...]
}
```

## Files Changed

1. `src/components/CartSidebar.jsx` - Line 47
2. `src/components/PaymentSystem.jsx` - Line 42
3. `src/pages/traveler-dashboard/index.jsx` - Line 1010
4. `src/pages/cart/index.jsx` - Line 109

All changes: `item.name` → `item.title`

## Status
✅ Ready for testing
