# Implementation Plan

## Overview
This implementation plan addresses all workflow issues in the Journey Planner system. Each task builds incrementally to ensure a working system at every checkpoint.

---

## Phase 1: Service Filtering Fixes

- [x] 1. Fix strict service filtering in Journey Planner



  - Update `fetchServicesByCategory` function to apply strict category AND location filtering
  - Ensure client-side filtering matches only exact category
  - Ensure location matching checks all location fields (location, district, region, area)
  - Add console logging for debugging filter results
  - Test with multiple category/location combinations



  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 2. Add "No services found" messaging



  - Create clear message component when no services match filters
  - Add "Change Category" and "Browse All Services" buttons
  - Style message with appropriate icons and colors
  - _Requirements: 1.4_

- [ ] 3. Update service display to show category and location info
  - Add info banner showing current category and location filters
  - Display filter summary above service list
  - _Requirements: 1.1, 1.2_

---

## Phase 2: Provider Profile Enhancements

- [ ] 4. Replace "+Select" button with "Add to Favorite" in Provider Profile
  - Remove existing "+Select" button from provider profile
  - Add "Add to Favorite" button with heart icon
  - Implement favorite toggle functionality
  - Update button text based on favorite status ("Add to Favorite" / "Following")
  - Style button to match design system
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 5. Implement favorite provider storage
  - Create localStorage management for `favorite_providers` array
  - Implement API calls to `/api/users/favorites` endpoint
  - Add favorite provider to localStorage on click
  - Remove from localStorage on unfollow
  - _Requirements: 2.2, 2.5_

- [ ] 6. Add "View Details" button to provider profile services
  - Add "View Details" button to each service card in provider profile
  - Implement click handler to open ServiceDetailsModal
  - Pass service data to modal
  - _Requirements: 3.1, 3.2_

- [ ] 7. Implement follow functionality with follower count
  - Add "Follow" button to provider header
  - Display current follower count
  - Implement API calls to `/api/providers/:id/follow` and `/api/providers/:id/unfollow`
  - Update follower count in real-time after follow/unfollow
  - Update localStorage `followed_providers` array
  - _Requirements: 7.1, 7.2, 7.4_

---

## Phase 3: Service Details Modal Updates

- [ ] 8. Update ServiceDetailsModal to remove "Continue to Cart" button
  - Remove "Continue to Cart and Payment" button from modal footer
  - Keep only "Add to Plan" button
  - Rename "Save to Plan" to "Add to Plan" if needed
  - Update button styling and layout
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 9. Implement "Add to Plan" functionality in modal
  - Create `onAddToPlan` callback prop
  - Implement service addition to journey plan state
  - Close modal after adding to plan
  - Show success feedback (toast or message)
  - _Requirements: 3.4, 3.5, 8.4, 8.5_

- [ ] 10. Add "View Details" button in Journey Planner service list
  - Add "View Details" button to service cards in step 4
  - Implement click handler to open ServiceDetailsModal
  - Pass service data and `onAddToPlan` callback
  - _Requirements: 8.1, 8.2_

---

## Phase 4: Journey Plan Workflow

- [ ] 11. Create Plan Summary step (Step 5) in Journey Planner
  - Add new step 5 to journey planner flow
  - Display all selected services from all categories
  - Show service details: name, category, price, provider
  - Calculate and display total cost
  - Show trip details: location, dates, travelers
  - _Requirements: 4.1, 4.2_

- [ ] 12. Implement "Save Plan" button functionality
  - Add "Save Plan" button to plan summary
  - Create journey plan object with all details
  - Save to localStorage `journey_plans` array
  - Set plan status as 'saved'
  - Show success message
  - Navigate to dashboard My Trips tab
  - _Requirements: 4.3, 4.4_

- [ ] 13. Implement "Continue to Cart and Payments" button functionality
  - Add "Continue to Cart and Payments" button to plan summary
  - Save journey plan to localStorage (same as Save Plan)
  - Add all services to cart using `addToCart` from CartContext
  - Set plan status as 'pending_payment'
  - Navigate to dashboard cart tab with `?tab=cart&openPayment=true`
  - _Requirements: 4.3, 4.5_

---

## Phase 5: Dashboard Updates

- [ ] 14. Rename "Your Saved Journeys" to "My Trips" in dashboard
  - Update tab name from "Your Saved Journeys" to "My Trips"
  - Update section heading
  - Update any related text or labels
  - _Requirements: 5.1_

- [ ] 15. Create "Favorites" section in dashboard
  - Add new "Favorites" tab to dashboard navigation
  - Create FavoriteProvidersList component
  - Load favorite providers from localStorage
  - Display provider cards with name, location, verified badge, follower count
  - Add "View Profile" button for each provider
  - Add "Unfollow" button for each provider
  - _Requirements: 2.4_

- [ ] 16. Update My Trips section to show saved plans
  - Load journey plans from localStorage
  - Display plan cards with location, dates, service count, total cost
  - Show plan status badge (Saved / Pending Payment / Paid)
  - Add "View Details" button for each plan
  - _Requirements: 5.2, 5.3_

- [ ] 17. Implement Trip Details Modal
  - Create TripDetailsModal component (if not exists)
  - Display complete trip information: location, dates, travelers
  - List all services with details and prices
  - Show total cost
  - Add "Continue to Payments" button for saved plans
  - Add "View Receipt" button for paid plans
  - _Requirements: 5.3, 5.4, 5.5_

---

## Phase 6: Multi-Provider Payment Workflow

- [ ] 18. Update Cart page to group services by provider
  - Group cart items by `provider_id`
  - Display provider name for each group
  - Show subtotal for each provider's services
  - Display grand total for all services
  - _Requirements: 6.1_

- [ ] 19. Implement per-provider payment method display
  - For each provider group, display accepted payment methods
  - Show payment method icons (Visa, Mobile Money, etc.)
  - Add "Pay Now" button for each provider group
  - _Requirements: 6.2, 6.3_

- [ ] 20. Implement individual provider payment flow
  - Create payment modal for single provider
  - Display provider's services and total
  - Show only that provider's payment methods
  - Process payment for that provider only
  - Mark services as paid after successful payment
  - Update journey plan status when all services paid
  - _Requirements: 6.3, 6.4, 6.5_

---

## Phase 7: New Service Prominence for Followed Providers

- [ ] 21. Implement new service detection for followed providers
  - Track last visit timestamp for each user
  - Query services added after last visit from followed providers
  - Mark these services as "new" in the data
  - _Requirements: 7.3_

- [ ] 22. Display new services prominently in destination discovery
  - Add "New from Providers You Follow" section at top of feed
  - Display new services with "NEW" badge
  - Sort by most recent first
  - Add provider name and "Following" indicator
  - _Requirements: 7.3_

---

## Phase 8: API Endpoints (Backend)

- [ ] 23. Create/update favorite providers API endpoints
  - POST `/api/users/favorites` - Add provider to favorites
  - DELETE `/api/users/favorites/:providerId` - Remove from favorites
  - GET `/api/users/favorites` - Get user's favorite providers
  - Update database schema if needed
  - _Requirements: 2.2, 2.5_

- [ ] 24. Create/update provider follow API endpoints
  - POST `/api/providers/:id/follow` - Follow provider
  - POST `/api/providers/:id/unfollow` - Unfollow provider
  - GET `/api/providers/:id/followers/count` - Get follower count
  - Update provider followers count in database
  - _Requirements: 7.1, 7.2, 7.4_

- [ ] 25. Update services API to support strict filtering
  - Ensure `/api/services` endpoint filters by exact category
  - Ensure location filtering checks all location fields
  - Add query parameters: `category`, `location`, `district`, `region`
  - Return only services matching ALL provided filters
  - _Requirements: 1.1, 1.2, 1.3_

---

## Phase 9: Testing & Quality Assurance

- [ ] 26. Write unit tests for service filtering
  - Test category filtering with various categories
  - Test location filtering with various locations
  - Test combined category + location filtering
  - Test empty results handling
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 27. Write unit tests for favorite provider functionality
  - Test add to favorites
  - Test remove from favorites
  - Test localStorage persistence
  - Test API integration
  - _Requirements: 2.2, 2.3, 2.5_

- [ ] 28. Write unit tests for journey plan workflow
  - Test plan creation
  - Test save plan functionality
  - Test continue to cart functionality
  - Test plan retrieval from localStorage
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 29. Write integration tests for complete journey planning flow
  - Test: Select location → Select category → Select services → Save plan
  - Test: Select location → Select category → Select services → Continue to payment
  - Test: View saved plan in dashboard → Continue to payment
  - _Requirements: All_

- [ ] 30. Write property-based tests for correctness properties
  - **Property 1**: Service category filtering exactness
  - **Property 2**: Favorite provider persistence
  - **Property 3**: Service details modal completeness
  - **Property 4**: Journey plan service inclusion
  - **Property 5**: Plan save and cart workflow separation
  - **Property 6**: My trips visibility
  - **Property 7**: Multi-provider payment separation
  - **Property 8**: Follower count accuracy
  - **Property 9**: Service details modal button exclusivity
  - **Property 10**: New service prominence for followed providers
  - Use fast-check library with 100+ iterations per property
  - Tag each test with: `**Feature: journey-planner-workflow-complete-fix, Property {number}: {property_text}**`
  - _Requirements: All_

---

## Phase 10: Final Integration & Polish

- [ ] 31. Test complete user journey end-to-end
  - Login as traveler
  - Browse destination discovery
  - Follow a provider
  - Plan a journey with multiple services
  - Save the plan
  - View plan in My Trips
  - Continue to payment
  - Complete payment for each provider
  - Verify booking confirmation
  - _Requirements: All_

- [ ] 32. Fix any UI/UX issues discovered during testing
  - Ensure consistent styling across all components
  - Verify responsive design on mobile
  - Check loading states and error messages
  - Ensure smooth transitions and animations
  - _Requirements: All_

- [ ] 33. Update documentation and user guides
  - Document new workflow in user guide
  - Update API documentation
  - Add inline help text where needed
  - Create tooltips for complex features
  - _Requirements: All_

- [ ] 34. Final checkpoint - Ensure all tests pass
  - Run all unit tests
  - Run all integration tests
  - Run all property-based tests
  - Fix any failing tests
  - Verify no console errors
  - Ask user if questions arise
  - _Requirements: All_

---

## Notes

- Each phase builds on the previous one
- Test thoroughly after each phase before moving to the next
- Keep the existing functionality working while adding new features
- Use console.log for debugging during development
- Remove debug logs before final deployment
- Ensure backward compatibility with existing data in localStorage
