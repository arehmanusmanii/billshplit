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
    <main className="max-w-md mx-auto min-h-screen bg-gray-50 text-black p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-black">New Match</h1>
        <button onClick={() => router.back()} className="text-gray-400 hover:text-black text-sm transition-colors">
          Cancel
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-500 mb-2">
            Match Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
            placeholder="e.g. Pizza Night"
            required
          />
        </div>

        <div>
          <label htmlFor="restaurant" className="block text-sm font-medium text-gray-500 mb-2">
            Restaurant
          </label>
          <input
            type="text"
            id="restaurant"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
            placeholder="e.g. Joe's Pizza"
            required
          />
        </div>

        {recentFriends.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-3">Frequent Squad</p>
            <div className="flex flex-wrap gap-2">
              {recentFriends.slice(0, 8).map(friend => (
                <div
                  key={friend.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 shadow-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-yellow-400/20 flex items-center justify-center text-xs font-medium text-yellow-700">
                    {friend.full_name?.[0] ?? '?'}
                  </div>
                  {friend.full_name?.split(' ')[0] ?? 'User'}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">People you've eaten with before.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim() || !restaurantName.trim()}
          className="w-full bg-black hover:bg-zinc-800 disabled:opacity-40 text-white font-bold py-4 rounded-2xl transition-colors mt-2"
        >
          {loading ? "Creating..." : "Continue to Receipt Scan"}
        </button>
      </form>
    </main>
  );
}
