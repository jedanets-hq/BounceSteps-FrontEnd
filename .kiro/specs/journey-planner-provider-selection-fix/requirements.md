# Requirements Document

## Introduction

Tatizo kubwa limegunduliwa kwenye Journey Planner: kuna mbili files za Journey Planner, lakini file sahihi yenye provider selection step (JourneyPlannerEnhanced.jsx) haijawekwa kwenye routing. File iliyopo kwenye routing (journey-planner/index.jsx) haina step ya kuchagua providers - inaonyesha services tu. Hii inasababisha travelers wasiweze kuona providers wakati wanapopanga safari zao.

## Glossary

- **Journey_Planner**: Kipengele cha mfumo kinachoruhusu travelers kupanga safari kwa kuchagua destination, tarehe, na huduma
- **Provider_Selection_Step**: Hatua ya 4 ambapo travelers wanachagua service providers kutoka kwa orodha iliyochujwa
- **JourneyPlannerEnhanced**: File sahihi yenye workflow kamili ikiwemo provider selection
- **Routes.jsx**: File inayodhibiti URL routing katika application
- **Service_Category**: Aina ya huduma (Accommodation, Transportation, Tours & Activities, n.k.)

## Requirements

### Requirement 1: Enable Provider Selection in Journey Planner

**User Story:** As a traveler, I want to see and select service providers in step 4 of journey planning, so that I can choose who will provide my services.

#### Acceptance Criteria

1. WHEN a traveler reaches step 4 of journey planning THEN the system SHALL display "Select Service Providers" heading
2. WHEN providers are displayed THEN the system SHALL show provider cards with business name, location, verification status, services offered, and rating
3. WHEN a traveler clicks on a provider card THEN the system SHALL allow selection/deselection of that provider
4. WHEN providers are displayed THEN the system SHALL filter providers based on selected location (region, district) and selected service categories from step 3

### Requirement 2: Use Correct Journey Planner File

**User Story:** As a developer, I want the application to use JourneyPlannerEnhanced.jsx which has the complete workflow, so that travelers get the full journey planning experience.

#### Acceptance Criteria

1. WHEN the application routes to /journey-planner THEN the system SHALL load JourneyPlannerEnhanced component
2. WHEN JourneyPlannerEnhanced is loaded THEN the system SHALL display all 5 steps: Location, Travel Details, Services, Providers, Summary
3. WHEN step 4 is reached THEN the system SHALL fetch and display providers matching the selected criteria

### Requirement 3: Maintain Existing Journey Planner Functionality

**User Story:** As a traveler, I want all existing journey planner features to continue working, so that I don't lose any functionality.

#### Acceptance Criteria

1. WHEN using the journey planner THEN the system SHALL maintain location selection with region, district, ward, and street
2. WHEN using the journey planner THEN the system SHALL maintain service category selection
3. WHEN using the journey planner THEN the system SHALL maintain the ability to view provider profiles
4. WHEN using the journey planner THEN the system SHALL maintain the ability to add services to cart

### Requirement 4: Provider Filtering by Location and Services

**User Story:** As a traveler, I want to see only providers who offer services in my selected location and categories, so that I see relevant options only.

#### Acceptance Criteria

1. WHEN step 4 loads THEN the system SHALL fetch providers whose services match the selected location (region and/or district)
2. WHEN step 4 loads THEN the system SHALL fetch providers whose services match the selected service categories from step 3
3. WHEN no providers match the criteria THEN the system SHALL display a helpful message with options to change location or services
4. WHEN providers are fetched THEN the system SHALL display loading indicator during the fetch operation

### Requirement 5: Provider Card Display

**User Story:** As a traveler, I want to see detailed provider information in cards, so that I can make informed decisions about which providers to select.

#### Acceptance Criteria

1. WHEN viewing provider cards THEN the system SHALL display business name, location, verification badge (if verified), and rating
2. WHEN viewing provider cards THEN the system SHALL display the number of services offered and service categories
3. WHEN viewing provider cards THEN the system SHALL display a "View Profile" button to see full provider details
4. WHEN viewing provider cards THEN the system SHALL display a selection checkbox or button to select/deselect the provider

### Requirement 6: Selected Providers Tracking

**User Story:** As a traveler, I want to see which providers I have selected, so that I can review my choices before proceeding.

#### Acceptance Criteria

1. WHEN a traveler selects providers THEN the system SHALL display a summary section showing all selected providers
2. WHEN viewing selected providers summary THEN the system SHALL show provider names and allow removal
3. WHEN a traveler proceeds to step 5 THEN the system SHALL include all selected providers in the journey summary
4. WHEN no providers are selected THEN the system SHALL disable the "View Summary" button

