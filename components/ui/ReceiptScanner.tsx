"use client";

import { useState, useRef } from "react";
import { parseReceiptWithGroq, type OcrResult } from "@/lib/actions/ocr";

interface ParsedItem {
  id: string;
  name: string;
  price: number;
}

interface ReceiptScannerProps {
  onScanComplete: (result: OcrResult) => void;
}

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [statusText, setStatusText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          } else {
            reject(new Error("Canvas to Blob failed"));
          }
        }, "image/jpeg", 0.7);
      };
      img.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setStatusText("Optimizing image for AI...");

    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressedFile);

      setStatusText("Reading receipt...");
      const result = await parseReceiptWithGroq(formData);

      setStatusText("Success!");
      setIsScanning(false);
      onScanComplete(result);
    } catch (error: any) {
      console.error("OCR Error:", error);
      setStatusText(error.message || "Failed to read receipt. Please try again or add items manually.");
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
      {/* Camera input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      {/* Gallery input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={galleryInputRef}
        onChange={handleFileUpload}
      />

      {!isScanning ? (
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-black hover:bg-zinc-800 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
          >
            📷 Camera
          </button>
          <button
            onClick={() => galleryInputRef.current?.click()}
            className="flex-1 bg-white hover:bg-gray-50 text-black font-semibold py-4 rounded-xl border border-gray-200 flex items-center justify-center gap-2 transition-colors text-sm"
          >
            🖼️ Gallery
          </button>
        </div>
      ) : (
        <div className="py-4">
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
            <div className="bg-yellow-400 h-full w-full animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-400 animate-pulse">{statusText}</p>
        </div>
      )}
    </div>
  );
}
