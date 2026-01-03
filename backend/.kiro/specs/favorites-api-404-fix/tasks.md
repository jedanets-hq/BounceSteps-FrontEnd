# Implementation Plan: Favorites API 404 Fix

## Overview

This implementation plan fixes the repeated 404 Not Found errors when fetching `/api/favorites` by creating a custom JWT authentication middleware, improving error handling in FavoritesContext, and ensuring accurate console logging.

## Tasks

- [x] 1. Create custom JWT authentication middleware
  - [x] 1.1 Create `backend/middleware/jwtAuth.js` with custom authenticateJWT function
    - Wrap Passport's authenticate with custom error handling
    - Return 401 with specific error codes for missing/invalid/expired tokens
    - Never return 404 for authentication failures
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 1.2 Write property test for authentication error responses
    - **Property 1: Authentication Error Response Consistency**
    - **Validates: Requirements 1.2, 1.4, 5.1, 5.2, 5.3, 5.4**

- [x] 2. Update favorites routes to use custom middleware
  - [x] 2.1 Update `backend/routes/favorites.js` to import and use custom jwtAuth middleware
    - Replace `passport.authenticate('jwt', { session: false })` with custom `authenticateJWT`
    - Ensure all routes use the new middleware
    - _Requirements: 1.2, 1.3, 1.4_

- [x] 3. Checkpoint - Verify backend changes
  - Ensure backend starts without errors
  - Test that unauthenticated requests return 401 (not 404)
  - Ask the user if questions arise

- [x] 4. Update frontend API utility for proper status handling
  - [x] 4.1 Update `src/utils/api.js` apiRequest function
    - Add explicit handling for 401 status before 404
    - Include status code and error code in response object
    - Ensure proper JSON parsing for error responses
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 5. Fix FavoritesContext error handling and logging
  - [x] 5.1 Update `src/contexts/FavoritesContext.jsx` loadFavoritesFromDatabase function
    - Add specific handling for 401 responses (auth failure)
    - Add specific handling for 404 responses (endpoint not found)
    - Remove misleading "loaded from database" log on errors
    - Add accurate logging for each error scenario
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4_

  - [ ]* 5.2 Write property test for frontend error state management
    - **Property 2: Frontend Error State Management**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [-] 6. Verify API call deduplication logic
  - [ ] 6.1 Review and verify existing deduplication in FavoritesContext
    - Confirm isLoadingRef prevents concurrent calls
    - Confirm MIN_LOAD_INTERVAL (5 seconds) is enforced
    - Confirm force parameter bypasses interval check
    - _Requirements: 3.1, 3.3, 3.4_

  - [ ]* 6.2 Write property test for API call deduplication
    - **Property 3: API Call Deduplication**
    - **Validates: Requirements 3.1, 3.3, 3.4**

- [ ] 7. Verify unauthenticated user behavior
  - [ ] 7.1 Review and verify early return for unauthenticated users
    - Confirm no API call is made when user.token is missing
    - Confirm favorites is set to empty array
    - Confirm isInitialized is set to true
    - _Requirements: 3.2_

  - [ ]* 7.2 Write property test for unauthenticated user behavior
    - **Property 4: Unauthenticated User Behavior**
    - **Validates: Requirements 3.2**

- [ ] 8. Checkpoint - Verify frontend changes
  - Ensure frontend builds without errors
  - Test error handling with mock responses
  - Ask the user if questions arise

- [ ] 9. Integration testing
  - [ ] 9.1 Create integration test script
    - Test unauthenticated request returns 401
    - Test authenticated request returns 200 with favorites
    - Test invalid token returns 401
    - Test full flow: login → load favorites → verify
    - _Requirements: 1.2, 1.3, 1.4, 3.5_

  - [ ]* 9.2 Write property test for successful load state transition
    - **Property 5: Successful Load State Transition**
    - **Validates: Requirements 3.5, 4.1**

- [ ] 10. Final checkpoint - Full system verification
  - Deploy backend changes to Render
  - Clear browser cache and test frontend
  - Verify no more 404 errors in console
  - Verify accurate logging messages
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- The custom JWT middleware is the key fix - it ensures 401 is always returned for auth failures instead of 404
