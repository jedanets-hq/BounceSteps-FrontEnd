# Implementation Plan: Journey Planner Location Mapping Fix

## Overview

This implementation plan addresses the critical issue where service providers are not displayed in the Journey Planner due to location name mismatches between the frontend and database.

**Root Cause:** Frontend uses location names from tanzaniaLocations.json (e.g., "MBEYA", "MBEYA CBD") while database has different names (e.g., "Mbeya", "Mbeya Urban").

**Solution:** Implement a location alias mapping system and update filtering logic to handle name variations.

---

## Tasks

- [-] 1. Create Location Alias Infrastructure

  - Create database table for location aliases
  - Implement LocationNormalizer utility class
  - Create initial location mappings file
  - _Requirements: 1.1, 1.3, 5.1_


- [ ] 1.1 Create location_aliases database table
  - Write SQL migration to create table with proper indexes
  - Include columns: id, canonical_name, alias_name, location_type, region_context, created_at
  - Add unique constraint on (alias_name, location_type, region_context)
  - _Requirements: 5.1_

- [ ] 1.2 Create LocationNormalizer utility class
  - Implement normalize() method for converting names to canonical form
  - Implement getAliases() method for retrieving all aliases
  - Implement matches() method for comparing location names
  - Implement loadAliases() method with caching
  - Add comprehensive logging
  - _Requirements: 1.1, 1.3, 5.2_

- [ ] 1.3 Create initial location mappings file
  - Create backend/data/location-mappings.json
  - Add Mbeya region mappings (MBEYA → Mbeya, mbeya)
  - Add Mbeya district mappings (MBEYA → Mbeya Urban, MBEYA CBD → Mbeya CBD)
  - Add common area mappings (IYUNGA → Iyunga, etc.)
  - Include mappings for all 26 regions
  - _Requirements: 1.3, 5.5_

- [ ] 1.4 Create migration script to populate aliases
  - Read location-mappings.json
  - Insert aliases into location_aliases table
  - Handle duplicates gracefully
  - Log all insertions
  - Make script idempotent
  - _Requirements: 5.1, 8.6_

- [ ] 2. Update Backend Service Filtering
  - Modify services route to use LocationNormalizer
  - Update location filtering logic with alias support
  - Add comprehensive logging
  - _Requirements: 2.1, 2.2, 2.5_

- [ ] 2.1 Update GET /services endpoint
  - Import and initialize LocationNormalizer
  - Normalize input location parameters (region, district, location)
  - Get aliases for each location level
  - Update filtering logic to check both canonical names and aliases
  - Maintain hierarchical matching (region → district → area)
  - Add detailed logging for debugging
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2.2 Update GET /services/:id endpoint
  - Ensure location data is returned in canonical format
  - Include location aliases in response for debugging
  - _Requirements: 1.4_

- [ ] 2.3 Update POST /services endpoint (service creation)
  - Validate location names against tanzaniaLocations.json
  - Normalize location names before saving
  - Return validation errors for invalid locations
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 2.4 Update PUT /services/:id endpoint (service update)
  - Apply same location validation as creation
  - Normalize location names before updating
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 3. Update Backend Provider Filtering
  - Modify providers route to use LocationNormalizer
  - Update provider search logic
  - _Requirements: 2.1, 2.2_

- [ ] 3.1 Update GET /providers/search endpoint
  - Import and initialize LocationNormalizer
  - Normalize input location parameters
  - Update filtering to use aliases
  - Maintain hierarchical matching
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3.2 Update GET /providers endpoint
  - Apply same alias-based filtering
  - _Requirements: 2.1_

- [ ] 4. Simplify Frontend Location Matching
  - Remove complex client-side location matching
  - Rely on backend for filtering
  - Improve error messages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 4.1 Update JourneyPlannerEnhanced.jsx fetchProviders
  - Remove client-side location normalization logic
  - Build query parameters from selectedLocation
  - Pass location parameters to backend API
  - Remove client-side filtering (backend handles it)
  - Simplify provider grouping logic
  - Add better error handling and user messages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7_

- [ ] 4.2 Update journey-planner/index.jsx fetchServicesByCategory
  - Apply same simplifications as JourneyPlannerEnhanced
  - Remove duplicate filtering logic
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 4.3 Add helpful "No Providers Found" messages
  - Show selected location clearly
  - Suggest broadening search (e.g., "Try selecting just the region")
  - Provide link to browse all services
  - Show available categories in the region
  - _Requirements: 4.6_

- [ ] 5. Create Data Migration Script
  - Analyze existing service location data
  - Update locations to canonical names
  - Generate migration report
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 5.1 Create diagnostic script
  - Query all services with location data
  - Compare against tanzaniaLocations.json
  - Identify mismatches
  - Suggest corrections using fuzzy matching
  - Generate detailed report
  - _Requirements: 6.1, 6.2, 6.3, 8.3_

- [ ] 5.2 Create migration script
  - Backup current service location data
  - For each service, normalize location names using LocationNormalizer
  - Update service records with canonical names
  - Log all changes
  - Generate migration report
  - Make script idempotent
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_

- [ ] 5.3 Create rollback script
  - Restore location data from backup
  - Verify restoration
  - _Requirements: 8.5_

- [ ] 6. Add Location Validation to Service Creation UI
  - Update service creation form
  - Add location dropdowns
  - Add validation
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6.1 Update ServiceManagement.jsx
  - Replace text inputs with LocationSelector component
  - Add real-time validation
  - Show validation errors clearly
  - Prevent submission with invalid locations
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 6.2 Create location validation API endpoint
  - Create GET /api/locations/validate endpoint
  - Accept region, district, area parameters
  - Return validation result and suggestions
  - _Requirements: 3.5_

- [ ] 7. Add Diagnostic and Debugging Tools
  - Create admin diagnostic page
  - Add location matching statistics
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7.1 Create location diagnostics API endpoint
  - Create GET /api/admin/location-diagnostics endpoint
  - Return services with unrecognized locations
  - Return location matching statistics
  - Return alias usage statistics
  - _Requirements: 6.1, 6.5_

- [ ] 7.2 Create admin diagnostics page
  - Display location mismatch report
  - Show service counts per location
  - Allow manual alias creation
  - Show recent location searches and results
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 8. Testing and Validation
  - Test location matching with various inputs
  - Test Journey Planner end-to-end
  - Verify all Mbeya services are discoverable
  - _Requirements: All_

- [ ] 8.1 Test LocationNormalizer
  - Test normalization with various cases
  - Test alias matching
  - Test hierarchical matching
  - Test caching behavior
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [ ] 8.2 Test backend service filtering
  - Test with exact location names
  - Test with aliases
  - Test with case variations
  - Test hierarchical fallback
  - Test combined category + location filtering
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 8.3 Test Journey Planner flow
  - Select Mbeya region → MBEYA district → Accommodation
  - Verify providers are displayed
  - Verify provider count is correct
  - Test with different location combinations
  - Test with different service categories
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 8.4 Run migration on test database
  - Backup test database
  - Run migration script
  - Verify all services have canonical location names
  - Verify services are discoverable
  - Test rollback script
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 9. Documentation and Deployment
  - Document location alias system
  - Create deployment guide
  - Update API documentation
  - _Requirements: All_

- [ ] 9.1 Create location alias documentation
  - Document how to add new aliases
  - Document location normalization rules
  - Document troubleshooting steps
  - _Requirements: 5.4_

- [ ] 9.2 Create deployment guide
  - Document pre-deployment steps
  - Document deployment sequence
  - Document post-deployment verification
  - Document rollback procedure
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9.3 Update API documentation
  - Document location parameter format
  - Document alias behavior
  - Document validation endpoints
  - _Requirements: 3.5, 6.1_

- [ ] 10. Final Checkpoint - Verify Fix
  - Ensure all tests pass
  - Verify Mbeya providers are visible
  - Ask user if questions arise
  - _Requirements: All_

