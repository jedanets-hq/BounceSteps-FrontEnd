# Requirements Document

## Introduction

This specification addresses API fetch errors in the provider profile page caused by direct `fetch()` calls using relative URLs instead of the configured `API_BASE_URL`. The provider profile page currently makes direct fetch calls to endpoints like `/api/providers/142`, which fail in the Vite dev server environment because they don't resolve to the correct backend server URL configured in the environment variables.

## Glossary

- **Provider_Profile_Page**: The React component located at `src/pages/provider-profile/index.jsx` that displays provider information and services
- **API_BASE_URL**: The configured base URL for all API requests, defined in `src/utils/api.js` and sourced from environment variables
- **Fetch_Call**: A direct HTTP request made using the browser's native `fetch()` API
- **Relative_URL**: A URL path that starts with `/` and is resolved relative to the current domain (e.g., `/api/providers/142`)
- **Absolute_URL**: A complete URL including the protocol and domain (e.g., `http://localhost:5000/api/providers/142`)

## Requirements

### Requirement 1: Fix Provider Data Fetch

**User Story:** As a user viewing a provider profile, I want the page to successfully load provider data, so that I can see the provider's information and services.

#### Acceptance Criteria

1. WHEN the Provider_Profile_Page fetches provider data, THE System SHALL use API_BASE_URL to construct the complete request URL
2. WHEN the provider fetch request is made, THE System SHALL include cache-busting parameters in the URL
3. WHEN the provider fetch request is made, THE System SHALL include appropriate cache-control headers
4. IF the provider data fetch fails, THEN THE System SHALL display an appropriate error message to the user

### Requirement 2: Fix Follower Count Fetch

**User Story:** As a user viewing a provider profile, I want to see the accurate follower count, so that I can gauge the provider's popularity.

#### Acceptance Criteria

1. WHEN the Provider_Profile_Page fetches follower count data, THE System SHALL use API_BASE_URL to construct the complete request URL
2. WHEN the follower count fetch fails, THE System SHALL handle the error gracefully without breaking the page
3. WHEN the follower count is successfully fetched, THE System SHALL display the count in the provider profile header

### Requirement 3: Fix Follow/Unfollow Actions

**User Story:** As a logged-in user, I want to follow or unfollow a provider, so that I can keep track of providers I'm interested in.

#### Acceptance Criteria

1. WHEN a user clicks the follow button, THE System SHALL use API_BASE_URL to construct the follow endpoint URL
2. WHEN a user clicks the unfollow button, THE System SHALL use API_BASE_URL to construct the unfollow endpoint URL
3. WHEN the follow/unfollow request is made, THE System SHALL include the authentication token in the request headers
4. WHEN the follow/unfollow action succeeds, THE System SHALL update the UI to reflect the new follow status
5. WHEN the follow/unfollow action succeeds, THE System SHALL update the follower count display

### Requirement 4: Fix Favorites Check and Management

**User Story:** As a logged-in user, I want to add or remove providers from my favorites, so that I can easily access my preferred providers later.

#### Acceptance Criteria

1. WHEN the Provider_Profile_Page checks if a provider is favorited, THE System SHALL use API_BASE_URL to construct the favorites check endpoint URL
2. WHEN a user adds a provider to favorites, THE System SHALL use API_BASE_URL to construct the add favorites endpoint URL
3. WHEN a user removes a provider from favorites, THE System SHALL use API_BASE_URL to construct the remove favorites endpoint URL
4. WHEN favorites operations are performed, THE System SHALL include the authentication token in the request headers
5. WHEN a favorites operation succeeds, THE System SHALL provide user feedback via an alert message

### Requirement 5: Maintain Existing Functionality

**User Story:** As a developer, I want all existing functionality to continue working after the API fixes, so that no regressions are introduced.

#### Acceptance Criteria

1. WHEN API URLs are updated, THE System SHALL preserve all existing request parameters and headers
2. WHEN API URLs are updated, THE System SHALL preserve all existing error handling logic
3. WHEN API URLs are updated, THE System SHALL preserve all existing success handling logic
4. WHEN API URLs are updated, THE System SHALL preserve all existing authentication flows
