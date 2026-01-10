import { RegionConfig } from './types';

export const ukRegion: RegionConfig = {
  code: 'GB',
  name: 'United Kingdom',
  currency: {
    code: 'GBP',
    symbol: '£',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  dateFormat: {
    short: 'dd/MM/yyyy',
    long: 'dd MMMM yyyy',
    time: 'HH:mm',
  },
  phone: {
    countryCode: '+44',
    pattern: /^(?:0|\+44)\s?(?:\d\s?){9,10}$/,
    placeholder: '07123 456789',
    format: (value: string) => {
      // Remove all non-digit characters
      const digits = value.replace(/\D/g, '');

      // Remove leading 0 or 44
      const normalizedDigits = digits.replace(/^(?:0|44)/, '');

      // Format as UK mobile: 07123 456789
      if (normalizedDigits.length <= 5) {
        return `0${normalizedDigits}`;
      } else if (normalizedDigits.length <= 9) {
        return `0${normalizedDigits.slice(0, 4)} ${normalizedDigits.slice(4)}`;
      } else {
        return `0${normalizedDigits.slice(0, 4)} ${normalizedDigits.slice(4, 10)}`;
      }
    },
  },
  address: {
    fields: ['line1', 'line2', 'city', 'county', 'postcode'],
    postalCodeLabel: 'Postcode',
    postalCodePattern: /^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i,
    postalCodePlaceholder: 'SW1A 1AA',
  },
  tax: {
    type: 'VAT',
    rates: [
      {
        name: 'Standard Rate',
        rate: 0.20,
      },
    ],
  },
};
