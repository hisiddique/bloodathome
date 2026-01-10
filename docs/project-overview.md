# BloodAtHome - Project Overview

## What is BloodAtHome?

BloodAtHome is a **UK-based digital healthcare marketplace** that connects patients with qualified phlebotomists and laboratory facilities for convenient blood testing services. It enables patients to book blood collections either at home (via mobile phlebotomists) or at clinic locations, supporting both NHS-ordered tests and private test requests.

The platform operates as a multi-sided marketplace, managing complex interactions between patients, healthcare providers, and the platform itself while maintaining compliance with UK healthcare standards and data protection regulations.

---

## Problem Statement

### Current Blood Testing Experience

**Patient Challenges:**
- Difficulty finding available phlebotomists quickly
- Limited options for home-based blood collection
- Unclear pricing and availability information
- Long waiting times at traditional clinics
- Inflexible appointment scheduling
- No ability to compare providers

**Provider Challenges:**
- Limited client discovery channels
- Manual booking management
- Unclear payment processing and timely settlements
- Difficulty managing multiple appointments across different locations
- Compliance tracking burden

**Market Gap:**
The UK lacks a streamlined, technology-enabled marketplace for blood testing services. Traditional pathology labs and independent phlebotomists operate in silos without a centralized booking platform, forcing patients to rely on NHS GP referrals or fragmented private services.

---

## Core Problem Solved

BloodAtHome addresses this gap by:

1. **For Patients:**
   - Single platform to search, compare, and book blood tests
   - Flexible collection options (home or clinic)
   - Transparent pricing and real-time availability
   - Support for both NHS and private tests
   - Direct communication with providers

2. **For Providers:**
   - Access to patient demand
   - Automated booking and payment processing
   - Compliance tracking and documentation tools
   - Earnings management and settlements
   - Professional profile and reputation system

3. **For the Market:**
   - Professionalization of blood testing services
   - Improved patient access to healthcare
   - Data-driven insights on demand patterns
   - Enhanced safety through provider verification

---

## Key Features & User Journeys

### Patient Features

#### 1. Search and Discovery
- **Location-based search** using UK postcodes
- **Provider filtering** by rating, distance, price, availability
- **Test browsing** by category and medical indication
- **Map view** of available providers
- **Availability checking** in real-time
- **Provider profiles** with qualifications, experience, and patient reviews

#### 2. Booking Management
- **Multi-step booking wizard** for appointments
- **Collection type selection:**
  - Home visits (phlebotomist comes to patient)
  - Clinic visits (patient goes to facility)
- **Test type selection:**
  - NHS tests (patient has GP referral)
  - Private tests (patient orders directly)
- **Date/time scheduling** with provider availability
- **Special handling** for under-16 patients (guardian details required)
- **Draft booking** persistence
- **Booking history** and management
- **Reschedule and cancellation** options

#### 3. Patient Information Management
- **Profile settings** (name, email, phone, address)
- **Multiple addresses** (home, work, etc.)
- **Medical information** (allergies, conditions, blood type)
- **Notification preferences** (email, SMS)
- **Account security** (password, 2FA)
- **GDPR data access** and deletion requests

#### 4. Payment & Financial
- **Secure payment** via Stripe
- **Multiple payment methods** (cards, digital wallets)
- **Transparent pricing** with cost breakdown
- **Promo codes** and discount application
- **Automatic receipts** and invoices
- **Refund management** with status tracking
- **Payment history** access

#### 5. Communication
- **In-app chat** with assigned phlebotomist
- **Booking reminders** and confirmations
- **Real-time notifications** (appointment updates)
- **Support ticket system** for issues
- **Message history** persistence

#### 6. Reviews & Feedback
- **Star ratings** and written reviews
- **Appointment experience** feedback
- **Provider comparison** based on ratings
- **Review moderation** for quality
- **Feedback** for feature requests

### Provider (Phlebotomist) Features

#### 1. Professional Profile
- **Qualifications and certifications** upload
- **Professional bio** and experience details
- **Service specialties** (pediatric, geriatric, etc.)
- **Profile photo** and branding
- **Service quality score** based on completeness

#### 2. Service Management
- **Service area definition** using UK postcodes
- **Service type setup** (home visit, clinic visit)
- **Pricing configuration** per test type
- **Base price setting** with platform commission deduction
- **Pricing history** and change tracking

#### 3. Availability Management
- **Availability calendar** with time slots
- **Working hours** per day
- **Buffer time** between appointments
- **Unavailable dates** blocking
- **Appointment duration** per test type
- **Peak time suggestions** based on demand

#### 4. Booking Management
- **Booking request notifications**
- **Accept/decline** bookings
- **Appointment confirmation** with patients
- **Status updates** (arrived, completed, no-show)
- **Booking history** and statistics
- **Cancellation handling**

#### 5. Financial Management
- **Earnings dashboard** with real-time data
- **Booking-to-revenue tracking**
- **Settlement schedule** (weekly/monthly)
- **Payout history** with detailed breakdowns
- **Settlement reports** generation
- **Bank account management** (encrypted)
- **Tax documentation** (1099 equivalent)

#### 6. Compliance & Documentation
- **Certification uploads** with expiry tracking
- **Expiry alerts** and renewal reminders
- **Compliance checklist** management
- **Term updates** acceptance
- **Incident reporting** tools
- **Background check status** monitoring

#### 7. Patient Communication
- **In-app chat** with booking patients
- **Appointment reminders** to patients
- **Issue notifications** and updates
- **Patient reviews** and response system
- **Review management** and requests

### Provider (Lab/Clinic) Features

#### 1. Facility Management
- **Multi-location support**
- **Operating hours** per location
- **Facility amenities** (parking, accessibility)
- **Capacity limits** per time slot
- **Equipment capabilities** listing
- **Staff scheduling** and management

#### 2. Staff Management
- **Multiple staff members** (phlebotomists, receptionists)
- **Role and permission** assignment
- **Staff availability** scheduling
- **Performance monitoring**
- **Certification tracking** per staff member

#### 3. Booking Management
- **Bulk booking visibility** across all locations
- **Staff assignment** to appointments
- **Walk-in appointment** handling (if enabled)
- **Reschedule and cancellation** management
- **Booking reports** generation

#### 4. Financial & Analytics
- **Multi-location earnings** tracking
- **Location performance** comparison
- **Revenue by location** and service type
- **Custom financial reports**
- **Data export** for accounting systems

### Admin Features

#### 1. Platform Management
- **Provider onboarding** and approval workflow
- **Provider verification** (qualifications, background checks)
- **Compliance monitoring** (expired certifications, policy violations)
- **User account management**
- **Deactivation and reactivation** of accounts

#### 2. Booking Management
- **View all bookings** across platform
- **Manual booking** creation/management
- **Dispute resolution** workflow
- **Cancellation handling** with refund processing
- **Booking reassignment** if needed

#### 3. Financial Operations
- **Payment tracking** and processing
- **Provider settlements** approval and execution
- **Refund management** with audit trail
- **Financial reporting** and analysis
- **Tax documentation** generation

#### 4. Compliance & Support
- **Qualification verification** and expiry management
- **Chat message moderation**
- **Review management** and inappropriate content removal
- **Incident investigation** and documentation
- **Policy violation** flagging and escalation

#### 5. Analytics & Reporting
- **Operational dashboards** with KPIs
- **Revenue analytics** by period, provider, test type
- **Provider performance** metrics
- **User behavior** analytics
- **Custom report** generation
- **Audit trails** of all system changes

---

## Business Model

### Revenue Streams

#### 1. Commission-Based Model (Primary)
- Platform takes a **percentage commission** from each booking
- Percentage applied to total booking amount
- Commission rate configurable per region/test type
- Automated deduction before provider settlement

#### 2. Premium Provider Features (Future)
- Promoted listings for providers
- Featured profile placements
- Advanced analytics access
- Marketing support packages

### Cost Structure

**Expenses:**
- Payment processing fees (Stripe)
- Infrastructure and hosting
- Compliance and legal
- Customer support operations
- Provider onboarding and verification
- Technology development and maintenance

### Payment Flow

```
Patient Payment
    ↓
Platform (Stripe)
    ↓
├── Platform Commission (%)
├── Payment Processing Fee (%)
└── Provider Payout (%)
    ↓
Provider Settlement (Weekly/Monthly)
```

### Provider Earnings Example

```
Test Price: £100
Platform Commission: 20% = £20
Stripe Fee: 2.9% + £0.30 = £3.20
Provider Earnings: £76.50
```

---

## Technical Architecture

### Technology Stack

**Backend:**
- **Framework:** Laravel 12 (PHP 8.2+)
- **ORM:** Eloquent
- **Authentication:** Laravel Fortify
- **API:** RESTful with API authentication
- **Database:** MySQL
- **Queue Processing:** Laravel Queue
- **Real-time Communication:** WebSockets (future)

**Frontend:**
- **Framework:** Inertia.js with React
- **Styling:** Tailwind CSS
- **State Management:** Inertia (server-driven)
- **Maps:** Leaflet/Google Maps
- **Payment UI:** Stripe Elements

**Admin Panel:**
- **Framework:** FilamentPHP v3+
- **Authentication:** Laravel Fortify (integrated)
- **Database:** Same MySQL instance
- **Authorization:** Laravel Policies and Gates

**Infrastructure:**
- **Hosting:** Cloud-based (AWS/Digital Ocean)
- **Storage:** S3 for file uploads (certifications, photos)
- **Payment Processing:** Stripe Connect (for provider payouts)
- **Email:** SMTP/SendGrid
- **Monitoring:** Laravel Telescope/New Relic

### Core Database Entities

#### Users
```
users
├── id
├── role (patient, phlebotomist, clinic, admin)
├── email
├── password
├── name
├── phone
├── created_at
└── verification status
```

#### Providers
```
providers
├── id
├── user_id (links to users table)
├── type (individual_phlebotomist, clinic)
├── business_name
├── bio / description
├── service_area (postcodes)
├── rating (avg)
├── is_active
├── qualifications (relationship)
├── pricing (relationship)
├── availability (relationship)
└── metadata (specialties, languages, etc.)
```

#### Blood Tests & Catalog
```
blood_tests
├── id
├── name
├── category_id
├── base_price
├── fasting_required
├── preparation_notes
├── availability_status
└── booking_count (stats)

test_categories
├── id
├── name
├── description
└── display_order

provider_service_catalog
├── id
├── provider_id
├── test_id
├── custom_price (provider override)
└── is_available
```

#### Bookings & Appointments
```
bookings
├── id
├── patient_id
├── provider_id
├── collection_type (home_visit, clinic_visit)
├── test_type (nhs, private)
├── appointment_date
├── appointment_time
├── status (pending, confirmed, completed, cancelled)
├── location_id (if clinic)
├── patient_details (relationship)
└── booking_items (test selection)

booking_items
├── id
├── booking_id
├── test_id
├── test_price (locked at booking time)
└── quantity

collection_types
├── home_visit
└── clinic_visit
```

#### Payments & Settlements
```
payments
├── id
├── booking_id
├── amount
├── status (pending, completed, failed, refunded)
├── payment_method
├── stripe_transaction_id
├── tax_breakdown (relationship)
└── refund_records (relationship)

settlements
├── id
├── provider_id
├── period_start
├── period_end
├── gross_amount
├── commission_deducted
├── net_amount
├── status (pending, processed)
├── payout_date
└── settlement_items (relationships to bookings)

tax_breakdown
├── id
├── payment_id
├── vat
├── cgst
├── sgst
├── igst
└── other_taxes
```

#### Compliance & Qualifications
```
qualifications
├── id
├── provider_id
├── qualification_type
├── issue_date
├── expiry_date
├── verification_status
├── document_path (S3)
└── verified_by (admin_id)

audit_log
├── id
├── admin_id
├── action (create, update, delete, approve)
├── resource_type
├── resource_id
├── changes (before/after)
├── timestamp
└── ip_address
```

#### Communication
```
chat_messages
├── id
├── booking_id
├── sender_id
├── receiver_id
├── message
├── is_read
├── created_at
└── moderation_status

notifications
├── id
├── user_id
├── type (booking, payment, reminder, alert)
├── data (JSON)
├── read_at
└── created_at
```

### API Architecture

**Base URL:** `/api/v1/`

**Key Endpoints:**

```
Authentication
  POST   /auth/register
  POST   /auth/login
  POST   /auth/logout
  POST   /auth/refresh-token

Providers (Phlebotomists & Clinics)
  GET    /providers/search
  GET    /providers/{id}
  GET    /providers/{id}/availability
  PUT    /providers/{id}
  GET    /providers/{id}/bookings
  GET    /providers/{id}/earnings
  GET    /providers/{id}/settlements

Bookings
  GET    /bookings
  POST   /bookings
  GET    /bookings/{id}
  PATCH  /bookings/{id}
  POST   /bookings/{id}/confirm
  POST   /bookings/{id}/cancel
  POST   /bookings/{id}/chat

Blood Tests
  GET    /blood-tests
  GET    /blood-tests/{id}
  GET    /test-categories

Payments
  POST   /payments
  GET    /payments/{id}
  POST   /payments/{id}/refund

Chat
  GET    /chat/{booking_id}/messages
  POST   /chat/{booking_id}/messages

User Profile
  GET    /profile
  PUT    /profile
  GET    /profile/bookings
  GET    /profile/payments
```

### System Workflows

#### Booking Workflow
```
Patient Initiates Booking
  ↓
Booking Created (PENDING status)
  ↓
Patient completes booking form
  ↓
Payment processed (via Stripe)
  ↓
Booking confirmation sent to provider
  ↓
Provider accepts/declines (or auto-confirmed if configured)
  ↓
Booking CONFIRMED
  ↓
Appointment day arrives
  ↓
Provider marks as COMPLETED
  ↓
Patient can leave review
  ↓
Settlement calculated (if approved)
```

#### Provider Settlement Workflow
```
Weekly/Monthly Settlement Period Ends
  ↓
System calculates earnings:
  - Sum all confirmed bookings
  - Deduct platform commission
  - Deduct refunds
  - Calculate taxes
  ↓
Settlement record created (PENDING)
  ↓
Finance admin reviews
  ↓
Settlement approved
  ↓
Provider payout via Stripe Connect
  ↓
Settlement marked PROCESSED
  ↓
Provider receives funds
```

#### Provider Onboarding Workflow
```
Provider Registration (INCOMPLETE)
  ↓
Provider uploads:
  - Professional qualifications
  - Photo ID
  - Service area
  - Pricing information
  ↓
Registration complete (PENDING_APPROVAL)
  ↓
Operations admin:
  - Reviews qualifications
  - Verifies background check
  - Confirms service area
  ↓
Admin decision:
  ├─ APPROVED → Account activated
  ├─ REJECTED → Rejection reason sent
  └─ INFO_REQUESTED → Provider provides more details
  ↓
Approved provider appears in search
```

---

## Target Users & Market

### Patient Demographics

**Primary:**
- **Age:** 18-65 years
- **Tech Comfort:** Moderate to high (mobile-first)
- **Health Needs:** Regular blood tests, preventive healthcare
- **Location:** UK urban and suburban areas with good internet coverage

**Personas:**
- **Busy Professionals:** Need flexible scheduling, home collection
- **Health-Conscious Individuals:** Regular screening, private tests
- **NHS Patients:** Have GP referrals, seeking convenient collection
- **Parents:** Managing family health, including under-16 children

**Use Cases:**
- Annual health checks
- Private wellness testing
- Fitness/sports performance testing
- Allergy and dietary testing
- Chronic condition monitoring
- Pre-employment health screening

### Provider Market

**Individual Phlebotomists:**
- **Profile:** Qualified nurses/phlebotomists, 5+ years experience
- **Current Model:** Private practice or employed by labs
- **Pain Point:** Limited client reach, manual booking
- **Benefit:** Access to patient demand, streamlined operations

**Laboratory/Clinic Facilities:**
- **Profile:** Established pathology labs, diagnostic centers
- **Locations:** Multi-site clinics in urban areas
- **Current Model:** GP referrals, walk-in patients
- **Benefit:** Extended reach, online booking, staff optimization

### Market Opportunity

- **UK population:** ~67 million
- **Annual blood tests per person:** 1-3
- **Market size estimate:** £2-3 billion annually
- **Target initial penetration:** 1-2% of market
- **Growth trajectory:** 20-30% YoY

---

## Key Competitive Advantages

1. **Integrated Platform:** Search, booking, payment, and communication in one place
2. **Provider Flexibility:** Support for both individual phlebotomists and established clinics
3. **Compliance-First:** Built-in qualification tracking, audit trails, data protection
4. **Payment Automation:** Stripe integration for secure payments and provider settlements
5. **Real-Time Availability:** Actual provider availability, not scheduled slots
6. **Patient Trust:** Ratings, reviews, provider verification, secure messaging
7. **Mobile-Optimized:** Inertia + React for responsive, fast UX
8. **Admin Empowerment:** Comprehensive FilamentPHP dashboard for operations and compliance

---

## Implementation Status

### Completed
- Project initialization with Laravel 12
- Database schema design and migrations
- Initial API layer structure
- User authentication (Fortify)
- Basic UI/UX flows documented

### In Progress
- Core API endpoints
- Frontend implementation (React/Inertia)
- Admin panel (FilamentPHP)
- Payment integration (Stripe)

### Planned
- Real-time chat with WebSockets
- Advanced analytics dashboard
- Provider mobile app
- SMS notifications
- Integration with NHS systems
- Multi-currency support
- International expansion features

---

## Success Metrics

### Platform Health
- **Uptime:** > 99.5%
- **Page Load Time:** < 2 seconds
- **API Response Time:** < 200ms

### User Engagement
- **Monthly Active Users:** Patient and provider counts
- **Booking Completion Rate:** Percentage from search to confirmed
- **Patient Retention:** Repeat booking rate
- **Provider Satisfaction:** Net Promoter Score (NPS)

### Business Performance
- **Monthly Bookings:** Total transactions
- **Average Booking Value:** Revenue per booking
- **Commission Revenue:** Platform earnings
- **Provider Settlement Accuracy:** Payment reconciliation

### Quality & Compliance
- **Average Patient Rating:** 4.5+ stars target
- **Provider Compliance:** 100% current certifications
- **Dispute Resolution Time:** < 48 hours
- **Data Security:** Zero breaches

---

## Conclusion

BloodAtHome addresses a significant gap in the UK healthcare market by creating a streamlined, technology-enabled marketplace for blood testing services. By connecting patients with qualified providers and automating operations, the platform delivers value to all stakeholders while maintaining compliance and trust.

The platform is built on a modern, scalable technology stack with comprehensive features for patient discovery, booking, payment, and provider management. With clear business model, defined market opportunity, and strong competitive advantages, BloodAtHome is positioned for sustainable growth in the digital health sector.
