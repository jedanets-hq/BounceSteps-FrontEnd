# Quick Start - Data Persistence Fix

## What Changed?
- ✅ Cart items now save to database (not just localStorage)
- ✅ Trip plans now save to database (not just localStorage)
- ✅ Favorites now save to database (not just localStorage)
- ✅ Data persists across page refreshes
- ✅ Data syncs across devices
- ✅ Old localStorage data auto-migrates on login

## How to Deploy

### 1. Backend Deployment
```bash
cd backend
git add .
git commit -m "Add data persistence: cart, plans, favorites tables and API routes"
git push origin main
```

The backend will:
- Create new database tables automatically
- Register new API routes
- Start accepting cart/plans/favorites requests

### 2. Frontend Deployment
```bash
cd frontend
git add .
git commit -m "Add data persistence: cart, plans, favorites contexts and API integration"
git push origin main
```

The frontend will:
- Use new contexts for state management
- Call new API endpoints
- Auto-migrate old localStorage data on login

## Testing After Deployment

### Test 1: Add to Cart
1. Go to any service
2. Click "Add to Cart"
3. Refresh page
4. ✅ Item should still be in cart

### Test 2: Add to Plan
1. Go to Journey Planner
2. Click "Add to Plan"
3. Refresh page
4. ✅ Item should still be in plan

### Test 3: Add to Favorites
1. Go to provider profile
2. Click "Follow" (add to favorites)
3. Refresh page
4. ✅ Provider should still be favorited

### Test 4: Cross-Device Sync
1. Add item to cart on Device A
2. Log in on Device B
3. ✅ Item should appear in cart on Device B

### Test 5: Data Migration
1. Add items to cart (localStorage)
2. Log out
3. Log in
4. ✅ Old items should appear in cart (migrated from localStorage)

## API Endpoints

### Cart
```
GET    /api/cart              - Get cart items
POST   /api/cart/add          - Add to cart
PUT    /api/cart/:id          - Update quantity
DELETE /api/cart/:id          - Remove item
DELETE /api/cart              - Clear cart
```

### Plans
```
GET    /api/plans             - Get plans
POST   /api/plans/add         - Add to plan
PUT    /api/plans/:id         - Update plan
DELETE /api/plans/:id         - Remove from plan
DELETE /api/plans             - Clear plans
```

### Favorites
```
GET    /api/favorites         - Get favorites
GET    /api/favorites/check/:providerId - Check if favorited
POST   /api/favorites/add     - Add to favorites
DELETE /api/favorites/:providerId - Remove from favorites
DELETE /api/favorites         - Clear favorites
```

## Frontend Usage

### Using Cart
```javascript
import { useCart } from './contexts/CartContext';

function MyComponent() {
  const { cartItems, addToCart, removeFromCart } = useCart();
  
  // Add to cart
  await addToCart(service);
  
  // Remove from cart
  await removeFromCart(serviceId);
  
  // View cart items
  console.log(cartItems);
}
```

### Using Plans
```javascript
import { usePlans } from './contexts/PlansContext';

function MyComponent() {
  const { plans, addToPlan, removeFromPlan } = usePlans();
  
  // Add to plan
  await addToPlan(service, planDate, notes);
  
  // Remove from plan
  await removeFromPlan(planId);
  
  // View plans
  console.log(plans);
}
```

### Using Favorites
```javascript
import { useFavorites } from './contexts/FavoritesContext';

function MyComponent() {
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  
  // Add to favorites
  await addToFavorites(providerId);
  
  // Remove from favorites
  await removeFromFavorites(providerId);
  
  // View favorites
  console.log(favorites);
}
```

## Database Schema

### cart_items
```
id (PK)
user_id (FK)
service_id (FK)
quantity
added_at
updated_at
```

### trip_plans
```
id (PK)
user_id (FK)
service_id (FK)
plan_date
notes
added_at
updated_at
```

### favorites
```
id (PK)
user_id (FK)
provider_id (FK)
added_at
```

## Troubleshooting

### Issue: Cart not saving
**Solution:** Check if user is logged in. Cart saves to database only for logged-in users.

### Issue: Data not syncing across devices
**Solution:** Ensure user is logged in with same account on both devices.

### Issue: Old data not migrating
**Solution:** Log out and log back in. Migration runs automatically on login.

### Issue: API errors
**Solution:** Check browser console for error messages. Verify backend is running.

## Files Changed

### Backend
- `backend/config/postgresql.js` - Added tables
- `backend/routes/cart.js` - New file
- `backend/routes/plans.js` - New file
- `backend/routes/favorites.js` - New file
- `backend/server.js` - Registered routes

### Frontend
- `src/utils/api.js` - Added API functions
- `src/contexts/CartContext.jsx` - Updated
- `src/contexts/PlansContext.jsx` - New file
- `src/contexts/FavoritesContext.jsx` - New file
- `src/contexts/AuthContext.jsx` - Added migration
- `src/App.jsx` - Added providers
- `src/utils/migrateLocalStorage.js` - New file

## Next Steps

1. ✅ Deploy backend
2. ✅ Deploy frontend
3. ✅ Test all features
4. ✅ Monitor for errors
5. ✅ Celebrate! 🎉

## Support

If you encounter any issues:
1. Check browser console for errors
2. Check backend logs
3. Verify database connection
4. Check API endpoints are responding
5. Review the detailed documentation in `DATA-PERSISTENCE-FIX-COMPLETE.md`
