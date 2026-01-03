# Implementation Plan - Cache Busting & Deployment Fix

## Overview

This implementation plan provides step-by-step tasks to implement comprehensive cache busting and deployment verification for the iSafari Global platform. Each task builds incrementally on previous tasks to ensure a working solution at every checkpoint.

---

## Tasks

- [ ] 1. Configure Vite for Content-Based Hashing
  - Update vite.config.mjs to generate content-based hashes for all assets
  - Configure output filenames with hash patterns for JS, CSS, and images
  - Test that build generates unique hashes for different file contents
  - _Requirements: 1.3, 2.1, 2.2_

- [ ]* 1.1 Write property test for asset hash uniqueness
  - **Property 1: Asset Hash Uniqueness**
  - **Validates: Requirements 1.3, 2.1**

- [ ] 2. Create Version Manifest Generator
  - Create Vite plugin to generate version.json after build
  - Include version, buildTime, buildHash, and environment in manifest
  - Extract Git commit hash or generate unique build ID
  - Write manifest to dist/version.json
  - _Requirements: 2.4, 3.3, 7.2_

- [ ] 3. Add Cache-Busting Meta Tags
  - Add build timestamp meta tag to index.html template
  - Add version meta tag with build hash
  - Ensure meta tags are updated on every build
  - _Requirements: 2.4_

- [ ] 4. Configure Cache Control Headers for Netlify
  - Create/update netlify.toml with cache header configuration
  - Set no-cache for HTML files
  - Set long-term cache with immutable for hashed assets
  - Set no-cache for service worker if present
  - Test headers using curl or browser DevTools
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 5. Configure Cache Control Headers for Backend
  - Update backend server.js to set cache headers for API responses
  - Set no-cache for all /api/* endpoints
  - Add version header to API responses
  - Test headers using curl or Postman
  - _Requirements: 4.3, 4.5_

- [ ] 6. Create Version Checker Component
  - Create VersionChecker.jsx component
  - Implement periodic version checking (every 5 minutes)
  - Compare local version with server version from /version.json
  - Show notification when new version is detected
  - Provide "Reload" button to load new version
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 6.1 Write property test for version detection
  - **Property 2: Version Detection Accuracy**
  - **Validates: Requirements 3.1, 3.2**

- [ ] 7. Integrate Version Checker into App
  - Import VersionChecker in App.jsx
  - Initialize version checker on app mount
  - Store current version in window.__APP_VERSION__
  - Test version checking in development
  - _Requirements: 3.3, 3.5_

- [ ] 8. Create Deployment Verification Script
  - Create verify-deployment.js script
  - Implement checkFrontendVersion function
  - Implement checkBackendAPI function
  - Implement checkServiceFiltering function
  - Implement checkAssetLoading function
  - Implement checkCacheHeaders function
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 8.1 Write property test for deployment verification
  - **Property 5: Deployment Verification Completeness**
  - **Validates: Requirements 7.2, 7.3, 7.4, 7.5**

- [ ] 9. Fix Service Filtering Logic (Backend)
  - Review backend/routes/services.js filtering implementation
  - Ensure STRICT filtering by location (no fallback to all services)
  - Ensure STRICT filtering by category (exact match)
  - Apply AND logic when multiple filters are provided
  - Add detailed logging for filter operations
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ]* 9.1 Write property test for filter correctness
  - **Property 4: Filter Result Correctness**
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ] 10. Fix Service Filtering Logic (Frontend)
  - Review src/pages/journey-planner/index.jsx filtering
  - Ensure frontend passes all location parameters to API
  - Remove any client-side filtering that contradicts backend
  - Add loading states during service fetch
  - Show appropriate empty states when no services found
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 11. Add Version Display to UI
  - Add version number to footer or settings page
  - Display current build time
  - Show "Update Available" badge when new version detected
  - _Requirements: 3.5_

- [ ] 12. Update Build Scripts
  - Update package.json build script to include version generation
  - Add pre-build script to extract Git commit hash
  - Add post-build script to verify version.json exists
  - Test build process end-to-end
  - _Requirements: 2.4, 5.3_

- [ ] 13. Create Deployment Documentation
  - Document the new deployment process
  - Include steps for building with versioning
  - Include steps for running verification script
  - Include troubleshooting guide for common issues
  - _Requirements: 5.4_

- [ ] 14. Checkpoint - Test Complete Cache Busting Flow
  - Build application with new configuration
  - Deploy to staging environment
  - Verify version.json is accessible
  - Verify cache headers are correct
  - Make a code change and rebuild
  - Verify new version is detected
  - Verify page reloads with new version
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Test Service Filtering End-to-End
  - Test filtering by location only
  - Test filtering by category only
  - Test filtering by both location and category
  - Test empty state when no services match
  - Verify backend logs show correct filter parameters
  - Verify frontend displays correct results
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 16. Deploy to Production
  - Run full build with production environment
  - Deploy frontend to Netlify
  - Deploy backend to Render
  - Run deployment verification script
  - Monitor for any errors
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 17. Final Checkpoint - Verify Production Deployment
  - Access production site and verify version
  - Test cache behavior with browser DevTools
  - Test service filtering with real data
  - Verify version checker works in production
  - Make a small change, deploy, and verify update detection works
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional testing tasks that can be skipped for faster MVP
- Each checkpoint task should be completed before moving to the next section
- If any task fails, debug and fix before proceeding
- Keep detailed logs of any issues encountered during implementation
