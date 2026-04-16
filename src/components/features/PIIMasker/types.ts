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

/**
 * Patterns ordered by PRIORITY — lower index wins when matches overlap.
 * Most specific structural patterns come first; broad fallbacks last.
 */
export const PII_PATTERNS: PIIPattern[] = [
  // ── 0: Email ──────────────────────────────────────────────────────────────
  {
    name: "Email",
    type: "EMAIL",
    regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    replacement: (_, i) => `[EMAIL_${i + 1}]`,
  },

  // ── 1: Credit Card (4×4 digits with space/dash) ───────────────────────────
  {
    name: "Credit Card",
    type: "CREDIT_CARD",
    regex: /\b\d{4}[\s\-]\d{4}[\s\-]\d{4}[\s\-]\d{4}\b/g,
    replacement: (_, i) => `[CREDIT_CARD_${i + 1}]`,
  },

  // ── 2: Aadhaar (XXXX XXXX XXXX, first digit [2-9]) ────────────────────────
  {
    name: "Aadhaar",
    type: "AADHAR",
    regex: /\b[2-9]\d{3}\s\d{4}\s\d{4}\b/g,
    replacement: (_, i) => `[AADHAR_${i + 1}]`,
  },

  // ── 3: PAN Card (ABCDE1234F — 5 letters + 4 digits + 1 letter) ────────────
  {
    name: "PAN",
    type: "PAN",
    regex: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    replacement: (_, i) => `[PAN_${i + 1}]`,
  },

  // ── 4: SSN (XXX-XX-XXXX) ──────────────────────────────────────────────────
  {
    name: "SSN",
    type: "SSN",
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: (_, i) => `[SSN_${i + 1}]`,
  },

  // ── 5: Passport (1–2 uppercase letters + 6–9 digits) ─────────────────────
  {
    name: "Passport",
    type: "PASSPORT",
    regex: /\b[A-Z]{1,2}\d{6,9}\b/g,
    replacement: (_, i) => `[PASSPORT_${i + 1}]`,
  },

  // ── 6: IP Address (validated octets 0–255) ───────────────────────────────
  {
    name: "IP Address",
    type: "IP_ADDRESS",
    regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    replacement: (_, i) => `[IP_ADDRESS_${i + 1}]`,
  },

  // ── 7: Geolocation (keyword + coordinate pair) ───────────────────────────
  {
    name: "Geolocation",
    type: "GEOLOCATION",
    regex: /(?:geolocation|coordinates?|lat(?:itude)?|lon(?:gitude)?|gps)[:\s\-]*-?\d{1,3}\.\d+°?\s*[NSns]?,?\s*-?\d{1,3}\.\d+°?\s*[EWew]?\b/gi,
    replacement: (_, i) => `[GEOLOCATION_${i + 1}]`,
  },

  // ── 8: Phone — Indian mobile with separators ([6-9]XX-XXX-XXXX) ──────────
  {
    name: "Phone",
    type: "PHONE",
    regex: /(?:\+91[-.\s]?)?\b[6-9]\d{2}[-.\s]\d{3}[-.\s]\d{4}\b/g,
    replacement: (_, i) => `[PHONE_${i + 1}]`,
  },

  // ── 9: Phone — International E.164 (+XX XXX XXXX XXXX) ───────────────────
  {
    name: "Phone",
    type: "PHONE",
    regex: /\+\d{1,3}[-.\s]\d{2,4}[-.\s]\d{3,4}[-.\s]?\d{3,4}\b/g,
    replacement: (_, i) => `[PHONE_${i + 1}]`,
  },

  // ── 10: Driver's License (keyword-based) ─────────────────────────────────
  {
    name: "Driver License",
    type: "DRIVER_LICENSE",
    regex: /(?:driver'?s?\s+licen[sc]e|driving\s+licen[sc]e|dl\s+no)[:\s\-]*[A-Z0-9\-]{6,20}\b/gi,
    replacement: (_, i) => `[DRIVER_LICENSE_${i + 1}]`,
  },

  // ── 11: Employee ID (keyword-based) ──────────────────────────────────────
  {
    name: "Employee ID",
    type: "EMPLOYEE_ID",
    regex: /(?:employee\s+id|emp(?:\.|loyee)?\s*id|staff\s+id)[:\s\-]*[A-Z0-9\-]{4,15}\b/gi,
    replacement: (_, i) => `[EMPLOYEE_ID_${i + 1}]`,
  },

  // ── 12: Medical Record (keyword-based) ───────────────────────────────────
  {
    name: "Medical Record",
    type: "MEDICAL_RECORD",
    regex: /(?:medical\s+record(?:\s+(?:no|id|number))?|patient\s+id|mrn)[:\s\-]*[A-Z0-9\-]{4,15}\b/gi,
    replacement: (_, i) => `[MEDICAL_RECORD_${i + 1}]`,
  },

  // ── 13: Biometric (keyword-based) ────────────────────────────────────────
  {
    name: "Biometric",
    type: "BIOMETRIC",
    regex: /(?:fingerprint|face\s+recognition|retina\s+scan|biometric\s+(?:id|data))[:\s\-]*[A-Z0-9\-]{4,20}\b/gi,
    replacement: (_, i) => `[BIOMETRIC_${i + 1}]`,
  },

  // ── 14: Device ID (keyword-based: "device id", "IMEI", "serial no") ───────
  {
    name: "Device ID",
    type: "DEVICE_ID",
    regex: /(?:device\s+(?:id|identifier)|imei|serial\s+(?:no|number))[:\s\-]*[A-Z0-9\-]{4,20}\b/gi,
    replacement: (_, i) => `[DEVICE_ID_${i + 1}]`,
  },

  // ── 15: Standalone prefixed Device IDs (ID-xxxxx, DEV-xxxxx, IMEI-xxxxx) ──
  {
    name: "Device ID",
    type: "DEVICE_ID",
    regex: /\b(?:DEV|DEVICE|IMEI|MAC|UUID|UID|SN|SRL|ID)-[A-Z0-9]{4,20}\b/gi,
    replacement: (_, i) => `[DEVICE_ID_${i + 1}]`,
  },

  // ── 16: Standalone EMP- / MR- / FP- / FR- prefixes ───────────────────────
  {
    name: "Employee ID",
    type: "EMPLOYEE_ID",
    regex: /\bEMP-\d{4,10}\b/gi,
    replacement: (_, i) => `[EMPLOYEE_ID_${i + 1}]`,
  },
  {
    name: "Medical Record",
    type: "MEDICAL_RECORD",
    regex: /\bMR-\d{6,9}\b/g,
    replacement: (_, i) => `[MEDICAL_RECORD_${i + 1}]`,
  },
  {
    name: "Biometric",
    type: "BIOMETRIC",
    regex: /\b(?:FP|FR)-\d{6,9}\b/g,
    replacement: (_, i) => `[BIOMETRIC_${i + 1}]`,
  },

  // ── 19: Date of Birth ─────────────────────────────────────────────────────
  {
    name: "Date of Birth",
    type: "DOB",
    regex: /\b(?:\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/gi,
    replacement: (_, i) => `[DOB_${i + 1}]`,
  },

  // ── 20: Mother's Maiden Name ──────────────────────────────────────────────
  {
    name: "Mother's Maiden Name",
    type: "MOTHER_MAIDEN_NAME",
    regex: /\bmother'?s?\s+(?:maiden|last)\s+name[:\s]+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/gi,
    replacement: (_, i) => `[MOTHER_MAIDEN_NAME_${i + 1}]`,
  },

  // ── 21: Place of Birth ────────────────────────────────────────────────────
  {
    name: "Place of Birth",
    type: "POB",
    regex: /\b(?:born\s+in|place\s+of\s+birth|birthplace)[:\s]+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/gi,
    replacement: (_, i) => `[POB_${i + 1}]`,
  },

  // ── 22: Full Name (≥2 words, each ≥3 chars, capitalised) ─────────────────
  // Requires min 2 chars of lowercase per word to avoid false positives ("My Credit")
  {
    name: "Full Name",
    type: "NAME",
    regex: /\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})+\b/g,
    replacement: (_, i) => `[NAME_${i + 1}]`,
  },

  // ── 23: Address — keyword context (covers Indian addresses like "5th block …") ─
  {
    name: "Address",
    type: "ADDRESS",
    regex: /(?:address|addr|residence|residing\s+at|lives?\s+at)[:\s,]+[^\n.;]{5,150}/gi,
    replacement: (_, i) => `[ADDRESS_${i + 1}]`,
  },

  // ── 24: Mailing Address — US street types ────────────────────────────────
  {
    name: "Mailing Address",
    type: "ADDRESS",
    regex: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl|Circle|Cir)\.?\b/gi,
    replacement: (_, i) => `[ADDRESS_${i + 1}]`,
  },

  // ── 25: City, State (US format) ───────────────────────────────────────────
  {
    name: "City, State",
    type: "CITY_STATE",
    regex: /\b[A-Z][a-z]+,\s+[A-Z]{2}\b/g,
    replacement: (_, i) => `[CITY_STATE_${i + 1}]`,
  },

  // ── 26: ZIP / PIN Code (keyword context only — avoids masking random numbers) ─
  {
    name: "ZIP / PIN Code",
    type: "ZIP_CODE",
    regex: /(?:zip|pin|postal)\s*(?:code)?[:\s]*\d{5,6}\b/gi,
    replacement: (_, i) => `[ZIP_CODE_${i + 1}]`,
  },

  // ── 27: Credit Card raw (16 contiguous digits) ───────────────────────────
  {
    name: "Credit Card",
    type: "CREDIT_CARD",
    regex: /\b\d{16}\b/g,
    replacement: (_, i) => `[CREDIT_CARD_${i + 1}]`,
  },

  // ── 28: Aadhaar raw (12 contiguous digits, first digit [2-9]) ────────────
  {
    name: "Aadhaar",
    type: "AADHAR",
    regex: /\b[2-9]\d{11}\b/g,
    replacement: (_, i) => `[AADHAR_${i + 1}]`,
  },

  // ── 29: Phone raw (10-digit Indian: starts [6-9]) ────────────────────────
  {
    name: "Phone",
    type: "PHONE",
    regex: /\b[6-9]\d{9}\b/g,
    replacement: (_, i) => `[PHONE_${i + 1}]`,
  },

  // ── 30: Bank Account / generic long number (9–18 digits) — lowest priority ─
  {
    name: "Bank Account",
    type: "BANK_ACCOUNT",
    regex: /\b\d{9,18}\b/g,
    replacement: (_, i) => `[BANK_ACCOUNT_${i + 1}]`,
  },
];
