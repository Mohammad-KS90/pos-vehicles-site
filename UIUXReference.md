# UI/UX Reference Documentation

## 1. Purpose

This document is the central UI/UX reference for the project.

It defines the design principles, information architecture, navigation patterns, screen specifications, reusable components, user experience rules, states, accessibility requirements, responsive behavior, and developer handoff conventions used across the application.

The goal is to ensure that all designers and developers build a consistent product experience across supported platforms.

This document should be used as a reference when:

- Designing new screens
- Creating new UI components
- Implementing screens in iOS, Android, or Web applications
- Creating reusable SwiftUI or UIKit components
- Implementing React Native interfaces
- Building web or administration interfaces
- Reviewing UI consistency
- Adding new user roles
- Adding new product modules
- Mapping backend APIs to UI screens
- Defining loading, error, empty, and offline states
- Creating analytics events
- Performing QA testing

This document does not replace detailed platform implementation documentation. Platform-specific behavior should follow the relevant platform guidelines while preserving the product's shared design language and user experience.

---

# 2. Product Overview

The product is a vehicle and automotive ecosystem designed to support vehicle owners, drivers, automotive businesses, service centers, suppliers, POS businesses, and system administrators.

The application supports the management of vehicles and automotive-related operations through role-based interfaces.

The product may support multiple vehicle categories, including:

- Passenger Cars
- Electric Vehicles
- Trucks
- Buses
- Motorcycles
- Vans
- Light Commercial Vehicles
- Other supported vehicle types

The UI must adapt based on:

- User role
- Account type
- Available permissions
- Vehicle type
- Organization or company context
- Country and localization settings
- Platform capabilities
- Screen size
- Connectivity state

The system must not assume that all users have access to the same navigation, modules, actions, or data.

---

# 3. Supported Platforms

The UI/UX architecture should support the following platforms where applicable:

## 3.1 Mobile

- iOS
- iPadOS
- Android

Mobile applications should prioritize:

- Touch-friendly interactions
- Fast access to common actions
- Clear navigation
- Minimal data entry
- Responsive layouts
- Support for system accessibility settings
- Offline and poor connectivity handling

## 3.2 Web

The web application may support:

- Administration
- POS operations
- Inventory management
- Reports
- Company management
- User management
- System administration

Web interfaces should prioritize:

- Information density
- Keyboard support
- Efficient data entry
- Table and list management
- Filtering and searching
- Responsive layouts
- Desktop productivity

## 3.3 Shared Experience

The same feature does not need to have an identical layout on every platform.

The following should remain consistent:

- Terminology
- Business rules
- User flows
- Status meanings
- Colors and semantic feedback
- Permission behavior
- Error handling principles
- Component behavior where applicable

Platform-specific navigation and interaction conventions may differ.

---

# 4. Design Principles

All UI decisions should follow these principles.

## 4.1 Clarity First

The user must understand:

- Where they are
- What information they are viewing
- What actions are available
- What happens after an action
- Whether an action succeeded or failed

Avoid unnecessary visual complexity.

## 4.2 Role-Based Experience

Users must see interfaces appropriate to their role and permissions.

Do not show unavailable features simply to disable them unless there is a specific product reason.

Navigation should be generated from the user's effective permissions.

Example:

```text
User
├── Role
├── Account Type
├── Company Context
└── Permissions
      ↓
Available Modules
      ↓
Available Navigation
      ↓
Available Actions
```

## 4.3 Progressive Disclosure

Do not display all information and actions simultaneously.

Show:

1. The most important information first
2. Secondary information when required
3. Advanced actions when appropriate

Complex information should be grouped logically.

## 4.4 Consistency

The same interaction should produce the same expected behavior across the product.

Examples:

- Primary buttons use the same hierarchy
- Destructive actions follow the same confirmation pattern
- Loading behavior is predictable
- Error messages follow the same structure
- Status colors have consistent meanings
- Search behaves consistently

## 4.5 Fast Completion

Common user tasks should require as few unnecessary steps as possible.

Examples:

- Add a vehicle
- Scan a VIN
- Create a sale
- Search for an item
- Complete payment
- Book a service
- Add maintenance information

## 4.6 Feedback

Every significant user action must provide feedback.

Examples:

```text
User Action
    ↓
Processing
    ↓
Success / Failure
    ↓
Next Available Action
```

Never leave users uncertain whether an action was completed.

---

# 5. User and Role Architecture

The application supports multiple user roles.

The exact list may evolve with the authorization system.

Potential roles include:

- Vehicle Owner
- Truck Driver
- POS Owner
- Service Center Owner
- Supplier
- Company Administrator
- Business Administrator
- System Administrator
- System COO
- System CFO
- System CTO
- System HR
- System Finance
- System Product
- System Developer
- System QA
- System Install
- System Support

The UI must not directly use hardcoded role names to determine every behavior.

Where possible, UI access should be based on permissions.

Example:

```text
Permission: vehicle:read
Permission: vehicle:create
Permission: vehicle:update
Permission: vehicle:delete
```

UI behavior should follow:

```text
Has Permission?
├── Yes → Display feature/action
└── No  → Hide or restrict feature according to product requirements
```

---

# 6. Account Types

Supported account types may include:

```text
INDIVIDUAL
COMPANY
SYSTEM
```

## INDIVIDUAL

An individual account represents a personal user.

Typical features may include:

- Personal profile
- Personal vehicles
- Vehicle documents
- Maintenance
- Service booking
- Notifications

## COMPANY

A company account represents an organization.

Typical features may include:

- Company profile
- Branch management
- Employee management
- Vehicles
- Inventory
- Sales
- Suppliers
- Reports

## SYSTEM

A system account is used for internal platform operations.

Typical features may include:

- System administration
- User administration
- Role management
- Permission management
- Support
- Monitoring
- Configuration

---

# 7. Information Architecture

The product should organize features into logical modules.

A possible high-level architecture is:

```text
Application
│
├── Authentication
│
├── Shared
│   ├── Notifications
│   ├── Search
│   ├── Profile
│   └── Settings
│
├── Vehicle Management
│   ├── Vehicles
│   ├── VIN
│   ├── Vehicle Passport
│   ├── Maintenance
│   ├── Documents
│   └── Alerts
│
├── Services
│   ├── Service Centers
│   ├── Booking
│   ├── Roadside Assistance
│   └── Service History
│
├── POS
│   ├── Sales
│   ├── Cart
│   ├── Checkout
│   ├── Payments
│   └── Receipts
│
├── Inventory
│   ├── Items
│   ├── Categories
│   ├── Stock
│   └── Inventory Movements
│
├── Business
│   ├── Customers
│   ├── Suppliers
│   ├── Branches
│   └── Reports
│
└── Administration
    ├── Users
    ├── Roles
    ├── Permissions
    ├── Companies
    └── System Configuration
```

---

# 8. Navigation Principles

Navigation must be simple and predictable.

## 8.1 Mobile Navigation

The recommended structure for primary mobile navigation is:

```text
Home
Vehicles
Services
Notifications
Profile
```

The exact tabs may change depending on the user role.

Example:

```text
Vehicle Owner
├── Home
├── Vehicles
├── Services
├── Notifications
└── Profile
```

A POS user may instead use:

```text
POS User
├── Dashboard
├── Sales
├── Inventory
├── More
└── Profile
```

## 8.2 Navigation Rules

- The active destination must be visually identifiable.
- Back navigation must return to the expected previous context.
- Avoid deep navigation without a clear path back.
- Preserve user context when returning from detail screens where possible.
- Do not reset filters or search unnecessarily.
- Navigation destinations must respect permissions.

## 8.3 Deep Links

The application should support deep links where applicable.

Examples:

```text
vehicle/{vehicle_id}
sale/{sale_id}
booking/{booking_id}
notification/{notification_id}
```

The application must validate authentication and authorization before displaying protected destinations.

---

# 9. Screen Identification

Every important screen should have a unique screen ID.

Format:

```text
MODULE-NUMBER
```

Examples:

```text
AUTH-001
AUTH-002
VEH-001
VEH-002
POS-001
INV-001
ADMIN-001
```

This ID should be used consistently in:

- Figma
- UI documentation
- QA test cases
- Analytics
- Product requirements
- Developer documentation where appropriate

---

# 10. Authentication Screens

## AUTH-001 Splash Screen

### Purpose

Display application branding while the application initializes.

### Responsibilities

The application may:

- Load application configuration
- Restore authentication state
- Restore the selected language
- Restore the selected theme
- Validate session state where appropriate
- Load user context

### Navigation

```text
Application Launch
      ↓
AUTH-001 Splash
      ↓
Authentication Available?
├── Yes → Load User Context
│         ↓
│       Authorized?
│       ├── Yes → Role-Based Home
│       └── No  → AUTH-003 Login
│
└── No → AUTH-002 Welcome or AUTH-003 Login
```

The splash screen should not contain unnecessary interaction.

---

## AUTH-002 Welcome

### Purpose

Introduce the product and provide the primary entry points.

### Actions

- Login
- Register

Optional:

- Language selection
- Theme selection
- Learn more

---

## AUTH-003 Login

### Components

- Application logo
- Email field
- Password field
- Password visibility toggle
- Forgot password action
- Login button
- Registration action
- Loading state
- Error state

### Validation

Email:

```text
Required
Valid email format
Normalized according to backend rules
```

Password:

```text
Required
Do not expose password requirements unnecessarily during login
```

### States

- Default
- Field validation error
- Loading
- Authentication failed
- Network error
- Server error

### Actions

```text
Login
  ↓
Validate Form
  ↓
Submit Request
  ↓
Loading
  ↓
Success?
├── Yes → Load User Context → Dashboard
└── No  → Display User-Friendly Error
```

---

## AUTH-004 Registration

Registration must adapt based on account type.

Possible choices:

```text
Individual
Company
```

The UI must not collect information that is unnecessary for the selected account type.

---

## AUTH-005 Forgot Password

### Flow

```text
Enter Email
     ↓
Submit
     ↓
Show Confirmation
     ↓
Receive Verification Method
     ↓
AUTH-006 Verification
```

Avoid exposing whether an account exists when security requirements require a generic response.

---

## AUTH-006 Verification

### Components

- Verification code input
- Resend action
- Countdown where applicable
- Change email action

The resend action must clearly communicate its availability state.

---

## AUTH-007 Reset Password

### Components

- New password
- Confirm password
- Password requirements
- Submit button

### States

- Default
- Validation error
- Password mismatch
- Loading
- Success
- Server error

---

# 11. Vehicle Module

## VEH-001 Vehicle Dashboard

### Purpose

Provide a high-level overview of the user's vehicle.

### Primary Information

Depending on vehicle type:

- Vehicle image
- Vehicle name
- Make
- Model
- Model year
- VIN
- Registration status
- Mileage
- Fuel or energy status where available
- Current alerts
- Upcoming maintenance
- Document expiration

### Primary Actions

- View vehicle
- Add vehicle
- Scan VIN
- Add maintenance
- Book service

---

## VEH-002 My Vehicles

### Purpose

Display all vehicles available to the current user.

### Components

- Screen title
- Search
- Filter
- Vehicle list
- Add vehicle button
- Empty state
- Loading state
- Error state

### Empty State

```text
Title:
No vehicles yet

Description:
Add your first vehicle to manage maintenance,
documents, and important vehicle information.

Primary Action:
Add Vehicle
```

---

## VEH-003 Add Vehicle

Vehicle registration should support multiple methods:

```text
Scan VIN
Enter VIN Manually
Add Vehicle Manually
```

The preferred flow should minimize manual data entry.

---

## VEH-004 VIN Scanner

### Purpose

Allow the user to scan a Vehicle Identification Number.

### States

- Camera permission required
- Camera unavailable
- Scanning
- VIN detected
- VIN validation failed
- Vehicle information found
- Vehicle information not found

The application must allow manual VIN entry as a fallback.

---

## VEH-005 VIN Manual Entry

### Components

- VIN input
- Validation feedback
- Continue button

The UI should clearly distinguish:

```text
Invalid VIN
Valid VIN but vehicle not found
Vehicle found successfully
Network failure
```

---

## VEH-006 Vehicle Details

Display detailed information organized into sections.

Suggested sections:

```text
Overview
Technical Information
Maintenance
Documents
Service History
Parts
Alerts
```

---

## VEH-007 Vehicle Passport

The Vehicle Passport is the central identity view for a vehicle.

Possible information includes:

- VIN
- Manufacturer
- Make
- Model
- Year
- Vehicle type
- Engine
- Fuel type
- Transmission
- Registration information
- Ownership information according to authorization
- Vehicle history where supported

Sensitive information must only be displayed to authorized users.

---

# 12. Maintenance Module

## MAIN-001 Maintenance History

Display maintenance records chronologically.

Each record may contain:

- Date
- Service type
- Service provider
- Mileage
- Cost where authorized
- Notes
- Attached documents

## MAIN-002 Add Maintenance

### Required behavior

- Validate required fields
- Prevent duplicate submission
- Support date selection
- Support mileage input
- Support optional attachments where available

### Success

After successful creation:

```text
Show Success Feedback
      ↓
Update Vehicle Data
      ↓
Return to Maintenance History
```

---

## MAIN-003 Upcoming Maintenance

Display upcoming maintenance recommendations and scheduled tasks.

Priority may be represented semantically as:

```text
Informational
Attention Required
Urgent
Overdue
```

Do not rely only on color to communicate priority.

---

# 13. Vehicle Documents

## DOC-001 Documents List

Possible document types:

- Registration
- Insurance
- Inspection
- License-related documents
- Service documents
- Other vehicle documents

Each document may display:

- Document type
- Status
- Expiration date
- Last updated date

## DOC-002 Add Document

Support:

- Camera capture where supported
- Document upload
- Document type
- Expiration date
- Notes

The application must display upload progress and failures.

---

# 14. Services Module

## SRV-001 Service Discovery

Allow users to find available automotive services.

Possible filters:

- Service type
- Distance
- Availability
- Rating where supported
- Vehicle compatibility

## SRV-002 Service Center Details

Display:

- Name
- Services
- Location
- Contact options
- Availability
- Supported vehicle types

## SRV-003 Service Booking

Suggested flow:

```text
Select Vehicle
      ↓
Select Service
      ↓
Select Date
      ↓
Select Available Time
      ↓
Review Booking
      ↓
Confirm
```

The confirmation screen must clearly display the selected information.

---

# 15. POS Module

## POS-001 POS Dashboard

The dashboard should provide immediate access to common business operations.

Possible information:

- Today's sales
- Number of transactions
- Pending actions
- Low stock alerts
- Quick actions

Primary actions:

- New Sale
- View Sales
- Search Items

---

## POS-002 New Sale

### Layout

```text
Product Search
      +
Product List
      +
Current Cart
      +
Checkout Action
```

The UI must clearly distinguish:

- Search results
- Cart contents
- Quantity controls
- Discounts
- Taxes
- Total amount

---

## POS-003 Product Search

Search should support:

- Product name
- SKU
- Barcode where supported
- Category filtering

States:

- Initial
- Typing
- Searching
- Results
- No results
- Error

---

## POS-004 Cart

Each cart item should support:

- Product name
- Unit price
- Quantity
- Quantity modification
- Remove action
- Item total

The cart should clearly display:

- Subtotal
- Discounts
- Tax
- Final total

---

## POS-005 Checkout

### Required Information

- Cart summary
- Payment method
- Tax summary
- Final amount

The UI must prevent accidental duplicate payment submission.

During processing:

```text
Disable Duplicate Submission
Display Processing State
Wait for Result
```

---

## POS-006 Payment

Payment UI must clearly communicate:

```text
Payment Pending
Processing
Successful
Failed
Cancelled
```

Never report a payment as successful until the backend or payment provider confirms the final state.

---

## POS-007 Receipt

The user should be able to:

- View receipt
- Share where supported
- Print where supported
- Return to POS
- Start a new sale

---

# 16. Inventory Module

## INV-001 Inventory Dashboard

Possible information:

- Total inventory value where authorized
- Low stock
- Out of stock
- Recent movements

## INV-002 Items

Support:

- Search
- Filter
- Sorting
- Pagination where required
- Create item
- View item

## INV-003 Item Details

Display:

- Item name
- SKU
- Category
- Stock quantity
- Pricing
- Supplier
- Compatible vehicles where supported

## INV-004 Inventory Movements

Each movement should clearly identify:

- Movement type
- Quantity
- Date
- Related operation
- Responsible context where authorized

---

# 17. Common UI Components

All reusable components must be documented and implemented consistently.

## Button

Variants:

```text
Primary
Secondary
Outlined
Text
Destructive
```

States:

```text
Default
Pressed
Disabled
Loading
```

Rules:

- Primary actions should be visually prominent.
- Avoid multiple competing primary actions.
- Disabled buttons must have an understandable reason when possible.
- Loading buttons must prevent duplicate submission.

---

## Text Field

States:

```text
Default
Focused
Filled
Error
Disabled
```

A text field may contain:

- Label
- Placeholder
- Leading icon
- Trailing action
- Helper text
- Error text

Errors should appear close to the related input.

---

## Search Field

Must support:

- Focus
- Clear
- Loading
- Results
- Empty results

Search requests should avoid unnecessary backend requests.

---

## Card

Cards should group related information.

Do not use cards solely for decoration.

A card may contain:

- Title
- Description
- Status
- Metadata
- Actions

---

## Modal

Use a modal when the user must complete or confirm a focused action without losing context.

Do not use a modal for unnecessarily complex multi-step workflows.

---

## Bottom Sheet

Recommended for mobile contextual actions.

Examples:

- Select an action
- Filter options
- Select an item
- Display short forms

---

## Confirmation Dialog

Required for destructive or significant actions.

Examples:

- Delete vehicle
- Delete document
- Remove user
- Cancel important booking

The confirmation must explain:

- What action is being performed
- What may happen as a result
- Whether the action can be reversed

---

# 18. Design Tokens

The application should use semantic design tokens instead of hardcoded values throughout feature screens.

## Colors

Example naming:

```text
color.primary
color.secondary

color.background.primary
color.background.secondary
color.background.surface

color.text.primary
color.text.secondary
color.text.disabled

color.border.default
color.border.focus
color.border.error

color.success
color.warning
color.error
color.info
```

Avoid names based only on literal colors such as:

```text
blue500
red500
```

at the feature level.

Semantic tokens allow visual themes to change without rewriting feature implementations.

---

# 19. Typography

Typography should use semantic styles.

Suggested structure:

```text
Display
Heading Large
Heading Medium
Heading Small
Title
Body Large
Body
Body Small
Caption
Button
```

Do not use arbitrary font sizes throughout screens.

Platform-specific implementations should map these semantic styles to native typography systems.

---

# 20. Spacing

Use a consistent spacing scale.

Recommended base unit:

```text
4
```

Suggested scale:

```text
4
8
12
16
20
24
32
40
48
64
```

Avoid arbitrary values unless there is a specific visual or platform requirement.

---

# 21. Iconography

Icons should:

- Have consistent visual style
- Use consistent sizing
- Be recognizable
- Include labels when meaning is unclear
- Not rely exclusively on color

Interactive icons must provide an appropriate accessibility label.

Do not use platform-specific icons inconsistently when a shared concept requires a consistent meaning.

---

# 22. Images

Images must support:

- Loading
- Failure
- Placeholder
- Correct aspect ratio

Avoid layout shifts when images are loaded.

Vehicle images should preserve the correct aspect ratio and avoid important content being unintentionally cropped.

---

# 23. Loading States

Every asynchronous screen or action must define loading behavior.

## Screen Loading

Use skeleton loading when the structure of the content is known.

Example:

```text
Vehicle Header Skeleton
Vehicle Information Skeleton
Maintenance Skeleton
```

## Action Loading

Use a loading indicator for isolated actions.

Example:

```text
Save Vehicle
     ↓
Saving...
     ↓
Success / Error
```

The application must prevent duplicate requests where appropriate.

---

# 24. Empty States

Empty states should explain:

1. What is empty
2. Why it may be empty
3. What the user can do next

Example:

```text
No maintenance records

Maintenance records for this vehicle will appear here.

[Add Maintenance]
```

Avoid empty screens with only an icon and no explanation.

---

# 25. Error States

Errors must be user-friendly.

Do not expose:

- Stack traces
- Raw backend exceptions
- Database errors
- Internal implementation details

Preferred structure:

```text
Title
Description
Recommended Action
Retry
```

Example:

```text
Unable to load vehicles

Please check your connection and try again.

[Retry]
```

Technical errors may be logged internally without exposing them directly to the user.

---

# 26. Offline Behavior

The application should clearly communicate when connectivity affects functionality.

Possible states:

```text
Online
Poor Connection
Offline
Synchronizing
Synchronization Failed
```

The product should define which data and actions are available offline.

Do not allow the user to assume that data has been synchronized when it has only been stored locally.

---

# 27. Form Validation

Validation should occur at the appropriate time.

Rules:

- Validate required fields
- Validate format where applicable
- Display errors near the relevant field
- Preserve user-entered data when possible
- Do not clear the entire form after a single validation failure
- Do not allow duplicate submission

Validation may occur:

```text
During Input
On Field Completion
On Submit
```

The appropriate behavior depends on the field and action.

---

# 28. Notifications and Feedback

Use the correct feedback mechanism.

## Inline Feedback

Use for:

- Field validation
- Section-level issues

## Toast or Snackbar

Use for:

- Short success confirmation
- Non-blocking status

## Alert Dialog

Use for:

- Important errors
- Required confirmation
- Actions requiring immediate attention

Do not use multiple feedback mechanisms for the same event unless necessary.

---

# 29. Accessibility

All UI must consider accessibility from the beginning.

Requirements include:

- Support system font scaling where possible
- Sufficient text contrast
- Do not rely only on color
- Provide accessibility labels
- Provide accessible names for icon-only controls
- Support logical focus order
- Provide sufficiently large touch targets
- Avoid important interactions that require a specific gesture without an alternative

Critical information must remain understandable when:

- Colors are not distinguishable
- Text is enlarged
- Screen reader technology is used

---

# 30. Localization

The application may support multiple languages, including:

- English
- Arabic

Localization requirements:

- Do not hardcode user-facing strings
- Support right-to-left layouts
- Support left-to-right layouts
- Support localized dates
- Support localized numbers
- Support localized currency
- Allow text expansion

Do not assume that translated text will have the same length as English.

---

# 31. RTL Support

Arabic support requires complete RTL testing.

The UI should correctly adapt:

- Navigation direction
- Alignment
- Icon placement where direction is meaningful
- Back navigation affordances
- Lists
- Forms
- Charts where applicable

Not every icon should automatically mirror.

Icons representing direction should follow the appropriate layout direction.

Icons representing absolute concepts should not necessarily be mirrored.

---

# 32. Responsive Design

Layouts must adapt to available screen size.

Suggested categories:

```text
Compact
Regular
Expanded
```

The UI should respond to available width rather than assuming a specific device model.

Mobile:

- Single-column priority
- Touch interaction
- Reduced information density

Tablet:

- Multi-column layouts where useful
- Split views where appropriate
- Expanded information visibility

Desktop:

- Sidebar navigation where appropriate
- Tables
- Dense information views
- Keyboard shortcuts where applicable

---

# 33. API and UI Integration

Each screen should document its backend dependencies.

Example:

```text
Screen:
VEH-002 My Vehicles

API:
GET /vehicles/my

Permission:
vehicle:read

Response:
VehicleResponse[]

Loading:
Skeleton list

Empty:
No vehicles

Error:
Retry action
```

This mapping helps developers and QA understand the complete feature behavior.

---

# 34. UI Data States

Every data-driven screen should consider:

```text
Initial
Loading
Refreshing
Loaded
Empty
Error
Offline
Unauthorized
```

Do not implement only the successful state.

A feature is not considered complete until its expected states are implemented.

---

# 35. Permission States

The UI must distinguish between:

```text
Feature Not Available
No Permission
Data Not Found
```

These states are not interchangeable.

Example:

```text
403
→ User is authenticated but not authorized

404
→ Requested resource does not exist or is not accessible according to API design
```

The UI should handle backend responses according to the product API contract.

---

# 36. Analytics Naming

Screen IDs can be used as part of analytics.

Examples:

```text
screen_view
screen_id: VEH-002
screen_name: my_vehicles
```

Important actions may include:

```text
vehicle_created
vin_scan_started
vin_scan_completed
vin_lookup_failed
maintenance_created
booking_created
sale_started
sale_completed
payment_failed
```

Analytics events should describe business actions rather than implementation details.

---

# 37. Developer Handoff Requirements

A feature is ready for implementation when the following information exists.

## Required

- Screen ID
- Screen name
- Purpose
- User role or permissions
- Components
- States
- Actions
- Navigation destinations
- API requirements
- Validation rules
- Empty state
- Loading state
- Error state

## Optional but Recommended

- Analytics events
- Accessibility notes
- Localization notes
- Responsive behavior
- Edge cases

---

# 38. Screen Documentation Template

Use the following template for new screens.

```md
# SCREEN-ID Screen Name

## Purpose

Describe why this screen exists.

## Available To

Roles:
- Role Name

Permissions:
- module:action

## Entry Points

- Previous Screen
- Deep Link
- Notification

## Components

- Component 1
- Component 2
- Component 3

## Data

Required data:

- Field 1
- Field 2

## Actions

### Primary Action

Description:

Navigation:

```text
Current Screen → Next Screen
```

### Secondary Actions

- Action 1
- Action 2

## Validation

- Validation rule 1
- Validation rule 2

## States

### Loading

Describe loading behavior.

### Empty

Title:

Description:

Action:

### Error

Title:

Description:

Retry:

### Success

Describe expected result.

## API

Method:

Endpoint:

Permission:

Request:

Response:

## Analytics

- screen_view
- primary_action_clicked

## Accessibility

- Accessibility requirement

## Localization

- Localization requirement

## Notes

Additional implementation notes.
```

---

# 39. Component Documentation Template

```md
# Component Name

## Purpose

Describe the purpose of the component.

## Variants

- Variant 1
- Variant 2

## States

- Default
- Focused
- Disabled
- Loading
- Error

## Properties

- Title
- Icon
- Size
- State

## Behavior

Describe interaction behavior.

## Accessibility

Describe accessibility requirements.

## Platform Notes

### iOS

Implementation notes.

### Android

Implementation notes.

### Web

Implementation notes.
```

---

# 40. UI Review Checklist

Before approving a screen:

- [ ] Screen has a unique ID
- [ ] Screen purpose is documented
- [ ] User roles or permissions are defined
- [ ] Navigation behavior is defined
- [ ] Primary action is clear
- [ ] Secondary actions are appropriately prioritized
- [ ] Loading state exists
- [ ] Empty state exists where applicable
- [ ] Error state exists
- [ ] Offline behavior is considered
- [ ] Form validation is defined
- [ ] Duplicate submissions are prevented
- [ ] Accessibility is considered
- [ ] Localization is supported
- [ ] RTL behavior is tested where applicable
- [ ] Responsive behavior is defined
- [ ] API dependencies are documented
- [ ] Analytics events are defined where required
- [ ] Sensitive information is permission-protected
- [ ] UI uses shared components where available
- [ ] Hardcoded visual values are avoided where design tokens exist

---

# 41. Definition of Done for UI/UX

A UI feature should not be considered complete merely because the main screen is visible.

A feature is complete when:

```text
Main UI
+
Navigation
+
Loading
+
Empty State
+
Error State
+
Validation
+
Permissions
+
Accessibility
+
Localization
+
Responsive Behavior
+
API Integration
+
QA Verification
```

are implemented according to the feature requirements.

---

# 42. Documentation Maintenance

This document is a living reference.

When a new module, screen, component, role, or user flow is added:

1. Assign the appropriate module and screen ID.
2. Document the purpose.
3. Define permissions.
4. Define navigation.
5. Define UI components.
6. Define all important states.
7. Document API dependencies.
8. Document edge cases.
9. Update the design system if a new reusable pattern is introduced.
10. Avoid creating feature-specific components when an existing reusable component can be extended appropriately.

Changes to fundamental UI patterns should be reviewed before implementation to prevent inconsistent experiences across the product.

---

# 43. Final Architecture Principle

The product should be designed as a system rather than as a collection of independent screens.

The preferred architecture is:

```text
Design Tokens
      ↓
Reusable Components
      ↓
Component Patterns
      ↓
Feature Screens
      ↓
User Flows
      ↓
Role-Based Experiences
      ↓
Platform-Specific Implementations
```

All new UI work should follow this hierarchy.

The objective is to maintain a scalable design system capable of supporting new vehicles, users, companies, roles, modules, services, and platforms without requiring a complete redesign.

This document is the primary reference for maintaining that consistency.