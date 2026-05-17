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
    return <p className="text-gray-400 text-sm">No match history yet. Go eat!</p>;
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <div key={match.splitId} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-black">{match.restaurantName || 'Unknown Restaurant'}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {match.partyName} · {match.date ? new Date(match.date).toLocaleDateString() : 'Unknown Date'}
              </p>
            </div>
            <div className="text-right">
              <span className={`font-mono text-base font-bold ${
                match.status === 'covered' ? 'text-rose-500' :
                match.status === 'paid' ? 'text-yellow-500' :
                'text-gray-400'
              }`}>
                ${match.userShare.toFixed(2)}
              </span>
              <p className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">{match.status}</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-2">
            <p className="text-xs text-gray-400">Total: ${match.totalBill?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
