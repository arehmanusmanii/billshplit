import React from 'react';

interface MatchHistoryItem {
  splitId: string;
  userShare: number;
  status: string | null;
  expenseId?: string;
  restaurantName?: string | null;
  totalBill?: number;
  date?: string | null;
  payerId?: string | null;
  partyName: string;
}

interface MatchHistoryFeedProps {
  matches: MatchHistoryItem[];
}

export function MatchHistoryFeed({ matches }: MatchHistoryFeedProps) {
  if (!matches || matches.length === 0) {
    return <p className="text-gray-500">No match history yet. Go eat!</p>;
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <div key={match.splitId} className="bg-gray-800/50 p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-white">{match.restaurantName || 'Unknown Restaurant'} 🍔</p>
              <p className="text-sm text-gray-500">{match.partyName} • {match.date ? new Date(match.date).toLocaleDateString() : 'Unknown Date'}</p>
            </div>
            <div className="text-right">
              <span className={`font-mono text-lg font-bold ${match.status === 'covered' ? 'text-rose-400' : match.status === 'paid' ? 'text-emerald-400' : 'text-gray-400'}`}>
                ${match.userShare.toFixed(2)}
              </span>
              <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{match.status}</p>
            </div>
          </div>
          <div className="border-t border-white/5 pt-2 mt-1">
             <p className="text-xs text-gray-400">Total Match Bill: ${match.totalBill?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
