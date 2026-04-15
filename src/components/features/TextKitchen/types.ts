export type DataFormat = "json" | "csv" | "text";

export type TransformType =
  | "json-lint"
  | "json-format"
  | "json-minify"
  | "json-flatten"
  | "json-to-csv"
  | "csv-sort"
  | "csv-dedupe"
  | "csv-transpose"
  | "csv-to-json"
  | "text-upper"
  | "text-lower"
  | "text-title"
  | "text-trim"
  | "text-extract-emails"
  | "text-extract-urls"
  | "text-sort-lines";

export interface TransformOption {
  id: TransformType;
  label: string;
  description: string;
  formats: DataFormat[];
}

export const TRANSFORM_OPTIONS: TransformOption[] = [
  {
    id: "json-lint",
    label: "Lint JSON",
    description: "Format and validate JSON",
    formats: ["json"],
  },
  {
    id: "json-format",
    label: "Format JSON",
    description: "Pretty print JSON with indentation",
    formats: ["json"],
  },
  {
    id: "json-minify",
    label: "Minify JSON",
    description: "Remove whitespace from JSON",
    formats: ["json"],
  },
  {
    id: "json-flatten",
    label: "Flatten JSON",
    description: "Flatten nested objects to dot notation",
    formats: ["json"],
  },
  {
    id: "json-to-csv",
    label: "JSON to CSV",
    description: "Convert JSON array to CSV",
    formats: ["json"],
  },
  {
    id: "csv-sort",
    label: "Sort CSV",
    description: "Sort CSV by first column",
    formats: ["csv"],
  },
  {
    id: "csv-dedupe",
    label: "Remove Duplicates",
    description: "Remove duplicate rows",
    formats: ["csv"],
  },
  {
    id: "csv-transpose",
    label: "Transpose",
    description: "Swap rows and columns",
    formats: ["csv"],
  },
  {
    id: "csv-to-json",
    label: "CSV to JSON",
    description: "Convert CSV to JSON array",
    formats: ["csv"],
  },
  {
    id: "text-upper",
    label: "UPPERCASE",
    description: "Convert to uppercase",
    formats: ["text"],
  },
  {
    id: "text-lower",
    label: "lowercase",
    description: "Convert to lowercase",
    formats: ["text"],
  },
  {
    id: "text-title",
    label: "Title Case",
    description: "Convert to title case",
    formats: ["text"],
  },
  {
    id: "text-trim",
    label: "Trim Whitespace",
    description: "Remove extra whitespace",
    formats: ["text"],
  },
  {
    id: "text-extract-emails",
    label: "Extract Emails",
    description: "Extract email addresses",
    formats: ["text"],
  },
  {
    id: "text-extract-urls",
    label: "Extract URLs",
    description: "Extract URLs",
    formats: ["text"],
  },
  {
    id: "text-sort-lines",
    label: "Sort Lines",
    description: "Sort text lines alphabetically",
    formats: ["text"],
  },
];