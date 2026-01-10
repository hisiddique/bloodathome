# User Roles and Responsibilities

## Overview

This document defines all user roles in the BloodAtHome application and their respective permissions, capabilities, and responsibilities.

## Role Hierarchy

```
System
├── Super Admin (Full control)
│   ├── Operations Admin (Operational management)
│   ├── Finance Admin (Payment & settlements)
│   └── Support Admin (Customer service)
├── Patients (End users)
└── Providers (Service providers)
    ├── Individual Phlebotomist
    ├── Laboratory/Clinic
    └── Clinic Operator
```

---

## 1. Patient (User)

### Overview
Patients are end users who book blood test appointments through the platform.

### Core Responsibilities
- Register and maintain account profile
- Search for phlebotomists/clinics
- Book blood test appointments
- Provide accurate patient information
- Make payments securely
- Follow appointment protocols
- Communicate with assigned phlebotomist
- Provide feedback and reviews

### Permissions

#### Account Management
- Register new account
- Login/logout
- Update profile information (name, email, phone)
- Change password
- Enable/disable two-factor authentication
- Delete account (with data retention options)

#### Browsing & Search
- Search phlebotomists by location
- Filter providers by rating, distance, price
- View provider profiles and reviews
- View FAQ and help articles
- Compare multiple providers
- Check provider availability

#### Booking Management
- Create new bookings
- Select collection type (NHS/Private, Home/Clinic)
- Choose blood tests
- Select preferred location and date/time
- Provide patient details and medical information
- Save draft bookings
- View booking history
- Reschedule appointments (within policy)
- Cancel appointments (with penalty if applicable)

#### Payment
- Make secure payments via Stripe
- Save payment methods (with encryption)
- View payment history and receipts
- Apply promo codes
- Request refunds (within policy)
- View invoice/receipt for bookings

#### Communication
- Chat with assigned phlebotomist
- Receive booking confirmations
- Receive appointment reminders
- Message support team
- View conversation history

#### Profile & Settings
- Manage multiple addresses
- Store medical information (allergies, conditions)
- Set notification preferences (email, SMS)
- View account activity log
- Download personal data (GDPR)
- Request account closure

#### Reviews & Feedback
- Leave star ratings and reviews
- Rate appointment experience
- Report issues or concerns
- Request service improvements

### Restrictions
- Cannot access admin panel
- Cannot view other users' bookings
- Cannot access provider backend
- Cannot modify completed bookings
- Cannot access system analytics
- Cannot see pricing details of other patients' bookings

### Data Owned
- Profile information (name, email, phone, address)
- Appointment bookings and history
- Payment information (encrypted)
- Medical information
- Chat messages
- Reviews and ratings

---

## 2. Provider (Service Provider)

Providers are healthcare professionals or facilities offering blood test services.

### 2A. Individual Phlebotomist

#### Overview
Independent phlebotomists who offer home visit and/or clinic blood collection services.

#### Registration Process
1. Complete registration form
2. Provide qualifications and certifications
3. Undergo background check
4. Complete profile with bio and photo
5. Set service area and pricing
6. Await admin approval
7. Activate account once approved

#### Core Responsibilities
- Maintain current qualifications and certifications
- Provide accurate service information
- Maintain professional profile
- Respond to booking requests promptly
- Complete appointments professionally
- Communicate with patients before/after appointment
- Report any issues to platform
- Collect payment where applicable
- Maintain data privacy and security

#### Permissions

##### Account Management
- Register professional account
- Login/logout
- Update profile information
- Change password
- Enable two-factor authentication
- Upload/update qualifications and certifications
- View certification expiry warnings
- Request account deactivation

##### Service Management
- Create and edit service profile
- Upload professional photo
- Write professional bio
- List qualifications and experience
- Set service area (postcodes)
- Manage service types (home visit, clinic)
- Set pricing per test type
- Update pricing (with change history)
- Add specialty areas (e.g., pediatric, geriatric)
- View service description quality score

##### Availability Management
- Create availability calendar
- Set working hours (per day)
- Block unavailable dates/times
- Set buffer time between appointments
- Configure appointment duration per test type
- Mark as available/unavailable
- View booked vs available slots
- Receive availability suggestions based on demand

##### Booking Management
- View incoming booking requests
- Accept or decline bookings
- Confirm appointment details with patient
- View booking confirmations
- Track upcoming appointments
- View completed appointments
- View appointment history
- Update appointment status (arrived, completed, no-show)
- Request patient information if incomplete

##### Communication
- Chat with patients assigned to bookings
- Receive patient queries
- Send appointment reminders
- Notify patients of any issues
- View conversation history
- Block problematic users (with reason)

##### Financial Management
- View earnings dashboard
- Track bookings and revenue
- View payment schedule
- Receive earnings summary (weekly/monthly)
- Track scheduled settlements
- View transaction history
- Request manual settlement (if allowed)
- Set bank account for payouts
- View tax documents (1099/equivalent)

##### Reviews & Ratings
- View patient reviews and ratings
- Respond to reviews
- Request review removal (if inappropriate)
- View average rating and statistics
- Track rating trends

##### Compliance & Documentation
- Upload new certifications when renewed
- View certification expiry countdown
- Maintain compliance checklist
- Accept platform terms updates
- Complete mandatory training (if required)
- Report any incidents or issues

### Restrictions
- Cannot accept cash-only payments (must use platform)
- Cannot contact patients outside platform (for bookings)
- Cannot modify patient health information
- Cannot access other providers' earnings
- Cannot view patient personal data unrelated to booking
- Cannot decline bookings without valid reason (booking ratio tracked)
- Cannot overcharge patients (pricing fixed in advance)
- Cannot operate without valid qualifications

### Data Owned
- Professional profile
- Qualifications and certifications
- Availability calendar
- Pricing structure
- Bank account details (encrypted)
- Bookings assigned to them
- Chat messages with patients
- Earnings and settlement records

---

### 2B. Laboratory / Clinic

#### Overview
Facilities with multiple staff members offering blood collection services at clinic locations.

#### Registration Process
1. Submit clinic information and details
2. Provide location(s) and operating hours
3. Submit qualifications for lead phlebotomist
4. Provide liability insurance details
5. Setup pricing structure
6. Await admin approval
7. Activate account once approved

#### Core Responsibilities
- Maintain facility compliance and standards
- Ensure qualified staff availability
- Maintain appointment schedule accuracy
- Communicate appointment details to patients
- Provide professional service environment
- Maintain patient confidentiality
- Report any service issues
- Manage refunds and cancellations

#### Permissions

##### Account Management
- Register clinic account
- Assign admin users for clinic
- Login/logout
- Update clinic information
- Change password
- Enable two-factor authentication
- Add/remove staff members
- View staff activity logs

##### Facility Management
- Manage clinic locations (multi-location support)
- Set operating hours per location
- Add facility amenities (parking, accessibility)
- Upload facility photos
- Update facility description
- Provide equipment/capabilities list
- Set maximum capacity per time slot
- View facility performance metrics

##### Staff Management
- Add staff members (phlebotomists, receptionists)
- Assign roles and permissions to staff
- View staff schedules
- Manage staff availability
- Monitor staff performance
- Deactivate staff accounts
- View staff booking history

##### Booking Management
- View all booking requests
- Accept or decline bookings
- Assign bookings to specific staff
- View booking confirmations
- Track appointment status
- View completed appointments
- Manage walk-in appointments (if allowed)
- Reschedule appointments (with patient consent)
- Generate booking reports

##### Communication
- Communicate with patients via platform
- Send appointment reminders (bulk)
- Notify patients of cancellations
- View conversation history
- Assign messaging to staff members

##### Financial Management
- View clinic earnings dashboard
- Track bookings and revenue by location
- View payment schedule
- Receive earnings summary
- View settlement schedule
- Download financial reports
- View transaction history
- Manage multiple bank accounts
- Export financial data for accounting

##### Compliance & Documentation
- Upload facility accreditations
- Maintain staff certifications list
- View compliance checklist
- Accept platform terms updates
- Generate audit trails
- Maintain service quality standards

##### Analytics & Reporting
- View booking analytics
- Track location performance
- View patient satisfaction scores
- Generate custom reports
- Export data for analysis
- View peak time analytics

### Restrictions
- Cannot modify patient health records
- Cannot access other clinics' data
- Cannot charge outside platform
- Cannot operate without proper licensing
- Cannot discriminate in service provision
- Cannot retain patient personal data longer than allowed

### Data Owned
- Clinic profile and locations
- Staff information
- Operating hours and availability
- Pricing structure
- Bookings assigned to clinic
- Chat messages with patients
- Financial and settlement records

---

### 2C. Clinic Operator / Manager

#### Overview
Individual user managing a laboratory or clinic account.

#### Role Scope
- Sub-role under Laboratory/Clinic account
- Can be multiple per clinic
- Permissions determined by clinic admin
- Typically handles specific functions (scheduling, billing, etc.)

#### Typical Permissions (per clinic admin configuration)
- View clinic dashboard (read-only or edit)
- Manage bookings
- Communicate with patients
- View financial summaries
- Manage staff schedules
- Generate reports
- Cannot modify clinic settings (requires admin)

---

## 3. Admin Roles

Admin users manage the platform, providers, bookings, and business operations. There are multiple admin levels with different responsibilities.

### 3A. Super Admin

#### Overview
Full system access. Typically platform owner or chief technology officer. Usually limited to 1-2 people.

#### Core Responsibilities
- Oversee entire platform
- Manage all system configurations
- Approve major business decisions
- Handle security incidents
- Manage admin user accounts
- Set platform policies
- Review critical operations

#### Permissions

##### Super Admin Panel
- Full access to all admin features
- Cannot be deleted by others
- Can create/delete other admin accounts
- Can modify all admin roles
- Can modify platform settings
- Can view all system data
- Can execute any action

##### System Management
- Configure platform settings
- Manage payment processor integration
- Update business rules and policies
- Configure email templates
- Manage API keys and integrations
- View system health and logs
- Configure feature flags
- Manage system announcements

##### User Management
- Approve/reject all providers
- Manage user accounts
- Deactivate/delete accounts
- View all user data
- Reset user passwords
- Manage user disputes

##### Financial Management
- View all financial data
- Approve settlements
- Process refunds
- View all transactions
- Generate financial reports
- Audit all payments

##### Reporting & Analytics
- Access all analytics
- Generate custom reports
- Export all data
- View system performance metrics
- Review user behavior analytics

### Restrictions
- Cannot perform financial transactions for personal gain
- Cannot violate user privacy
- Cannot modify completed bookings
- Cannot retroactively approve fraudulent accounts

---

### 3B. Operations Admin

#### Overview
Manages day-to-day operations including provider approval, booking management, and customer issues.

#### Core Responsibilities
- Approve/reject provider registrations
- Manage all bookings and disputes
- Handle customer escalations
- Monitor service quality
- Manage user accounts
- Ensure platform compliance
- Report to management on KPIs

#### Permissions

##### Provider Management
- View all provider applications
- Approve/reject providers
- Request additional documentation
- View provider profiles
- Deactivate providers for policy violations
- Send messages to providers
- View provider compliance status
- Monitor provider ratings and reviews

##### Booking Management
- View all bookings across system
- View booking status workflow
- Manually reassign bookings
- Cancel bookings (with reason logging)
- Force confirm pending bookings (if needed)
- Extend cancellation deadlines
- View booking history
- Generate booking reports

##### User Management
- View all user accounts
- Deactivate user accounts
- Reset user passwords
- Manage user complaints
- View user activity logs
- Handle account verification
- Process account deletion requests

##### Dispute Resolution
- View complaints and disputes
- Investigate issues
- Communicate with involved parties
- Approve refunds (within limits)
- Document resolutions
- Escalate to Super Admin if needed

##### Compliance
- Monitor policy violations
- Document incidents
- Generate compliance reports
- Flag suspicious activity
- Manage user blacklists

##### Analytics
- View operational analytics
- Track provider performance
- Monitor booking trends
- View customer satisfaction metrics

### Restrictions
- Cannot modify Super Admin accounts
- Cannot process payments directly
- Cannot change platform settings
- Cannot access financial configurations

---

### 3C. Finance Admin

#### Overview
Manages all financial aspects including payments, settlements, invoices, and refunds.

#### Core Responsibilities
- Process provider settlements
- Manage refunds and chargebacks
- Generate financial reports
- Maintain financial records
- Ensure payment accuracy
- Handle tax documentation
- Audit transactions

#### Permissions

##### Payment Management
- View all payments and transactions
- Track payment status
- View Stripe integration logs
- Process refunds (with documentation)
- Handle payment disputes
- View payment method details (masked)
- Generate payment reports

##### Settlements
- View settlement schedules
- Process provider settlements
- Generate settlement reports
- View payout history
- Track settlement status
- Verify payment receipts

##### Financial Reporting
- Generate revenue reports
- Track income vs. expenses
- Generate provider earning reports
- Create tax documents
- Export financial data
- View financial dashboards
- Generate custom financial reports

##### Invoicing
- Generate invoices for bulk payers
- Track invoice status
- View payment history per invoice
- Generate invoice reports
- Send invoices to customers

##### Audit & Compliance
- View all financial transactions
- Audit payment records
- Check for fraud patterns
- Generate compliance reports
- Track financial anomalies

##### Account Management
- Manage payment method configurations
- Update bank account details
- Configure payout schedules
- Manage payment processor settings
- Set transaction limits

### Restrictions
- Cannot modify user passwords
- Cannot approve/reject providers
- Cannot access user personal data
- Cannot make policy changes
- Cannot execute refunds beyond documented limits

---

### 3D. Support Admin

#### Overview
Manages customer support, chat moderation, reviews, and customer relations.

#### Core Responsibilities
- Monitor customer communications
- Moderate chat messages
- Handle support tickets
- Manage user reviews
- Resolve customer issues
- Maintain professional tone
- Document support interactions

#### Permissions

##### Chat & Messaging
- View all chat conversations (with moderation rights)
- Monitor for inappropriate content
- Delete/flag inappropriate messages
- Temporarily mute users
- Send moderation notices
- Archive conversations
- View message history

##### Reviews & Ratings
- View all reviews and ratings
- Flag inappropriate reviews
- Request review removal (from users)
- Respond to reviews (on behalf of platform)
- View review trends
- Monitor review spam

##### Support Tickets
- View customer complaints
- Respond to support requests
- Escalate to Operations Admin if needed
- Document support interactions
- Track resolution status
- View support history per user

##### User Communication
- Send announcements to users
- Create help content
- Update FAQ section
- View commonly reported issues
- Monitor satisfaction feedback

##### Compliance
- Monitor for terms violations
- Flag suspicious accounts
- Document violations
- Escalate to Operations Admin

##### Analytics
- View support metrics
- Track resolution time
- Monitor chat volume
- View complaint trends
- Generate support reports

### Restrictions
- Cannot modify user data
- Cannot process payments
- Cannot approve providers
- Cannot change platform settings
- Cannot override business decisions
- Cannot access financial data

---

## Role Permission Matrix

### Quick Reference

| Feature | Patient | Phlebotomist | Clinic | Super Admin | Ops Admin | Finance | Support |
|---------|---------|--------------|--------|------------|-----------|---------|---------|
| Register | ✓ | ✓ | ✓ | N/A | N/A | N/A | N/A |
| Book Appointment | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| View Own Bookings | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Approve Providers | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| Process Refunds | ✗ | ✗ | ✗ | ✓ | ✓* | ✓ | ✗ |
| View All Bookings | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Chat Support | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Moderate Content | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| View Analytics | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage Settings | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ |
| View All Payments | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ |

*Ops Admin can approve refunds up to certain limit

---

## Access Control Implementation

### Authentication
All roles require:
- Email/password login
- Two-factor authentication (especially for admin roles)
- Session management with timeouts
- Activity logging

### Authorization
- Role-based access control (RBAC)
- Feature flags per role
- Resource-level permissions
- Action-level permissions
- Time-based access (e.g., Super Admin only during certain hours)

### Audit Trail
- Log all admin actions
- Track data modifications
- Record access to sensitive information
- Monitor unusual activities
- Generate audit reports

---

## Role Onboarding

### New Patient
1. Email verification
2. Complete profile
3. Add primary address
4. Add optional medical info
5. Make first booking

### New Phlebotomist
1. Registration form completion
2. Upload certifications
3. Background check
4. Profile review
5. Approval by Operations Admin
6. Account activation
7. Onboarding tutorial

### New Clinic
1. Registration and facility info
2. Documentation verification
3. Location setup
4. Staff management
5. Pricing configuration
6. Approval by Super Admin
7. Account activation

### New Admin User
1. Created by Super Admin
2. Role assignment
3. Password setup (temporary)
4. Two-factor setup requirement
5. Access grant to specific areas
6. Onboarding and training
7. Activity monitoring during first week

---

## Summary

The BloodAtHome platform supports seven primary user roles with distinct responsibilities and permissions:

1. **Patient**: Books appointments, manages profile, leaves reviews
2. **Phlebotomist**: Provides services, manages availability, views earnings
3. **Clinic/Lab**: Operates facility, manages staff, processes bookings
4. **Super Admin**: Full system control, policy setting, critical decisions
5. **Operations Admin**: Provider approval, booking management, user support
6. **Finance Admin**: Payment processing, settlements, financial reporting
7. **Support Admin**: Customer communication, review moderation, complaint handling

Each role has clear permissions, restrictions, and data ownership to ensure security, compliance, and efficient platform operations.
