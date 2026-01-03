# Design Document: Cart API Endpoint Alignment Fix

## Overview

This design addresses the production issue where cart, favorites, and plans API endpoints return 404 errors causing React frontend crashes. The solution involves auditing and fixing backend route definitions, implementing consistent API response formats, and adding defensive error handling in React Contexts.

## Architecture

### Current State
- Backend: Express.js server with routes mounted at `/api/cart`, `/api/favorites`, `/api/plans`
- Frontend: React with Context API (CartContext, FavoritesContext, TripsContext)
- Database: PostgreSQL with connection confirmed working
- Deployment: Backend on Render, Frontend on Netlify

### Problem Analysis
1. **Missing Route Handlers**: Backend route files may not define handlers for paths frontend expects (e.g., `/` for GET, `/add` for POST)
2. **Inconsistent Response Formats**: Some endpoints return different JSON structures
3. **Poor Error Handling**: Frontend Contexts don't defensively handle API failures
4. **React Error #321**: Occurs when Context tries to iterate over undefined/null data

### Solution Approach
1. Audit all three route files (cart.js, favorites.js, plans.js) to identify missing endpoints
2. Implement missing route handlers with consistent response format
3. Add try-catch blocks and error handling in all route handlers
4. Improve frontend Context error handling with defensive checks
5. Ensure authentication middleware is properly applied

## Components and Interfaces

### Backend Route Structure

Each route file should follow this pattern:

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// GET / - Fetch all items for user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    // Database query
    const items = await fetchItems(userId);
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch items',
      message: error.message 
    });
  }
});

// POST /add - Add new item
router.post('/add', async (req, res) => {
  try {
    const userId = req.user.id;
    const itemData = req.body;
    
    // Validation
    if (!itemData || !itemData.serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Database insert
    const newItem = await addItem(userId, itemData);
    res.json({ success: true, data: newItem });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add item',
      message: error.message 
    });
  }
});

// DELETE /:id - Remove item
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    
    const result = await deleteItem(userId, itemId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete item',
      message: error.message 
    });
  }
});

module.exports = router;
```

### Frontend Context Pattern

Each Context should follow this defensive pattern:

```javascript
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      // Defensive checks
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }

      if (data.success === false) {
        throw new Error(data.message || data.error || 'Failed to fetch cart');
      }

      // Ensure data.data is an array
      const cartItems = Array.isArray(data.data) ? data.data : [];
      setCart(cartItems);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message);
      setCart([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addToCart = useCallback(async (item) => {
    if (!user) {
      throw new Error('Must be logged in to add to cart');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });

      const data = await response.json();

      if (!data || data.success === false) {
        throw new Error(data?.message || data?.error || 'Failed to add to cart');
      }

      // Refresh cart after adding
      await fetchCart();
      return data.data;
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchCart]);

  const removeFromCart = useCallback(async (itemId) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!data || data.success === false) {
        throw new Error(data?.message || data?.error || 'Failed to remove from cart');
      }

      // Refresh cart after removing
      await fetchCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchCart]);

  // Fetch cart on mount and when user changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value = {
    cart: cart || [], // Always provide array
    loading,
    error,
    addToCart,
    removeFromCart,
    refreshCart: fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
```

## Data Models

### API Response Format

All endpoints must return this consistent structure:

```typescript
// Success Response
interface SuccessResponse<T> {
  success: true;
  data: T;
}

// Error Response
interface ErrorResponse {
  success: false;
  message?: string;  // User-friendly error message
  error?: string;    // Technical error details
}

// Combined Response Type
type APIResponse<T> = SuccessResponse<T> | ErrorResponse;
```

### Cart Item Structure

```typescript
interface CartItem {
  id: number;
  user_id: number;
  service_id: number;
  quantity: number;
  created_at: string;
  service?: {
    id: number;
    name: string;
    price: number;
    provider_name: string;
    // ... other service fields
  };
}
```

### Favorites Item Structure

```typescript
interface FavoriteItem {
  id: number;
  user_id: number;
  service_id: number;
  created_at: string;
  service?: {
    // ... service fields
  };
}
```

### Plan Structure

```typescript
interface Plan {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  services: number[]; // Array of service IDs
  created_at: string;
  updated_at: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Response Format Consistency
*For any* API endpoint call (cart, favorites, or plans), the response should always contain a `success` boolean field and either a `data` field (when success is true) or a `message`/`error` field (when success is false).
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 2: Authentication Protection
*For any* protected endpoint call without valid authentication, the API should return a 401 status with `{ success: false, message: "Authentication required" }` and not execute the route handler logic.
**Validates: Requirements 6.1, 6.3, 6.4**

### Property 3: Database Error Handling
*For any* database operation that throws an error, the route handler should catch the error, log it, and return a 500 status with `{ success: false, error: <message> }` without crashing the server.
**Validates: Requirements 7.1, 7.2, 7.4**

### Property 4: Frontend Null Safety
*For any* API response in a React Context, if the response is null, undefined, or missing expected fields, the Context should set a safe default value (empty array for lists, null for objects) and not cause a rendering error.
**Validates: Requirements 8.1, 8.2, 8.3**

### Property 5: Cart Operations Idempotency
*For any* cart item, calling GET /api/cart after POST /api/cart/add should include the newly added item, and calling GET /api/cart after DELETE /api/cart/:id should not include the deleted item.
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 6: Error State Management
*For any* failed API call in a React Context, the Context should set an error state, log the error to console, and maintain the previous valid data state (not set to undefined) so components can still render.
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 7: Concurrent Request Handling
*For any* sequence of rapid API calls (e.g., multiple add-to-cart clicks), the Context should handle responses in order or use the latest response, preventing race conditions that could corrupt state.
**Validates: Requirements 8.4**

### Property 8: Component Unmount Safety
*For any* API call in progress when a component unmounts, the Context should either cancel the request or ignore the response to prevent "setState on unmounted component" warnings.
**Validates: Requirements 8.5**

## Error Handling

### Backend Error Handling Strategy

1. **Route-Level Try-Catch**: Every route handler wrapped in try-catch
2. **Validation Errors**: Return 400 status with descriptive message
3. **Authentication Errors**: Return 401 status with auth message
4. **Not Found Errors**: Return 404 status with not found message
5. **Database Errors**: Return 500 status with generic error (log details server-side)
6. **Unexpected Errors**: Catch-all error handler returns 500 status

### Frontend Error Handling Strategy

1. **API Call Wrapper**: All fetch calls wrapped in try-catch
2. **Response Validation**: Check for success field before using data
3. **Default Values**: Always provide safe defaults ([], null, etc.)
4. **Error State**: Maintain separate error state in Context
5. **User Feedback**: Display error messages in UI
6. **Error Boundary**: Top-level ErrorBoundary catches rendering errors
7. **Cleanup**: Use useEffect cleanup to handle unmounted components

### Error Boundary Implementation

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Backend Route Tests**:
   - Test each endpoint with valid authentication
   - Test endpoints without authentication (should return 401)
   - Test endpoints with invalid data (should return 400)
   - Test endpoints with non-existent IDs (should return 404)
   - Test database error scenarios (mock database failures)

2. **Frontend Context Tests**:
   - Test Context with successful API responses
   - Test Context with failed API responses
   - Test Context with malformed responses
   - Test Context with null/undefined responses
   - Test Context when user is not authenticated
   - Test concurrent API calls
   - Test component unmount during API call

3. **Integration Tests**:
   - Test full flow: login → add to cart → fetch cart → remove from cart
   - Test error recovery: failed add → retry → success
   - Test authentication expiry handling

### Property-Based Tests

Property tests will verify universal properties across all inputs (minimum 100 iterations each):

1. **Property Test 1: Response Format Consistency**
   - Generate random valid/invalid requests
   - Verify all responses have `success` field
   - Verify success=true responses have `data` field
   - Verify success=false responses have `message` or `error` field
   - **Feature: cart-api-endpoint-alignment-fix, Property 1: API Response Format Consistency**

2. **Property Test 2: Authentication Protection**
   - Generate random requests with/without auth tokens
   - Verify unauthenticated requests return 401
   - Verify authenticated requests proceed to handler
   - **Feature: cart-api-endpoint-alignment-fix, Property 2: Authentication Protection**

3. **Property Test 3: Database Error Handling**
   - Mock random database failures
   - Verify all failures return 500 with error message
   - Verify server doesn't crash
   - **Feature: cart-api-endpoint-alignment-fix, Property 3: Database Error Handling**

4. **Property Test 4: Frontend Null Safety**
   - Generate random malformed API responses
   - Verify Context never sets state to undefined
   - Verify no rendering errors occur
   - **Feature: cart-api-endpoint-alignment-fix, Property 4: Frontend Null Safety**

5. **Property Test 5: Cart Operations Idempotency**
   - Generate random cart items
   - Add item, verify it appears in GET
   - Delete item, verify it doesn't appear in GET
   - **Feature: cart-api-endpoint-alignment-fix, Property 5: Cart Operations Idempotency**

### Testing Framework

- **Backend**: Jest with Supertest for API testing
- **Frontend**: Jest with React Testing Library
- **Property Testing**: fast-check library for JavaScript
- **Integration**: Playwright or Cypress for end-to-end tests

### Test Configuration

Each property test configured to run 100+ iterations:

```javascript
import fc from 'fast-check';

describe('Property Tests', () => {
  it('Property 1: API Response Format Consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          endpoint: fc.constantFrom('/api/cart', '/api/favorites', '/api/plans'),
          method: fc.constantFrom('GET', 'POST', 'DELETE'),
          authenticated: fc.boolean()
        }),
        async (testCase) => {
          const response = await makeRequest(testCase);
          expect(response).toHaveProperty('success');
          if (response.success) {
            expect(response).toHaveProperty('data');
          } else {
            expect(response).toHaveProperty('message');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Implementation Notes

### Priority Order

1. **Critical (Must Fix First)**:
   - Fix missing route handlers in cart.js, favorites.js, plans.js
   - Add try-catch blocks to all route handlers
   - Implement consistent response format

2. **High Priority**:
   - Add defensive checks in React Contexts
   - Improve Error Boundary
   - Add loading and error states

3. **Medium Priority**:
   - Add comprehensive error logging
   - Implement request cancellation on unmount
   - Add retry logic for failed requests

### Deployment Strategy

1. Deploy backend fixes first (route handlers + error handling)
2. Test backend endpoints directly with curl/Postman
3. Deploy frontend fixes (Context error handling)
4. Test full integration in production
5. Monitor error logs for any remaining issues

### Rollback Plan

If issues occur after deployment:
1. Backend: Revert to previous Render deployment
2. Frontend: Revert to previous Netlify deployment
3. Both services have automatic rollback capabilities
