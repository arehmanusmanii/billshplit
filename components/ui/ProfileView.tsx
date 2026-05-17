"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { followUser, unfollowUser, type PublicProfile } from "@/lib/actions/social"
import { BalanceCard } from "@/components/ui/BalanceCard"
import { MatchHistoryFeed } from "@/components/ui/MatchHistoryFeed"

interface Props {
  profile: PublicProfile
  viewerId: string
  isOwnProfile: boolean
  initiallyFollowing: boolean
  netBalance: number
  totalOwedToUser: number
  totalUserOwes: number
  matchHistory: any[]
  followerCount: number
  followingCount: number
}

export function ProfileView({
  profile,
  viewerId,
  isOwnProfile,
  initiallyFollowing,
  netBalance,
  totalOwedToUser,
  totalUserOwes,
  matchHistory,
  followerCount,
  followingCount,
}: Props) {
  const router = useRouter()
  const [following, setFollowing] = useState(initiallyFollowing)
  const [followers, setFollowers] = useState(followerCount)
  const [loading, setLoading] = useState(false)

  const handleFollowToggle = async () => {
    setLoading(true)
    try {
      if (following) {
        await unfollowUser(viewerId, profile.id)
        setFollowing(false)
        setFollowers(f => f - 1)
      } else {
        await followUser(viewerId, profile.id)
        setFollowing(true)
        setFollowers(f => f + 1)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const initials = (profile.full_name ?? 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-900 text-white p-6 pb-24">
      <header className="mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-sm mb-4 block">
          ← Back
        </button>
      </header>

      {/* Profile hero */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl font-bold text-emerald-400 overflow-hidden flex-shrink-0">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={profile.full_name ?? ''} className="w-full h-full object-cover" />
            : initials
          }
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{profile.full_name ?? 'Unknown'}</h1>
          <div className="flex gap-4 mt-1 text-sm text-gray-400">
            <span><span className="text-white font-semibold">{followers}</span> followers</span>
            <span><span className="text-white font-semibold">{followingCount}</span> following</span>
          </div>
        </div>
        {!isOwnProfile && (
          <button
            onClick={handleFollowToggle}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
              following
                ? 'bg-gray-700 hover:bg-gray-600 text-white border border-white/20'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {loading ? '...' : following ? 'Following' : 'Follow'}
          </button>
        )}
        {isOwnProfile && (
          <Link
            href="/friends"
            className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-800 border border-white/10 hover:bg-gray-700 transition-colors"
          >
            Friends
          </Link>
        )}
      </div>

      {/* Balance */}
      <BalanceCard netBalance={netBalance} />

      {/* Debt breakdown */}
      {(totalOwedToUser > 0 || totalUserOwes > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-800 rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Owed to them</p>
            <p className="font-bold text-emerald-400">${totalOwedToUser.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">They owe</p>
            <p className="font-bold text-rose-400">${totalUserOwes.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Match history */}
      <h2 className="text-lg font-semibold mb-4">Match History</h2>
      <MatchHistoryFeed matches={matchHistory} />
    </main>
  )
}
