# Requirements Document

## Introduction

Hii ni spec ya maboresho kwenye Traveler Dashboard ya iSafari Global. Maboresho yanalenga kuboresha user experience kwa kurekebisha buttons na navigation kwenye My Trips tab, Overview tab, na kubadilisha login redirect behavior kwa travelers.

## Glossary

- **Traveler Dashboard**: Dashboard kuu ya mtumiaji wa aina ya traveler inayoonyesha trips, bookings, na profile
- **My Trips Tab**: Tab inayoonyesha safari za mtumiaji (upcoming na past trips)
- **Overview Tab**: Tab ya muhtasari inayoonyesha stats na quick actions
- **Plan Journey Tab**: Ukurasa wa `/journey-planner` unaotumika kupanga safari mpya
- **Create Story**: Kipengele cha kuunda hadithi za safari kwenye profile
- **Main Home**: Ukurasa mkuu wa homepage (`/`)

## Requirements

### Requirement 1

**User Story:** As a traveler, I want the "Plan Your First Trip" button in My Trips tab to navigate me to the journey planner, so that I can easily start planning my first safari.

#### Acceptance Criteria

1. WHEN a traveler clicks the "Plan Your First Trip" button in the empty state of My Trips tab THEN the System SHALL navigate the user to the `/journey-planner` page
2. WHEN the navigation occurs THEN the System SHALL use React Router navigation instead of window.location.href for smooth SPA experience

### Requirement 2

**User Story:** As a traveler, I want the "Plan New Adventure" button removed from My Trips tab header, so that the interface is cleaner and less cluttered.

#### Acceptance Criteria

1. WHEN a traveler views the My Trips tab THEN the System SHALL NOT display the "Plan New Adventure" button in the header section
2. WHEN the button is removed THEN the System SHALL maintain the existing layout and styling of the remaining elements

### Requirement 3

**User Story:** As a traveler, I want the "Create Story" button to work properly, so that I can share my travel experiences.

#### Acceptance Criteria

1. WHEN a traveler clicks the "Create Story" button in My Trips tab THEN the System SHALL navigate the user to the profile page with stories tab and create action (`/profile?tab=stories&action=create`)
2. WHEN the navigation occurs THEN the System SHALL use React Router navigation for smooth SPA experience

### Requirement 4

**User Story:** As a traveler, I want the "Plan New Trip" button removed from the Overview tab, so that the dashboard is cleaner.

#### Acceptance Criteria

1. WHEN a traveler views the Overview tab THEN the System SHALL NOT display the "Plan New Trip" button in the "Upcoming Adventures" section header
2. WHEN the button is removed THEN the System SHALL maintain the section title and existing layout

### Requirement 5

**User Story:** As a traveler, I want to be redirected to the main homepage after login instead of the dashboard, so that I can explore services and destinations first.

#### Acceptance Criteria

1. WHEN a traveler successfully logs in THEN the System SHALL redirect the user to the main homepage (`/`) instead of `/profile` or dashboard
2. WHEN the redirect parameter is not specified in the login URL THEN the System SHALL default to redirecting to the main homepage
3. WHEN a specific redirect URL is provided in the login parameters THEN the System SHALL honor that redirect URL
