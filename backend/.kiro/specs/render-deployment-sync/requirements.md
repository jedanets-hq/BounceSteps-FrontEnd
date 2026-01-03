# Requirements Document

## Introduction

Mtumiaji ana tatizo kubwa: mabadiliko yaliyofanywa kwenye Journey Planner (location-based service filtering) hayaonekani kwenye Render deployment. Code iko local lakini haionekani kwenye production. Tunahitaji kuhakikisha deployment process inafanya kazi vizuri na mabadiliko yanaenda production.

## Glossary

- **Frontend**: React application inayotumia Vite, deployed kwenye Netlify
- **Backend**: Node.js/Express API, deployed kwenye Render
- **Build Process**: Process ya ku-compile React code kuwa static files
- **Cache**: Temporary storage ya old files inayoweza kusababisha old code kuonekana
- **Deployment**: Process ya kupeleka code kutoka local kwenda production server

## Requirements

### Requirement 1: Verify Current Deployment Status

**User Story:** As a developer, I want to verify what code is currently deployed on Render, so that I can confirm if my changes are missing.

#### Acceptance Criteria

1. WHEN checking backend deployment THEN the system SHALL display current git commit hash deployed on Render
2. WHEN checking frontend build THEN the system SHALL verify if latest changes are in dist folder
3. WHEN comparing local vs deployed THEN the system SHALL identify any differences in key files

### Requirement 2: Force Fresh Build and Deployment

**User Story:** As a developer, I want to force a complete rebuild and redeployment, so that all my changes reach production.

#### Acceptance Criteria

1. WHEN triggering frontend build THEN the system SHALL clear all cache and build fresh
2. WHEN deploying to Netlify THEN the system SHALL upload the latest dist folder
3. WHEN deploying backend to Render THEN the system SHALL trigger a fresh deployment with latest code
4. WHEN deployment completes THEN the system SHALL verify services are accessible

### Requirement 3: Test Deployed Services

**User Story:** As a developer, I want to test the deployed Journey Planner, so that I can confirm location filtering works in production.

#### Acceptance Criteria

1. WHEN accessing Journey Planner on production THEN the system SHALL load without errors
2. WHEN selecting location and category THEN the system SHALL fetch services from correct region
3. WHEN viewing services in step 4 THEN the system SHALL display only services matching selected location
4. WHEN no services found THEN the system SHALL show helpful error message with suggestions

### Requirement 4: Clear Browser Cache

**User Story:** As a user, I want to clear browser cache completely, so that I see the latest deployed version.

#### Acceptance Criteria

1. WHEN clearing cache THEN the system SHALL remove all localStorage data
2. WHEN clearing cache THEN the system SHALL remove all sessionStorage data
3. WHEN clearing cache THEN the system SHALL force reload all JavaScript files
4. WHEN cache cleared THEN the system SHALL display confirmation message
