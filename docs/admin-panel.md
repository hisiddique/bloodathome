# Admin Panel Documentation

## Overview

This document describes the FilamentPHP admin panel architecture for BloodAtHome, including the resources, dashboard layout, navigation structure, and key features.

## Technology Stack

- **Framework**: FilamentPHP v3+ (Laravel admin package)
- **Database**: Laravel Eloquent ORM
- **Authentication**: Laravel Fortify (integrated with FilamentPHP)
- **UI Framework**: Tailwind CSS (FilamentPHP default)
- **Authorization**: Laravel Gates and Policies

## Project Structure

```
app/Filament/
├── Resources/
│   ├── UserResource.php                 Patient management
│   ├── ProviderResource.php             Phlebotomist/Clinic management
│   ├── BookingResource.php              Booking management
│   ├── BloodTestResource.php            Test catalog management
│   ├── TestCategoryResource.php         Test categories
│   ├── PaymentResource.php              Payment records
│   ├── SettlementResource.php           Provider payouts
│   ├── QualificationResource.php        Certifications
│   ├── ChatMessageResource.php          Message moderation
│   ├── AuditLogResource.php             System audit trail
│   ├── PromoCodeResource.php            Discount codes
│   ├── LocationResource.php             Lab/clinic locations
│   └── [Future Resources]
├── Pages/
│   ├── Dashboard.php                    Admin dashboard
│   ├── [Custom Pages]
└── Widgets/
    ├── StatsOverviewWidget.php
    ├── BookingsChartWidget.php
    ├── RevenueChartWidget.php
    ├── PendingApprovalsWidget.php
    ├── RecentBookingsWidget.php
    └── TopProvidersWidget.php
```

## Admin Dashboard

### Dashboard Layout

The main dashboard provides at-a-glance metrics and quick actions.

#### Stats Overview Section

```
Dashboard / Overview

┌─────────────────────────────────────────────────────────────┐
│                     ADMIN DASHBOARD                         │
└─────────────────────────────────────────────────────────────┘

KEY METRICS (4 Cards)
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Users  │ Active       │ Bookings     │ Pending      │
│              │ Providers    │ Today        │ Approvals    │
│ 2,345        │ 456          │ 89           │ 12           │
│ ↑ 12% MTD    │ ↑ 8% MTD     │ ↓ 3% YTD     │ ↑ 24% new    │
└──────────────┴──────────────┴──────────────┴──────────────┘

RECENT ACTIVITY & ALERTS
┌─────────────────────────────────────────────────────────────┐
│ ⚠ 5 High-priority issues flagged                           │
│ ✓ 23 New provider applications received                    │
│ ℹ Payment processor integrated successfully                │
│ ⚠ 2 Pending settlements (>30 days old)                    │
└─────────────────────────────────────────────────────────────┘
```

#### Widget Components

**1. Stats Overview Widget**
- Total users registered
- Active providers count
- Bookings created this month
- Pending provider approvals
- Revenue this month
- Cancellation rate
- System health status

**2. Bookings Chart Widget**
- Line chart: Bookings over time (7/30/90 days toggle)
- Show trends
- Identify seasonal patterns
- Compare with previous period

**3. Revenue Chart Widget**
- Bar chart: Revenue by source
- Revenue by provider
- Payment method breakdown
- Profit margin visualization

**4. Pending Approvals Widget**
- List of unapproved providers
- Quick approve/reject buttons
- Incomplete application indicators
- Time since application submitted
- "View Full Application" link

**5. Recent Bookings Widget**
- Latest 10 bookings
- Status badges
- Patient/Provider names
- Booking date/time
- Amount
- "View Details" link

**6. Top Providers Widget**
- Top 5 providers by:
  - Bookings count
  - Rating average
  - Revenue generated
- Sortable by metric
- Last activity date

---

## Admin Panel Navigation

### Main Navigation Structure

```
ADMIN PANEL (/admin)
│
├── Dashboard
│   └── Overview, metrics, alerts
│
├── User Management
│   ├── Patients
│   │   ├── List view (searchable, filterable)
│   │   ├── Create new patient
│   │   ├── Edit patient details
│   │   ├── View patient bookings
│   │   ├── Deactivate/reactivate
│   │   └── Export data
│   │
│   └── Providers
│       ├── Pending Approvals (sub-section)
│       │   ├── List applications
│       │   ├── View full profile
│       │   ├── Review documents
│       │   ├── Approve/reject with notes
│       │   └── Request additional info
│       │
│       ├── Active Providers
│       │   ├── List with status badges
│       │   ├── Search by name/location
│       │   ├── View profile & documents
│       │   ├── Edit provider details
│       │   ├── View associated bookings
│       │   ├── Manage availability
│       │   ├── Update pricing
│       │   └── Compliance status
│       │
│       └── Deactivated Providers
│           ├── List reasons for deactivation
│           ├── View deactivation date
│           └── Reactivate option
│
├── Bookings
│   ├── All Bookings (with advanced filters)
│   │   ├── Search by booking ID
│   │   ├── Filter by date range
│   │   ├── Filter by status
│   │   ├── Filter by provider
│   │   ├── Filter by patient
│   │   ├── Bulk export
│   │   └── Sort by date/status/amount
│   │
│   ├── Pending Confirmation
│   │   ├── Awaiting patient/provider action
│   │   ├── Auto-reminder sent count
│   │   └── Manual reminder action
│   │
│   ├── Confirmed Bookings
│   │   ├── Upcoming appointments
│   │   ├── Today's appointments
│   │   ├── Overdue appointments
│   │   └── Reschedule option
│   │
│   ├── Completed
│   │   ├── List by date range
│   │   ├── View completion details
│   │   └── View associated reviews
│   │
│   └── Cancelled
│       ├── List cancellations
│       ├── Cancellation reason
│       ├── Refund status
│       └── Timeline view
│
├── Catalog Management
│   ├── Blood Tests
│   │   ├── List all tests
│   │   ├── Create new test
│   │   ├── Edit test details
│   │   ├── Manage pricing
│   │   ├── Set requirements/restrictions
│   │   ├── Assign categories
│   │   ├── View booking stats
│   │   └── Enable/disable tests
│   │
│   ├── Test Categories
│   │   ├── List categories
│   │   ├── Create/edit categories
│   │   ├── Set category display order
│   │   ├── View tests in category
│   │   └── Manage descriptions
│   │
│   └── Locations
│       ├── List all clinic locations
│       ├── Create new location
│       ├── Edit location details
│       ├── Manage operating hours
│       ├── Set capacity limits
│       └── View location bookings
│
├── Finance
│   ├── Payments
│   │   ├── View all transactions
│   │   ├── Filter by date/status
│   │   ├── Search by transaction ID
│   │   ├── View payment method (masked)
│   │   ├── Download receipt
│   │   ├── View refund history
│   │   ├── Process refund
│   │   └── Export transaction report
│   │
│   ├── Settlements
│   │   ├── View settlement schedule
│   │   ├── List pending settlements
│   │   ├── Approve settlement payout
│   │   ├── View settlement details
│   │   ├── Download settlement report
│   │   ├── View provider payout history
│   │   ├── Dispute settlement (flag for review)
│   │   └── Manual settlement (special)
│   │
│   ├── Invoices
│   │   ├── List all invoices
│   │   ├── Create bulk invoice
│   │   ├── Download/email invoice
│   │   ├── Track invoice payment
│   │   ├── Manage payment terms
│   │   └── Generate reports
│   │
│   └── Financial Reports
│       ├── Revenue by period
│       ├── Provider earnings report
│       ├── Payment method breakdown
│       ├── Refund analysis
│       ├── Tax documentation
│       └── Custom report builder
│
├── Compliance
│   ├── Qualifications
│   │   ├── List all certifications
│   │   ├── View by provider
│   │   ├── Filter by type/status
│   │   ├── Mark as verified
│   │   ├── Set expiry alerts
│   │   ├── Flag expired certs
│   │   ├── View verification history
│   │   └── Download cert copies
│   │
│   ├── Incident Reports
│   │   ├── List reported incidents
│   │   ├── Filter by severity
│   │   ├── View incident details
│   │   ├── Create investigation
│   │   ├── Document resolution
│   │   └── Archive incidents
│   │
│   └── Compliance Checklist
│       ├── Platform requirements
│       ├── Provider standards
│       ├── Data protection compliance
│       ├── Service quality standards
│       └── Escalation procedures
│
├── Support
│   ├── Chat Messages
│   │   ├── View conversation threads
│   │   ├── Search messages
│   │   ├── Filter by date/user
│   │   ├── Flag inappropriate content
│   │   ├── Delete/archive messages
│   │   ├── Send admin response
│   │   ├── View moderation log
│   │   └── Mute users (temporary/permanent)
│   │
│   ├── Complaints
│   │   ├── List open complaints
│   │   ├── Priority flagging
│   │   ├── View complaint details
│   │   ├── Assign to staff
│   │   ├── Document resolution
│   │   ├── Send response to user
│   │   └── Close complaint
│   │
│   ├── Reviews & Ratings
│   │   ├── View all reviews
│   │   ├── Filter by rating
│   │   ├── Flag inappropriate reviews
│   │   ├── Request review removal
│   │   ├── Admin response option
│   │   ├── View review trends
│   │   └── Fraud detection
│   │
│   └── Feedback
│       ├── View user feedback submissions
│       ├── Categorize feedback
│       ├── Prioritize features
│       └── Track implementation status
│
└── System
    ├── Audit Logs
    │   ├── View all system actions
    │   ├── Filter by admin user
    │   ├── Filter by resource type
    │   ├── Filter by action type
    │   ├── View change details
    │   ├── Timestamp verification
    │   ├── Generate audit report
    │   └── Export logs (compliance)
    │
    ├── Settings
    │   ├── Platform Configuration
    │   │   ├── Site name/branding
    │   │   ├── Contact information
    │   │   ├── Timezone settings
    │   │   └── Logo/favicon management
    │   │
    │   ├── Payment Configuration
    │   │   ├── Stripe API keys
    │   │   ├── Fee structure
    │   │   ├── Settlement frequency
    │   │   └── Payment method options
    │   │
    │   ├── Email Configuration
    │   │   ├── SMTP settings
    │   │   ├── Email templates
    │   │   ├── Notification settings
    │   │   └── Test email sender
    │   │
    │   ├── Feature Flags
    │   │   ├── Enable/disable features
    │   │   ├── Beta features
    │   │   ├── Maintenance mode
    │   │   └── A/B testing options
    │   │
    │   ├── API Configuration
    │   │   ├── API key management
    │   │   ├── Rate limiting
    │   │   ├── Webhook configuration
    │   │   └── Integration logs
    │   │
    │   └── Security Settings
    │       ├── 2FA requirement level
    │       ├── Password policy
    │       ├── Session timeout
    │       └── IP whitelist management
    │
    └── System Health
        ├── Database status
        ├── API health check
        ├── Queue status
        ├── Disk space
        ├── Error logs
        └── Performance metrics
```

---

## Resource Details

### 1. UserResource (Patient Management)

**List View Features:**
```
Columns:
- Name (searchable)
- Email (searchable)
- Phone
- Registration Date
- Total Bookings
- Account Status (Active/Inactive)
- Last Login

Filters:
- Registration Date Range
- Account Status
- Total Bookings (range)
- Last Login (recently active)

Bulk Actions:
- Export selected users
- Deactivate accounts
- Send notification
- Merge duplicate accounts
```

**Edit Actions:**
```
- Update profile information
- View all bookings
- View payment history
- Deactivate/reactivate account
- Send message/notification
- Reset password
- View activity log
- Download user data (GDPR)
- Delete account (with confirmation)
```

---

### 2. ProviderResource (Phlebotomist Management)

**List View Features:**
```
Columns:
- Name
- Type (Individual/Clinic)
- Location/Service Area
- Status (Pending/Active/Deactivated)
- Average Rating
- Total Bookings
- Join Date

Filters:
- Status (Pending/Active/Deactivated)
- Type (Individual/Clinic)
- Location
- Rating (range)
- Join Date (range)
- Compliance Status

Bulk Actions:
- Export selected providers
- Approve/reject (for pending)
- Send announcement
- Deactivate accounts
- Request documentation
```

**Edit Actions:**
```
- View full profile
- Update provider information
- Upload/manage certifications
- Set service area
- Manage pricing
- View availability calendar
- View associated bookings (list)
- View earnings/settlements
- Send message
- View reviews from patients
- Approve/reject (if pending)
- Deactivate/reactivate
- View compliance status
- Export provider data
```

**Approval Workflow (Pending Tab):**
```
Show:
- Application completeness %
- Missing documents
- Qualifications status
- Background check status
- Service area coverage
- Pricing review

Actions:
- Request more information (modal)
- Schedule verification call
- Approve with notes
- Reject with reason
- Extend deadline
- View application timeline
```

---

### 3. BookingResource (Booking Management)

**List View Features:**
```
Columns:
- Booking ID (searchable)
- Patient Name
- Provider Name
- Date/Time
- Test Type(s)
- Amount
- Status (badge)
- Created Date

Filters:
- Date Range
- Status (Pending/Confirmed/Completed/Cancelled)
- Provider
- Test Type
- Minimum Amount
- Maximum Amount

Bulk Actions:
- Export bookings
- Send reminders
- Cancel bookings (with reason)
- Reschedule (bulk)
```

**Edit Actions:**
```
- View booking details
- View patient information
- View provider information
- View payment information
- View chat history
- Reschedule appointment
- Cancel booking (with reason)
- Manually confirm
- Mark as completed
- View cancellation policy
- Generate receipt
- Process refund (if applicable)
```

**Status Workflow:**
```
Timeline view showing:
- Created timestamp
- Confirmed timestamp
- Completion timestamp
- All state changes
- Associated actions
```

---

### 4. BloodTestResource (Test Catalog)

**List View Features:**
```
Columns:
- Test Name
- Category
- Price (base)
- Booking Count (MTD)
- Status (Active/Inactive)
- Fasting Required (Y/N)
- Preparation Notes

Filters:
- Category
- Price Range
- Status
- Fasting Required
- Popular (top performers)
```

**Edit Actions:**
```
- Update test details
- Manage pricing (provider-specific)
- Set requirements/restrictions
- Add preparation instructions
- Enable/disable test
- View booking history
- View performance stats
- Export usage data
```

---

### 5. PaymentResource (Payment Records)

**List View Features:**
```
Columns:
- Transaction ID (searchable)
- Booking ID
- Amount
- Status (Completed/Pending/Failed)
- Payment Date
- Refund Status
- Payment Method (masked)

Filters:
- Date Range
- Status
- Amount Range
- Payment Method
- Refund Status
- Provider (linked)
- Patient (linked)

Bulk Actions:
- Export transactions
- Filter by status
- Generate report
```

**Edit Actions:**
```
- View transaction details
- View receipt
- Initiate refund
- View refund status
- View Stripe logs
- Download invoice
- View dispute details (if flagged)
```

---

### 6. SettlementResource (Provider Payouts)

**List View Features:**
```
Columns:
- Settlement ID
- Provider Name
- Period (e.g., "Jan 1-31, 2025")
- Amount
- Status (Pending/Processed)
- Scheduled Payout Date
- Actual Payout Date

Filters:
- Provider
- Status
- Date Range
- Amount Range
- Settlement Period
```

**Edit Actions:**
```
- View settlement details
- Itemized breakdown (bookings)
- View deductions
- Approve payout (if pending)
- Process payout
- View payout history
- Dispute settlement
- Download settlement report
```

---

### 7. QualificationResource (Provider Certifications)

**List View Features:**
```
Columns:
- Provider Name
- Certification Type
- Issue Date
- Expiry Date
- Status (Valid/Expiring/Expired)
- Verified (Yes/No)
- Document

Filters:
- Provider
- Certification Type
- Status
- Expiry Date (within X days)
- Verified Status

Bulk Actions:
- Mark as verified (bulk)
- Flag expiring (bulk)
- Request renewal
```

**Edit Actions:**
```
- View certificate
- Verify certification
- Set expiry alert
- Request renewal notification
- Mark as expired
- Add verification notes
- Update certification date
```

---

### 8. ChatMessageResource (Message Moderation)

**List View Features:**
```
Columns:
- From/To
- Message (truncated)
- Date/Time
- Status (Approved/Flagged/Deleted)
- Conversation ID

Filters:
- Date Range
- User
- Status
- Conversation ID
- Search message content

Bulk Actions:
- Delete messages
- Flag messages
- Clear conversation
```

**Edit Actions:**
```
- View full conversation
- View both parties
- Approve flagged message
- Delete message (with notification)
- Warn user
- Mute user
- Ban user (escalation)
```

---

### 9. AuditLogResource (System Audit)

**List View Features:**
```
Columns:
- Timestamp
- Admin User
- Action
- Resource Type
- Resource ID
- Details

Filters:
- Date Range
- Admin User
- Action Type
- Resource Type
- Severity

Bulk Actions:
- Export logs
- Generate audit report
```

**View Actions:**
```
- View complete record
- View before/after (if changed)
- View IP address (if logged)
- View user agent
- Filter related actions
```

---

## Admin Features & Workflows

### 1. Provider Approval Workflow

**Step 1: Application Review**
1. Admin navigates to Providers → Pending Approvals
2. Views application with documents
3. Checks compliance checklist
4. Reviews qualifications
5. Verifies service area

**Step 2: Assessment**
- Request additional info (via modal)
- Schedule verification call
- Wait for provider response
- Review updated documents

**Step 3: Approval Decision**
- **Approve**: Auto-send welcome email, activate account
- **Reject**: Send rejection reason, archive application
- **Request Changes**: Set deadline for response

**Step 4: Post-Approval**
- Provider receives activation email
- Can set availability
- Appears in patient search
- Auto-enrolled in onboarding

---

### 2. Booking Dispute Resolution

**Escalation Workflow:**
```
Patient/Provider Reports Issue
    ↓
Support team reviews chat history
    ↓
Operations Admin receives escalation
    ↓
View booking details & timeline
    ↓
Request additional info from both parties
    ↓
Decision: Refund / Rebook / No Action
    ↓
Document resolution
    ↓
Finance admin processes if needed
```

---

### 3. Provider Compliance Monitoring

**Automated Alerts:**
- Certification expiring soon
- Low rating detected
- High cancellation rate
- Patient complaints (repeated)
- Policy violations

**Manual Reviews:**
- Quarterly compliance check
- Annual recertification
- Service quality audit
- Financial reconciliation

---

## Dashboard Customization

### Role-Based Dashboards

**Super Admin Dashboard:**
- System health overview
- All metrics
- Critical alerts
- Financial summary
- User growth chart

**Operations Admin Dashboard:**
- Booking metrics
- Provider approvals queue
- Complaints/disputes
- Today's appointments
- Cancellations

**Finance Admin Dashboard:**
- Revenue chart
- Settlement queue
- Payment failures
- Refund activity
- Tax documentation status

**Support Admin Dashboard:**
- Chat volume
- Complaint queue
- Flagged messages
- User satisfaction scores
- Trending issues

---

## Search & Filtering

### Global Search

**Searches across:**
- Booking IDs
- User names/emails
- Provider names
- Transaction IDs
- Invoice numbers

**Advanced Filters:**
- Date ranges
- Status combinations
- Amount ranges
- Multiple criteria
- Saved filter presets

---

## Bulk Actions

**Common Bulk Operations:**
```
Export (CSV/Excel):
- Selected records
- All filtered records
- Entire resource

Send Notifications:
- Email to selected users
- SMS (if available)
- In-app notification

Status Changes:
- Activate/deactivate
- Approve/reject
- Mark as reviewed
```

---

## Reporting

### Pre-built Reports

1. **Monthly Revenue Report**
   - Total revenue
   - By provider
   - By test type
   - By payment method

2. **Provider Performance Report**
   - Bookings per provider
   - Average rating
   - Earnings
   - Cancellation rate
   - Patient feedback summary

3. **Financial Report**
   - Revenue vs. expenses
   - Settlement summary
   - Refunds issued
   - Tax documentation

4. **Compliance Report**
   - Expired certifications
   - Outstanding approvals
   - Incident reports
   - Policy violations

5. **User Report**
   - New registrations
   - Active users
   - Retention rate
   - Geographic distribution

### Custom Report Builder
- Select metrics
- Choose date range
- Apply filters
- Generate and export

---

## Authentication & Security

### Admin Login
```
1. Email/password
2. Two-factor authentication (required)
3. IP whitelist (optional, for Super Admin)
4. Session timeout (30 minutes default)
5. Activity logging
```

### Permissions Enforcement
- All actions logged in audit trail
- Sensitive operations require confirmation
- Batch operations limited by role
- Data exports watermarked/logged
- API keys rotated regularly

---

## Implementation Checklist

### Phase 1: Core Resources
- [ ] UserResource
- [ ] ProviderResource
- [ ] BookingResource
- [ ] Dashboard & widgets

### Phase 2: Financial Management
- [ ] PaymentResource
- [ ] SettlementResource
- [ ] Financial reporting

### Phase 3: Compliance & Support
- [ ] QualificationResource
- [ ] ChatMessageResource
- [ ] AuditLogResource
- [ ] Incident management

### Phase 4: Enhancement
- [ ] Advanced analytics
- [ ] Custom reports
- [ ] Automation rules
- [ ] API management

---

## Summary

The FilamentPHP admin panel provides comprehensive management tools for:
- User and provider management
- Booking administration
- Financial operations
- Compliance monitoring
- Customer support

With role-based access control, detailed audit trails, and powerful filtering/reporting capabilities, admins can efficiently manage all aspects of the BloodAtHome platform.
