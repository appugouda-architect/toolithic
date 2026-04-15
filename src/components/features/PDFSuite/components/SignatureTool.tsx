"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { PDFFileUploader, FileStats } from "../index";
import { saveAs } from "file-saver";

export default function SignatureTool({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [position, setPosition] = useState({ x: 300, y: 150 });
  const [scale, setScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (signatureMode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [signatureMode]);

  const handleFileSelect = useCallback(async (files: File[]) => {
    const pdfFile = files[0];
    setFile(pdfFile);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    if (canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    setSignatureData(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSignatureData(ev.target?.result as string);
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const handleApplySignature = async () => {
    if (!file || (!signatureData && !canvasRef.current?.toDataURL())) return;
    setProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      const pageCount = doc.getPageCount();
      
      const sigData = signatureData || canvasRef.current?.toDataURL();
      
      if (sigData) {
        try {
          const imageBytes = await fetch(sigData).then((r) => r.arrayBuffer());
          let image;
          try {
            image = await doc.embedPng(imageBytes);
          } catch {
            image = await doc.embedJpg(imageBytes);
          }
          
          for (let i = 0; i < pageCount; i++) {
            const page = doc.getPage(i);
            const { width, height } = page.getSize();
            
            const imgWidth = Math.min(200, width * 0.4) * scale;
            const imgHeight = (image.height / (image.width || 1)) * imgWidth;
            
            page.drawImage(image, {
              x: position.x,
              y: height - position.y - imgHeight,
              width: imgWidth,
              height: imgHeight,
            });
          }
        } catch (imgErr) {
          console.error("Error embedding image:", imgErr);
          
          const page = doc.getPage(0);
          const { height } = page.getSize();
          page.drawText("Signed: ___________________", {
            x: position.x,
            y: height - position.y,
            size: 14,
            color: rgb(0, 0, 0),
          });
        }
      }

      const pdfBytes = await doc.save();
      const uint8Array = new Uint8Array(pdfBytes);
      const blob = new Blob([uint8Array], { type: "application/pdf" });
      saveAs(blob, `signed-${file.name}`);
    } catch (err) {
      console.error("Error adding signature:", err);
    }

    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold">✍️ Digital Signature</h2>
        <p className="text-sm text-muted-foreground">
          Add your signature to PDF documents
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-medium">Signature Method</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setSignatureMode("draw"); clearCanvas(); }}
            className={`py-3 rounded-lg text-sm font-medium ${
              signatureMode === "draw"
                ? "bg-primary text-primary-foreground"
                : "bg-accent"
            }`}
          >
            ✏️ Draw Signature
          </button>
          <button
            onClick={() => { setSignatureMode("upload"); clearCanvas(); }}
            className={`py-3 rounded-lg text-sm font-medium ${
              signatureMode === "upload"
                ? "bg-primary text-primary-foreground"
                : "bg-accent"
            }`}
          >
            📤 Upload Image
          </button>
        </div>
      </div>

      {signatureMode === "draw" ? (
        <div className="space-y-2">
          <div className="text-sm font-medium">Draw your signature below</div>
          <canvas
            ref={canvasRef}
            width={400}
            height={120}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-28 rounded-lg border-2 border-dashed border-border bg-white cursor-crosshair touch-none"
          />
          <button onClick={clearCanvas} className="px-3 py-1 text-sm bg-accent rounded-lg">
            Clear
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm font-medium">Upload signature image (PNG/JPG)</div>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleImageUpload}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer"
          />
          {signatureData && (
            <img src={signatureData} alt="Signature preview" className="h-20 object-contain border rounded" />
          )}
        </div>
      )}

      {!file ? (
        <PDFFileUploader onFileSelect={handleFileSelect} />
      ) : (
        <>
          <FileStats file={file} />

          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-medium">Signature Position</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">X Position (0-{position.x})</label>
                <input
                  type="range"
                  min={0}
                  max={500}
                  value={position.x}
                  onChange={(e) => setPosition({ ...position, x: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Y Position (0-{position.y})</label>
                <input
                  type="range"
                  min={0}
                  max={300}
                  value={position.y}
                  onChange={(e) => setPosition({ ...position, y: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Size Scale: {scale.toFixed(1)}x</label>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <button
            onClick={handleApplySignature}
            disabled={processing || (!signatureData && !canvasRef.current?.toDataURL())}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            {processing ? "Applying..." : "Apply Signature"}
          </button>

          <button
            onClick={() => { setFile(null); clearCanvas(); }}
            className="w-full py-2 bg-accent rounded-lg"
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
}