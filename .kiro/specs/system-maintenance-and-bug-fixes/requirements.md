# System Maintenance and Bug Fixes

## Introduction

This specification addresses critical bugs and system issues affecting the iSafari Global platform. The primary issue is the "Book Now" button failing with "Error adding to cart: API endpoint not found" error. This document outlines all identified issues and requirements for comprehensive system maintenance.

## Glossary

- **Cart API**: Backend endpoints for managing shopping cart items (`/api/cart/*`)
- **Service Provider**: User who offers services on the platform
- **Traveler**: User who books services
- **Backend**: Express.js server running on port 5000
- **Frontend**: React application running on port 4028
- **API Endpoint**: HTTP route that handles requests (GET, POST, PUT, DELETE)
- **Authentication Token**: JWT token stored in localStorage for API requests
- **Database**: PostgreSQL database storing all application data

## Requirements

### Requirement 1: Cart API Endpoint Availability

**User Story:** As a traveler, I want to add services to my cart by clicking "Book Now", so that I can purchase multiple services in one transaction.

#### Acceptance Criteria

1. WHEN a traveler clicks "Book Now" on a service, THE System SHALL send a POST request to `/api/cart/add`
2. WHEN the cart API endpoint receives a valid request, THE System SHALL return HTTP 200 with success response
3. WHEN the cart API endpoint receives an invalid request, THE System SHALL return HTTP 400 with error message
4. WHEN the traveler is not authenticated, THE System SHALL return HTTP 401 with authentication error
5. WHEN a service is successfully added to cart, THE System SHALL persist the item to the database
6. WHEN the traveler views their cart, THE System SHALL display all items added via "Book Now"

### Requirement 2: API Endpoint Registration

**User Story:** As a developer, I want all API endpoints to be properly registered in the backend server, so that requests are routed correctly.

#### Acceptance Criteria

1. WHEN the backend server starts, THE System SHALL register all route handlers including `/api/cart/*`
2. WHEN a request is made to `/api/cart/add`, THE System SHALL route it to the cart routes module
3. WHEN a request is made to an undefined endpoint, THE System SHALL return HTTP 404 with "API endpoint not found" message
4. WHEN the backend receives a request, THE System SHALL set proper Content-Type headers to `application/json`
5. WHEN CORS is enabled, THE System SHALL allow requests from frontend origins

### Requirement 3: Authentication Token Handling

**User Story:** As a traveler, I want my authentication token to be properly sent with cart requests, so that the backend can identify me.

#### Acceptance Criteria

1. WHEN a traveler logs in, THE System SHALL store the authentication token in localStorage
2. WHEN making a cart API request, THE System SHALL include the token in the Authorization header
3. WHEN the token is missing, THE System SHALL display an error message to the user
4. WHEN the token is invalid, THE System SHALL return HTTP 401 and prompt user to login again
5. WHEN a new user logs in, THE System SHALL update the stored token

### Requirement 4: Error Handling and User Feedback

**User Story:** As a traveler, I want clear error messages when something goes wrong, so that I know what to do next.

#### Acceptance Criteria

1. WHEN adding to cart fails, THE System SHALL display a user-friendly error message
2. WHEN the backend is not responding, THE System SHALL show "Cannot connect to backend" message
3. WHEN the API returns an error, THE System SHALL log the error details to console for debugging
4. WHEN a network error occurs, THE System SHALL allow the user to retry the operation
5. WHEN the cart operation succeeds, THE System SHALL show a success notification

### Requirement 5: Cart Data Persistence

**User Story:** As a traveler, I want my cart items to be saved to the database, so that they persist across sessions.

#### Acceptance Criteria

1. WHEN an item is added to cart, THE System SHALL save it to the `cart_items` table in PostgreSQL
2. WHEN the traveler refreshes the page, THE System SHALL load cart items from the database
3. WHEN the traveler logs out and logs back in, THE System SHALL display the same cart items
4. WHEN an item is removed from cart, THE System SHALL delete it from the database
5. WHEN the cart is cleared, THE System SHALL remove all items from the database

### Requirement 6: Service Provider Profile Integration

**User Story:** As a service provider, I want the "Book Now" button on my profile to work correctly, so that travelers can book my services.

#### Acceptance Criteria

1. WHEN a traveler views a service provider profile, THE System SHALL display "Book Now" button for each service
2. WHEN the traveler clicks "Book Now", THE System SHALL add the service to their cart
3. WHEN the service is added successfully, THE System SHALL show a confirmation message
4. WHEN the traveler clicks "Book Now" multiple times, THE System SHALL increase the quantity in cart
5. WHEN the traveler navigates away and returns, THE System SHALL preserve the cart state

### Requirement 7: System Health Monitoring

**User Story:** As a developer, I want to monitor system health and identify issues quickly, so that I can fix problems before users are affected.

#### Acceptance Criteria

1. WHEN the backend starts, THE System SHALL log "API server running on port 5000"
2. WHEN a request is made to `/api/health`, THE System SHALL return HTTP 200 with status "OK"
3. WHEN the database connection fails, THE System SHALL log an error and prevent server startup
4. WHEN the frontend cannot connect to backend, THE System SHALL display a connection error
5. WHEN all systems are working, THE System SHALL allow normal operation

### Requirement 8: Frontend-Backend Communication

**User Story:** As a developer, I want the frontend and backend to communicate correctly, so that data flows properly through the system.

#### Acceptance Criteria

1. WHEN the frontend makes an API request, THE System SHALL include proper headers (Content-Type, Authorization)
2. WHEN the backend receives a request, THE System SHALL validate the request format
3. WHEN the response is ready, THE System SHALL return valid JSON with success/error status
4. WHEN the frontend receives a response, THE System SHALL parse it correctly and update UI
5. WHEN there is a mismatch between frontend and backend, THE System SHALL log detailed error information

### Requirement 9: Database Connection and Schema

**User Story:** As a developer, I want the database to be properly configured and accessible, so that data is stored and retrieved correctly.

#### Acceptance Criteria

1. WHEN the backend starts, THE System SHALL connect to PostgreSQL using DATABASE_URL
2. WHEN a query is executed, THE System SHALL use the correct table schema
3. WHEN the `cart_items` table is queried, THE System SHALL return correct columns (id, user_id, service_id, quantity, added_at)
4. WHEN a user is not found, THE System SHALL return appropriate error
5. WHEN the database is unavailable, THE System SHALL log connection error and prevent operations

### Requirement 10: Environment Configuration

**User Story:** As a developer, I want environment variables to be properly configured, so that the system connects to the correct backend and database.

#### Acceptance Criteria

1. WHEN the application starts, THE System SHALL load environment variables from .env file
2. WHEN VITE_API_BASE_URL is set, THE System SHALL use it for all API requests
3. WHEN DATABASE_URL is set, THE System SHALL connect to the specified PostgreSQL database
4. WHEN NODE_ENV is "production", THE System SHALL use production settings
5. WHEN NODE_ENV is "development", THE System SHALL use development settings with relaxed CORS
