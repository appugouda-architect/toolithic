export type DataFormat = "json" | "csv" | "excel" | "yaml" | "text" | "table";

export interface FormatOption {
  id: DataFormat;
  label: string;
  extension: string;
  mimeType: string;
}

export const FORMAT_OPTIONS: FormatOption[] = [
  { id: "json", label: "JSON", extension: ".json", mimeType: "application/json" },
  { id: "csv", label: "CSV", extension: ".csv", mimeType: "text/csv" },
  { id: "excel", label: "Excel", extension: ".xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  { id: "yaml", label: "YAML", extension: ".yaml", mimeType: "application/x-yaml" },
  { id: "text", label: "Plain Text", extension: ".txt", mimeType: "text/plain" },
  { id: "table", label: "Markdown Table", extension: ".md", mimeType: "text/markdown" },
];