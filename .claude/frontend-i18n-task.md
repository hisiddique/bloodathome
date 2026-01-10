# Frontend Internationalization Task

Update the following components to use localization:

## Components to Update:

### 1. `resources/js/components/public-header.tsx`
Replace:
- "Home" → `t('nav.home')`
- "Find a Phlebotomist" → `t('nav.findPhlebotomist')`
- "FAQ" → `t('nav.faq')`
- "My Bookings" → `t('nav.myBookings')`
- "Log in" → `t('nav.login')`
- "Sign up" → `t('nav.signup')`

### 2. `resources/js/components/public-footer.tsx`
Replace:
- Copyright text "© {year} BloodAtHome. All rights reserved." → `t('footer.copyright', { year: new Date().getFullYear() })`
- "Privacy Policy" → `t('footer.privacyPolicy')`
- "Terms of Service" → `t('footer.termsOfService')`
- "About Us" → `t('footer.aboutUs')`
- "Contact Us" → `t('footer.contactUs')`

### 3. `resources/js/components/bottom-nav.tsx`
Replace the labels:
- "Home" → `t('nav.home')`
- "Find" or "Search" → use a short version or add to translations
- "Bookings" → `t('nav.myBookings')`
- "Account" → `t('nav.profile')`

### 4. `resources/js/components/booking/payment.tsx`
Replace:
- "Order Summary" → `t('booking.orderSummary')`
- "Date" → `t('booking.date')`
- "Time" → `t('booking.time')`
- "Service Fee" → `t('booking.serviceFee')`
- "Total" → `t('booking.total')`
- Price displays → `formatCurrency(amount, region)`

## Pattern for each component:
```tsx
import { useTranslation } from 'react-i18next';
import { useRegion } from '@/contexts/region-context';
import { formatCurrency } from '@/lib/format';

export function MyComponent() {
  const { t } = useTranslation();
  const { region } = useRegion();
  
  return <span>{t('key.subkey')}</span>;
}
```

Make sure to verify the build succeeds after changes with `npm run build`.
