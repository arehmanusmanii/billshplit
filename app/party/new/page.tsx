"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createParty } from "@/lib/actions/party";

const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000";

export default function NewPartyPage() {
  const [name, setName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // TODO: Integrate Google Maps Places API here later.
  // For now, it's just a text input, but we pretend it's a searchable dropdown.
  const handleRestaurantSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestaurantName(e.target.value);
    // In the future: fetch suggestions from Google API here based on e.target.value
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !restaurantName.trim()) return;

    setLoading(true);
    try {
      // Pass restaurant name to party creation if we update the schema later, 
      // or we just save it in state to pass to the expense creation next.
      // For now, we just create the party.
      const party = await createParty(name, DUMMY_USER_ID);
      
      // Navigate to the new Match/Expense details page to scan the receipt
      // We pass the restaurant name as a query param or we'd save it in context/db.
      router.push(`/party/${party.id}/scan?restaurant=${encodeURIComponent(restaurantName)}`); 
    } catch (error) {
      console.error("Failed to create party", error);
      alert("Failed to create party. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-900 text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">New Match 🎮</h1>
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
          Cancel
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
            Match Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. Pizza Night 🍕"
            required
          />
        </div>

        <div>
          <label htmlFor="restaurant" className="block text-sm font-medium text-gray-400 mb-2">
            Restaurant
          </label>
          <div className="relative">
            <input
              type="text"
              id="restaurant"
              value={restaurantName}
              onChange={handleRestaurantSearch}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Search restaurant (Google Maps API later)"
              required
            />
            {/* Future: dropdown of suggested restaurants goes here */}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim() || !restaurantName.trim()}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors mt-8"
        >
          {loading ? "Creating..." : "Continue to Receipt Scan"}
        </button>
      </form>
    </main>
  );
}
