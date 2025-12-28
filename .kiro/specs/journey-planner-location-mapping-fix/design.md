# Design Document: Journey Planner Location Mapping Fix

## Overview

This design addresses the critical issue where service providers are not displayed in the Journey Planner despite existing in the database. The root cause is a mismatch between location names used in the frontend (from tanzaniaLocations.json) and location names stored in the database.

**Example of the Problem:**
- Frontend LocationSelector shows: Region="MBEYA", District="MBEYA" or "MBEYA CBD"
- Database has services with: Region="Mbeya", District="Mbeya Urban"
- Result: No match found, "No Providers Found" displayed to user

## Architecture

### Components Affected

1. **Frontend Components:**
   - `LocationSelector.jsx` - Location selection UI
   - `JourneyPlannerEnhanced.jsx` - Journey planning workflow
   - `journey-planner/index.jsx` - Alternative journey planner

2. **Backend Routes:**
   - `routes/services.js` - Service filtering and search
   - `routes/providers.js` - Provider search

3. **Database:**
   - `services` table - Service location data
   - `service_providers` table - Provider location data
   - New: `location_aliases` table - Location name mappings

4. **Data Files:**
   - `src/data/tanzaniaLocations.json` - Canonical location data
   - New: `backend/data/location-mappings.json` - Location alias mappings

## Components and Interfaces

### 1. Location Alias Mapping System

**Purpose:** Maintain mappings between different variations of location names

**Database Schema:**
```sql
CREATE TABLE location_aliases (
  id SERIAL PRIMARY KEY,
  canonical_name VARCHAR(255) NOT NULL,
  alias_name VARCHAR(255) NOT NULL,
  location_type VARCHAR(50) NOT NULL, -- 'region', 'district', 'area'
  region_context VARCHAR(255), -- For district/area aliases, which region they belong to
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(alias_name, location_type, region_context)
);

CREATE INDEX idx_location_aliases_lookup ON location_aliases(alias_name, location_type);
CREATE INDEX idx_location_aliases_canonical ON location_aliases(canonical_name, location_type);
```

**Initial Mappings (Mbeya Example):**
```json
{
  "regions": {
    "MBEYA": ["Mbeya", "mbeya"]
  },
  "districts": {
    "MBEYA": {
      "region": "MBEYA",
      "aliases": ["Mbeya Urban", "Mbeya City", "mbeya"]
    },
    "MBEYA CBD": {
      "region": "MBEYA",
      "aliases": ["Mbeya CBD", "CBD", "City Center"]
    }
  },
  "areas": {
    "IYUNGA": {
      "region": "MBEYA",
      "district": "MBEYA",
      "aliases": ["Iyunga", "iyunga"]
    }
  }
}
```

### 2. Location Normalization Service

**File:** `backend/utils/location-normalizer.js`

**Interface:**
```javascript
class LocationNormalizer {
  /**
   * Normalize a location name to its canonical form
   * @param {string} name - The location name to normalize
   * @param {string} type - 'region', 'district', or 'area'
   * @param {string} regionContext - For district/area, the parent region
   * @returns {string} - Canonical location name
   */
  normalize(name, type, regionContext = null);

  /**
   * Get all aliases for a canonical location name
   * @param {string} canonicalName - The canonical location name
   * @param {string} type - 'region', 'district', or 'area'
   * @returns {string[]} - Array of alias names
   */
  getAliases(canonicalName, type);

  /**
   * Check if two location names refer to the same place
   * @param {string} name1 - First location name
   * @param {string} name2 - Second location name
   * @param {string} type - 'region', 'district', or 'area'
   * @param {string} regionContext - For district/area, the parent region
   * @returns {boolean} - True if names match
   */
  matches(name1, name2, type, regionContext = null);

  /**
   * Load aliases from database and cache them
   */
  async loadAliases();
}
```

### 3. Enhanced Service Filtering

**File:** `backend/routes/services.js`

**Updated GET / endpoint:**
```javascript
router.get('/', validateLocationParams, async (req, res) => {
  const { category, location, district, region } = req.query;
  
  // Normalize input location names
  const normalizedRegion = await locationNormalizer.normalize(region, 'region');
  const normalizedDistrict = await locationNormalizer.normalize(district, 'district', normalizedRegion);
  const normalizedArea = await locationNormalizer.normalize(location, 'area', normalizedRegion);
  
  // Get all aliases for matching
  const regionAliases = await locationNormalizer.getAliases(normalizedRegion, 'region');
  const districtAliases = await locationNormalizer.getAliases(normalizedDistrict, 'district');
  const areaAliases = await locationNormalizer.getAliases(normalizedArea, 'area');
  
  // Filter services using aliases
  const filteredServices = services.filter(service => {
    // Match region (required)
    if (region && !regionAliases.some(alias => 
      locationNormalizer.matches(service.region, alias, 'region')
    )) {
      return false;
    }
    
    // Match district (hierarchical)
    if (district) {
      const districtMatch = districtAliases.some(alias =>
        locationNormalizer.matches(service.district, alias, 'district', normalizedRegion)
      );
      const regionLevelService = !service.district;
      if (!districtMatch && !regionLevelService) {
        return false;
      }
    }
    
    // Match area (hierarchical)
    if (location) {
      const areaMatch = areaAliases.some(alias =>
        locationNormalizer.matches(service.area, alias, 'area', normalizedRegion)
      );
      const districtLevelService = !service.area && districtAliases.some(alias =>
        locationNormalizer.matches(service.district, alias, 'district', normalizedRegion)
      );
      const regionLevelService = !service.area && !service.district;
      if (!areaMatch && !districtLevelService && !regionLevelService) {
        return false;
      }
    }
    
    return true;
  });
  
  // ... rest of filtering logic
});
```

### 4. Frontend Location Matching

**File:** `src/pages/JourneyPlannerEnhanced.jsx`

**Updated fetchProviders function:**
```javascript
const fetchProviders = async () => {
  try {
    setLoadingProviders(true);
    
    // Build query with location parameters
    const params = new URLSearchParams();
    if (selectedLocation.region) params.append('region', selectedLocation.region);
    if (selectedLocation.district) params.append('district', selectedLocation.district);
    if (selectedLocation.ward) params.append('location', selectedLocation.ward);
    
    // Add selected service categories
    if (journeyData.selectedServices && journeyData.selectedServices.length > 0) {
      journeyData.selectedServices.forEach(cat => params.append('category', cat));
    }
    
    params.append('limit', '500');
    
    // Fetch services from backend (backend handles location matching)
    const response = await fetch(`${API_URL}/services?${params.toString()}`);
    const data = await response.json();
    
    if (!data.success || !data.services || data.services.length === 0) {
      console.log('⚠️ No services found');
      setProviders([]);
      setLoadingProviders(false);
      return;
    }
    
    // Group services by provider
    const providerMap = new Map();
    data.services.forEach(service => {
      const providerId = service.provider_id;
      if (!providerId) return;
      
      if (!providerMap.has(providerId)) {
        providerMap.set(providerId, {
          id: providerId,
          business_name: service.business_name || 'Service Provider',
          business_type: service.category || 'General',
          location: service.location || `${service.district || ''}, ${service.region || ''}`.trim(),
          region: service.region,
          district: service.district,
          ward: service.area,
          is_verified: service.provider_verified || false,
          service_categories: [service.category],
          services: [service],
          services_count: 1,
          description: service.provider_description || service.description,
          price: service.price
        });
      } else {
        const provider = providerMap.get(providerId);
        if (!provider.service_categories.includes(service.category)) {
          provider.service_categories.push(service.category);
        }
        provider.services.push(service);
        provider.services_count++;
      }
    });
    
    const matchingProviders = Array.from(providerMap.values());
    console.log('✅ Providers found:', matchingProviders.length);
    setProviders(matchingProviders);
    
  } catch (error) {
    console.error('❌ Error fetching providers:', error);
    setProviders([]);
  } finally {
    setLoadingProviders(false);
  }
};
```

## Data Models

### Location Alias Model

```javascript
// backend/models/LocationAlias.js
class LocationAlias {
  static async create({ canonical_name, alias_name, location_type, region_context }) {
    const result = await pool.query(
      `INSERT INTO location_aliases (canonical_name, alias_name, location_type, region_context)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (alias_name, location_type, region_context) DO NOTHING
       RETURNING *`,
      [canonical_name, alias_name, location_type, region_context]
    );
    return result.rows[0];
  }

  static async findByAlias(alias_name, location_type, region_context = null) {
    const result = await pool.query(
      `SELECT * FROM location_aliases
       WHERE alias_name = $1 AND location_type = $2
       AND (region_context = $3 OR region_context IS NULL)
       LIMIT 1`,
      [alias_name, location_type, region_context]
    );
    return result.rows[0];
  }

  static async findByCanonical(canonical_name, location_type) {
    const result = await pool.query(
      `SELECT * FROM location_aliases
       WHERE canonical_name = $1 AND location_type = $2`,
      [canonical_name, location_type]
    );
    return result.rows;
  }

  static async getAll() {
    const result = await pool.query('SELECT * FROM location_aliases ORDER BY location_type, canonical_name');
    return result.rows;
  }
}
```

## Error Handling

### Location Not Found Errors

**Scenario:** User selects a location that has no services

**Handling:**
1. Backend returns empty array with metadata about the search
2. Frontend displays helpful message: "No providers found in [Location]. Try selecting [Parent Location] or browse all services."
3. Log the search for analytics to identify gaps in service coverage

### Invalid Location Names

**Scenario:** Service has location name not in tanzaniaLocations.json

**Handling:**
1. During service creation, validate against tanzaniaLocations.json
2. If invalid, suggest closest match using fuzzy matching
3. Allow admin override with warning
4. Log invalid locations for review

### Alias Conflicts

**Scenario:** Two different locations have the same alias

**Handling:**
1. Use region_context to disambiguate
2. If still ambiguous, prefer exact match over alias
3. Log conflict for admin review

## Testing Strategy

### Unit Tests

1. **LocationNormalizer Tests:**
   - Test normalization of various location name formats
   - Test alias matching with different cases
   - Test hierarchical matching (region → district → area)

2. **Service Filtering Tests:**
   - Test filtering with exact location names
   - Test filtering with aliases
   - Test hierarchical fallback (show region-level services for district searches)
   - Test category + location combined filtering

3. **Frontend Tests:**
   - Test LocationSelector state management
   - Test fetchProviders with various location combinations
   - Test provider grouping logic

### Integration Tests

1. **End-to-End Journey Planner Flow:**
   - Select location → Select services → View providers
   - Verify providers are displayed correctly
   - Verify provider count matches database

2. **Location Alias Resolution:**
   - Create service with "Mbeya Urban"
   - Search with "MBEYA"
   - Verify service is found

3. **Hierarchical Matching:**
   - Create region-level service (no district)
   - Search with specific district
   - Verify service is shown

### Property-Based Tests

Property tests will be defined after requirements approval.

## Migration Strategy

### Phase 1: Create Alias Infrastructure

1. Create `location_aliases` table
2. Implement `LocationNormalizer` class
3. Populate initial aliases from mapping file
4. Add unit tests

### Phase 2: Update Backend Filtering

1. Update `routes/services.js` to use LocationNormalizer
2. Update `routes/providers.js` to use LocationNormalizer
3. Add logging for location matches
4. Test with existing data

### Phase 3: Migrate Existing Data

1. Run diagnostic script to identify location mismatches
2. Create migration script to update service locations
3. Backup database
4. Run migration
5. Verify all services are now discoverable

### Phase 4: Update Frontend

1. Simplify `fetchProviders` to rely on backend filtering
2. Remove complex client-side location matching
3. Add better error messages
4. Test with real user flows

### Phase 5: Add Enhancements

1. Add service counts to LocationSelector
2. Add location validation to service creation form
3. Add admin interface for managing aliases
4. Add analytics for location searches

## Performance Considerations

### Caching Strategy

1. **Alias Cache:** Cache location aliases in memory, refresh every 5 minutes
2. **Service Count Cache:** Cache service counts per location, refresh every 15 minutes
3. **Location Validation Cache:** Cache valid location combinations

### Database Indexes

```sql
-- Optimize location filtering
CREATE INDEX idx_services_location ON services(region, district, area) WHERE is_active = true;
CREATE INDEX idx_services_category_location ON services(category, region, district) WHERE is_active = true;

-- Optimize alias lookups
CREATE INDEX idx_location_aliases_lookup ON location_aliases(alias_name, location_type);
CREATE INDEX idx_location_aliases_canonical ON location_aliases(canonical_name, location_type);
```

### Query Optimization

1. Use prepared statements for location queries
2. Limit service fetches to 500 records
3. Use database-level filtering before application-level filtering
4. Consider materialized views for common location queries

## Security Considerations

1. **Input Validation:** Sanitize all location inputs to prevent SQL injection
2. **Rate Limiting:** Limit location search API calls to prevent abuse
3. **Admin Access:** Restrict alias management to admin users only
4. **Audit Logging:** Log all location alias changes for accountability

## Deployment Plan

1. **Pre-Deployment:**
   - Backup production database
   - Test migration script on staging
   - Prepare rollback script

2. **Deployment:**
   - Deploy backend changes (backward compatible)
   - Run migration script
   - Verify services are discoverable
   - Deploy frontend changes
   - Monitor error logs

3. **Post-Deployment:**
   - Monitor location search success rate
   - Review logs for unmapped locations
   - Add new aliases as needed
   - Gather user feedback

## Rollback Plan

If issues occur:
1. Revert frontend to previous version
2. Revert backend to previous version
3. Restore database from backup if needed
4. Investigate root cause
5. Fix and redeploy

