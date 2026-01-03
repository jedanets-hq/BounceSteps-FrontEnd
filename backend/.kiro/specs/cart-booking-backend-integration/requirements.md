# Requirements: Cart & Booking Backend Integration

## Introduction

Currently, the "Add to Cart", "Book Now", and "Add to Plan" buttons save data only to localStorage instead of persisting to the PostgreSQL database on Render. This means:
- Cart items are lost when the browser is closed
- Bookings are not created in the system
- Trip plans are not saved to the database
- No real transaction history exists

This feature will integrate these buttons with the backend API to properly persist all cart and booking data to PostgreSQL.

## Glossary

- **Cart**: A collection of services selected by a traveler for future booking
- **Booking**: A confirmed reservation of a service with specific dates and participants
- **Trip Plan**: A collection of services organized for a specific trip
- **Service**: An offering by a service provider (accommodation, transport, activity, etc.)
- **Traveler**: A user who books services
- **Provider**: A user who offers services
- **LocalStorage**: Browser-based temporary storage (currently being used)
- **PostgreSQL**: The production database on Render (where data should be saved)

## Requirements

### Requirement 1: Add to Cart Persists to Backend

**User Story:** As a traveler, I want to add services to my cart and have them saved to the backend, so that my cart persists across browser sessions and devices.

#### Acceptance Criteria

1. WHEN a traveler clicks "Add to Cart" on a service card, THE System SHALL send the service data to the backend API
2. WHEN the backend receives an add-to-cart request, THE System SHALL create or update a cart record in PostgreSQL
3. WHEN a cart item is successfully saved, THE System SHALL display a success message to the traveler
4. WHEN the traveler navigates away and returns, THE System SHALL retrieve the cart from the backend database
5. IF the backend request fails, THE System SHALL display an error message and NOT save to localStorage as fallback

### Requirement 2: Book Now Creates Booking in Backend

**User Story:** As a traveler, I want to book a service immediately and have the booking saved to the backend, so that the service provider receives the booking notification.

#### Acceptance Criteria

1. WHEN a traveler clicks "Book Now" on a service, THE System SHALL collect booking details (date, participants, special requests)
2. WHEN the traveler confirms the booking, THE System SHALL send the booking data to the backend API
3. WHEN the backend receives a booking request, THE System SHALL create a booking record in PostgreSQL with status "pending"
4. WHEN a booking is successfully created, THE System SHALL redirect the traveler to the payment page
5. IF the backend request fails, THE System SHALL display an error message and prevent the booking from being created

### Requirement 3: Add to Plan Persists to Backend

**User Story:** As a traveler, I want to add services to my trip plan and have them saved to the backend, so that my trip plans are preserved and can be accessed from any device.

#### Acceptance Criteria

1. WHEN a traveler clicks "Add to Plan" on a service, THE System SHALL send the service data to the backend API
2. WHEN the backend receives an add-to-plan request, THE System SHALL create or update a trip plan record in PostgreSQL
3. WHEN a trip plan item is successfully saved, THE System SHALL display a success message to the traveler
4. WHEN the traveler navigates to the trip plans section, THE System SHALL retrieve all trip plans from the backend database
5. IF the backend request fails, THE System SHALL display an error message and prevent the item from being added

### Requirement 4: Cart API Endpoints

**User Story:** As a backend developer, I want cart management endpoints, so that the frontend can manage cart items through the API.

#### Acceptance Criteria

1. THE System SHALL provide a GET /api/cart endpoint that returns all cart items for the authenticated traveler
2. THE System SHALL provide a POST /api/cart endpoint that adds a service to the traveler's cart
3. THE System SHALL provide a DELETE /api/cart/:serviceId endpoint that removes a service from the cart
4. THE System SHALL provide a PUT /api/cart/:serviceId endpoint that updates the quantity of a cart item
5. THE System SHALL provide a DELETE /api/cart endpoint that clears the entire cart

### Requirement 5: Trip Plan API Endpoints

**User Story:** As a backend developer, I want trip plan management endpoints, so that the frontend can manage trip plans through the API.

#### Acceptance Criteria

1. THE System SHALL provide a GET /api/trip-plans endpoint that returns all trip plans for the authenticated traveler
2. THE System SHALL provide a POST /api/trip-plans endpoint that creates a new trip plan
3. THE System SHALL provide a POST /api/trip-plans/:planId/items endpoint that adds a service to a trip plan
4. THE System SHALL provide a DELETE /api/trip-plans/:planId/items/:serviceId endpoint that removes a service from a trip plan
5. THE System SHALL provide a DELETE /api/trip-plans/:planId endpoint that deletes an entire trip plan

### Requirement 6: Data Validation

**User Story:** As a system architect, I want data validation on both frontend and backend, so that invalid data is rejected before being saved.

#### Acceptance Criteria

1. WHEN a traveler attempts to add a service to cart, THE System SHALL validate that the service exists and is active
2. WHEN a traveler attempts to create a booking, THE System SHALL validate that the booking date is in the future
3. WHEN a traveler attempts to add a service to a trip plan, THE System SHALL validate that the service ID is valid
4. IF validation fails, THE System SHALL return a descriptive error message to the frontend
5. THE System SHALL prevent duplicate cart items (update quantity instead of adding duplicate)

### Requirement 7: Error Handling

**User Story:** As a traveler, I want clear error messages when operations fail, so that I understand what went wrong.

#### Acceptance Criteria

1. IF the backend is unreachable, THE System SHALL display "Cannot connect to backend. Please check your internet connection."
2. IF a service is not found, THE System SHALL display "Service not found. Please refresh and try again."
3. IF the traveler is not authenticated, THE System SHALL redirect to the login page
4. IF a booking date is invalid, THE System SHALL display "Please select a valid future date."
5. IF the database operation fails, THE System SHALL display "An error occurred. Please try again later."

### Requirement 8: Authentication & Authorization

**User Story:** As a system architect, I want proper authentication checks, so that only authenticated travelers can manage their carts and bookings.

#### Acceptance Criteria

1. WHEN a traveler attempts to access cart endpoints, THE System SHALL verify they are authenticated
2. WHEN a traveler attempts to access their cart, THE System SHALL only return their own cart items
3. WHEN a traveler attempts to access trip plans, THE System SHALL only return their own trip plans
4. IF a traveler is not authenticated, THE System SHALL return a 401 Unauthorized response
5. IF a traveler attempts to access another user's data, THE System SHALL return a 403 Forbidden response
