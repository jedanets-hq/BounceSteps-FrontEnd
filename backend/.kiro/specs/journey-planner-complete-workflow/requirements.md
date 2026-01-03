# Requirements Document

## Introduction

This document specifies the complete workflow improvements for the Journey Planner feature in iSafari Global. The changes focus on strict service filtering by category and location, replacing "+select" with "Add to Favorite", adding service details view in provider profiles, improving the trip planning flow with proper "Your Trip" section, implementing provider follow functionality with follower counts, and ensuring services appear at the top for followed providers.

## Glossary

- **Journey_Planner**: The system component that allows travelers to plan trips by selecting destination, dates, and services
- **Service_Category**: Classification of services (Accommodation, Transportation, Tours & Activities, etc.)
- **Provider**: A service provider who offers services on the platform
- **Favorite_Provider**: A provider that a traveler has marked as favorite for quick access
- **Your_Trip**: Section in dashboard showing traveler's planned journey with selected services
- **Follower**: A traveler who follows a provider to see their new services first
- **Service_Details_Modal**: A modal window that displays complete information about a specific service
- **My_Trips**: Dashboard section where saved trip plans are stored and displayed
- **Cart**: Temporary storage for services before payment
- **Payment_Method**: The method accepted by a provider for payment (Mobile Money, Card, PayPal, etc.)

## Requirements

### Requirement 1: Strict Service Filtering by Category

**User Story:** As a traveler, I want to see only services from the selected category when browsing, so that I don't see unrelated services mixed together.

#### Acceptance Criteria

1. WHEN a traveler selects a service category (e.g., Accommodation) THEN the Journey_Planner SHALL display only services matching that exact category
2. WHEN a traveler selects a different category THEN the Journey_Planner SHALL replace the displayed services with services from the new category only
3. WHEN services are displayed THEN the Journey_Planner SHALL NOT show services from other categories mixed with the selected category

### Requirement 2: Strict Service Filtering by Location

**User Story:** As a traveler, I want to see only services from my selected location, so that I find relevant providers in my destination area.

#### Acceptance Criteria

1. WHEN a traveler selects a location (region, district, sublocation) THEN the Journey_Planner SHALL display only services available in that specific location
2. WHEN a traveler changes the location THEN the Journey_Planner SHALL update the service list to show only services from the new location
3. WHEN services are displayed THEN the Journey_Planner SHALL NOT show services from other locations mixed with the selected location

### Requirement 3: Replace +Select with Add to Favorite

**User Story:** As a traveler, I want to add providers to my favorites instead of selecting them, so that I can easily find them later in my dashboard.

#### Acceptance Criteria

1. WHEN viewing provider cards in Journey_Planner THEN the system SHALL display "Add to Favorite" button instead of "+select" button
2. WHEN a traveler clicks "Add to Favorite" THEN the system SHALL save the provider to the traveler's favorites list
3. WHEN a provider is added to favorites THEN the provider SHALL appear in the Favorites section of the traveler dashboard

### Requirement 4: Service Details View in Provider Profile

**User Story:** As a traveler, I want to view detailed information about a service when viewing a provider's profile, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN viewing a provider profile THEN the system SHALL display a "View Details" button for each service
2. WHEN a traveler clicks "View Details" THEN the system SHALL display a modal with complete service information including description, price, amenities, payment methods, and contact info
3. WHEN viewing service details THEN the system SHALL display an "Add to Plan" button to add the service to the current trip plan
4. WHEN viewing service details modal THEN the system SHALL NOT display "Continue to Cart and Payment" button

### Requirement 5: Rename Your Saved Journeys to Your Trip

**User Story:** As a traveler, I want to see my planned trip clearly labeled as "Your Trip", so that I understand it's my current trip plan.

#### Acceptance Criteria

1. WHEN displaying saved journey plans THEN the system SHALL use the label "Your Trip" instead of "Your Saved Journeys"
2. WHEN a traveler views the trips section THEN the system SHALL display the "Your Trip" section prominently at the top

### Requirement 6: Service Selection and Trip Building

**User Story:** As a traveler, I want to select multiple services and see them accumulated in my trip plan, so that I can build a complete journey.

#### Acceptance Criteria

1. WHEN a traveler selects a service THEN the system SHALL add it to the current trip plan
2. WHEN multiple services are selected THEN the system SHALL display all selected services in the "Your Trip" section
3. WHEN viewing the trip summary THEN the system SHALL show all selected services with their details, dates, travelers count, and total cost

### Requirement 7: Save Plan and Continue to Payment Buttons

**User Story:** As a traveler, I want to either save my plan for later or proceed to payment, so that I have flexibility in completing my booking.

#### Acceptance Criteria

1. WHEN a traveler completes service selection THEN the system SHALL display two buttons: "Save Plan" and "Continue to Cart & Payments"
2. WHEN a traveler clicks "Save Plan" THEN the system SHALL save the trip to My Trips with status "saved" and SHALL NOT add services to cart
3. WHEN a traveler clicks "Continue to Cart & Payments" THEN the system SHALL add services to cart, save the trip to My Trips with status "pending_payment", and navigate to the cart section

### Requirement 8: Trip Details in My Trips

**User Story:** As a traveler, I want to view complete details of my saved trips, so that I can review what services I planned.

#### Acceptance Criteria

1. WHEN viewing My Trips THEN the system SHALL display each trip with all included services
2. WHEN a traveler clicks "View Details" on a trip THEN the system SHALL show service names, dates, traveler count, and total cost
3. WHEN viewing a saved trip with status "saved" THEN the system SHALL display a "Continue to Payment" button
4. WHEN a traveler clicks "Continue to Payment" on a saved trip THEN the system SHALL add all trip services to cart and navigate to payment section

### Requirement 9: Per-Service Payment Based on Provider Methods

**User Story:** As a traveler, I want to pay for each service separately using the provider's accepted payment methods, so that I can complete payments according to each provider's requirements.

#### Acceptance Criteria

1. WHEN viewing cart with multiple services THEN the system SHALL display each service with its provider's accepted payment methods
2. WHEN a traveler initiates payment THEN the system SHALL allow payment for one service at a time based on provider's payment methods
3. WHEN displaying payment options THEN the system SHALL show the total cost but indicate that services are paid individually per provider
4. WHEN a service has no payment methods configured THEN the system SHALL display contact information for direct communication with the provider

### Requirement 10: Provider Follow Functionality

**User Story:** As a traveler, I want to follow providers I like, so that I can see their new services first when browsing.

#### Acceptance Criteria

1. WHEN viewing a provider profile THEN the system SHALL display a "Follow" button
2. WHEN a traveler clicks "Follow" THEN the system SHALL add the provider to the traveler's followed list
3. WHEN a traveler follows a provider THEN the provider's follower count SHALL increase by one
4. WHEN a followed provider adds a new service THEN the service SHALL appear at the top of the destination discovery page for that traveler
5. WHEN a traveler clicks "Follow" on an already followed provider THEN the system SHALL unfollow the provider and decrease follower count by one

### Requirement 11: Display Follower Count on Provider Profile

**User Story:** As a traveler, I want to see how many followers a provider has, so that I can gauge their popularity.

#### Acceptance Criteria

1. WHEN viewing a provider profile THEN the system SHALL display the current follower count
2. WHEN a traveler follows or unfollows THEN the follower count SHALL update in real-time
3. WHEN displaying follower count THEN the system SHALL show the actual number from the database

### Requirement 12: Remove Continue to Cart from Service Modal

**User Story:** As a traveler, I want the service modal to only show "Add to Plan" option, so that I build my complete trip before going to payment.

#### Acceptance Criteria

1. WHEN viewing a service details modal THEN the system SHALL display "Add to Plan" button
2. WHEN viewing a service details modal THEN the system SHALL NOT display "Continue to Cart and Payment" button
3. WHEN a traveler clicks "Add to Plan" THEN the service SHALL be added to the current trip plan and the modal SHALL close

### Requirement 13: Favorites Section in Dashboard

**User Story:** As a traveler, I want to see all my favorite providers in one place, so that I can quickly access providers I like.

#### Acceptance Criteria

1. WHEN viewing the traveler dashboard THEN the system SHALL display a "Favorites" tab
2. WHEN a traveler clicks the Favorites tab THEN the system SHALL display all providers marked as favorite
3. WHEN viewing favorites THEN the system SHALL display provider name, location, verification status, and follower count
4. WHEN a traveler clicks on a favorite provider THEN the system SHALL navigate to that provider's profile page

### Requirement 14: Service Details Modal in Journey Planner

**User Story:** As a traveler, I want to view detailed service information before adding to my plan, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN viewing services in Journey Planner THEN the system SHALL display a "View Details" button for each service
2. WHEN a traveler clicks "View Details" THEN the system SHALL open a modal showing service description, price, amenities, images, payment methods, and contact information
3. WHEN viewing service details modal THEN the system SHALL display an "Add to Plan" button
4. WHEN a traveler clicks "Add to Plan" in the modal THEN the service SHALL be added to the trip plan and the modal SHALL close
