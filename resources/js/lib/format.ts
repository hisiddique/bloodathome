import { format as dateFnsFormat, parse } from 'date-fns';
import { RegionConfig } from './regions';

/**
 * Format a currency amount according to regional settings
 */
export function formatCurrency(amount: number, region: RegionConfig): string {
  const { currency } = region;

  // Format the number with correct decimal places and separators
  const formattedAmount = amount.toFixed(currency.decimalPlaces)
    .replace('.', currency.decimalSeparator)
    .replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator);

  // Position the symbol
  if (currency.position === 'before') {
    return `${currency.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount}${currency.symbol}`;
  }
}

/**
 * Format a date according to regional settings
 */
export function formatDate(
  date: Date | string | number,
  formatType: 'short' | 'long' | 'time' = 'short',
  region: RegionConfig
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  const formatString = region.dateFormat[formatType];

  return dateFnsFormat(dateObj, formatString);
}

/**
 * Format a phone number according to regional settings
 */
export function formatPhone(phone: string, region: RegionConfig): string {
  if (!phone) return '';
  return region.phone.format(phone);
}

/**
 * Validate a postal code against regional pattern
 */
export function validatePostalCode(code: string, region: RegionConfig): boolean {
  if (!code) return false;
  return region.address.postalCodePattern.test(code.trim());
}

/**
 * Validate a phone number against regional pattern
 */
export function validatePhone(phone: string, region: RegionConfig): boolean {
  if (!phone) return false;
  return region.phone.pattern.test(phone.trim());
}

/**
 * Parse a date string using regional format
 */
export function parseDate(
  dateString: string,
  formatType: 'short' | 'long' | 'time' = 'short',
  region: RegionConfig
): Date {
  const formatString = region.dateFormat[formatType];
  return parse(dateString, formatString, new Date());
}

/**
 * Calculate tax amount based on regional tax rates
 */
export function calculateTax(amount: number, region: RegionConfig): number {
  const totalRate = region.tax.rates.reduce((sum, rate) => sum + rate.rate, 0);
  return amount * totalRate;
}

/**
 * Calculate total with tax included
 */
export function calculateTotalWithTax(amount: number, region: RegionConfig): number {
  return amount + calculateTax(amount, region);
}

/**
 * Format tax display (e.g., "VAT (20%)" or "GST (CGST 9% + SGST 9%)")
 */
export function formatTaxLabel(region: RegionConfig): string {
  const { tax } = region;

  if (tax.rates.length === 1) {
    const percentage = (tax.rates[0].rate * 100).toFixed(0);
    return `${tax.type} (${percentage}%)`;
  } else {
    const rateLabels = tax.rates.map(rate => {
      const percentage = (rate.rate * 100).toFixed(0);
      return `${rate.name} ${percentage}%`;
    }).join(' + ');
    return `${tax.type} (${rateLabels})`;
  }
}
