import * as yaml from "js-yaml";
import * as XLSX from "xlsx";
import type { DataFormat } from "./types";

export function detectFormat(input: string, filename?: string): DataFormat {
  if (filename) {
    const ext = filename.toLowerCase().split(".").pop();
    if (ext === "json") return "json";
    if (ext === "csv") return "csv";
    if (ext === "xlsx" || ext === "xls") return "excel";
    if (ext === "yaml" || ext === "yml") return "yaml";
    if (ext === "md" || ext === "markdown") return "table";
  }

  const trimmed = input.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {}
  }
  if (trimmed.startsWith("---") || trimmed.includes(": ")) {
    try {
      yaml.load(trimmed);
      return "yaml";
    } catch {}
  }
  const lines = trimmed.split("\n");
  if (lines.length > 1) {
    const firstCommas = lines[0].split(",").length;
    const secondCommas = lines[1]?.split(",").length || 0;
    if (firstCommas > 1 && firstCommas === secondCommas) {
      return "csv";
    }
  }
  if (trimmed.includes("|") && trimmed.includes("---")) {
    return "table";
  }
  return "text";
}

function parseJSON(input: string): unknown {
  return JSON.parse(input);
}

function parseCSV(input: string): unknown[] {
  const lines = input.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? "";
    });
    return obj;
  });
}

function parseYAML(input: string): unknown {
  return yaml.load(input);
}

function jsonToCSV(data: unknown): string {
  const arr: Record<string, unknown>[] = Array.isArray(data) ? data as Record<string, unknown>[] : [data as Record<string, unknown>];
  if (arr.length === 0) return "";
  const headers = Object.keys(arr[0]);
  const headerRow = headers.join(",");
  const rows = arr.map((item) =>
    headers.map((h) => {
      const val = String(item[h] ?? "");
      return val.includes(",") ? `"${val}"` : val;
    }).join(",")
  );
  return [headerRow, ...rows].join("\n");
}

function jsonToExcel(data: unknown): ArrayBuffer {
  const ws = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as unknown as ArrayBuffer;
}

function jsonToYAML(data: unknown): string {
  return yaml.dump(data, { indent: 2, lineWidth: -1 });
}

function jsonToMarkdownTable(data: unknown): string {
  const arr: Record<string, unknown>[] = Array.isArray(data) ? data as Record<string, unknown>[] : [data as Record<string, unknown>];
  if (arr.length === 0) return "";
  const headers = Object.keys(arr[0]);
  const headerRow = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const rows = arr.map((item) =>
    `| ${headers.map((h) => String(item[h] ?? "")).join(" | ")} |`
  );
  return [headerRow, separator, ...rows].join("\n");
}

function csvToJSON(lines: string[]): Record<string, string>[] {
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? "";
    });
    return obj;
  });
}

function yamlToJSON(input: string): unknown {
  return yaml.load(input);
}

export function convert(
  input: string,
  fromFormat: DataFormat,
  toFormat: DataFormat,
  filename?: string
): { success: boolean; data: string | ArrayBuffer; error?: string } {
  try {
    let parsed: unknown;
    
    switch (fromFormat) {
      case "json":
        parsed = parseJSON(input);
        break;
      case "csv":
        parsed = csvToJSON(input.split("\n").filter((l) => l.trim()));
        break;
      case "yaml":
        parsed = parseYAML(input);
        break;
      case "text":
      case "table":
        parsed = [{ content: input }];
        break;
      default:
        return { success: false, data: "", error: `Unsupported source format: ${fromFormat}` };
    }

    switch (toFormat) {
      case "json":
        return { success: true, data: JSON.stringify(parsed, null, 2) };
      case "csv":
        return { success: true, data: jsonToCSV(parsed) };
      case "excel":
        return { success: true, data: jsonToExcel(parsed) };
      case "yaml":
        return { success: true, data: jsonToYAML(parsed) };
      case "table":
        return { success: true, data: jsonToMarkdownTable(parsed) };
      case "text":
        return { success: true, data: JSON.stringify(parsed, null, 2) };
      default:
        return { success: false, data: "", error: `Unsupported target format: ${toFormat}` };
    }
  } catch (e) {
    return { success: false, data: "", error: (e as Error).message };
  }
}