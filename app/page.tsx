import Link from "next/link";
import Image from "next/image";

import { BalanceCard } from "@/components/ui/BalanceCard";
import { MatchHistoryFeed } from "@/components/ui/MatchHistoryFeed";
import { getUserNetBalance, getMatchHistory } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signout } from "@/app/login/actions";
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
    <main className="max-w-md mx-auto min-h-screen bg-gray-50 text-black p-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Billshplit" width={32} height={32} className="rounded-full" />
          <h1 className="text-xl font-bold text-black">Billshplit</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/friends" className="text-sm text-gray-500 hover:text-black transition-colors">
            Friends
          </Link>
          <NotificationBell userId={user.id} />
          <form action={signout}>
            <button className="text-sm text-gray-500 hover:text-black transition-colors">Sign Out</button>
          </form>
          <Link href={`/profile/${user.id}`} className="w-9 h-9 bg-black rounded-full border border-black/10 overflow-hidden hover:ring-2 hover:ring-yellow-400 transition-all flex items-center justify-center">
            <span className="text-white text-sm">
              {user.email?.[0].toUpperCase() ?? '?'}
            </span>
          </Link>
        </div>
      </header>

      <BalanceCard netBalance={netBalance} />

      <div className="mb-8">
        <a
          href="/party/new"
          className="block w-full bg-black hover:bg-zinc-800 text-center text-white font-bold py-4 rounded-2xl transition-colors shadow-sm"
        >
          + New Match
        </a>
      </div>

      <h2 className="text-base font-semibold mb-4 text-black">Match History</h2>
      <MatchHistoryFeed matches={matchHistory} />
    </main>
  );
}
