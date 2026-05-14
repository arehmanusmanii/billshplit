"use client";

import { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReceiptScanner } from "@/components/ui/ReceiptScanner";

interface ParsedItem {
  id: string;
  name: string;
  price: number;
}

export default function ScanReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantName = searchParams.get('restaurant') || 'the restaurant';
  
  // Unwrap the params Promise
  const resolvedParams = use(params);
  const partyId = resolvedParams.id;

  const [scannedItems, setScannedItems] = useState<ParsedItem[]>([]);
  const [hasScanned, setHasScanned] = useState(false);

  const handleScanComplete = (items: ParsedItem[]) => {
    setScannedItems(items);
    setHasScanned(true);
  };

  const handleRemoveItem = (idToRemove: string) => {
    setScannedItems(prev => prev.filter(item => item.id !== idToRemove));
  };

  const handleContinue = () => {
    // In a real app, we might save these items to the DB here, or pass them in URL/State.
    // For now, we'll serialize them into sessionStorage or just pass them as query params 
    // to the 'claim' page where the multiplayer claiming happens.
    sessionStorage.setItem(`party_${partyId}_items`, JSON.stringify(scannedItems));
    router.push(`/party/${partyId}/claim`);
  };

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-900 text-white p-6">
      <header className="flex flex-col mb-8">
        <div className="flex justify-between items-center mb-2">
           <h1 className="text-2xl font-bold">Add Bill</h1>
           <button onClick={() => router.back()} className="text-gray-400 hover:text-white">Back</button>
        </div>
        <p className="text-emerald-400">@ {restaurantName}</p>
      </header>

      {!hasScanned ? (
        <div className="space-y-6">
          <p className="text-gray-400 text-center">Snap a clear photo of your receipt. We'll try to extract the items automatically.</p>
          <ReceiptScanner onScanComplete={handleScanComplete} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-lg font-semibold">Verify Items</h2>
            <button 
              onClick={() => setHasScanned(false)} 
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              Rescan
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
            {scannedItems.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                Couldn't find any items. Try scanning again with better lighting.
              </div>
            ) : (
              scannedItems.map((item) => (
                <div key={item.id} className="p-4 flex justify-between items-center group">
                  <div>
                    <p className="font-medium">{item.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-emerald-400">${item.price.toFixed(2)}</span>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-500 hover:text-rose-400 transition-colors"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

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
