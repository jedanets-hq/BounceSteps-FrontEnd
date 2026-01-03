# Requirements Document

## Introduction

This specification addresses critical workflow issues in the Journey Planner feature of iSafari Global. The current implementation has several problems with service filtering, provider profile actions, service details viewing, and trip management that need to be fixed to provide a seamless user experience.

## Glossary

- **Journey Planner**: The system feature that allows travelers to plan trips by selecting locations, services, and creating itineraries
- **Service**: A bookable offering provided by a service provider (accommodation, transportation, experience, etc.)
- **Provider**: A business or individual offering services on the platform
- **Category**: The type of service (Accommodation, Transportation, Experience Design, Event Access)
- **Location**: Geographic area consisting of Country > Region > District > Sublocation hierarchy
- **Trip Plan**: A saved collection of selected services with travel details
- **Favorite Provider**: A provider that a traveler has marked for quick access
- **Follow**: Action to subscribe to a provider's updates and new services

## Requirements

### Requirement 1: Service Category and Location Filtering

**User Story:** As a traveler, I want to see only services that match my selected category AND location, so that I don't get confused by irrelevant services.

#### Acceptance Criteria

1. WHEN a traveler selects a service category (e.g., Accommodation) THEN the system SHALL display only services from that exact category
2. WHEN a traveler selects a location THEN the system SHALL display only services from that exact location
3. WHEN a traveler selects both category and location THEN the system SHALL display only services that match BOTH the category AND location exactly
4. WHEN displaying services THEN the system SHALL NOT show services from other categories mixed with the selected category
5. WHEN a traveler changes the selected category THEN the system SHALL immediately update to show only services from the new category

### Requirement 2: Provider Profile Actions

**User Story:** As a traveler, I want to add providers to my favorites instead of selecting them, so that I can easily find and follow providers I like.

#### Acceptance Criteria

1. WHEN viewing a provider profile THEN the system SHALL display an "Add to Favorite" button instead of a "+Select" button
2. WHEN a traveler clicks "Add to Favorite" THEN the system SHALL add the provider to the traveler's favorites list
3. WHEN a provider is added to favorites THEN the system SHALL update the button to show "Following" or similar confirmation
4. WHEN a traveler views their dashboard THEN the system SHALL display a "Favorites" category showing all favorited providers
5. WHEN a favorited provider adds a new service THEN the system SHALL display that service prominently in the traveler's destination discovery feed

### Requirement 3: Service Details Viewing

**User Story:** As a traveler, I want to view detailed information about a service before adding it to my plan, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN viewing available services in a provider profile THEN the system SHALL display a "View Details" button for each service
2. WHEN a traveler clicks "View Details" THEN the system SHALL open a modal showing complete service information
3. WHEN the service details modal is open THEN the system SHALL display service description, images, pricing, amenities, payment methods, and contact information
4. WHEN viewing service details THEN the system SHALL provide an "Add to Plan" button within the modal
5. WHEN a traveler clicks "Add to Plan" THEN the system SHALL add the service to their journey plan and close the modal

### Requirement 4: Journey Plan Management

**User Story:** As a traveler, I want to save my journey plan with all selected services and view it later, so that I can plan my trip in multiple sessions.

#### Acceptance Criteria

1. WHEN a traveler selects services from different categories THEN the system SHALL save all selected services to the journey plan
2. WHEN viewing the journey plan THEN the system SHALL display all selected services grouped by category
3. WHEN a journey plan is saved THEN the system SHALL store the plan with location, dates, travelers count, and all selected services
4. WHEN a traveler views their dashboard THEN the system SHALL display saved journey plans in a "Your Trip" section
5. WHEN a traveler clicks "View Details" on a saved plan THEN the system SHALL show all services, dates, location, travelers, and total cost

### Requirement 5: Payment Workflow Separation

**User Story:** As a traveler, I want to save my journey plan first and then proceed to payment separately, so that I can review my plan before committing to payment.

#### Acceptance Criteria

1. WHEN completing service selection THEN the system SHALL display two separate buttons: "Save Plan" and "Continue to Cart and Payment"
2. WHEN a traveler clicks "Save Plan" THEN the system SHALL save the journey plan without proceeding to payment
3. WHEN a traveler clicks "Continue to Cart and Payment" THEN the system SHALL save the plan AND navigate to the cart/payment page
4. WHEN a saved plan exists THEN the system SHALL display it in the dashboard with a "Continue to Payment" button
5. WHEN viewing a saved plan in the dashboard THEN the system SHALL allow the traveler to proceed to payment at any time

### Requirement 6: Multi-Service Payment Handling

**User Story:** As a traveler, I want to understand that each service requires separate payment to its provider, so that I know I cannot pay for all services at once.

#### Acceptance Criteria

1. WHEN viewing the cart with multiple services THEN the system SHALL display the total cost of all services
2. WHEN viewing payment options THEN the system SHALL explain that each service must be paid separately to its provider
3. WHEN a service has specific payment methods THEN the system SHALL display only those payment methods for that service
4. WHEN proceeding to payment THEN the system SHALL guide the traveler to pay for each service individually
5. WHEN a traveler completes payment for one service THEN the system SHALL update the booking status for that service only

### Requirement 7: Provider Follow System

**User Story:** As a traveler, I want to follow providers I like and see their new services highlighted, so that I can discover relevant services easily.

#### Acceptance Criteria

1. WHEN viewing a provider profile THEN the system SHALL display a "Follow" button with the current follower count
2. WHEN a traveler clicks "Follow" THEN the system SHALL increment the follower count and update the button to "Following"
3. WHEN a traveler unfollows a provider THEN the system SHALL decrement the follower count and update the button to "Follow"
4. WHEN a followed provider creates a new service THEN the system SHALL display that service at the top of the destination discovery page
5. WHEN viewing the dashboard favorites section THEN the system SHALL display all followed providers with their follower counts

### Requirement 8: Trip Details Display

**User Story:** As a traveler, I want to view complete details of my saved trips including all services, dates, and costs, so that I can review my plans.

#### Acceptance Criteria

1. WHEN a traveler clicks "View Details" on a trip THEN the system SHALL display a modal with complete trip information
2. WHEN the trip details modal is open THEN the system SHALL show all services with their names, providers, prices, and categories
3. WHEN viewing trip details THEN the system SHALL display the trip dates, location, number of travelers, and total cost
4. WHEN viewing a saved trip THEN the system SHALL provide a "Continue to Payment" button if payment is pending
5. WHEN viewing a paid trip THEN the system SHALL display the payment status for each service

### Requirement 9: Dashboard Trip Organization

**User Story:** As a traveler, I want my dashboard to show "Your Trip" instead of "Your Saved Journeys", so that the terminology is clearer.

#### Acceptance Criteria

1. WHEN viewing the traveler dashboard THEN the system SHALL display a section titled "Your Trip"
2. WHEN the "Your Trip" section is displayed THEN the system SHALL show all saved journey plans
3. WHEN a journey plan is displayed THEN the system SHALL show the location, dates, number of services, and total cost
4. WHEN multiple journey plans exist THEN the system SHALL display them in chronological order with the most recent first
5. WHEN a journey plan has pending payment THEN the system SHALL display a visual indicator showing payment is required

### Requirement 10: Service Selection Persistence

**User Story:** As a traveler, I want all my selected services to be saved automatically as I add them, so that I don't lose my selections if I navigate away.

#### Acceptance Criteria

1. WHEN a traveler adds a service to their plan THEN the system SHALL immediately save it to local storage
2. WHEN a traveler navigates away from the journey planner THEN the system SHALL preserve all selected services
3. WHEN a traveler returns to the journey planner THEN the system SHALL restore their previous selections
4. WHEN viewing selected services THEN the system SHALL display them grouped by category
5. WHEN a traveler removes a service THEN the system SHALL immediately update the saved plan
