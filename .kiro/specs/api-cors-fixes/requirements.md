# Requirements Document

## Introduction

The iSafari application frontend (running on http://localhost:4028) is experiencing API connectivity issues when communicating with the backend (http://localhost:5000). These issues include CORS header restrictions blocking legitimate requests and missing API endpoints that the frontend expects to exist. This specification addresses the systematic resolution of these connectivity problems to ensure seamless frontend-backend communication.

## Glossary

- **CORS**: Cross-Origin Resource Sharing - a security mechanism that controls which HTTP headers and methods can be used in cross-origin requests
- **Backend**: The Express.js server running on port 5000 that provides API endpoints
- **Frontend**: The React application running on port 4028 that consumes the API
- **Preflight Request**: An OPTIONS request sent by browsers before the actual request to check CORS permissions
- **Cache Headers**: HTTP headers that control caching behavior (expires, cache-control, pragma, if-none-match, if-modified-since)
- **Public Endpoint**: An API endpoint that does not require authentication
- **Trust Stats**: Statistics about verified service providers and platform trustworthiness
- **Recent Activity**: A feed of recent bookings and platform activity for display on the homepage

## Requirements

### Requirement 1: CORS Header Configuration

**User Story:** As a frontend developer, I want the backend to accept all necessary HTTP headers in cross-origin requests, so that browser cache-control and other standard headers do not cause CORS errors.

#### Acceptance Criteria

1. WHEN a preflight request includes cache-control headers (expires, cache-control, pragma), THEN the Backend SHALL accept these headers in the CORS configuration
2. WHEN a preflight request includes conditional request headers (if-none-match, if-modified-since), THEN the Backend SHALL accept these headers in the CORS configuration
3. WHEN a request includes the 'expires' header, THEN the Backend SHALL NOT block the request with a CORS error
4. THE Backend SHALL maintain existing support for Content-Type and Authorization headers
5. THE Backend SHALL respond to OPTIONS preflight requests with appropriate Access-Control-Allow-Headers

### Requirement 2: Public Recent Activity Endpoint

**User Story:** As a visitor to the homepage, I want to see recent booking activity on the platform, so that I can understand the platform's activity level and trustworthiness.

#### Acceptance Criteria

1. THE Backend SHALL provide a public endpoint at `/api/bookings/public/recent-activity`
2. WHEN a request includes a limit query parameter, THEN the Backend SHALL return at most that number of recent activities
3. WHEN no limit is specified, THEN the Backend SHALL default to returning 20 recent activities
4. THE Backend SHALL return anonymized booking data that does not expose sensitive user information
5. THE Backend SHALL include booking date, service category, and location in each activity item
6. THE Backend SHALL order activities by creation date in descending order (most recent first)
7. THE Backend SHALL NOT require authentication for this endpoint

### Requirement 3: Trusted Partners Endpoint

**User Story:** As a visitor to the homepage, I want to see verified trusted service providers, so that I can understand which providers have been vetted by the platform.

#### Acceptance Criteria

1. THE Backend SHALL provide a public endpoint at `/api/admin/trusted-partners`
2. THE Backend SHALL return a list of verified service providers with trust badges
3. THE Backend SHALL include provider business name, verification status, and rating in the response
4. THE Backend SHALL only return providers with verified status set to true
5. THE Backend SHALL NOT require authentication for this endpoint
6. THE Backend SHALL limit results to a reasonable number (e.g., 10-20 providers)

### Requirement 4: Public Trust Statistics Endpoint

**User Story:** As a visitor to the homepage, I want to see platform trust statistics, so that I can understand the platform's credibility and scale.

#### Acceptance Criteria

1. THE Backend SHALL provide a public endpoint at `/api/admin/public/trust-stats`
2. THE Backend SHALL return statistics including total verified providers count
3. THE Backend SHALL return statistics including total completed bookings count
4. THE Backend SHALL return statistics including average provider rating
5. THE Backend SHALL return statistics including total active users count
6. THE Backend SHALL NOT require authentication for this endpoint
7. THE Backend SHALL calculate statistics from the database in real-time or use cached values

### Requirement 5: Error Handling for Missing Endpoints

**User Story:** As a developer, I want clear error messages when endpoints are not found, so that I can quickly identify and fix API integration issues.

#### Acceptance Criteria

1. WHEN a request is made to a non-existent endpoint, THEN the Backend SHALL return a 404 status code
2. WHEN a 404 error occurs, THEN the Backend SHALL return a JSON response with success: false
3. WHEN a 404 error occurs, THEN the Backend SHALL include a descriptive error message
4. THE Backend SHALL log 404 errors with the requested path for debugging
5. THE Backend SHALL NOT expose internal server details in 404 error responses

### Requirement 6: CORS Preflight Response

**User Story:** As a browser making cross-origin requests, I want proper preflight responses, so that I can determine which headers and methods are allowed before sending the actual request.

#### Acceptance Criteria

1. WHEN an OPTIONS request is received, THEN the Backend SHALL respond with Access-Control-Allow-Methods
2. WHEN an OPTIONS request is received, THEN the Backend SHALL respond with Access-Control-Allow-Headers listing all permitted headers
3. WHEN an OPTIONS request is received, THEN the Backend SHALL respond with Access-Control-Allow-Origin matching the request origin
4. THE Backend SHALL respond to OPTIONS requests with a 200 or 204 status code
5. THE Backend SHALL include Access-Control-Max-Age to cache preflight responses

### Requirement 7: Endpoint Testing and Verification

**User Story:** As a developer, I want to verify that all endpoints work correctly, so that I can ensure the frontend will not encounter errors in production.

#### Acceptance Criteria

1. WHEN testing the recent-activity endpoint, THEN it SHALL return valid JSON with an array of activities
2. WHEN testing the trusted-partners endpoint, THEN it SHALL return valid JSON with an array of providers
3. WHEN testing the trust-stats endpoint, THEN it SHALL return valid JSON with statistical data
4. WHEN testing with CORS headers, THEN no CORS errors SHALL occur
5. WHEN testing without authentication, THEN public endpoints SHALL be accessible
