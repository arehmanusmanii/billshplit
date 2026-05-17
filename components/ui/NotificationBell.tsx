"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  type Notification,
} from "@/lib/actions/notifications"

interface Props {
  userId: string
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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function NotificationBell({ userId }: Props) {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getUnreadCount(userId).then(setUnread)
  }, [userId])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = async () => {
    if (open) { setOpen(false); return }
    setOpen(true)
    if (notifications.length === 0) {
      setLoading(true)
      const data = await getNotifications(userId, 8)
      setNotifications(data)
      setLoading(false)
    }
  }

  const handleMarkAll = async () => {
    await markAllAsRead(userId)
    setUnread(0)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative text-gray-400 hover:text-white transition-colors p-1"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-80 bg-gray-800 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
            <span className="font-semibold text-sm">Notifications</span>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
            {loading && (
              <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
            )}
            {!loading && notifications.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">No notifications yet.</div>
            )}
            {notifications.map(n => (
              <div
                key={n.id}
                className={`flex gap-3 px-4 py-3 text-sm transition-colors ${!n.is_read ? 'bg-white/5' : ''}`}
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon[n.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium leading-snug ${!n.is_read ? 'text-white' : 'text-gray-300'}`}>
                    {n.title}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                  <p className="text-gray-600 text-xs mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {n.related_party_id && (
                  <Link
                    href={`/party/${n.related_party_id}`}
                    onClick={() => setOpen(false)}
                    className="text-emerald-400 hover:text-emerald-300 text-xs self-start mt-1 flex-shrink-0"
                  >
                    View →
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 px-4 py-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-white block text-center"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
