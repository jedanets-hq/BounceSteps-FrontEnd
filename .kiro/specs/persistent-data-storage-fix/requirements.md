# Requirements Document: Persistent Data Storage Fix

## Introduction

The application currently loses user data (cart items, journey plans, favorites) when the browser is refreshed or cache is cleared. Cart items and journey plans are stored only in localStorage, while bookings are only saved after pre-order submission. This causes data loss and prevents cross-device synchronization. This specification addresses the need to persist all user data to PostgreSQL database in real-time.

## Glossary

- **Cart_Item**: A service added to the user's shopping cart with quantity and booking details
- **Journey_Plan**: A complete trip itinerary with selected services, travelers, and dates
- **Traveler**: A user with user_type='traveler' who books services
- **Service_Provider**: A user with user_type='service_provider' who offers services
- **Persistent_Storage**: Data saved to PostgreSQL database that survives browser refresh
- **Local_Storage**: Browser localStorage that is lost on cache clear
- **Real-time_Sync**: Immediate synchronization between frontend and backend database

## Requirements

### Requirement 1: Cart Items Persistent Storage

**User Story:** As a traveler, I want my cart items to be saved to the database, so that my cart persists across browser sessions and devices.

#### Acceptance Criteria

1. WHEN a traveler adds a service to cart, THE System SHALL immediately save the cart item to the PostgreSQL database
2. WHEN a traveler refreshes the page, THE System SHALL load all cart items from the database and display them
3. WHEN a traveler removes a service from cart, THE System SHALL immediately delete the cart item from the database
4. WHEN a traveler updates the quantity of a cart item, THE System SHALL immediately update the quantity in the database
5. WHEN a traveler clears the entire cart, THE System SHALL delete all cart items from the database
6. WHEN a traveler accesses the application from a different device, THE System SHALL display the same cart items from the database
7. WHEN a cart item is saved to the database, THE System SHALL include service_id, traveler_id, quantity, booking_date, participants, and special_requests
8. IF a database save operation fails, THEN THE System SHALL retry the operation and notify the traveler of any persistent errors

### Requirement 2: Journey Plans Persistent Storage

**User Story:** As a traveler, I want my journey plans to be saved to the database, so that I can access them later and they don't disappear on page refresh.

#### Acceptance Criteria

1. WHEN a traveler creates a journey plan with selected services, THE System SHALL immediately save the complete plan to the PostgreSQL database
2. WHEN a traveler refreshes the page, THE System SHALL load all journey plans from the database and display them
3. WHEN a traveler updates a journey plan, THE System SHALL immediately save the changes to the database
4. WHEN a traveler deletes a journey plan, THE System SHALL immediately delete it from the database
5. WHEN a journey plan is saved, THE System SHALL include country, region, district, area, services array, travelers count, total cost, and status
6. WHEN a traveler accesses the application from a different device, THE System SHALL display the same journey plans from the database
7. WHEN a journey plan status changes (pending_payment → confirmed → completed), THE System SHALL update the status in the database
8. IF a database save operation fails, THEN THE System SHALL retry the operation and notify the traveler of any persistent errors

### Requirement 3: Cart and Journey Plans API Endpoints

**User Story:** As a backend developer, I want API endpoints for cart and journey plans operations, so that the frontend can persist data to the database.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/cart`, THE System SHALL create a new cart item and return the created item with id
2. WHEN a GET request is sent to `/cart`, THE System SHALL return all cart items for the authenticated traveler
3. WHEN a DELETE request is sent to `/cart/:itemId`, THE System SHALL delete the cart item and return success
4. WHEN a PUT request is sent to `/cart/:itemId`, THE System SHALL update the cart item quantity and return the updated item
5. WHEN a DELETE request is sent to `/cart`, THE System SHALL delete all cart items for the traveler
6. WHEN a POST request is sent to `/journey-plans`, THE System SHALL create a new journey plan and return the created plan with id
7. WHEN a GET request is sent to `/journey-plans`, THE System SHALL return all journey plans for the authenticated traveler
8. WHEN a GET request is sent to `/journey-plans/:id`, THE System SHALL return the specific journey plan
9. WHEN a PUT request is sent to `/journey-plans/:id`, THE System SHALL update the journey plan and return the updated plan
10. WHEN a DELETE request is sent to `/journey-plans/:id`, THE System SHALL delete the journey plan
11. WHEN any API endpoint receives a request without authentication, THE System SHALL return 401 Unauthorized
12. WHEN any API endpoint receives invalid data, THE System SHALL return 400 Bad Request with error details

### Requirement 4: Database Schema for Cart and Journey Plans

**User Story:** As a system architect, I want database tables for cart items and journey plans, so that user data is properly persisted.

#### Acceptance Criteria

1. THE System SHALL have a `cart_items` table with columns: id, traveler_id, service_id, quantity, booking_date, participants, special_requests, created_at, updated_at
2. THE System SHALL have a `journey_plans` table with columns: id, traveler_id, country, region, district, area, services (JSONB array), travelers_count, total_cost, status, created_at, updated_at
3. WHEN a cart item is created, THE System SHALL automatically set created_at and updated_at timestamps
4. WHEN a journey plan is created, THE System SHALL automatically set created_at and updated_at timestamps
5. WHEN a traveler is deleted, THE System SHALL cascade delete all their cart items and journey plans
6. WHEN a service is deleted, THE System SHALL cascade delete all cart items referencing that service

### Requirement 5: Frontend Cart Context Synchronization

**User Story:** As a frontend developer, I want the CartContext to sync with the backend database, so that cart data is always up-to-date.

#### Acceptance Criteria

1. WHEN CartProvider mounts, THE System SHALL fetch cart items from the backend API
2. WHEN addToCart is called, THE System SHALL call the backend API to save the item and update local state
3. WHEN removeFromCart is called, THE System SHALL call the backend API to delete the item and update local state
4. WHEN updateQuantity is called, THE System SHALL call the backend API to update the item and update local state
5. WHEN clearCart is called, THE System SHALL call the backend API to delete all items and update local state
6. IF an API call fails, THE System SHALL retry up to 3 times before showing an error to the user
7. WHEN cart data is loaded from the backend, THE System SHALL update localStorage as a cache for offline access

### Requirement 6: Frontend Journey Plans Synchronization

**User Story:** As a frontend developer, I want journey plans to sync with the backend database, so that plans are always persisted.

#### Acceptance Criteria

1. WHEN the journey planner page loads, THE System SHALL fetch all journey plans from the backend API
2. WHEN a journey plan is created, THE System SHALL call the backend API to save it and update local state
3. WHEN a journey plan is updated, THE System SHALL call the backend API to save changes and update local state
4. WHEN a journey plan is deleted, THE System SHALL call the backend API to delete it and update local state
5. WHEN journey plan data is loaded from the backend, THE System SHALL update localStorage as a cache for offline access
6. IF an API call fails, THE System SHALL retry up to 3 times before showing an error to the user
7. WHEN displaying journey plans, THE System SHALL show the most recent version from the database

### Requirement 7: Data Validation and Error Handling

**User Story:** As a system architect, I want proper validation and error handling, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN cart item data is received, THE System SHALL validate that service_id, traveler_id, and quantity are present and valid
2. WHEN journey plan data is received, THE System SHALL validate that country, region, services array, and travelers_count are present and valid
3. WHEN a database operation fails, THE System SHALL log the error with full context
4. WHEN a database operation fails, THE System SHALL return a meaningful error message to the frontend
5. WHEN validation fails, THE System SHALL return 400 Bad Request with specific field errors
6. WHEN a traveler tries to access another traveler's cart or plans, THE System SHALL return 403 Forbidden

### Requirement 8: Backward Compatibility with localStorage

**User Story:** As a developer, I want the application to work offline and with localStorage as a fallback, so that users can still access their data if the backend is unavailable.

#### Acceptance Criteria

1. WHEN the backend API is unavailable, THE System SHALL fall back to localStorage data
2. WHEN the application is offline, THE System SHALL display cached data from localStorage
3. WHEN the application comes back online, THE System SHALL sync localStorage data with the backend database
4. WHEN syncing offline changes, THE System SHALL handle conflicts by preferring the most recent data
5. WHEN localStorage data exists but backend data is empty, THE System SHALL migrate localStorage data to the backend

