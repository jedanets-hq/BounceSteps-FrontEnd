# Design Document: Persistent Data Storage Fix

## Overview

This design addresses the critical issue of user data loss when browsers are refreshed or cache is cleared. Currently, cart items and journey plans are stored only in localStorage, while bookings are only persisted after pre-order submission. This design implements a complete data persistence layer using PostgreSQL with real-time synchronization between frontend and backend.

The solution follows a dual-storage pattern: primary storage in PostgreSQL for durability and cross-device access, with localStorage as a cache for offline access and performance optimization.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  CartContext / JourneyPlanContext                            │
│  ├─ Manages local state                                      │
│  ├─ Syncs with localStorage (cache)                          │
│  └─ Calls API endpoints                                      │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/REST API
┌────────────────▼────────────────────────────────────────────┐
│                  Backend (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────┤
│  API Routes                                                  │
│  ├─ /cart (POST, GET, PUT, DELETE)                          │
│  ├─ /journey-plans (POST, GET, PUT, DELETE)                 │
│  └─ Authentication & Validation Middleware                  │
└────────────────┬────────────────────────────────────────────┘
                 │ SQL Queries
┌────────────────▼────────────────────────────────────────────┐
│              PostgreSQL Database                             │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                     │
│  ├─ cart_items (id, traveler_id, service_id, quantity...)   │
│  ├─ journey_plans (id, traveler_id, country, services...)   │
│  └─ Existing tables (users, services, bookings, etc.)       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
User Action (Add to Cart)
    ↓
CartContext.addToCart()
    ↓
API Call: POST /cart
    ↓
Backend Validation
    ↓
Save to PostgreSQL cart_items table
    ↓
Return created item with ID
    ↓
Update CartContext state
    ↓
Update localStorage cache
    ↓
UI Re-render
```

## Components and Interfaces

### 1. Database Layer

#### Cart Items Table
```sql
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  traveler_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  booking_date DATE,
  participants INTEGER,
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(traveler_id, service_id)
);

CREATE INDEX idx_cart_traveler ON cart_items(traveler_id);
CREATE INDEX idx_cart_service ON cart_items(service_id);
```

#### Journey Plans Table
```sql
CREATE TABLE journey_plans (
  id SERIAL PRIMARY KEY,
  traveler_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country VARCHAR(100),
  region VARCHAR(100),
  district VARCHAR(100),
  area VARCHAR(100),
  services JSONB NOT NULL DEFAULT '[]',
  travelers_count INTEGER NOT NULL DEFAULT 1,
  total_cost DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending_payment',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journey_traveler ON journey_plans(traveler_id);
CREATE INDEX idx_journey_status ON journey_plans(status);
```

### 2. Backend Models

#### CartItem Model
```javascript
class CartItem {
  static async create(traveler_id, service_id, quantity, booking_date, participants, special_requests)
  static async findByTravelerId(traveler_id)
  static async findById(id)
  static async update(id, data)
  static async delete(id)
  static async deleteByTravelerId(traveler_id)
  static async findByTravelerAndService(traveler_id, service_id)
}
```

#### JourneyPlan Model
```javascript
class JourneyPlan {
  static async create(traveler_id, data)
  static async findByTravelerId(traveler_id)
  static async findById(id)
  static async update(id, data)
  static async delete(id)
  static async updateStatus(id, status)
}
```

### 3. Backend API Routes

#### Cart Routes (`/cart`)
```
POST /cart
  - Body: { service_id, quantity, booking_date, participants, special_requests }
  - Returns: { success, cartItem }
  - Auth: Required

GET /cart
  - Returns: { success, cartItems }
  - Auth: Required

PUT /cart/:itemId
  - Body: { quantity, booking_date, participants, special_requests }
  - Returns: { success, cartItem }
  - Auth: Required

DELETE /cart/:itemId
  - Returns: { success }
  - Auth: Required

DELETE /cart
  - Returns: { success }
  - Auth: Required
```

#### Journey Plans Routes (`/journey-plans`)
```
POST /journey-plans
  - Body: { country, region, district, area, services, travelers_count, total_cost }
  - Returns: { success, journeyPlan }
  - Auth: Required

GET /journey-plans
  - Returns: { success, journeyPlans }
  - Auth: Required

GET /journey-plans/:id
  - Returns: { success, journeyPlan }
  - Auth: Required

PUT /journey-plans/:id
  - Body: { country, region, district, area, services, travelers_count, total_cost, status }
  - Returns: { success, journeyPlan }
  - Auth: Required

DELETE /journey-plans/:id
  - Returns: { success }
  - Auth: Required
```

### 4. Frontend Context Updates

#### CartContext Changes
```javascript
// New functions to add:
- fetchCartFromBackend() // Load cart from API on mount
- syncCartToBackend(action, data) // Sync changes to API
- handleCartError(error) // Retry logic and error handling
- migrateLocalStorageToBackend() // Migrate old localStorage data

// Modified functions:
- addToCart() // Now calls API
- removeFromCart() // Now calls API
- updateQuantity() // Now calls API
- clearCart() // Now calls API
```

#### JourneyPlanContext (New)
```javascript
// New context for journey plans:
- journeyPlans: []
- isLoading: false
- error: null

// Functions:
- fetchJourneyPlans() // Load from API
- createJourneyPlan(data) // Save to API
- updateJourneyPlan(id, data) // Update in API
- deleteJourneyPlan(id) // Delete from API
- syncToBackend() // Sync offline changes
```

### 5. API Client Updates

#### New API Methods in `src/utils/api.js`
```javascript
// Cart API
export const cartAPI = {
  create: (data) => POST('/cart', data),
  getAll: () => GET('/cart'),
  update: (id, data) => PUT(`/cart/${id}`, data),
  delete: (id) => DELETE(`/cart/${id}`),
  clear: () => DELETE('/cart')
};

// Journey Plans API
export const journeyPlansAPI = {
  create: (data) => POST('/journey-plans', data),
  getAll: () => GET('/journey-plans'),
  getById: (id) => GET(`/journey-plans/${id}`),
  update: (id, data) => PUT(`/journey-plans/${id}`, data),
  delete: (id) => DELETE(`/journey-plans/${id}`)
};
```

## Data Models

### Cart Item Data Structure
```javascript
{
  id: number,
  traveler_id: number,
  service_id: number,
  quantity: number,
  booking_date: string (ISO date),
  participants: number,
  special_requests: string,
  created_at: string (ISO timestamp),
  updated_at: string (ISO timestamp),
  // Populated fields from service:
  service_title?: string,
  service_price?: number,
  service_category?: string
}
```

### Journey Plan Data Structure
```javascript
{
  id: number,
  traveler_id: number,
  country: string,
  region: string,
  district: string,
  area: string,
  services: [
    {
      id: number,
      title: string,
      category: string,
      price: number,
      provider_id: number
    }
  ],
  travelers_count: number,
  total_cost: number,
  status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled',
  created_at: string (ISO timestamp),
  updated_at: string (ISO timestamp)
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Cart Item Persistence Round Trip
**For any** cart item added to the database, fetching the cart should return the same item with identical data (round-trip property).

**Validates: Requirements 1.1, 1.2**

### Property 2: Cart Item Quantity Invariant
**For any** cart item, the quantity stored in the database should always match the quantity in the frontend state after an update operation.

**Validates: Requirements 1.4**

### Property 3: Journey Plan Persistence Round Trip
**For any** journey plan saved to the database, fetching the plan should return the same plan with identical data (round-trip property).

**Validates: Requirements 2.1, 2.2**

### Property 4: Cart Deletion Idempotence
**For any** cart item, deleting it multiple times should result in the same final state (item not in database) without errors.

**Validates: Requirements 1.3, 1.5**

### Property 5: Journey Plan Status Transition
**For any** journey plan, updating the status should persist the new status to the database and subsequent fetches should return the updated status.

**Validates: Requirements 2.7**

### Property 6: Cross-Device Cart Consistency
**For any** traveler with cart items in the database, accessing the application from a different device should load the exact same cart items.

**Validates: Requirements 1.6**

### Property 7: API Error Handling
**For any** invalid cart or journey plan data, the API should return a 400 Bad Request error with specific field validation errors.

**Validates: Requirements 3.12, 7.5**

### Property 8: Authentication Enforcement
**For any** cart or journey plan API request without valid authentication, the API should return 401 Unauthorized.

**Validates: Requirements 3.11, 7.6**

### Property 9: Data Isolation
**For any** traveler, they should only be able to access their own cart items and journey plans, not other travelers' data.

**Validates: Requirements 7.6**

### Property 10: Cascade Delete on User Deletion
**For any** traveler deleted from the system, all their cart items and journey plans should be automatically deleted from the database.

**Validates: Requirements 4.5**

## Error Handling

### Frontend Error Handling Strategy

1. **API Call Failures**
   - Retry up to 3 times with exponential backoff (1s, 2s, 4s)
   - Show user-friendly error message after 3 failed attempts
   - Fall back to localStorage data if available
   - Log error with full context for debugging

2. **Validation Errors**
   - Display field-specific error messages
   - Prevent submission of invalid data
   - Highlight invalid fields in UI

3. **Network Offline**
   - Detect offline status using navigator.onLine
   - Queue operations for sync when online
   - Display "offline mode" indicator
   - Sync queued operations when connection restored

4. **Data Conflicts**
   - When syncing offline changes, compare timestamps
   - Use most recent data (server wins)
   - Notify user of any data conflicts

### Backend Error Handling Strategy

1. **Validation Errors**
   - Return 400 Bad Request with field-specific errors
   - Log validation failures for monitoring
   - Include helpful error messages

2. **Authentication Errors**
   - Return 401 Unauthorized for missing/invalid tokens
   - Return 403 Forbidden for unauthorized access to other users' data

3. **Database Errors**
   - Log full error context
   - Return 500 Internal Server Error with generic message
   - Implement retry logic for transient failures
   - Alert admin if critical errors occur

4. **Cascade Delete Failures**
   - Ensure referential integrity with ON DELETE CASCADE
   - Log any cascade delete operations
   - Verify data consistency after deletes

## Testing Strategy

### Unit Tests

**Frontend Cart Context Tests**
- Test addToCart() with valid service data
- Test removeFromCart() with existing item
- Test updateQuantity() with various quantities
- Test clearCart() empties all items
- Test localStorage sync on mount
- Test error handling with failed API calls
- Test retry logic with exponential backoff

**Frontend Journey Plans Tests**
- Test createJourneyPlan() with valid data
- Test updateJourneyPlan() with status changes
- Test deleteJourneyPlan() removes from state
- Test fetchJourneyPlans() loads from API
- Test localStorage cache updates

**Backend Cart Routes Tests**
- Test POST /cart creates item in database
- Test GET /cart returns user's items
- Test PUT /cart/:id updates quantity
- Test DELETE /cart/:id removes item
- Test DELETE /cart clears all items
- Test authentication enforcement
- Test data validation

**Backend Journey Plans Routes Tests**
- Test POST /journey-plans creates plan
- Test GET /journey-plans returns user's plans
- Test PUT /journey-plans/:id updates plan
- Test DELETE /journey-plans/:id removes plan
- Test status transitions
- Test authentication enforcement

### Property-Based Tests

**Property 1: Cart Item Persistence Round Trip**
- Generate random cart items with valid data
- Save to database via API
- Fetch from database
- Verify returned data matches original

**Property 2: Cart Item Quantity Invariant**
- Generate random quantities (1-100)
- Update cart item quantity
- Fetch from database
- Verify quantity matches

**Property 3: Journey Plan Persistence Round Trip**
- Generate random journey plans with valid data
- Save to database via API
- Fetch from database
- Verify returned data matches original

**Property 4: Cart Deletion Idempotence**
- Create cart item
- Delete it multiple times
- Verify no errors and item remains deleted

**Property 5: Journey Plan Status Transition**
- Create journey plan with status 'pending_payment'
- Update to 'confirmed'
- Fetch and verify status
- Update to 'completed'
- Fetch and verify status

**Property 6: Cross-Device Cart Consistency**
- Create cart items for traveler
- Fetch from API as different "device"
- Verify same items returned

**Property 7: API Error Handling**
- Send invalid data to cart API
- Verify 400 Bad Request returned
- Verify error message contains field name

**Property 8: Authentication Enforcement**
- Send request without authentication token
- Verify 401 Unauthorized returned
- Send request with invalid token
- Verify 401 Unauthorized returned

**Property 9: Data Isolation**
- Create cart items for traveler A
- Attempt to fetch as traveler B
- Verify traveler B cannot access traveler A's data

**Property 10: Cascade Delete on User Deletion**
- Create traveler with cart items and journey plans
- Delete traveler from database
- Verify all cart items deleted
- Verify all journey plans deleted

### Integration Tests

- Test complete cart flow: add → update → remove → clear
- Test complete journey plan flow: create → update → delete
- Test offline sync: add items offline → go online → verify synced
- Test data migration: localStorage → database
- Test cross-component communication: CartContext → API → Database

## Migration Strategy

### Phase 1: Database Setup
1. Create cart_items table
2. Create journey_plans table
3. Create indexes for performance
4. Run migrations on production

### Phase 2: Backend Implementation
1. Create CartItem model
2. Create JourneyPlan model
3. Create cart API routes
4. Create journey-plans API routes
5. Add authentication middleware
6. Add validation middleware
7. Deploy to production

### Phase 3: Frontend Implementation
1. Update CartContext to use API
2. Create JourneyPlanContext
3. Update journey planner component
4. Add error handling and retry logic
5. Add offline support
6. Deploy to production

### Phase 4: Data Migration
1. Migrate existing localStorage data to database
2. Verify data integrity
3. Monitor for issues
4. Keep localStorage as cache

## Performance Considerations

1. **Database Indexes**
   - Index on traveler_id for fast lookups
   - Index on service_id for cascade deletes
   - Index on status for journey plans

2. **API Optimization**
   - Batch operations where possible
   - Use pagination for large result sets
   - Cache frequently accessed data

3. **Frontend Optimization**
   - Use localStorage as cache to reduce API calls
   - Debounce rapid updates
   - Lazy load journey plans

4. **Database Optimization**
   - Use connection pooling
   - Implement query optimization
   - Monitor slow queries

## Security Considerations

1. **Authentication**
   - All endpoints require JWT authentication
   - Verify user owns the data they're accessing

2. **Authorization**
   - Users can only access their own cart and plans
   - Implement row-level security if needed

3. **Data Validation**
   - Validate all input on backend
   - Sanitize data before storing
   - Use parameterized queries to prevent SQL injection

4. **Rate Limiting**
   - Implement rate limiting on API endpoints
   - Prevent abuse of cart/plan operations

