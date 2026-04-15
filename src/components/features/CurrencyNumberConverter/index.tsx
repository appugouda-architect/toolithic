"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, Hash, Copy, Download, Upload, RefreshCw, Globe, DollarSign, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENCIES, STATIC_RATES } from "./types";
import { fetchExchangeRates, batchConvert, localizeNumber, parseLocalizedNumber } from "./utils";
import type { ExchangeRates, NumberSystem, NumberFormat } from "./types";

const EXAMPLE_QUERIES = {
  currency: [
    "100 USD to INR",
    "50000 INR to EUR",
    "1000\n2500\n5000 USD to INR",
    "€100 to ¥",
  ],
  number: [
    "1000000 → 10,00,000",
    "12345678 → Indian format",
    "1000000 → words",
    "250000 → compact",
  ],
};

export function CurrencyNumberConverter() {
  const [activeTab, setActiveTab] = useState<"currency" | "number">("currency");
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Currency tab state
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [batchInput, setBatchInput] = useState("");
  const [batchMode, setBatchMode] = useState(false);
  
  // Number tab state
  const [numberInput, setNumberInput] = useState("");
  const [numberSystem, setNumberSystem] = useState<NumberSystem>("indian");
  const [numberFormat, setNumberFormat] = useState<NumberFormat>("numeric");
  const [convertedNumber, setConvertedNumber] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    const data = await fetchExchangeRates("USD");
    setRates(data);
    setLoading(false);
  };

  const currencyResult = useMemo(() => {
    if (!amount || !rates) return null;
    const num = parseLocalizedNumber(amount);
    if (isNaN(num)) return null;
    const rate = rates.rates[toCurrency] || 1;
    const fromRate = rates.rates[fromCurrency] || 1;
    const converted = (num / fromRate) * rate;
    return { original: num, converted };
  }, [amount, rates, fromCurrency, toCurrency]);

  const batchResults = useMemo(() => {
    if (!batchInput || !rates) return [];
    return batchConvert(batchInput, fromCurrency, toCurrency, rates.rates);
  }, [batchInput, rates, fromCurrency, toCurrency]);

  useEffect(() => {
    if (!numberInput) {
      setConvertedNumber("");
      return;
    }
    const num = parseLocalizedNumber(numberInput);
    if (isNaN(num)) {
      setConvertedNumber("Invalid number");
      return;
    }
    const result = localizeNumber(num, numberSystem, numberFormat);
    setConvertedNumber(result);
  }, [numberInput, numberSystem, numberFormat]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(convertedNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBatchDownload = () => {
    if (batchResults.length === 0) return;
    const csv = batchResults
      .map((r) => `${r.original},${r.converted.toFixed(2)}`)
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCurrencySymbol = (code: string) => {
    const curr = CURRENCIES.find((c) => c.code === code);
    return curr?.symbol || code;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Currency & Number Converter</h1>
        <p className="text-muted-foreground">
          Convert currencies and localize numbers across different formats
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("currency")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "currency"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <DollarSign className="h-4 w-4" />
          Currency
        </button>
        <button
          onClick={() => setActiveTab("number")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "number"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Hash className="h-4 w-4" />
          Number Localizer
        </button>
      </div>

      {activeTab === "currency" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Rates from: {rates?.base || "USD"} •{" "}
              {rates
                ? new Date(rates.timestamp).toLocaleString()
                : "Loading..."}
            </div>
            <button
              onClick={fetchRates}
              disabled={loading}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setBatchMode(false)}
              className={cn(
                "px-3 py-1 rounded-full text-sm",
                !batchMode && "bg-primary text-primary-foreground"
              )}
            >
              Single
            </button>
            <button
              onClick={() => setBatchMode(true)}
              className={cn(
                "px-3 py-1 rounded-full text-sm",
                batchMode && "bg-primary text-primary-foreground"
              )}
            >
              Batch
            </button>
          </div>

          {!batchMode ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full h-12 rounded-lg border border-border bg-card px-4 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full h-12 rounded-lg border border-border bg-card px-3"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full h-12 rounded-lg border border-border bg-card px-3"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Currency</label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full h-12 rounded-lg border border-border bg-card px-3"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To Currency</label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full h-12 rounded-lg border border-border bg-card px-3"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Enter amounts (one per line)
                </label>
                <textarea
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder="100&#10;250&#10;500"
                  className="w-full h-32 rounded-lg border border-border bg-card p-3 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {batchMode && batchResults.length > 0 && (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="flex justify-between items-center p-3 border-b border-border bg-accent">
                <span className="text-sm font-medium">Results</span>
                <button
                  onClick={handleBatchDownload}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                  Download CSV
                </button>
              </div>
              <div className="max-h-64 overflow-auto">
                {batchResults.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between p-3 border-b border-border last:border-b-0"
                  >
                    <span className="font-mono">{r.original}</span>
                    <span className="text-primary font-mono">
                      {getCurrencySymbol(toCurrency)}
                      {r.converted.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!batchMode && currencyResult && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-sm text-muted-foreground mb-2">
                Converted Amount
              </div>
              <div className="text-3xl font-bold text-primary">
                {getCurrencySymbol(toCurrency)}
                {currencyResult.converted.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm font-medium">Try these examples</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setAmount("100"); setFromCurrency("USD"); setToCurrency("INR"); }}
                className="rounded-full bg-accent px-3 py-1 text-sm"
              >
                100 USD to INR
              </button>
              <button
                onClick={() => { setAmount("50000"); setFromCurrency("INR"); setToCurrency("EUR"); }}
                className="rounded-full bg-accent px-3 py-1 text-sm"
              >
                50000 INR to EUR
              </button>
              <button
                onClick={() => { setBatchMode(true); setBatchInput("100\n250\n500"); }}
                className="rounded-full bg-accent px-3 py-1 text-sm"
              >
                Batch list
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "number" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Number Format System</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNumberSystem("indian")}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium",
                    numberSystem === "indian"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent"
                  )}
                >
                  Indian
                </button>
                <button
                  onClick={() => setNumberSystem("international")}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium",
                    numberSystem === "international"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent"
                  )}
                >
                  International
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Output Format</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNumberFormat("numeric")}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium",
                    numberFormat === "numeric"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent"
                  )}
                >
                  Numeric
                </button>
                <button
                  onClick={() => setNumberFormat("words")}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium",
                    numberFormat === "words"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent"
                  )}
                >
                  Words
                </button>
                <button
                  onClick={() => setNumberFormat("compact")}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium",
                    numberFormat === "compact"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent"
                  )}
                >
                  Compact
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Enter Number</label>
            <input
              type="text"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              placeholder="Enter a number (e.g., 1000000)"
              className="w-full h-12 rounded-lg border border-border bg-card px-4 font-mono"
            />
          </div>

          {convertedNumber && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="text-sm text-muted-foreground mb-2">
                Converted ({numberSystem} • {numberFormat})
              </div>
              <div className="text-2xl font-bold text-primary break-words">
                {convertedNumber}
              </div>
              <button
                onClick={handleCopy}
                className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm font-medium">Try these examples</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setNumberInput("1000000"); setNumberSystem("indian"); setNumberFormat("numeric"); }}
                className="rounded-full bg-accent px-3 py-1 text-sm"
              >
                1000000 → Indian
              </button>
              <button
                onClick={() => { setNumberInput("12345678"); setNumberSystem("indian"); setNumberFormat("words"); }}
                className="rounded-full bg-accent px-3 py-1 text-sm"
              >
                Words in Indian
              </button>
              <button
                onClick={() => { setNumberInput("1000000"); setNumberSystem("international"); setNumberFormat("compact"); }}
                className="rounded-full bg-accent px-3 py-1 text-sm"
              >
                Compact International
              </button>
              <button
                onClick={() => { setNumberInput("125000"); setNumberSystem("indian"); setNumberFormat("words"); }}
                className="rounded-full bg-accent px-3 py-1 text-sm"
              >
                125000 → Words
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}