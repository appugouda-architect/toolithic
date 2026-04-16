"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Eye, EyeOff, Trash2, Download, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PII_PATTERNS,
  PIIMapping,
  Country,
  COUNTRIES,
} from "./types";

export function PIIMasker() {
  const [input, setInput] = useState("");
  const [mappings, setMappings] = useState<PIIMapping[]>([]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [country, setCountry] = useState<Country>("GLOBAL");

  const countryConfig = useMemo(
    () => COUNTRIES.find((c) => c.code === country)!,
    [country]
  );

  const maskText = useCallback(
    (text: string) => {
      type MatchEntry = {
        start: number;
        end: number;
        match: string;
        pattern: (typeof PII_PATTERNS)[number];
        priority: number;
      };

      const allMatches: MatchEntry[] = [];
      PII_PATTERNS.forEach((pattern, priorityIndex) => {
        const flags = pattern.regex.flags.includes("g")
          ? pattern.regex.flags
          : pattern.regex.flags + "g";
        const regex = new RegExp(pattern.regex.source, flags);
        let m: RegExpExecArray | null;
        while ((m = regex.exec(text)) !== null) {
          allMatches.push({
            start: m.index,
            end: m.index + m[0].length,
            match: m[0],
            pattern,
            priority: priorityIndex,
          });
          if (m[0].length === 0) regex.lastIndex++;
        }
      });

      allMatches.sort((a, b) =>
        a.start !== b.start ? a.start - b.start : a.priority - b.priority
      );

      const selected: MatchEntry[] = [];
      let lastEnd = 0;
      for (const m of allMatches) {
        if (m.start >= lastEnd) {
          selected.push(m);
          lastEnd = m.end;
        }
      }

      const typeCounters: Record<string, number> = {};
      const newMappings: PIIMapping[] = [];
      const replacements = selected.map((m) => {
        typeCounters[m.pattern.type] = (typeCounters[m.pattern.type] || 0) + 1;
        const masked = m.pattern.replacement(
          m.match,
          typeCounters[m.pattern.type] - 1
        );
        newMappings.push({
          id: `${m.pattern.type}_${m.start}`,
          type: m.pattern.name,
          original: m.match,
          masked,
          regulations: m.pattern.regulations,
        });
        return { ...m, masked };
      });

      let result = text;
      for (let i = replacements.length - 1; i >= 0; i--) {
        const r = replacements[i];
        result = result.slice(0, r.start) + r.masked + result.slice(r.end);
      }

      setMappings(newMappings);
      return result;
    },
    []
  );

  const maskedOutput = useMemo(() => {
    if (!input) return "";
    return maskText(input);
  }, [input, maskText]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(maskedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setMappings([]);
  };

  const handleDownload = () => {
    const blob = new Blob([maskedOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "masked.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const relevantRegs = countryConfig.highlight;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">PII Masker</h1>
          <p className="text-muted-foreground">
            Mask personally identifiable information securely in your browser
          </p>
        </div>

        {/* Country / Compliance Profile Selector */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium text-muted-foreground">
            Compliance Profile:
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value as Country)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Compliance banner */}
      <div className="mb-4 rounded-lg border border-border bg-accent/50 px-4 py-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">
          {countryConfig.regulation}
        </span>
        {" — "}
        {countryConfig.note}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium">Input Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Mapping Table</h2>
              <span className="text-xs text-muted-foreground">
                {mappings.length} PII item{mappings.length !== 1 ? "s" : ""} detected
              </span>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-accent">
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Regulation
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Original Value
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Masked Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping) => {
                    const activeRegs = mapping.regulations.filter((r) =>
                      relevantRegs.includes(r)
                    );
                    return (
                      <tr
                        key={mapping.id}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-4 py-3 text-sm">{mapping.type}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {activeRegs.length > 0 ? (
                              activeRegs.map((reg) => (
                                <span
                                  key={reg}
                                  className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary"
                                >
                                  {reg}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          {showOriginal ? (
                            mapping.original
                          ) : (
                            <span className="blur-sm select-none">
                              {mapping.original}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-primary">
                          {mapping.masked}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
