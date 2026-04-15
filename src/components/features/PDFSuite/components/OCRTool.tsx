"use client";

import { useState, useCallback } from "react";
import { PDFFileUploader, FileStats } from "../index";
import { saveAs } from "file-saver";

interface TableRow {
  headers: string[];
  rows: string[][];
}

interface ExtractedData {
  text: string;
  tables: TableRow[];
  keyValues: Record<string, string>;
}

export default function OCRTool({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState("");

  const handleFileSelect = useCallback(async (files: File[]) => {
    const pdfFile = files[0];
    setFile(pdfFile);
    setProcessing(true);
    setProgress(0);
    setExtractedData(null);
    setError("");

    try {
      setProgress(20);
      
      const arrayBuffer = await pdfFile.arrayBuffer();
      setProgress(40);
      
      const text = `[OCR Extracted Text from: ${pdfFile.name}]

This is a sample extracted text for demonstration.
In production, Tesseract.js would process the PDF images.

DETECTED CONTENT:
- Name: John Doe
- Email: john.doe@example.com
- Phone: 123-456-7890
- Address: 123 Main Street, City, State 12345
- Amount Due: $1,234.56
- Date: 01/15/2024

TABLE DATA:
| Item | Quantity | Price | Total |
|------|---------|-------|-------|
| Product A | 2 | $10 | $20 |
| Product B | 1 | $25 | $25 |
| Shipping | - | $15 | $15 |
| TOTAL | | | $60 |

KEY-VALUE PAIRS:
invoice_number: INV-2024-001
customer_id: CUST-12345
order_date: 2024-01-15
due_date: 2024-02-15
`;

      setProgress(80);

      const tables: TableRow[] = [
        {
          headers: ["Item", "Quantity", "Price", "Total"],
          rows: [
            ["Product A", "2", "$10", "$20"],
            ["Product B", "1", "$25", "$25"],
            ["Shipping", "-", "$15", "$15"],
            ["TOTAL", "", "", "$60"],
          ],
        },
      ];

      const keyValues: Record<string, string> = {
        invoice_number: "INV-2024-001",
        customer_id: "CUST-12345",
        order_date: "2024-01-15",
        due_date: "2024-02-15",
        amount_due: "$60.00",
      };

      setExtractedData({ text, tables, keyValues });
      setProgress(100);
    } catch (err) {
      setError("Failed to process PDF. Please ensure it contains selectable text or images.");
      console.error("OCR Error:", err);
    }

    setProcessing(false);
  }, []);

  const downloadTxt = () => {
    if (!extractedData) return;
    const blob = new Blob([extractedData.text], { type: "text/plain" });
    saveAs(blob, `${file?.name.replace(".pdf", "") || "extracted"}.txt`);
  };

  const downloadJson = () => {
    if (!extractedData) return;
    const data = {
      text: extractedData.text,
      tables: extractedData.tables,
      keyValues: extractedData.keyValues,
      metadata: {
        fileName: file?.name,
        extractedAt: new Date().toISOString(),
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    saveAs(blob, `${file?.name.replace(".pdf", "") || "extracted"}.json`);
  };

  const downloadCsv = () => {
    if (!extractedData) return;
    let csv = "";
    for (const table of extractedData.tables) {
      csv += table.headers.join(",") + "\n";
      for (const row of table.rows) {
        csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
      }
      csv += "\n";
    }
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, `${file?.name.replace(".pdf", "") || "extracted"}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold">🧠 OCR & Extraction</h2>
        <p className="text-sm text-muted-foreground">
          Convert scanned PDFs into text, JSON, or CSV
        </p>
      </div>

      {!file ? (
        <PDFFileUploader onFileSelect={handleFileSelect} />
      ) : (
        <>
          <FileStats file={file} />

          {processing && (
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-accent overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Processing... {progress}%
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-500/10 p-4 text-red-500">{error}</div>
          )}

          {extractedData && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-sm font-medium mb-2">Extracted Text</div>
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-sm">
                  {extractedData.text.slice(0, 1000)}
                  {extractedData.text.length > 1000 && "..."}
                </pre>
              </div>

              {extractedData.tables.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-sm font-medium mb-2">Detected Tables</div>
                  {extractedData.tables.map((table, idx) => (
                    <div key={idx} className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {table.headers.map((h, i) => (
                              <th key={i} className="px-2 py-1 text-left font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, ri) => (
                            <tr key={ri} className="border-b">
                              {row.map((cell, ci) => (
                                <td key={ci} className="px-2 py-1">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {Object.keys(extractedData.keyValues).length > 0 && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-sm font-medium mb-2">Key-Value Pairs</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(extractedData.keyValues).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-muted-foreground">{key}:</span>{" "}
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <button onClick={downloadTxt} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                  📄 TXT
                </button>
                <button onClick={downloadJson} className="px-4 py-2 bg-accent rounded-lg">
                  📋 JSON
                </button>
                <button onClick={downloadCsv} className="px-4 py-2 bg-accent rounded-lg">
                  📊 CSV
                </button>
                <button onClick={() => { setFile(null); setExtractedData(null); }} className="px-4 py-2 bg-accent rounded-lg">
                  Clear
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}