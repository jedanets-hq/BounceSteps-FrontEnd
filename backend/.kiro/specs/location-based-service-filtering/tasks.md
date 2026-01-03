# Implementation Plan

## Location-Based Service Filtering

- [x] 1. Fix Backend Location Filtering Logic
  - [x] 1.1 Replace ULTRA FLEXIBLE matching with STRICT hierarchical filtering in services.js
    - Remove flexible matching logic that allows cross-region results
    - Implement exact region matching (case-insensitive)
    - Implement hierarchical fallback (region-level services appear for all districts/areas)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ]* 1.2 Write property test for Region Isolation
    - **Property 1: Region Isolation**
    - **Validates: Requirements 2.2, 3.1**
  - [ ]* 1.3 Write property test for Hierarchical Location Filtering
    - **Property 2: Hierarchical Location Filtering**
    - **Validates: Requirements 1.2, 1.3, 1.5, 3.2, 3.3**
  - [x] 1.4 Add location validation middleware
    - Validate that region is provided when location filtering is requested
    - Log warnings for incomplete location params
    - _Requirements: 5.3_

- [x] 2. Update Frontend Journey Planner Location Handling
  - [x] 2.1 Fix API request to send strict location parameters
    - Ensure region is always sent as primary filter
    - Send district and area as separate params
    - Remove any client-side flexible matching
    - _Requirements: 5.2, 1.1, 1.2, 1.3_
  - [ ]* 2.2 Write property test for API Request Location Parameters
    - **Property 5: API Request Location Parameters**
    - **Validates: Requirements 5.2, 5.3**
  - [x] 2.3 Update service display to show correct location
    - Show most specific location (area > district > region)
    - Display location in service cards
    - _Requirements: 4.4, 5.4_
  - [ ]* 2.4 Write property test for Location Display Priority
    - **Property 6: Location Display Priority**
    - **Validates: Requirements 4.4, 5.4**

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Fix Service Creation Location Data
  - [x] 4.1 Update service creation to require region field
    - Add validation for region field in POST /services
    - Ensure region, district, area are stored separately
    - _Requirements: 2.1, 2.4, 5.1_
  - [ ]* 4.2 Write property test for Location Data Persistence
    - **Property 3: Location Data Persistence Round-Trip**
    - **Validates: Requirements 2.1, 2.3, 5.1**
  - [x] 4.3 Add location normalization on save
    - Normalize location strings (trim, lowercase for comparison)
    - Handle inconsistent data (area without district)
    - _Requirements: 5.5_

- [x] 5. Update Service Count Display
  - [x] 5.1 Fix service count in Journey Planner step 4
    - Show accurate count of filtered services
    - Update count when category or location changes
    - _Requirements: 4.1_
  - [ ]* 5.2 Write property test for Service Count Accuracy
    - **Property 4: Service Count Accuracy**
    - **Validates: Requirements 4.1, 4.4**

- [x] 6. Handle Edge Cases and Error States
  - [x] 6.1 Implement clear messaging for no services found
    - Show helpful message when no services in location
    - Suggest alternative actions (change category, change location)
    - _Requirements: 1.4_
  - [x] 6.2 Handle services with mismatched location data

    - Log warnings for debugging
    - Exclude services without region from results
    - _Requirements: 3.5_

- [ ] 7. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

