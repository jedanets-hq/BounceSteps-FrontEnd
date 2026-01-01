# Requirements Document

## Introduction

This specification addresses a critical bug where the `useFavorites` React hook is not properly imported in components that use it, causing the application to crash with "ReferenceError: useFavorites is not defined". Additionally, the hook is being called incorrectly inside `useEffect` hooks, violating React's Rules of Hooks.

## Glossary

- **useFavorites**: A custom React hook exported from FavoritesContext that provides access to favorites state and operations
- **FavoritesContext**: React context that manages favorite providers state across the application
- **React Hook**: A special function that lets you "hook into" React features, must be called at the top level of components
- **Rules of Hooks**: React's rules that hooks must be called at the top level and only in React functions

## Requirements

### Requirement 1: Import useFavorites Hook

**User Story:** As a developer, I want the useFavorites hook to be properly imported in all components that use it, so that the application doesn't crash with undefined reference errors.

#### Acceptance Criteria

1. WHEN a component uses the useFavorites hook, THE System SHALL import it from '../../contexts/FavoritesContext'
2. WHEN the traveler dashboard loads, THE System SHALL have useFavorites imported at the top of the file
3. WHEN the provider profile loads, THE System SHALL have useFavorites imported if it needs favorites functionality
4. IF a component doesn't use useFavorites, THEN THE System SHALL NOT import it

### Requirement 2: Call Hooks at Top Level

**User Story:** As a developer, I want React hooks to be called at the top level of components, so that React can properly track hook state between renders.

#### Acceptance Criteria

1. THE System SHALL call useFavorites at the top level of the component function
2. THE System SHALL NOT call useFavorites inside useEffect, callbacks, or conditional statements
3. WHEN accessing favorites data, THE System SHALL use the hook result from the top-level call
4. WHEN accessing favorites functions, THE System SHALL use the hook result from the top-level call

### Requirement 3: Fix Traveler Dashboard Favorites

**User Story:** As a traveler, I want my favorites to load correctly in the dashboard, so that I can see my saved providers.

#### Acceptance Criteria

1. WHEN the traveler dashboard loads, THE System SHALL call useFavorites at the top level
2. WHEN favorites are loaded, THE System SHALL sync them with local state using useEffect
3. WHEN favorites change in context, THE System SHALL update the local favoriteProviders state
4. THE System SHALL NOT call useFavorites inside useEffect hooks

### Requirement 4: Verify Provider Profile Favorites

**User Story:** As a traveler, I want to add providers to favorites from their profile page, so that I can save providers I'm interested in.

#### Acceptance Criteria

1. WHEN viewing a provider profile, THE System SHALL check if useFavorites is needed
2. IF favorites functionality is used, THEN THE System SHALL import and call useFavorites at the top level
3. WHEN adding to favorites, THE System SHALL use the addToFavorites function from the hook
4. WHEN checking favorite status, THE System SHALL use the isFavorite function from the hook

### Requirement 5: Fix Cart API Endpoint

**User Story:** As a traveler, I want the "Add to Cart" button to work correctly, so that I can add services to my cart for booking.

#### Acceptance Criteria

1. WHEN clicking "Add to Cart", THE System SHALL call the correct cart API endpoint
2. WHEN the cart API is called, THE System SHALL return a success response
3. IF the API endpoint is not found, THEN THE System SHALL log a clear error message
4. THE System SHALL ensure the cart routes are properly registered in the backend
