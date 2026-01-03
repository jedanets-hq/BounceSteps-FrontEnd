# Requirements Document

## Introduction

This document specifies the requirements for enhancing the Service Provider Dashboard in the iSafari Global platform. The enhancements focus on four key areas:
1. Fixing the display of registration information (company/business name, service location, categories, business details) in the My Profile section
2. Adding payment methods selection to the Add Service form
3. Adding contact details section (Email, WhatsApp) to the Add Service form
4. Improving the verification badge design to display as a blue star with white checkmark

## Glossary

- **Service_Provider_Dashboard**: The main dashboard interface for service providers to manage their business
- **My_Profile_Section**: The profile tab within the Service Provider Dashboard showing registration and business information
- **Add_Service_Form**: The form used by service providers to create new services
- **Payment_Methods**: The accepted payment options for a service (Visa/Credit Card, Google Pay, PayPal, Mobile Money/Escrow)
- **Contact_Details**: Communication channels (Email, WhatsApp) that travelers can use to contact service providers
- **Verification_Badge**: A visual indicator showing that a service provider has been verified by the platform
- **Traveler_Portal**: The interface where travelers browse and book services

## Requirements

### Requirement 1

**User Story:** As a service provider, I want to see my registration information (company/business name, service location, categories, business details) displayed correctly in My Profile, so that I can verify my business information is accurate.

#### Acceptance Criteria

1. WHEN a service provider views the My Profile section THEN the Service_Provider_Dashboard SHALL display the company/business name that was entered during registration
2. WHEN a service provider views the My Profile section THEN the Service_Provider_Dashboard SHALL display the service location (region, district, ward, street) that was entered during registration
3. WHEN a service provider views the My Profile section THEN the Service_Provider_Dashboard SHALL display all service categories that were selected during registration
4. WHEN a service provider views the My Profile section THEN the Service_Provider_Dashboard SHALL display business details (business type, description) that were entered during registration
5. WHEN registration data is missing for any field THEN the Service_Provider_Dashboard SHALL display "Not provided" as a placeholder

### Requirement 2

**User Story:** As a service provider, I want to select which payment methods I accept for each service, so that travelers know how they can pay for my services.

#### Acceptance Criteria

1. WHEN a service provider creates or edits a service THEN the Add_Service_Form SHALL display checkboxes for payment methods: Visa/Credit Card, Google Pay, PayPal, and Mobile Money (Escrow)
2. WHEN a service provider selects Visa/Credit Card THEN the Add_Service_Form SHALL display input fields for card payment details
3. WHEN a service provider selects Google Pay THEN the Add_Service_Form SHALL display input fields for Google Pay account details
4. WHEN a service provider selects PayPal THEN the Add_Service_Form SHALL display input fields for PayPal account details
5. WHEN a service provider selects Mobile Money (Escrow) THEN the Add_Service_Form SHALL display a notice that this feature is coming soon
6. WHEN no payment method is selected THEN the Traveler_Portal SHALL not display any payment options for that service
7. WHEN payment methods are selected and details are filled THEN the Traveler_Portal SHALL display only the selected payment methods with their details

### Requirement 3

**User Story:** As a service provider, I want to add my contact details (Email, WhatsApp) to each service, so that travelers can contact me directly.

#### Acceptance Criteria

1. WHEN a service provider creates or edits a service THEN the Add_Service_Form SHALL display a required contact details section
2. WHEN filling contact details THEN the Add_Service_Form SHALL require at least one contact method (Email or WhatsApp)
3. WHEN a service provider enters a WhatsApp number THEN the Add_Service_Form SHALL validate the phone number format
4. WHEN a service provider enters an email THEN the Add_Service_Form SHALL validate the email format
5. WHEN a traveler views a service with WhatsApp contact THEN the Traveler_Portal SHALL display a WhatsApp button that opens WhatsApp with the provider's number
6. WHEN a traveler views a service with email contact THEN the Traveler_Portal SHALL display an email button that opens the default email client with the provider's email
7. WHEN contact details are saved THEN the system SHALL persist them to the database with the service record

### Requirement 4

**User Story:** As a platform user, I want to see verification badges displayed as professional blue stars with white checkmarks, so that verified providers are clearly distinguished.

#### Acceptance Criteria

1. WHEN displaying a verified service provider THEN the system SHALL render the verification badge as a blue star shape with a white checkmark inside
2. WHEN the verification badge is displayed THEN the badge SHALL have consistent styling across all platform views (dashboard, service listings, provider profiles)
3. WHEN hovering over the verification badge THEN the system SHALL display a tooltip explaining "Verified Provider"
4. WHEN a provider is not verified THEN the system SHALL not display any verification badge

