# Requirements Document

## Introduction

This specification addresses critical workflow issues in the Journey Planner feature where service filtering, provider profiles, and trip management are not functioning correctly. The system currently shows services from wrong categories and locations, lacks proper favorite provider functionality, and has incomplete payment workflows.

## Glossary

- **Journey Planner**: The system component that allows travelers to plan trips by selecting location, dates, and services
- **Service**: A bookable offering from a provider (accommodation, transportation, experience, etc.)
- **Provider**: A business or individual offering services to travelers
- **Category**: The type of service (Accommodation, Transportation, Experience Design, Event Access)
- **Location**: Geographic area including region, district, and sublocation
- **Favorite Provider**: A provider that a traveler has marked for quick access
- **Trip Plan**: A collection of selected services saved for a specific journey
- **Service Details Modal**: A popup showing complete information about a service

## Requirements

### Requirement 1: Strict Service Filtering by Category and Location

**User Story:** As a traveler planning a journey, I want to see only services that match my selected category and location, so that I don't waste time viewing irrelevant options.

#### Acceptance Criteria

1. WHEN a traveler selects a service category THEN the system SHALL display only services that match that exact category
2. WHEN a traveler selects a location THEN the system SHALL display only services available in that specific location
3. WHEN a traveler selects both category and location THEN the system SHALL display only services matching both criteria simultaneously
4. WHEN no services match the selected criteria THEN the system SHALL display a clear message indicating no services are available
5. WHEN a traveler changes category selection THEN the system SHALL immediately update to show only services from the new category

### Requirement 2: Provider Profile View Button Replacement

**User Story:** As a traveler viewing providers, I want to add providers to my favorites instead of selecting them, so that I can easily find providers I like later.

#### Acceptance Criteria

1. WHEN viewing a provider card THEN the system SHALL display an "Add to Favorite" button instead of a "+Select" button
2. WHEN a traveler clicks "Add to Favorite" THEN the system SHALL save the provider to the traveler's favorites list
3. WHEN a provider is already in favorites THEN the button SHALL show "Following" or similar indicator
4. WHEN a traveler views their dashboard THEN the system SHALL display a "Favorites" category showing all favorited providers
5. WHEN a traveler unfollows a provider THEN the system SHALL remove the provider from the favorites list

### Requirement 3: Service Details Modal in Provider Profile

**User Story:** As a traveler viewing a provider's profile, I want to see detailed information about each service, so that I can make informed decisions before adding to my plan.

#### Acceptance Criteria

1. WHEN viewing available services on a provider profile THEN the system SHALL display a "View Details" button for each service
2. WHEN a traveler clicks "View Details" THEN the system SHALL open a modal showing complete service information
3. WHEN the service details modal is open THEN the system SHALL display service images, description, price, amenities, payment methods, and contact information
4. WHEN viewing service details THEN the system SHALL provide an "Add to Plan" button
5. WHEN a traveler clicks "Add to Plan" THEN the system SHALL add the service to their journey plan and close the modal

### Requirement 4: Journey Plan Management Workflow

**User Story:** As a traveler planning a trip, I want to add multiple services to my plan and save it before payment, so that I can review my complete itinerary.

#### Acceptance Criteria

1. WHEN a traveler adds services during journey planning THEN the system SHALL save all selected services to a journey plan
2. WHEN viewing the journey plan THEN the system SHALL display all selected services with their details and total cost
3. WHEN a journey plan is created THEN the system SHALL provide two buttons: "Save Plan" and "Continue to Cart and Payments"
4. WHEN a traveler clicks "Save Plan" THEN the system SHALL save the plan and make it visible in the dashboard under "My Trips"
5. WHEN a traveler clicks "Continue to Cart and Payments" THEN the system SHALL add all services to cart, save the plan to "My Trips", and navigate to payment page

### Requirement 5: My Trips Dashboard Section

**User Story:** As a traveler, I want to view all my saved and booked trips in one place, so that I can manage my travel plans effectively.

#### Acceptance Criteria

1. WHEN a traveler views their dashboard THEN the system SHALL display a "My Trips" section (renamed from "Your Saved Journeys")
2. WHEN viewing "My Trips" THEN the system SHALL show all saved journey plans with service details
3. WHEN a traveler clicks "View Details" on a trip THEN the system SHALL display complete trip information including services, dates, travelers, and total cost
4. WHEN viewing a saved trip THEN the system SHALL provide a "Continue to Payments" button
5. WHEN a traveler clicks "Continue to Payments" THEN the system SHALL navigate to the payment page with the trip's services

### Requirement 6: Multi-Service Payment Workflow

**User Story:** As a traveler with services from multiple providers, I want to understand that I need to pay each provider separately, so that I can complete my bookings correctly.

#### Acceptance Criteria

1. WHEN a traveler proceeds to payment with multiple services THEN the system SHALL display the total cost of all services
2. WHEN viewing payment options THEN the system SHALL indicate that each service must be paid separately to its provider
3. WHEN a traveler selects a service for payment THEN the system SHALL display that provider's accepted payment methods
4. WHEN payment is completed for a service THEN the system SHALL mark that service as paid and allow payment for the next service
5. WHEN all services are paid THEN the system SHALL mark the trip as fully booked

### Requirement 7: Provider Follow Functionality

**User Story:** As a traveler, I want to follow providers I like, so that I can see their new services prominently when they are added.

#### Acceptance Criteria

1. WHEN viewing any provider profile THEN the system SHALL display a "Follow" button with current follower count
2. WHEN a traveler clicks "Follow" THEN the system SHALL increment the follower count and mark the provider as followed
3. WHEN a followed provider adds a new service THEN the system SHALL display that service prominently in the traveler's destination discovery feed
4. WHEN a traveler unfollows a provider THEN the system SHALL decrement the follower count and remove the followed status
5. WHEN viewing follower count THEN the system SHALL display the accurate real-time number of followers

### Requirement 8: Service Details Button in Journey Planner

**User Story:** As a traveler selecting services in the journey planner, I want to view complete service details before adding to my plan, so that I know exactly what I'm booking.

#### Acceptance Criteria

1. WHEN viewing services in the journey planner THEN the system SHALL display a "View Details" button for each service
2. WHEN a traveler clicks "View Details" THEN the system SHALL open the service details modal
3. WHEN the modal is open THEN the system SHALL display all service information including provider details
4. WHEN viewing service details in the planner THEN the system SHALL provide an "Add to Plan" button
5. WHEN a traveler adds a service from the modal THEN the system SHALL add it to the journey plan and close the modal

### Requirement 9: Remove Continue to Cart from Service Details

**User Story:** As a traveler viewing service details, I want to add services to my plan first before going to cart, so that I can build a complete itinerary.

#### Acceptance Criteria

1. WHEN viewing service details modal THEN the system SHALL NOT display a "Continue to Cart and Payment" button
2. WHEN viewing service details modal THEN the system SHALL display only "Add to Plan" button (renamed from "Save to Plan")
3. WHEN a traveler adds a service to plan THEN the system SHALL save it to the current journey plan
4. WHEN a traveler completes their journey plan THEN the system SHALL provide cart and payment options from the plan summary page
5. WHEN viewing the plan summary THEN the system SHALL display both "Save Plan" and "Continue to Cart and Payments" buttons
