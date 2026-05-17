import React from 'react';

interface BalanceCardProps {
  netBalance: number;
}

export function BalanceCard({ netBalance }: BalanceCardProps) {
  const isOwed = netBalance > 0;
  const isDebt = netBalance < 0;

  return (
    <div className="bg-black p-6 rounded-3xl border border-black/10 shadow-sm mb-6">
      <p className="text-white/50 text-xs mb-1 uppercase tracking-wider font-medium">
        {isOwed ? 'You are owed' : isDebt ? 'You owe' : 'All Settled Up'}
      </p>
      <p className={`text-4xl font-bold ${isOwed ? 'text-yellow-400' : isDebt ? 'text-rose-400' : 'text-white/60'}`}>
        ${Math.abs(netBalance).toFixed(2)}
      </p>
    </div>
  );
}
