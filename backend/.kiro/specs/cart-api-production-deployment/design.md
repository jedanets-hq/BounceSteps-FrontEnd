# Design Document: Cart API Production Deployment

## Overview

This design addresses the critical issue where cart API endpoints return 404 errors in production. The root cause is that the cart routes are not properly deployed to the Render backend, despite being present in the codebase. This document outlines the verification, deployment, and testing strategy to ensure cart functionality works in production.

## Architecture

### Current State
- **Frontend**: React app on Netlify calling cart API endpoints
- **Backend**: Node.js/Express on Render with cart routes defined locally
- **Problem**: Cart routes returning 404 in production (not deployed)

### Target State
- **Frontend**: React app successfully calling cart API endpoints
- **Backend**: Render deployment includes cart routes and responds correctly
- **Database**: PostgreSQL on Render storing cart data

### Deployment Flow
```
Local Code → Git Repository → Render Auto-Deploy → Production Backend
```

## Components and Interfaces

### 1. Cart Routes Module (backend/routes/cart.js)
**Purpose**: Define all cart-related API endpoints

**Endpoints**:
- `GET /api/cart` - Retrieve user's cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/:cartItemId` - Update cart item quantity
- `DELETE /api/cart/:cartItemId` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

**Authentication**: All endpoints require JWT authentication

### 2. Backend Server (backend/server.js)
**Purpose**: Register and serve cart routes

**Key Configuration**:
```javascript
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);
```

### 3. Deployment Configuration
**Files to Verify**:
- `backend/routes/cart.js` - Must exist in repository
- `backend/server.js` - Must import and register cart routes
- `.gitignore` - Must NOT exclude cart routes
- `backend/package.json` - Dependencies must be correct

### 4. Verification Scripts
**Purpose**: Test production endpoints before and after deployment

**Test Cases**:
- Health check: `GET /api/health`
- Cart endpoint (no auth): `GET /api/cart` → Should return 401, not 404
- Cart add endpoint (no auth): `POST /api/cart/add` → Should return 401, not 404

## Data Models

### Cart Item (Database)
```sql
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  service_id INTEGER REFERENCES services(id),
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, service_id)
);
```

### API Response Format
```javascript
{
  success: boolean,
  message: string,
  cartItems?: Array<CartItem>,
  cartItem?: CartItem,
  total?: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Cart Routes Exist in Codebase
*For any* deployment, the backend/routes/cart.js file must exist and export a valid Express router with all required endpoints.
**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

### Property 2: Cart Routes Registered in Server
*For any* backend server instance, the cart routes must be imported and registered at the '/api/cart' path before the 404 handler.
**Validates: Requirements 2.1, 2.2**

### Property 3: Production Endpoints Return Correct Status
*For any* cart API endpoint called without authentication, the backend must return 401 (Unauthorized), not 404 (Not Found).
**Validates: Requirements 4.1, 4.2**

### Property 4: Authenticated Requests Process Successfully
*For any* cart API endpoint called with valid authentication, the backend must process the request and return a success response with appropriate data.
**Validates: Requirements 4.3, 4.4**

### Property 5: Deployment Includes All Files
*For any* Render deployment, all files in the backend directory (including routes/cart.js) must be included in the deployed application.
**Validates: Requirements 3.2**

## Error Handling

### Deployment Errors
- **Missing Files**: Verify all required files exist before deployment
- **Build Failures**: Check Render logs for compilation errors
- **Route Registration**: Ensure routes are registered before 404 handler

### Runtime Errors
- **404 Errors**: Indicates route not registered or wrong path
- **401 Errors**: Expected for unauthenticated requests (correct behavior)
- **500 Errors**: Backend processing errors (check logs)

### Frontend Error Handling
```javascript
// Current error in CartContext
catch (error) {
  console.error('❌ [CartContext] Error adding to cart:', error.message);
  return { 
    success: false, 
    message: error.message || 'Error adding to cart'
  };
}
```

## Testing Strategy

### Unit Tests
- Test cart route handlers with mock requests
- Test authentication middleware
- Test database queries

### Integration Tests
- Test full cart workflow: add → get → update → remove
- Test with authenticated and unauthenticated requests
- Test error conditions (invalid IDs, missing data)

### Production Verification Tests
1. **Pre-Deployment Check**:
   - Verify cart routes file exists
   - Verify server.js registers routes
   - Verify .gitignore doesn't exclude routes

2. **Post-Deployment Check**:
   - Call cart endpoints without auth (expect 401)
   - Call cart endpoints with valid auth (expect 200)
   - Test full cart workflow in production

3. **Frontend Integration Test**:
   - Login as test user
   - Add item to cart from UI
   - Verify no "API endpoint not found" errors
   - Verify cart updates in UI

### Deployment Steps
1. **Verify Local Code**:
   ```bash
   # Check cart routes exist
   ls -la backend/routes/cart.js
   
   # Check server registration
   grep "cartRoutes" backend/server.js
   ```

2. **Commit and Push**:
   ```bash
   git add backend/routes/cart.js backend/server.js
   git commit -m "Ensure cart routes are deployed"
   git push origin main
   ```

3. **Monitor Render Deployment**:
   - Watch Render dashboard for deployment status
   - Check build logs for errors
   - Verify deployment completes successfully

4. **Test Production**:
   ```bash
   # Test cart endpoint
   curl -X GET https://isafarinetworkglobal-2.onrender.com/api/cart
   # Should return 401, not 404
   ```

5. **Test Frontend**:
   - Open production site
   - Login as test user
   - Try adding item to cart
   - Verify success

## Implementation Notes

### Critical Files
- `backend/routes/cart.js` - Must be in repository
- `backend/server.js` - Must register cart routes
- `.gitignore` - Must not exclude backend/routes/

### Render Configuration
- Auto-deploy enabled from main branch
- Build command: `npm install`
- Start command: `node server.js`
- Environment variables: DATABASE_URL, JWT_SECRET, etc.

### Debugging Tips
1. Check Render logs for startup errors
2. Verify environment variables are set
3. Test endpoints with curl before testing UI
4. Check database connection is working
5. Verify JWT authentication is configured

## Success Criteria

✅ Cart routes file exists in repository
✅ Server.js imports and registers cart routes
✅ Render deployment includes cart routes
✅ Production cart endpoints return 401 (not 404) without auth
✅ Production cart endpoints work with valid auth
✅ Frontend can add items to cart without errors
✅ Cart data persists in PostgreSQL database
