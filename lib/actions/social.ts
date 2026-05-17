"use server"

import { supabaseAdmin as supabase } from "@/lib/supabase"
import { getUserNetBalance, getMatchHistory } from "@/lib/actions/profile"

export interface PublicProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export async function followUser(followerId: string, followedId: string) {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, followed_id: followedId })

  if (error) throw new Error(`Failed to follow: ${error.message}`)
  return { success: true }
}

export async function unfollowUser(followerId: string, followedId: string) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('followed_id', followedId)

  if (error) throw new Error(`Failed to unfollow: ${error.message}`)
  return { success: true }
}

export async function isFollowing(followerId: string, followedId: string): Promise<boolean> {
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('followed_id', followedId)
    .maybeSingle()

  return !!data
}

export async function getFollowing(userId: string): Promise<PublicProfile[]> {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      followed_id,
      profiles!follows_followed_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })

  if (error) { console.error('getFollowing error:', error); return [] }

  return (data || []).map(row => {
    const p = row.profiles as any
    return Array.isArray(p) ? p[0] : p
  }).filter(Boolean) as PublicProfile[]
}

export async function getFollowers(userId: string): Promise<PublicProfile[]> {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      follower_id,
      profiles!follows_follower_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('followed_id', userId)
    .order('created_at', { ascending: false })

  if (error) { console.error('getFollowers error:', error); return [] }

  return (data || []).map(row => {
    const p = row.profiles as any
    return Array.isArray(p) ? p[0] : p
  }).filter(Boolean) as PublicProfile[]
}

export async function searchProfiles(query: string, excludeUserId?: string): Promise<PublicProfile[]> {
  if (!query.trim()) return []

  let q = supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .ilike('full_name', `%${query.trim()}%`)
    .limit(20)

  if (excludeUserId) q = q.neq('id', excludeUserId)

  const { data, error } = await q
  if (error) { console.error('searchProfiles error:', error); return [] }
  return (data || []) as PublicProfile[]
}

export async function getPublicProfile(targetUserId: string) {
  const [profile, balanceData, matchHistory, followersData, followingData] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', targetUserId)
      .single(),
    getUserNetBalance(targetUserId).catch(() => ({ netBalance: 0, totalOwedToUser: 0, totalUserOwes: 0 })),
    getMatchHistory(targetUserId, 20).catch(() => []),
    supabase.from('follows').select('follower_id', { count: 'exact' }).eq('followed_id', targetUserId),
    supabase.from('follows').select('followed_id', { count: 'exact' }).eq('follower_id', targetUserId),
  ])

  if (profile.error) throw new Error(`Profile not found: ${profile.error.message}`)

  return {
    profile: profile.data as PublicProfile,
    netBalance: balanceData.netBalance,
    totalOwedToUser: balanceData.totalOwedToUser,
    totalUserOwes: balanceData.totalUserOwes,
    matchHistory,
    followerCount: followersData.count ?? 0,
    followingCount: followingData.count ?? 0,
  }
}
