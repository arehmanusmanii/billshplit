"use client"

import { useState, useEffect, useRef } from "react"
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
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name…"
          className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-10 py-3 text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black transition-colors text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-3 space-y-2">
          {results.map(person => (
            <div key={person.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
              <Link href={`/profile/${person.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                  {person.avatar_url
                    ? <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
                    : (person.full_name ?? 'U')[0].toUpperCase()
                  }
                </div>
                <span className="font-medium text-black truncate">{person.full_name ?? 'Unknown'}</span>
              </Link>
              <button
                onClick={() => handleToggleFollow(person)}
                disabled={loadingId === person.id}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex-shrink-0 ${
                  followingIds.has(person.id)
                    ? 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                    : 'bg-black hover:bg-zinc-800 text-white'
                }`}
              >
                {loadingId === person.id ? '...' : followingIds.has(person.id) ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <p className="mt-3 text-sm text-gray-400 text-center">No users found for "{query}"</p>
      )}
    </div>
  )
}
