# Implementation Plan: Cart API Endpoint Alignment Fix

## Overview

This implementation plan fixes the production issue where cart API endpoints return 404 errors causing React crashes. Tasks are organized to fix backend routes first, then improve frontend error handling, ensuring the production app is stable.

## Tasks

- [ ] 1. Audit and fix backend cart routes
  - [x] 1.1 Audit backend/routes/cart.js for missing endpoints
    - Read current cart.js implementation
    - Identify which endpoints exist vs. what frontend expects
    - Document missing or mismatched routes
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Implement missing cart route handlers
    - Add GET `/` handler to fetch user's cart items
    - Add POST `/add` handler to add items to cart
    - Add DELETE `/:id` handler to remove cart items
    - Add PUT `/:id` handler to update cart items (if needed)
    - Ensure all handlers use consistent response format `{ success, data/message/error }`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.3 Add error handling to cart routes
    - Wrap all route handlers in try-catch blocks
    - Add validation for required fields (return 400 on validation errors)
    - Add authentication checks (return 401 if not authenticated)
    - Add database error handling (return 500 on database errors)
    - Log errors to console for debugging
    - _Requirements: 5.2, 5.3, 5.4, 6.1, 7.1, 7.4_

  - [ ]* 1.4 Write unit tests for cart routes
    - Test GET `/` with authenticated user
    - Test POST `/add` with valid data
    - Test DELETE `/:id` with valid ID
    - Test endpoints without authentication (expect 401)
    - Test endpoints with invalid data (expect 400)
    - Test endpoints with non-existent IDs (expect 404)
    - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3, 5.4, 6.1_

- [ ] 2. Audit and fix backend favorites routes
  - [ ] 2.1 Audit backend/routes/favorites.js for missing endpoints
    - Read current favorites.js implementation
    - Identify missing or mismatched routes
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 2.2 Implement missing favorites route handlers
    - Add GET `/` handler to fetch user's favorites
    - Add POST `/add` handler to add favorites
    - Add DELETE `/:id` handler to remove favorites
    - Use consistent response format
    - Add error handling with try-catch blocks
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2, 5.3_

  - [ ]* 2.3 Write unit tests for favorites routes
    - Test all endpoints with valid/invalid scenarios
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3. Audit and fix backend plans routes
  - [ ] 3.1 Audit backend/routes/plans.js for missing endpoints
    - Read current plans.js implementation
    - Identify missing or mismatched routes
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 3.2 Implement missing plans route handlers
    - Add GET `/` handler to fetch user's plans
    - Add POST `/add` handler to add plans
    - Add DELETE `/:id` handler to remove plans
    - Use consistent response format
    - Add error handling with try-catch blocks
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 5.3_

  - [ ]* 3.3 Write unit tests for plans routes
    - Test all endpoints with valid/invalid scenarios
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4. Checkpoint - Test backend routes
  - Test all cart, favorites, and plans endpoints using curl or Postman
  - Verify consistent response formats
  - Verify authentication is working
  - Verify error handling returns appropriate status codes
  - Ask user if any issues arise

- [ ] 5. Improve frontend CartContext error handling
  - [x] 5.1 Add defensive checks to CartContext
    - Read current src/contexts/CartContext.jsx
    - Add null/undefined checks for API responses
    - Ensure cart state is always an array (never undefined)
    - Add try-catch blocks around all API calls
    - Add error state management
    - Add loading state management
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 8.1, 8.2, 8.3_

  - [x] 5.2 Implement response validation in CartContext
    - Check for `success` field in responses
    - Handle `success: false` as error condition
    - Provide default empty array if data is missing
    - _Requirements: 4.2, 8.1, 8.2_

  - [ ] 5.3 Add cleanup for unmounted components
    - Use AbortController to cancel in-flight requests
    - Or use cleanup function in useEffect to ignore responses
    - _Requirements: 8.5_

  - [ ]* 5.4 Write unit tests for CartContext
    - Test Context with successful API responses
    - Test Context with failed API responses
    - Test Context with malformed responses
    - Test Context with null/undefined responses
    - Test Context when user is not authenticated
    - _Requirements: 4.1, 4.2, 4.3, 8.1, 8.2, 8.3_

  - [ ]* 5.5 Write property test for CartContext null safety
    - **Property 4: Frontend Null Safety**
    - Generate random malformed API responses
    - Verify Context never sets state to undefined
    - Verify no rendering errors occur
    - **Validates: Requirements 8.1, 8.2, 8.3**

- [ ] 6. Improve frontend FavoritesContext error handling
  - [ ] 6.1 Add defensive checks to FavoritesContext
    - Apply same patterns as CartContext
    - Add null/undefined checks, try-catch blocks, error/loading states
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 8.1, 8.2, 8.3_

  - [ ]* 6.2 Write unit tests for FavoritesContext
    - Test similar scenarios as CartContext
    - _Requirements: 4.1, 4.2, 4.3, 8.1, 8.2, 8.3_

- [ ] 7. Improve frontend TripsContext error handling
  - [ ] 7.1 Add defensive checks to TripsContext
    - Apply same patterns as CartContext
    - Add null/undefined checks, try-catch blocks, error/loading states
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 8.1, 8.2, 8.3_

  - [ ]* 7.2 Write unit tests for TripsContext
    - Test similar scenarios as CartContext
    - _Requirements: 4.1, 4.2, 4.3, 8.1, 8.2, 8.3_

- [ ] 8. Improve ErrorBoundary component
  - [ ] 8.1 Enhance ErrorBoundary fallback UI
    - Read current src/components/ErrorBoundary.jsx
    - Improve error message display
    - Add refresh button
    - Add error logging
    - _Requirements: 4.4_

  - [ ]* 8.2 Write unit tests for ErrorBoundary
    - Test that ErrorBoundary catches rendering errors
    - Test that fallback UI is displayed
    - _Requirements: 4.4_

- [ ] 9. Checkpoint - Test frontend error handling
  - Test frontend with backend returning errors
  - Verify app doesn't crash on API failures
  - Verify error messages are displayed to users
  - Verify loading states work correctly
  - Ask user if any issues arise

- [ ] 10. Write integration tests
  - [ ]* 10.1 Write end-to-end cart workflow test
    - Test login → add to cart → fetch cart → remove from cart
    - Verify data persistence across operations
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 10.2 Write property test for cart operations idempotency
    - **Property 5: Cart Operations Idempotency**
    - Generate random cart items
    - Add item, verify it appears in GET
    - Delete item, verify it doesn't appear in GET
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ]* 10.3 Write property test for API response format consistency
    - **Property 1: API Response Format Consistency**
    - Generate random valid/invalid requests
    - Verify all responses have `success` field
    - Verify success=true responses have `data` field
    - Verify success=false responses have `message` or `error` field
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [ ]* 10.4 Write property test for authentication protection
    - **Property 2: Authentication Protection**
    - Generate random requests with/without auth tokens
    - Verify unauthenticated requests return 401
    - Verify authenticated requests proceed to handler
    - **Validates: Requirements 6.1, 6.3, 6.4**

  - [ ]* 10.5 Write property test for database error handling
    - **Property 3: Database Error Handling**
    - Mock random database failures
    - Verify all failures return 500 with error message
    - Verify server doesn't crash
    - **Validates: Requirements 7.1, 7.2, 7.4**

- [ ] 11. Deploy and verify fixes
  - [ ] 11.1 Deploy backend fixes to Render
    - Commit and push backend changes
    - Trigger Render deployment
    - Monitor deployment logs
    - _Requirements: All backend requirements_

  - [ ] 11.2 Test backend endpoints in production
    - Use curl or Postman to test production API
    - Verify all endpoints return correct responses
    - Verify error handling works
    - _Requirements: 1.1-1.5, 2.1-2.4, 3.1-3.4, 5.1-5.5_

  - [ ] 11.3 Deploy frontend fixes to Netlify
    - Commit and push frontend changes
    - Trigger Netlify deployment
    - Clear browser cache after deployment
    - _Requirements: All frontend requirements_

  - [ ] 11.4 Test full application in production
    - Test login flow
    - Test add to cart functionality
    - Test favorites functionality
    - Test trip planning functionality
    - Verify no React crashes occur
    - Verify error messages display correctly
    - _Requirements: All requirements_

- [ ] 12. Final checkpoint
  - Ensure all tests pass
  - Verify production app is stable
  - Monitor error logs for any remaining issues
  - Document any follow-up work needed
  - Ask user if everything is working correctly

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Backend fixes should be deployed and tested before frontend fixes
- Always test in production after deployment to catch any environment-specific issues
