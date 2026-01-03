# Design: Fix Booking and Add to Cart API Errors on Render

## Overview

The booking and cart API endpoints are returning "API endpoint not found" errors on the Render production deployment. The root cause is that the backend server is not starting successfully because the DATABASE_URL environment variable is not configured on Render. This prevents the backend from connecting to PostgreSQL and initializing the database tables.

The solution involves:
1. Setting the DATABASE_URL environment variable on Render dashboard
2. Verifying the backend starts successfully and connects to PostgreSQL
3. Testing the cart and booking API endpoints
4. Ensuring end-to-end workflow works correctly

## Architecture

```
Frontend (Netlify)
    ↓
    ├─→ POST /api/cart/add
    ├─→ POST /api/bookings
    └─→ GET /api/health
    
Backend (Render)
    ├─→ PostgreSQL Database
    ├─→ Cart Routes (/api/cart)
    ├─→ Booking Routes (/api/bookings)
    └─→ Health Check (/api/health)
```

## Components and Interfaces

### 1. Render Environment Configuration

**Component**: Render Dashboard Environment Variables

**Configuration**:
- `NODE_ENV`: production
- `PORT`: 10000
- `JWT_SECRET`: isafari_global_super_secret_jwt_key_2024_production
- `SESSION_SECRET`: isafari_session_secret_key_2024
- `FRONTEND_URL`: https://isafari-tz.netlify.app
- `DATABASE_URL`: postgresql://[user]:[password]@[host]:[port]/[database]

**Interface**: Render dashboard settings page

### 2. Backend Server

**Component**: Node.js/Express server (backend/server.js)

**Responsibilities**:
- Load environment variables from .env and Render dashboard
- Connect to PostgreSQL using DATABASE_URL
- Initialize database tables and indexes
- Mount all API routes
- Handle CORS for frontend requests
- Return JSON responses for all endpoints

**Key Routes**:
- `GET /api/health` - Health check endpoint
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart` - Get user's cart
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user's bookings

### 3. PostgreSQL Database

**Component**: PostgreSQL database on Render

**Tables**:
- `users` - User accounts
- `services` - Services offered by providers
- `service_providers` - Service provider profiles
- `cart_items` - Shopping cart items
- `bookings` - Booking records
- `reviews` - Service reviews
- Other supporting tables

**Connection**: Via DATABASE_URL environment variable

### 4. Frontend API Client

**Component**: src/utils/api.js

**Configuration**:
- `API_BASE_URL`: https://isafarinetworkglobal-2.onrender.com/api
- Uses JWT token from localStorage for authentication
- Handles JSON responses and errors

**Key Functions**:
- `cartAPI.addToCart(serviceId, quantity)` - Add to cart
- `bookingsAPI.create(bookingData)` - Create booking
- `apiRequest(endpoint, options)` - Generic API request handler

## Data Models

### Cart Item
```javascript
{
  id: number,
  user_id: number,
  service_id: number,
  quantity: number,
  added_at: timestamp,
  updated_at: timestamp,
  // Joined with service data:
  title: string,
  description: string,
  price: number,
  category: string,
  location: string,
  images: array,
  provider_name: string,
  provider_id: number
}
```

### Booking
```javascript
{
  id: number,
  traveler_id: number,
  service_id: number,
  provider_id: number,
  booking_date: date,
  start_time: string,
  end_time: string,
  participants: number,
  total_amount: number,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  payment_status: 'pending' | 'paid' | 'refunded',
  special_requests: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Backend Health Check Responds

**For any** request to the health check endpoint, the backend SHALL respond with HTTP status 200 and a JSON object containing `status: 'OK'`.

**Validates: Requirements 1.3**

### Property 2: Cart Add Endpoint Accepts Authenticated Requests

**For any** authenticated user and valid service ID, a POST request to `/api/cart/add` SHALL succeed and return a JSON response with `success: true` and the created cart item.

**Validates: Requirements 2.1, 2.2, 4.2**

### Property 3: Cart Add Endpoint Rejects Unauthenticated Requests

**For any** unauthenticated request to `/api/cart/add`, the backend SHALL return HTTP status 401 and a JSON response with `success: false`.

**Validates: Requirements 2.5**

### Property 4: Booking Create Endpoint Accepts Authenticated Requests

**For any** authenticated user and valid booking data, a POST request to `/api/bookings` SHALL succeed and return a JSON response with `success: true` and the created booking.

**Validates: Requirements 3.1, 3.2, 4.3**

### Property 5: Booking Create Endpoint Rejects Unauthenticated Requests

**For any** unauthenticated request to `/api/bookings`, the backend SHALL return HTTP status 401 and a JSON response with `success: false`.

**Validates: Requirements 3.5**

### Property 6: Cart Items Persist in Database

**For any** cart item added by a user, querying the cart endpoint SHALL return the item with all correct details (service ID, quantity, service information).

**Validates: Requirements 4.2**

### Property 7: Bookings Persist in Database

**For any** booking created by a user, querying the bookings endpoint SHALL return the booking with all correct details (service ID, booking date, status, payment status).

**Validates: Requirements 4.3**

## Error Handling

### Backend Connection Errors
- If DATABASE_URL is not set: Backend logs error and exits with code 1
- If PostgreSQL connection fails: Backend logs error and exits with code 1
- If database initialization fails: Backend logs error and exits with code 1

### API Request Errors
- If request is not authenticated: Return 401 Unauthorized
- If request body is invalid: Return 400 Bad Request with error message
- If resource not found: Return 404 Not Found
- If server error occurs: Return 500 Internal Server Error with error message

### Frontend Error Handling
- If backend is not responding: Display "Cannot connect to backend" message
- If response is not JSON: Display "Invalid response from backend" message
- If API returns error: Display error message from backend

## Testing Strategy

### Unit Tests
- Test cart API endpoint with valid and invalid requests
- Test booking API endpoint with valid and invalid requests
- Test authentication middleware
- Test database connection and initialization
- Test error handling for missing environment variables

### Property-Based Tests
- Property 1: Health check endpoint responds correctly
- Property 2: Cart add endpoint accepts authenticated requests
- Property 3: Cart add endpoint rejects unauthenticated requests
- Property 4: Booking create endpoint accepts authenticated requests
- Property 5: Booking create endpoint rejects unauthenticated requests
- Property 6: Cart items persist in database
- Property 7: Bookings persist in database

### Integration Tests
- Test complete workflow: login → add to cart → view cart
- Test complete workflow: login → create booking → view bookings
- Test error scenarios: invalid service ID, missing required fields
- Test authentication: valid token, invalid token, no token

### Manual Testing
- Verify backend starts successfully on Render
- Verify health check endpoint responds
- Test add to cart from frontend
- Test create booking from frontend
- Verify data appears in database
