import type { CalculationStep, CalculationType, ParsedQuery } from "./types";

const numberWords: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, thousand: 1000, lakh: 100000, lac: 100000, crore: 10000000,
};

const currencySymbols: Record<string, string> = {
  "₹": "INR", "rs": "INR", "rupee": "INR", "rupees": "INR",
  "$": "USD", "dollar": "USD", "dollars": "USD",
  "£": "GBP", "pound": "GBP",
  "€": "EUR", "euro": "EUR",
};

function extractNumber(text: string): number | null {
  const cleaned = text.toLowerCase().trim();
  
  const inrMatch = cleaned.match(/(?:₹|rs\.?)\s*([\d,]+(?:\.\d+)?)/);
  if (inrMatch) {
    return parseFloat(inrMatch[1].replace(/,/g, ""));
  }
  
  const dollarMatch = cleaned.match(/\$\s*([\d,]+(?:\.\d+)?)/);
  if (dollarMatch) {
    return parseFloat(dollarMatch[1].replace(/,/g, ""));
  }
  
  const numMatch = cleaned.match(/([\d,]+(?:\.\d+)?)/);
  if (numMatch) {
    return parseFloat(numMatch[1].replace(/,/g, ""));
  }
  
  return null;
}

function parseNumberWord(text: string): number | null {
  const words = text.toLowerCase().trim().split(/\s+/);
  let total = 0;
  let current = 0;
  
  for (const word of words) {
    if (numberWords[word] !== undefined) {
      const val = numberWords[word];
      if (val >= 100) {
        if (current === 0) current = val;
        else current *= val;
      } else {
        current += val;
      }
    }
  }
  
  if (current > 0) total = current;
  return total > 0 ? total : null;
}

function extractPercentage(text: string): number | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? parseFloat(match[1]) : null;
}

function extractDays(text: string): number | null {
  const match = text.match(/(\d+)\s*(day|week|month|year)s?/i);
  if (!match) return null;
  const num = parseInt(match[1]);
  const period = match[2].toLowerCase();
  if (period === "week") return num * 7;
  if (period === "month") return num * 30;
  if (period === "year") return num * 365;
  return num;
}

function extractMonths(text: string): number | null {
  const match = text.match(/(\d+)\s*(month|year|yr)s?/i);
  if (match) {
    const num = parseInt(match[1]);
    const period = match[2].toLowerCase();
    if (period === "year" || period === "yr") return num * 12;
    return num;
  }
  return null;
}

function getCurrency(text: string): string {
  for (const [symbol, currency] of Object.entries(currencySymbols)) {
    if (text.toLowerCase().includes(symbol)) {
      return currency;
    }
  }
  return "INR";
}

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    INR: "₹", USD: "$", GBP: "£", EUR: "€",
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function parseQuery(query: string): ParsedQuery {
  const lower = query.toLowerCase();
  let type: CalculationType = "simple";
  const values: Record<string, number> = {};
  const rawValues: Record<string, string> = {};
  
  const num = extractNumber(query);
  if (num) {
    values.amount = num;
    rawValues.amount = num.toString();
  }
  
  const percent = extractPercentage(query);
  if (percent) {
    values.percent = percent;
    rawValues.percent = percent.toString();
  }
  
  const amount = extractNumber(query);
  const partsSplit = query.toLowerCase().split(/among\s*(\d+)|split\s*(\d+)|divide\s*(\d+)/);
  if (partsSplit[1] || partsSplit[2]) {
    type = "split";
    values.splitCount = parseInt(partsSplit[1] || partsSplit[2]);
    rawValues.splitCount = partsSplit[1] || partsSplit[2];
  }
  
  if (lower.includes("gst")) {
    type = "gst";
    if (!values.percent) {
      values.percent = 18;
      rawValues.percent = "18";
    }
  } else if (lower.includes("tax") || lower.includes("after tax")) {
    type = "tax";
    if (!values.percent) {
      const taxMatch = lower.match(/(\d+(?:\.\d+)?)\s*%/);
      values.percent = taxMatch ? parseFloat(taxMatch[1]) : 30;
      rawValues.percent = values.percent.toString();
    }
  } else if (lower.includes("emi")) {
    type = "emi";
    const principal = extractNumber(query);
    if (principal) values.principal = principal;
    const rate = extractPercentage(query);
    if (rate) values.rate = rate;
    else {
      values.rate = 8;
      rawValues.rate = "8";
    }
    const months = extractMonths(query);
    values.termMonths = months || 12;
  } else if (lower.includes("interest") || lower.includes("rate")) {
    type = "interest";
    const principal = extractNumber(query);
    if (principal) values.principal = principal;
    const rate = extractPercentage(query);
    if (rate) values.rate = rate;
    else {
      values.rate = 5;
      rawValues.rate = "5";
    }
    const years = extractDays(query);
    values.termYears = years ? years / 365 : 1;
  } else if (lower.includes("discount")) {
    type = "discount";
  } else if (lower.includes("profit") || lower.includes("loss")) {
    type = "profit_loss";
  } else if (lower.includes("%")) {
    type = "percentage";
  }
  
  return { type, values, rawValues, remaining: query };
}

export function calculate(query: string): { query: string; breakdown: CalculationStep[]; finalAnswer: string; formattedAnswer: string } {
  const parsed = parseQuery(query);
  const { type, values } = parsed;
  const breakdown: CalculationStep[] = [];
  
  let result = 0;
  let formattedResult = "";
  const currency = getCurrency(query);
  
  const amount = values.amount || 0;
  const percent = values.percent || 0;
  
  switch (type) {
    case "percentage": {
      const base = amount || percent;
      const ofValue = values.amount || parsed.values.amount;
      if (base && ofValue) {
        const calcValue = (ofValue * base) / 100;
        breakdown.push({
          description: `${base}% of ${formatCurrency(ofValue, currency)}`,
          formula: `${base}% × ${ofValue}`,
          values: { base, ofValue },
          result: calcValue,
        });
        result = calcValue;
        formattedResult = formatCurrency(result, currency);
      }
      break;
    }
    
    case "gst": {
      const baseAmount = amount;
      const gstAmount = (baseAmount * percent) / 100;
      const totalAmount = baseAmount + gstAmount;
      breakdown.push({
        description: `Base amount`,
        formula: baseAmount.toString(),
        values: { baseAmount },
        result: baseAmount,
      });
      breakdown.push({
        description: `GST (${percent}%)`,
        formula: `${baseAmount} × ${percent}%`,
        values: { baseAmount, gstPercent: percent },
        result: gstAmount,
      });
      breakdown.push({
        description: `Total with GST`,
        formula: `${baseAmount} + ${gstAmount.toFixed(2)}`,
        values: { baseAmount, gstAmount },
        result: totalAmount,
      });
      result = totalAmount;
      formattedResult = formatCurrency(result, currency);
      break;
    }
    
    case "tax": {
      const grossAmount = amount;
      const taxAmount = (grossAmount * percent) / 100;
      const netAmount = grossAmount - taxAmount;
      breakdown.push({
        description: `Gross amount`,
        formula: grossAmount.toString(),
        values: { grossAmount },
        result: grossAmount,
      });
      breakdown.push({
        description: `Tax (${percent}%)`,
        formula: `${grossAmount} × ${percent}%`,
        values: { grossAmount, taxPercent: percent },
        result: taxAmount,
      });
      breakdown.push({
        description: `Amount after tax`,
        formula: `${grossAmount} - ${taxAmount.toFixed(2)}`,
        values: { grossAmount, taxAmount },
        result: netAmount,
      });
      result = netAmount;
      formattedResult = formatCurrency(result, currency);
      break;
    }
    
    case "split": {
      const splitAmount = amount / values.splitCount;
      const perPerson = splitAmount;
      breakdown.push({
        description: `Split ${formatCurrency(amount, currency)} among ${values.splitCount}`,
        formula: `${amount} ÷ ${values.splitCount}`,
        values: { amount, splitCount: values.splitCount },
        result: perPerson,
      });
      if (percent > 0) {
        const totalWithGST = perPerson + (perPerson * percent / 100);
        breakdown.push({
          description: `Each with ${percent}% GST`,
          formula: `${perPerson.toFixed(2)} × (1 + ${percent}%)`,
          values: { perPerson, gstPercent: percent },
          result: totalWithGST,
        });
        result = totalWithGST;
      } else {
        result = perPerson;
      }
      formattedResult = formatCurrency(result, currency);
      break;
    }
    
    case "emi": {
      const principal = values.principal || amount;
      const annualRate = values.rate || 8;
      const monthlyRate = annualRate / 12 / 100;
      const months = values.termMonths || 12;
      
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                 (Math.pow(1 + monthlyRate, months) - 1);
      
      breakdown.push({
        description: `Principal amount`,
        formula: principal.toString(),
        values: { principal },
        result: principal,
      });
      breakdown.push({
        description: `Interest rate (${annualRate}% p.a.)`,
        formula: `${annualRate}% per annum`,
        values: { rate: annualRate },
        result: annualRate,
      });
      breakdown.push({
        description: `EMI for ${months} months`,
        formula: `P × r × (1+r)^n / ((1+r)^n - 1)`,
        values: { principal, monthlyRate, months },
        result: emi,
      });
      result = emi;
      formattedResult = `${formatCurrency(result, currency)}/month`;
      break;
    }
    
    case "interest": {
      const principal = values.principal || amount;
      const rate = values.rate || 5;
      const years = values.termYears || 1;
      
      const simpleInterest = (principal * rate * years) / 100;
      const totalAmount = principal + simpleInterest;
      
      breakdown.push({
        description: `Principal`,
        formula: principal.toString(),
        values: { principal },
        result: principal,
      });
      breakdown.push({
        description: `Simple Interest (${rate}% for ${years} year)`,
        formula: `(P × R × T) / 100`,
        values: { principal, rate, years },
        result: simpleInterest,
      });
      breakdown.push({
        description: `Total after interest`,
        formula: `${principal} + ${simpleInterest.toFixed(2)}`,
        values: { principal, simpleInterest },
        result: totalAmount,
      });
      result = totalAmount;
      formattedResult = formatCurrency(result, currency);
      break;
    }
    
    case "discount": {
      const discountAmount = (amount * percent) / 100;
      const finalPrice = amount - discountAmount;
      breakdown.push({
        description: `Original price`,
        formula: amount.toString(),
        values: { amount },
        result: amount,
      });
      breakdown.push({
        description: `Discount (${percent}%)`,
        formula: `${amount} × ${percent}%`,
        values: { amount, discountPercent: percent },
        result: discountAmount,
      });
      breakdown.push({
        description: `Final price`,
        formula: `${amount} - ${discountAmount.toFixed(2)}`,
        values: { amount, discountAmount },
        result: finalPrice,
      });
      result = finalPrice;
      formattedResult = formatCurrency(result, currency);
      break;
    }
    
    case "profit_loss": {
      const costPrice = amount;
      const sellMatch = query.toLowerCase().match(/selling[:\s]+([\d,]+)/);
      const sellingPrice = sellMatch ? parseFloat(sellMatch[1].replace(/,/g, "")) : 0;
      const profit = sellingPrice - costPrice;
      const profitPercent = sellingPrice > 0 ? (profit / costPrice) * 100 : 0;
      
      if (sellingPrice > 0) {
        breakdown.push({
          description: `Cost price`,
          formula: costPrice.toString(),
          values: { costPrice },
          result: costPrice,
        });
        breakdown.push({
          description: `Selling price`,
          formula: sellingPrice.toString(),
          values: { sellingPrice },
          result: sellingPrice,
        });
        breakdown.push({
          description: profit >= 0 ? `Profit` : `Loss`,
          formula: `${sellingPrice} - ${costPrice}`,
          values: { costPrice, sellingPrice },
          result: Math.abs(profit),
        });
        result = profit;
        formattedResult = `${formatCurrency(Math.abs(profit), currency)} (${Math.abs(profitPercent).toFixed(1)}%)`;
      }
      break;
    }
    
    default: {
      if (amount && percent) {
        const calcResult = (amount * percent) / 100;
        breakdown.push({
          description: `${percent}% of ${formatCurrency(amount, currency)}`,
          formula: `${percent}% × ${amount}`,
          values: { percent, amount },
          result: calcResult,
        });
        result = calcResult;
        formattedResult = formatCurrency(result, currency);
      }
      break;
    }
  }
  
  return {
    query,
    breakdown,
    finalAnswer: formattedResult || formatCurrency(result, currency),
    formattedAnswer: formattedResult || formatCurrency(result, currency),
  };
}