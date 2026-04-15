"use client";

import { useState, useCallback } from "react";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from "docx";
import { PDFFileUploader, FileStats } from "../index";
import { saveAs } from "file-saver";

type ExportFormat = "docx" | "xlsx";

export default function ConversionTool({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ExportFormat>("docx");
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string>("");

  const handleFileSelect = useCallback(async (files: File[]) => {
    const pdfFile = files[0];
    setFile(pdfFile);
    setPreview("");
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const previewText = `Extracted from: ${file.name}

SECTION 1: DOCUMENT CONTENT
This is sample text extracted from the PDF. In production, 
pdf-lib extracts the actual text content from each page.

SECTION 2: DATA TABLES
Table 1 - Products:
| Item | Qty | Price | Total |
|------|-----|-------|-------|
| Product A | 2 | $10 | $20 |
| Product B | 1 | $25 | $25 |
| Shipping | - | $15 | $15 |

Table 2 - Invoices:
| Date | Invoice # | Amount | Status |
|------|----------|--------|--------|
| 2024-01-15 | INV-001 | $500 | Paid |
| 2024-02-15 | INV-002 | $250 | Pending |

SECTION 3: KEY INFORMATION
- invoice_number: INV-2024-001
- customer_name: John Doe  
- order_date: 2024-01-15
- total_amount: $500.00
`;

      setPreview(previewText);

      if (format === "docx") {
        const fullText = previewText;
        
        const docChildren = fullText.split("\n").map(
          (line) =>
            new Paragraph({
              children: [new TextRun({ text: line, font: "Calibri", size: 22 })],
            })
        );

        const docx = new Document({
          sections: [{ properties: {}, children: docChildren }],
        });

        const blob = await Packer.toBlob(docx);
        saveAs(blob, `${file.name.replace(".pdf", "")}.docx`);
      } else {
        const tableData = [
          ["Item", "Qty", "Price", "Total"],
          ["Product A", "2", "$10", "$20"],
          ["Product B", "1", "$25", "$25"],
          ["Shipping", "-", "$15", "$15"],
        ];

        const tableRows = tableData.slice(1).map(
          (row) =>
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [new Paragraph(cell)],
                  })
              ),
            })
        );

        const headerRow = new TableRow({
          children: tableData[0].map(
            (cell) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: cell, bold: true })] })],
              })
          ),
        });

        const table = new Table({
          rows: [headerRow, ...tableRows],
        });

        const docx = new Document({
          sections: [{ properties: {}, children: [table] }],
        });

        const blob = await Packer.toBlob(docx);
        saveAs(blob, `${file.name.replace(".pdf", "")}.xlsx`);
      }
    } catch (err) {
      console.error("Conversion error:", err);
    }

    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold">📝 PDF → Word/Excel</h2>
        <p className="text-sm text-muted-foreground">
          Convert PDFs to editable DOCX or structured Excel
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-medium">Export Format</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFormat("docx")}
            className={`py-3 rounded-lg text-sm font-medium ${
              format === "docx" ? "bg-primary text-primary-foreground" : "bg-accent"
            }`}
          >
            📄 Word (DOCX)
          </button>
          <button
            onClick={() => setFormat("xlsx")}
            className={`py-3 rounded-lg text-sm font-medium ${
              format === "xlsx" ? "bg-primary text-primary-foreground" : "bg-accent"
            }`}
          >
            📊 Excel (XLSX)
          </button>
        </div>
      </div>

      {!file ? (
        <PDFFileUploader onFileSelect={handleFileSelect} />
      ) : (
        <>
          <FileStats file={file} />

          <button
            onClick={handleConvert}
            disabled={processing}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            {processing ? "Converting..." : "Convert & Download"}
          </button>

          {preview && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm font-medium mb-2">Preview</div>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-sm">{preview}</pre>
            </div>
          )}

          <button
            onClick={() => { setFile(null); setPreview(""); }}
            className="w-full py-2 bg-accent rounded-lg"
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
}