# Provider Profile - SELECT SERVICE Button Implementation ✅

## Task Completed
Added "SELECT SERVICE" button to the Provider Profile page service cards section.

## Changes Made

### File: `src/pages/provider-profile/index.jsx`

#### 1. Added State Management
- Added `selectedServices` state to track which services are selected
- State initialized as empty array: `const [selectedServices, setSelectedServices] = useState([])`

#### 2. Added Toggle Handler
- Created `handleServiceToggle(serviceId)` function to toggle service selection
- Function adds/removes service ID from selectedServices array

#### 3. Updated Service Card Buttons
- **SELECT SERVICE Button** (NEW - FIRST BUTTON)
  - Placed ABOVE "View Details" button
  - Shows "Select Service" with Plus icon when not selected
  - Shows "Selected ✓" with CheckCircle icon when selected
  - Uses outline variant when unselected, default variant when selected
  - Calls `handleServiceToggle()` on click

- **View Details Button** (EXISTING - SECOND BUTTON)
  - Unchanged functionality
  - Opens service details modal

- **Add to Plan Button** (EXISTING - THIRD BUTTON)
  - Unchanged functionality
  - Adds service to journey plan

## Button Behavior

### SELECT SERVICE Button States:
- **Unselected**: 
  - Text: "Select Service"
  - Icon: Plus
  - Variant: outline
  
- **Selected**:
  - Text: "Selected ✓"
  - Icon: CheckCircle
  - Variant: default (filled)

## User Flow
1. Traveler navigates to provider profile
2. Views available services in grid layout
3. Can click "SELECT SERVICE" button to select/deselect services
4. Selected services are tracked in component state
5. Button visual state updates immediately to show selection status

## Consistency
- Implementation matches the SELECT SERVICE button already added to Journey Planner Step 4
- Same styling, icons, and behavior patterns
- Seamless integration with existing provider profile functionality

## Testing Notes
- No breaking changes to existing functionality
- "View Details" and "Add to Plan" buttons work as before
- Service selection state is component-level (not persisted to localStorage)
- Multiple services can be selected simultaneously
