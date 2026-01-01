# Requirements Document

## Introduction

This document specifies the requirements for fixing the repeated 404 Not Found errors when the React frontend tries to fetch `/api/favorites` from the Express backend deployed on Render. The fix addresses route mismatches, authentication handling, misleading console logs, and prevents repeated re-renders in the FavoritesContext.

## Glossary

- **FavoritesContext**: React context that manages user favorites state and API interactions
- **Express_Backend**: The Node.js/Express server deployed on Render that handles API requests
- **JWT_Authentication**: JSON Web Token-based authentication middleware using Passport.js
- **API_Endpoint**: A specific URL path that the backend exposes for client requests
- **Favorites_Route**: The Express router handling `/api/favorites` endpoints

## Requirements

### Requirement 1: Backend Route Availability Verification

**User Story:** As a developer, I want the backend to properly expose the favorites endpoints, so that the frontend can successfully fetch user favorites.

#### Acceptance Criteria

1. WHEN the Express server starts, THE Express_Backend SHALL log confirmation that favorites routes are mounted at `/api/favorites`
2. WHEN a GET request is made to `/api/favorites` without authentication, THE Express_Backend SHALL return a 401 Unauthorized response with a JSON error message
3. WHEN a GET request is made to `/api/favorites` with a valid JWT token, THE Express_Backend SHALL return a 200 OK response with the user's favorites array
4. IF the JWT token is expired or invalid, THEN THE Express_Backend SHALL return a 401 Unauthorized response instead of 404

### Requirement 2: Frontend API Error Handling

**User Story:** As a user, I want clear feedback when favorites cannot be loaded, so that I understand what action to take.

#### Acceptance Criteria

1. WHEN the API returns a 401 Unauthorized response, THE FavoritesContext SHALL set favorites to an empty array and not retry the request
2. WHEN the API returns a 404 Not Found response, THE FavoritesContext SHALL log a warning and set favorites to an empty array
3. WHEN the API returns a 500 Server Error response, THE FavoritesContext SHALL log the error and set favorites to an empty array
4. THE FavoritesContext SHALL NOT log "Favorites loaded from database" when the API returns an error response

### Requirement 3: Prevent Repeated Re-renders and API Calls

**User Story:** As a developer, I want the FavoritesContext to prevent infinite loops and excessive API calls, so that the application performs efficiently.

#### Acceptance Criteria

1. THE FavoritesContext SHALL only call the favorites API once on initial mount when the user is authenticated
2. WHEN the user is not authenticated, THE FavoritesContext SHALL NOT make any API calls to the favorites endpoint
3. THE FavoritesContext SHALL use a ref to track loading state and prevent duplicate concurrent API calls
4. THE FavoritesContext SHALL enforce a minimum interval of 5 seconds between API calls unless explicitly forced
5. WHEN favorites are successfully loaded, THE FavoritesContext SHALL set isInitialized to true to prevent re-initialization

### Requirement 4: Accurate Console Logging

**User Story:** As a developer, I want accurate console logs, so that I can debug issues effectively.

#### Acceptance Criteria

1. WHEN favorites are successfully loaded from the database, THE FavoritesContext SHALL log "Favorites loaded from database" with the count
2. WHEN the API returns a 404 error, THE FavoritesContext SHALL log "Favorites endpoint not found (404)" without the misleading success message
3. WHEN the API returns a 401 error, THE FavoritesContext SHALL log "User not authenticated - cannot load favorites"
4. WHEN the user is not logged in locally, THE FavoritesContext SHALL log "User not logged in - skipping favorites load"

### Requirement 5: Backend Authentication Middleware Fix

**User Story:** As a developer, I want the authentication middleware to return proper HTTP status codes, so that the frontend can handle errors correctly.

#### Acceptance Criteria

1. WHEN Passport JWT authentication fails due to missing token, THE JWT_Authentication middleware SHALL return 401 with message "No authentication token provided"
2. WHEN Passport JWT authentication fails due to invalid token, THE JWT_Authentication middleware SHALL return 401 with message "Invalid authentication token"
3. WHEN Passport JWT authentication fails due to expired token, THE JWT_Authentication middleware SHALL return 401 with message "Authentication token expired"
4. THE JWT_Authentication middleware SHALL NOT return 404 for authentication failures
