# Design Document: Journey Planner Workflow Fixes

## Overview

This design addresses critical workflow issues in the Journey Planner feature. The fixes ensure proper service filtering by category and location, improve provider profile interactions, add service detail viewing capabilities, implement proper journey plan management, and separate the save and payment workflows.

The design focuses on maintaining data consistency, providing clear user feedback, and ensuring that the workflow matches user expectations for planning and booking travel services.

## Architecture

### Component Structure

```
JourneyPlanner (Main Component)
├── LocationSelector (Step 1)
├── TravelDetailsForm (Step 2)
├── CategorySelector (Step 3)
├── ServiceBrowser (Step 4)
│   ├── ServiceCard
│   │   └── ViewDetailsButton
│   └── ServiceDetailsModal
└── PlanReview (Step 5)
    ├── SavePlanButton
    └── ContinueToPaymentButton

ProviderProfile
├── ProviderHeader
│   ├── FollowButton
│   ├── FollowerCount
│   └── AddToFavoriteButton
└── ServicesList
    └── ServiceCard
        └── ViewDetailsButton

TravelerDashboard
├── YourTripSection
│   └── TripCard
│       └── ViewDetailsButton
├── FavoritesSection
│   └── FavoriteProviderCard
└── CartSection
    └── PaymentGuidance

ServiceDetailsModal
├── ServiceImages
├── ProviderInfo
├── PriceDisplay
├── Description
├── Amenities
├── PaymentMethods
├── ContactInfo
└── AddToPlanButton

TripDetailsModal
├── TripSummary
├── ServicesList
├── TotalCost
└── ContinueToPaymentButton
```

### Data Flow

1. **Service Filtering Flow**
   - User selects category → Fetch services by category
   - User selects location → Filter services by location
   - Apply BOTH filters → Display only matching services
   - Store filtered results in component state

2. **Journey Plan Creation Flow**
   - User selects services → Add to servicesByCategory state
   - User completes selection → Create journey plan object
   - Save to localStorage → Update dashboard
   - Provide save/payment options → User chooses action

3. **Provider Follow Flow**
   - User clicks Follow → Send API request
   - Update follower count → Store in localStorage
   - Fetch followed providers → Display in dashboard
   - New service created → Highlight in feed

4. **Payment Workflow**
   - User saves plan → Store in localStorage with status='saved'
   - User continues to payment → Add services to cart + status='pending_payment'
   - User pays per service → Update individual booking status
   - All services paid → Mark trip as complete

## Components and Interfaces

### 1. JourneyPlanner Component

**State Management:**
```javascript
{
  step: number,
  formData: {
    country: string,
    region: string,
    district: string,
    sublocation: string,
    startDate: string,
    endDate: string,
    travelers: number,
    budget: string,
    serviceCategory: string,
    selectedServices: array
  },
  availableServices: array,
  servicesByCategory: object,
  selectedCategory: string,
  loadingServices: boolean,
  showServiceDetailsModal: boolean,
  selectedServiceForDetails: object
}
```

**Key Methods:**
- `fetchServicesByCategory(category)` - Fetch and filter services strictly by category and location
- `handleServiceToggle(serviceId)` - Add/remove service from selection
- `handleViewServiceDetails(service)` - Open service details modal
- `handleAddToPlanFromModal(service)` - Add service to plan from modal
- `handleSavePlan()` - Save journey plan without payment
- `handleContinueToPayment()` - Save plan and navigate to payment

### 2. ServiceDetailsModal Component

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: function,
  service: object,
  onAddToPlan: function
}
```

**Display Sections:**
- Service images gallery
- Provider information with verification badge
- Price and category
- Full description
- Amenities list
- Accepted payment methods
- Contact information (WhatsApp, Email, Phone)
- Add to Plan button

### 3. ProviderProfile Component

**State Management:**
```javascript
{
  provider: object,
  services: array,
  isFollowing: boolean,
  followerCount: number,
  loadingFollow: boolean,
  selectedCategory: string,
  showServiceDetailsModal: boolean,
  selectedServiceForDetails: object
}
```

**Key Methods:**
- `handleFollowToggle()` - Follow/unfollow provider
- `handleAddToFavorite()` - Add provider to favorites
- `fetchFollowerCount()` - Get current follower count
- `handleViewServiceDetails(service)` - Open service details modal

### 4. TravelerDashboard Component

**State Management:**
```javascript
{
  activeTab: string,
  savedJourneyPlans: array,
  favoriteProviders: array,
  myBookings: array,
  selectedTrip: object,
  showTripDetails: boolean
}
```

**Key Methods:**
- `loadSavedPlans()` - Load journey plans from localStorage
- `loadFavoriteProviders()` - Load favorite providers from localStorage
- `handleViewTripDetails(trip)` - Open trip details modal
- `handleContinueToPayment(trip)` - Add trip services to cart and navigate to payment

### 5. TripDetailsModal Component

**Props:**
```javascript
{
  trip: object,
  isOpen: boolean,
  onClose: function
}
```

**Display Sections:**
- Trip summary (location, dates, travelers, total cost)
- Services list with details
- Payment status indicators
- Continue to Payment button (if pending)

## Data Models

### Journey Plan Model
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
  services: [
    {
      id: number,
      title: string,
      category: string,
      price: number,
      provider_id: number,
      businessName: string,
      location: string,
      images: array,
      description: string,
      payment_methods: object,
      contact_info: object
    }
  ],
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
  followed_at: string
}
```

### Service Filter Criteria
```javascript
{
  category: string,      // MUST match exactly
  location: string,      // MUST match sublocation, district, or region
  region: string,        // Optional additional filter
  district: string,      // Optional additional filter
  limit: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

