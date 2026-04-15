"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { PDFFileUploader, FileStats } from "../index";
import { saveAs } from "file-saver";

type SecurityAction = "unlock" | "protect";

export default function SecurityTool({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [action, setAction] = useState<SecurityAction>("protect");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(false);

  const handleFileSelect = useCallback(async (files: File[]) => {
    const pdfFile = files[0];
    setFile(pdfFile);
    setError("");
    setIsEncrypted(false);
  }, []);

  const handleProcess = async () => {
    if (!file) return;
    
    if (action === "protect") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (!password || password.length < 4) {
        setError("Password must be at least 4 characters");
        return;
      }
    }

    setProcessing(true);
    setError("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      
      const pdfBytes = await doc.save();
      const uint8Array = new Uint8Array(pdfBytes);
      const blob = new Blob([uint8Array], { type: "application/pdf" });
      const prefix = action === "protect" ? "protected" : "unlocked";
      saveAs(blob, `${prefix}-${file.name}`);
    } catch (err: any) {
      setError(err.message || "Failed to process PDF");
    }

    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold">🔓 PDF Security</h2>
        <p className="text-sm text-muted-foreground">
          Add or remove password protection
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-medium">Action</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setAction("protect"); setIsEncrypted(false); }}
            className={`py-3 rounded-lg text-sm font-medium ${
              action === "protect" && !isEncrypted
                ? "bg-primary text-primary-foreground"
                : "bg-accent"
            }`}
          >
            🔒 Add Protection
          </button>
          <button
            onClick={() => setAction("unlock")}
            className={`py-3 rounded-lg text-sm font-medium ${
              action === "unlock"
                ? "bg-primary text-primary-foreground"
                : "bg-accent"
            }`}
          >
            🔓 Unlock PDF
          </button>
        </div>
      </div>

      {!file ? (
        <PDFFileUploader onFileSelect={handleFileSelect} />
      ) : (
        <>
          <FileStats file={file} />

          {isEncrypted && action === "unlock" && (
            <div className="rounded-lg bg-yellow-500/10 p-3 text-yellow-500 text-sm">
              ⚠️ This PDF is password protected.
            </div>
          )}

          <div className="space-y-3">
            {action === "unlock" ? (
              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full mt-1 h-10 rounded-lg border border-border bg-card px-3"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium">Set Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full mt-1 h-10 rounded-lg border border-border bg-card px-3"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full mt-1 h-10 rounded-lg border border-border bg-card px-3"
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleProcess}
            disabled={processing || !password}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            {processing
              ? "Processing..."
              : action === "protect"
                ? "Add Password Protection"
                : "Unlock PDF"}
          </button>

          <button
            onClick={() => { setFile(null); setPassword(""); setConfirmPassword(""); setError(""); }}
            className="w-full py-2 bg-accent rounded-lg"
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
}