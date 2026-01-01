# Design Document: Dashboard Context Hook Fix

## Overview

This design fixes the React error #321 in production by ensuring all React hooks are called at the top level of the Traveler Dashboard component, following React's Rules of Hooks. The error occurs because `useCart()` is being called inside `useEffect` callbacks, which is not allowed.

## Architecture

### Current Problem

```javascript
// ❌ WRONG - Calling hook inside useEffect
useEffect(() => {
  const { loadCartFromDatabase } = useCart(); // Violates Rules of Hooks
  loadCartFromDatabase();
}, [user?.id]);
```

### Solution

```javascript
// ✅ CORRECT - Call hook at top level
const { loadCartFromDatabase } = useCart(); // Top level

useEffect(() => {
  loadCartFromDatabase(); // Use method from top-level hook
}, [user?.id, loadCartFromDatabase]);
```

## Components and Interfaces

### TravelerDashboard Component

**Current Issues:**
- Lines 268-273: Calls `useCart()` inside useEffect
- Lines 282-286: Calls `useCart()` inside useEffect (duplicate)
- Lines 326-332: Calls `useCart()` inside useEffect (duplicate)

**Fix Strategy:**
1. Call `useCart()` once at the top level (already done on line 61)
2. Use the destructured methods from the top-level call in all useEffect hooks
3. Remove all duplicate `useCart()` calls from inside useEffect callbacks

### Hook Dependencies

The component already has top-level hook calls:
```javascript
const { cartItems: contextCartItems, removeFromCart, getCartTotal, clearCart, addToCart } = useCart();
```

We need to also destructure `loadCartFromDatabase`:
```javascript
const { 
  cartItems: contextCartItems, 
  removeFromCart, 
  getCartTotal, 
  clearCart, 
  addToCart,
  loadCartFromDatabase  // Add this
} = useCart();
```

## Data Models

No data model changes required. This is purely a code structure fix.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do.*

### Property 1: Hook Call Location
*For any* React component using context hooks, all hook calls must occur at the top level of the component function, not inside callbacks or conditionals.
**Validates: Requirements 1.1, 1.3**

### Property 2: Context Access Success
*For any* component wrapped in context providers, accessing context values through hooks at the top level should succeed without throwing errors.
**Validates: Requirements 1.4**

### Property 3: Data Loading Preservation
*For any* dashboard load or tab change, the cart/favorites/trips data loading functionality should work identically before and after the fix.
**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

## Error Handling

- If hooks are called incorrectly, React will throw error #321
- The ErrorBoundary component will catch and display the error
- After fix, no error should occur

## Testing Strategy

### Manual Testing
1. Deploy to production
2. Clear browser cache
3. Navigate to traveler dashboard
4. Verify no React error #321
5. Verify all tabs load correctly
6. Verify cart loads data
7. Verify favorites load data
8. Verify trips load data

### Verification Steps
1. Check browser console for errors
2. Verify dashboard renders successfully
3. Verify cart tab shows items
4. Verify favorites tab shows items
5. Verify trips tab shows plans

## Implementation Notes

### Files to Modify
- `src/pages/traveler-dashboard/index.jsx` - Fix hook calls

### Specific Changes
1. Line 61: Add `loadCartFromDatabase` to destructured values
2. Lines 268-273: Remove `const { loadCartFromDatabase } = useCart();`
3. Lines 282-286: Remove `const { loadCartFromDatabase } = useCart();`
4. Lines 326-332: Remove `const { loadCartFromDatabase } = useCart();`
5. Update useEffect dependencies to include `loadCartFromDatabase`

## Deployment Process

1. Fix the code locally
2. Test locally to ensure no errors
3. Build for production: `npm run build`
4. Deploy to Netlify
5. Clear cache on deployment
6. Verify in production
