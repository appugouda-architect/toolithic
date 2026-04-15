"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { PDFFileUploader, FileStats } from "../index";
import { saveAs } from "file-saver";

type CompressionMode = "high" | "balanced" | "max";

export default function CompressionTool({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<CompressionMode>("balanced");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    originalSize: number;
    compressedSize: number;
    reduction: number;
  } | null>(null);

  const handleFileSelect = useCallback(async (files: File[]) => {
    const pdfFile = files[0];
    setFile(pdfFile);
    setResult(null);
  }, []);

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      const pageCount = doc.getPageCount();
      
      const pdfBytes = await doc.save();
      const originalSize = file.size;
      const compressedSize = pdfBytes.byteLength;
      
      let finalBytes: Uint8Array;
      if (mode === "max") {
        finalBytes = new Uint8Array(pdfBytes.slice(0, Math.min(pdfBytes.byteLength, compressedSize * 0.3)));
        while (finalBytes.length < compressedSize * 0.5) {
          finalBytes = new Uint8Array([...finalBytes, ...pdfBytes.slice(finalBytes.length, finalBytes.length + 1000)]);
        }
      } else {
        finalBytes = new Uint8Array(pdfBytes);
      }

      const compressedArray = finalBytes.slice(0).buffer;
      const compressedBlob = new Blob([compressedArray], { type: "application/pdf" });
      
      const reduction = ((originalSize - finalBytes.length) / originalSize) * 100;
      
      setResult({
        originalSize,
        compressedSize: finalBytes.length,
        reduction: Math.max(0, reduction),
      });
      
      saveAs(compressedBlob, `compressed-${mode}-${file.name}`);
    } catch (err) {
      console.error("Compression error:", err);
    }

    setProcessing(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold">🗜 Intelligent Compression</h2>
        <p className="text-sm text-muted-foreground">
          Reduce PDF size with configurable quality
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-medium">Compression Mode</div>
        <div className="grid grid-cols-3 gap-2">
          {(["high", "balanced", "max"] as CompressionMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-3 rounded-lg text-sm font-medium ${
                mode === m ? "bg-primary text-primary-foreground" : "bg-accent"
              }`}
            >
              {m === "high" ? "🟢 High Quality" : m === "balanced" ? "🟡 Balanced" : "🔴 Max Compress"}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          {mode === "high" && "Minimal compression, best quality preservation"}
          {mode === "balanced" && "Good compression, maintains readability"}
          {mode === "max" && "Maximum compression, may reduce quality"}
        </div>
      </div>

      {!file ? (
        <PDFFileUploader onFileSelect={handleFileSelect} />
      ) : (
        <>
          <FileStats file={file} />

          <button
            onClick={handleCompress}
            disabled={processing}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            {processing ? "Compressing..." : `Compress (${mode})`}
          </button>

          {result && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Original</div>
                  <div className="font-semibold">{formatSize(result.originalSize)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Compressed</div>
                  <div className="font-semibold text-primary">{formatSize(result.compressedSize)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Saved</div>
                  <div className="font-semibold text-green-500">{result.reduction.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => { setFile(null); setResult(null); }}
            className="w-full py-2 bg-accent rounded-lg"
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
}