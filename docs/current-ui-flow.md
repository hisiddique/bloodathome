# Current UI Flow Documentation

## Overview

This document describes the current user interface flow and navigation structure of the BloodAtHome application. It maps out all pages, routes, and the user journey from landing to booking completion.

## Pages Structure

| Page | Route | File | Purpose |
|------|-------|------|---------|
| Home/Landing | `/` | `pages/index.tsx` | Welcome and main call-to-actions |
| Search | `/search` | `pages/search/index.tsx` | Phlebotomist finder with multi-step form |
| Search Results | `/search/results` | `pages/search/results.tsx` | List/map of phlebotomists or labs |
| Phlebotomist Profile | `/phlebotomist/{id}` | `pages/phlebotomist/show.tsx` | Detailed provider information and ratings |
| Booking Wizard | `/booking` | `pages/booking/index.tsx` | Multi-step appointment booking process |
| My Bookings | `/my-bookings` | `pages/bookings/index.tsx` | User's booking history and management |
| Become Phlebotomist | `/become-phlebotomist` | `pages/become-phlebotomist.tsx` | Provider registration form |
| FAQ | `/faq` | `pages/faq.tsx` | Frequently asked questions |
| Login | `/login` | `pages/auth/login.tsx` | User authentication |
| Register | `/register` | `pages/auth/register.tsx` | New user account creation |
| Dashboard | `/dashboard` | `pages/dashboard.tsx` | Authenticated user home |
| Profile Settings | `/settings/profile` | `pages/settings/profile.tsx` | User profile information |
| Password Settings | `/settings/password` | `pages/settings/password.tsx` | Change password |
| Appearance Settings | `/settings/appearance` | `pages/settings/appearance.tsx` | Theme and display preferences |
| Two-Factor Auth | `/settings/two-factor` | `pages/settings/two-factor.tsx` | 2FA setup and management |

## Current User Journey

### Authentication Flow

```
UNAUTHENTICATED USER
    |
    ├─→ HOME PAGE (/)
    │   ├─→ "Login" → LOGIN PAGE (/login)
    │   │   └─→ Login successful → DASHBOARD (/dashboard)
    │   │
    │   └─→ "Sign Up" → REGISTER PAGE (/register)
    │       └─→ Registration successful → DASHBOARD (/dashboard)
    │
    └─→ Access restricted page → Redirect to LOGIN (/login)
```

### Booking Flow (Authenticated User)

```
DASHBOARD (/dashboard)
    |
    ├─→ "Find a Phlebotomist" button → SEARCH PAGE (/search)
    │   |
    │   └─→ PhlebotomistFinder Component (Multi-step)
    │       │
    │       ├─→ STEP 1: Collection Type Selection
    │       │   Options:
    │       │   • NHS Test (requires NHS number)
    │       │   • Private Test
    │       │   • Home Visit
    │       │   • Clinic Visit
    │       │
    │       ├─→ STEP 2: Under 16 Indicator
    │       │   Question: "Is the patient under 16 years old?"
    │       │   Options: Yes / No
    │       │
    │       ├─→ STEP 3: Location Search
    │       │   Input: UK Postcode
    │       │   Action: Search for available providers
    │       │
    │       └─→ STEP 4: Blood Test Selection
    │           Input: Select from available tests
    │           Action: Submit to get results
    │
    └─→ Submit → SEARCH RESULTS (/search/results)
        │
        └─→ Results Page Shows:
            • List of matched phlebotomists/labs
            • Map view (if available)
            • Provider cards with:
              - Name and rating
              - Distance from postcode
              - Price estimate
              - Availability
            │
            ├─→ "View Profile" → PHLEBOTOMIST PROFILE (/phlebotomist/{id})
            │   │
            │   └─→ Shows:
            │       • Full provider information
            │       • Qualifications and experience
            │       • Reviews and ratings
            │       • Pricing details
            │       • Available time slots
            │
            │   └─→ "Book Now" → BOOKING WIZARD (/booking)
            │
            └─→ "Book Now" (direct from results) → BOOKING WIZARD (/booking)
                │
                └─→ Booking Wizard (5 Steps):
                    │
                    ├─→ STEP 1: Location, Date & Time Selection
                    │   • Confirm location or select new address
                    │   • Choose preferred appointment date
                    │   • Select available time slot
                    │
                    ├─→ STEP 2: Phlebotomist/Lab Selection (if not pre-selected)
                    │   • Show filtered providers again
                    │   • Confirm choice or change provider
                    │
                    ├─→ STEP 3: Patient Details Form
                    │   Fields:
                    │   • Full name
                    │   • Date of birth
                    │   • Phone number
                    │   • Email
                    │   • Address
                    │   • NHS number (if NHS test)
                    │   • Blood type (optional)
                    │   • Medical conditions (optional)
                    │
                    ├─→ STEP 4: Payment Information
                    │   • Show cost breakdown
                    │   • Enter payment details
                    │   • Apply promo codes (if applicable)
                    │
                    └─→ STEP 5: Booking Confirmation
                        • Summary of booking details
                        • Confirmation number
                        • "Start Chat" option to contact phlebotomist
                        • "View My Bookings" link
                        • "Home" button
```

### Booking Management Flow

```
DASHBOARD (/dashboard)
    |
    └─→ "My Bookings" button → MY BOOKINGS PAGE (/my-bookings)
        │
        └─→ Shows:
            • Upcoming appointments
            • Past appointments
            • Cancelled appointments
            • Booking status (Confirmed, Pending, Completed, Cancelled)
            │
            ├─→ Click booking → View Details
            │   • Full booking information
            │   • Phlebotomist contact info
            │   • Reschedule option
            │   • Cancel option
            │   • Chat with phlebotomist
            │
            └─→ "Reschedule" → Modify date/time
            │
            └─→ "Cancel" → Cancellation workflow
```

### Provider Registration Flow

```
HOME PAGE (/)
    |
    └─→ "Become a Phlebotomist" button → PROVIDER REGISTRATION (/become-phlebotomist)
        │
        └─→ Registration Form:
            • Professional details
            • Qualifications and certifications
            • Service area (postcodes)
            • Pricing structure
            • Availability
            │
            └─→ Submit → Account pending approval
```

### Settings Flow

```
DASHBOARD (/dashboard)
    |
    └─→ User Menu → Settings
        │
        ├─→ Profile (/settings/profile)
        │   • Name, email, contact details
        │   • Profile picture
        │   • Address book (multiple addresses)
        │
        ├─→ Password (/settings/password)
        │   • Change password
        │   • Current password verification
        │
        ├─→ Appearance (/settings/appearance)
        │   • Dark/Light mode toggle
        │   • Font size preferences
        │   • Layout options
        │
        └─→ Two-Factor Authentication (/settings/two-factor)
            • Enable/disable 2FA
            • Setup authenticator app
            • Generate recovery codes
            • Backup codes management
```

## Current Implementation Details

### Search Page (`pages/search/index.tsx`)

**Components:**
- PhlebotomistFinder (multi-step form)
- Step indicators
- Form inputs for each step
- Navigation buttons (Next/Previous/Submit)

**Features:**
- 4-step form process
- Form state management
- Basic validation
- Redirect to results on submit

**Issues:**
- Mock blood test data (hardcoded)
- No data persistence (state lost on refresh)
- Multiple selection screens for similar data

### Search Results Page (`pages/search/results.tsx`)

**Components:**
- Provider cards list
- Map component (optional)
- Filter sidebar
- Provider information display

**Features:**
- Display matched providers
- Sorting options
- Distance display
- Basic filtering

**Issues:**
- Mock data
- Map integration incomplete
- Limited filtering options

### Booking Wizard Page (`pages/booking/index.tsx`)

**Components:**
- Multi-step form (5 steps)
- Step navigation
- Form inputs per step
- Progress indicator

**Features:**
- Location selection
- Date/time picker
- Patient details form
- Payment form
- Confirmation page

**Issues:**
- Duplicate location/date selection (also in search)
- Under 16 question asked twice
- No actual payment processing
- No data persistence between steps
- Mock data for everything

### Phlebotomist Profile Page (`pages/phlebotomist/show.tsx`)

**Components:**
- Profile header
- Information sections
- Reviews/ratings display
- Call-to-action buttons

**Features:**
- Provider information display
- Reviews and ratings
- "Book Now" button
- "Contact" option

### My Bookings Page (`pages/bookings/index.tsx`)

**Components:**
- Booking list/table
- Status indicators
- Action buttons
- Detail views

**Features:**
- Display user bookings
- Status filtering
- View booking details
- Reschedule/cancel options

## Current Issues and Inefficiencies

### 1. Duplicate Workflows

- **Search and Booking flows** both ask for location and date/time selection
- **Search results and phlebotomist profile** both allow booking initiation
- **Under 16 question** asked in search step 2 AND patient details form

### 2. Multiple Steps Before Results

- 4 steps required before seeing any providers
- Users don't see availability or pricing until after filling form
- High friction for simple queries

### 3. Data Persistence

- No state persistence between navigation
- Refreshing page loses all progress
- Difficult to return to booking after viewing profile
- No saved search or draft bookings

### 4. Mock Data

- All blood tests hardcoded
- Provider data is fake
- No real availability system
- Pricing not from database
- No actual user data persistence

### 5. Payment Integration

- No real payment processing
- Stripe integration missing
- No refund handling
- No payment history

### 6. Data Duplication

- Under 16 status collected twice
- Location searched twice
- Patient details collected in multiple places

### 7. Navigation Issues

- Unclear flow from search to booking
- Hard to go back and modify selections
- No ability to compare providers easily
- Limited context preservation

### 8. User Experience

- Too many form fields per step
- No validation feedback until submission
- Unclear what happens after "Book Now"
- No chat integration in booking flow

## Authentication Pages

### Login (`pages/auth/login.tsx`)

- Email/password input
- Remember me option
- Forgot password link
- Error handling

### Register (`pages/auth/register.tsx`)

- Email input
- Password with confirmation
- Terms acceptance
- Email verification step

### Password Reset (`pages/auth/reset-password.tsx`)

- Token-based reset flow
- New password input
- Confirmation

### Two-Factor Challenge (`pages/auth/two-factor-challenge.tsx`)

- Code input for OTP
- Recovery code option

### Email Verification (`pages/auth/verify-email.tsx`)

- Resend email option
- Email verification link handling

## Component Architecture

### Layout Components

- `AuthLayout`: For authentication pages
- `AppLayout`: For authenticated app pages
- `SettingsLayout`: For settings pages

### Shared Components

- `AppShell`: Main application wrapper
- `AppHeader`: Top navigation bar
- `AppSidebar`: Navigation sidebar
- `AppContent`: Main content area
- `Breadcrumbs`: Navigation breadcrumbs
- `UserMenu`: User account dropdown

## Route Protection

- Authentication pages redirect to dashboard if user is logged in
- Protected pages require authentication
- Role-based access (implied but not yet implemented)

## Summary

The current UI flow is functional but has significant redundancy and inefficiency. The 4-step search followed by a 5-step booking creates friction. Mock data throughout makes real testing impossible. The next phase should consolidate flows, implement proper data persistence, and connect real backend data.
