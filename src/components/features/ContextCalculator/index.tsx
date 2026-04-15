"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Copy, Trash2, Check, History, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculate } from "./utils";
import type { CalculationResult } from "./types";

type HistoryItem = {
  query: string;
  breakdown: { description: string; formula: string; values: Record<string, number>; result: number }[];
  finalAnswer: string;
  formattedAnswer: string;
};

const exampleQueries = [
  "₹2450 among 3 with 18% GST",
  "10% of 450 + GST",
  "EMI for 500000 at 8% for 24 months",
  "₹15000 + 18% GST",
  "Split ₹3000 among 4",
  "₹100000 interest at 7% for 2 years",
  "₹5000 with 20% discount",
  "tax on ₹80000",
];

export function ContextCalculator() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!query.trim()) return null;
    return calculate(query);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (result && result.finalAnswer) {
      setHistory((prev) => [result, ...prev.slice(0, 9)]);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  const handleCopy = async () => {
    if (result?.finalAnswer) {
      await navigator.clipboard.writeText(result.formattedAnswer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Context-Aware Calculator</h1>
        <p className="text-muted-foreground">
          Natural language calculations with tax, GST, EMI, splits, and more
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask: ₹2450 among 3 with 18% GST"
                className="w-full h-14 rounded-xl border border-border bg-card pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>

          <AnimatePresence>
            {result && result.finalAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="text-sm text-muted-foreground mb-2">Result</div>
                <div className="text-3xl font-bold text-primary mb-4">
                  {result.formattedAnswer}
                </div>
                {result.breakdown.length > 0 && (
                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="text-sm font-medium">Breakdown</div>
                    {result.breakdown.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm py-1 px-3 rounded bg-accent/50"
                      >
                        <span className="text-muted-foreground">{step.description}</span>
                        <span className="font-mono">
                          {step.result.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleCopy}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-accent hover:bg-accent/80"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <div className="text-sm font-medium">Try these examples</div>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example)}
                  className="rounded-full bg-accent px-3 py-1 text-sm hover:bg-accent/80 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <History className="h-4 w-4" />
              History
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                Your calculation history will appear here
              </div>
            ) : (
              history.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border bg-card p-3 cursor-pointer hover:bg-accent/50"
                  onClick={() => setQuery(item.query)}
                >
                  <div className="text-xs text-muted-foreground truncate">
                    {item.query}
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {item.formattedAnswer}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}