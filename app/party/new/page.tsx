"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createParty } from "@/lib/actions/party";

const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000";

export default function NewPartyPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const party = await createParty(name, DUMMY_USER_ID);
      // Once created, we should navigate to the party details or directly to add an expense
      router.push(`/`); // For now, just back to dashboard, later we can go to /party/${party.id}
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
            Party Name
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

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors"
        >
          {loading ? "Creating..." : "Create Lobby"}
        </button>
      </form>
    </main>
  );
}
