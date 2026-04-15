import type { TransformType } from "./types";

export function detectFormat(input: string): "json" | "csv" | "text" {
  const trimmed = input.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // Not valid JSON
    }
  }
  const lines = trimmed.split("\n");
  if (lines.length > 1) {
    const firstLineCommass = lines[0].split(",").length;
    const secondLineCommass = lines[1]?.split(",").length || 0;
    if (firstLineCommass > 1 && firstLineCommass === secondLineCommass) {
      return "csv";
    }
  }
  return "text";
}

export function transform(
  input: string,
  transformType: TransformType
): string {
  try {
    switch (transformType) {
      case "json-lint":
      case "json-format": {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed, null, 2);
      }
      case "json-minify": {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed);
      }
      case "json-flatten": {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
          return JSON.stringify(parsed.map((item) => flattenObject(item)), null, 2);
        }
        return JSON.stringify(flattenObject(parsed), null, 2);
      }
      case "json-to-csv": {
        const parsed = JSON.parse(input);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        if (arr.length === 0) return "";
        const headers = Object.keys(arr[0]);
        const rows = arr.map((item) =>
          headers.map((h) => JSON.stringify(item[h] ?? "")).join(",")
        );
        return [headers.join(","), ...rows].join("\n");
      }
      case "csv-sort": {
        const lines = input.split("\n").filter(Boolean);
        if (lines.length <= 1) return input;
        const header = lines[0];
        const data = lines.slice(1).sort();
        return [header, ...data].join("\n");
      }
      case "csv-dedupe": {
        const lines = input.split("\n").filter(Boolean);
        const unique = [...new Set(lines)];
        return unique.join("\n");
      }
      case "csv-transpose": {
        const lines = input.split("\n").filter(Boolean);
        const cols = lines.map((line) => line.split(","));
        const maxCols = Math.max(...cols.map((c) => c.length));
        const transposed = Array.from({ length: maxCols }, (_, i) =>
          cols.map((row) => row[i] ?? "").join(",")
        );
        return transposed.join("\n");
      }
      case "csv-to-json": {
        const lines = input.split("\n").filter(Boolean);
        if (lines.length < 2) return "[]";
        const headers = lines[0].split(",");
        const arr = lines.slice(1).map((line) => {
          const values = line.split(",");
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h.trim()] = values[i]?.trim() ?? "";
          });
          return obj;
        });
        return JSON.stringify(arr, null, 2);
      }
      case "text-upper": {
        return input.toUpperCase();
      }
      case "text-lower": {
        return input.toLowerCase();
      }
      case "text-title": {
        return input.replace(/\b\w/g, (c) => c.toUpperCase());
      }
      case "text-trim": {
        return input.replace(/\s+/g, " ").trim();
      }
      case "text-extract-emails": {
        const emails = input.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        return emails ? [...new Set(emails)].join("\n") : "";
      }
      case "text-extract-urls": {
        const urls = input.match(/https?:\/\/[^\s]+/g);
        return urls ? [...new Set(urls)].join("\n") : "";
      }
      case "text-sort-lines": {
        return input.split("\n").filter(Boolean).sort().join("\n");
      }
      default:
        return input;
    }
  } catch (e) {
    return `Error: ${(e as Error).message}`;
  }
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}