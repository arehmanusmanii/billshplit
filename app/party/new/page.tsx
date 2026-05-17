"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createParty, getRecentFriends } from "@/lib/actions/party";
import { createClient } from "@/lib/supabase/client";

interface Friend {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
}

export default function NewPartyPage() {
  const [name, setName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [recentFriends, setRecentFriends] = useState<Friend[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      const friends = await getRecentFriends(user.id);
      setRecentFriends(friends);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !restaurantName.trim() || !userId) return;

    setLoading(true);
    try {
      const party = await createParty(name, userId);
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
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-sm">
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
          <input
            type="text"
            id="restaurant"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. Joe's Pizza"
            required
          />
        </div>

        {/* Frequent Squad — shown once user has match history */}
        {recentFriends.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-400 mb-3">Frequent Squad</p>
            <div className="flex flex-wrap gap-2">
              {recentFriends.slice(0, 8).map(friend => (
                <div
                  key={friend.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-white/10 rounded-full text-sm text-gray-300"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">
                    {friend.full_name?.[0] ?? '?'}
                  </div>
                  {friend.full_name?.split(' ')[0] ?? 'User'}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">People you've eaten with before. Assign items to them on the next step.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim() || !restaurantName.trim()}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors mt-4"
        >
          {loading ? "Creating..." : "Continue to Receipt Scan"}
        </button>
      </form>
    </main>
  );
}
