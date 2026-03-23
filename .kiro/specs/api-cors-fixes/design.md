# Design Document: API CORS and Connectivity Fixes

## Overview

This design addresses systematic API connectivity issues between the iSafari frontend and backend. The solution involves three main components: (1) expanding CORS header allowlist to include standard cache-control headers, (2) implementing missing public API endpoints for homepage features, and (3) ensuring proper error handling and response formatting.

The current CORS configuration only allows `Content-Type` and `Authorization` headers, which blocks legitimate browser requests that include cache-control headers like `expires`, `cache-control`, and `pragma`. Additionally, the frontend expects three public endpoints that don't currently exist: recent activity feed, trusted partners list, and trust statistics.

## Architecture

### System Components

```
┌─────────────────┐         HTTP/CORS        ┌──────────────────┐
│                 │◄────────────────────────►│                  │
│  React Frontend │                          │  Express Backend │
│  (Port 4028)    │                          │  (Port 5000)     │
│                 │                          │                  │
└─────────────────┘                          └────────┬─────────┘
                                                      │
                                                      │ SQL
                                                      ▼
                                              ┌──────────────┐
                                              │  PostgreSQL  │
                                              │   Database   │
                                              └──────────────┘
```

### CORS Flow

```
Browser                    Backend
   │                          │
   │──OPTIONS (preflight)────►│
   │  Origin: localhost:4028  │
   │  Headers: expires, ...   │
   │                          │
   │◄─────200 OK──────────────│
   │  Access-Control-Allow-   │
   │  Headers: expires, ...   │
   │                          │
   │──GET /api/bookings/...──►│
   │  expires: ...            │
   │                          │
   │◄─────200 OK──────────────│
   │  {data}                  │
   │                          │
```

## Components and Interfaces

### 1. CORS Configuration Module

**Location**: `backend/server.js`

**Current Implementation**:
```javascript
const corsOptions = {
  origin: function (origin, callback) { /* ... */ },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']  // ← TOO RESTRICTIVE
};
```

**Updated Implementation**:
```javascript
const corsOptions = {
  origin: function (origin, callback) { /* ... existing logic ... */ },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    // Cache control headers
    'Cache-Control',
    'Pragma',
    'Expires',
    // Conditional request headers
    'If-None-Match',
    'If-Modified-Since',
    'If-Match',
    'If-Unmodified-Since',
    // Other common headers
    'Accept',
    'Accept-Language',
    'Content-Language'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400  // Cache preflight for 24 hours
};
```

**Interface**:
- Input: HTTP request with Origin header
- Output: CORS headers in response
- Side Effects: None

### 2. Public Recent Activity Endpoint

**Location**: `backend/routes/bookings.js`

**Route**: `GET /api/bookings/public/recent-activity`

**Query Parameters**:
- `limit` (optional, number): Maximum number of activities to return (default: 20, max: 100)

**Response Format**:
```typescript
{
  success: boolean;
  activities: Array<{
    id: string;              // Anonymized booking ID
    date: string;            // ISO 8601 date
    category: string;        // Service category
    location: string;        // City/region only (no specific addresses)
    participants: number;    // Number of participants
    status: string;          // 'completed' | 'confirmed'
  }>;
  count: number;
}
```

**Implementation Logic**:
1. Query bookings table for recent completed/confirmed bookings
2. Filter out sensitive information (names, emails, phone numbers, specific addresses)
3. Include only: booking date, service category, general location, participant count
4. Order by created_at DESC
5. Apply limit (default 20, max 100)
6. Return anonymized data

**SQL Query**:
```sql
SELECT 
  b.id,
  b.created_at as date,
  b.service_type as category,
  s.location,
  b.participants,
  b.status
FROM bookings b
LEFT JOIN services s ON b.service_id = s.id
WHERE b.status IN ('completed', 'confirmed')
ORDER BY b.created_at DESC
LIMIT $1
```

### 3. Trusted Partners Endpoint

**Location**: `backend/routes/admin.js` (new file) or `backend/routes/providers.js`

**Route**: `GET /api/admin/trusted-partners`

**Response Format**:
```typescript
{
  success: boolean;
  partners: Array<{
    id: number;
    business_name: string;
    rating: number;
    is_verified: boolean;
    service_categories: string[];
    location: string;
    total_bookings: number;
  }>;
  count: number;
}
```

**Implementation Logic**:
1. Query service_providers table for verified providers
2. Join with users table to get verification status
3. Calculate or retrieve rating and booking count
4. Filter: is_verified = true
5. Order by rating DESC, then total_bookings DESC
6. Limit to 15 providers
7. Return public provider information

**SQL Query**:
```sql
SELECT 
  sp.id,
  sp.business_name,
  sp.rating,
  sp.is_verified,
  sp.service_categories,
  sp.location,
  COUNT(b.id) as total_bookings
FROM service_providers sp
INNER JOIN users u ON sp.user_id = u.id
LEFT JOIN bookings b ON sp.id = b.provider_id
WHERE sp.is_verified = true AND u.is_active = true
GROUP BY sp.id
ORDER BY sp.rating DESC, total_bookings DESC
LIMIT 15
```

### 4. Public Trust Statistics Endpoint

**Location**: `backend/routes/admin.js` (new file) or `backend/server.js`

**Route**: `GET /api/admin/public/trust-stats`

**Response Format**:
```typescript
{
  success: boolean;
  stats: {
    verified_providers: number;
    completed_bookings: number;
    average_rating: number;
    active_users: number;
  };
}
```

**Implementation Logic**:
1. Execute parallel queries for each statistic
2. Count verified providers from service_providers table
3. Count completed bookings from bookings table
4. Calculate average rating from service_providers table
5. Count active users from users table
6. Return aggregated statistics

**SQL Queries**:
```sql
-- Verified providers
SELECT COUNT(*) FROM service_providers WHERE is_verified = true;

-- Completed bookings
SELECT COUNT(*) FROM bookings WHERE status = 'completed';

-- Average rating
SELECT AVG(rating) FROM service_providers WHERE is_verified = true;

-- Active users
SELECT COUNT(*) FROM users WHERE is_active = true;
```

### 5. Admin Routes Module

**Location**: `backend/routes/admin.js` (new file)

**Purpose**: Centralize public admin/platform statistics endpoints

**Routes**:
- `GET /api/admin/trusted-partners` - Public trusted partners list
- `GET /api/admin/public/trust-stats` - Public platform statistics

**Registration** in `backend/server.js`:
```javascript
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);
```

## Data Models

### Anonymized Activity Model

```typescript
interface AnonymizedActivity {
  id: string;              // Hashed or truncated booking ID
  date: string;            // ISO 8601 timestamp
  category: string;        // Service category (e.g., "Safari", "Accommodation")
  location: string;        // General location (city/region only)
  participants: number;    // Number of participants
  status: 'completed' | 'confirmed';
}
```

**Anonymization Rules**:
- No user names, emails, or phone numbers
- No specific addresses (only city/region)
- No provider-specific information
- Booking IDs can be shown (they're not personally identifiable)

### Trusted Partner Model

```typescript
interface TrustedPartner {
  id: number;
  business_name: string;
  rating: number;          // 0-5 scale
  is_verified: boolean;    // Always true for this endpoint
  service_categories: string[];
  location: string;
  total_bookings: number;
}
```

### Trust Statistics Model

```typescript
interface TrustStats {
  verified_providers: number;
  completed_bookings: number;
  average_rating: number;  // 0-5 scale
  active_users: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Limit Parameter Controls Response Size

*For any* valid limit parameter value between 1 and 100, the recent activity endpoint should return at most that many activities.

**Validates: Requirements 2.2**

### Property 2: Activity Data Is Anonymized

*For any* activity returned by the recent activity endpoint, it should not contain sensitive user information (full names, emails, phone numbers, specific addresses).

**Validates: Requirements 2.4**

### Property 3: Activities Contain Required Fields

*For any* activity in the response, it should contain all required fields: id, date, category, location, participants, and status.

**Validates: Requirements 2.5**

### Property 4: Activities Are Ordered By Date Descending

*For any* list of activities returned, each activity's date should be greater than or equal to the next activity's date (most recent first).

**Validates: Requirements 2.6**

### Property 5: Trusted Partners Are All Verified

*For any* provider in the trusted partners response, the is_verified field should be true.

**Validates: Requirements 3.2, 3.4**

### Property 6: Trusted Partners Contain Required Fields

*For any* trusted partner in the response, it should contain all required fields: business_name, rating, and is_verified.

**Validates: Requirements 3.3**

### Property 7: 404 Responses Are Properly Formatted

*For any* request to a non-existent endpoint, the response should have status 404, contain JSON with success: false, include a message field, and not expose internal server details.

**Validates: Requirements 5.1, 5.2, 5.3, 5.5**

### Property 8: OPTIONS Requests Return Proper CORS Headers

*For any* OPTIONS preflight request from an allowed origin, the response should include Access-Control-Allow-Methods, Access-Control-Allow-Headers, Access-Control-Allow-Origin, and Access-Control-Max-Age headers.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

## Error Handling

### CORS Errors

**Scenario**: Request from unauthorized origin
- **Response**: 403 Forbidden (handled by CORS middleware)
- **Logging**: Log blocked origin in development mode
- **User Impact**: Request fails with CORS error in browser console

**Scenario**: Missing required CORS headers
- **Response**: 400 Bad Request
- **Logging**: Log missing headers
- **User Impact**: Clear error message about missing headers

### Endpoint Errors

**Scenario**: Non-existent endpoint
- **Response**: 404 Not Found with JSON body
- **Body**: `{ success: false, message: "Endpoint not found" }`
- **Logging**: Log requested path for debugging
- **User Impact**: Clear indication that endpoint doesn't exist

**Scenario**: Database query failure
- **Response**: 500 Internal Server Error
- **Body**: `{ success: false, message: "Failed to fetch data" }`
- **Logging**: Log full error with stack trace
- **User Impact**: Generic error message (no internal details exposed)

### Data Validation Errors

**Scenario**: Invalid limit parameter (< 1 or > 100)
- **Response**: 400 Bad Request
- **Body**: `{ success: false, message: "Limit must be between 1 and 100" }`
- **Logging**: Log invalid parameter value
- **User Impact**: Clear validation error message

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Together they provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness

### Unit Testing

**CORS Configuration Tests**:
- Test preflight request with cache-control headers succeeds
- Test preflight request with conditional headers succeeds
- Test request with 'expires' header doesn't cause CORS error
- Test existing Content-Type and Authorization headers still work
- Test OPTIONS request returns correct CORS headers

**Endpoint Existence Tests**:
- Test `/api/bookings/public/recent-activity` returns 200
- Test `/api/admin/trusted-partners` returns 200
- Test `/api/admin/public/trust-stats` returns 200
- Test all endpoints accessible without authentication
- Test non-existent endpoint returns 404

**Response Format Tests**:
- Test recent activity response has correct structure
- Test trusted partners response has correct structure
- Test trust stats response has correct structure
- Test default limit of 20 for recent activity
- Test trust stats contains all required fields

**Error Handling Tests**:
- Test 404 response format
- Test invalid limit parameter returns 400
- Test database error returns 500
- Test CORS error for unauthorized origin

### Property-Based Testing

**Configuration**: Use `fast-check` library for JavaScript/TypeScript property-based testing. Each test should run minimum 100 iterations.

**Property Test 1: Limit Parameter Controls Response Size**
```javascript
// Feature: api-cors-fixes, Property 1: Limit parameter controls response size
fc.assert(
  fc.property(
    fc.integer({ min: 1, max: 100 }),
    async (limit) => {
      const response = await fetch(
        `${API_URL}/bookings/public/recent-activity?limit=${limit}`
      );
      const data = await response.json();
      return data.activities.length <= limit;
    }
  ),
  { numRuns: 100 }
);
```

**Property Test 2: Activity Data Is Anonymized**
```javascript
// Feature: api-cors-fixes, Property 2: Activity data is anonymized
fc.assert(
  fc.property(
    fc.constant(null),
    async () => {
      const response = await fetch(
        `${API_URL}/bookings/public/recent-activity`
      );
      const data = await response.json();
      return data.activities.every(activity => 
        !activity.user_name &&
        !activity.email &&
        !activity.phone &&
        !activity.full_address
      );
    }
  ),
  { numRuns: 100 }
);
```

**Property Test 3: Activities Contain Required Fields**
```javascript
// Feature: api-cors-fixes, Property 3: Activities contain required fields
fc.assert(
  fc.property(
    fc.constant(null),
    async () => {
      const response = await fetch(
        `${API_URL}/bookings/public/recent-activity`
      );
      const data = await response.json();
      const requiredFields = ['id', 'date', 'category', 'location', 'participants', 'status'];
      return data.activities.every(activity =>
        requiredFields.every(field => activity.hasOwnProperty(field))
      );
    }
  ),
  { numRuns: 100 }
);
```

**Property Test 4: Activities Are Ordered By Date Descending**
```javascript
// Feature: api-cors-fixes, Property 4: Activities are ordered by date descending
fc.assert(
  fc.property(
    fc.constant(null),
    async () => {
      const response = await fetch(
        `${API_URL}/bookings/public/recent-activity`
      );
      const data = await response.json();
      for (let i = 0; i < data.activities.length - 1; i++) {
        const current = new Date(data.activities[i].date);
        const next = new Date(data.activities[i + 1].date);
        if (current < next) return false;
      }
      return true;
    }
  ),
  { numRuns: 100 }
);
```

**Property Test 5: Trusted Partners Are All Verified**
```javascript
// Feature: api-cors-fixes, Property 5: Trusted partners are all verified
fc.assert(
  fc.property(
    fc.constant(null),
    async () => {
      const response = await fetch(
        `${API_URL}/admin/trusted-partners`
      );
      const data = await response.json();
      return data.partners.every(partner => partner.is_verified === true);
    }
  ),
  { numRuns: 100 }
);
```

**Property Test 6: Trusted Partners Contain Required Fields**
```javascript
// Feature: api-cors-fixes, Property 6: Trusted partners contain required fields
fc.assert(
  fc.property(
    fc.constant(null),
    async () => {
      const response = await fetch(
        `${API_URL}/admin/trusted-partners`
      );
      const data = await response.json();
      const requiredFields = ['business_name', 'rating', 'is_verified'];
      return data.partners.every(partner =>
        requiredFields.every(field => partner.hasOwnProperty(field))
      );
    }
  ),
  { numRuns: 100 }
);
```

**Property Test 7: 404 Responses Are Properly Formatted**
```javascript
// Feature: api-cors-fixes, Property 7: 404 responses are properly formatted
fc.assert(
  fc.property(
    fc.string({ minLength: 1, maxLength: 50 }),
    async (randomPath) => {
      const response = await fetch(
        `${API_URL}/${randomPath}`
      );
      if (response.status !== 404) return true; // Skip if endpoint exists
      const data = await response.json();
      return (
        data.success === false &&
        data.hasOwnProperty('message') &&
        !data.stack &&
        !data.error?.stack
      );
    }
  ),
  { numRuns: 100 }
);
```

**Property Test 8: OPTIONS Requests Return Proper CORS Headers**
```javascript
// Feature: api-cors-fixes, Property 8: OPTIONS requests return proper CORS headers
fc.assert(
  fc.property(
    fc.constantFrom(
      '/api/bookings/public/recent-activity',
      '/api/admin/trusted-partners',
      '/api/admin/public/trust-stats'
    ),
    async (endpoint) => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'OPTIONS',
        headers: { 'Origin': 'http://localhost:4028' }
      });
      const headers = response.headers;
      return (
        headers.has('access-control-allow-methods') &&
        headers.has('access-control-allow-headers') &&
        headers.has('access-control-allow-origin') &&
        headers.has('access-control-max-age') &&
        (response.status === 200 || response.status === 204)
      );
    }
  ),
  { numRuns: 100 }
);
```

### Integration Testing

**End-to-End CORS Flow**:
1. Start backend server
2. Make preflight OPTIONS request with cache headers
3. Verify preflight response allows cache headers
4. Make actual GET request with cache headers
5. Verify request succeeds without CORS error

**Public Endpoints Flow**:
1. Make requests to all three public endpoints without auth
2. Verify all return 200 status
3. Verify response data structure matches specifications
4. Verify data is properly anonymized/filtered

### Manual Testing Checklist

- [ ] Open browser DevTools Network tab
- [ ] Load frontend at http://localhost:4028
- [ ] Verify no CORS errors in console
- [ ] Verify recent activity feed loads on homepage
- [ ] Verify trusted partners section loads
- [ ] Verify trust statistics display correctly
- [ ] Test with browser cache enabled
- [ ] Test with browser cache disabled
- [ ] Verify 404 page for non-existent routes
