"use client";

import { useState, useRef } from "react";
import { parseReceiptWithOllama } from "@/lib/actions/ocr";

interface ParsedItem {
  id: string;
  name: string;
  price: number;
}

interface ReceiptScannerProps {
  onScanComplete: (items: ParsedItem[]) => void;
}

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [statusText, setStatusText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setStatusText("Sending to GLM-OCR model...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setStatusText("GLM-OCR is thinking (this may take a moment)...");
      const items = await parseReceiptWithOllama(formData);
      
      setStatusText("Success!");
      setIsScanning(false);
      onScanComplete(items);
    } catch (error: any) {
      console.error("OCR Error:", error);
      setStatusText(error.message || "Failed to read receipt. Make sure Ollama is running.");
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-white/10 text-center">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      
      {!isScanning ? (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-6 py-4 rounded-xl font-bold w-full flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition"
        >
          📷 Snap Receipt
        </button>
      ) : (
        <div className="py-4">
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
            <div className="bg-emerald-500 h-full w-full animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-400 animate-pulse">{statusText}</p>
        </div>
      )}
    </div>
  );
}
