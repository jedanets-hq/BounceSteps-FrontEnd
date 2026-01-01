# Design Document: React Context and Database Fix

## Overview

This design addresses the React Error #321 (context used outside provider) and ensures reliable database connectivity. The solution involves fixing context provider hierarchy, adding proper error boundaries, implementing retry logic for API calls, and ensuring contexts initialize in the correct order with proper dependencies.

## Architecture

### Context Provider Hierarchy

```
<ErrorBoundary>
  <Router>
    <ThemeProvider>          // Independent - no dependencies
      <AuthProvider>         // Depends on Router for navigation
        <CartProvider>       // Depends on AuthProvider for user token
          <FavoritesProvider>  // Depends on AuthProvider for user token
            <TripsProvider>    // Depends on AuthProvider for user token
              <VersionChecker />
              <App Routes />
            </TripsProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </Router>
</ErrorBoundary>
```

### Key Design Principles

1. **Fail-Safe Initialization**: All contexts must have default values and handle missing dependencies gracefully
2. **Lazy Loading**: Contexts should not make API calls until user is authenticated
3. **Error Isolation**: Errors in one context should not crash other contexts
4. **Retry Logic**: Failed API calls should retry with exponential backoff
5. **Clear Error Messages**: All errors should provide actionable feedback to users

## Components and Interfaces

### 1. Enhanced ErrorBoundary Component

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Catches all React errors including context errors
  // Provides user-friendly error messages
  // Offers reload/retry functionality
  // Logs detailed error information
}
```

### 2. Context Initialization Guard

```typescript
interface ContextGuardProps {
  contextName: string;
  isReady: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Prevents rendering children until context is ready
const ContextGuard: React.FC<ContextGuardProps> = ({ contextName, isReady, children, fallback }) => {
  if (!isReady) {
    return fallback || <LoadingSpinner message={`Initializing ${contextName}...`} />;
  }
  return <>{children}</>;
};
```

### 3. API Retry Wrapper

```typescript
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

async function apiCallWithRetry<T>(
  apiCall: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  // Implements exponential backoff retry logic
  // Handles network errors gracefully
  // Provides detailed error logging
}
```

### 4. Context Hook Validators

```typescript
function createSafeContextHook<T>(
  context: React.Context<T>,
  contextName: string
): () => T {
  return () => {
    const value = useContext(context);
    if (value === undefined || value === null) {
      throw new Error(
        `use${contextName} must be used within a ${contextName}Provider. ` +
        `Please ensure the component is wrapped in <${contextName}Provider>.`
      );
    }
    return value;
  };
}
```

## Data Models

### Context State Models

```typescript
// Auth Context State
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isInitialized: boolean;  // NEW: Tracks if context is ready
}

// Cart Context State
interface CartState {
  cartItems: CartItem[];
  loading: boolean;
  isCartOpen: boolean;
  error: string | null;
  isInitialized: boolean;  // NEW: Tracks if context is ready
  lastSyncTime: Date | null;  // NEW: Tracks last database sync
}

// Favorites Context State
interface FavoritesState {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;  // NEW: Tracks if context is ready
  lastSyncTime: Date | null;  // NEW: Tracks last database sync
}

// Trips Context State
interface TripsState {
  tripPlans: TripPlan[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;  // NEW: Tracks if context is ready
  lastSyncTime: Date | null;  // NEW: Tracks last database sync
}
```

### Error Models

```typescript
interface ContextError {
  type: 'INITIALIZATION' | 'API_CALL' | 'VALIDATION' | 'NETWORK';
  message: string;
  contextName: string;
  timestamp: Date;
  stack?: string;
  retryable: boolean;
}

interface APIError {
  status: number;
  message: string;
  endpoint: string;
  timestamp: Date;
  retryCount: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Context Provider Hierarchy Integrity
*For any* component that uses a context hook, the corresponding context provider must be present in the component tree above it.
**Validates: Requirements 1.1, 1.2, 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 2: Context Initialization Order
*For any* context that depends on another context, the dependent context must initialize after its dependency is ready.
**Validates: Requirements 3.1, 3.4, 3.5**

### Property 3: Default Values Before Render
*For any* context provider, default values must be set before rendering child components.
**Validates: Requirements 3.2**

### Property 4: No Database Calls Without Authentication
*For any* API call that requires authentication, the system must verify user token exists before making the call.
**Validates: Requirements 2.4**

### Property 5: API Retry Logic
*For any* failed API call due to network errors, the system must retry up to the configured maximum retry count with exponential backoff.
**Validates: Requirements 2.2**

### Property 6: Error Message Display
*For any* API failure or context error, the system must display a user-friendly error message to the user.
**Validates: Requirements 2.3, 4.1**

### Property 7: Error Boundary Catches All Errors
*For any* React error that occurs within the error boundary, the error must be caught and the application must not crash.
**Validates: Requirements 6.1, 4.2**

### Property 8: Error Logging
*For any* error that occurs in a context, detailed error information must be logged to the console in development mode.
**Validates: Requirements 6.2, 8.1, 8.2, 8.3, 8.4, 8.5**

### Property 9: Empty States on Load Failure
*For any* data loading operation that fails, the system must display an empty state instead of crashing.
**Validates: Requirements 4.5**

### Property 10: User-Friendly Error Messages
*For any* error displayed to the user, the message must be clear, actionable, and free of technical jargon.
**Validates: Requirements 6.3**

## Error Handling

### Context Initialization Errors

1. **Missing Provider Error**
   - Detection: useContext returns undefined/null
   - Handling: Throw descriptive error with provider name
   - User Impact: Show error boundary with "Please refresh the page"

2. **Dependency Not Ready Error**
   - Detection: Dependent context initializes before dependency
   - Handling: Wait for dependency with timeout
   - User Impact: Show loading state until ready

3. **API Call During Initialization Error**
   - Detection: API call made before context is initialized
   - Handling: Queue the call until initialization complete
   - User Impact: Transparent - user sees loading state

### API Communication Errors

1. **Network Timeout**
   - Detection: API call exceeds timeout (5 seconds)
   - Handling: Retry with exponential backoff (3 attempts)
   - User Impact: Show "Connecting..." then error if all retries fail

2. **Authentication Failure**
   - Detection: 401 response from API
   - Handling: Clear user session and redirect to login
   - User Impact: Redirect to login with "Session expired" message

3. **Server Error (500)**
   - Detection: 500 response from API
   - Handling: Retry once, then show error
   - User Impact: "Server error. Please try again later."

4. **Not Found (404)**
   - Detection: 404 response from API
   - Handling: No retry, show empty state
   - User Impact: "No data found" or similar empty state

### Database Connection Errors

1. **Connection Refused**
   - Detection: ECONNREFUSED error
   - Handling: Retry 3 times with 1s, 2s, 4s delays
   - User Impact: Show "Connecting to server..." message

2. **Timeout**
   - Detection: Request timeout
   - Handling: Retry with longer timeout
   - User Impact: Show "Slow connection detected" warning

3. **Database Unavailable**
   - Detection: Database connection pool exhausted
   - Handling: Queue requests and retry
   - User Impact: Show "High traffic. Please wait..." message

## Testing Strategy

### Unit Tests

1. **Context Hook Validation Tests**
   - Test each context hook throws error when used outside provider
   - Test context hooks return correct values when used inside provider
   - Test context initialization with and without dependencies

2. **Error Boundary Tests**
   - Test error boundary catches React errors
   - Test error boundary displays fallback UI
   - Test error boundary logs error details
   - Test error boundary reset functionality

3. **API Retry Logic Tests**
   - Test retry logic with different failure scenarios
   - Test exponential backoff timing
   - Test max retry limit enforcement
   - Test successful retry after failures

4. **Context Initialization Tests**
   - Test contexts initialize in correct order
   - Test contexts set default values before render
   - Test contexts handle missing dependencies
   - Test contexts wait for authentication

### Property-Based Tests

Each property test should run a minimum of 100 iterations to ensure comprehensive coverage.

1. **Property Test: Context Provider Hierarchy**
   - Generate random component trees with context usage
   - Verify all context hooks have corresponding providers
   - **Feature: react-context-database-fix, Property 1: Context Provider Hierarchy Integrity**

2. **Property Test: Initialization Order**
   - Generate random context dependency graphs
   - Verify initialization order respects dependencies
   - **Feature: react-context-database-fix, Property 2: Context Initialization Order**

3. **Property Test: No Unauthenticated API Calls**
   - Generate random API call scenarios
   - Verify no database calls without auth token
   - **Feature: react-context-database-fix, Property 4: No Database Calls Without Authentication**

4. **Property Test: API Retry Logic**
   - Generate random API failure scenarios
   - Verify retry attempts match configuration
   - Verify exponential backoff timing
   - **Feature: react-context-database-fix, Property 5: API Retry Logic**

5. **Property Test: Error Message Display**
   - Generate random error scenarios
   - Verify all errors display user-friendly messages
   - **Feature: react-context-database-fix, Property 6: Error Message Display**

6. **Property Test: Error Boundary Catches All Errors**
   - Generate random React errors
   - Verify error boundary catches all errors
   - Verify application doesn't crash
   - **Feature: react-context-database-fix, Property 7: Error Boundary Catches All Errors**

7. **Property Test: Error Logging**
   - Generate random errors in contexts
   - Verify all errors are logged with details
   - **Feature: react-context-database-fix, Property 8: Error Logging**

8. **Property Test: Empty States on Failure**
   - Generate random data loading failures
   - Verify empty states are displayed
   - **Feature: react-context-database-fix, Property 9: Empty States on Load Failure**

### Integration Tests

1. **Full Context Stack Test**
   - Mount complete provider hierarchy
   - Verify all contexts initialize correctly
   - Verify data flows between contexts
   - Verify error handling across contexts

2. **API Communication Test**
   - Test full request/response cycle
   - Test authentication flow
   - Test error handling
   - Test retry logic

3. **Database Connectivity Test**
   - Test connection establishment
   - Test query execution
   - Test connection recovery
   - Test connection pooling

### Manual Testing Checklist

1. **Context Error Scenarios**
   - [ ] Remove a provider and verify error message
   - [ ] Use context hook outside provider and verify error
   - [ ] Verify error boundary catches context errors
   - [ ] Verify reload button works after error

2. **API Failure Scenarios**
   - [ ] Disconnect network and verify retry logic
   - [ ] Stop backend and verify error messages
   - [ ] Test with slow network and verify timeouts
   - [ ] Test authentication expiry and verify redirect

3. **Database Connection Scenarios**
   - [ ] Test with database offline
   - [ ] Test with high latency connection
   - [ ] Test with connection pool exhausted
   - [ ] Test connection recovery after failure

## Implementation Notes

### Critical Fixes Required

1. **Fix Context Provider Order in App.jsx**
   - Ensure AuthProvider wraps all dependent contexts
   - Add initialization guards for dependent contexts
   - Add error boundaries around context providers

2. **Add isInitialized Flag to All Contexts**
   - Track when context is ready to use
   - Prevent API calls before initialization
   - Provide loading states during initialization

3. **Implement API Retry Wrapper**
   - Create reusable retry logic
   - Configure retry parameters per endpoint
   - Add exponential backoff
   - Log retry attempts

4. **Enhance Error Boundary**
   - Catch and display context errors specifically
   - Provide context-specific error messages
   - Add reload/retry functionality
   - Log errors to monitoring service

5. **Add Context Dependency Management**
   - CartContext waits for AuthContext
   - FavoritesContext waits for AuthContext
   - TripsContext waits for AuthContext
   - All contexts check auth before API calls

### Performance Considerations

1. **Minimize Re-renders**
   - Use React.memo for context consumers
   - Split contexts by update frequency
   - Use context selectors where possible

2. **Lazy Load Data**
   - Don't load cart/favorites/trips until needed
   - Load data on tab activation, not on mount
   - Cache loaded data to avoid refetching

3. **Debounce Updates**
   - Batch multiple context updates
   - Debounce rapid state changes
   - Use useTransition for non-urgent updates

### Security Considerations

1. **Token Validation**
   - Verify token exists before API calls
   - Check token expiry before requests
   - Refresh tokens proactively
   - Clear tokens on logout

2. **Error Message Sanitization**
   - Don't expose sensitive data in errors
   - Sanitize error messages for users
   - Log full errors server-side only
   - Avoid leaking system information

## Deployment Considerations

1. **Environment Variables**
   - Ensure API_URL is correctly set
   - Configure retry parameters per environment
   - Set appropriate timeouts for production

2. **Monitoring**
   - Log context initialization times
   - Track API failure rates
   - Monitor retry attempts
   - Alert on high error rates

3. **Rollback Plan**
   - Keep old context implementations as backup
   - Feature flag new error handling
   - Monitor error rates after deployment
   - Quick rollback if errors increase
