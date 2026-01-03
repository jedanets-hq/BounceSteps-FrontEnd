# Requirements Document

## Introduction

Hii ni spec ya maboresho kwenye Traveler Portal ya iSafari Global, hasa sehemu ya Traveler Dashboard. Maboresho yanalenga kuboresha My Trips tab kuonyesha trips zilizopangwa vizuri na status, pamoja na kuboresha Overview tab kuonyesha bookings za services moja kwa moja badala ya trips.

## Glossary

- **Traveler Dashboard**: Dashboard kuu ya mtumiaji wa aina ya traveler inayoonyesha trips, bookings, na profile
- **My Trips Tab**: Tab inayoonyesha safari za mtumiaji zilizopangwa kwa kila trip moja
- **Overview Tab**: Tab ya muhtasari inayoonyesha bookings za services moja kwa moja
- **Trip**: Mkusanyiko wa services zilizobookiwa kwa safari moja (inaweza kuwa na services nyingi)
- **Booking**: Reservation ya service moja (accommodation, transport, experience, n.k.)
- **Trip Status**: Hali ya trip - completed (imekamilika) au pending (haijakamilika)
- **Service**: Huduma inayotolewa na service provider (accommodation, transport, tour, n.k.)

## Requirements

### Requirement 1

**User Story:** As a traveler, I want to see all my trips organized individually in the My Trips tab, so that I can easily track each trip separately.

#### Acceptance Criteria

1. WHEN a traveler views the My Trips tab THEN the System SHALL display each trip as a separate card with trip name, destination, and date range
2. WHEN displaying trips THEN the System SHALL group related bookings under their respective trip
3. WHEN a trip has multiple services THEN the System SHALL show a count of services included in that trip

### Requirement 2

**User Story:** As a traveler, I want to see the status of each trip (completed or pending), so that I can quickly identify which trips are done and which are upcoming.

#### Acceptance Criteria

1. WHEN a traveler views a trip card THEN the System SHALL display a status badge showing "Completed" or "Pending"
2. WHEN all services in a trip have been completed THEN the System SHALL mark the trip status as "Completed" with a green badge
3. WHEN any service in a trip is still pending or upcoming THEN the System SHALL mark the trip status as "Pending" with a yellow badge
4. WHEN displaying the status badge THEN the System SHALL use clear visual indicators (colors and icons) to differentiate between completed and pending trips

### Requirement 3

**User Story:** As a traveler, I want a "View" button on each trip card, so that I can see all services included in that specific trip.

#### Acceptance Criteria

1. WHEN a traveler views a trip card THEN the System SHALL display a "View" button on each trip card
2. WHEN a traveler clicks the "View" button THEN the System SHALL open a modal or expand section showing all services booked for that trip
3. WHEN displaying trip services THEN the System SHALL show service name, provider name, date, price, and booking status for each service
4. WHEN the trip details are displayed THEN the System SHALL allow the traveler to close the view and return to the trips list

### Requirement 4

**User Story:** As a traveler, I want the Overview tab to show my service bookings directly instead of trips, so that I can quickly see and manage individual service reservations.

#### Acceptance Criteria

1. WHEN a traveler views the Overview tab THEN the System SHALL display all service bookings directly as individual cards
2. WHEN displaying bookings THEN the System SHALL show service name, provider name, booking date, participants, price, and status
3. WHEN displaying bookings THEN the System SHALL NOT group them by trips but show them as flat list of individual bookings
4. WHEN there are no bookings THEN the System SHALL display an empty state with a call-to-action to browse services

### Requirement 5

**User Story:** As a traveler, I want my bookings in Overview tab to be sorted by date, so that I can see upcoming bookings first.

#### Acceptance Criteria

1. WHEN displaying bookings in Overview tab THEN the System SHALL sort bookings by booking date in ascending order (nearest date first)
2. WHEN bookings have the same date THEN the System SHALL maintain consistent ordering based on booking creation time
