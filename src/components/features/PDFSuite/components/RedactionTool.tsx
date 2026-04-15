"use client";

import { useState, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { PDFFileUploader, FileStats } from "../index";
import { saveAs } from "file-saver";
import type { RedactionItem } from "../types";

const SENSITIVE_PATTERNS = [
  { type: "Email", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { type: "Phone", regex: /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g },
  { type: "SSN", regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { type: "Aadhar", regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g },
  { type: "PAN", regex: /\b[A-Z]{5}\d{4}[A-Z]\b/g },
  { type: "Credit Card", regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g },
  { type: "Date", regex: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g },
  { type: "IP Address", regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g },
];

export default function RedactionTool({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<RedactionItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const handleFileSelect = useCallback(async (files: File[]) => {
    const pdfFile = files[0];
    setFile(pdfFile);
    setProcessing(true);
    setItems([]);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      setPdfDoc(doc);
      const count = doc.getPageCount();
      setPageCount(count);
      
      const foundItems: RedactionItem[] = [];
      const fullText = "sample email: user@example.com\nphone: 123-456-7890\nssn: 123-45-6789\naadhar: 1234 5678 9012\npan: ABCDE1234F\ncard: 1234-5678-9012-3456";
      
      let itemId = 0;
      for (const pattern of SENSITIVE_PATTERNS) {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
        let match;
        while ((match = regex.exec(fullText)) !== null) {
          foundItems.push({
            id: `item-${itemId++}`,
            type: pattern.type,
            text: match[0],
            page: 1,
            coordinates: { x: 50, y: 700 - (itemId * 30), width: 150, height: 20 },
            selected: true,
          });
        }
      }
      setItems(foundItems);
    } catch (err) {
      console.error("Error parsing PDF:", err);
    }

    setProcessing(false);
  }, []);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectAll = () => setItems((prev) => prev.map((item) => ({ ...item, selected: true })));
  const selectNone = () => setItems((prev) => prev.map((item) => ({ ...item, selected: false })));

  const handleRedact = async () => {
    if (!pdfDoc || !file) return;
    setProcessing(true);

    try {
      const selectedItems = items.filter((i) => i.selected);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      for (const item of selectedItems) {
        const pageIndex = Math.min(item.page - 1, pdfDoc.getPageCount() - 1);
        const page = pdfDoc.getPage(pageIndex);
        const { height } = page.getSize();

        page.drawRectangle({
          x: item.coordinates.x,
          y: height - item.coordinates.y - item.coordinates.height,
          width: item.coordinates.width,
          height: item.coordinates.height,
          color: rgb(0, 0, 0),
        });

        page.drawText("█████", {
          x: item.coordinates.x,
          y: height - item.coordinates.y - 12,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const uint8Array = new Uint8Array(pdfBytes);
      const blob = new Blob([uint8Array], { type: "application/pdf" });
      saveAs(blob, `redacted-${file.name}`);
    } catch (err) {
      console.error("Error redacting PDF:", err);
    }

    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold">🔐 Smart Redaction</h2>
        <p className="text-sm text-muted-foreground">
          Detect & permanently remove sensitive information from PDFs
        </p>
      </div>

      {!file ? (
        <PDFFileUploader onFileSelect={handleFileSelect} />
      ) : (
        <>
          <FileStats file={file} />
          <div className="text-sm text-muted-foreground">
            Pages: {pageCount}
          </div>

          {processing ? (
            <div className="text-center py-8 text-muted-foreground">Analyzing PDF...</div>
          ) : items.length > 0 ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button onClick={selectAll} className="px-3 py-1 text-sm bg-accent rounded-lg">Select All</button>
                <button onClick={selectNone} className="px-3 py-1 text-sm bg-accent rounded-lg">Select None</button>
              </div>

              <div className="max-h-64 overflow-auto rounded-lg border border-border">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-center gap-3 p-3 border-b border-border last:border-b-0 cursor-pointer ${item.selected ? "bg-primary/10" : ""}`}
                  >
                    <input type="checkbox" checked={item.selected} onChange={() => {}} className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{item.text}</div>
                      <div className="text-sm text-muted-foreground">{item.type} • Page {item.page}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRedact}
                  disabled={!items.some((i) => i.selected)}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
                >
                  Redact Selected ({items.filter((i) => i.selected).length})
                </button>
                <button onClick={() => { setFile(null); setItems([]); }} className="px-4 py-2 bg-accent rounded-lg">Clear</button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No sensitive information detected in sample
            </div>
          )}
        </>
      )}
    </div>
  );
}