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
      // Regex to look for quantities at the start (e.g. "2x Burger" or "2 Burger")
      const qtyRegex = /^(\d+)[xX]?\s+(.*)/;

      // Words that indicate this is not a food item
      const ignoreKeywords = ['total', 'tax', 'tip', 'cash', 'change', 'rm', 'balance', 'due', 'subtotal', 'visa', 'mastercard', 'amount'];

      lines.forEach(line => {
        const match = line.match(priceRegex);
        if (match) {
          let price = parseFloat(match[1]);
          let name = line.replace(priceRegex, '').trim();
          
          const lowerName = name.toLowerCase();
          const shouldIgnore = ignoreKeywords.some(keyword => lowerName.includes(keyword)) || name.length <= 2;

          if (!shouldIgnore) {
            // Check for quantity (e.g., if it says "2x Burgers $10.00", we want 2 items of $5.00 each)
            const qtyMatch = name.match(qtyRegex);
            let qty = 1;
            
            if (qtyMatch) {
               qty = parseInt(qtyMatch[1], 10);
               name = qtyMatch[2].trim();
               // Assume the price listed is the total price for all qty, so divide it
               price = price / qty;
            }

            // Push an individual row for every quantity so friends can claim them separately
            for (let i = 0; i < qty; i++) {
               parsedItems.push({
                 id: `item-${idCounter++}`,
                 name: qty > 1 ? `${name} (${i+1}/${qty})` : name,
                 price: parseFloat(price.toFixed(2))
               });
            }
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
