# Implementation Plan: System Maintenance and Bug Fixes

## Overview

This implementation plan addresses critical bugs and system issues affecting the iSafari Global platform, with primary focus on fixing the "Book Now" button error: "Error adding to cart: API endpoint not found". The plan includes comprehensive system diagnostics, backend verification, frontend fixes, and database validation.

## Tasks

- [x] 1. Verify Backend Server Configuration and Cart Routes
  - Check that backend/server.js properly imports and registers cart routes
  - Verify backend/routes/cart.js has all required endpoints (POST /add, GET /, PUT, DELETE)
  - Ensure CORS middleware is properly configured to allow frontend requests
  - Verify PostgreSQL connection is established on server startup
  - _Requirements: 1, 2, 7, 9_

- [x] 2. Verify Frontend API Configuration
  - Check that src/utils/api.js has correct API_BASE_URL pointing to backend
  - Verify cartAPI functions are properly exported and callable
  - Ensure authentication token is properly included in cart requests
  - Check that .env.local has VITE_API_BASE_URL=http://localhost:5000/api
  - _Requirements: 3, 8, 10_

- [x] 3. Test Cart API Endpoints
  - [ ]* 3.1 Test POST /api/cart/add endpoint with valid authentication
    - Create test user and get authentication token
    - Send POST request with serviceId and quantity
    - Verify response is HTTP 200 with success message
    - _Requirements: 1, 3_

  - [ ]* 3.2 Test GET /api/cart endpoint
    - Verify endpoint returns user's cart items
    - Check that response includes all required fields (id, service_id, quantity, price, etc.)
    - _Requirements: 1, 5_

  - [ ]* 3.3 Test authentication error handling
    - Send request without authentication token
    - Verify response is HTTP 401 with authentication error
    - _Requirements: 3, 4_

  - [ ]* 3.4 Test invalid request handling
    - Send POST /api/cart/add without serviceId
    - Verify response is HTTP 400 with error message
    - _Requirements: 1, 4_

- [x] 4. Verify Database Schema and Connectivity
  - Check that PostgreSQL is running and accessible
  - Verify cart_items table exists with correct schema (id, user_id, service_id, quantity, added_at, updated_at)
  - Verify services table has required columns (id, title, price, provider_id, etc.)
  - Verify users table exists and has authentication data
  - _Requirements: 5, 9_

- [x] 5. Fix Frontend Cart Integration
  - [ ]* 5.1 Update CartContext to properly handle API responses
    - Ensure addToCart function properly calls cartAPI.addToCart
    - Add proper error handling and user feedback
    - Verify cart items are loaded from database on component mount
    - _Requirements: 1, 4, 5_

  - [ ]* 5.2 Update Service Provider Profile to use Cart API
    - Ensure "Book Now" button calls addToCart with correct service ID
    - Add success/error notifications
    - Verify cart state updates after adding item
    - _Requirements: 6_

  - [ ]* 5.3 Add error boundary and fallback UI
    - Display user-friendly error messages when cart operations fail
    - Show loading state while adding to cart
    - Provide retry mechanism for failed requests
    - _Requirements: 4_

- [x] 6. Verify Authentication Token Handling
  - Check that login endpoint returns valid JWT token
  - Verify token is stored in localStorage with correct key (isafari_user)
  - Ensure token is included in Authorization header for all cart requests
  - Test token refresh/expiration handling
  - _Requirements: 3, 8_

- [x] 7. Test Complete "Book Now" Workflow
  - [ ]* 7.1 Test traveler login flow
    - Login with test traveler account
    - Verify authentication token is stored
    - _Requirements: 3_

  - [ ]* 7.2 Test service discovery
    - Navigate to service provider profile
    - Verify services are displayed correctly
    - _Requirements: 6_

  - [ ]* 7.3 Test "Book Now" button click
    - Click "Book Now" on a service
    - Verify no error message appears
    - Check browser console for errors
    - _Requirements: 1, 6_

  - [ ]* 7.4 Test cart persistence
    - Verify item appears in cart
    - Refresh page and verify item is still in cart
    - Logout and login again, verify cart is preserved
    - _Requirements: 5, 6_

- [x] 8. Implement System Health Monitoring
  - [ ]* 8.1 Create health check endpoint
    - Verify /api/health returns status OK
    - Check database connection status
    - Check all required routes are registered
    - _Requirements: 7_

  - [ ]* 8.2 Add logging for debugging
    - Log all cart API requests and responses
    - Log authentication token presence/absence
    - Log database query errors
    - _Requirements: 4, 7_

  - [ ]* 8.3 Create diagnostic script
    - Test backend connectivity
    - Test all API endpoints
    - Test CORS configuration
    - Test database connection
    - _Requirements: 7_

- [x] 9. Checkpoint - Verify All Systems Working
  - Ensure backend is running without errors
  - Ensure frontend can connect to backend
  - Ensure cart API endpoints are accessible
  - Ensure database is connected and accessible
  - Ensure "Book Now" button works without errors

- [-] 10. Document Issues and Solutions
  - [ ]* 10.1 Create troubleshooting guide
    - Document common errors and solutions
    - Include steps to restart backend/frontend
    - Include steps to clear cache
    - _Requirements: 4, 7_

  - [ ]* 10.2 Create deployment checklist
    - Verify all environment variables are set
    - Verify database migrations are run
    - Verify backend is deployed and running
    - Verify frontend can connect to backend
    - _Requirements: 10_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- All tests should be run against local development environment first
- Backend must be running on port 5000 for tests to pass
- Frontend must be running on port 4028 for integration tests
- Database must be PostgreSQL with proper connection string in DATABASE_URL
