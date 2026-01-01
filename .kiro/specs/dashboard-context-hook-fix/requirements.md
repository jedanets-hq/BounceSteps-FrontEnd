# Requirements Document: Dashboard Context Hook Fix

## Introduction

Fix the React error #321 occurring in production where the Traveler Dashboard is calling `useCart()` hook inside `useEffect` callbacks, violating React's Rules of Hooks. This causes the dashboard to crash with a minified React error.

## Glossary

- **Dashboard**: The Traveler Dashboard component
- **Context_Hook**: React hooks like `useCart()`, `useFavorites()`, `useTrips()`
- **Rules_of_Hooks**: React requirement that hooks must be called at the top level of components
- **useEffect**: React hook for side effects that runs after render

## Requirements

### Requirement 1: Fix Hook Usage in Dashboard

**User Story:** As a traveler, I want to access my dashboard without errors, so that I can view my trips, cart, and bookings.

#### Acceptance Criteria

1. THE Dashboard SHALL call all Context_Hooks at the top level of the component
2. WHEN the Dashboard needs to access hook methods in useEffect, THE Dashboard SHALL use the methods from the top-level hook call
3. THE Dashboard SHALL NOT call Context_Hooks inside useEffect callbacks
4. WHEN the Dashboard component renders, THE Dashboard SHALL successfully access all context values without errors

### Requirement 2: Maintain Functionality

**User Story:** As a traveler, I want my cart and favorites to load correctly, so that I can see my saved items.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Dashboard SHALL load cart items from the database
2. WHEN the Dashboard loads, THE Dashboard SHALL load favorites from the database  
3. WHEN the Dashboard loads, THE Dashboard SHALL load trip plans from the database
4. WHEN the cart tab becomes active, THE Dashboard SHALL reload cart data from the database

### Requirement 3: Production Deployment

**User Story:** As a developer, I want to deploy the fix to production, so that users can access the dashboard.

#### Acceptance Criteria

1. WHEN the fix is complete, THE System SHALL be deployed to Netlify production
2. WHEN deployed, THE System SHALL clear browser cache to ensure users get the new version
3. WHEN users access the dashboard, THE System SHALL not show React error #321
4. WHEN users access the dashboard, THE System SHALL successfully render all tabs
