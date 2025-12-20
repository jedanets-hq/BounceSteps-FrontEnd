# Design Document: Journey Planner Complete Workflow

## Overview

This design document outlines the implementation of comprehensive workflow improvements for the Journey Planner feature. The changes ensure strict filtering of services by category and location, replace the "+select" button with "Add to Favorite", add service details viewing capability with "Add to Plan" functionality, rename "Your Saved Journeys" to "Your Trip", implement proper trip building with Save Plan and Continue to Payment options, add provider follow functionality with real follower counts, and ensure followed providers' services appear first in destination discovery.

## Architecture

The implementation follows the existing React component architecture with the following key components:

```
src/
├── pages/
│   ├── journey-planner/
│   │   └── index.jsx          # Main journey planner with strict filtering
│   ├── traveler-dashboard/
│   │   ├── index.jsx          # Dashboard with Your Trip and Favorites sections
│   │   └── components/
│   │       └── FavoritesSection.jsx  # New favorites display component
│   ├── provider-profile/
│   │   └── index.jsx          # Provider profile with follow button and service details
│   └── destination-discovery/
│       └── index.jsx          # Discovery with followed providers first
├── contexts/
│   └── CartContext.jsx        # Cart management
└── components/
    ├── TripDetailsModal.jsx   # Trip details display
    └── ServiceDetailsModal.jsx # New service details modal
```

## Components and Interfaces

### 1. Journey Planner Component (Modified)

**File:** `src/pages/journey-planner/index.jsx`

**Changes:**
- Strict category filtering: Only show services matching selected category exactly
- Strict location filtering: Only show services from selected location
- Replace "+select" button with "Add to Favorite" button
- Add "View Details" button for each service
- Service details modal with "Add to Plan" button (no "Continue to Cart")
- Remove "Continue to Cart" from service cards

**Interface:**
```javascript
// Service filtering function
const filterServices = (services, category, location) => {
  return services.filter(service => 
    service.category === category &&
    matchesLocation(service, location)
  );
};

// Add to favorite function
const handleAddToFavorite = async (provider) => {
  const favorites = JSON.parse(localStorage.getItem('favorite_providers') || '[]');
  if (!favorites.some(p => p.id === provider.id)) {
    localStorage.setItem('favorite_providers', JSON.stringify([...favorites, provider]));
    // Also update in database
    await fetch(`/api/users/favorites`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider_id: provider.id })
    });
  }
};

// View service details
const handleViewServiceDetails = (service) => {
  setSelectedService(service);
  setShowServiceDetailsModal(true);
};

// Add service to plan from modal
const handleAddToPlan = (service) => {
  const categoryKey = service.category;
  setServicesByCategory(prev => ({
    ...prev,
    [categoryKey]: [...(prev[categoryKey] || []), service]
  }));
  setShowServiceDetailsModal(false);
};
```

### 2. Service Details Modal Component (New)

**File:** `src/components/ServiceDetailsModal.jsx`

**Purpose:** Display complete service information with "Add to Plan" button only

**Interface:**
```javascript
const ServiceDetailsModal = ({ 
  isOpen, 
  onClose, 
  service, 
  onAddToPlan 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="service-details">
        <h2>{service.title}</h2>
        <div className="images">{/* Service images */}</div>
        <div className="description">{service.description}</div>
        <div className="price">TZS {service.price}</div>
        <div className="amenities">{/* Service amenities */}</div>
        <div className="payment-methods">{/* Accepted payment methods */}</div>
        <div className="contact-info">{/* Contact information */}</div>
        <Button onClick={() => onAddToPlan(service)}>
          Add to Plan
        </Button>
      </div>
    </Modal>
  );
};
```

### 3. Traveler Dashboard Component (Modified)

**File:** `src/pages/traveler-dashboard/index.jsx`

**Changes:**
- Rename "Your Saved Journeys" to "Your Trip"
- Add "Favorites" tab
- Display all selected services in trip plan
- Show trip details with services, dates, travelers, total cost
- Add "Continue to Payment" button for saved trips

**Interface:**
```javascript
// Trip display structure
const tripPlan = {
  id: number,
  services: Service[],
  location: { country, region, district, area },
  dates: { startDate, endDate },
  travelers: number,
  totalCost: number,
  status: 'saved' | 'pending_payment' | 'paid',
  createdAt: string
};

// Favorites display
const favoriteProviders = [
  {
    id: number,
    business_name: string,
    location: string,
    is_verified: boolean,
    followers_count: number
  }
];
```

### 4. Favorites Section Component (New)

**File:** `src/pages/traveler-dashboard/components/FavoritesSection.jsx`

**Purpose:** Display all favorite providers in dashboard

**Interface:**
```javascript
const FavoritesSection = () => {
  const [favorites, setFavorites] = useState([]);
  
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorite_providers') || '[]');
    setFavorites(savedFavorites);
  }, []);
  
  return (
    <div className="favorites-grid">
      {favorites.map(provider => (
        <ProviderCard 
          key={provider.id}
          provider={provider}
          onRemove={handleRemoveFavorite}
        />
      ))}
    </div>
  );
};
```

### 5. Provider Profile Component (Modified)

**File:** `src/pages/provider-profile/index.jsx`

**Changes:**
- Add "Follow" button with follow/unfollow toggle
- Display follower count from database
- Add "View Details" button for each service
- Service details modal with "Add to Plan" button

**Interface:**
```javascript
// Follow provider function
const handleFollow = async (providerId) => {
  const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
  const token = userData.token;
  
  const followedProviders = JSON.parse(localStorage.getItem('followed_providers') || '[]');
  const isFollowing = followedProviders.includes(providerId);
  
  if (isFollowing) {
    // Unfollow
    const updated = followedProviders.filter(id => id !== providerId);
    localStorage.setItem('followed_providers', JSON.stringify(updated));
    await fetch(`/api/providers/${providerId}/unfollow`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } else {
    // Follow
    localStorage.setItem('followed_providers', JSON.stringify([...followedProviders, providerId]));
    await fetch(`/api/providers/${providerId}/follow`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
  
  // Refresh follower count
  fetchFollowerCount();
};

// Get follower count
const fetchFollowerCount = async (providerId) => {
  const response = await fetch(`/api/providers/${providerId}/followers/count`);
  const data = await response.json();
  setFollowerCount(data.count);
};
```

### 6. Destination Discovery Component (Modified)

**File:** `src/pages/destination-discovery/index.jsx`

**Changes:**
- Sort services to show followed providers' services first
- Maintain existing category and search filtering

**Interface:**
```javascript
// Sort services by followed providers
const sortServicesByFollowedProviders = (services) => {
  const followedProviders = JSON.parse(localStorage.getItem('followed_providers') || '[]');
  
  return services.sort((a, b) => {
    const aIsFollowed = followedProviders.includes(a.provider_id);
    const bIsFollowed = followedProviders.includes(b.provider_id);
    
    if (aIsFollowed && !bIsFollowed) return -1;
    if (!aIsFollowed && bIsFollowed) return 1;
    return 0;
  });
};
```

## Data Models

### Trip Plan Model
```javascript
{
  id: number,
  country: string,
  region: string,
  district: string,
  area: string,
  startDate: string,
  endDate: string,
  travelers: number,
  services: [{
    id: number,
    name: string,
    title: string,
    price: number,
    category: string,
    provider_id: number,
    business_name: string,
    payment_methods: object,
    contact_info: object
  }],
  totalCost: number,
  status: 'saved' | 'pending_payment' | 'paid',
  createdAt: string
}
```

### Favorite Provider Model
```javascript
{
  id: number,
  business_name: string,
  location: string,
  is_verified: boolean,
  followers_count: number,
  addedAt: string
}
```

### Followed Provider Model
```javascript
{
  provider_id: number,
  traveler_id: number,
  followed_at: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Category Filtering Strictness
*For any* set of services and any selected category, all services displayed after filtering SHALL have their category field exactly matching the selected category, and no services from other categories SHALL appear.
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Location Filtering Strictness
*For any* set of services and any selected location (region, district, sublocation), all services displayed after filtering SHALL have location fields matching the selected location hierarchy, and no services from other locations SHALL appear.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Favorite Provider Persistence
*For any* provider added to favorites, that provider SHALL appear in the favorites list in localStorage and SHALL be displayed in the Favorites section of the traveler dashboard.
**Validates: Requirements 3.2, 3.3**

### Property 4: Service Details Modal Content
*For any* service, when viewing its details modal, the modal SHALL contain: description, price, amenities (if any), payment methods, contact info, and an "Add to Plan" button, and SHALL NOT contain a "Continue to Cart and Payment" button.
**Validates: Requirements 4.2, 4.3, 4.4**

### Property 5: Trip Service Accumulation
*For any* sequence of service selections, all selected services SHALL appear in the trip plan, and the total cost SHALL equal the sum of all selected service prices multiplied by the number of travelers.
**Validates: Requirements 6.1, 6.2, 6.3**

### Property 6: Save Plan Status
*For any* trip plan saved via "Save Plan" button, the trip SHALL be stored in localStorage with status "saved", SHALL appear in My Trips section, and services SHALL NOT be added to cart.
**Validates: Requirements 7.2**

### Property 7: Continue to Payment Flow
*For any* trip plan where "Continue to Cart & Payments" is clicked, all services SHALL be added to cart, the trip status SHALL be "pending_payment", the trip SHALL be saved to My Trips, and navigation SHALL occur to the cart/payment section.
**Validates: Requirements 7.3**

### Property 8: Trip Details Completeness
*For any* saved trip, viewing its details SHALL display all service names, booking dates, traveler count, and total cost.
**Validates: Requirements 8.1, 8.2**

### Property 9: Per-Service Payment Display
*For any* cart with multiple services from different providers, each service SHALL display its provider's accepted payment methods separately.
**Validates: Requirements 9.1, 9.2**

### Property 10: Follow Provider Updates
*For any* provider that is followed, the provider SHALL be added to the followed list, and the provider's follower count SHALL increase by exactly one.
**Validates: Requirements 10.2, 10.3**

### Property 11: Followed Provider Service Priority
*For any* traveler with followed providers, when viewing destination discovery, services from followed providers SHALL appear before services from non-followed providers.
**Validates: Requirements 10.4**

### Property 12: Follower Count Accuracy
*For any* provider profile view, the displayed follower count SHALL match the actual count stored in the database/localStorage.
**Validates: Requirements 11.2, 11.3**

### Property 13: Service Modal Button Exclusivity
*For any* service details modal, the modal SHALL display "Add to Plan" button and SHALL NOT display "Continue to Cart and Payment" button.
**Validates: Requirements 12.1, 12.2**

### Property 14: Favorites Tab Display
*For any* traveler with favorite providers, the Favorites tab SHALL display all providers marked as favorite with their name, location, verification status, and follower count.
**Validates: Requirements 13.2, 13.3**

## Error Handling

1. **Empty Service Results**: When no services match the selected category and location, display a helpful message with options to change category or location.

2. **Failed Follow Request**: If the follow API call fails, show an error message and do not update local state.

3. **Invalid Trip Data**: Validate trip data before saving to ensure all required fields are present.

4. **Payment Method Missing**: If a service has no payment methods configured, display a message to contact the provider directly.

5. **Favorite Already Exists**: If a provider is already in favorites, show a message indicating they are already favorited.

6. **Empty Trip Plan**: If a traveler tries to save or continue to payment with no services selected, show an error message.

## Testing Strategy

### Unit Tests
- Test service filtering functions for category and location matching
- Test favorite provider add/remove operations
- Test trip plan creation and status updates
- Test follower count calculations
- Test service modal button display logic

### Property-Based Tests
Using fast-check library for JavaScript:

1. **Category Filter Property Test**: Generate random services with various categories, apply filter, verify all results match selected category.

2. **Location Filter Property Test**: Generate random services with various locations, apply filter, verify all results match selected location.

3. **Favorite Persistence Property Test**: Generate random providers, add to favorites, verify persistence and retrieval.

4. **Trip Accumulation Property Test**: Generate random service selections, verify total cost calculation and service list completeness.

5. **Follow Count Property Test**: Generate random follow/unfollow sequences, verify count accuracy.

6. **Service Modal Button Test**: For any service, verify modal contains "Add to Plan" and does not contain "Continue to Cart".

### Integration Tests
- Test complete journey planning flow from location selection to payment
- Test provider profile viewing and following
- Test trip saving and retrieval from My Trips
- Test favorites display in dashboard

### Test Configuration
- Property-based tests SHALL run minimum 100 iterations
- Each property test SHALL be tagged with format: `**Feature: journey-planner-complete-workflow, Property {number}: {property_text}**`
