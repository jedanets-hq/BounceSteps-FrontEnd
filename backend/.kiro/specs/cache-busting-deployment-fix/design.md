# Cache Busting & Deployment Fix - Design Document

## Overview

This design implements a comprehensive cache busting and deployment verification system for the iSafari Global platform. The solution addresses persistent caching issues where deployed changes remain invisible to users due to aggressive browser and CDN caching. The design includes automatic asset versioning, version detection, cache header configuration, and deployment verification tools.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Build Process (Vite)                     │
│  ┌────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │   Source   │───▶│ Hash Assets  │───▶│  Generate      │  │
│  │   Files    │    │ (Content-    │    │  Manifest      │  │
│  └────────────┘    │  Based)      │    └────────────────┘  │
│                    └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Pipeline                       │
│  ┌────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │  Deploy to │───▶│ Set Cache    │───▶│  Purge CDN     │  │
│  │  Netlify/  │    │  Headers     │    │  Cache         │  │
│  │  Render    │    └──────────────┘    └────────────────┘  │
│  └────────────┘                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Runtime (Browser)                         │
│  ┌────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │  Version   │───▶│ Compare with │───▶│  Auto-reload   │  │
│  │  Check     │    │  Server      │    │  if Mismatch   │  │
│  └────────────┘    └──────────────┘    └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction

1. **Build System**: Vite generates content-hashed filenames for all assets
2. **Version Manifest**: JSON file containing build timestamp and file hashes
3. **Cache Headers**: Netlify/Render configuration for optimal caching
4. **Version Checker**: Client-side component that detects version mismatches
5. **Deployment Verifier**: Script to confirm successful deployment

## Components and Interfaces

### 1. Build Configuration (vite.config.mjs)

**Purpose**: Configure Vite to generate hashed filenames and proper cache headers

**Configuration**:
```javascript
{
  build: {
    rollupOptions: {
      output: {
        // Generate content-based hashes for all chunks
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
}
```

**Responsibilities**:
- Generate unique hashes for all JavaScript files
- Generate unique hashes for all CSS files
- Generate unique hashes for image assets
- Create source maps for debugging
- Optimize bundle size

### 2. Version Manifest Generator

**Purpose**: Create a manifest file with build metadata

**Interface**:
```javascript
{
  version: string,           // Semantic version (e.g., "1.0.0")
  buildTime: string,         // ISO timestamp
  buildHash: string,         // Git commit hash or build ID
  assets: {
    [filename]: string       // Asset path with hash
  }
}
```

**Implementation**: Vite plugin that runs after build

### 3. Cache Control Headers

**Purpose**: Configure appropriate caching for different resource types

**Netlify Configuration** (_headers file):
```
# HTML - No cache, always revalidate
/*.html
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

# Hashed assets - Long-term cache
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Service worker - No cache
/sw.js
  Cache-Control: no-cache, no-store, must-revalidate

# API calls - Short cache with revalidation
/api/*
  Cache-Control: no-cache, must-revalidate
```

**Render Configuration** (server.js):
```javascript
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-cache, must-revalidate');
  }
  next();
});
```

### 4. Version Checker Component

**Purpose**: Detect when a new version is deployed and prompt user to reload

**Interface**:
```javascript
class VersionChecker {
  constructor(checkInterval = 300000); // 5 minutes
  
  async checkVersion(): Promise<boolean>;
  getCurrentVersion(): string;
  getServerVersion(): Promise<string>;
  handleVersionMismatch(): void;
}
```

**Behavior**:
- Periodically checks server for new version
- Compares local version with server version
- Shows notification when new version is available
- Automatically reloads page after user confirmation

### 5. Deployment Verification Script

**Purpose**: Verify that deployment was successful and changes are live

**Interface**:
```bash
node verify-deployment.js [--frontend-url] [--backend-url]
```

**Checks**:
1. Frontend version matches expected build
2. Backend API is responding
3. Service filtering works correctly
4. Assets are loading with correct hashes
5. Cache headers are set properly

## Data Models

### Version Manifest

```typescript
interface VersionManifest {
  version: string;          // "1.0.0"
  buildTime: string;        // "2025-12-22T10:30:00Z"
  buildHash: string;        // Git commit or unique ID
  environment: string;      // "production" | "staging"
  assets: {
    [key: string]: string;  // filename -> hashed path
  };
}
```

### Cache Configuration

```typescript
interface CacheConfig {
  resourceType: 'html' | 'js' | 'css' | 'image' | 'api';
  cacheControl: string;     // Cache-Control header value
  maxAge: number;           // Seconds
  immutable: boolean;       // Whether resource never changes
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Asset Hash Uniqueness
*For any* two different file contents, the generated hash SHALL be different, ensuring browsers recognize them as distinct resources.
**Validates: Requirements 1.3, 2.1**

### Property 2: Version Detection Accuracy
*For any* deployed version, when the client checks the server version, it SHALL correctly identify whether a new version is available.
**Validates: Requirements 3.1, 3.2**

### Property 3: Cache Header Consistency
*For any* resource type (HTML, JS, CSS, images, API), the cache headers SHALL match the configured policy for that resource type.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 4: Filter Result Correctness
*For any* combination of location and category filters, the returned services SHALL match ALL specified filter criteria (AND logic).
**Validates: Requirements 6.1, 6.2, 6.3**

### Property 5: Deployment Verification Completeness
*For any* deployment, the verification script SHALL check all critical components (frontend version, backend API, filtering, assets, cache headers) and report success only if ALL checks pass.
**Validates: Requirements 7.2, 7.3, 7.4, 7.5**

## Error Handling

### Build Errors

**Scenario**: Vite build fails
**Handling**: 
- Log detailed error message
- Prevent deployment of broken build
- Notify developer via console output

### Version Check Errors

**Scenario**: Cannot reach server to check version
**Handling**:
- Retry with exponential backoff
- After 3 failures, stop checking temporarily
- Log error for debugging
- Do not show error to user (fail silently)

### Cache Purge Errors

**Scenario**: CDN cache purge fails
**Handling**:
- Log error with details
- Continue deployment (cache will expire naturally)
- Notify developer via deployment logs

### Filter Errors

**Scenario**: Service filtering returns unexpected results
**Handling**:
- Log filter parameters and results
- Return empty array with clear message
- Suggest alternative filters to user

## Testing Strategy

### Unit Tests

1. **Version Comparison Logic**
   - Test version string parsing
   - Test version comparison (newer/older/same)
   - Test invalid version formats

2. **Hash Generation**
   - Test that same content produces same hash
   - Test that different content produces different hash
   - Test hash format is valid

3. **Cache Header Generation**
   - Test correct headers for each resource type
   - Test header format is valid
   - Test max-age calculations

### Property-Based Tests

1. **Property 1: Asset Hash Uniqueness**
   - Generate random file contents
   - Build assets with those contents
   - Verify all hashes are unique
   - Verify same content produces same hash

2. **Property 2: Version Detection**
   - Generate random version numbers
   - Simulate server returning different versions
   - Verify client correctly detects mismatches
   - Verify client correctly identifies same versions

3. **Property 3: Cache Headers**
   - Generate random resource types
   - Apply cache configuration
   - Verify headers match expected policy
   - Verify no resource has incorrect headers

4. **Property 4: Filter Correctness**
   - Generate random services with locations and categories
   - Apply random filter combinations
   - Verify all returned services match ALL filters
   - Verify no services are returned that don't match

5. **Property 5: Deployment Verification**
   - Simulate various deployment states (success, partial failure, complete failure)
   - Run verification script
   - Verify script correctly identifies state
   - Verify script reports all failures

### Integration Tests

1. **End-to-End Deployment**
   - Build application
   - Deploy to staging
   - Run verification script
   - Verify new version is accessible

2. **Cache Behavior**
   - Deploy version A
   - Verify assets are cached
   - Deploy version B
   - Verify new assets are loaded (not cached version A)

3. **Version Update Flow**
   - User loads version A
   - Deploy version B
   - Verify user is notified of new version
   - Verify reload loads version B

## Implementation Notes

### Vite Plugin for Version Manifest

Create a custom Vite plugin that generates version.json after build:

```javascript
function versionManifestPlugin() {
  return {
    name: 'version-manifest',
    closeBundle() {
      const manifest = {
        version: process.env.npm_package_version,
        buildTime: new Date().toISOString(),
        buildHash: process.env.GIT_COMMIT || Date.now().toString(),
        environment: process.env.NODE_ENV
      };
      fs.writeFileSync('dist/version.json', JSON.stringify(manifest, null, 2));
    }
  };
}
```

### Version Checker Implementation

Implement as a React component that runs on app mount:

```javascript
useEffect(() => {
  const checkVersion = async () => {
    try {
      const response = await fetch('/version.json?t=' + Date.now());
      const serverVersion = await response.json();
      const localVersion = window.__APP_VERSION__;
      
      if (serverVersion.buildHash !== localVersion.buildHash) {
        // Show notification to user
        showUpdateNotification();
      }
    } catch (error) {
      console.error('Version check failed:', error);
    }
  };
  
  // Check immediately
  checkVersion();
  
  // Check every 5 minutes
  const interval = setInterval(checkVersion, 300000);
  return () => clearInterval(interval);
}, []);
```

### Netlify Configuration

Create `netlify.toml` with proper cache headers:

```toml
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
    
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Deployment Verification Script

Create `verify-deployment.js`:

```javascript
async function verifyDeployment() {
  const checks = [
    checkFrontendVersion,
    checkBackendAPI,
    checkServiceFiltering,
    checkAssetLoading,
    checkCacheHeaders
  ];
  
  for (const check of checks) {
    const result = await check();
    if (!result.success) {
      console.error(`❌ ${check.name} failed:`, result.error);
      process.exit(1);
    }
    console.log(`✅ ${check.name} passed`);
  }
  
  console.log('🎉 All deployment checks passed!');
}
```

## Deployment Process

### Step 1: Build with Versioning

```bash
# Generate version info
export GIT_COMMIT=$(git rev-parse --short HEAD)
export BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build frontend
npm run build

# Verify version.json was created
cat dist/version.json
```

### Step 2: Deploy to Netlify

```bash
# Deploy to Netlify
netlify deploy --prod --dir=dist

# Purge CDN cache (automatic with Netlify)
```

### Step 3: Deploy Backend to Render

```bash
# Render auto-deploys on git push
git push origin main

# Wait for deployment to complete
# Check Render dashboard
```

### Step 4: Verify Deployment

```bash
# Run verification script
node verify-deployment.js \
  --frontend-url=https://isafari-tz.netlify.app \
  --backend-url=https://isafarinetworkglobal-2.onrender.com

# Check output for any failures
```

### Step 5: Monitor

```bash
# Check browser console for version
# Verify filtering works correctly
# Test on multiple browsers
# Test with hard refresh
```

## Performance Considerations

### Build Time

- Content-based hashing adds minimal overhead (~1-2 seconds)
- Manifest generation is fast (<100ms)
- Overall build time impact: <5%

### Runtime Performance

- Version check is async and non-blocking
- Check interval of 5 minutes prevents excessive requests
- Version check payload is tiny (<1KB)
- No impact on initial page load

### Cache Efficiency

- Hashed assets can be cached indefinitely
- Only HTML needs to be revalidated
- Reduces bandwidth for repeat visitors
- Improves load times after first visit

## Security Considerations

### Version Information Exposure

- Version manifest is public (necessary for version checking)
- Does not expose sensitive information
- Only contains build metadata

### Cache Poisoning

- Content-based hashing prevents cache poisoning
- Immutable assets cannot be modified
- CDN serves correct version based on hash

## Monitoring and Debugging

### Logging

- Log all version checks (client-side)
- Log deployment verification results
- Log cache header responses
- Log filter parameters and results

### Metrics

- Track version check frequency
- Track version mismatch rate
- Track deployment verification success rate
- Track cache hit/miss rates

### Debugging Tools

- Browser DevTools Network tab (check cache headers)
- Console logs for version information
- Deployment verification script output
- Backend logs for filter debugging
