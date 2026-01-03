# Requirements Document

## Introduction

Hii ni spec ya kuboresha workflow ya Journey Planner na Traveler Dashboard kwenye iSafari Global platform. Mabadiliko yanalenga kuboresha uzoefu wa traveler wakati wa kupanga safari yake, kuongeza favorite providers, na kuboresha mfumo wa malipo ambapo kila service inalipwa kwa njia ya provider husika.

## Glossary

- **Journey Planner**: Sehemu ya kupanga safari ambapo traveler anachagua destination, services, na providers
- **Traveler Dashboard**: Dashboard ya traveler inayoonyesha trips, favorites, cart, na profile
- **Service**: Huduma inayotolewa na provider (Accommodation, Transportation, Experience, Event Access)
- **Provider**: Mtoa huduma ambaye anatoa services kwenye platform
- **Favorite Provider**: Provider ambaye traveler amemfuata/amempenda
- **Your Trip**: Sehemu inayoonyesha safari zilizosaved na traveler
- **Add to Plan**: Kitendo cha kuongeza service kwenye plan ya safari
- **Add to Favorite**: Kitendo cha kuongeza provider kwenye orodha ya favorites

## Requirements

### Requirement 1: Service Filtering by Category and Location

**User Story:** As a traveler, I want to see only services that match my selected category AND location, so that I can find relevant services without confusion.

#### Acceptance Criteria

1. WHEN a traveler selects a service category (e.g., Accommodation) THEN the Journey Planner SHALL display only services from that specific category
2. WHEN a traveler selects a location THEN the Journey Planner SHALL display only services available in that specific location
3. WHEN a traveler selects both category and location THEN the Journey Planner SHALL display only services matching BOTH criteria exactly
4. IF a traveler selects Accommodation category THEN the Journey Planner SHALL NOT display Transportation, Experience, or Event Access services
5. IF a traveler selects a specific district THEN the Journey Planner SHALL NOT display services from other districts

### Requirement 2: Provider Card Button Changes

**User Story:** As a traveler, I want to add providers to my favorites instead of selecting them directly, so that I can follow providers I like and see their new services.

#### Acceptance Criteria

1. WHEN viewing a provider card in Journey Planner THEN the system SHALL display "View Profile" and "Add to Favorite" buttons only
2. WHEN the system displays provider cards THEN the system SHALL NOT display "+select" button
3. WHEN a traveler clicks "Add to Favorite" THEN the system SHALL save the provider to the traveler's favorites list
4. WHEN a traveler adds a provider to favorites THEN the provider SHALL appear in the Favorites section of Traveler Dashboard

### Requirement 3: Favorites Section in Dashboard

**User Story:** As a traveler, I want to see all my favorite providers in one place, so that I can easily access providers I follow.

#### Acceptance Criteria

1. WHEN a traveler navigates to Favorites tab THEN the Traveler Dashboard SHALL display all saved favorite providers
2. WHEN displaying favorite providers THEN the system SHALL show provider name, location, verification status, and follower count
3. WHEN a traveler clicks "View Profile" on a favorite provider THEN the system SHALL navigate to that provider's profile page
4. WHEN a traveler removes a provider from favorites THEN the system SHALL remove the provider from the favorites list immediately

### Requirement 4: Service Details View in Provider Profile

**User Story:** As a traveler, I want to view detailed information about a service before adding it to my plan, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN a traveler clicks "View Details" on a service THEN the system SHALL display a modal with complete service information
2. WHEN displaying service details THEN the system SHALL show service name, description, price, location, category, images, and accepted payment methods
3. WHEN displaying service details THEN the system SHALL show provider information including name and verification status
4. WHEN viewing service details THEN the system SHALL provide "Add to Plan" button to add service to current journey plan

### Requirement 5: Journey Plan Workflow Changes

**User Story:** As a traveler, I want to save my journey plan and continue to payment separately, so that I can plan my trip before committing to payment.

#### Acceptance Criteria

1. WHEN a traveler completes service selection THEN the system SHALL display "Save Plan" and "Continue to Cart & Payments" buttons
2. WHEN the system displays action buttons THEN the system SHALL NOT display "Continue to Cart and Payment" as a single combined action with save
3. WHEN a traveler clicks "Save Plan" THEN the system SHALL save the journey to "Your Trip" section without adding to cart
4. WHEN a traveler clicks "Continue to Cart & Payments" THEN the system SHALL add services to cart AND save to "Your Trip" AND navigate to payment page
5. WHEN a service is added to plan THEN the system SHALL display "Add to Plan" text instead of any other selection text

### Requirement 6: Your Trip Section Rename and Functionality

**User Story:** As a traveler, I want to see my saved journeys in "Your Trip" section with all details, so that I can track and manage my planned trips.

#### Acceptance Criteria

1. WHEN displaying saved journeys section THEN the Traveler Dashboard SHALL use "Your Trip" as the section title instead of "Your Saved Journeys"
2. WHEN a traveler saves a journey plan THEN the system SHALL display it in "Your Trip" section
3. WHEN displaying a saved trip THEN the system SHALL show all selected services, dates, number of travelers, and total cost
4. WHEN a traveler clicks "View Details" on a saved trip THEN the system SHALL display complete trip information including each service with its details
5. WHEN viewing trip details THEN the system SHALL show service name, date range, number of travelers, and individual service costs
6. WHEN a saved trip has status "saved" THEN the system SHALL display "Continue to Payments" button

### Requirement 7: Payment Workflow per Service Provider

**User Story:** As a traveler, I want to pay for each service separately according to each provider's payment methods, so that I can complete payments based on provider requirements.

#### Acceptance Criteria

1. WHEN a traveler views cart with multiple services THEN the system SHALL display total cost for all services
2. WHEN displaying cart items THEN the system SHALL show each service with its provider's accepted payment methods
3. WHEN a traveler proceeds to payment THEN the system SHALL allow payment for one service at a time
4. WHEN displaying payment options THEN the system SHALL show only the payment methods accepted by that specific service provider
5. WHEN a traveler completes payment for one service THEN the system SHALL update that service status and allow payment for next service

### Requirement 8: Provider Follow System

**User Story:** As a traveler, I want to follow providers I like, so that I can see their new services first when browsing destinations.

#### Acceptance Criteria

1. WHEN viewing a provider profile THEN the system SHALL display a "Follow" button
2. WHEN a traveler clicks "Follow" THEN the system SHALL add the provider to traveler's followed list
3. WHEN a traveler follows a provider THEN the system SHALL display real follower count on provider profile
4. WHEN a followed provider adds a new service THEN the system SHALL display that service at the top of destination discovery page
5. WHEN a traveler has already followed a provider THEN the system SHALL display "Following" status instead of "Follow" button

### Requirement 9: My Trips Section Enhancement

**User Story:** As a traveler, I want to see all my trip details in My Trips section, so that I can review and continue with payments.

#### Acceptance Criteria

1. WHEN a traveler navigates to My Trips tab THEN the system SHALL display all saved journey plans
2. WHEN displaying a trip THEN the system SHALL show destination, services count, total cost, and traveler count
3. WHEN a traveler clicks "View Details" THEN the system SHALL display complete trip breakdown with each service, dates, and costs
4. WHEN viewing trip details THEN the system SHALL display "Continue to Payments" button for unpaid trips
5. WHEN a traveler clicks "Continue to Payments" THEN the system SHALL navigate to cart with trip services ready for payment

