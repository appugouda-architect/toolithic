import { CURRENCIES, STATIC_RATES, type ExchangeRates, type NumberSystem, type NumberFormat } from "./types";

const CACHE_KEY = "exchange_rates";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export function getCachedRates(): ExchangeRates | null {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  try {
    const data: ExchangeRates = JSON.parse(cached);
    if (Date.now() - data.timestamp < CACHE_DURATION) {
      return data;
    }
  } catch {}
  return null;
}

export function setCachedRates(rates: ExchangeRates): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
}

export async function fetchExchangeRates(base: string = "USD"): Promise<ExchangeRates> {
  const cached = getCachedRates();
  if (cached && cached.base === base) {
    return cached;
  }

  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${base}`
    );
    if (!response.ok) throw new Error("API fetch failed");
    
    const data = await response.json();
    const rates: ExchangeRates = {
      base: data.base,
      timestamp: Date.now(),
      rates: data.rates,
    };
    setCachedRates(rates);
    return rates;
  } catch {
    return {
      base,
      timestamp: Date.now(),
      rates: STATIC_RATES,
    };
  }
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  if (from === to) return amount;
  
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

export function batchConvert(
  amounts: string,
  from: string,
  to: string,
  rates: Record<string, number>
): { original: string; converted: number; error?: string }[] {
  const lines = amounts.split("\n").filter((l) => l.trim());
  return lines.map((line) => {
    const trimmed = line.trim();
    const num = parseFloat(trimmed.replace(/[^0-9.-]/g, ""));
    if (isNaN(num)) {
      return { original: trimmed, converted: 0, error: "Invalid number" };
    }
    return {
      original: trimmed,
      converted: convertCurrency(num, from, to, rates),
    };
  });
}

export function formatNumber(
  num: number,
  currency: string,
  system: NumberSystem
): string {
  const locales: Record<string, string> = {
    INR: "en-IN",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    JPY: "ja-JP",
    CNY: "zh-CN",
  };
  
  return num.toLocaleString(locales[currency] || "en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: system === "indian" ? 0 : 2,
  });
}

function numberToWordsIndian(num: number): string {
  if (num === 0) return "Zero";
  
  const units = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];
  
  let result = "";
  const crores = Math.floor(num / 10000000);
  const remaining = num % 10000000;
  
  if (crores > 0) {
    result += numberToWordsIndian(crores) + " Crore ";
  }
  
  const lakhs = Math.floor(remaining / 100000);
  const rem1 = remaining % 100000;
  
  if (lakhs > 0) {
    result += numberToWordsIndian(lakhs) + " Lakh ";
  }
  
  const thousands = Math.floor(rem1 / 1000);
  const rem2 = rem1 % 1000;
  
  if (thousands > 0) {
    result += numberToWordsIndian(thousands) + " Thousand ";
  }
  
  if (rem2 >= 100) {
    result += units[Math.floor(rem2 / 100)] + " Hundred ";
    if (rem2 % 100 > 0) {
      result += "and ";
    }
  }
  
  if (rem2 % 100 < 20) {
    result += units[rem2 % 100];
  } else {
    result += tens[Math.floor((rem2 % 100) / 10)] + " " + units[rem2 % 10];
  }
  
  return result.trim();
}

function numberToWordsInternational(num: number): string {
  const units = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];
  
  function convert(n: number): string {
    if (n === 0) return "";
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + units[n % 10] : "");
    if (n < 1000) return units[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 1000000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 1000000000) return convert(Math.floor(n / 1000000)) + " Million" + (n % 1000000 ? " " + convert(n % 1000000) : "");
    return convert(Math.floor(n / 1000000000)) + " Billion" + (n % 1000000000 ? " " + convert(n % 1000000000) : "");
  }
  
  return convert(Math.floor(num));
}

export function numberToWords(num: number, system: NumberSystem): string {
  if (system === "indian") {
    return numberToWordsIndian(num);
  }
  return numberToWordsInternational(num);
}

export function toIndianFormat(num: number): string {
  const str = num.toFixed(0);
  let result = "";
  let counter = 0;
  
  for (let i = str.length - 1; i >= 0; i--) {
    if (counter === 3) {
      result = "," + result;
      counter = 0;
    }
    result = str[i] + result;
    counter++;
  }
  
  const parts = result.split(",");
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    const remaining = parts.slice(0, -1);
    return remaining.join(",") + "," + lastPart;
  }
  
  return result;
}

export function toInternationalFormat(num: number): string {
  return num.toLocaleString("en-US");
}

export function toCompact(num: number, system: NumberSystem): string {
  if (system === "indian") {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + "Cr";
    if (num >= 100000) return (num / 100000).toFixed(1) + "L";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  } else {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function localizeNumber(
  num: number,
  system: NumberSystem,
  format: NumberFormat,
  currency?: string
): string {
  if (format === "words") {
    return numberToWords(num, system);
  }
  
  if (format === "compact") {
    return toCompact(num, system);
  }
  
  if (system === "indian") {
    return toIndianFormat(num);
  }
  
  return toInternationalFormat(num);
}

export function parseLocalizedNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").replace(/₹|¥|€|£|\$/g, "").trim();
  return parseFloat(cleaned) || 0;
}