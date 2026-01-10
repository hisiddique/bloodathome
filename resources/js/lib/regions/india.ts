import { RegionConfig } from './types';

export const indiaRegion: RegionConfig = {
  code: 'IN',
  name: 'India',
  currency: {
    code: 'INR',
    symbol: '₹',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  dateFormat: {
    short: 'dd-MM-yyyy',
    long: 'dd MMMM yyyy',
    time: 'HH:mm',
  },
  phone: {
    countryCode: '+91',
    pattern: /^(?:\+91|0)?[6-9]\d{9}$/,
    placeholder: '98765 43210',
    format: (value: string) => {
      // Remove all non-digit characters
      const digits = value.replace(/\D/g, '');

      // Remove leading 0 or 91
      const normalizedDigits = digits.replace(/^(?:0|91)/, '');

      // Format as Indian mobile: 98765 43210
      if (normalizedDigits.length <= 5) {
        return normalizedDigits;
      } else {
        return `${normalizedDigits.slice(0, 5)} ${normalizedDigits.slice(5, 10)}`;
      }
    },
  },
  address: {
    fields: ['line1', 'line2', 'city', 'state', 'pincode'],
    postalCodeLabel: 'PIN Code',
    postalCodePattern: /^\d{6}$/,
    postalCodePlaceholder: '110001',
  },
  tax: {
    type: 'GST',
    rates: [
      {
        name: 'CGST',
        rate: 0.09,
      },
      {
        name: 'SGST',
        rate: 0.09,
      },
    ],
  },
};
