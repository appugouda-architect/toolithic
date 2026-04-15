export interface PIIMapping {
  id: string;
  type: string;
  original: string;
  masked: string;
}

export interface PIIPattern {
  name: string;
  type: string;
  regex: RegExp;
  replacement: (match: string, index: number) => string;
}

export const PII_PATTERNS: PIIPattern[] = [
  // Keyword-based patterns first (most specific, context-aware)
  {
    name: "Driver License",
    type: "DRIVER_LICENSE",
    regex: /(?:driver'?s?\s+license|dl|driver\s+licence)[:\s-]*[A-Z]{0,2}-?DL-?\d{5,8}\b/gi,
    replacement: (match, index) => `[DRIVER_LICENSE_${index + 1}]`,
  },
  {
    name: "Employee ID",
    type: "EMPLOYEE_ID",
    regex: /(?:employee\s+id|emp\s+id|staff\s+id|empid)[:\s-]*[A-Z]{0,3}-?\d{4,10}\b/gi,
    replacement: (match, index) => `[EMPLOYEE_ID_${index + 1}]`,
  },
  {
    name: "Mother Maiden Name",
    type: "MOTHER_MAIDEN_NAME",
    regex: /(?:mother'?s?\s+maiden\s+name|mother'?s?\s+last\s+name)[:\s]+[A-Z][a-zA-Z']+\b/gi,
    replacement: (match, index) => `[MOTHER_MAIDEN_NAME_${index + 1}]`,
  },
  {
    name: "Medical Record",
    type: "MEDICAL_RECORD",
    regex: /(?:medical\s+record|medical\s+record\s+id|patient\s+id|mrn)[:\s-]*[A-Z]{0,2}-?\d{4,12}\b/gi,
    replacement: (match, index) => `[MEDICAL_RECORD_${index + 1}]`,
  },
  {
    name: "Biometric",
    type: "BIOMETRIC",
    regex: /(?:fingerprint|face\s+recognition|retina\s+scan|biometric)[:\s-]*(?:fp|fr)?-?\d{4,12}\b/gi,
    replacement: (match, index) => `[BIOMETRIC_${index + 1}]`,
  },
  {
    name: "Device ID",
    type: "DEVICE_ID",
    regex: /(?:device\s+id|device\s+identifier|imei|serial\s+(?:no|number))[:\s-]*[A-Z]{0,3}-?[A-F0-9]{6,20}\b/gi,
    replacement: (match, index) => `[DEVICE_ID_${index + 1}]`,
  },
  {
    name: "Geolocation",
    type: "GEOLOCATION",
    regex: /(?:geolocation|coordinates?|lat|long|gps)[:\s-]*-?\d{1,3}\.\d+°?\s*[NSns]?,?\s*-?\d{1,3}\.\d+°?\s*[EWew]\b/gi,
    replacement: (match, index) => `[GEOLOCATION_${index + 1}]`,
  },
  // Email - specific format with @ and domain
  {
    name: "Email",
    type: "EMAIL",
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: (match, index) => `[EMAIL_${index + 1}]`,
  },
  // Format-specific numeric patterns
  // Phone - 10 digits: XXX-XXX-XXXX or (XXX) XXX-XXXX or XXXXXXXXXX (10 digits total)
  {
    name: "Phone",
    type: "PHONE",
    regex: /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g,
    replacement: (match, index) => `[PHONE_${index + 1}]`,
  },
  // Credit Card - 16 digits with separators: XXXX XXXX XXXX XXXX or XXXX-XXXX-XXXX-XXXX
  {
    name: "Credit Card",
    type: "CREDIT_CARD",
    regex: /\b\d{4}[\s-]\d{4}[\s-]\d{4}[\s-]\d{4}\b/g,
    replacement: (match, index) => `[CREDIT_CARD_${index + 1}]`,
  },
  // Aadhar - 12 digits with space: XXXX XXXX XXXX (no leading 0 or 1)
  {
    name: "Aadhar",
    type: "AADHAR",
    regex: /\b[2-9]\d{3}\s\d{4}\s\d{4}\b/g,
    replacement: (match, index) => `[AADHAR_${index + 1}]`,
  },
  // PAN - 10 alphanumeric: ABCDE1234F (5 letters + 4 digits + 1 letter)
  {
    name: "PAN",
    type: "PAN",
    regex: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    replacement: (match, index) => `[PAN_${index + 1}]`,
  },
  // Passport - letters followed by 6-9 digits
  {
    name: "Passport",
    type: "PASSPORT",
    regex: /\b[A-Z]{1,2}\d{6,9}\b/g,
    replacement: (match, index) => `[PASSPORT_${index + 1}]`,
  },
  // SSN - XXX-XX-XXXX format (exactly)
  {
    name: "SSN",
    type: "SSN",
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: (match, index) => `[SSN_${index + 1}]`,
  },
  // IP Address - XXX.XXX.XXX.XXX format
  {
    name: "IP Address",
    type: "IP_ADDRESS",
    regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    replacement: (match, index) => `[IP_ADDRESS_${index + 1}]`,
  },
  // Zip Code - 5 digits or 5+4 format
  {
    name: "Zip Code",
    type: "ZIP_CODE",
    regex: /\b\d{5}(?:-\d{4})?\b/g,
    replacement: (match, index) => `[ZIP_CODE_${index + 1}]`,
  },
  // Mailing Address with street types
  {
    name: "Mailing Address",
    type: "ADDRESS",
    regex: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl|Circle|Cir)\.?\b/gi,
    replacement: (match, index) => `[ADDRESS_${index + 1}]`,
  },
  // City, State format
  {
    name: "City State",
    type: "CITY_STATE",
    regex: /\b[A-Z][a-z]+,\s+[A-Z]{2}\b/g,
    replacement: (match, index) => `[CITY_STATE_${index + 1}]`,
  },
  // Full Name - two or more capitalized words
  {
    name: "Full Name",
    type: "NAME",
    regex: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g,
    replacement: (match, index) => `[NAME_${index + 1}]`,
  },
  // Date of Birth
  {
    name: "Date of Birth",
    type: "DOB",
    regex: /\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b)\b/gi,
    replacement: (match, index) => `[DOB_${index + 1}]`,
  },
  {
    name: "Place of Birth",
    type: "POB",
    regex: /\b(?:born in|place of birth|birthplace)[:\s]+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/gi,
    replacement: (match, index) => `[POB_${index + 1}]`,
  },
  // Standalone prefixed IDs
  {
    name: "Standalone Device ID",
    type: "DEVICE_ID",
    regex: /\bDEV-[A-F0-9]{8,15}\b/gi,
    replacement: (match, index) => `[DEVICE_ID_${index + 1}]`,
  },
  {
    name: "Standalone Biometric FP",
    type: "BIOMETRIC",
    regex: /\bFP-\d{6,9}\b/g,
    replacement: (match, index) => `[BIOMETRIC_${index + 1}]`,
  },
  {
    name: "Standalone Biometric FR",
    type: "BIOMETRIC",
    regex: /\bFR-\d{6,9}\b/g,
    replacement: (match, index) => `[BIOMETRIC_${index + 1}]`,
  },
  {
    name: "Standalone Medical Record",
    type: "MEDICAL_RECORD",
    regex: /\bMR-\d{6,9}\b/g,
    replacement: (match, index) => `[MEDICAL_RECORD_${index + 1}]`,
  },
  {
    name: "Standalone Employee ID",
    type: "EMPLOYEE_ID",
    regex: /\bEMP-\d{4,10}\b/g,
    replacement: (match, index) => `[EMPLOYEE_ID_${index + 1}]`,
  },
  // Raw numeric sequences (fallback - more specific)
  // Credit Card raw 16 digits (no separators)
  {
    name: "Credit Card Raw",
    type: "CREDIT_CARD",
    regex: /\b\d{16}\b/g,
    replacement: (match, index) => `[CREDIT_CARD_${index + 1}]`,
  },
  // Bank Account - 8-17 digits (avoid phone/credit card patterns by checking context)
  {
    name: "Bank Account",
    type: "BANK_ACCOUNT",
    regex: /\b\d{8,17}\b/g,
    replacement: (match, index) => `[BANK_ACCOUNT_${index + 1}]`,
  },
  // Aadhar raw 12 digits (no separator, doesn't start with 0 or 1)
  {
    name: "Aadhar Raw",
    type: "AADHAR",
    regex: /\b[2-9]\d{11}\b/g,
    replacement: (match, index) => `[AADHAR_${index + 1}]`,
  },
  // Phone raw 10 digits (standalone, not part of larger number)
  {
    name: "Phone Raw",
    type: "PHONE",
    regex: /(?<!\d)\d{10}(?!\d)/g,
    replacement: (match, index) => `[PHONE_${index + 1}]`,
  },
];