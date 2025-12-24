# Design Document: Journey Planner Provider Selection Fix

## Overview

This design addresses the critical issue where the Journey Planner is missing the provider selection step. The root cause is that the application is using `src/pages/journey-planner/index.jsx` which only shows services, while the complete implementation with provider selection exists in `src/pages/JourneyPlannerEnhanced.jsx` but is not being used. The solution is to update the routing to use JourneyPlannerEnhanced.jsx.

## Architecture

The fix involves a simple routing change:

```
Current State:
Routes.jsx → /journey-planner → src/pages/journey-planner/index.jsx (❌ No provider step)

Desired State:
Routes.jsx → /journey-planner → src/pages/JourneyPlannerEnhanced.jsx (✅ Has provider step)
```

### Component Structure

```
src/
├── pages/
│   ├── journey-planner/
│   │   └── index.jsx          # OLD - Will be deprecated
│   ├── JourneyPlannerEnhanced.jsx  # NEW - Will be used
│   └── ...
├── Routes.jsx                 # UPDATE - Change import
└── components/
    ├── ProviderCard.jsx       # Used by JourneyPlannerEnhanced
    ├── ProviderProfileModal.jsx  # Used by JourneyPlannerEnhanced
    └── LocationSelector.jsx   # Used by JourneyPlannerEnhanced
```

## Components and Interfaces

### 1. Routes.jsx (Modified)

**Current Code:**
```javascript
import JourneyPlanner from './pages/journey-planner';
```

**New Code:**
```javascript
import JourneyPlanner from './pages/JourneyPlannerEnhanced';
```

**Impact:** This single change will enable the complete 5-step workflow including provider selection.

### 2. JourneyPlannerEnhanced.jsx (Already Exists)

**Features:**
- Step 1: Location Selection (Region, District, Ward, Street)
- Step 2: Travel Details (Dates, Number of Travelers, Purpose)
- Step 3: Service Category Selection (Accommodation, Transportation, Tours, etc.)
- **Step 4: Provider Selection** ← This is what's missing in current implementation
- Step 5: Summary and Payment

**Step 4 Implementation:**
```javascript
const renderStep4 = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold mb-2">Select Service Providers</h2>
    <p className="text-muted-foreground">
      Providers in {selectedLocation.region}
      {selectedLocation.district && ` - ${selectedLocation.district}`}
    </p>
    
    {loadingProviders ? (
      <LoadingIndicator />
    ) : providers.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onViewProfile={handleViewProvider}
            onSelect={handleSelectProvider}
            isSelected={journeyData.selectedProviders?.some(p => p.id === provider.id)}
          />
        ))}
      </div>
    ) : (
      <NoProvidersMessage />
    )}
  </div>
);
```

### 3. Provider Fetching Logic (Already Exists)

**Location:** JourneyPlannerEnhanced.jsx

**Function:** `fetchProviders()`

```javascript
const fetchProviders = async () => {
  try {
    setLoadingProviders(true);
    
    // Fetch ALL services first
    const servicesResponse = await fetch(`${API_URL}/services?limit=500`);
    const servicesData = await servicesResponse.json();
    
    let filteredServices = servicesData.services;
    
    // STRICT LOCATION FILTERING
    if (selectedLocation.district) {
      filteredServices = filteredServices.filter(service => 
        service.district === selectedLocation.district && 
        service.region === selectedLocation.region
      );
    } else if (selectedLocation.region) {
      filteredServices = filteredServices.filter(service => 
        service.region === selectedLocation.region
      );
    }
    
    // STRICT SERVICE CATEGORY FILTERING
    if (journeyData.selectedServices && journeyData.selectedServices.length > 0) {
      filteredServices = filteredServices.filter(service => 
        journeyData.selectedServices.includes(service.category)
      );
    }
    
    // Group by provider
    const providerMap = new Map();
    filteredServices.forEach(service => {
      const providerId = service.provider_id;
      if (!providerMap.has(providerId)) {
        providerMap.set(providerId, {
          id: providerId,
          business_name: service.business_name,
          location: service.location || `${service.district}, ${service.region}`,
          region: service.region,
          district: service.district,
          is_verified: service.provider_verified || false,
          rating: service.average_rating || 0,
          service_categories: [service.category],
          services: [service],
          services_count: 1
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
    
    setProviders(Array.from(providerMap.values()));
  } catch (error) {
    console.error('Error fetching providers:', error);
    setProviders([]);
  } finally {
    setLoadingProviders(false);
  }
};
```

### 4. Provider Selection Logic (Already Exists)

```javascript
const handleSelectProvider = (provider) => {
  setJourneyData(prev => {
    const isSelected = prev.selectedProviders?.find(p => p.id === provider.id);
    if (isSelected) {
      return {
        ...prev,
        selectedProviders: prev.selectedProviders.filter(p => p.id !== provider.id)
      };
    } else {
      return {
        ...prev,
        selectedProviders: [...(prev.selectedProviders || []), provider]
      };
    }
  });
};
```

### 5. Auto-Fetch on Location Change (Already Exists)

```javascript
useEffect(() => {
  if (step === 4 && (selectedLocation.region || selectedLocation.district)) {
    console.log('🔄 Auto-fetching providers due to location change:', selectedLocation);
    fetchProviders();
  }
}, [selectedLocation.region, selectedLocation.district, selectedLocation.ward, step]);
```

## Data Models

### Provider Model (Used in Step 4)
```javascript
{
  id: number,
  business_name: string,
  location: string,
  region: string,
  district: string,
  ward: string,
  is_verified: boolean,
  is_premium: boolean,
  rating: number,
  total_reviews: number,
  service_categories: string[],
  services: Service[],
  services_count: number,
  description: string
}
```

### Journey Data Model
```javascript
{
  country: string,
  destination: string,
  startDate: string,
  endDate: string,
  checkInDate: string,
  checkOutDate: string,
  adults: number,
  travelers: number,
  selectedServices: string[],      // Service categories
  selectedProviders: Provider[],   // Selected providers from step 4
  selectedServiceDetails: Service[], // Specific services added to plan
  travelPurpose: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Provider Step Visibility
*For any* journey planning session, when a traveler reaches step 4, the system SHALL display the "Select Service Providers" heading and provider cards.
**Validates: Requirements 1.1, 1.2**

### Property 2: Provider Filtering by Location
*For any* set of providers displayed in step 4, all providers SHALL have services that match the selected location (region and/or district from step 1).
**Validates: Requirements 4.1**

### Property 3: Provider Filtering by Service Category
*For any* set of providers displayed in step 4, all providers SHALL offer at least one service in the categories selected in step 3.
**Validates: Requirements 4.2**

### Property 4: Provider Selection Tracking
*For any* provider selected in step 4, that provider SHALL appear in the selectedProviders array and SHALL be displayed in the summary section.
**Validates: Requirements 6.1, 6.2, 6.3**

### Property 5: Navigation Enablement
*For any* journey planning session, the "View Summary" button SHALL be disabled when no providers are selected, and enabled when at least one provider is selected.
**Validates: Requirements 6.4**

### Property 6: Complete Workflow Availability
*For any* journey planning session, all 5 steps (Location, Travel Details, Services, Providers, Summary) SHALL be accessible and functional.
**Validates: Requirements 2.2**

## Error Handling

1. **No Providers Found**: When no providers match the selected location and service categories, display a helpful message with options to:
   - Change location (go back to step 1)
   - Change service categories (go back to step 3)
   - Browse all services in destination discovery

2. **Provider Fetch Error**: If the API call fails, display an error message and provide a "Retry" button.

3. **Empty Selection**: If user tries to proceed to step 5 without selecting any providers, show a validation message.

4. **Location Not Selected**: If user somehow reaches step 4 without completing step 1, redirect back to step 1.

## Testing Strategy

### Unit Tests
- Test that Routes.jsx imports JourneyPlannerEnhanced
- Test that step 4 renders provider cards
- Test provider selection/deselection logic
- Test provider filtering by location
- Test provider filtering by service category

### Integration Tests
- Test complete flow from step 1 to step 5
- Test that selected providers appear in summary
- Test navigation between steps
- Test provider profile modal opening from step 4

### Manual Testing Checklist
1. Navigate to /journey-planner
2. Complete step 1 (select location)
3. Complete step 2 (enter travel details)
4. Complete step 3 (select service categories)
5. **Verify step 4 shows "Select Service Providers" heading**
6. **Verify provider cards are displayed**
7. **Verify providers can be selected/deselected**
8. **Verify selected providers appear in summary**
9. Complete step 5 (review and proceed to payment)

### Property-Based Tests
Using fast-check library:

1. **Provider Filtering Property**: For any random location and service categories, all displayed providers must match those criteria.

2. **Selection Persistence Property**: For any sequence of provider selections/deselections, the final selectedProviders array must accurately reflect the current state.

3. **Navigation Property**: For any step number, navigating to that step and back must preserve all previously entered data.

## Implementation Notes

### Why This Fix Works

1. **Minimal Change**: Only one line needs to be changed in Routes.jsx
2. **No Data Loss**: JourneyPlannerEnhanced already has all the functionality
3. **Tested Code**: JourneyPlannerEnhanced has been implemented and tested, just not activated
4. **Complete Workflow**: All 5 steps are already implemented in JourneyPlannerEnhanced

### Backward Compatibility

- The old journey-planner/index.jsx can be kept as a backup
- If issues arise, routing can be quickly reverted
- All existing components (ProviderCard, LocationSelector, etc.) are already in use

### Deployment Considerations

1. **Build Process**: After changing Routes.jsx, rebuild the application
2. **Cache Clearing**: Users may need to clear browser cache to see the change
3. **Testing**: Test on both development and production environments
4. **Rollback Plan**: Keep the old import commented out for quick rollback if needed

```javascript
// Routes.jsx
// OLD: import JourneyPlanner from './pages/journey-planner';
import JourneyPlanner from './pages/JourneyPlannerEnhanced';  // NEW
```

