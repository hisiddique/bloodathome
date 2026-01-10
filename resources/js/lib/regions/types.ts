export interface TaxRate {
  name: string;
  rate: number;
}

export interface RegionConfig {
  code: string;
  name: string;
  currency: {
    code: string;
    symbol: string;
    position: 'before' | 'after';
    decimalPlaces: number;
    thousandsSeparator: string;
    decimalSeparator: string;
  };
  dateFormat: {
    short: string;
    long: string;
    time: string;
  };
  phone: {
    countryCode: string;
    pattern: RegExp;
    placeholder: string;
    format: (value: string) => string;
  };
  address: {
    fields: string[];
    postalCodeLabel: string;
    postalCodePattern: RegExp;
    postalCodePlaceholder: string;
  };
  tax: {
    type: string;
    rates: TaxRate[];
  };
}
