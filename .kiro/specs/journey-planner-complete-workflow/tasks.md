# Implementation Plan

- [x] 1. Create Service Details Modal Component


  - Create new ServiceDetailsModal.jsx component in src/components/
  - Display service title, images, description, price, amenities
  - Display payment methods and contact information
  - Add "Add to Plan" button (NO "Continue to Cart" button)
  - Add close button and modal overlay
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 12.1, 12.2, 14.1, 14.2_



- [ ] 2. Update Journey Planner with Strict Filtering
  - Modify filterServices function to strictly match category
  - Modify filterServices function to strictly match location (region, district, sublocation)
  - Ensure no services from other categories appear when category is selected
  - Ensure no services from other locations appear when location is selected


  - Add console logging to verify filtering is working correctly
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [ ] 3. Replace +Select with Add to Favorite in Journey Planner
  - Remove "+select" button from service cards
  - Add "Add to Favorite" button to each service card
  - Implement handleAddToFavorite function to save provider to localStorage


  - Add API call to save favorite to database
  - Show confirmation message when provider is added to favorites
  - Handle case when provider is already in favorites
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Add View Details Button to Journey Planner Services

  - Add "View Details" button to each service card in Journey Planner
  - Implement handleViewServiceDetails function to open modal
  - Pass service data to ServiceDetailsModal
  - Implement handleAddToPlan function in modal to add service to trip
  - Close modal after adding service to plan
  - _Requirements: 4.1, 4.2, 4.3, 14.1, 14.2, 14.3, 14.4_


- [ ] 5. Implement Add to Plan Functionality
  - Modify handleAddToPlan to add service to servicesByCategory state
  - Update trip plan display to show all selected services
  - Calculate total cost correctly (sum of all services × travelers)
  - Display services grouped by category in trip summary
  - _Requirements: 6.1, 6.2, 6.3_


- [ ] 6. Update Save Plan Button Logic
  - Modify "Save Plan" button to save trip with status "saved"
  - Ensure services are NOT added to cart when saving plan
  - Save trip to localStorage under 'journey_plans' key
  - Navigate to dashboard My Trips tab after saving


  - Show success message after saving
  - _Requirements: 7.1, 7.2_

- [x] 7. Update Continue to Cart & Payments Button Logic


  - Modify "Continue to Cart & Payments" button to add all services to cart
  - Save trip to localStorage with status "pending_payment"
  - Navigate to dashboard cart tab with openPayment=true parameter
  - Ensure trip appears in My Trips section
  - _Requirements: 7.1, 7.3_

- [x] 8. Rename "Your Saved Journeys" to "Your Trip" in Dashboard

  - Find all instances of "Your Saved Journeys" text in traveler dashboard
  - Replace with "Your Trip" text
  - Update section heading and labels
  - _Requirements: 5.1, 5.2_

- [ ] 9. Create Favorites Section in Dashboard
  - Add "Favorites" tab to traveler dashboard tabs array

  - Create FavoritesSection component in src/pages/traveler-dashboard/components/
  - Load favorite providers from localStorage
  - Display provider cards with name, location, verification badge, follower count
  - Add "View Profile" button to navigate to provider profile
  - Add "Remove from Favorites" button
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 10. Update My Trips to Show Trip Details


  - Display all services in each trip
  - Show trip dates, traveler count, and total cost
  - Add "View Details" button to open TripDetailsModal
  - Display "Continue to Payment" button for trips with status "saved"
  - Implement Continue to Payment functionality to add services to cart
  - _Requirements: 8.1, 8.2, 8.3, 8.4_


- [ ] 11. Implement Per-Service Payment Display in Cart
  - Modify cart display to show each service separately
  - Display provider's accepted payment methods for each service
  - Show total cost but indicate services are paid individually
  - Add contact information for services without payment methods


  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 12. Add Follow Button to Provider Profile
  - Add "Follow" button to provider profile page
  - Implement handleFollow function to toggle follow/unfollow


  - Save followed providers to localStorage under 'followed_providers' key
  - Add API call to update follower count in database
  - Update button text based on follow status (Follow/Unfollow)
  - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [ ] 13. Display Follower Count on Provider Profile
  - Add follower count display to provider profile
  - Fetch follower count from database on page load
  - Update follower count in real-time when follow/unfollow is clicked
  - Display count in format "X followers"
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 14. Add View Details to Provider Profile Services


  - Add "View Details" button to each service in provider profile
  - Open ServiceDetailsModal when clicked
  - Pass service data to modal
  - Implement Add to Plan functionality from provider profile

  - _Requirements: 4.1, 4.2, 4.3_



- [ ] 15. Implement Followed Providers Priority in Destination Discovery
  - Load followed providers from localStorage
  - Implement sortServicesByFollowedProviders function
  - Sort services array to show followed providers' services first
  - Maintain existing category and search filtering
  - Add visual indicator for services from followed providers
  - _Requirements: 10.4_

- [ ] 16. Add Backend API Endpoints for Favorites
  - Create POST /api/users/favorites endpoint to add favorite


  - Create DELETE /api/users/favorites/:providerId endpoint to remove favorite
  - Create GET /api/users/favorites endpoint to fetch all favorites
  - Update user model to include favorites relationship
  - _Requirements: 3.2, 3.3, 13.2_

- [ ] 17. Add Backend API Endpoints for Follow Functionality
  - Create POST /api/providers/:id/follow endpoint to follow provider
  - Create POST /api/providers/:id/unfollow endpoint to unfollow provider
  - Create GET /api/providers/:id/followers/count endpoint to get follower count
  - Update provider model to include followers_count field
  - Create followers junction table if not exists
  - _Requirements: 10.2, 10.3, 11.1, 11.2, 11.3_

- [ ] 18. Test Complete Workflow End-to-End
  - Test journey planning from location selection to service selection
  - Test Add to Favorite functionality
  - Test View Details modal with Add to Plan
  - Test Save Plan functionality (no cart addition)
  - Test Continue to Cart & Payments functionality
  - Test My Trips display and Continue to Payment
  - Test Favorites tab display
  - Test Follow/Unfollow functionality
  - Test follower count updates
  - Test followed providers appearing first in discovery
  - Verify no "+select" buttons remain
  - Verify no "Continue to Cart" in service modals
  - _Requirements: All_

- [ ] 19. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
