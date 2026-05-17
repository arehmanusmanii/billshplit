"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  updateSplitStatus,
  requestCover,
  leaderOverrideSplitStatus,
  confirmMatch,
} from "@/lib/actions/party";

interface SplitProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

interface Split {
  id: string;
  userId: string;
  amountOwed: number;
  paymentStatus: string;
  coveredBy: string | null;
  profile: SplitProfile;
}

interface Props {
  party: { id: string; name: string; status: string | null; leader_id: string | null };
  expense: {
    id: string;
    restaurant_name: string | null;
    amount: number;
    tax_amount: number | null;
    paid_by: string | null;
    created_at: string | null;
  } | null;
  splits: Split[];
  currentUserId: string;
}

function StatusBadge({ status, coveredBy, splits }: { status: string; coveredBy: string | null; splits: Split[] }) {
  if (status === 'paid') {
    return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full text-xs font-bold uppercase tracking-wide">Paid</span>;
  }
  if (status === 'covered') {
    const coverer = splits.find(s => s.userId === coveredBy);
    return (
      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wide">
        Covered{coverer ? ` by ${coverer.profile.fullName.split(' ')[0]}` : ''}
      </span>
    );
  }
  return <span className="px-2 py-0.5 bg-rose-100 text-rose-600 border border-rose-200 rounded-full text-xs font-bold uppercase tracking-wide">Unpaid</span>;
}

export function PartyStatusView({ party, expense, splits, currentUserId }: Props) {
  const router = useRouter();
  const isLeader = party.leader_id === currentUserId;
  const isSettled = party.status === 'settled';

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [coveringForSplitId, setCoveringForSplitId] = useState<string | null>(null);
  const [selectedCoverer, setSelectedCoverer] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handle = async (id: string, fn: () => Promise<any>) => {
    setLoadingId(id);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const paidCount = splits.filter(s => s.paymentStatus === 'paid' || s.userId === expense?.paid_by).length;
  const otherMembers = splits.filter(s => s.userId !== currentUserId);

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-50 text-black p-6 pb-24">
      <header className="mb-6">
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-black text-sm mb-4 block transition-colors">
          ← Dashboard
        </button>

        {isSettled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-yellow-700 text-sm font-bold text-center mb-4 uppercase tracking-widest">
            Match Settled ✓
          </div>
        )}

        <h1 className="text-2xl font-bold text-black">{party.name}</h1>
        {expense && (
          <p className="text-gray-400 text-sm mt-1">
            @ {expense.restaurant_name || 'Unknown Restaurant'} · {formatDate(expense.created_at)}
          </p>
        )}
      </header>

      {expense && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total</p>
            <p className="font-bold text-black">${expense.amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tax</p>
            <p className="font-bold text-gray-500">${(expense.tax_amount ?? 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Paid</p>
            <p className="font-bold text-yellow-600">{paidCount}/{splits.length}</p>
          </div>
        </div>
      )}

      {error && (
        <p className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm text-center border border-rose-200 mb-4">
          {error}
        </p>
      )}

      {splits.filter(s => s.userId === currentUserId).map(split => (
        <div key={split.id} className="bg-white rounded-2xl border border-black/10 shadow-sm p-4 mb-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-sm text-white font-medium">
                {split.profile.fullName[0]}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  <Link href={`/profile/${split.userId}`} className="hover:text-yellow-600 transition-colors">
                    {split.profile.fullName}
                  </Link>
                  {' '}<span className="text-gray-400 font-normal">(You)</span>
                </p>
                <p className="font-mono text-yellow-600 text-sm font-bold">${split.amountOwed.toFixed(2)}</p>
              </div>
            </div>
            <StatusBadge status={split.paymentStatus} coveredBy={split.coveredBy} splits={splits} />
          </div>

          {!isSettled && split.paymentStatus === 'unpaid' && split.userId !== expense?.paid_by && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handle(split.id, () => updateSplitStatus(split.id, currentUserId, 'paid'))}
                disabled={loadingId === split.id}
                className="flex-1 bg-black hover:bg-zinc-800 text-white text-sm font-bold py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                {loadingId === split.id ? '...' : 'I Paid'}
              </button>
              <button
                onClick={() => setCoveringForSplitId(coveringForSplitId === split.id ? null : split.id)}
                className="flex-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-sm font-bold py-2 rounded-xl transition-colors"
              >
                Get Covered
              </button>
            </div>
          )}

          {coveringForSplitId === split.id && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <p className="text-xs text-gray-500">Who's covering you?</p>
              <select
                value={selectedCoverer}
                onChange={e => setSelectedCoverer(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-black text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
              >
                <option value="">Select a member…</option>
                {otherMembers.map(m => (
                  <option key={m.userId} value={m.userId}>{m.profile.fullName}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (!selectedCoverer) return;
                  handle(split.id, () => requestCover(split.id, currentUserId, selectedCoverer));
                  setCoveringForSplitId(null);
                  setSelectedCoverer("");
                }}
                disabled={!selectedCoverer || loadingId === split.id}
                className="w-full bg-black hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-bold py-2 rounded-xl transition-colors"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="space-y-3">
        {otherMembers.map(split => (
          <div key={split.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                  {split.profile.fullName[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    <Link href={`/profile/${split.userId}`} className="hover:text-yellow-600 transition-colors">
                      {split.profile.fullName}
                    </Link>
                    {split.userId === party.leader_id && ' 👑'}
                  </p>
                  <p className="font-mono text-yellow-600 text-sm font-bold">${split.amountOwed.toFixed(2)}</p>
                </div>
              </div>
              <StatusBadge status={split.paymentStatus} coveredBy={split.coveredBy} splits={splits} />
            </div>

            {isLeader && !isSettled && split.userId !== currentUserId && (
              <div className="flex gap-2 mt-3">
                {split.paymentStatus !== 'paid' && (
                  <button
                    onClick={() => handle(split.id + 'paid', () => leaderOverrideSplitStatus(split.id, currentUserId, party.id, 'paid'))}
                    disabled={!!loadingId}
                    className="flex-1 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-700 text-xs font-bold py-1.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Mark Paid
                  </button>
                )}
                {split.paymentStatus === 'paid' && (
                  <button
                    onClick={() => handle(split.id + 'unpaid', () => leaderOverrideSplitStatus(split.id, currentUserId, party.id, 'unpaid'))}
                    disabled={!!loadingId}
                    className="flex-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold py-1.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Mark Unpaid
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {isLeader && !isSettled && (
        <div className="mt-8">
          <button
            onClick={() => handle('close', () => confirmMatch(party.id, currentUserId))}
            disabled={loadingId === 'close'}
            className="w-full bg-black hover:bg-zinc-800 border border-black/10 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50"
          >
            {loadingId === 'close' ? 'Closing...' : 'Close Match ✓'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Only you (the leader) can close this match.
          </p>
        </div>
      )}
    </main>
  );
}
