# Requirements Document

## Introduction

This document outlines the requirements for fixing the critical location mapping issue in the Journey Planner that prevents service providers from being displayed to travelers. The issue stems from a mismatch between location names used in the frontend LocationSelector component (sourced from tanzaniaLocations.json) and the location names stored in the database for services and providers.

## Glossary

- **LocationSelector**: Frontend React component that allows users to select their destination using hierarchical dropdowns (Region → District → Ward → Street)
- **Journey Planner**: Feature that allows travelers to plan trips by selecting location, dates, services, and providers
- **Service**: An offering from a provider (accommodation, transportation, tours, etc.)
- **Provider**: A business that offers services to travelers
- **Location Hierarchy**: The structured organization of locations: Region → District → Area/Ward
- **Location Mapping**: The process of matching location names between frontend and database
- **Case-Insensitive Matching**: Comparing strings without regard to uppercase/lowercase differences

## Requirements

### Requirement 1: Location Name Standardization

**User Story:** As a system administrator, I want location names to be consistent between the frontend and database, so that location-based filtering works correctly.

#### Acceptance Criteria

1. WHEN a service is created with location data THEN the system SHALL normalize location names to match the standard format used in tanzaniaLocations.json
2. WHEN comparing location names for filtering THEN the system SHALL use case-insensitive comparison
3. WHEN a location name has multiple valid variations (e.g., "Mbeya Urban" vs "MBEYA") THEN the system SHALL maintain a mapping table to resolve aliases
4. WHEN displaying location names to users THEN the system SHALL use the canonical name from tanzaniaLocations.json
5. THE system SHALL provide a migration script to update existing service and provider location data to use standardized names

### Requirement 2: Flexible Location Matching

**User Story:** As a traveler, I want to see all relevant service providers when I select a location, even if there are minor variations in how locations are named.

#### Acceptance Criteria

1. WHEN filtering services by location THEN the system SHALL match services using both exact names and known aliases
2. WHEN a district name matches a region name (e.g., "Mbeya" district in "Mbeya" region) THEN the system SHALL correctly distinguish between them
3. WHEN a service has a region but no district THEN the system SHALL show that service for all district searches within that region
4. WHEN a service has a district but no specific area THEN the system SHALL show that service for all area searches within that district
5. THE system SHALL log location matching decisions for debugging purposes

### Requirement 3: Location Data Validation

**User Story:** As a service provider, I want to be guided to select valid locations when creating services, so that my services appear in relevant searches.

#### Acceptance Criteria

1. WHEN a provider creates or edits a service THEN the system SHALL provide location dropdowns populated from tanzaniaLocations.json
2. WHEN a provider enters a custom location name THEN the system SHALL validate it against known locations and suggest corrections
3. WHEN a service is saved with invalid location data THEN the system SHALL prevent the save and display a clear error message
4. WHEN a provider's location doesn't match any services THEN the system SHALL display a warning in their dashboard
5. THE system SHALL provide a location validation API endpoint that returns whether a location combination is valid

### Requirement 4: Journey Planner Provider Display

**User Story:** As a traveler using the Journey Planner, I want to see all service providers that match my selected location and service categories, so that I can choose the best options for my trip.

#### Acceptance Criteria

1. WHEN a traveler selects a location in step 1 THEN the system SHALL store the complete location hierarchy (region, district, ward)
2. WHEN a traveler selects service categories in step 3 THEN the system SHALL store the selected categories
3. WHEN a traveler reaches step 4 THEN the system SHALL fetch services matching BOTH the location AND selected categories
4. WHEN services are fetched THEN the system SHALL group them by provider and display provider cards
5. WHEN no providers match the exact location THEN the system SHALL show providers from the parent location level (e.g., district-level or region-level providers)
6. WHEN no providers are found at any level THEN the system SHALL display a helpful message with suggestions to broaden the search
7. THE system SHALL display the number of matching providers and services found

### Requirement 5: Location Mapping Table

**User Story:** As a system, I want to maintain a mapping between location name variations, so that I can match locations regardless of naming inconsistencies.

#### Acceptance Criteria

1. THE system SHALL maintain a location_aliases table with columns: canonical_name, alias_name, location_type (region/district/area)
2. WHEN performing location searches THEN the system SHALL check both the canonical name and all aliases
3. WHEN a new location alias is discovered THEN the system SHALL log it for admin review
4. THE system SHALL provide an admin interface to manage location aliases
5. THE system SHALL include common aliases in the initial migration (e.g., "Mbeya Urban" → "MBEYA", "Mbeya CBD" → "MBEYA CBD")

### Requirement 6: Diagnostic and Debugging Tools

**User Story:** As a developer, I want diagnostic tools to identify and fix location matching issues, so that I can quickly resolve problems.

#### Acceptance Criteria

1. THE system SHALL provide a diagnostic script that checks for location mismatches between services and tanzaniaLocations.json
2. WHEN the diagnostic script runs THEN it SHALL report services with unrecognized location names
3. WHEN the diagnostic script runs THEN it SHALL suggest corrections based on fuzzy matching
4. THE system SHALL log all location filtering operations with input parameters and results
5. THE system SHALL provide an API endpoint that returns location matching statistics (e.g., how many services match each location)

### Requirement 7: Frontend Location Selector Enhancement

**User Story:** As a traveler, I want the location selector to show me how many services are available in each location, so that I can make informed choices.

#### Acceptance Criteria

1. WHEN displaying location dropdowns THEN the system SHALL show the count of available services next to each location name
2. WHEN a location has no services THEN the system SHALL gray out that option or hide it
3. WHEN a traveler selects a location with no services THEN the system SHALL display a message suggesting nearby locations with services
4. THE system SHALL cache location service counts for performance
5. THE system SHALL update service counts in real-time when new services are added

### Requirement 8: Data Migration and Cleanup

**User Story:** As a system administrator, I want to migrate existing location data to the standardized format, so that all services become discoverable.

#### Acceptance Criteria

1. THE system SHALL provide a migration script that updates all service location data to use canonical names
2. WHEN the migration runs THEN it SHALL create a backup of the original data
3. WHEN the migration encounters an unmappable location THEN it SHALL log it for manual review
4. WHEN the migration completes THEN it SHALL generate a report showing all changes made
5. THE system SHALL provide a rollback script in case the migration needs to be reversed
6. THE migration SHALL be idempotent (safe to run multiple times)

