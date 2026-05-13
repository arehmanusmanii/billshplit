import { BalanceCard } from "@/components/ui/BalanceCard";
import { MatchHistoryFeed } from "@/components/ui/MatchHistoryFeed";
import { getUserNetBalance, getMatchHistory } from "@/lib/actions/profile";

// Dummy user ID for testing since we don't have an active auth session hooked up to the UI yet.
// In a real app, you'd get this from `const supabase = createServerComponentClient({ cookies })`
// and `const { data: { session } } = await supabase.auth.getSession()`
const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000"; 

export default async function Home() {
  let netBalance = 0;
  let matchHistory: any[] = [];
  
  try {
    // Fetch data in parallel for speed
    const [balanceData, historyData] = await Promise.all([
      getUserNetBalance(DUMMY_USER_ID).catch(() => ({ netBalance: 0, totalOwedToUser: 0, totalUserOwes: 0 })),
      getMatchHistory(DUMMY_USER_ID).catch(() => [])
    ]);
    
    netBalance = balanceData.netBalance;
    matchHistory = historyData;
  } catch (error) {
    console.error("Failed to load dashboard data", error);
  }

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-900 text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Billshplit 💸</h1>
        <div className="w-10 h-10 bg-gray-700 rounded-full border border-white/10 overflow-hidden">
            {/* Placeholder for Avatar */}
            <div className="w-full h-full bg-emerald-500/20 flex items-center justify-center">
                👤
            </div>
        </div>
      </header>

      {/* Balance Card - The "Pro" Look */}
      <BalanceCard netBalance={netBalance} />

      <h2 className="text-lg font-semibold mb-4">Match History</h2>
      
      {/* U.GG Style Match History Feed */}
      <MatchHistoryFeed matches={matchHistory} />

    </main>
  );
}
