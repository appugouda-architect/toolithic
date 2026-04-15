"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Trash2, Check, ArrowRightLeft, Upload, FileJson, FileSpreadsheet, FileText, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { FORMAT_OPTIONS, type DataFormat } from "./types";
import { detectFormat, convert } from "./utils";

export function MultiFormatConverter() {
  const [input, setInput] = useState("");
  const [fromFormat, setFromFormat] = useState<DataFormat>("json");
  const [toFormat, setToFormat] = useState<DataFormat>("csv");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectedFormat = useMemo(() => {
    if (!input.trim()) return null;
    return detectFormat(input);
  }, [input]);

  const autoDetectedFormat = useMemo(() => {
    if (detectedFormat === fromFormat || !detectedFormat) return null;
    return detectedFormat;
  }, [detectedFormat, fromFormat]);

  const result = useMemo(() => {
    if (!input.trim() || fromFormat === toFormat) return null;
    return convert(input, fromFormat, toFormat);
  }, [input, fromFormat, toFormat]);

  const handleFormatChange = (newFrom: DataFormat) => {
    setFromFormat(newFrom);
    setError(null);
  };

  const handleToFormatChange = (newTo: DataFormat) => {
    setToFormat(newTo);
    setError(null);
  };

  const handleAutoDetect = () => {
    if (detectedFormat) {
      setFromFormat(detectedFormat);
    }
  };

  const handleCopy = async () => {
    if (result?.success && typeof result.data === "string") {
      await navigator.clipboard.writeText(result.data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result?.success) return;
    const formatOpt = FORMAT_OPTIONS.find((f) => f.id === toFormat);
    const ext = formatOpt?.extension || ".txt";
    const blob = new Blob([result.data as string], { type: formatOpt?.mimeType || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        setInput(content);
        const detected = detectFormat(content, file.name);
        setFromFormat(detected);
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    setInput("");
    setError(null);
  };

  const getIcon = (format: DataFormat) => {
    switch (format) {
      case "json":
        return <FileJson className="h-4 w-4" />;
      case "csv":
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "yaml":
        return <FileCode className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Multi-Format Converter</h1>
        <p className="text-muted-foreground">
          Convert seamlessly between JSON, CSV, Excel, YAML, and more
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Input</label>
            <div className="flex items-center gap-2">
              {autoDetectedFormat && (
                <button
                  onClick={handleAutoDetect}
                  className="rounded-full bg-primary/20 px-3 py-1 text-xs text-primary hover:bg-primary/30"
                >
                  Auto-detected: {autoDetectedFormat.toUpperCase()}
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json,.csv,.xlsx,.yaml,.yml,.txt,.md"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 rounded-lg px-3 py-1 text-xs bg-accent hover:bg-accent/80"
              >
                <Upload className="h-3 w-3" />
                Upload
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map((format) => (
              <button
                key={format.id}
                onClick={() => handleFormatChange(format.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  fromFormat === format.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent hover:bg-accent/80"
                )}
              >
                {getIcon(format.id)}
                {format.label}
              </button>
            ))}
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your data here or upload a file..."
            className="min-h-[300px] w-full resize-none rounded-lg border border-border bg-card p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Output</label>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map((format) => (
              <button
                key={format.id}
                onClick={() => handleToFormatChange(format.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  toFormat === format.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent hover:bg-accent/80"
                )}
              >
                {getIcon(format.id)}
                {format.label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {result ? (
              result.success ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative min-h-[300px] rounded-lg border border-border bg-card p-4 font-mono text-sm"
                >
                  <pre className="whitespace-pre-wrap overflow-auto max-h-[400px]">
                    {typeof result.data === "string" ? result.data : "[Binary Excel Data]"}
                  </pre>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-500"
                >
                  Error: {result.error}
                </motion.div>
              )
            ) : (
              <div className="min-h-[300px] rounded-lg border border-border bg-card p-4 font-mono text-sm text-muted-foreground">
                Converted output will appear here...
              </div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              disabled={!result?.success || typeof result.data !== "string"}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                result?.success
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              )}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!result?.success}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                result?.success
                  ? "bg-accent hover:bg-accent/80"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              )}
            >
              <Download className="h-4 w-4" />
              Download {toFormat.toUpperCase()}
            </button>
            <button
              onClick={handleClear}
              disabled={!input}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                input
                  ? "bg-accent hover:bg-accent/80 text-red-500"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              )}
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}