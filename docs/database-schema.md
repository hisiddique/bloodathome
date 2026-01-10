# BloodAtHome Database Schema Documentation

## Overview

The BloodAtHome database schema is designed to manage a comprehensive phlebotomist booking system. It handles user management, provider services, booking workflows, payments, communication, and audit trails across 44 interconnected tables.

The schema follows a **normalized authentication architecture** where a unified `users` table serves as the base authentication layer for all user types (patients, providers, admins). User-specific data is segregated into dedicated tables (`patients`, `providers`) with 1:1 relationships to users.

The schema is organized into 9 logical categories:
- **Lookup Tables**: System-wide status enumerations
- **Core Tables**: Primary entities (users, patients, providers, services)
- **Permission Tables**: Role-based access control via Spatie
- **Provider Tables**: Provider-specific data (availability, qualifications, service areas)
- **Booking Tables**: Booking lifecycle and draft management
- **Payment Tables**: Financial transactions and settlements
- **Communication Tables**: Chat and notifications
- **Reference Tables**: Lookup data (postcodes)
- **Audit Tables**: Change tracking and compliance

---

## ID Strategy

### ULID (Universally Unique Lexicographically Sortable Identifier)
**Used for**: Core business entities and primary records
- **Advantages**: Sortable, timestamp-embedded, no collision risk, suitable for distributed systems
- **Tables**: users, patients, providers, services, user_addresses, user_payment_methods, provider_services, provider_availabilities, provider_service_areas, provider_qualifications, clinic_locations, bookings, booking_drafts, chat_conversations, chat_messages, payments, invoices, promo_codes, notifications, reviews, and more

### INT (Auto-Incrementing Integer)
**Used for**: Lookup tables, mappings, and high-frequency inserts
- **Advantages**: Compact storage, fast lookups, suitable for reference data
- **Tables**: booking_statuses, payment_statuses, payment_methods, settlement_statuses, verification_statuses, provider_types, service_active_statuses, provider_statuses, collection_types, service_categories, booking_items, booking_consents, payment_tax_breakdown, provider_settlements, promo_code_usages, audit_log

---

## Lookup Tables (Status & Type Enumerations)

### 1. booking_statuses
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| name | VARCHAR(50) | Pending, Confirmed, Completed, Cancelled |
| description | VARCHAR(255) | Status description |

**Values**: Pending → Confirmed → Completed or Cancelled

---

### 2. payment_statuses
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| name | VARCHAR(50) | Pending, Completed, Failed, Refunded |
| description | VARCHAR(255) | Status description |

---

### 3. payment_methods
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| name | VARCHAR(50) | GPay, MasterCard, CreditCard, BankPortal |
| description | VARCHAR(255) | Payment method details |

---

### 4. settlement_statuses
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| name | VARCHAR(50) | Pending, Processing, Paid |
| description | VARCHAR(255) | Settlement status description |

---

### 5. verification_statuses
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| name | VARCHAR(50) | Pending, Verified, Rejected, Expired |
| description | VARCHAR(255) | Verification status details |

---

### 6. provider_types
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| name | VARCHAR(50) | Individual, Laboratory, Clinic |
| description | VARCHAR(255) | Provider type description |

---

### 7. service_active_statuses
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| name | VARCHAR(50) | Active, Inactive, Out of Stock, Discontinued |
| description | VARCHAR(255) | Service status description |

---

### 8. provider_statuses
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| name | VARCHAR(50) | Active, InActive |
| description | VARCHAR(255) | Provider status description |

---

### 9. collection_types
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| name | VARCHAR(50) | Home Visit, Clinic |
| icon_class | VARCHAR(100) | CSS icon class |
| display_order | INT | Sort order for UI |
| description | VARCHAR(255) | Collection type description |

---

### 10. service_categories
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| name | VARCHAR(100) | Blood Test, X-Ray, ECG, etc. |
| description | VARCHAR(255) | Category description |

---

## Core Tables

### 11. users
Base authentication table for all user types (patients, providers, admins). Contains only common authentication and profile fields.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique user identifier |
| first_name | VARCHAR(100) | NOT NULL | First name |
| middle_name | VARCHAR(100) | Nullable | Middle name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| full_name | VARCHAR(255) | NOT NULL | Computed full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| phone | VARCHAR(20) | NOT NULL | Phone number |
| profile_image | VARCHAR(255) | Nullable | Profile image path |
| email_verified_at | TIMESTAMP | Nullable | Email verification timestamp |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| remember_token | VARCHAR(100) | Nullable | Remember me token |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |
| deleted_at | TIMESTAMP | Nullable, INDEX | Soft delete timestamp |

**Indexes**: email, phone, deleted_at

**Note**: User-specific data is stored in related tables (patients, providers) with 1:1 relationships.

---

### 12. patients
Patient-specific profile information with health and medical details. Maintains a 1:1 relationship with users table.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique patient identifier |
| user_id | ULID (FK) | UNIQUE, NOT NULL, FK→users | Associated user (1:1 relationship) |
| date_of_birth | DATE | Nullable | Date of birth |
| address_line1 | VARCHAR(255) | Nullable | Primary address line |
| address_line2 | VARCHAR(255) | Nullable | Secondary address line |
| town_city | VARCHAR(100) | Nullable | Town or city |
| postcode | VARCHAR(10) | Nullable, INDEX | UK postcode |
| nhs_number | VARCHAR(20) | Nullable, UNIQUE | NHS number |
| known_blood_type | VARCHAR(5) | Nullable | Blood type (A+, O-, etc.) |
| known_allergies | TEXT | Nullable | Known allergies |
| current_medications | TEXT | Nullable | Current medications |
| medical_conditions | TEXT | Nullable | Medical conditions |
| internal_notes | TEXT | Nullable | Admin notes |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: user_id, postcode, nhs_number

**Unique Constraints**: user_id, nhs_number

---

### 13. providers
Phlebotomists, laboratories, and clinic locations. Maintains a 1:1 relationship with users table for authentication.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique provider identifier |
| user_id | ULID (FK) | UNIQUE, NOT NULL, FK→users | Associated user (1:1 relationship) |
| type_id | INT (FK) | NOT NULL, FK→provider_types | Individual, Laboratory, or Clinic |
| status_id | INT (FK) | NOT NULL, FK→provider_statuses | Active or InActive |
| provider_name | VARCHAR(255) | Nullable | Organization name |
| address_line1 | VARCHAR(255) | NOT NULL | Primary address |
| address_line2 | VARCHAR(255) | Nullable | Secondary address |
| town_city | VARCHAR(100) | NOT NULL | Town or city |
| postcode | VARCHAR(10) | NOT NULL, INDEX | UK postcode |
| latitude | DECIMAL(10, 8) | Nullable | Geo latitude |
| longitude | DECIMAL(10, 8) | Nullable | Geo longitude |
| location | POINT | Nullable, SPATIAL INDEX | Geo location for distance queries |
| profile_image_url | VARCHAR(255) | Nullable | Profile image URL |
| profile_thumbnail_url | VARCHAR(255) | Nullable | Thumbnail image URL |
| bio | TEXT | Nullable | Provider biography |
| experience_years | INT | Nullable | Years of experience |
| average_rating | DECIMAL(3, 2) | DEFAULT 0 | Cached average rating (1-5) |
| total_reviews | INT | DEFAULT 0 | Cached review count |
| provider_notes | TEXT | Nullable | Internal notes |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |
| deleted_at | TIMESTAMP | Nullable, INDEX | Soft delete timestamp |

**Indexes**: user_id, postcode, location (SPATIAL), status_id, type_id, deleted_at

**Unique Constraint**: user_id

**Note**: Authentication fields (email, password, phone, name) are stored in related users table.

---

### 14. services
Blood tests and medical services available in the system.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique service identifier |
| service_category_id | INT (FK) | NOT NULL, FK→service_categories | Service category |
| service_name | VARCHAR(255) | NOT NULL | Service name |
| service_code | VARCHAR(50) | UNIQUE, NOT NULL | Code for system use (e.g., "BT_FBC") |
| service_description | TEXT | Nullable | Service description |
| is_active | BOOLEAN | DEFAULT true | Service availability flag |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: service_code, service_category_id, is_active

---

## Permission Tables (Spatie)

### 15. roles
Role definitions for role-based access control.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT (PK) | Auto-increment | Unique role identifier |
| name | VARCHAR(125) | UNIQUE, NOT NULL | Role name (e.g., 'patient', 'provider', 'admin') |
| guard_name | VARCHAR(125) | NOT NULL | Guard name (default: 'web') |
| created_at | TIMESTAMP | Nullable | Record creation time |
| updated_at | TIMESTAMP | Nullable | Last update time |

**Indexes**: name, guard_name

---

### 16. permissions
Permission definitions for fine-grained access control.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT (PK) | Auto-increment | Unique permission identifier |
| name | VARCHAR(125) | UNIQUE, NOT NULL | Permission name (e.g., 'create booking', 'view payment') |
| guard_name | VARCHAR(125) | NOT NULL | Guard name (default: 'web') |
| created_at | TIMESTAMP | Nullable | Record creation time |
| updated_at | TIMESTAMP | Nullable | Last update time |

**Indexes**: name, guard_name

---

### 17. model_has_roles
Assigns roles to users (model polymorphism).

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| role_id | INT (FK) | NOT NULL, FK→roles | Associated role |
| model_type | VARCHAR(125) | NOT NULL | Model class (typically 'App\\Models\\User') |
| model_id | ULID (FK) | NOT NULL | User ID (users.id) |

**Composite Key**: (role_id, model_type, model_id)

**Indexes**: model_id, model_type

---

### 18. model_has_permissions
Assigns permissions directly to users (bypassing roles).

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| permission_id | INT (FK) | NOT NULL, FK→permissions | Associated permission |
| model_type | VARCHAR(125) | NOT NULL | Model class (typically 'App\\Models\\User') |
| model_id | ULID (FK) | NOT NULL | User ID (users.id) |

**Composite Key**: (permission_id, model_type, model_id)

**Indexes**: model_id, model_type

---

### 19. role_has_permissions
Maps permissions to roles.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| permission_id | INT (FK) | NOT NULL, FK→permissions | Associated permission |
| role_id | INT (FK) | NOT NULL, FK→roles | Associated role |

**Composite Key**: (permission_id, role_id)

---

## Core Provider Tables

### 20. user_addresses
Multiple addresses per patient (home, work, etc.).

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique address identifier |
| user_id | ULID (FK) | NOT NULL, FK→users | Associated user |
| label | VARCHAR(50) | NOT NULL | Address label (Home, Work, etc.) |
| address_line1 | VARCHAR(255) | NOT NULL | Primary address line |
| address_line2 | VARCHAR(255) | Nullable | Secondary address line |
| town_city | VARCHAR(100) | NOT NULL | Town or city |
| postcode | VARCHAR(10) | NOT NULL, INDEX | UK postcode |
| is_default | BOOLEAN | DEFAULT false | Default address flag |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: user_id, postcode

---

### 21. user_payment_methods
Saved payment methods (Stripe integration).

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique payment method identifier |
| user_id | ULID (FK) | NOT NULL, FK→users | Associated user |
| stripe_payment_method_id | VARCHAR(255) | NOT NULL, UNIQUE | Stripe PM ID |
| stripe_customer_id | VARCHAR(255) | NOT NULL | Stripe customer ID |
| card_brand | VARCHAR(50) | NOT NULL | Card brand (Visa, Mastercard, etc.) |
| card_last_four | VARCHAR(4) | NOT NULL | Last 4 digits of card |
| card_exp_month | INT | NOT NULL | Card expiration month |
| card_exp_year | INT | NOT NULL | Card expiration year |
| is_default | BOOLEAN | DEFAULT false | Default payment method flag |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: user_id, stripe_payment_method_id

---

## Provider Services Tables

### 22. provider_services (Provider Service Catalog)
Service offerings by providers with pricing and commission.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique catalog entry identifier |
| provider_id | ULID (FK) | NOT NULL, FK→providers | Associated provider |
| service_id | ULID (FK) | NOT NULL, FK→services | Associated service |
| base_cost | DECIMAL(10, 2) | NOT NULL | Base cost for service |
| agreed_commission_percent | DECIMAL(5, 2) | NOT NULL | Commission percentage |
| start_date | DATE | NOT NULL | Offer start date |
| end_date | DATE | Nullable | Offer end date (NULL = ongoing) |
| status_id | INT (FK) | NOT NULL, FK→service_active_statuses | Service availability status |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: provider_id, service_id, status_id, start_date, end_date

**Unique Constraint**: (provider_id, service_id)

---

### 23. provider_availabilities
Recurring and one-time provider availability windows.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique availability identifier |
| provider_id | ULID (FK) | NOT NULL, FK→providers | Associated provider |
| day_of_week | INT | Nullable | Day number (0-6, NULL for specific date) |
| specific_date | DATE | Nullable | Specific date (NULL for recurring) |
| start_time | TIME | NOT NULL | Availability start time |
| end_time | TIME | NOT NULL | Availability end time |
| is_available | BOOLEAN | DEFAULT true | Availability flag |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: provider_id, day_of_week, specific_date, is_available

---

### 24. provider_service_areas
Geographic service areas and travel fees.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique service area identifier |
| provider_id | ULID (FK) | NOT NULL, FK→providers | Associated provider |
| postcode_prefix | VARCHAR(4) | NOT NULL | Postcode prefix (e.g., "NG1", "SW1") |
| max_distance_miles | DECIMAL(5, 2) | NOT NULL | Maximum service distance |
| additional_travel_fee | DECIMAL(10, 2) | NOT NULL | Additional fee beyond base cost |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: provider_id, postcode_prefix

---

### 25. provider_qualifications (Qualifications & Compliance)
Professional qualifications and credentials for providers.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique qualification identifier |
| provider_id | ULID (FK) | NOT NULL, FK→providers | Associated provider |
| credential_name | VARCHAR(255) | NOT NULL | Qualification name |
| issuing_body | VARCHAR(255) | NOT NULL | Issuing organization |
| license_number | VARCHAR(100) | Nullable | License/certificate number |
| expiry_date | DATE | Nullable | Expiration date (NULL = no expiry) |
| status_id | INT (FK) | NOT NULL, FK→verification_statuses | Verification status |
| document_url | VARCHAR(255) | Nullable | Document URL or path |
| verified_by_agent | VARCHAR(255) | Nullable | Agent name who verified |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: provider_id, status_id, expiry_date

---

### 26. provider_rates
Commission rate changes over time.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT (PK) | Auto-increment | Unique rate record identifier |
| provider_id | ULID (FK) | NOT NULL, FK→providers | Associated provider |
| commission_percentage | DECIMAL(5, 2) | NOT NULL | Commission percentage |
| start_date | DATE | NOT NULL | Effective start date |
| end_date | DATE | Nullable | Effective end date |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

**Indexes**: provider_id, start_date, end_date

---

### 27. clinic_locations
Physical clinic locations for laboratory and clinic providers.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique clinic location identifier |
| provider_id | ULID (FK) | NOT NULL, FK→providers | Associated provider |
| name | VARCHAR(255) | NOT NULL | Location name |
| address_line1 | VARCHAR(255) | NOT NULL | Primary address |
| address_line2 | VARCHAR(255) | Nullable | Secondary address |
| town_city | VARCHAR(100) | NOT NULL | Town or city |
| postcode | VARCHAR(10) | NOT NULL | UK postcode |
| latitude | DECIMAL(10, 8) | Nullable | Geo latitude |
| longitude | DECIMAL(10, 8) | Nullable | Geo longitude |
| phone | VARCHAR(20) | Nullable | Location phone |
| email | VARCHAR(255) | Nullable | Location email |
| opening_hours | JSON | Nullable | Opening hours (structured format) |
| is_active | BOOLEAN | DEFAULT true | Location active flag |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: provider_id, postcode, is_active

---

### 28. service_collection_mapping
Links services to collection types with additional details.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT (PK) | Auto-increment | Unique mapping identifier |
| service_id | ULID (FK) | NOT NULL, FK→services | Associated service |
| collection_type_id | INT (FK) | NOT NULL, FK→collection_types | Collection type |
| additional_cost | DECIMAL(10, 2) | DEFAULT 0 | Extra cost for this collection type |
| description_html | TEXT | Nullable | HTML description for UI |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

**Indexes**: service_id, collection_type_id

**Unique Constraint**: (service_id, collection_type_id)

---

## Booking Tables

### 29. bookings
Main booking records for patient appointments.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique booking identifier |
| user_id | ULID (FK) | NOT NULL, FK→users | Associated patient |
| provider_id | ULID (FK) | NOT NULL, FK→providers | Associated provider |
| status_id | INT (FK) | NOT NULL, FK→booking_statuses | Current booking status |
| confirmation_number | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable reference (BAH-2025-001234) |
| collection_type_id | INT (FK) | NOT NULL, FK→collection_types | Home Visit or Clinic |
| nhs_number | VARCHAR(20) | Nullable | Patient's NHS number |
| scheduled_date | DATE | NOT NULL | Appointment date |
| time_slot | VARCHAR(20) | NOT NULL | Time slot (e.g., "09:00-10:00") |
| service_address_line1 | VARCHAR(255) | NOT NULL | Service location line 1 |
| service_address_line2 | VARCHAR(255) | Nullable | Service location line 2 |
| service_town_city | VARCHAR(100) | NOT NULL | Service location city |
| service_postcode | VARCHAR(10) | NOT NULL | Service location postcode |
| grand_total_cost | DECIMAL(10, 2) | NOT NULL | Total booking cost |
| discount_amount | DECIMAL(10, 2) | DEFAULT 0 | Discount applied |
| promo_code_id | ULID (FK) | Nullable, FK→promo_codes | Applied promo code |
| stripe_payment_intent_id | VARCHAR(255) | Nullable, UNIQUE | Stripe payment intent ID |
| visit_instructions | TEXT | Nullable | Instructions for provider |
| patient_notes | TEXT | Nullable | Notes from patient |
| guardian_name | VARCHAR(255) | Nullable | Guardian name (if applicable) |
| guardian_confirmed | BOOLEAN | DEFAULT false | Guardian consent flag |
| draft_token | VARCHAR(255) | Nullable | Token linking to draft |
| draft_expires_at | TIMESTAMP | Nullable | Draft expiration time |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |
| cancelled_at | TIMESTAMP | Nullable | Cancellation timestamp |
| cancellation_reason | TEXT | Nullable | Reason for cancellation |

**Indexes**: user_id, provider_id, status_id, confirmation_number, scheduled_date, promo_code_id, stripe_payment_intent_id

---

### 30. booking_items
Line items for services in a booking.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT (PK) | Auto-increment | Unique line item identifier |
| booking_id | ULID (FK) | NOT NULL, FK→bookings | Associated booking |
| catalog_id | ULID (FK) | NOT NULL, FK→provider_services | Provider service catalog entry |
| item_cost | DECIMAL(10, 2) | NOT NULL | Item cost |
| agreed_comm_percent | DECIMAL(5, 2) | NOT NULL | Commission percentage at booking time |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

**Indexes**: booking_id, catalog_id

---

### 31. booking_drafts
Draft bookings for multi-step booking process.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique draft identifier |
| user_id | ULID (FK) | Nullable, FK→users | Associated user (NULL for guest) |
| session_token | VARCHAR(255) | UNIQUE, NOT NULL | Guest session token |
| current_step | INT | DEFAULT 1 | Current wizard step (1-5) |
| step_data | JSON | NOT NULL | Step-specific form data |
| expires_at | TIMESTAMP | NOT NULL | Draft expiration time |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: user_id, session_token, expires_at

---

### 32. booking_consents
Consent records for bookings.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT (PK) | Auto-increment | Unique consent record identifier |
| booking_id | ULID (FK) | NOT NULL, FK→bookings | Associated booking |
| consent_type | VARCHAR(50) | NOT NULL | Type (terms, cancellation_policy, contact_consent, guardian_consent) |
| consent_text | TEXT | NOT NULL | Full consent text agreed to |
| consented_at | TIMESTAMP | NOT NULL | Consent timestamp |
| ip_address | VARCHAR(45) | Nullable | IP address of consentor |
| user_agent | TEXT | Nullable | Browser user agent |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

**Indexes**: booking_id, consent_type

---

## Payment Tables

### 33. payments
Payment transactions for bookings.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique payment identifier |
| booking_id | ULID (FK) | NOT NULL, FK→bookings | Associated booking |
| method_id | INT (FK) | NOT NULL, FK→payment_methods | Payment method |
| amount | DECIMAL(10, 2) | NOT NULL | Payment amount |
| transaction_ref | VARCHAR(100) | NOT NULL, UNIQUE | Transaction reference |
| stripe_payment_intent_id | VARCHAR(255) | UNIQUE, NOT NULL | Stripe payment intent ID |
| stripe_charge_id | VARCHAR(255) | Nullable, UNIQUE | Stripe charge ID |
| card_last_four | VARCHAR(4) | Nullable | Last 4 digits of card used |
| card_brand | VARCHAR(50) | Nullable | Card brand used |
| payment_status_id | INT (FK) | NOT NULL, FK→payment_statuses | Payment status |
| payment_date | TIMESTAMP | NOT NULL | Payment timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: booking_id, stripe_payment_intent_id, payment_status_id, payment_date

---

### 34. payment_tax_breakdown
Tax calculation details for payments.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT (PK) | Auto-increment | Unique tax record identifier |
| payment_id | ULID (FK) | NOT NULL, FK→payments | Associated payment |
| tax_type_name | VARCHAR(100) | NOT NULL | Tax type (e.g., "VAT") |
| tax_percentage | DECIMAL(5, 2) | NOT NULL | Tax percentage applied |
| tax_amount_calculated | DECIMAL(10, 2) | NOT NULL | Calculated tax amount |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

**Indexes**: payment_id

---

### 35. invoices
Invoice records for payments.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique invoice identifier |
| payment_id | ULID (FK) | NOT NULL, FK→payments | Associated payment |
| invoice_number | VARCHAR(50) | UNIQUE, NOT NULL | Invoice number (INV-2025-0001) |
| billing_address | TEXT | NOT NULL | Billing address |
| subtotal_amount | DECIMAL(10, 2) | NOT NULL | Subtotal before tax |
| total_tax_amount | DECIMAL(10, 2) | NOT NULL | Total tax amount |
| grand_total | DECIMAL(10, 2) | NOT NULL | Grand total |
| pdf_storage_link | VARCHAR(255) | Nullable | Link to stored PDF |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: payment_id, invoice_number

---

### 36. provider_settlements
Provider payment settlements per booking.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT (PK) | Auto-increment | Unique settlement record identifier |
| booking_id | ULID (FK) | NOT NULL, FK→bookings | Associated booking |
| provider_id | ULID (FK) | NOT NULL, FK→providers | Associated provider |
| collected_amount | DECIMAL(10, 2) | NOT NULL | Amount collected from patient |
| commission_percentage | DECIMAL(5, 2) | NOT NULL | Commission percentage applied |
| commission_amount | DECIMAL(10, 2) | NOT NULL | Commission amount deducted |
| provider_payout_amount | DECIMAL(10, 2) | NOT NULL | Amount to pay provider |
| settlement_status_id | INT (FK) | NOT NULL, FK→settlement_statuses | Settlement status |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: booking_id, provider_id, settlement_status_id

---

### 37. promo_codes
Promotional codes for discounts.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique promo code identifier |
| code | VARCHAR(50) | UNIQUE, NOT NULL | Promo code string |
| description | VARCHAR(255) | Nullable | Code description |
| discount_type | VARCHAR(20) | NOT NULL | Type (percentage or fixed) |
| discount_value | DECIMAL(10, 2) | NOT NULL | Discount value (amount or %) |
| min_order_amount | DECIMAL(10, 2) | DEFAULT 0 | Minimum order amount |
| max_discount_amount | DECIMAL(10, 2) | Nullable | Maximum discount cap |
| usage_limit | INT | Nullable | Total usage limit (NULL = unlimited) |
| usage_count | INT | DEFAULT 0 | Current usage count |
| per_user_limit | INT | DEFAULT 1 | Usage limit per user |
| valid_from | DATE | NOT NULL | Valid start date |
| valid_until | DATE | Nullable | Valid end date (NULL = no expiry) |
| is_active | BOOLEAN | DEFAULT true | Active flag |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: code, is_active, valid_from, valid_until

---

### 38. promo_code_usages
Tracking of promo code usage by users.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT (PK) | Auto-increment | Unique usage record identifier |
| promo_code_id | ULID (FK) | NOT NULL, FK→promo_codes | Associated promo code |
| user_id | ULID (FK) | NOT NULL, FK→users | User who used code |
| booking_id | ULID (FK) | NOT NULL, FK→bookings | Associated booking |
| discount_applied | DECIMAL(10, 2) | NOT NULL | Discount amount applied |
| used_at | TIMESTAMP | NOT NULL | Usage timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

**Indexes**: promo_code_id, user_id, booking_id

---

## Communication Tables

### 39. chat_conversations
Chat conversation threads between patients and providers.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique conversation identifier |
| booking_id | ULID (FK) | NOT NULL, FK→bookings | Associated booking |
| user_id | ULID (FK) | NOT NULL, FK→users | Associated patient |
| provider_id | ULID (FK) | NOT NULL, FK→providers | Associated provider |
| is_active | BOOLEAN | DEFAULT true | Conversation active flag |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: booking_id, user_id, provider_id, is_active

---

### 40. chat_messages
Individual messages in conversations.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique message identifier |
| conversation_id | ULID (FK) | NOT NULL, FK→chat_conversations | Associated conversation |
| sender_type | VARCHAR(20) | NOT NULL | Sender type (user or provider) |
| sender_id | ULID | NOT NULL | ID of sender |
| message | TEXT | NOT NULL | Message content |
| is_read | BOOLEAN | DEFAULT false | Read status flag |
| read_at | TIMESTAMP | Nullable | Read timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: conversation_id, sender_type, sender_id, is_read, created_at

---

### 41. notifications
System notifications for users and providers.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique notification identifier |
| user_id | ULID (FK) | Nullable, FK→users | Recipient user |
| provider_id | ULID (FK) | Nullable, FK→providers | Recipient provider |
| type | VARCHAR(100) | NOT NULL | Notification type |
| title | VARCHAR(255) | NOT NULL | Notification title |
| body | TEXT | NOT NULL | Notification body |
| data | JSON | Nullable | Additional notification data |
| read_at | TIMESTAMP | Nullable | Read timestamp |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

**Indexes**: user_id, provider_id, type, created_at

---

### 42. reviews
Patient reviews of providers.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | ULID (PK) | Primary Key | Unique review identifier |
| booking_id | ULID (FK) | NOT NULL, FK→bookings | Associated booking |
| user_id | ULID (FK) | NOT NULL, FK→users | Review author |
| provider_id | ULID (FK) | NOT NULL, FK→providers | Provider being reviewed |
| rating | INT | NOT NULL, CHECK (1-5) | Rating (1-5 stars) |
| review_text | TEXT | Nullable | Review text |
| is_published | BOOLEAN | DEFAULT false | Publication flag |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes**: booking_id, user_id, provider_id, is_published, created_at

---

## Reference Tables

### 43. uk_postcodes
Reference table for UK postcodes.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| postcode | VARCHAR(10) (PK) | Primary Key | UK postcode |
| latitude | DECIMAL(10, 8) | NOT NULL | Geo latitude |
| longitude | DECIMAL(10, 8) | NOT NULL | Geo longitude |
| district | VARCHAR(100) | Nullable | District name |
| region | VARCHAR(100) | Nullable | Region name |

**Indexes**: postcode (PK), region

---

## Audit Tables

### 44. audit_log
Comprehensive audit trail for all data changes.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | INT (PK) | Auto-increment | Unique audit record identifier |
| table_name | VARCHAR(100) | NOT NULL | Table being modified |
| record_id | VARCHAR(255) | NOT NULL | ID of modified record |
| action_type | VARCHAR(20) | NOT NULL | INSERT, UPDATE, or DELETE |
| old_value | JSON | Nullable | Previous values (UPDATE/DELETE) |
| new_value | JSON | Nullable | New values (INSERT/UPDATE) |
| changed_by | VARCHAR(255) | Nullable | User who made change |
| changed_at | TIMESTAMP | NOT NULL | Change timestamp |
| created_at | TIMESTAMP | NOT NULL | Log creation timestamp |

**Indexes**: table_name, record_id, action_type, changed_at

---

## Entity Relationships

### Authentication & Authorization
```
users (unified auth table)
  ├─> patients (1:1) (patient-specific data)
  ├─> providers (1:1) (provider-specific data)
  ├─> model_has_roles (role assignments via Spatie)
  │     └─> roles (patient, provider, admin, etc.)
  └─> model_has_permissions (direct permission assignments)
        └─> permissions (fine-grained access control)

roles ─┬─> role_has_permissions
       └─> permissions
```

### Core Workflow Flow
```
users (patient) → patients
  ├─> booking_drafts (multi-step form)
  └─> bookings (confirmed appointment)
        ├─> providers → users (assigned service provider)
        ├─> booking_items (selected services)
        ├─> payments (transaction)
        │     └─> invoices (receipt)
        ├─> chat_conversations (communication)
        │     └─> chat_messages
        ├─> booking_consents (compliance)
        ├─> promo_codes (discount)
        └─> reviews (feedback)
```

### Provider Relationships
```
users (provider auth) → providers (1:1)
  ├─> provider_services (service offerings with pricing)
  ├─> provider_availabilities (schedule)
  ├─> provider_service_areas (geographic coverage)
  ├─> provider_qualifications (credentials)
  ├─> clinic_locations (physical locations)
  └─> provider_rates (commission history)
```

### Payment Flow
```
booking
  └─> payments (Stripe integration)
        ├─> payment_tax_breakdown (tax details)
        └─> invoices (formal receipt)
            └─> provider_settlements (provider payout)
```

---

## Key Index Recommendations

### Performance Indexes
1. **Booking Search**: `bookings(user_id, created_at DESC)`
2. **Provider Availability**: `provider_availabilities(provider_id, specific_date, start_time)`
3. **Service Discovery**: `provider_services(service_id, status_id, start_date, end_date)`
4. **Geo Queries**: `providers(location SPATIAL)` for distance-based searches
5. **Payment Lookups**: `payments(stripe_payment_intent_id, booking_id)`
6. **Chat Messages**: `chat_messages(conversation_id, created_at DESC)`

### Soft Delete Queries
- `users(deleted_at, created_at DESC)`
- `providers(deleted_at, status_id)`

---

## Seed Data for Lookup Tables

### booking_statuses
```sql
INSERT INTO booking_statuses (id, name, description) VALUES
(1, 'Pending', 'Booking awaiting confirmation'),
(2, 'Confirmed', 'Booking confirmed by provider'),
(3, 'Completed', 'Service completed'),
(4, 'Cancelled', 'Booking cancelled');
```

### payment_statuses
```sql
INSERT INTO payment_statuses (id, name, description) VALUES
(1, 'Pending', 'Payment awaiting processing'),
(2, 'Completed', 'Payment successfully processed'),
(3, 'Failed', 'Payment processing failed'),
(4, 'Refunded', 'Payment refunded to customer');
```

### payment_methods
```sql
INSERT INTO payment_methods (id, name, description) VALUES
(1, 'GPay', 'Google Pay'),
(2, 'MasterCard', 'Mastercard'),
(3, 'CreditCard', 'Visa/Credit Card'),
(4, 'BankPortal', 'Bank Transfer');
```

### settlement_statuses
```sql
INSERT INTO settlement_statuses (id, name, description) VALUES
(1, 'Pending', 'Settlement awaiting processing'),
(2, 'Processing', 'Settlement in progress'),
(3, 'Paid', 'Settlement paid to provider');
```

### verification_statuses
```sql
INSERT INTO verification_statuses (id, name, description) VALUES
(1, 'Pending', 'Pending verification'),
(2, 'Verified', 'Successfully verified'),
(3, 'Rejected', 'Verification rejected'),
(4, 'Expired', 'Credential expired');
```

### provider_types
```sql
INSERT INTO provider_types (id, name, description) VALUES
(1, 'Individual', 'Individual phlebotomist'),
(2, 'Laboratory', 'Medical laboratory'),
(3, 'Clinic', 'Clinic facility');
```

### service_active_statuses
```sql
INSERT INTO service_active_statuses (id, name, description) VALUES
(1, 'Active', 'Service actively offered'),
(2, 'Inactive', 'Service temporarily unavailable'),
(3, 'Out of Stock', 'Service out of stock'),
(4, 'Discontinued', 'Service discontinued');
```

### provider_statuses
```sql
INSERT INTO provider_statuses (id, name, description) VALUES
(1, 'Active', 'Provider actively available'),
(2, 'InActive', 'Provider not available');
```

### collection_types
```sql
INSERT INTO collection_types (id, name, icon_class, display_order, description) VALUES
(1, 'Home Visit', 'icon-home', 1, 'Service provided at patient home'),
(2, 'Clinic', 'icon-clinic', 2, 'Service at clinic or lab location');
```

### service_categories
```sql
INSERT INTO service_categories (id, name, description) VALUES
(1, 'Blood Test', 'Blood testing services'),
(2, 'X-Ray', 'X-ray imaging'),
(3, 'ECG', 'Electrocardiogram'),
(4, 'Ultrasound', 'Ultrasound imaging'),
(5, 'General Health Check', 'Comprehensive health screening');
```

---

## Migration Notes

### Table Creation Order
1. Create lookup tables (booking_statuses through service_categories)
2. Create core tables (users, providers, services)
3. Create provider-related tables (provider_services, availabilities, etc.)
4. Create booking workflow tables
5. Create payment and settlement tables
6. Create communication tables
7. Create reference tables
8. Create audit tables

### Soft Delete Implementation
Tables with soft deletes use `deleted_at` timestamp field with index. Query pattern:
```sql
WHERE deleted_at IS NULL
```

### ULID Generation
ULID fields should be auto-generated on insert using Laravel Model::creating() hook or database trigger.

---

## Notes on Data Integrity

1. **Promo Codes**: Validate usage_count <= usage_limit before applying
2. **Provider Availability**: Check overlapping slots before creating new records
3. **Payment Cascade**: Ensure bookings are not deleted if payments exist
4. **Soft Deletes**: Queries must explicitly include deleted_at conditions for compliance
5. **Geo Queries**: Ensure latitude/longitude validation before insertion
6. **Commission Tracking**: Store commission percentage at booking time in booking_items for historical accuracy
