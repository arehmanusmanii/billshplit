import Link from "next/link";
import Image from "next/image";

import { BalanceCard } from "@/components/ui/BalanceCard";
import { MatchHistoryFeed } from "@/components/ui/MatchHistoryFeed";
import { BottomNav } from "@/components/ui/BottomNav";
import { getUserNetBalance, getMatchHistory } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationBell } from "@/components/ui/NotificationBell";

export default async function Home() {
  let netBalance = 0;
  let matchHistory: any[] = [];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  try {
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
    <>
      <main className="max-w-md mx-auto min-h-screen bg-gray-50 text-black px-5 pt-6 pb-28">

        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Billshplit" width={34} height={34} className="rounded-xl" />
            <span className="text-xl font-bold text-black tracking-tight">Billshplit</span>
          </Link>

          <div className="flex items-center gap-2">
            <NotificationBell userId={user.id} />
            <Link
              href={`/profile/${user.id}`}
              className="w-9 h-9 bg-black rounded-full overflow-hidden hover:ring-2 hover:ring-yellow-400 transition-all flex items-center justify-center"
            >
              <span className="text-white text-sm font-medium">
                {user.email?.[0].toUpperCase() ?? '?'}
              </span>
            </Link>
          </div>
        </header>

        {/* Balance */}
        <BalanceCard netBalance={netBalance} />

        {/* New Match CTA */}
        <div className="mb-10">
          <a
            href="/party/new"
            className="block w-full bg-black hover:bg-zinc-800 text-center text-white font-bold py-4 rounded-2xl transition-colors shadow-sm text-sm tracking-wide"
          >
            + New Match
          </a>
        </div>

        {/* Match History */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-black">Match History</h2>
          {matchHistory.length > 0 && (
            <span className="text-xs text-gray-400">{matchHistory.length} matches</span>
          )}
        </div>
        <MatchHistoryFeed matches={matchHistory} />

      </main>

      <BottomNav />
    </>
  );
}
