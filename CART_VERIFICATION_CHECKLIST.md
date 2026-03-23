# Cart System - Verification Checklist

## Pre-Deployment Verification

### 1. Add to Cart Functionality

#### Homepage - Trending Services
- [ ] Click "Add to Cart" on service card
- [ ] Verify success message appears
- [ ] Navigate to cart page
- [ ] Verify service appears in cart with correct details
- [ ] Verify cart count updates in header

#### Service Details Modal
- [ ] Open service details modal
- [ ] Click "Add to Cart" button
- [ ] Verify success message appears
- [ ] Verify modal closes
- [ ] Navigate to cart page
- [ ] Verify service appears in cart

#### Provider Profile Page
- [ ] Visit provider profile
- [ ] Click "Add to Cart" on service
- [ ] Verify success message appears
- [ ] Navigate to cart page
- [ ] Verify service appears in cart

#### Destination Discovery
- [ ] Search for services
- [ ] Click "Add to Cart" on service
- [ ] Verify navigation to cart page
- [ ] Verify service appears in cart

#### Services Overview Pages
- [ ] Visit Transportation Hub
- [ ] Click "Add to Cart" on service
- [ ] Verify navigation to cart page
- [ ] Verify service appears in cart
- [ ] Repeat for other service categories (Accommodation, Events, Experiences)

### 2. Book Now Functionality

#### Homepage - Trending Services
- [ ] Click "Book Now" on service card
- [ ] Verify service is added to cart
- [ ] Verify navigation to cart page
- [ ] Verify payment modal opens automatically
- [ ] Verify service details are pre-filled in modal

#### Service Details Modal
- [ ] Open service details modal
- [ ] Click "Book Now" button
- [ ] Verify service is added to cart
- [ ] Verify navigation to cart page with payment modal open

#### Provider Profile Page
- [ ] Visit provider profile
- [ ] Click "Book Now" on service
- [ ] Verify service is added to cart
- [ ] Verify navigation to cart page with payment modal open

#### Destination Discovery
- [ ] Search for services
- [ ] Click "Book Now & Pay" on service
- [ ] Verify service is added to cart
- [ ] Verify navigation to cart page with payment modal open

#### Services Overview Pages
- [ ] Visit any service category page
- [ ] Click "Book Now" on service
- [ ] Verify service is added to cart
- [ ] Verify navigation to cart page with payment modal open

### 3. Pre-Order Functionality

#### Cart Page
- [ ] Add service to cart
- [ ] Navigate to cart page
- [ ] Click "Pre-Order" button on cart item
- [ ] Verify loading indicator appears
- [ ] Verify success message appears
- [ ] Verify item is removed from cart
- [ ] Verify booking is created (check bookings page)

### 4. Cart Page Functionality

#### Display
- [ ] Cart page shows all added services
- [ ] Each service shows correct image, title, price, quantity
- [ ] Total price is calculated correctly
- [ ] Cart count is displayed correctly

#### Quantity Management
- [ ] Click "+" button to increase quantity
- [ ] Verify quantity updates
- [ ] Verify total price updates
- [ ] Click "-" button to decrease quantity
- [ ] Verify quantity updates
- [ ] Verify total price updates

#### Remove Items
- [ ] Click "Remove" button on cart item
- [ ] Verify confirmation dialog appears
- [ ] Confirm removal
- [ ] Verify item is removed from cart
- [ ] Verify total price updates
- [ ] Verify cart count updates

#### Clear Cart
- [ ] Click "Clear Cart" button
- [ ] Verify all items are removed
- [ ] Verify empty cart message appears
- [ ] Verify cart count shows 0

#### Checkout
- [ ] Click "Proceed to Checkout" button
- [ ] Verify payment modal opens
- [ ] Verify all cart items are listed in modal
- [ ] Verify total price is correct

### 5. Error Handling

#### Not Logged In
- [ ] Log out
- [ ] Try to add service to cart
- [ ] Verify redirect to login page
- [ ] Verify redirect URL includes current page

#### Invalid Service
- [ ] Try to add non-existent service (manual API call)
- [ ] Verify error message appears
- [ ] Verify cart remains unchanged

#### Network Error
- [ ] Disconnect from internet
- [ ] Try to add service to cart
- [ ] Verify error message appears
- [ ] Reconnect to internet
- [ ] Verify cart operations work again

#### Backend Error
- [ ] Simulate backend error (if possible)
- [ ] Verify user-friendly error message appears
- [ ] Verify app doesn't crash

### 6. Data Persistence

#### Page Refresh
- [ ] Add services to cart
- [ ] Refresh page
- [ ] Verify cart items persist
- [ ] Verify cart count persists

#### Navigation
- [ ] Add services to cart
- [ ] Navigate to different pages
- [ ] Return to cart page
- [ ] Verify cart items persist

#### Logout/Login
- [ ] Add services to cart
- [ ] Log out
- [ ] Log back in
- [ ] Navigate to cart page
- [ ] Verify cart items persist

### 7. Multiple Services

#### Different Services
- [ ] Add multiple different services to cart
- [ ] Verify all services appear in cart
- [ ] Verify each service has correct details
- [ ] Verify total price is sum of all services

#### Same Service Multiple Times
- [ ] Add same service to cart twice
- [ ] Verify quantity increases instead of duplicate entry
- [ ] Verify total price updates correctly

### 8. Payment Flow

#### From Cart
- [ ] Add services to cart
- [ ] Click "Proceed to Checkout"
- [ ] Select payment method
- [ ] Complete payment
- [ ] Verify booking confirmation appears
- [ ] Verify cart is cleared after successful payment

#### Direct Book Now
- [ ] Click "Book Now" on service
- [ ] Verify payment modal opens with service pre-filled
- [ ] Complete payment
- [ ] Verify booking confirmation appears

### 9. Mobile Responsiveness

#### Mobile View
- [ ] Test all cart operations on mobile device
- [ ] Verify buttons are clickable
- [ ] Verify modals display correctly
- [ ] Verify cart page is readable and usable

### 10. Browser Compatibility

#### Chrome
- [ ] Test all cart operations in Chrome
- [ ] Verify no console errors

#### Firefox
- [ ] Test all cart operations in Firefox
- [ ] Verify no console errors

#### Safari
- [ ] Test all cart operations in Safari
- [ ] Verify no console errors

#### Edge
- [ ] Test all cart operations in Edge
- [ ] Verify no console errors

## Backend Verification

### Database
- [ ] Verify cart table exists
- [ ] Verify cart items are saved correctly
- [ ] Verify service_id foreign key works
- [ ] Verify user_id foreign key works

### API Endpoints
- [ ] Test GET /api/cart
- [ ] Test POST /api/cart/add
- [ ] Test PUT /api/cart/:id
- [ ] Test DELETE /api/cart/:id
- [ ] Test DELETE /api/cart
- [ ] Test POST /api/bookings

### Authentication
- [ ] Verify JWT authentication works
- [ ] Verify unauthorized requests are rejected
- [ ] Verify token expiration is handled

## Performance

### Load Time
- [ ] Cart page loads in < 2 seconds
- [ ] Add to cart operation completes in < 1 second
- [ ] Cart updates appear immediately

### Concurrent Users
- [ ] Multiple users can add to cart simultaneously
- [ ] Cart items don't mix between users
- [ ] No race conditions

## Security

### Authorization
- [ ] Users can only access their own cart
- [ ] Users cannot modify other users' carts
- [ ] Admin cannot access user carts without proper permissions

### Input Validation
- [ ] Service ID is validated
- [ ] Quantity is validated (positive integer)
- [ ] SQL injection is prevented
- [ ] XSS attacks are prevented

## Final Checks

- [ ] All console errors are resolved
- [ ] All console warnings are reviewed
- [ ] No broken links
- [ ] No 404 errors
- [ ] No 500 errors
- [ ] All images load correctly
- [ ] All icons display correctly
- [ ] All text is readable
- [ ] All buttons are clickable
- [ ] All forms submit correctly

## Sign-Off

- [ ] Developer tested all functionality
- [ ] QA tested all functionality
- [ ] Product owner approved
- [ ] Ready for deployment

---

**Date**: _________________

**Tested By**: _________________

**Approved By**: _________________

**Notes**: 
_________________________________________________________________________________
_________________________________________________________________________________
_________________________________________________________________________________
