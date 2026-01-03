# Requirements: Fix Booking and Add to Cart API Errors on Render

## Introduction

When users click "Book Now" or "Add to Cart" buttons on the production Render deployment, they receive an error: "API endpoint not found". This is because the backend server is not responding to API requests. The root cause is that the DATABASE_URL environment variable is not properly configured on Render, preventing the backend from starting successfully.

## Glossary

- **Render**: Cloud deployment platform where the backend is hosted
- **DATABASE_URL**: PostgreSQL connection string environment variable
- **Backend**: Node.js/Express API server running on Render
- **Frontend**: React application deployed on Netlify
- **Cart API**: `/api/cart/add` endpoint for adding services to cart
- **Booking API**: `/api/bookings` endpoint for creating bookings

## Requirements

### Requirement 1: Configure DATABASE_URL on Render

**User Story:** As a system administrator, I want the DATABASE_URL environment variable to be properly configured on Render, so that the backend can connect to PostgreSQL and start successfully.

#### Acceptance Criteria

1. WHEN the backend starts on Render THEN the DATABASE_URL environment variable SHALL be set to the correct PostgreSQL connection string
2. WHEN the backend connects to PostgreSQL THEN the connection SHALL be successful and the database tables SHALL be initialized
3. WHEN the backend is running THEN the health check endpoint `/api/health` SHALL respond with status 200 and success message
4. WHEN a user clicks "Add to Cart" THEN the request SHALL reach the backend and return a valid response (success or error with proper message)
5. WHEN a user clicks "Book Now" THEN the request SHALL reach the backend and return a valid response (success or error with proper message)

### Requirement 2: Verify Cart API Endpoint

**User Story:** As a developer, I want to verify that the cart API endpoint is properly mounted and responding, so that users can add services to their cart.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/api/cart/add` THEN the backend SHALL receive the request and process it
2. WHEN the cart endpoint receives a valid request THEN it SHALL return a JSON response with success status
3. WHEN the cart endpoint receives an invalid request THEN it SHALL return a JSON response with error message and appropriate HTTP status code
4. WHEN a user is authenticated THEN the cart endpoint SHALL accept the request and add the item to the database
5. WHEN a user is not authenticated THEN the cart endpoint SHALL return a 401 Unauthorized response

### Requirement 3: Verify Booking API Endpoint

**User Story:** As a developer, I want to verify that the booking API endpoint is properly mounted and responding, so that users can create bookings.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/api/bookings` THEN the backend SHALL receive the request and process it
2. WHEN the booking endpoint receives a valid request THEN it SHALL return a JSON response with success status
3. WHEN the booking endpoint receives an invalid request THEN it SHALL return a JSON response with error message and appropriate HTTP status code
4. WHEN a user is authenticated THEN the booking endpoint SHALL accept the request and create the booking in the database
5. WHEN a user is not authenticated THEN the booking endpoint SHALL return a 401 Unauthorized response

### Requirement 4: Test End-to-End Workflow

**User Story:** As a QA tester, I want to test the complete workflow of adding items to cart and creating bookings, so that I can verify the system works correctly.

#### Acceptance Criteria

1. WHEN a user logs in THEN the authentication SHALL succeed and the user SHALL be able to make authenticated requests
2. WHEN a user adds a service to cart THEN the item SHALL be added to the database and the response SHALL confirm success
3. WHEN a user creates a booking THEN the booking SHALL be created in the database with correct status and payment status
4. WHEN a user views their cart THEN all items SHALL be displayed with correct service details and pricing
5. WHEN a user views their bookings THEN all bookings SHALL be displayed with correct status and details
