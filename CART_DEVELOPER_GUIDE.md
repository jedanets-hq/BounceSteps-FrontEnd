# Cart System - Developer Guide

## Quick Reference for Adding Cart Functionality

### 1. Add to Cart Button

```javascript
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const handleAddToCart = async (service) => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('isafari_user');
    if (!savedUser) {
      navigate('/login?redirect=/current-page');
      return;
    }
    
    // Add to cart with minimal data structure
    const result = await addToCart({
      id: service.id,           // Required: Service ID
      serviceId: service.id,    // Required: Service ID (duplicate for compatibility)
      title: service.title,     // Optional: For display
      name: service.title,      // Optional: For display
      price: parseFloat(service.price || 0),  // Optional: For display
      quantity: 1               // Required: Quantity
    });
    
    // Handle result
    if (result.success) {
      alert('✅ Added to cart!');
      navigate('/traveler-dashboard?tab=cart');
    } else {
      alert('❌ ' + (result.message || 'Failed to add to cart'));
    }
  };
  
  return (
    <button onClick={() => handleAddToCart(service)}>
      Add to Cart
    </button>
  );
};
```

### 2. Book Now Button (Add to Cart + Open Payment)

```javascript
const handleBookNow = async (service) => {
  // Check if user is logged in
  const savedUser = localStorage.getItem('isafari_user');
  if (!savedUser) {
    navigate('/login?redirect=/current-page');
    return;
  }
  
  // Add to cart
  const result = await addToCart({
    id: service.id,
    serviceId: service.id,
    title: service.title,
    name: service.title,
    price: parseFloat(service.price || 0),
    quantity: 1
  });
  
  // Navigate to cart with payment modal open
  if (result.success) {
    navigate('/traveler-dashboard?tab=cart&openPayment=true');
  } else {
    alert('❌ ' + (result.message || 'Failed to add to cart'));
  }
};
```

### 3. Pre-Order Button (From Cart Page)

```javascript
import { API_URL } from '../../utils/api';

const handlePreOrder = async (cartItem) => {
  try {
    const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
    const token = userData.token;
    
    if (!token) {
      alert('Please login to create a pre-order');
      return;
    }
    
    // Extract service ID from cart item
    const serviceId = cartItem.service_id || cartItem.serviceId;
    if (!serviceId) {
      alert('Error: Service ID not found');
      return;
    }
    
    // Create booking
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        serviceId: parseInt(serviceId),
        bookingDate: new Date().toISOString().split('T')[0],
        participants: cartItem.quantity || 1
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Remove from cart
      await removeFromCart(cartItem.id);
      alert('✅ Pre-order created successfully!');
    } else {
      alert('❌ Failed to create pre-order: ' + data.message);
    }
  } catch (error) {
    console.error('Error creating pre-order:', error);
    alert('❌ Error: ' + error.message);
  }
};
```

## Important Rules

### ✅ DO

1. **Always check if user is logged in** before cart operations
2. **Always use async/await** for cart operations
3. **Always check result.success** before navigation
4. **Always show user feedback** (alerts or toasts)
5. **Always parse serviceId as integer** when sending to backend
6. **Always include both `id` and `serviceId`** in the data object

### ❌ DON'T

1. **Don't pass large objects** to addToCart (only pass minimal required fields)
2. **Don't navigate before checking success**
3. **Don't assume cart operations succeed** (always handle errors)
4. **Don't use localStorage for cart data** (always use database via API)
5. **Don't forget to reload cart** after operations (CartContext handles this)

## Data Structure Reference

### Minimal Required Fields for addToCart
```javascript
{
  id: number,           // Service ID
  serviceId: number,    // Service ID (duplicate)
  quantity: number      // Quantity (default: 1)
}
```

### Optional Display Fields
```javascript
{
  title: string,        // Service title
  name: string,         // Service name (same as title)
  price: number         // Service price
}
```

### Cart Item Structure (from backend)
```javascript
{
  id: number,              // Cart item ID (not service ID!)
  user_id: number,         // User ID
  service_id: number,      // Service ID (use this for bookings)
  quantity: number,        // Quantity
  created_at: string,      // ISO timestamp
  updated_at: string,      // ISO timestamp
  title: string,           // Service title
  description: string,     // Service description
  price: number,           // Service price
  category: string,        // Service category
  images: array,           // Service images
  location: string,        // Service location
  provider_name: string,   // Provider business name
  provider_id: number      // Provider user ID
}
```

## Common Patterns

### Pattern 1: Simple Add to Cart
```javascript
<Button onClick={async () => {
  const result = await addToCart({
    id: service.id,
    serviceId: service.id,
    quantity: 1
  });
  if (result.success) {
    alert('✅ Added to cart!');
  } else {
    alert('❌ ' + result.message);
  }
}}>
  Add to Cart
</Button>
```

### Pattern 2: Add to Cart with Navigation
```javascript
<Button onClick={async () => {
  const result = await addToCart({
    id: service.id,
    serviceId: service.id,
    quantity: 1
  });
  if (result.success) {
    navigate('/cart');
  } else {
    alert('❌ ' + result.message);
  }
}}>
  Add to Cart
</Button>
```

### Pattern 3: Book Now (Add + Payment)
```javascript
<Button onClick={async () => {
  const result = await addToCart({
    id: service.id,
    serviceId: service.id,
    quantity: 1
  });
  if (result.success) {
    navigate('/cart?openPayment=true');
  } else {
    alert('❌ ' + result.message);
  }
}}>
  Book Now
</Button>
```

## API Endpoints

### Add to Cart
```
POST /api/cart/add
Headers: Authorization: Bearer <token>
Body: { serviceId: number, quantity: number }
Response: { success: boolean, message: string, data: object }
```

### Get Cart
```
GET /api/cart
Headers: Authorization: Bearer <token>
Response: { success: boolean, data: array }
```

### Update Cart Item
```
PUT /api/cart/:cartItemId
Headers: Authorization: Bearer <token>
Body: { quantity: number }
Response: { success: boolean, message: string }
```

### Remove from Cart
```
DELETE /api/cart/:cartItemId
Headers: Authorization: Bearer <token>
Response: { success: boolean, message: string }
```

### Clear Cart
```
DELETE /api/cart
Headers: Authorization: Bearer <token>
Response: { success: boolean, message: string }
```

### Create Booking (Pre-Order)
```
POST /api/bookings
Headers: Authorization: Bearer <token>
Body: { serviceId: number, bookingDate: string, participants: number }
Response: { success: boolean, message: string, data: object }
```

## Troubleshooting

### Cart is empty after adding items
- Check browser console for API errors
- Verify user is logged in (check localStorage for 'isafari_user')
- Verify backend is running and accessible
- Check if serviceId is being sent as integer

### "Service ID not found" error
- Ensure service object has `id` field
- Check if `id` is a valid number
- Verify service exists in database

### Navigation happens but cart is still empty
- Check if `result.success` is being checked before navigation
- Verify CartContext is reloading cart after add operation
- Check backend logs for errors

### Pre-Order button does nothing
- Verify cart item has `service_id` field
- Check if user token is valid
- Verify bookings API endpoint is working
- Check browser console for errors

## Testing Checklist

- [ ] User can add service to cart
- [ ] Cart page displays added service
- [ ] Cart count updates in header
- [ ] User can update quantity in cart
- [ ] User can remove item from cart
- [ ] Book Now adds to cart and opens payment
- [ ] Pre-Order creates booking and removes from cart
- [ ] Error messages are user-friendly
- [ ] All operations work when logged in
- [ ] Redirect to login when not logged in
