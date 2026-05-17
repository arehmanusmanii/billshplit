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

  const skipToManual = () => {
    setHasScanned(true);
  };

  const handleRemoveItem = (idToRemove: string) => {
    setScannedItems(prev => prev.filter(item => item.id !== idToRemove));
  };

  const handleUpdateItem = (id: string, field: 'name' | 'price', value: string) => {
    setScannedItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === 'price' ? (parseFloat(value) || 0) : value };
      }
      return item;
    }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;

    setScannedItems(prev => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        name: newItemName.trim(),
        price: parseFloat(newItemPrice)
      }
    ]);
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
    <main className="max-w-md mx-auto min-h-screen bg-gray-900 text-white p-6 pb-24">
      <header className="flex flex-col mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Add Bill</h1>
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white">Back</button>
        </div>
        <p className="text-emerald-400">@ {restaurantName}</p>
      </header>

      {!hasScanned ? (
        <div className="space-y-6">
          <p className="text-gray-400 text-center">Snap a clear photo of your receipt. We'll extract items and tax automatically.</p>
          <ReceiptScanner onScanComplete={handleScanComplete} />

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button
            onClick={skipToManual}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-4 rounded-xl border border-white/10 transition-colors"
          >
            Enter Items Manually
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-lg font-semibold">Verify Items</h2>
            <button
              onClick={() => { setHasScanned(false); setScannedItems([]); setScannedTax(null); }}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Rescan Receipt
            </button>
          </div>

          {scannedTax !== null && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 text-sm text-emerald-400">
              <span>Tax detected:</span>
              <span className="font-mono font-bold">${scannedTax.toFixed(2)}</span>
              <span className="text-gray-500 ml-auto">(editable on next step)</span>
            </div>
          )}

          <div className="bg-gray-800 rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
            {scannedItems.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                No items added yet. Add them below!
              </div>
            ) : (
              scannedItems.map((item) => (
                <div key={item.id} className="p-4 flex flex-col gap-2 group">
                  <div className="flex justify-between items-center gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-gray-600 focus:border-emerald-500 focus:outline-none w-full font-medium"
                      placeholder="Item name"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-mono">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.price || ''}
                        onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-gray-600 focus:border-emerald-500 focus:outline-none w-16 text-right font-mono text-emerald-400"
                        placeholder="0.00"
                      />
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-500 hover:text-rose-400 transition-colors ml-2"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Manual add form */}
          <form onSubmit={handleAddItem} className="bg-gray-800/50 p-4 rounded-2xl border border-white/5 flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g. Burger"
              className="flex-grow bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
            />
            <div className="relative w-24">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-900 border border-white/10 rounded-xl pl-6 pr-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={!newItemName.trim() || !newItemPrice}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              Add
            </button>
          </form>

          <button
            onClick={handleContinue}
            disabled={scannedItems.length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors mt-8"
          >
            Continue to Split
          </button>
        </div>
      )}
    </main>
  );
}
