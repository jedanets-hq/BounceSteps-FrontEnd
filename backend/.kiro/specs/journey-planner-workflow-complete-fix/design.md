# Design Document

## Overview

This design addresses critical workflow issues in the Journey Planner system. The current implementation has several problems:
- Services from wrong categories and locations are displayed
- Provider profile lacks favorite functionality
- Service details are not accessible from provider profiles
- Journey plan workflow is incomplete
- Payment flow doesn't handle multiple providers correctly

This design provides a complete solution that ensures strict filtering, proper favorite management, comprehensive service details, and a clear journey planning to payment workflow.

## Architecture

### Component Structure

```
JourneyPlanner/
├── LocationSelector (Step 1)
├── TravelDetails (Step 2)
├── CategorySelector (Step 3)
├── ServiceSelector (Step 4)
│   ├── ServiceCard
│   │   └── ViewDetailsButton
│   └── ServiceDetailsModal
└── PlanSummary (Step 5)
    ├── SavePlanButton
    └── ContinueToPaymentButton

ProviderProfile/
├── ProviderHeader
│   ├── FollowButton
│   └── AddToFavoriteButton
├── ServicesList
│   └── ServiceCard
│       ├── ViewDetailsButton
│       └── AddToPlanButton
└── ServiceDetailsModal

TravelerDashboard/
├── Overview
├── MyTrips (renamed from YourSavedJourneys)
│   ├── SavedPlans
│   └── BookedTrips
├── Favorites (new section)
│   └── FavoriteProvidersList
└── CartAndPayment
    └── MultiProviderPaymentFlow
```

### Data Flow

1. **Service Filtering Flow**
   - User selects category → API call with category filter
   - User selects location → API call with location filter
   - Both filters applied → API call with both parameters
   - Results filtered client-side for strict matching

2. **Favorite Provider Flow**
   - User clicks "Add to Favorite" → API POST /api/providers/:id/follow
   - Update localStorage favorite_providers array
   - Update follower count in UI
   - Show in Favorites section of dashboard

3. **Journey Planning Flow**
   - User selects services → Add to servicesByCategory state
   - User clicks "Save Plan" → Save to localStorage journey_plans
   - User clicks "Continue to Cart and Payments" → Add to cart + Save plan + Navigate to payment

4. **Payment Flow**
   - Display all services with total cost
   - Group by provider
   - Show payment methods per provider
   - Process payments individually per provider

## Components and Interfaces

### ServiceDetailsModal Component

```typescript
interface ServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  onAddToPlan: (service: Service) => void;
  showContinueToCart?: boolean; // Default: false
}

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  provider_id: number;
  businessName: string;
  provider_verified: boolean;
  rating: number;
  amenities?: string[];
  payment_methods: PaymentMethods;
  contact_info: ContactInfo;
}
```

### ProviderProfile Component Updates

```typescript
interface ProviderProfileState {
  provider: Provider;
  services: Service[];
  isFollowing: boolean;
  followerCount: number;
  isFavorite: boolean;
  selectedService: Service | null;
  showServiceDetailsModal: boolean;
}

interface Provider {
  id: number;
  business_name: string;
  location: string;
  is_verified: boolean;
  followers_count: number;
  average_rating: number;
}
```

### JourneyPlanner Component Updates

```typescript
interface JourneyPlannerState {
  step: number;
  formData: JourneyFormData;
  servicesByCategory: Record<string, Service[]>;
  selectedCategory: string;
  availableServices: Service[];
  showServiceDetailsModal: boolean;
  selectedServiceForDetails: Service | null;
}

interface JourneyFormData {
  country: string;
  region: string;
  district: string;
  sublocation: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
  serviceCategory: string;
  selectedServices: number[];
}
```

### TravelerDashboard Component Updates

```typescript
interface TravelerDashboardState {
  activeTab: 'overview' | 'trips' | 'favorites' | 'cart' | 'preferences' | 'support';
  savedJourneyPlans: JourneyPlan[];
  favoriteProviders: Provider[];
  myBookings: Booking[];
}

interface JourneyPlan {
  id: number;
  country: string;
  region: string;
  district: string;
  area: string;
  startDate: string;
  endDate: string;
  services: Service[];
  travelers: number;
  totalCost: number;
  status: 'saved' | 'pending_payment' | 'paid';
  createdAt: string;
}
```

## Data Models

### Journey Plan Model

```typescript
interface JourneyPlan {
  id: number;
  user_id: number;
  country: string;
  region: string;
  district: string;
  area: string;
  start_date: string;
  end_date: string;
  travelers: number;
  total_cost: number;
  status: 'saved' | 'pending_payment' | 'paid';
  services: Service[];
  created_at: string;
  updated_at: string;
}
```

### Favorite Provider Model

```typescript
interface FavoriteProvider {
  id: number;
  user_id: number;
  provider_id: number;
  created_at: string;
}
```

### Provider Follow Model

```typescript
interface ProviderFollow {
  id: number;
  user_id: number;
  provider_id: number;
  created_at: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Service Category Filtering Exactness
*For any* service category selection and location selection, all displayed services must match both the exact category AND the exact location (or location hierarchy).
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Favorite Provider Persistence
*For any* provider marked as favorite, that provider must appear in the user's Favorites section and remain there until explicitly unfollowed.
**Validates: Requirements 2.2, 2.3, 2.4**

### Property 3: Service Details Modal Completeness
*For any* service viewed in details modal, all required fields (images, description, price, amenities, payment methods, contact info) must be displayed.
**Validates: Requirements 3.3, 8.3**

### Property 4: Journey Plan Service Inclusion
*For any* service added to a journey plan, that service must appear in the plan summary with correct details and contribute to the total cost.
**Validates: Requirements 4.1, 4.2**

### Property 5: Plan Save and Cart Workflow Separation
*For any* journey plan, clicking "Save Plan" must save without adding to cart, while "Continue to Cart and Payments" must both save the plan AND add services to cart.
**Validates: Requirements 4.3, 4.4, 4.5**

### Property 6: My Trips Visibility
*For any* saved journey plan, that plan must be visible in the "My Trips" section of the dashboard with all service details accessible.
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 7: Multi-Provider Payment Separation
*For any* journey plan with services from multiple providers, each provider's services must be payable separately with that provider's specific payment methods.
**Validates: Requirements 6.2, 6.3, 6.4**

### Property 8: Follower Count Accuracy
*For any* provider, the displayed follower count must equal the actual number of users who have followed that provider.
**Validates: Requirements 7.2, 7.4, 7.5**

### Property 9: Service Details Modal Button Exclusivity
*For any* service details modal opened from journey planner or provider profile, only "Add to Plan" button must be shown, never "Continue to Cart and Payment".
**Validates: Requirements 9.1, 9.2, 9.3**

### Property 10: New Service Prominence for Followed Providers
*For any* provider that a user follows, when that provider adds a new service, the service must appear prominently (top of list or highlighted) in the user's destination discovery feed.
**Validates: Requirements 7.3**

## Error Handling

### Service Filtering Errors
- **No services found**: Display clear message with options to change category or location
- **API failure**: Show error message and retry button
- **Invalid category/location**: Prevent selection and show validation message

### Favorite Provider Errors
- **Already favorited**: Show "Already in favorites" message
- **API failure**: Show error and allow retry
- **Not authenticated**: Redirect to login with return URL

### Journey Plan Errors
- **Empty plan**: Prevent save/payment with message "Add at least one service"
- **Invalid dates**: Show validation error
- **Save failure**: Show error and allow retry

### Payment Errors
- **Payment method unavailable**: Show alternative methods
- **Payment failure**: Show error details and allow retry
- **Network error**: Queue for retry when connection restored

## Testing Strategy

### Unit Testing
- Test service filtering logic with various category/location combinations
- Test favorite provider add/remove operations
- Test journey plan save/load from localStorage
- Test payment flow state transitions
- Test follower count increment/decrement

### Property-Based Testing
We will use **fast-check** for JavaScript/React property-based testing.

Each property-based test will:
- Run a minimum of 100 iterations
- Be tagged with the format: `**Feature: journey-planner-workflow-complete-fix, Property {number}: {property_text}**`
- Test the universal properties defined in the Correctness Properties section

### Integration Testing
- Test complete journey planning flow from location selection to payment
- Test provider profile view with service details and favorites
- Test dashboard My Trips section with saved plans
- Test multi-provider payment workflow

### End-to-End Testing
- Test user journey: Browse → Select Services → Save Plan → View in Dashboard → Pay
- Test provider follow workflow and new service notifications
- Test service details modal from multiple entry points

## Implementation Notes

### Strict Service Filtering
The filtering must happen at two levels:
1. **API level**: Send category and location parameters to backend
2. **Client level**: Additional filtering to ensure exact matches

```javascript
const filteredServices = services.filter(service => {
  const matchesCategory = service.category === selectedCategory;
  const matchesLocation = 
    service.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
    service.district.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
    service.region.toLowerCase().includes(selectedRegion.toLowerCase());
  return matchesCategory && matchesLocation;
});
```

### Favorite Provider Storage
Use both localStorage and API:
- **localStorage**: `favorite_providers` array for quick access
- **API**: `/api/providers/:id/follow` for persistence and follower count

### Journey Plan Workflow
Two distinct actions:
1. **Save Plan**: `localStorage.setItem('journey_plans', ...)`
2. **Continue to Payment**: Save plan + Add to cart + Navigate

### Multi-Provider Payment
Group services by provider_id and display payment options per provider:
```javascript
const servicesByProvider = services.reduce((acc, service) => {
  const providerId = service.provider_id;
  if (!acc[providerId]) acc[providerId] = [];
  acc[providerId].push(service);
  return acc;
}, {});
```

### Service Details Modal Context
Pass a flag to control button display:
- From Journey Planner: `showContinueToCart={false}`
- From Provider Profile: `showContinueToCart={false}`
- Only show "Add to Plan" button

### Follower Count Real-time Update
Update follower count immediately on follow/unfollow:
```javascript
const handleFollow = async () => {
  const response = await fetch(`/api/providers/${providerId}/follow`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  setFollowerCount(data.followers_count); // Use server count
  setIsFollowing(true);
};
```

## Performance Considerations

- Cache service data for 5 minutes to reduce API calls
- Lazy load service images
- Paginate service lists (20 per page)
- Debounce search input (300ms)
- Use React.memo for ServiceCard components
- Optimize re-renders with useMemo for filtered services

## Security Considerations

- Validate all user inputs before API calls
- Sanitize service descriptions to prevent XSS
- Verify user authentication before allowing favorites/follows
- Rate limit follow/unfollow actions (max 10 per minute)
- Validate payment data on backend before processing

## Accessibility

- Ensure all buttons have proper ARIA labels
- Provide keyboard navigation for service selection
- Add screen reader announcements for filter changes
- Ensure sufficient color contrast for all text
- Provide alt text for all service images
