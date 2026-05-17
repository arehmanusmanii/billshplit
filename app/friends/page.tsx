import { getFollowing } from "@/lib/actions/social"
import { createClient } from "@/lib/supabase/server"
import { FriendSearch } from "@/components/ui/FriendSearch"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function FriendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const following = await getFollowing(user.id).catch(() => [])

  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-50 text-black p-6 pb-24">
      <header className="mb-8">
        <Link href="/" className="text-gray-400 hover:text-black text-sm mb-4 block transition-colors">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-black">Friends</h1>
        <p className="text-gray-400 text-sm mt-1">Follow people to track their stats and debts.</p>
      </header>

      <FriendSearch currentUserId={user.id} />

      <div className="mt-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Following ({following.length})
        </h2>

        {following.length === 0 ? (
          <p className="text-gray-400 text-sm">You're not following anyone yet. Search for people above.</p>
        ) : (
          <div className="space-y-2">
            {following.map(person => (
              <Link
                key={person.id}
                href={`/profile/${person.id}`}
                className="flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl p-4 shadow-sm transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                  {person.avatar_url
                    ? <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
                    : (person.full_name ?? 'U')[0].toUpperCase()
                  }
                </div>
                <span className="font-medium text-black group-hover:text-yellow-600 transition-colors">
                  {person.full_name ?? 'Unknown'}
                </span>
                <span className="ml-auto text-gray-300 text-sm">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
