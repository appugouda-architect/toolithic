"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Eye, EyeOff, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { PII_PATTERNS, PIIMapping } from "./types";

export function PIIMasker() {
  const [input, setInput] = useState("");
  const [mappings, setMappings] = useState<PIIMapping[]>([]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);

  const maskText = useCallback((text: string) => {
    const newMappings: PIIMapping[] = [];
    let maskedText = text;

    PII_PATTERNS.forEach((pattern) => {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      let matchIndex = 0;

      maskedText = maskedText.replace(regex, (match) => {
        const replacement = pattern.replacement(
          match,
          newMappings.filter((m) => m.type === pattern.type).length + matchIndex
        );
        matchIndex++;

        newMappings.push({
          id: `${pattern.type}_${Date.now()}_${Math.random()}`,
          type: pattern.name,
          original: match,
          masked: replacement,
        });

        return replacement;
      });
    });

    setMappings(newMappings);
    return maskedText;
  }, []);

  const maskedOutput = useMemo(() => {
    if (!input) return "";
    return maskText(input);
  }, [input, maskText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleCopy = async () => {
    const textToCopy = showOriginal
      ? mappings.map((m) => m.original).join("\n")
      : maskedOutput;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setMappings([]);
  };

  const handleDownload = () => {
    const textToDownload = showOriginal
      ? mappings.map((m) => m.original).join("\n")
      : maskedOutput;
    const blob = new Blob([textToDownload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = showOriginal ? "original.txt" : "masked.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PII Masker</h1>
          <p className="text-muted-foreground">
            Mask personally identifiable information securely in your browser
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium">Input Text</label>
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Paste your text containing PII here..."
            className="min-h-[400px] w-full resize-none rounded-lg border border-border bg-card p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium">Masked Output</label>
          <div className="relative min-h-[400px] rounded-lg border border-border bg-card p-4 font-mono text-sm">
            {maskedOutput ? (
              <pre className="whitespace-pre-wrap">{maskedOutput}</pre>
            ) : (
              <p className="text-muted-foreground">
                Masked output will appear here...
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={handleCopy}
          disabled={!maskedOutput}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            maskedOutput
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied!" : "Copy for LLM"}
        </button>
        <button
          onClick={handleDownload}
          disabled={!maskedOutput}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            maskedOutput
              ? "bg-accent hover:bg-accent/80"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          disabled={!mappings.length}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            mappings.length
              ? "bg-accent hover:bg-accent/80"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          {showOriginal ? (
            <>
              <EyeOff className="h-4 w-4" />
              Show Masked
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Show Original
            </>
          )}
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

      <AnimatePresence>
        {mappings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8"
          >
            <h2 className="mb-4 text-lg font-semibold">Mapping Table</h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-accent">
                    <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Original Value
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Masked Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping) => (
                    <tr
                      key={mapping.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3 text-sm">{mapping.type}</td>
                      <td className="px-4 py-3 font-mono text-sm">{mapping.original}</td>
                      <td className="px-4 py-3 font-mono text-sm text-primary">
                        {mapping.masked}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}