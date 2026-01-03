# Requirements Document

## Introduction

This document outlines the requirements for implementing a comprehensive cache busting and deployment strategy for the iSafari Global platform. The system currently suffers from persistent caching issues where deployed changes are not visible to users even after hard refresh, rebuild, and redeployment. This affects both frontend (Netlify) and backend (Render) deployments.

## Glossary

- **Cache Busting**: Technique to force browsers and CDNs to load new versions of files instead of cached versions
- **Build Hash**: Unique identifier generated during build process to version assets
- **Service Worker**: Browser feature that can cache application resources
- **CDN**: Content Delivery Network that caches static assets
- **Deployment Pipeline**: Automated process of building and deploying code changes
- **Asset Versioning**: Adding version identifiers to file names or URLs
- **Browser Cache**: Local storage of web resources in user's browser
- **Render**: Backend hosting platform (https://isafarinetworkglobal-2.onrender.com)
- **Netlify**: Frontend hosting platform
- **Vite**: Build tool used for frontend bundling

## Requirements

### Requirement 1

**User Story:** As a developer, I want deployed changes to be immediately visible to users, so that bug fixes and new features are accessible without manual cache clearing.

#### Acceptance Criteria

1. WHEN code changes are deployed to production THEN the system SHALL force browsers to load new versions of all modified files
2. WHEN a user visits the site after deployment THEN the system SHALL serve the latest version without requiring hard refresh
3. WHEN assets are built THEN the system SHALL generate unique hashes for each file version
4. WHEN the build process completes THEN the system SHALL update all asset references with new hashed filenames
5. WHERE service workers exist THEN the system SHALL invalidate cached resources on deployment

### Requirement 2

**User Story:** As a developer, I want the build process to automatically version all assets, so that cache busting happens without manual intervention.

#### Acceptance Criteria

1. WHEN Vite builds the frontend THEN the system SHALL generate content-based hashes for all JavaScript and CSS files
2. WHEN HTML files reference assets THEN the system SHALL include hash-based filenames in all script and link tags
3. WHEN images and media files are processed THEN the system SHALL apply versioning to prevent stale cached images
4. WHEN the index.html is generated THEN the system SHALL include a cache-busting meta tag with build timestamp
5. WHEN API calls are made THEN the system SHALL include version headers to prevent API response caching

### Requirement 3

**User Story:** As a user, I want to always see the latest version of the application, so that I experience the most recent features and bug fixes.

#### Acceptance Criteria

1. WHEN a new version is deployed THEN the system SHALL detect version mismatch between cached and live versions
2. WHEN version mismatch is detected THEN the system SHALL automatically reload the page to fetch new version
3. WHEN the application loads THEN the system SHALL verify it is running the latest deployed version
4. WHEN cache headers are set THEN the system SHALL configure appropriate cache control directives for each resource type
5. WHEN users access the site THEN the system SHALL provide visual indication of current version number

### Requirement 4

**User Story:** As a developer, I want proper cache control headers on all resources, so that browsers and CDNs cache appropriately without preventing updates.

#### Acceptance Criteria

1. WHEN serving HTML files THEN the system SHALL set cache-control headers to no-cache or short TTL
2. WHEN serving hashed assets (JS/CSS) THEN the system SHALL set long-term cache headers with immutable directive
3. WHEN serving API responses THEN the system SHALL include appropriate cache-control headers based on data volatility
4. WHEN serving images THEN the system SHALL set moderate cache TTL with validation requirements
5. WHEN deployment occurs THEN the system SHALL purge CDN cache for affected resources

### Requirement 5

**User Story:** As a developer, I want the deployment process to include cache invalidation steps, so that CDN and browser caches are cleared automatically.

#### Acceptance Criteria

1. WHEN frontend deployment completes on Netlify THEN the system SHALL trigger automatic cache purge
2. WHEN backend deployment completes on Render THEN the system SHALL clear any API response caches
3. WHEN build artifacts are generated THEN the system SHALL include a manifest file with version information
4. WHEN the application starts THEN the system SHALL log the current version for debugging
5. WHEN cache purge fails THEN the system SHALL log errors and notify developers

### Requirement 6

**User Story:** As a developer, I want to verify that filtering by location and category works correctly after deployment, so that users see only relevant services.

#### Acceptance Criteria

1. WHEN a user selects a location filter THEN the system SHALL return only services matching that exact location
2. WHEN a user selects a category filter THEN the system SHALL return only services in that specific category
3. WHEN both location and category filters are applied THEN the system SHALL apply AND logic to show only services matching both criteria
4. WHEN no services match the filters THEN the system SHALL display an appropriate empty state message
5. WHEN the backend filters services THEN the system SHALL log filter parameters and results for debugging

### Requirement 7

**User Story:** As a developer, I want a deployment verification script, so that I can confirm changes are live and working correctly.

#### Acceptance Criteria

1. WHEN deployment completes THEN the system SHALL provide a script to verify the deployed version
2. WHEN the verification script runs THEN the system SHALL check frontend version matches expected build
3. WHEN the verification script runs THEN the system SHALL test API endpoints return expected responses
4. WHEN the verification script runs THEN the system SHALL verify filtering logic works correctly
5. WHEN verification fails THEN the system SHALL provide detailed error messages indicating what is wrong
