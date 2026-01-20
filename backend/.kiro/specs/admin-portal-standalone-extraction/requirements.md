# Requirements Document

## Introduction

This specification defines the requirements for extracting the admin portal from the integrated main application and making it a standalone, independently deployable React application. The admin portal is currently embedded within the main application at `src/pages/admin-portal/` and shares contexts, routing, and build processes with the main app. The goal is to create a self-contained admin application in the root `admin-portal/` directory that can be built, deployed, and maintained separately while only communicating with the backend API.

## Glossary

- **Admin_Portal**: The standalone administrative interface application for managing the iSafari platform
- **Main_Application**: The existing integrated application containing traveler and service provider interfaces
- **Backend_API**: The REST API server that provides data and business logic
- **Standalone_Application**: An independently buildable and deployable application with its own package.json, build configuration, and dependencies
- **Shared_Context**: React context providers (AuthContext, ThemeContext, etc.) currently shared between main app and admin portal
- **Build_Process**: The compilation and bundling process that produces deployable dist folder
- **Admin_Authentication**: Separate authentication flow for admin users accessing the admin portal
- **Component_Independence**: The state where admin portal components do not import or depend on main application code

## Requirements

### Requirement 1: Standalone Application Structure

**User Story:** As a developer, I want the admin portal to be a standalone React application in its own directory, so that it can be developed, built, and deployed independently from the main application.

#### Acceptance Criteria

1. THE Admin_Portal SHALL exist in the root `admin-portal/` directory as a complete React application
2. THE Admin_Portal SHALL have its own package.json file with all necessary dependencies
3. THE Admin_Portal SHALL have its own Vite configuration file for building and development
4. THE Admin_Portal SHALL have its own index.html entry point
5. THE Admin_Portal SHALL have its own node_modules directory after installation
6. WHEN running `npm install` in the admin-portal directory, THE System SHALL install all dependencies without errors
7. WHEN running `npm run dev` in the admin-portal directory, THE System SHALL start a development server on a different port than the main application
8. WHEN running `npm run build` in the admin-portal directory, THE System SHALL produce a dist folder containing the built admin portal

### Requirement 2: Independent Authentication System

**User Story:** As an admin user, I want the admin portal to have its own authentication flow, so that admin access is managed separately from regular user authentication.

#### Acceptance Criteria

1. THE Admin_Portal SHALL have its own AuthContext implementation that does not import from the main application
2. WHEN an unauthenticated user accesses the admin portal, THE System SHALL redirect to the admin login page
3. WHEN an admin user logs in, THE System SHALL validate credentials against the backend API
4. WHEN authentication succeeds, THE System SHALL store admin session tokens in localStorage with an admin-specific key
5. WHEN authentication fails, THE System SHALL display appropriate error messages
6. THE Admin_Portal SHALL verify admin role from the backend API before granting access
7. WHEN a non-admin user attempts to access the admin portal, THE System SHALL deny access and redirect to login
8. WHEN an admin user logs out, THE System SHALL clear all admin session data and redirect to login

### Requirement 3: Component Migration and Independence

**User Story:** As a developer, I want all admin portal components to be self-contained within the admin-portal directory, so that the admin portal has no dependencies on the main application codebase.

#### Acceptance Criteria

1. THE Admin_Portal SHALL contain all 10 admin components (DashboardOverview, UserManagement, ServiceManagement, BookingManagement, PaymentManagement, ContentManagement, AnalyticsReports, SystemSettings, SupportTickets, PromotionsMarketing) in its own components directory
2. THE Admin_Portal components SHALL NOT import any modules from the main application src directory
3. THE Admin_Portal SHALL have its own utility functions for API calls
4. THE Admin_Portal SHALL have its own UI component library or copies of necessary shared components
5. THE Admin_Portal SHALL have its own styling configuration (Tailwind CSS or equivalent)
6. WHEN building the admin portal, THE Build_Process SHALL NOT reference any files outside the admin-portal directory
7. THE Admin_Portal SHALL have its own routing configuration independent of the main application

### Requirement 4: Backend API Communication

**User Story:** As a developer, I want the admin portal to communicate exclusively with the backend API, so that it remains decoupled from the main application and can function independently.

#### Acceptance Criteria

1. THE Admin_Portal SHALL communicate with the Backend_API using HTTP requests
2. THE Admin_Portal SHALL NOT share any state or data with the Main_Application through client-side mechanisms
3. WHEN the admin portal needs data, THE System SHALL fetch it from the Backend_API endpoints
4. WHEN the admin portal modifies data, THE System SHALL send updates to the Backend_API
5. THE Admin_Portal SHALL include authentication tokens in all API requests to the backend
6. THE Admin_Portal SHALL handle API errors gracefully with appropriate user feedback
7. THE Admin_Portal SHALL use environment variables to configure the Backend_API URL

### Requirement 5: Independent Build and Deployment

**User Story:** As a DevOps engineer, I want the admin portal to have its own build and deployment pipeline, so that admin portal updates can be deployed without affecting the main application.

#### Acceptance Criteria

1. WHEN running `npm run build` in the admin-portal directory, THE System SHALL produce a complete dist folder with all necessary assets
2. THE Admin_Portal dist folder SHALL be deployable to any static hosting service independently
3. THE Admin_Portal SHALL have its own environment configuration files (.env)
4. THE Admin_Portal build output SHALL NOT include any code from the main application
5. THE Admin_Portal SHALL have its own deployment configuration (netlify.toml, vercel.json, or equivalent)
6. WHEN the admin portal is deployed, THE System SHALL function correctly without the main application being deployed
7. THE Admin_Portal SHALL support different deployment URLs than the main application

### Requirement 6: Theme and Styling Independence

**User Story:** As a developer, I want the admin portal to have its own theme and styling system, so that it can be styled independently without affecting the main application.

#### Acceptance Criteria

1. THE Admin_Portal SHALL have its own ThemeContext implementation
2. THE Admin_Portal SHALL have its own Tailwind CSS configuration
3. THE Admin_Portal SHALL have its own CSS files and styling assets
4. THE Admin_Portal SHALL NOT import theme or styling from the main application
5. WHEN the admin portal theme is modified, THE Main_Application theme SHALL remain unchanged
6. THE Admin_Portal SHALL support light and dark mode independently of the main application

### Requirement 7: Main Application Cleanup

**User Story:** As a developer, I want the admin portal code removed from the main application, so that the main application codebase is cleaner and the admin portal is not accidentally included in main app builds.

#### Acceptance Criteria

1. WHEN the standalone admin portal is complete, THE System SHALL remove the `src/pages/admin-portal/` directory from the main application
2. THE Main_Application routing configuration SHALL NOT include any admin portal routes
3. THE Main_Application build output SHALL NOT include any admin portal code
4. THE Main_Application package.json SHALL NOT include dependencies that are only used by the admin portal
5. WHEN building the main application after cleanup, THE Build_Process SHALL complete successfully without errors

### Requirement 8: Development Experience

**User Story:** As a developer, I want to be able to develop the admin portal with hot module replacement and fast refresh, so that I have a productive development experience.

#### Acceptance Criteria

1. WHEN running the admin portal in development mode, THE System SHALL support hot module replacement
2. WHEN admin portal code is modified, THE System SHALL automatically refresh the browser with changes
3. THE Admin_Portal development server SHALL start within 5 seconds
4. THE Admin_Portal SHALL display clear error messages in the browser console during development
5. THE Admin_Portal SHALL support React DevTools for debugging

### Requirement 9: Data Persistence and State Management

**User Story:** As an admin user, I want my session and preferences to persist across page refreshes, so that I don't lose my work or have to re-authenticate frequently.

#### Acceptance Criteria

1. THE Admin_Portal SHALL store authentication tokens in localStorage
2. WHEN the admin portal page is refreshed, THE System SHALL restore the authenticated session if valid tokens exist
3. THE Admin_Portal SHALL store user preferences (theme, sidebar state) in localStorage
4. WHEN authentication tokens expire, THE System SHALL redirect to login and clear stored tokens
5. THE Admin_Portal SHALL use a different localStorage key prefix than the main application to avoid conflicts

### Requirement 10: Admin Portal Navigation and Layout

**User Story:** As an admin user, I want a consistent navigation and layout system in the admin portal, so that I can easily access all administrative functions.

#### Acceptance Criteria

1. THE Admin_Portal SHALL display a top navigation bar with user info and logout button
2. THE Admin_Portal SHALL display a collapsible sidebar with navigation menu items
3. WHEN a menu item is clicked, THE System SHALL navigate to the corresponding admin section
4. THE Admin_Portal SHALL highlight the currently active menu item
5. THE Admin_Portal SHALL display notifications in the top navigation bar
6. WHEN the sidebar is collapsed, THE System SHALL show only icons for menu items
7. WHEN the sidebar is expanded, THE System SHALL show icons and labels for menu items
