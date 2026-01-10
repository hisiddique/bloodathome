# Improved UI Flow Recommendations

## Executive Summary

This document outlines recommended improvements to streamline the user interface and reduce friction in the booking process. The key objective is to consolidate redundant flows, reduce required steps, and implement proper data persistence.

## Current vs. Proposed Architecture

### Current Problems

| Issue | Impact | Severity |
|-------|--------|----------|
| Duplicate location/date selection | Users fill same fields twice | High |
| 4-step search + 5-step booking | 9 total steps before confirmation | Critical |
| Under 16 asked twice | Confusing, suggests poor UX | Medium |
| No data persistence | Progress lost on refresh | Critical |
| Mock data everywhere | Can't test real flows | Critical |
| Payment not integrated | Can't complete real bookings | Critical |
| No draft bookings | Users lose progress | High |

### Proposed Solution: Unified Booking Flow

## New Page Structure

### Consolidated Pages

| Current Pages | Proposed | Rationale |
|---|---|---|
| `/search` + `/search/results` | `/book` | Single unified endpoint |
| `/phlebotomist/{id}` (separate page) | Modal/drawer on `/book` | Faster comparison, context preserved |
| `/booking` (5 separate steps) | Steps within `/book` | Seamless progression |
| `/my-bookings` | `/bookings` | Keep (already good) |

### Final Route Map

```
Core Routes:
├── /                    Home/Landing
├── /book               Unified booking interface (NEW)
├── /bookings           Booking history (existing, improved)
├── /become-phlebotomist Provider registration
├── /faq                FAQ
├── /auth/*             Authentication flows
├── /dashboard          User dashboard
├── /settings/*         User settings
└── /admin/*            Admin panel (future)
```

## Proposed Unified Booking Flow

### Overview

```
HOME PAGE (/)
    |
    ├── Quick Search Bar (postcode + date) on homepage
    │   └── Submit → /book?postcode=XX1&date=YYYY-MM-DD
    │
    ├── "Find a Phlebotomist" button → /book (empty state)
    │
    └── "My Bookings" → /bookings (existing, enhanced)

UNIFIED BOOKING PAGE (/book)
    |
    ├── STEP 1: Collection Type & Test Selection
    │   • Collection type (NHS/Private/Home/Clinic)
    │   • Blood test selection from database
    │   • Show price immediately
    │
    ├── STEP 2: Location & Schedule
    │   • Postcode search (with suggestions)
    │   • Date picker (show availability)
    │   • Time slot selection (per-provider availability)
    │
    ├── STEP 3: Provider Selection
    │   • Map + list view of filtered providers
    │   • Provider cards with ratings, distance, price
    │   • In-line provider details modal (no page change)
    │   • Quick stats: distance, rating, reviews count
    │
    ├── STEP 4: Patient Details
    │   • Name, DOB, contact (pre-filled if existing user)
    │   • Address confirmation
    │   • Medical notes field
    │   • Under 16 indicator (asked once, at step 4)
    │   • NHS number (conditional, if NHS test)
    │
    ├── STEP 5: Payment & Review
    │   • Cost breakdown:
    │     - Service fee
    │     - Booking fee
    │     - Taxes
    │     - Total
    │   • Promo code input
    │   • Payment method (Stripe)
    │   • Terms acceptance
    │   • Order review
    │
    └── Booking Confirmation
        • Confirmation number
        • Booking summary
        • Direct messaging option
        • "View All Bookings" link
```

### Detailed Step Breakdown

#### Step 1: Collection Type & Test Selection

**Purpose:** Understand service type and what tests user needs

**Form Fields:**
```
Collection Type (radio group)
├── NHS Test (free or patient-paid)
│   └── NHS Number input [conditional]
├── Private Test
├── Home Visit (phlebotomist comes to you)
└── Clinic Visit (go to lab location)

Blood Test Selection (multi-select dropdown)
├── Full Blood Count
├── Metabolic Panel
├── Lipid Profile
└── [Load from database]

Notes (text area - optional)
└── Special requirements or medical history notes
```

**Features:**
- Show pricing immediately for selected tests
- Conditional fields based on selection
- Search/filter available tests
- Quantity selection if multiple needed
- Real-time total calculation

**Data Saved:**
- Store collection_type
- Store selected test_ids
- Store notes

#### Step 2: Location & Schedule

**Purpose:** Determine appointment location and timing

**Form Fields:**
```
Service Location (radio group)
├── My Home Address [multi-address selector]
│   └── [Use existing address or add new]
├── Available Clinic Locations [map/list]
│   └── Show clinics with availability
└── Other Location [text input]

Preferred Date (date picker)
├── Show calendar
├── Disable dates with no providers
└── Highlight high/low availability dates

Preferred Time (time slots)
├── Show available slots for selected date
├── Filter by collection type
├── Display provider count per slot
```

**Features:**
- Validate postcode format
- Auto-suggest postcodes
- Show map with locations
- Real-time availability loading
- Timezone handling

**Data Saved:**
- Store location (address_id or new address)
- Store preferred_date
- Store timezone
- Store suggested time slots

#### Step 3: Provider Selection

**Purpose:** Choose specific phlebotomist or clinic

**Display:**
```
Filter Options
├── Distance (0-5, 5-10, 10-20 miles)
├── Rating (4.5+, 4.0+, 3.5+)
├── Price Range (slider)
├── Availability (same day, next day, week)

Provider Card (clickable)
├── Name & profile photo
├── Rating (★★★★★) with count
├── Distance from postcode
├── Price (lowest to highest for selected tests)
├── Availability (badges: "Same Day", "Next Day", etc.)
├── "View Details" link (modal)
└── "Book" button

Provider Details Modal
├── Full bio and qualifications
├── All reviews with text
├── Photos/certifications
├── Pricing breakdown
├── Availability calendar
├── Message button
└── Book button
```

**Features:**
- Map view of providers (Mapbox integration)
- List view with sorting
- Real-time availability per provider
- Direct messaging from details
- Comparison mode (select 2-3 providers side-by-side)

**Data Saved:**
- Store selected provider_id
- Store available_slots for selected provider
- Store provider pricing snapshot

#### Step 4: Patient Details

**Purpose:** Collect information for appointment

**Form Fields:**
```
Patient Information (auto-fill from account if exists)
├── Full Name *
├── Date of Birth *
├── Phone Number *
├── Email Address *

Address Confirmation
├── Address (from Step 2 or new) *
├── Confirm address is correct

Patient Status
├── Under 16 years old? (Yes/No)
│   └── If Yes: Parent/Guardian consent checkbox
└── Age group [derived from DOB]

Medical Information
├── Known blood type (optional)
├── Known allergies (optional)
├── Current medications (optional)
├── Medical conditions (optional)
├── Special requirements (text area)

Consent
├── I confirm the above information is correct ✓
└── I understand the appointment terms ✓

NHS Number (conditional - only if NHS test in Step 1)
├── NHS Number input *
└── Validation against format
```

**Features:**
- Pre-fill from user account
- Address validation with UK postcode service
- DOB age calculation
- Conditional NHS number field
- Medical information optional but encouraged
- Clear consent checkboxes

**Data Saved:**
- Store patient_details
- Store medical_info
- Store consent records

#### Step 5: Payment & Review

**Purpose:** Process payment and confirm booking

**Review Section:**
```
Booking Summary (read-only)
├── Collection Type: [Value]
├── Tests: [Count & names]
├── Date: [Date, Time]
├── Location: [Address/Clinic]
├── Provider: [Name & rating]

Cost Breakdown
├── Base Fee: £X.XX
├── Tests: £X.XX [itemized]
├── Booking Fee: £X.XX
├── Tax (VAT): £X.XX
├── Discount/Promo: -£X.XX [if applied]
├── ─────────────────
└── TOTAL: £X.XX

Promo Code
├── Have a code? [text input]
└── Apply button [validates & updates total]

Payment Method
├── Stripe payment form
│   ├── Card number
│   ├── Expiry date
│   ├── CVC
│   └── Cardholder name
├── Alternative: Pay at appointment [if enabled]
└── Save card for future [checkbox]

Agreements & Consent
├── ☐ I agree to the booking terms
├── ☐ I understand cancellation policy
└── ☐ I consent to contact via phone/email

[CONFIRM BOOKING] button
```

**Features:**
- Stripe payment integration
- Real payment processing
- PCI compliance via Stripe
- Save card for future
- Promo code validation
- Itemized costs
- Terms acceptance with links

**Data Saved:**
- Store complete booking record
- Store payment transaction details
- Store consent records
- Create draft if not completed

#### Confirmation Page

**Display:**
```
✓ Booking Confirmed

Confirmation Number: BAH-2025-001234

Booking Details
├── Service: [Type]
├── Tests: [List]
├── Date & Time: [Full datetime]
├── Location: [Address/Clinic]
├── Phlebotomist: [Name, contact]
├── Cost Paid: £X.XX

What's Next?
├── Message from phlebotomist: [Optional - show if sent]
├── [START CHAT] button
├── Your provider may contact you to confirm details

Actions
├── [VIEW MY BOOKINGS]
├── [BOOK ANOTHER APPOINTMENT]
└── [HOME]

Email Confirmation
├── Sent to: user@example.com
├── Resend confirmation email [link]
```

**Features:**
- Display confirmation details
- Show payment receipt
- Immediate notification to provider
- Chat initiation
- Email confirmation sent
- Clear next steps

## Data Architecture Improvements

### Server-Side State Management

**Draft Booking System:**
```
POST /api/bookings/draft
Response: { booking_id, token, expires_at }

PATCH /api/bookings/{id}/draft
Request: { step, data }
Response: { booking_id, step, saved_data }

POST /api/bookings/{id}/confirm
Request: { payment_intent, consent_data }
Response: { booking_id, confirmation_number, status }
```

**Benefits:**
- Survive page refresh
- Resume incomplete bookings
- Prevent double-booking
- Track form abandonment

### Database Schema Updates

```sql
-- New tables
bookings_drafts (
  id, user_id, step, data (JSON),
  created_at, updated_at, expires_at
)

payment_intents (
  id, booking_id, stripe_intent_id,
  amount, status, created_at
)

booking_confirmations (
  id, booking_id, confirmation_number,
  sent_at, confirmed_at
)
```

### Real Data Integration

**Required Database Queries:**
```
1. SELECT blood_tests (with pricing)
2. SELECT phlebotomists
   WHERE service_areas CONTAINS postcode
   AND availability > selected_date
3. SELECT clinic_locations
   WHERE within_distance(postcode, X miles)
4. SELECT time_slots
   WHERE phlebotomist_id = X
   AND date = Y
   AND available = true
5. SELECT user_address (for pre-fill)
6. SELECT promo_code (validate & calculate discount)
```

## Navigation Flow Comparison

### Before (Current)

```
Home
  ↓
Search Page (Step 1-4)
  ↓
Search Results (map view)
  ↓
Phlebotomist Profile (separate page)
  ↓
Back to Results
  ↓
Book Now
  ↓
Booking Wizard (Steps 1-5)
  ↓
Confirmation

TOTAL PAGES VISITED: 7+
TOTAL STEPS: 9
RISK: Data loss at each transition
```

### After (Proposed)

```
Home (optional quick search bar)
  ↓
/book (all 5 steps inline)
  ↓
Confirmation (same page or modal)

TOTAL PAGES VISITED: 2
TOTAL STEPS: 5
RISK: None (server-side drafts)
```

## Implementation Roadmap

### Phase 1: Backend Preparation
1. Create draft booking system (API endpoints)
2. Integrate real blood test data
3. Implement phlebotomist search/filter endpoints
4. Setup Stripe payment integration
5. Create payment intent endpoints

### Phase 2: Frontend Migration
1. Create unified `/book` page
2. Implement step navigation within single page
3. Build server-side draft persistence
4. Create provider details modal
5. Integrate payment form

### Phase 3: Features
1. Map view of providers
2. Real availability system
3. Promo code system
4. Booking confirmation emails
5. Chat integration

### Phase 4: Optimization
1. Analytics on form abandonment
2. Suggested providers on homepage
3. Returning user quick-book
4. Subscription/recurring bookings

## Old Pages - Deprecation Plan

### `/search` Page
- **Status:** Deprecated, redirect to `/book`
- **Timeline:** Remove after Phase 2
- **Migration:** URL redirect to `/book`

### `/search/results` Page
- **Status:** Deprecated, merge into `/book` Step 3
- **Timeline:** Remove after Phase 2
- **Migration:** URL redirect to `/book?step=3`

### `/phlebotomist/{id}` Page
- **Status:** Convert to modal component
- **Timeline:** Keep redirect, open modal on `/book`
- **Migration:** Link to `/book?provider={id}` opens details modal

### `/booking` Page
- **Status:** Deprecated, merge into `/book`
- **Timeline:** Remove after Phase 2
- **Migration:** URL redirect to `/book?step=1`

## Benefits of Proposed Flow

### For Users
- **Fewer steps:** 5 instead of 9
- **Faster completion:** Average 5-7 minutes vs 15+
- **No data loss:** Server-side drafts persist progress
- **Better comparison:** See providers without leaving page
- **Clear pricing:** Know cost upfront
- **Real availability:** See actual provider schedules

### For Development
- **Reduced redundancy:** One form instead of two
- **Simpler codebase:** Fewer pages, better organization
- **Easier testing:** Unified flow to test
- **Better analytics:** Single endpoint for conversions
- **Scalability:** Modal component reusable

### For Business
- **Conversion:** More bookings completed
- **Insight:** Better data on user behavior
- **Cost:** Lower support burden (fewer errors)
- **Revenue:** Payment processing integration
- **Retention:** Draft bookings for follow-up

## Fallback/Alternative Approaches

### Option A: Hybrid (Recommended)
- Keep `/search` and `/search/results` as-is
- Add "Quick Book" flow at `/book`
- Gradually migrate users to new flow
- Measure metrics before full switch

### Option B: Full Migration (Faster)
- Completely replace old flows
- Single `/book` endpoint
- Keep `/search` redirect for SEO
- Complete rewrite of booking flow

### Option C: Gradual (Safest)
- Phase 1: Add draft saving to current flows
- Phase 2: Consolidate `/search` routes
- Phase 3: Merge `/booking` into `/search/results`
- Phase 4: Final cleanup

## Metrics to Track

### Success Indicators
- Booking completion rate
- Average time to complete booking
- Form abandonment rate per step
- Error rate per field
- Mobile vs desktop completion rate
- Return user conversion rate

### Implementation Metrics
- Page load time (both flows)
- First paint / interactive metrics
- API response times
- Payment processing time
- Email delivery rate

## Summary

The proposed unified booking flow significantly improves the user experience by:
1. Reducing steps from 9 to 5
2. Eliminating duplicate data entry
3. Adding server-side persistence
4. Enabling real-time data integration
5. Improving provider comparison

Implementation should follow a phased approach, with Phase 1-2 taking 2-3 sprints to complete. The migration can be gradual to minimize risk and maintain uptime.
