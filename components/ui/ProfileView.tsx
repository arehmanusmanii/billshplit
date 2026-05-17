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
    <main className="max-w-md mx-auto min-h-screen bg-gray-50 text-black p-6 pb-24">
      <header className="mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-black text-sm mb-4 block transition-colors">
          ← Back
        </button>
      </header>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-2xl font-bold text-white overflow-hidden flex-shrink-0">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={profile.full_name ?? ''} className="w-full h-full object-cover" />
            : initials
          }
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-black truncate">{profile.full_name ?? 'Unknown'}</h1>
          <div className="flex gap-4 mt-1 text-sm text-gray-400">
            <span><span className="text-black font-semibold">{followers}</span> followers</span>
            <span><span className="text-black font-semibold">{followingCount}</span> following</span>
          </div>
        </div>
        {!isOwnProfile && (
          <button
            onClick={handleFollowToggle}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
              following
                ? 'bg-gray-200 hover:bg-gray-300 text-black'
                : 'bg-black hover:bg-zinc-800 text-white'
            }`}
          >
            {loading ? '...' : following ? 'Following' : 'Follow'}
          </button>
        )}
        {isOwnProfile && (
          <Link
            href="/friends"
            className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
          >
            Friends
          </Link>
        )}
      </div>

      <BalanceCard netBalance={netBalance} />

      {(totalOwedToUser > 0 || totalUserOwes > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Owed to them</p>
            <p className="font-bold text-yellow-600">${totalOwedToUser.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">They owe</p>
            <p className="font-bold text-rose-500">${totalUserOwes.toFixed(2)}</p>
          </div>
        </div>
      )}

      <h2 className="text-base font-semibold mb-4 text-black">Match History</h2>
      <MatchHistoryFeed matches={matchHistory} />
    </main>
  )
}
