"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { markAllAsRead, type Notification, type ActiveReminder } from "@/lib/actions/notifications"

interface Props {
  userId: string
  notifications: Notification[]
  reminders: ActiveReminder[]
}

const typeIcon: Record<string, string> = {
  you_owe: '💸',
  owed_to_you: '🤝',
  cover_requested: '🙏',
  cover_received: '💙',
  match_settled: '✅',
  debt_settled: '🎉',
  payment_reminder: '⏰',
}

function timeAgo(iso: string | null) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d === 1 ? 'yesterday' : `${d} days ago`
}

export function NotificationsView({ userId, notifications, reminders }: Props) {
  const router = useRouter()
  const [notifs, setNotifs] = useState(notifications)
  const [markingAll, setMarkingAll] = useState(false)

  const handleMarkAll = async () => {
    setMarkingAll(true)
    await markAllAsRead(userId)
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    setMarkingAll(false)
  }

  const youOwe = reminders.filter(r => r.kind === 'you_owe')
  const owedToYou = reminders.filter(r => r.kind === 'owed_to_you')
  const unreadCount = notifs.filter(n => !n.is_read).length

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-900 text-white p-6 pb-24">
      <header className="mb-6">
        <Link href="/" className="text-gray-400 hover:text-white text-sm mb-4 block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold">Notifications</h1>
      </header>

      {/* Active Reminders */}
      {(youOwe.length > 0 || owedToYou.length > 0) && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Active Reminders
          </h2>

          {youOwe.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-rose-400 uppercase tracking-wide mb-2">You owe</p>
              <div className="space-y-2">
                {youOwe.map(r => (
                  <div key={r.id} className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-rose-300">
                          ${r.amount.toFixed(2)}
                          {r.counterpartyName && (
                            <span className="text-gray-300 font-normal"> to{' '}
                              {r.counterpartyId
                                ? <Link href={`/profile/${r.counterpartyId}`} className="hover:text-emerald-400 underline underline-offset-2">{r.counterpartyName}</Link>
                                : r.counterpartyName
                              }
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {r.restaurantName ?? r.partyName}
                          {r.createdAt && <span className="text-gray-600"> · {timeAgo(r.createdAt)}</span>}
                        </p>
                      </div>
                      {r.relatedPartyId && (
                        <Link
                          href={`/party/${r.relatedPartyId}`}
                          className="text-xs text-rose-400 hover:text-rose-300 ml-3 flex-shrink-0"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {owedToYou.length > 0 && (
            <div>
              <p className="text-xs text-emerald-400 uppercase tracking-wide mb-2">Owed to you</p>
              <div className="space-y-2">
                {owedToYou.map(r => (
                  <div key={r.id} className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-emerald-300">
                          ${r.amount.toFixed(2)}
                          {r.counterpartyName && (
                            <span className="text-gray-300 font-normal"> from{' '}
                              {r.counterpartyId
                                ? <Link href={`/profile/${r.counterpartyId}`} className="hover:text-emerald-400 underline underline-offset-2">{r.counterpartyName}</Link>
                                : r.counterpartyName
                              }
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {r.restaurantName ?? r.partyName}
                          {r.createdAt && <span className="text-gray-600"> · {timeAgo(r.createdAt)}</span>}
                        </p>
                      </div>
                      {r.relatedPartyId && (
                        <Link
                          href={`/party/${r.relatedPartyId}`}
                          className="text-xs text-emerald-400 hover:text-emerald-300 ml-3 flex-shrink-0"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {youOwe.length === 0 && owedToYou.length === 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-8 text-center">
          <p className="text-emerald-400 font-semibold">All settled up! 🎉</p>
          <p className="text-gray-400 text-sm mt-1">No outstanding debts.</p>
        </div>
      )}

      {/* Notification feed */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Recent Updates
          </h2>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              disabled={markingAll}
              className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
            >
              Mark all read
            </button>
          )}
        </div>

        {notifs.length === 0 ? (
          <p className="text-gray-500 text-sm">No updates yet.</p>
        ) : (
          <div className="space-y-2">
            {notifs.map(n => (
              <div
                key={n.id}
                className={`flex gap-3 p-4 rounded-2xl border transition-colors ${
                  !n.is_read
                    ? 'bg-gray-800 border-white/10'
                    : 'bg-gray-800/40 border-white/5'
                }`}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{typeIcon[n.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm leading-snug ${!n.is_read ? 'text-white' : 'text-gray-400'}`}>
                    {n.title}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">{n.body}</p>
                  <p className="text-gray-600 text-xs mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {n.related_party_id && (
                  <Link
                    href={`/party/${n.related_party_id}`}
                    className="text-xs text-emerald-400 hover:text-emerald-300 self-start mt-1 flex-shrink-0"
                  >
                    View →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
