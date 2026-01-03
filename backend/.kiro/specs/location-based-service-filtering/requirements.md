# Requirements Document

## Introduction

Hii ni feature ya kuboresha location-based filtering ya services kwenye iSafari platform. Tatizo kuu ni kwamba services zinaonekana sehemu zote badala ya kuonekana tu kwenye location/eneo ambalo zinahusika. Kwa mfano, service ya Mbeya inapaswa kuonekana tu kwa wateja wanaotafuta services za Mbeya, sio kwa wateja wanaotafuta services za Arusha au Dar es Salaam.

Mfumo unahitaji kuhakikisha:
- Services zinaonyeshwa tu kwenye location husika (region, district, area)
- Journey Planner inaonyesha services za location iliyochaguliwa tu
- Backend API inafanya strict filtering badala ya flexible matching
- Frontend inaonyesha services kwa usahihi kulingana na location

## Glossary

- **Service**: Huduma inayotolewa na service provider (mfano: safari tour, hotel, transport)
- **Location**: Eneo la kijiografia lenye hierarchy: Country > Region > District > Area
- **Region**: Mkoa (mfano: Mbeya, Arusha, Dar es Salaam)
- **District**: Wilaya ndani ya mkoa (mfano: Mbeya City, Arusha City)
- **Area/Sublocation**: Eneo ndogo ndani ya wilaya (mfano: Mbeya Central, Iyunga)
- **Journey Planner**: Sehemu ya app ambapo traveler anachagua location na kupata services
- **Service Provider**: Mtu/kampuni inayotoa huduma kwenye platform
- **Location Filtering**: Mchakato wa kuonyesha services kulingana na location iliyochaguliwa

## Requirements

### Requirement 1

**User Story:** As a traveler, I want to see only services available in my selected location, so that I can plan my journey with relevant options.

#### Acceptance Criteria

1. WHEN a traveler selects a region in Journey Planner THEN the system SHALL display only services that have matching region field
2. WHEN a traveler selects a district THEN the system SHALL filter services to show only those with matching district OR region
3. WHEN a traveler selects an area/sublocation THEN the system SHALL filter services to show only those with matching area, district, OR region
4. WHEN no services exist for the selected location THEN the system SHALL display a clear message indicating no services are available in that area
5. WHEN a service has only region set (no district/area) THEN the system SHALL display that service for all districts and areas within that region

### Requirement 2

**User Story:** As a service provider, I want my services to appear only in locations where I operate, so that I receive relevant inquiries from travelers.

#### Acceptance Criteria

1. WHEN a service provider creates a service with specific location fields THEN the system SHALL store region, district, and area separately in the database
2. WHEN a service has location set to "Mbeya Central" THEN the system SHALL NOT display that service when a traveler searches for "Arusha" or any other region
3. WHEN a service provider updates service location THEN the system SHALL update all location fields (region, district, area) accordingly
4. WHEN a service is created THEN the system SHALL require at least region field to be set

### Requirement 3

**User Story:** As a system administrator, I want the backend API to perform strict location filtering, so that services are accurately matched to user queries.

#### Acceptance Criteria

1. WHEN the API receives a request with region parameter THEN the system SHALL return only services where service.region matches the requested region exactly (case-insensitive)
2. WHEN the API receives a request with district parameter THEN the system SHALL return only services where service.district matches OR service.region matches (for services without district)
3. WHEN the API receives a request with location/area parameter THEN the system SHALL return only services where service.area matches OR service.district matches OR service.region matches
4. WHEN the API receives multiple location parameters THEN the system SHALL apply hierarchical filtering (area > district > region)
5. WHEN a service has mismatched location data THEN the system SHALL log a warning and exclude that service from results

### Requirement 4

**User Story:** As a traveler, I want the Journey Planner to show accurate service counts per location, so that I can make informed decisions about where to travel.

#### Acceptance Criteria

1. WHEN displaying services in step 4 of Journey Planner THEN the system SHALL show the count of services matching the selected location and category
2. WHEN a traveler changes category in step 3 THEN the system SHALL clear previous services and fetch fresh data for the new category and location
3. WHEN a traveler goes back to step 1 and changes location THEN the system SHALL reset all service data and fetch new services for the new location
4. WHEN services are displayed THEN the system SHALL show the service's actual location (area, district, or region) in the service card

### Requirement 5

**User Story:** As a developer, I want consistent location data structure across frontend and backend, so that filtering works correctly throughout the application.

#### Acceptance Criteria

1. WHEN storing service location THEN the system SHALL use separate fields: country, region, district, area
2. WHEN the frontend sends location parameters THEN the system SHALL send region, district, and location (area) as separate query parameters
3. WHEN the backend receives location parameters THEN the system SHALL validate that at least one location parameter is provided
4. WHEN displaying service location THEN the system SHALL show the most specific location available (area > district > region)
5. WHEN a service has inconsistent location data (e.g., area without district) THEN the system SHALL normalize the data during save operation

