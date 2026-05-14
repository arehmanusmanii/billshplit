"use client";

import { useState, useRef } from "react";
import Tesseract from "tesseract.js";

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
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setProgress(0);
    setStatusText("Initializing OCR...");

    try {
      const result = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: m => {
            if (m.status === "recognizing text") {
              setProgress(Math.round(m.progress * 100));
              setStatusText(`Scanning... ${Math.round(m.progress * 100)}%`);
            } else {
              setStatusText(m.status);
            }
          }
        }
      );

      setStatusText("Parsing receipt data...");
      
      // Basic heuristic to parse receipt lines (Item Name - Price)
      // This is rudimentary and shows why AI vision is usually preferred!
      const lines = result.data.text.split('\n');
      const parsedItems: ParsedItem[] = [];
      let idCounter = 0;

      // Extremely basic regex to look for a price at the end of a line
      const priceRegex = /\$?(\d+\.\d{2})$/;

      lines.forEach(line => {
        const match = line.match(priceRegex);
        if (match) {
          const price = parseFloat(match[1]);
          const name = line.replace(priceRegex, '').trim();
          
          // Filter out obvious non-items or empty names
          if (name.length > 2 && !name.toLowerCase().includes('total') && !name.toLowerCase().includes('tax')) {
             parsedItems.push({
               id: `item-${idCounter++}`,
               name,
               price
             });
          }
        }
      });

      setIsScanning(false);
      onScanComplete(parsedItems);

    } catch (error) {
      console.error("OCR Error:", error);
      setStatusText("Failed to read receipt. Please try again.");
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-white/10 text-center">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" // Suggests using the back camera on mobile
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
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-gray-400 animate-pulse">{statusText}</p>
        </div>
      )}
    </div>
  );
}
