"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { PDF_FEATURES, type PDFFeature, type PDFFeatureInfo } from "./types";
import RedactionTool from "./components/RedactionTool";
import OCRTool from "./components/OCRTool";
import CompressionTool from "./components/CompressionTool";
import ConversionTool from "./components/ConversionTool";
import SecurityTool from "./components/SecurityTool";
import SignatureTool from "./components/SignatureTool";

const featureComponents: Record<PDFFeature, React.ComponentType<{ onBack: () => void }>> = {
  redaction: RedactionTool,
  ocr: OCRTool,
  compression: CompressionTool,
  conversion: ConversionTool,
  security: SecurityTool,
  signature: SignatureTool,
};

export function PDFSuite() {
  const [selectedFeature, setSelectedFeature] = useState<PDFFeature | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFeatureClick = (feature: PDFFeatureInfo) => {
    setSelectedFeature(feature.id);
  };

  const handleBack = () => {
    setSelectedFeature(null);
  };

  const FeatureComponent = selectedFeature ? featureComponents[selectedFeature] : null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Privacy-First Offline PDF Suite</h1>
        <p className="text-muted-foreground">
          All processing happens locally in your browser - your files never leave your device
        </p>
      </div>

      {selectedFeature && FeatureComponent ? (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button
            onClick={handleBack}
            className="mb-4 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to all tools
          </button>
          <FeatureComponent onBack={handleBack} />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PDF_FEATURES.map((feature) => (
            <motion.button
              key={feature.id}
              onClick={() => handleFeatureClick(feature)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-start rounded-xl border border-border bg-card p-5 text-left transition-colors hover:bg-accent"
            >
              <div
                className={`mb-3 rounded-lg bg-gradient-to-br ${feature.color} px-3 py-2 text-2xl`}
              >
                {feature.icon}
              </div>
              <h3 className="mb-1 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.button>
          ))}
        </motion.div>
      )}

      <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" />
    </div>
  );
}

export function PDFFileUploader({
  onFileSelect,
  accept = ".pdf",
  multiple = false,
}: {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        accept.includes(f.type) || f.name.endsWith(".pdf")
      );
      if (files.length > 0) {
        onFileSelect(files);
      }
    },
    [onFileSelect, accept]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileSelect(files);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        dragging
          ? "border-primary bg-primary/10"
          : "border-border hover:border-muted-foreground"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <div className="text-4xl mb-2">📄</div>
      <div className="font-medium">
        Drag & drop PDF{multiple ? "s" : ""} here
      </div>
      <div className="text-sm text-muted-foreground">
        or click to browse
      </div>
    </div>
  );
}

export function FileStats({ file }: { file: File }) {
  const size = file.size;
  const formattedSize =
    size < 1024
      ? `${size} B`
      : size < 1024 * 1024
        ? `${(size / 1024).toFixed(1)} KB`
        : `${(size / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="text-2xl">📄</div>
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{file.name}</div>
        <div className="text-sm text-muted-foreground">{formattedSize}</div>
      </div>
    </div>
  );
}