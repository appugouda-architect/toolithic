export type Country = "GLOBAL" | "IN" | "US" | "EU" | "CCPA";

export interface CountryConfig {
  code: Country;
  label: string;
  regulation: string;
  note: string;
  highlight: string[]; // regulation tags to highlight in mapping table
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: "GLOBAL",
    label: "Global",
    regulation: "All Regulations",
    note: "Masks all common PII types worldwide.",
    highlight: ["GDPR", "CCPA", "DPDP", "HIPAA", "PCI-DSS"],
  },
  {
    code: "IN",
    label: "India (DPDP)",
    regulation: "DPDP Act 2023",
    note: "India Digital Personal Data Protection Act — Aadhaar, PAN, Indian identifiers.",
    highlight: ["DPDP"],
  },
  {
    code: "US",
    label: "United States (HIPAA)",
    regulation: "HIPAA / CCPA",
    note: "HIPAA & CCPA — SSN, US phone numbers, health & financial identifiers.",
    highlight: ["HIPAA", "CCPA"],
  },
  {
    code: "EU",
    label: "European Union (GDPR)",
    regulation: "GDPR",
    note: "GDPR Art. 4 — Names, emails, IPs, device IDs, location data, biometrics.",
    highlight: ["GDPR"],
  },
  {
    code: "CCPA",
    label: "California (CCPA)",
    regulation: "CCPA",
    note: "CCPA — Geolocation, biometrics, employment info, browsing history.",
    highlight: ["CCPA"],
  },
];

export interface PIIMapping {
  id: string;
  type: string;
  original: string;
  masked: string;
  regulations: string[];
}

export interface PIIPattern {
  name: string;
  type: string;
  regex: RegExp;
  replacement: (match: string, index: number) => string;
  regulations: string[];
}

/**
 * Patterns ordered by PRIORITY — lower index wins when matches overlap.
 * Most specific structural patterns first; broad fallbacks last.
 */
export const PII_PATTERNS: PIIPattern[] = [
  // ── 0: Email ──────────────────────────────────────────────────────────────
  {
    name: "Email",
    type: "EMAIL",
    regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    replacement: (_, i) => `[EMAIL_${i + 1}]`,
    regulations: ["GDPR", "CCPA", "DPDP", "HIPAA"],
  },

  // ── 1: Credit Card (4×4 digits with space/dash) ───────────────────────────
  {
    name: "Credit Card",
    type: "CREDIT_CARD",
    regex: /\b\d{4}[\s\-]\d{4}[\s\-]\d{4}[\s\-]\d{4}\b/g,
    replacement: (_, i) => `[CREDIT_CARD_${i + 1}]`,
    regulations: ["CCPA", "DPDP", "PCI-DSS"],
  },

  // ── 2: Aadhaar keyword-based (any starting digit) ────────────────────────
  {
    name: "Aadhaar",
    type: "AADHAR",
    regex: /(?:aadhaar?|aadhar|uid(?:ai)?)[:\s"]*\d{4}[\s\-]?\d{4}[\s\-]?\d{4}/gi,
    replacement: (_, i) => `[AADHAR_${i + 1}]`,
    regulations: ["DPDP"],
  },

  // ── 3: Aadhaar structural (XXXX XXXX XXXX with spaces, first digit [1-9]) ─
  {
    name: "Aadhaar",
    type: "AADHAR",
    regex: /\b[1-9]\d{3}\s\d{4}\s\d{4}\b/g,
    replacement: (_, i) => `[AADHAR_${i + 1}]`,
    regulations: ["DPDP"],
  },

  // ── 4: PAN Card (ABCDE1234F — 5 uppercase + 4 digits + 1 uppercase) ───────
  {
    name: "PAN",
    type: "PAN",
    regex: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    replacement: (_, i) => `[PAN_${i + 1}]`,
    regulations: ["DPDP"],
  },

  // ── 5: SSN (XXX-XX-XXXX) ──────────────────────────────────────────────────
  {
    name: "SSN",
    type: "SSN",
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: (_, i) => `[SSN_${i + 1}]`,
    regulations: ["HIPAA", "CCPA"],
  },

  // ── 6: Passport (1–2 uppercase letters + 6–9 digits) ─────────────────────
  {
    name: "Passport",
    type: "PASSPORT",
    regex: /\b[A-Z]{1,2}\d{6,9}\b/g,
    replacement: (_, i) => `[PASSPORT_${i + 1}]`,
    regulations: ["GDPR", "DPDP"],
  },

  // ── 7: IP Address (validated octets 0–255) ───────────────────────────────
  {
    name: "IP Address",
    type: "IP_ADDRESS",
    regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    replacement: (_, i) => `[IP_ADDRESS_${i + 1}]`,
    regulations: ["GDPR", "CCPA"],
  },

  // ── 8: Geolocation (keyword + coordinate pair) ───────────────────────────
  {
    name: "Geolocation",
    type: "GEOLOCATION",
    regex: /(?:geolocation|coordinates?|lat(?:itude)?|lon(?:gitude)?|gps)[:\s\-]*-?\d{1,3}\.\d+°?\s*[NSns]?,?\s*-?\d{1,3}\.\d+°?\s*[EWew]?\b/gi,
    replacement: (_, i) => `[GEOLOCATION_${i + 1}]`,
    regulations: ["GDPR", "CCPA"],
  },

  // ── 9: Indian international phone (+91 XXXXXXXXXX) ───────────────────────
  {
    name: "Phone",
    type: "PHONE",
    regex: /\+91[-.\s]?[6-9]\d{9}/g,
    replacement: (_, i) => `[PHONE_${i + 1}]`,
    regulations: ["GDPR", "CCPA", "DPDP"],
  },

  // ── 10: Indian mobile with separators ([6-9]XX-XXX-XXXX) ─────────────────
  {
    name: "Phone",
    type: "PHONE",
    regex: /\b[6-9]\d{2}[-.\s]\d{3}[-.\s]\d{4}\b/g,
    replacement: (_, i) => `[PHONE_${i + 1}]`,
    regulations: ["GDPR", "CCPA", "DPDP"],
  },

  // ── 11: US phone (123) 456-7890 / 123-456-7890 ───────────────────────────
  {
    name: "Phone",
    type: "PHONE",
    regex: /\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g,
    replacement: (_, i) => `[PHONE_${i + 1}]`,
    regulations: ["GDPR", "CCPA", "HIPAA"],
  },

  // ── 12: International E.164 multi-segment (+33 6 12 34 56 78, etc.) ───────
  {
    name: "Phone",
    type: "PHONE",
    regex: /\+\d{1,3}(?:[-.\s]\d{1,4}){3,7}\b/g,
    replacement: (_, i) => `[PHONE_${i + 1}]`,
    regulations: ["GDPR", "CCPA"],
  },

  // ── 13: Driver's License (keyword-based) ─────────────────────────────────
  {
    name: "Driver License",
    type: "DRIVER_LICENSE",
    regex: /(?:driver'?s?\s+licen[sc]e|driving\s+licen[sc]e|dl\s+no)[:\s\-]*[A-Z0-9\-]{6,20}\b/gi,
    replacement: (_, i) => `[DRIVER_LICENSE_${i + 1}]`,
    regulations: ["GDPR", "CCPA", "HIPAA"],
  },

  // ── 14: Employee ID — keyword (handles "employee_id", "Employee ID", etc.) ─
  {
    name: "Employee ID",
    type: "EMPLOYEE_ID",
    regex: /(?:employee[_\s]id|emp(?:\.|loyee)?[_\s]id|staff[_\s]id)[:\s\-"]*[A-Z0-9\-]{3,15}\b/gi,
    replacement: (_, i) => `[EMPLOYEE_ID_${i + 1}]`,
    regulations: ["GDPR", "CCPA"],
  },

  // ── 15: Medical Record (keyword-based) ───────────────────────────────────
  {
    name: "Medical Record",
    type: "MEDICAL_RECORD",
    regex: /(?:medical\s+record(?:\s+(?:no|id|number))?|patient\s+id|mrn)[:\s\-]*[A-Z0-9\-]{4,15}\b/gi,
    replacement: (_, i) => `[MEDICAL_RECORD_${i + 1}]`,
    regulations: ["HIPAA", "GDPR"],
  },

  // ── 16: Biometric (keyword-based) ────────────────────────────────────────
  {
    name: "Biometric",
    type: "BIOMETRIC",
    regex: /(?:fingerprint|face\s+recognition|retina\s+scan|biometric\s+(?:id|data))[:\s\-]*[A-Z0-9\-]{4,20}\b/gi,
    replacement: (_, i) => `[BIOMETRIC_${i + 1}]`,
    regulations: ["GDPR", "CCPA"],
  },

  // ── 17: Device Fingerprint (keyword + hex hash) ───────────────────────────
  {
    name: "Device Fingerprint",
    type: "DEVICE_FINGERPRINT",
    regex: /(?:device\s+fingerprint|fingerprint|device\s+hash)[:\s"]*[a-fA-F0-9]{12,64}\b/gi,
    replacement: (_, i) => `[DEVICE_FINGERPRINT_${i + 1}]`,
    regulations: ["GDPR", "CCPA"],
  },

  // ── 18: Auth / API Token (keyword-based) ─────────────────────────────────
  {
    name: "Auth Token",
    type: "AUTH_TOKEN",
    regex: /(?:auth[_\s]?token|api[_\s]?key|secret[_\s]?key|access[_\s]?token|bearer)[:\s"]*[\w.\-]{8,80}\b/gi,
    replacement: (_, i) => `[AUTH_TOKEN_${i + 1}]`,
    regulations: ["GDPR", "CCPA"],
  },

  // ── 19: API Token prefix pattern (sk_test_..., pk_live_..., etc.) ─────────
  {
    name: "API Token",
    type: "AUTH_TOKEN",
    regex: /\b(?:sk|pk|rk|tok)_(?:test|live|prod|secret|public)?_?[\w]{10,80}\b/g,
    replacement: (_, i) => `[AUTH_TOKEN_${i + 1}]`,
    regulations: ["GDPR", "CCPA"],
  },

  // ── 20: Device ID (keyword: "device id", "IMEI", "serial no") ────────────
  {
    name: "Device ID",
    type: "DEVICE_ID",
    regex: /(?:device\s+(?:id|identifier)|imei|serial\s+(?:no|number))[:\s\-]*[A-Z0-9\-]{4,20}\b/gi,
    replacement: (_, i) => `[DEVICE_ID_${i + 1}]`,
    regulations: ["GDPR", "CCPA"],
  },

  // ── 21: Standalone prefixed Device IDs (ID-xxxxx, DEV-xxxxx, etc.) ────────
  {
    name: "Device ID",
    type: "DEVICE_ID",
    regex: /\b(?:DEV|DEVICE|IMEI|MAC|UUID|UID|SN|SRL|ID)-[A-Z0-9]{4,20}\b/gi,
    replacement: (_, i) => `[DEVICE_ID_${i + 1}]`,
    regulations: ["GDPR", "CCPA"],
  },

  // ── 22: Standalone EMP-xxxxx ─────────────────────────────────────────────
  {
    name: "Employee ID",
    type: "EMPLOYEE_ID",
    regex: /\bEMP[-]?\d{3,10}\b/gi,
    replacement: (_, i) => `[EMPLOYEE_ID_${i + 1}]`,
    regulations: ["GDPR", "CCPA"],
  },

  // ── 23: MR- / FP- / FR- standalone ───────────────────────────────────────
  {
    name: "Medical Record",
    type: "MEDICAL_RECORD",
    regex: /\bMR-\d{6,9}\b/g,
    replacement: (_, i) => `[MEDICAL_RECORD_${i + 1}]`,
    regulations: ["HIPAA", "GDPR"],
  },
  {
    name: "Biometric",
    type: "BIOMETRIC",
    regex: /\b(?:FP|FR)-\d{6,9}\b/g,
    replacement: (_, i) => `[BIOMETRIC_${i + 1}]`,
    regulations: ["GDPR", "CCPA"],
  },

  // ── 25: Date of Birth ─────────────────────────────────────────────────────
  {
    name: "Date of Birth",
    type: "DOB",
    regex: /\b(?:\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/gi,
    replacement: (_, i) => `[DOB_${i + 1}]`,
    regulations: ["GDPR", "CCPA", "HIPAA"],
  },

  // ── 26: Mother's Maiden Name ──────────────────────────────────────────────
  {
    name: "Mother's Maiden Name",
    type: "MOTHER_MAIDEN_NAME",
    regex: /\bmother'?s?\s+(?:maiden|last)\s+name[:\s]+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/gi,
    replacement: (_, i) => `[MOTHER_MAIDEN_NAME_${i + 1}]`,
    regulations: ["GDPR", "CCPA", "DPDP"],
  },

  // ── 27: Place of Birth ────────────────────────────────────────────────────
  {
    name: "Place of Birth",
    type: "POB",
    regex: /\b(?:born\s+in|place\s+of\s+birth|birthplace)[:\s]+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/gi,
    replacement: (_, i) => `[POB_${i + 1}]`,
    regulations: ["GDPR", "DPDP"],
  },

  // ── 28: Full Name — ≥2 words, ≥3 chars each; not followed by colon (label guard) ─
  {
    name: "Full Name",
    type: "NAME",
    // [^\S\n]+ = whitespace except newlines → prevents crossing line boundaries
    // (?!\s*:) = not a "Label: Value" pattern
    regex: /\b[A-Z][a-z]{2,}(?:[^\S\n]+[A-Z][a-z]{2,})+\b(?!\s*:)/g,
    replacement: (_, i) => `[NAME_${i + 1}]`,
    regulations: ["GDPR", "CCPA", "DPDP", "HIPAA"],
  },

  // ── 29: Address — keyword context (covers JSON "address": "...", Indian addresses) ─
  {
    name: "Address",
    type: "ADDRESS",
    // [:\s,"]+ handles both plain "address: ..." and JSON "address": "..."
    regex: /(?:address|addr|residence|location|residing\s+at|lives?\s+at)[:\s,"]+[^"\n.;]{5,150}/gi,
    replacement: (_, i) => `[ADDRESS_${i + 1}]`,
    regulations: ["GDPR", "CCPA", "DPDP"],
  },

  // ── 30: Mailing Address (US street types) ────────────────────────────────
  {
    name: "Mailing Address",
    type: "ADDRESS",
    regex: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl|Circle|Cir)\.?\b/gi,
    replacement: (_, i) => `[ADDRESS_${i + 1}]`,
    regulations: ["GDPR", "CCPA"],
  },

  // ── 31: City, State (US format) ───────────────────────────────────────────
  {
    name: "City, State",
    type: "CITY_STATE",
    regex: /\b[A-Z][a-z]+,\s+[A-Z]{2}\b/g,
    replacement: (_, i) => `[CITY_STATE_${i + 1}]`,
    regulations: ["GDPR", "CCPA"],
  },

  // ── 32: ZIP / PIN Code (keyword context only) ─────────────────────────────
  {
    name: "ZIP / PIN Code",
    type: "ZIP_CODE",
    regex: /(?:zip|pin|postal)\s*(?:code)?[:\s]*\d{5,6}\b/gi,
    replacement: (_, i) => `[ZIP_CODE_${i + 1}]`,
    regulations: ["CCPA", "HIPAA"],
  },

  // ── 33: Credit Card raw (16 contiguous digits) ───────────────────────────
  {
    name: "Credit Card",
    type: "CREDIT_CARD",
    regex: /\b\d{16}\b/g,
    replacement: (_, i) => `[CREDIT_CARD_${i + 1}]`,
    regulations: ["CCPA", "DPDP", "PCI-DSS"],
  },

  // ── 34: Aadhaar raw (12 contiguous digits, starts [1-9]) ─────────────────
  {
    name: "Aadhaar",
    type: "AADHAR",
    regex: /\b[1-9]\d{11}\b/g,
    replacement: (_, i) => `[AADHAR_${i + 1}]`,
    regulations: ["DPDP"],
  },

  // ── 35: Phone raw — Indian 10-digit ([6-9] + 9 digits) ───────────────────
  {
    name: "Phone",
    type: "PHONE",
    regex: /\b[6-9]\d{9}\b/g,
    replacement: (_, i) => `[PHONE_${i + 1}]`,
    regulations: ["GDPR", "CCPA", "DPDP"],
  },

  // ── 36: Bank Account / generic long number (9–18 digits) — lowest priority ─
  {
    name: "Bank Account",
    type: "BANK_ACCOUNT",
    regex: /\b\d{9,18}\b/g,
    replacement: (_, i) => `[BANK_ACCOUNT_${i + 1}]`,
    regulations: ["CCPA", "DPDP"],
  },
];
