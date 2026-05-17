"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createExpense } from "@/lib/actions/expense";
import { getRecentFriends } from "@/lib/actions/party";
import { getFriends } from "@/lib/actions/seed";
import { createClient } from "@/lib/supabase/client";

interface ParsedItem {
  id: string;
  name: string;
  price: number;
}

interface Member {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
}

export default function ClaimItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const partyId = resolvedParams.id;

  const [items, setItems] = useState<ParsedItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [itemAssignments, setItemAssignments] = useState<Record<string, string[]>>({});
  const [tax, setTax] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [leaderId, setLeaderId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState("the restaurant");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setLeaderId(user.id);

      // Load items & restaurant from session storage
      const storedItems = sessionStorage.getItem(`party_${partyId}_items`);
      const storedRestaurant = sessionStorage.getItem(`party_${partyId}_restaurant`);
      const storedTax = sessionStorage.getItem(`party_${partyId}_tax`);
      if (storedRestaurant) setRestaurantName(storedRestaurant);
      if (storedTax) setTax(storedTax);
      if (storedItems) {
        const parsed = JSON.parse(storedItems);
        setItems(parsed);
        const initialAssignments: Record<string, string[]> = {};
        parsed.forEach((item: ParsedItem) => { initialAssignments[item.id] = []; });
        setItemAssignments(initialAssignments);
      }

      // Use recent friends first; fall back to all profiles if new user
      let memberList: Member[] = await getRecentFriends(user.id);
      if (memberList.length === 0) {
        memberList = await getFriends();
      }

      // Always include the leader in the member list so they can claim items too
      const leaderInList = memberList.some(m => m.id === user.id);
      if (!leaderInList) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', user.id)
          .single();
        if (profile) memberList = [profile, ...memberList];
      }

      setMembers(memberList);
      setInitializing(false);
    });
  }, [partyId]);

  const toggleAssignment = (itemId: string, memberId: string) => {
    setItemAssignments(prev => {
      const current = prev[itemId] || [];
      if (current.includes(memberId)) {
        return { ...prev, [itemId]: current.filter(id => id !== memberId) };
      }
      return { ...prev, [itemId]: [...current, memberId] };
    });
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      const taxAmount = parseFloat(tax) || 0;

      const expenseItems = items.map(item => ({
        itemName: item.name,
        price: item.price,
        consumerIds: itemAssignments[item.id] || []
      }));

      const involvedMemberIds = new Set<string>();
      Object.values(itemAssignments).forEach(list => list.forEach(id => involvedMemberIds.add(id)));
      if (leaderId) involvedMemberIds.add(leaderId);
      const partyMemberIds = Array.from(involvedMemberIds);

      await createExpense({
        partyId,
        payerId: leaderId!,
        restaurantName,
        items: expenseItems,
        totalTax: taxAmount,
        partyMemberIds,
        coveredUserIds: [], // Everyone starts as 'unpaid'; they self-report on the party page
      });

      sessionStorage.removeItem(`party_${partyId}_items`);
      sessionStorage.removeItem(`party_${partyId}_restaurant`);

      router.push(`/party/${partyId}`);
    } catch (error) {
      console.error("Failed to finalize expense", error);
      alert("Failed to split bill. Check console.");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">Loading...</div>;
  }

  const isAllAssigned = items.every(item => (itemAssignments[item.id]?.length || 0) > 0);
  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const taxAmount = parseFloat(tax) || 0;

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-900 text-white p-6 pb-24">
      <header className="mb-8">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-sm mb-4 block">
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Who Ate What?</h1>
        <p className="text-emerald-400 text-sm">@ {restaurantName}</p>
      </header>

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-gray-800 p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium">{item.name}</span>
              <span className="font-mono text-emerald-400">${item.price.toFixed(2)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {members.map(member => {
                const isSelected = itemAssignments[item.id]?.includes(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleAssignment(item.id, member.id)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-900 text-gray-400 border border-white/10 hover:border-white/30'
                    }`}
                  >
                    {member.full_name?.split(' ')[0] ?? 'User'}
                    {member.id === leaderId && ' 👑'}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="bg-gray-800 p-4 rounded-2xl border border-white/10">
          <label className="block text-sm font-medium text-gray-400 mb-2">Tax & Tip ($)</label>
          <input
            type="number"
            step="0.01"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-2">Split equally among everyone who ate.</p>
        </div>

        {/* Bill summary */}
        <div className="bg-gray-800/50 rounded-2xl border border-white/5 p-4 space-y-1 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Tax & Tip</span><span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
            <span>Total</span><span>${(subtotal + taxAmount).toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleFinalize}
          disabled={loading || !isAllAssigned || items.length === 0}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors"
        >
          {loading
            ? "Calculating..."
            : items.length === 0
            ? "No items to split"
            : isAllAssigned
            ? "Split the Bill"
            : "Assign all items to continue"}
        </button>
      </div>
    </main>
  );
}
