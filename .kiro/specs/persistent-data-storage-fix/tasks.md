# Implementation Plan: Persistent Data Storage Fix

## Overview

This implementation plan breaks down the persistent data storage fix into discrete, manageable tasks. Each task builds on previous steps to ensure incremental progress and early validation. The plan follows a backend-first approach: database setup → models → API routes → frontend integration → testing.

## Tasks

- [ ] 1. Database Setup and Migrations
  - Create cart_items table with proper schema and indexes
  - Create journey_plans table with proper schema and indexes
  - Add migration files for production deployment
  - Verify tables created successfully with correct columns and constraints
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 2. Create Backend Models
  - [ ] 2.1 Create CartItem model with CRUD operations
    - Implement create, findByTravelerId, findById, update, delete, deleteByTravelerId, findByTravelerAndService methods
    - Add proper error handling and logging
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 2.2 Write property test for CartItem persistence round trip
    - **Property 1: Cart Item Persistence Round Trip**
    - **Validates: Requirements 1.1, 1.2**

  - [ ] 2.3 Create JourneyPlan model with CRUD operations
    - Implement create, findByTravelerId, findById, update, delete, updateStatus methods
    - Add proper error handling and logging
    - _Requirements: 3.6, 3.7, 3.8, 3.9, 3.10_

  - [ ]* 2.4 Write property test for JourneyPlan persistence round trip
    - **Property 3: Journey Plan Persistence Round Trip**
    - **Validates: Requirements 2.1, 2.2**

- [ ] 3. Create Cart API Routes
  - [ ] 3.1 Implement POST /cart endpoint
    - Validate request data (service_id, quantity, booking_date, participants, special_requests)
    - Create cart item in database
    - Return created item with id
    - _Requirements: 3.1, 1.1, 7.1_

  - [ ]* 3.2 Write property test for cart creation validation
    - **Property 7: API Error Handling**
    - **Validates: Requirements 3.12, 7.5**

  - [ ] 3.3 Implement GET /cart endpoint
    - Fetch all cart items for authenticated traveler
    - Populate service details
    - Return cart items array
    - _Requirements: 3.2, 1.2_

  - [ ] 3.4 Implement PUT /cart/:itemId endpoint
    - Validate request data
    - Update cart item quantity and other fields
    - Return updated item
    - _Requirements: 3.4, 1.4_

  - [ ]* 3.5 Write property test for cart quantity invariant
    - **Property 2: Cart Item Quantity Invariant**
    - **Validates: Requirements 1.4**

  - [ ] 3.6 Implement DELETE /cart/:itemId endpoint
    - Delete specific cart item
    - Return success response
    - _Requirements: 3.3, 1.3_

  - [ ] 3.7 Implement DELETE /cart endpoint
    - Delete all cart items for traveler
    - Return success response
    - _Requirements: 3.5, 1.5_

  - [ ]* 3.8 Write property test for cart deletion idempotence
    - **Property 4: Cart Deletion Idempotence**
    - **Validates: Requirements 1.3, 1.5**

  - [ ] 3.9 Add authentication middleware to all cart routes
    - Verify JWT token on all endpoints
    - Return 401 Unauthorized if missing/invalid
    - _Requirements: 3.11, 7.6_

  - [ ]* 3.10 Write property test for authentication enforcement
    - **Property 8: Authentication Enforcement**
    - **Validates: Requirements 3.11, 7.6**

- [ ] 4. Create Journey Plans API Routes
  - [ ] 4.1 Implement POST /journey-plans endpoint
    - Validate request data (country, region, district, area, services, travelers_count, total_cost)
    - Create journey plan in database
    - Return created plan with id
    - _Requirements: 3.6, 2.1, 7.1_

  - [ ] 4.2 Implement GET /journey-plans endpoint
    - Fetch all journey plans for authenticated traveler
    - Return plans array sorted by created_at descending
    - _Requirements: 3.7, 2.2_

  - [ ] 4.3 Implement GET /journey-plans/:id endpoint
    - Fetch specific journey plan by id
    - Verify traveler owns the plan
    - Return plan details
    - _Requirements: 3.8, 2.2_

  - [ ] 4.4 Implement PUT /journey-plans/:id endpoint
    - Validate request data
    - Update journey plan (country, region, services, status, etc.)
    - Return updated plan
    - _Requirements: 3.9, 2.3, 2.7_

  - [ ]* 4.5 Write property test for journey plan status transition
    - **Property 5: Journey Plan Status Transition**
    - **Validates: Requirements 2.7**

  - [ ] 4.6 Implement DELETE /journey-plans/:id endpoint
    - Delete specific journey plan
    - Return success response
    - _Requirements: 3.10, 2.4_

  - [ ] 4.7 Add authentication middleware to all journey plans routes
    - Verify JWT token on all endpoints
    - Return 401 Unauthorized if missing/invalid
    - _Requirements: 3.11, 7.6_

  - [ ]* 4.8 Write property test for journey plan persistence
    - **Property 3: Journey Plan Persistence Round Trip**
    - **Validates: Requirements 2.1, 2.2**

- [ ] 5. Checkpoint - Ensure all backend tests pass
  - Ensure all backend unit tests pass
  - Ensure all property tests pass
  - Verify database integrity
  - Ask the user if questions arise

- [ ] 6. Update Frontend API Client
  - [ ] 6.1 Add cart API methods to src/utils/api.js
    - Implement cartAPI.create, getAll, update, delete, clear methods
    - Add proper error handling
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 6.2 Add journey plans API methods to src/utils/api.js
    - Implement journeyPlansAPI.create, getAll, getById, update, delete methods
    - Add proper error handling
    - _Requirements: 3.6, 3.7, 3.8, 3.9, 3.10_

- [ ] 7. Update CartContext for Backend Sync
  - [ ] 7.1 Modify CartContext to fetch cart from backend on mount
    - Call cartAPI.getAll() on component mount
    - Load cart items from API instead of just localStorage
    - Handle loading and error states
    - _Requirements: 1.2, 5.1_

  - [ ] 7.2 Update addToCart to sync with backend
    - Call cartAPI.create() when adding item
    - Update local state with returned item (including id)
    - Update localStorage cache
    - Implement retry logic (3 attempts with exponential backoff)
    - _Requirements: 1.1, 5.2_

  - [ ]* 7.3 Write property test for cross-device cart consistency
    - **Property 6: Cross-Device Cart Consistency**
    - **Validates: Requirements 1.6**

  - [ ] 7.4 Update removeFromCart to sync with backend
    - Call cartAPI.delete(itemId) when removing item
    - Update local state
    - Update localStorage cache
    - Implement retry logic
    - _Requirements: 1.3, 5.3_

  - [ ] 7.5 Update updateQuantity to sync with backend
    - Call cartAPI.update(itemId, data) when updating quantity
    - Update local state with returned item
    - Update localStorage cache
    - Implement retry logic
    - _Requirements: 1.4, 5.4_

  - [ ] 7.6 Update clearCart to sync with backend
    - Call cartAPI.clear() when clearing cart
    - Clear local state
    - Clear localStorage cache
    - Implement retry logic
    - _Requirements: 1.5, 5.5_

  - [ ] 7.7 Add error handling and retry logic to CartContext
    - Implement exponential backoff retry (1s, 2s, 4s)
    - Show user-friendly error messages
    - Fall back to localStorage if API fails after 3 attempts
    - Log errors for debugging
    - _Requirements: 1.8, 5.6_

  - [ ] 7.8 Add offline support to CartContext
    - Detect offline status using navigator.onLine
    - Queue operations when offline
    - Sync queued operations when online
    - Update localStorage as cache
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 8. Create JourneyPlanContext for Backend Sync
  - [ ] 8.1 Create new JourneyPlanContext component
    - Manage journeyPlans state, loading, error
    - Implement fetchJourneyPlans, createJourneyPlan, updateJourneyPlan, deleteJourneyPlan methods
    - Add error handling and retry logic
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.1_

  - [ ] 8.2 Implement fetchJourneyPlans in JourneyPlanContext
    - Call journeyPlansAPI.getAll() on mount
    - Load plans from API
    - Update localStorage cache
    - Handle loading and error states
    - _Requirements: 2.2, 6.1_

  - [ ] 8.3 Implement createJourneyPlan in JourneyPlanContext
    - Call journeyPlansAPI.create() with plan data
    - Add returned plan to state
    - Update localStorage cache
    - Implement retry logic
    - _Requirements: 2.1, 6.1_

  - [ ] 8.4 Implement updateJourneyPlan in JourneyPlanContext
    - Call journeyPlansAPI.update(id, data)
    - Update plan in state
    - Update localStorage cache
    - Implement retry logic
    - _Requirements: 2.3, 2.7, 6.1_

  - [ ] 8.5 Implement deleteJourneyPlan in JourneyPlanContext
    - Call journeyPlansAPI.delete(id)
    - Remove plan from state
    - Update localStorage cache
    - Implement retry logic
    - _Requirements: 2.4, 6.1_

  - [ ] 8.6 Add error handling and retry logic to JourneyPlanContext
    - Implement exponential backoff retry (1s, 2s, 4s)
    - Show user-friendly error messages
    - Fall back to localStorage if API fails after 3 attempts
    - Log errors for debugging
    - _Requirements: 2.8, 6.1_

  - [ ] 8.7 Add offli