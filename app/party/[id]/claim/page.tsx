"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createExpense } from "@/lib/actions/expense";
import { getFriends } from "@/lib/actions/seed";
import { DUMMY_USER_ID } from "@/lib/constants";

interface ParsedItem {
  id: string;
  name: string;
  price: number;
}

interface Member {
  id: string;
  full_name: string;
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

  const LEADER_ID = DUMMY_USER_ID;

  useEffect(() => {
    // Load items from session storage
    const storedItems = sessionStorage.getItem(`party_${partyId}_items`);
    if (storedItems) {
      const parsed = JSON.parse(storedItems);
      setItems(parsed);
      // Initialize assignments
      const initialAssignments: Record<string, string[]> = {};
      parsed.forEach((item: ParsedItem) => {
        initialAssignments[item.id] = [];
      });
      setItemAssignments(initialAssignments);
    }

    // Fetch existing friends from the database
    getFriends().then(users => {
      setMembers(users);
      setInitializing(false);
    });
  }, [partyId]);

  const toggleAssignment = (itemId: string, memberId: string) => {
    setItemAssignments(prev => {
      const current = prev[itemId] || [];
      if (current.includes(memberId)) {
        return { ...prev, [itemId]: current.filter(id => id !== memberId) };
      } else {
        return { ...prev, [itemId]: [...current, memberId] };
      }
    });
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      const taxAmount = parseFloat(tax) || 0;
      
      // Format items for the math engine
      const expenseItems = items.map(item => ({
        itemName: item.name,
        price: item.price,
        consumerIds: itemAssignments[item.id] || []
      }));

      // Find all unique members involved to split the tax equally
      const involvedMemberIds = new Set<string>();
      Object.values(itemAssignments).forEach(consumerList => {
        consumerList.forEach(id => involvedMemberIds.add(id));
      });
      // Leader is always involved since they paid
      involvedMemberIds.add(LEADER_ID);
      const partyMemberIds = Array.from(involvedMemberIds);

      // Assume everyone except the leader is being covered (needs to pay back)
      const coveredUserIds = partyMemberIds.filter(id => id !== LEADER_ID);

      await createExpense({
        partyId,
        payerId: LEADER_ID,
        restaurantName: "Scanned Restaurant", // We'd ideally pass this from the previous page
        items: expenseItems,
        totalTax: taxAmount,
        partyMemberIds,
        coveredUserIds,
      });

      // Clear session storage
      sessionStorage.removeItem(`party_${partyId}_items`);
      
      // Go to dashboard to see the updated balances!
      router.push("/");
    } catch (error) {
      console.error("Failed to finalize expense", error);
      alert("Failed to split bill. Check console.");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">Loading lobby...</div>;
  }

  const isAllAssigned = items.every(item => (itemAssignments[item.id]?.length || 0) > 0);

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-900 text-white p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Claim Items</h1>
        <p className="text-gray-400">Who ate what?</p>
      </header>

      <div className="space-y-6">
        {items.map(item => (
          <div key={item.id} className="bg-gray-800 p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-lg">{item.name}</span>
              <span className="font-mono text-emerald-400">${item.price.toFixed(2)}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {members.map(member => {
                const isSelected = itemAssignments[item.id]?.includes(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleAssignment(item.id, member.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isSelected 
                        ? 'bg-emerald-500 text-white border-transparent' 
                        : 'bg-gray-900 text-gray-400 border border-white/10 hover:border-white/30'
                    }`}
                  >
                    {member.full_name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="bg-gray-800 p-4 rounded-2xl border border-white/10">
          <label className="block text-sm font-medium text-gray-400 mb-2">Total Tax & Tip ($)</label>
          <input
            type="number"
            step="0.01"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-2">This will be split equally among everyone who ate.</p>
        </div>

        <button
          onClick={handleFinalize}
          disabled={loading || !isAllAssigned}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors mt-8"
        >
          {loading ? "Calculating Math..." : isAllAssigned ? "Finalize & Split Bill" : "Assign All Items to Continue"}
        </button>
      </div>
    </main>
  );
}
