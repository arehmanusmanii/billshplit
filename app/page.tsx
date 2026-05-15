import Link from "next/link";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { MatchHistoryFeed } from "@/components/ui/MatchHistoryFeed";
import { getUserNetBalance, getMatchHistory } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signout } from "@/app/login/actions";

export default async function Home() {
  let netBalance = 0;
  let matchHistory: any[] = [];
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  try {
    // Fetch data in parallel for speed
    const [balanceData, historyData] = await Promise.all([
      getUserNetBalance(user.id).catch(() => ({ netBalance: 0, totalOwedToUser: 0, totalUserOwes: 0 })),
      getMatchHistory(user.id).catch(() => [])
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
        <div className="flex items-center gap-4">
          <form action={signout}>
            <button className="text-sm text-gray-400 hover:text-white">Sign Out</button>
          </form>
          <div className="w-10 h-10 bg-gray-700 rounded-full border border-white/10 overflow-hidden">
              {/* Placeholder for Avatar */}
              <div className="w-full h-full bg-emerald-500/20 flex items-center justify-center">
                  👤
              </div>
          </div>
        </div>
      </header>

      {/* Balance Card - The "Pro" Look */}
      <BalanceCard netBalance={netBalance} />

      {/* Quick Actions */}
      <div className="mb-8">
        <a 
          href="/party/new" 
          className="block w-full bg-emerald-500 hover:bg-emerald-600 text-center text-white font-bold py-4 rounded-xl transition-colors"
        >
          + New Match
        </a>
      </div>

      <h2 className="text-lg font-semibold mb-4">Match History</h2>
      
      {/* U.GG Style Match History Feed */}
      <MatchHistoryFeed matches={matchHistory} />

    </main>
  );
}
