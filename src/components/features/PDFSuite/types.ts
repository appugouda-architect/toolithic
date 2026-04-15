export type PDFFeature =
  | "redaction"
  | "ocr"
  | "compression"
  | "conversion"
  | "security"
  | "signature";

export interface PDFFeatureInfo {
  id: PDFFeature;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const PDF_FEATURES: PDFFeatureInfo[] = [
  {
    id: "redaction",
    title: "Smart Redaction",
    description: "Detect and permanently remove sensitive information",
    icon: "🔐",
    color: "from-red-500/20 to-red-600/20",
  },
  {
    id: "ocr",
    title: "OCR & Extraction",
    description: "Convert scanned PDFs into text, JSON, or CSV",
    icon: "🧠",
    color: "from-purple-500/20 to-purple-600/20",
  },
  {
    id: "compression",
    title: "Compression",
    description: "Reduce PDF size with quality options",
    icon: "🗜",
    color: "from-blue-500/20 to-blue-600/20",
  },
  {
    id: "conversion",
    title: "To Word/Excel",
    description: "Convert PDFs to editable DOCX or XLSX",
    icon: "📝",
    color: "from-green-500/20 to-green-600/20",
  },
  {
    id: "security",
    title: "Lock/Unlock",
    description: "Password protect or remove restrictions",
    icon: "🔓",
    color: "from-orange-500/20 to-orange-600/20",
  },
  {
    id: "signature",
    title: "Sign PDF",
    description: "Add digital signatures to documents",
    icon: "✍️",
    color: "from-pink-500/20 to-pink-600/20",
  },
];

export interface RedactionItem {
  id: string;
  type: string;
  text: string;
  page: number;
  coordinates: { x: number; y: number; width: number; height: number };
  selected: boolean;
}

export interface OCRExtraction {
  text: string;
  tables: { rows: string[][] }[];
  keyValues: Record<string, string>;
}

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  reduction: number;
  blob: Blob;
}

export interface PDFPageInfo {
  pageNumber: number;
  width: number;
  height: number;
}