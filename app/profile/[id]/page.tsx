import { getPublicProfile, isFollowing } from "@/lib/actions/social"
import { createClient } from "@/lib/supabase/server"
import { ProfileView } from "@/components/ui/ProfileView"
import { redirect } from "next/navigation"

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: targetUserId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let profileData
  try {
    profileData = await getPublicProfile(targetUserId)
  } catch {
    redirect('/')
  }

  const viewerIsFollowing = user.id !== targetUserId
    ? await isFollowing(user.id, targetUserId)
    : false

  return (
    <ProfileView
      {...profileData!}
      viewerId={user.id}
      isOwnProfile={user.id === targetUserId}
      initiallyFollowing={viewerIsFollowing}
    />
  )
}
