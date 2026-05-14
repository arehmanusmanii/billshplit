"use server"

import { supabase } from "@/lib/supabase"
import { Database } from "@/lib/database.types"

type Party = Database['public']['Tables']['partys']['Row']

export async function createParty(name: string, leaderId: string) {
  const { data, error } = await supabase
    .from('partys')
    .insert([
      { 
        name, 
        leader_id: leaderId,
        status: 'active' 
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating party:', error)
    throw error
  }

  return data
}

/**
 * Snapchat-style recent friend suggestions.
 * Logic: Find the last 5 parties the user was in and suggest the members.
 */
export async function getRecentFriends(userId: string) {
  // 1. Get recent expenses/splits the user was involved in
  const { data: recentSplits, error } = await supabase
    .from('splits')
    .select(`
      expense_id,
      expenses!inner (
        party_id
      )
    `)
    .eq('user_id', userId)
    .order('id', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching recent splits:', error)
    return []
  }

  const partyIds = Array.from(new Set(recentSplits.map(s => s.expenses?.party_id).filter(Boolean)))

  if (partyIds.length === 0) return []

  // 2. Get other members from those parties
  const { data: members, error: memberError } = await supabase
    .from('splits')
    .select(`
      user_id,
      profiles!inner (
        id,
        full_name,
        avatar_url
      )
    `)
    .in('expense_id', (recentSplits.map(s => s.expense_id).filter(Boolean) as string[]))
    .neq('user_id', userId)
    .limit(20)

  if (memberError) {
    console.error('Error fetching members:', memberError)
    return []
  }

  // Unique members by ID
  const uniqueMembers = Array.from(new Map(members.map(m => [m.profiles?.id, m.profiles])).values())
  
  return uniqueMembers
}
