# Requirements Document

## Introduction

The iSafari Global Network backend is deployed and running on Render, but the production PostgreSQL database is empty. Users cannot see any services because there is no data in the database. This feature will ensure the production database is properly seeded with test data so that services are visible to users.

## Glossary

- **Backend**: The Node.js/Express server running on Render at https://isafarinetworkglobal-2.onrender.com
- **Production Database**: The PostgreSQL database hosted on Render that stores all application data
- **Seed Data**: Initial test data including services, providers, and users that populate the database
- **Render**: Cloud platform hosting the backend and database
- **Database Seeding**: The process of populating a database with initial data

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to seed the production database with test data, so that users can see and interact with services on the live platform.

#### Acceptance Criteria

1. WHEN the seed script runs THEN the system SHALL connect to the production PostgreSQL database on Render
2. WHEN the seed script executes THEN the system SHALL insert test services across all categories (Tours, Accommodation, Transportation, Events)
3. WHEN the seed script completes THEN the system SHALL insert test service providers with verified accounts
4. WHEN the seed script finishes THEN the system SHALL insert test users (travelers and providers)
5. WHEN data is inserted THEN the system SHALL ensure all foreign key relationships are properly maintained

### Requirement 2

**User Story:** As a developer, I want to verify the database seeding was successful, so that I can confirm services are available through the API.

#### Acceptance Criteria

1. WHEN the seeding completes THEN the system SHALL log the count of inserted records for each table
2. WHEN verification runs THEN the system SHALL query the production database and display service counts
3. WHEN verification runs THEN the system SHALL test the /api/services endpoint and confirm services are returned
4. WHEN verification runs THEN the system SHALL test the /api/providers endpoint and confirm providers are returned
5. WHEN errors occur THEN the system SHALL display clear error messages with troubleshooting guidance

### Requirement 3

**User Story:** As a system administrator, I want to ensure the seed script is idempotent, so that running it multiple times does not create duplicate data.

#### Acceptance Criteria

1. WHEN the seed script runs THEN the system SHALL check if data already exists before inserting
2. WHEN duplicate data is detected THEN the system SHALL skip insertion and log a warning
3. WHEN the script runs multiple times THEN the system SHALL maintain data integrity without duplicates
4. WHEN cleaning is needed THEN the system SHALL provide a clear command to reset the database
5. WHEN resetting THEN the system SHALL preserve database schema while removing all data

### Requirement 4

**User Story:** As a developer, I want clear documentation on how to seed the production database, so that I can perform this operation safely and correctly.

#### Acceptance Criteria

1. WHEN documentation is provided THEN the system SHALL include step-by-step instructions for seeding
2. WHEN documentation is provided THEN the system SHALL explain how to obtain the DATABASE_URL from Render
3. WHEN documentation is provided THEN the system SHALL include commands for both local and production seeding
4. WHEN documentation is provided THEN the system SHALL include troubleshooting steps for common errors
5. WHEN documentation is provided THEN the system SHALL include verification steps to confirm success
