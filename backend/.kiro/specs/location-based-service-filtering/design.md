# Design Document: Location-Based Service Filtering

## Overview

Hii ni design ya kuboresha location-based filtering kwenye iSafari platform. Mfumo wa sasa una "ULTRA FLEXIBLE" matching ambayo inasababisha services kuonekana sehemu zote badala ya location husika tu. Design hii inabadilisha mfumo kuwa STRICT filtering ambapo services zinaonekana tu kwenye location zinazohusika.

### Tatizo la Sasa
- Backend ina flexible matching inayoruhusu services kuonekana popote
- Services za Mbeya zinaonekana Arusha na kinyume chake
- Hakuna strict validation ya location data

### Suluhisho
- Strict hierarchical location filtering (Region > District > Area)
- Services zinaonekana tu kwenye location zinazomatch exactly
- Fallback logic: Service yenye region tu inaonekana kwa districts/areas zote za region hiyo

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  Journey Planner                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Step 1:     │  │ Step 3:     │  │ Step 4:     │              │
│  │ Location    │──│ Category    │──│ Services    │              │
│  │ Selection   │  │ Selection   │  │ Display     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                                  │                     │
│         ▼                                  ▼                     │
│  ┌─────────────────────────────────────────────────┐            │
│  │ Location State: { region, district, area }      │            │
│  └─────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Request                                  │
│  GET /services?category=X&region=Y&district=Z&location=W        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                     │
├─────────────────────────────────────────────────────────────────┤
│  Location Filter Logic                                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. Parse location params (region, district, location)    │    │
│  │ 2. Apply STRICT hierarchical filtering                   │    │
│  │ 3. Return only matching services                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                           │
├─────────────────────────────────────────────────────────────────┤
│  services table                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ id | title | category | region | district | area | ...   │    │
│  └─────────────────────────────────────────────────────────┘    │
│  Indexes: idx_services_country_region (country, region, district)│
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Backend Location Filter (services.js)

```javascript
// STRICT Location Filtering Logic
function applyStrictLocationFilter(services, { region, district, location }) {
  return services.filter(service => {
    // Normalize strings for comparison
    const normalize = (str) => (str || '').toLowerCase().trim();
    
    const serviceRegion = normalize(service.region);
    const serviceDistrict = normalize(service.district);
    const serviceArea = normalize(service.area);
    
    const searchRegion = normalize(region);
    const searchDistrict = normalize(district);
    const searchArea = normalize(location);
    
    // STRICT MATCHING RULES:
    
    // Rule 1: If region is provided, service.region MUST match
    if (searchRegion && serviceRegion !== searchRegion) {
      return false;
    }
    
    // Rule 2: If district is provided, check hierarchical match
    if (searchDistrict) {
      // Service must have matching district OR be a region-level service
      const districtMatch = serviceDistrict === searchDistrict;
      const regionLevelService = !serviceDistrict && serviceRegion === searchRegion;
      if (!districtMatch && !regionLevelService) {
        return false;
      }
    }
    
    // Rule 3: If area is provided, check hierarchical match
    if (searchArea) {
      // Service must have matching area OR district OR be region-level
      const areaMatch = serviceArea === searchArea;
      const districtMatch = !serviceArea && serviceDistrict === searchDistrict;
      const regionLevelService = !serviceArea && !serviceDistrict && serviceRegion === searchRegion;
      if (!areaMatch && !districtMatch && !regionLevelService) {
        return false;
      }
    }
    
    return true;
  });
}
```

### 2. Frontend Journey Planner State Management

```javascript
// Location state structure
const [formData, setFormData] = useState({
  country: '',
  region: '',      // Primary filter - REQUIRED
  district: '',    // Secondary filter
  sublocation: '', // Tertiary filter (area)
  serviceCategory: '',
  selectedServices: []
});

// API call with strict location params
const fetchServices = async (category) => {
  const params = new URLSearchParams();
  params.append('category', category);
  
  // ALWAYS send region as primary filter
  if (formData.region) {
    params.append('region', formData.region);
  }
  if (formData.district) {
    params.append('district', formData.district);
  }
  if (formData.sublocation) {
    params.append('location', formData.sublocation);
  }
  
  const response = await fetch(`${API_URL}/services?${params}`);
  return response.json();
};
```

### 3. Service Model Location Fields

```sql
-- Services table location fields
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES service_providers(id),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  -- Location fields (hierarchical)
  country VARCHAR(100) DEFAULT 'Tanzania',
  region VARCHAR(100) NOT NULL,  -- REQUIRED
  district VARCHAR(100),
  area VARCHAR(100),
  location VARCHAR(255),  -- Legacy field for display
  -- ... other fields
);

-- Index for efficient location queries
CREATE INDEX idx_services_location_hierarchy 
ON services(region, district, area);
```

## Data Models

### Service Location Data Structure

```typescript
interface ServiceLocation {
  country: string;    // e.g., "Tanzania"
  region: string;     // e.g., "Mbeya" - REQUIRED
  district?: string;  // e.g., "Mbeya City"
  area?: string;      // e.g., "Mbeya Central"
  location?: string;  // Legacy display field
}

interface Service {
  id: number;
  provider_id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  // Location
  country: string;
  region: string;
  district: string | null;
  area: string | null;
  location: string | null;
  // ... other fields
}
```

### Location Hierarchy

```
Tanzania (Country)
├── Mbeya (Region)
│   ├── Mbeya City (District)
│   │   ├── Mbeya Central (Area)
│   │   ├── Iyunga (Area)
│   │   └── Sisimba (Area)
│   └── Mbeya Rural (District)
│       ├── Utengule (Area)
│       └── Tunduma (Area)
├── Arusha (Region)
│   ├── Arusha City (District)
│   │   ├── Arusha Central (Area)
│   │   └── Kaloleni (Area)
│   └── Arusha Rural (District)
└── Dar es Salaam (Region)
    ├── Kinondoni (District)
    └── Ilala (District)
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Region Isolation
*For any* service with region R and *for any* search query with region S where R ≠ S, the service SHALL NOT appear in the search results.
**Validates: Requirements 2.2, 3.1**

### Property 2: Hierarchical Location Filtering
*For any* search query with location parameters (region, district, area), *for any* service in the results, the service's location MUST satisfy at least one of:
- service.area matches search.area (if area provided)
- service.district matches search.district AND service.area is null (if district provided)
- service.region matches search.region AND service.district is null AND service.area is null (region-level service)
**Validates: Requirements 1.2, 1.3, 1.5, 3.2, 3.3**

### Property 3: Location Data Persistence Round-Trip
*For any* service created with location fields (region, district, area), reading the service back from the database SHALL return the same location values.
**Validates: Requirements 2.1, 2.3, 5.1**

### Property 4: Service Count Accuracy
*For any* location and category combination, the displayed service count SHALL equal the actual number of services returned by the API.
**Validates: Requirements 4.1, 4.4**

### Property 5: API Request Location Parameters
*For any* frontend location selection, the API request SHALL include region as a required parameter, with district and area as optional parameters.
**Validates: Requirements 5.2, 5.3**

### Property 6: Location Display Priority
*For any* service with location data, the displayed location SHALL be the most specific non-null value in order: area > district > region.
**Validates: Requirements 4.4, 5.4**

## Error Handling

### Backend Error Handling

```javascript
// Location validation middleware
const validateLocationParams = (req, res, next) => {
  const { region, district, location } = req.query;
  
  // At least region should be provided for location-based queries
  if (!region && !district && !location) {
    // Allow queries without location (returns all services)
    return next();
  }
  
  // If district is provided, region should also be provided
  if (district && !region) {
    console.warn('⚠️ District provided without region - may return unexpected results');
  }
  
  // If area is provided, district and region should also be provided
  if (location && (!district || !region)) {
    console.warn('⚠️ Area provided without district/region - may return unexpected results');
  }
  
  next();
};

// Service with mismatched location data
const handleMismatchedLocation = (service) => {
  // Log warning for debugging
  console.warn(`⚠️ Service ${service.id} has mismatched location data:`, {
    region: service.region,
    district: service.district,
    area: service.area
  });
  
  // Exclude from results if region is missing
  if (!service.region) {
    return null;
  }
  
  return service;
};
```

### Frontend Error Handling

```javascript
// Handle empty results
const handleNoServices = () => {
  return (
    <div className="text-center p-8 bg-muted/50 rounded-lg">
      <Icon name="AlertCircle" size={56} className="text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No {formData.serviceCategory} Services Found
      </h3>
      <p className="text-muted-foreground mb-1">
        We couldn't find any services in
      </p>
      <p className="text-primary font-medium mb-3">
        {formData.sublocation || formData.district || formData.region}
      </p>
      <p className="text-sm text-muted-foreground">
        Try selecting a different category or exploring nearby locations
      </p>
    </div>
  );
};

// Handle API errors
const handleApiError = (error) => {
  console.error('❌ Error fetching services:', error);
  setError('Failed to load services. Please try again.');
  setAvailableServices([]);
};
```

## Testing Strategy

### Dual Testing Approach

Tutumia **unit tests** na **property-based tests** kwa comprehensive coverage:

#### Unit Tests
- Test specific location combinations (Mbeya + Accommodation)
- Test edge cases (empty location, null values)
- Test API response format
- Test UI state management

#### Property-Based Testing

**Library:** fast-check (JavaScript property-based testing library)

**Configuration:**
```javascript
import fc from 'fast-check';

// Run minimum 100 iterations per property
const propertyConfig = { numRuns: 100 };
```

**Property Tests:**

1. **Region Isolation Property Test**
   - Generate random services with various regions
   - Generate random search region
   - Verify no service from different region appears in results

2. **Hierarchical Filtering Property Test**
   - Generate services with various location combinations
   - Generate search queries with various location params
   - Verify all results satisfy hierarchical matching rules

3. **Location Persistence Round-Trip Test**
   - Generate random location data
   - Create service with that data
   - Read service back
   - Verify location fields match

4. **Service Count Accuracy Test**
   - Generate random location/category combination
   - Fetch services
   - Verify displayed count matches actual results length

**Test Annotations:**
Each property-based test MUST be tagged with:
```javascript
// **Feature: location-based-service-filtering, Property 1: Region Isolation**
```

