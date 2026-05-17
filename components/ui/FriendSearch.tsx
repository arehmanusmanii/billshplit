"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { searchProfiles, followUser, unfollowUser, isFollowing, type PublicProfile } from "@/lib/actions/social"

interface Props {
  currentUserId: string
}

export function FriendSearch({ currentUserId }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PublicProfile[]>([])
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const found = await searchProfiles(query, currentUserId)
      setResults(found)
      // Check follow status for each result
      const statuses = await Promise.all(found.map(p => isFollowing(currentUserId, p.id)))
      const ids = new Set(found.filter((_, i) => statuses[i]).map(p => p.id))
      setFollowingIds(ids)
    }, 350)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, currentUserId])

  const handleToggleFollow = async (profile: PublicProfile) => {
    setLoadingId(profile.id)
    try {
      if (followingIds.has(profile.id)) {
        await unfollowUser(currentUserId, profile.id)
        setFollowingIds(prev => { const s = new Set(prev); s.delete(profile.id); return s })
      } else {
        await followUser(currentUserId, profile.id)
        setFollowingIds(prev => new Set([...prev, profile.id]))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name…"
          className="w-full bg-gray-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-3 space-y-2">
          {results.map(person => (
            <div key={person.id} className="flex items-center gap-3 bg-gray-800 border border-white/10 rounded-2xl p-3">
              <Link href={`/profile/${person.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400 overflow-hidden flex-shrink-0">
                  {person.avatar_url
                    ? <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
                    : (person.full_name ?? 'U')[0].toUpperCase()
                  }
                </div>
                <span className="font-medium truncate">{person.full_name ?? 'Unknown'}</span>
              </Link>
              <button
                onClick={() => handleToggleFollow(person)}
                disabled={loadingId === person.id}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex-shrink-0 ${
                  followingIds.has(person.id)
                    ? 'bg-gray-700 text-gray-300 border border-white/20'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {loadingId === person.id ? '...' : followingIds.has(person.id) ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <p className="mt-3 text-sm text-gray-500 text-center">No users found for "{query}"</p>
      )}
    </div>
  )
}
