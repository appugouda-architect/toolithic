export interface ExchangeRates {
  base: string;
  timestamp: number;
  rates: Record<string, number>;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  countries: string[];
}

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", countries: ["US", "CA", "AU"] },
  { code: "INR", name: "Indian Rupee", symbol: "₹", countries: ["IN"] },
  { code: "EUR", name: "Euro", symbol: "€", countries: ["DE", "FR", "IT", "ES"] },
  { code: "GBP", name: "British Pound", symbol: "£", countries: ["GB"] },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", countries: ["JP"] },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", countries: ["CN"] },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", countries: ["AU"] },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", countries: ["CA"] },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", countries: ["SG"] },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", countries: ["AE"] },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", countries: ["SA"] },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", countries: ["PK"] },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", countries: ["BD"] },
  { code: "NPR", name: "Nepalese Rupee", symbol: "₨", countries: ["NP"] },
];

export const STATIC_RATES: Record<string, number> = {
  USD: 1,
  INR: 83.12,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  AUD: 1.53,
  CAD: 1.36,
  SGD: 1.34,
  AED: 3.67,
  SAR: 3.75,
  PKR: 278.50,
  BDT: 109.50,
  NPR: 83.12,
};

export type NumberSystem = "international" | "indian";
export type NumberFormat = "numeric" | "words" | "compact";

export interface LocaleConfig {
  system: NumberSystem;
  format: NumberFormat;
  currency: string;
}

export const INDIAN_UNITS = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];

export const INDIEN_TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

export const INDIAN_SCALES = ["", "Thousand", "Lakh", "Crore", "Arab", "Kharab"];