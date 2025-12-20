# Implementation Plan

- [ ] 1. Create utility functions for trip and booking management
  - [ ] 1.1 Create tripUtils.js with calculateTripStatus, groupBookingsIntoTrips, and sortBookingsByDate functions
    - Implement calculateTripStatus to return 'completed' if all services completed, else 'pending'
    - Implement groupBookingsIntoTrips to group bookings by trip_id or booking_date
    - Implement sortBookingsByDate to sort bookings ascending by date
    - _Requirements: 2.2, 2.3, 1.2, 1.3, 5.1, 5.2_
  - [ ]* 1.2 Write property test for trip status calculation
    - **Property 1: Trip Status Calculation**
    - **Validates: Requirements 2.2, 2.3**
  - [ ]* 1.3 Write property test for booking grouping consistency
    - **Property 2: Booking Grouping Consistency**
    - **Validates: Requirements 1.2, 1.3**
  - [ ]* 1.4 Write property test for booking sort order
    - **Property 6: Booking Sort Order**
    - **Validates: Requirements 5.1, 5.2**

- [ ] 2. Create BookingCard component for Overview tab
  - [ ] 2.1 Create BookingCard.jsx component
    - Display service name, provider name, booking date, participants, price, and status
    - Use appropriate status badges (confirmed=green, pending=yellow, cancelled=red)
    - _Requirements: 4.1, 4.2_
  - [ ]* 2.2 Write property test for booking card completeness
    - **Property 4: Booking Card Completeness**
    - **Validates: Requirements 4.2**

- [ ] 3. Update Overview tab to show bookings directly
  - [ ] 3.1 Modify Overview tab in traveler dashboard index.jsx
    - Replace "Upcoming Adventures" section with "My Bookings" section
    - Display all bookings as flat list using BookingCard component
    - Sort bookings by date using sortBookingsByDate utility
    - Show empty state with "Browse Services" button when no bookings
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1_
  - [ ]* 3.2 Write property test for bookings flat list structure
    - **Property 5: Bookings Flat List Structure**
    - **Validates: Requirements 4.3**

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create TripCard component for My Trips tab
  - [ ] 5.1 Create TripCard.jsx component
    - Display trip name, destination, date range, and service count
    - Show status badge (Completed=green, Pending=yellow)
    - Include "View" button to see trip services
    - _Requirements: 1.1, 2.1, 2.4, 3.1_

- [ ] 6. Create TripServicesModal component
  - [ ] 6.1 Create TripServicesModal.jsx component
    - Display modal with list of all services in the trip
    - Show service name, provider, date, price, and status for each service
    - Include close button to return to trips list
    - _Requirements: 3.2, 3.3, 3.4_
  - [ ]* 6.2 Write property test for service details completeness
    - **Property 3: Service Details Completeness**
    - **Validates: Requirements 3.3**

- [ ] 7. Update My Trips tab to show organized trips
  - [ ] 7.1 Modify My Trips tab in traveler dashboard index.jsx
    - Group bookings into trips using groupBookingsIntoTrips utility
    - Display each trip using TripCard component
    - Handle View button click to open TripServicesModal
    - Show empty state with "Plan Your First Trip" button when no trips
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 3.2_

- [ ] 8. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
