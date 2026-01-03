# Design Document: Cart API Infinite Loop Fix

## Overview

This design addresses the critical issue where the frontend CartContext is stuck in an infinite loop of failed API requests to `/api/cart`, receiving "API endpoint not found" errors. The root cause is that cart routes are not being properly recognized by the Express server, despite being imported and mounted.

## Architecture

### Current State
- Frontend makes requests to `https://isafarinetworkglobal-2.onrender.com/api/cart`
- Backend has cart routes defined in `backend/routes/cart.js`
- Routes are imported and mounted in `backend/server.js` at line 164: `app.use('/api/cart', cartRoutes)`
- Despite proper mounting, requests return 404 "API endpoint not found"

### Root Cause Analysis
The 404 handler at the end of `server.js` is catching all requests, including valid cart routes. This suggests:
1. Cart routes module may not be exporting correctly
2. Route mounting may be happening after the 404 handler
3. Middleware chain may be breaking before reaching cart routes

## Components and Interfaces

### 1. Cart Routes Module (`backend/routes/cart.js`)

**Current Implementation:**
```javascript
const router = express.Router();
// ... route definitions ...
module.exports = router;
```

**Fix Required:**
- Verify module.exports is at the end of file
- Add initialization logging
- Ensure all routes are defined before export

### 2. Server Route Registration (`backend/server.js`)

**Current Order:**
```javascript
// Routes
app.use('/api/auth', authRoutes);
// ... other routes ...
app.use('/api/cart', cartRoutes);  // Line 164
// ... more routes ...

// 404 handler
app.use('*', (req, res) => { ... });  // This catches everything
```

**Fix Required:**
- Ensure cart routes are mounted BEFORE 404 handler
- Add route verification logging
- Test cart routes immediately after mounting

### 3. CartContext (`src/contexts/CartContext.jsx`)

**Current Behavior:**
- Calls `loadCartFromDatabase()` on mount
- On error, logs warning but doesn't prevent re-renders
- Each re-render triggers new API call
- No retry limit or backoff strategy

**Fix Required:**
```javascript
const [retryCount, setRetryCount] = useState(0);
const MAX_RETRIES = 3;

const loadCartFromDatabase = async () => {
  if (retryCount >= MAX_RETRIES) {
    console.error('Max retries reached for cart loading');
    return;
  }
  
  try {
    // ... existing code ...
  } catch (error) {
    setRetryCount(prev => prev + 1);
    // Don't retry automatically
  }
};
```

## Data Models

### Cart API Response Format
```typescript
interface CartResponse {
  success: boolean;
  data?: CartItem[];
  message?: string;
  error?: string;
}

interface CartItem {
  id: number;
  user_id: number;
  service_id: number;
  quantity: number;
  added_at: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  provider_name: string;
  provider_id: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Cart Routes Registration
*For any* server startup, cart routes SHALL be successfully mounted at `/api/cart` and accessible for requests
**Validates: Requirements 1.1, 1.4**

### Property 2: Single Load Attempt
*For any* CartContext initialization, the cart data SHALL be loaded exactly once without automatic retries
**Validates: Requirements 2.1, 2.3**

### Property 3: Authentication Check Before Request
*For any* cart API call attempt, IF the user is not authenticated, THEN no API request SHALL be made
**Validates: Requirements 2.5**

### Property 4: Error State Persistence
*For any* failed cart API request, the error state SHALL be set and persist until manually cleared
**Validates: Requirements 2.2**

### Property 5: Test Endpoint Availability
*For any* request to `/api/cart/test`, a successful response SHALL be returned without authentication
**Validates: Requirements 3.1, 3.2**

## Error Handling

### Backend Error Responses

1. **Route Not Found (404)**
   - Current: Generic "API endpoint not found"
   - Fixed: Include requested path and available routes

2. **Authentication Required (401)**
   - Current: "Authentication required. Please login."
   - Keep as is - clear and actionable

3. **Server Error (500)**
   - Current: Generic error message
   - Fixed: Include error type and troubleshooting hint

### Frontend Error Handling

1. **Network Errors**
   - Display user-friendly message
   - Provide manual retry button
   - Don't auto-retry

2. **404 Errors**
   - Log full error details
   - Show "Service temporarily unavailable"
   - Suggest refreshing page

3. **Auth Errors**
   - Clear cart state
   - Redirect to login if needed
   - Don't retry

## Testing Strategy

### Unit Tests
- Test cart route module exports correctly
- Test route registration order
- Test CartContext retry logic
- Test error state management

### Integration Tests
- Test full cart API flow from frontend to database
- Test authentication middleware
- Test error responses
- Test 404 handler doesn't catch valid routes

### Manual Testing
1. Start backend and verify cart routes log
2. Call `/api/cart/test` endpoint
3. Call `/api/cart` with valid auth token
4. Call `/api/cart` without auth token
5. Monitor frontend console for infinite loops
6. Verify cart loads once on dashboard mount

## Implementation Plan

### Phase 1: Backend Fixes
1. Add route verification logging to cart.js
2. Add test endpoint to cart routes
3. Verify module.exports placement
4. Add request logging middleware for cart routes
5. Improve 404 handler to log requested path

### Phase 2: Frontend Fixes
1. Add retry counter to CartContext
2. Add max retry limit (3 attempts)
3. Remove automatic retries on error
4. Add manual retry button to UI
5. Check authentication before making requests

### Phase 3: Testing & Verification
1. Deploy backend changes to Render
2. Test all cart endpoints
3. Monitor frontend console
4. Verify no infinite loops
5. Test error scenarios

## Deployment Notes

1. Backend changes require Render redeployment
2. Frontend changes require Netlify rebuild
3. Clear browser cache after deployment
4. Monitor Render logs for route registration
5. Test with production database
