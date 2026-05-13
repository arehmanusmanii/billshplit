import React from 'react';

interface BalanceCardProps {
  netBalance: number;
}

export function BalanceCard({ netBalance }: BalanceCardProps) {
  const isOwed = netBalance > 0;
  const isDebt = netBalance < 0;
  const isEven = netBalance === 0;

  return (
    <div className="bg-gray-800 p-6 rounded-3xl border border-white/10 shadow-xl mb-6">
      <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">
        {isOwed ? 'You are owed' : isDebt ? 'You owe' : 'All Settled Up'}
      </p>
      <p className={`text-4xl font-bold ${isOwed ? 'text-emerald-400' : isDebt ? 'text-rose-400' : 'text-gray-300'}`}>
        ${Math.abs(netBalance).toFixed(2)}
      </p>
    </div>
  );
}
