"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TRANSFORM_OPTIONS,
  type TransformType,
} from "./types";
import { detectFormat, transform } from "./utils";

export function TextKitchen() {
  const [input, setInput] = useState("");
  const [selectedTransform, setSelectedTransform] =
    useState<TransformType | null>(null);
  const [copied, setCopied] = useState(false);

  const detectedFormat = useMemo(() => {
    if (!input.trim()) return null;
    return detectFormat(input);
  }, [input]);

  const availableTransforms = useMemo(() => {
    if (!detectedFormat) return [];
    return TRANSFORM_OPTIONS.filter((t) => t.formats.includes(detectedFormat));
  }, [detectedFormat]);

  const output = useMemo(() => {
    if (!input || !selectedTransform) return "";
    return transform(input, selectedTransform);
  }, [input, selectedTransform]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setSelectedTransform(null);
  };

  const handleTransformClick = (transformId: TransformType) => {
    setSelectedTransform(transformId);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext =
      selectedTransform?.includes("json") || detectedFormat === "json"
        ? "json"
        : detectedFormat === "csv"
          ? "csv"
          : "txt";
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput("");
    setSelectedTransform(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Text Kitchen</h1>
        <p className="text-muted-foreground">
          Transform, clean, and format text data
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-medium">Transformations</h2>
            {detectedFormat ? (
              <div className="space-y-1">
                {availableTransforms.map((transform) => (
                  <button
                    key={transform.id}
                    onClick={() => handleTransformClick(transform.id)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      selectedTransform === transform.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    <div className="font-medium">{transform.label}</div>
                    <div
                      className={cn(
                        "text-xs",
                        selectedTransform === transform.id
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      )}
                    >
                      {transform.description}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Paste some data to see available transformations
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid gap-4">
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium">
                Input{" "}
                {detectedFormat && (
                  <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                    {detectedFormat.toUpperCase()}
                  </span>
                )}
              </label>
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Paste JSON, CSV, or text here..."
                className="min-h-[300px] w-full resize-none rounded-lg border border-border bg-card p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <AnimatePresence>
              {selectedTransform && output && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="mb-2 text-sm font-medium">Output</label>
                  <div className="relative min-h-[300px] rounded-lg border border-border bg-card p-4 font-mono text-sm">
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              disabled={!output}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                output
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              )}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!output}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                output
                  ? "bg-accent hover:bg-accent/80"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              )}
            >
              <Download className="h-4 w-4" />
              Download
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