"use client";

import { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReceiptScanner } from "@/components/ui/ReceiptScanner";
import type { OcrResult } from "@/lib/actions/ocr";

interface ParsedItem {
  id: string;
  name: string;
  price: number;
}

export default function ScanReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantName = searchParams.get('restaurant') || 'the restaurant';

  const resolvedParams = use(params);
  const partyId = resolvedParams.id;

  const [scannedItems, setScannedItems] = useState<ParsedItem[]>([]);
  const [scannedTax, setScannedTax] = useState<number | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  const handleScanComplete = (result: OcrResult) => {
    setScannedItems(result.items);
    setScannedTax(result.tax);
    setHasScanned(true);
  };

  const handleRemoveItem = (idToRemove: string) => {
    setScannedItems(prev => prev.filter(item => item.id !== idToRemove));
  };

  const handleUpdateItem = (id: string, field: 'name' | 'price', value: string) => {
    setScannedItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: field === 'price' ? (parseFloat(value) || 0) : value } : item
    ));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;
    setScannedItems(prev => [...prev, {
      id: `manual-${Date.now()}`,
      name: newItemName.trim(),
      price: parseFloat(newItemPrice)
    }]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const handleContinue = () => {
    sessionStorage.setItem(`party_${partyId}_items`, JSON.stringify(scannedItems));
    sessionStorage.setItem(`party_${partyId}_restaurant`, restaurantName);
    if (scannedTax !== null) {
      sessionStorage.setItem(`party_${partyId}_tax`, String(scannedTax));
    } else {
      sessionStorage.removeItem(`party_${partyId}_tax`);
    }
    router.push(`/party/${partyId}/claim`);
  };

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-50 text-black p-6 pb-24">
      <header className="flex flex-col mb-8">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-black">Add Bill</h1>
          <button onClick={() => router.back()} className="text-gray-400 hover:text-black text-sm transition-colors">
            Back
          </button>
        </div>
        <p className="text-yellow-600 font-medium text-sm">@ {restaurantName}</p>
      </header>

      {!hasScanned ? (
        <div className="space-y-6">
          <p className="text-gray-400 text-sm text-center">
            Snap a clear photo of your receipt. We'll extract items and tax automatically.
          </p>
          <ReceiptScanner onScanComplete={handleScanComplete} />

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <button
            onClick={() => setHasScanned(true)}
            className="w-full bg-white hover:bg-gray-50 text-black font-medium py-4 rounded-2xl border border-gray-200 shadow-sm transition-colors"
          >
            Enter Items Manually
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex justify-between items-end">
            <h2 className="text-lg font-semibold text-black">Verify Items</h2>
            <button
              onClick={() => { setHasScanned(false); setScannedItems([]); setScannedTax(null); }}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
            >
              Rescan Receipt
            </button>
          </div>

          {scannedTax !== null && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-sm text-yellow-700">
              <span>Tax detected:</span>
              <span className="font-mono font-bold">${scannedTax.toFixed(2)}</span>
              <span className="text-gray-400 ml-auto text-xs">(editable next step)</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            {scannedItems.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No items added yet. Add them below!
              </div>
            ) : (
              scannedItems.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                    className="flex-grow bg-transparent border-b border-transparent hover:border-gray-300 focus:border-yellow-400 focus:outline-none text-sm font-medium"
                    placeholder="Item name"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.price || ''}
                      onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-yellow-400 focus:outline-none w-16 text-right font-mono text-sm text-black"
                      placeholder="0.00"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-gray-300 hover:text-rose-500 transition-colors text-xs ml-1"
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddItem} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name"
              className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-black placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
            <div className="relative w-24">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-6 pr-3 py-2 text-sm text-black placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>
            <button
              type="submit"
              disabled={!newItemName.trim() || !newItemPrice}
              className="bg-black hover:bg-zinc-800 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              Add
            </button>
          </form>

          <button
            onClick={handleContinue}
            disabled={scannedItems.length === 0}
            className="w-full bg-black hover:bg-zinc-800 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-colors"
          >
            Continue to Split
          </button>
        </div>
      )}
    </main>
  );
}
