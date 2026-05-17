"use server"

import { supabaseAdmin as supabase } from "@/lib/supabase"
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

  const partyIds = Array.from(new Set(recentSplits.map(s => {
    const exp = s.expenses as any;
    return Array.isArray(exp) ? exp[0]?.party_id : exp?.party_id;
  }).filter(Boolean)))

  if (partyIds.length === 0) return []

  const { data: members, error: memberError } = await supabase
    .from('splits')
    .select(`
      user_id,
      profiles!splits_user_id_fkey (
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

  const uniqueMembers = Array.from(new Map(members.map(m => {
    const prof = m.profiles as any;
    const profile = Array.isArray(prof) ? prof[0] : prof;
    return [profile?.id, profile];
  })).values()).filter(Boolean);

  return uniqueMembers as { id: string; full_name: string | null; avatar_url: string | null }[]
}

/**
 * Fetch all data needed for the party status/detail page.
 * Returns normalized data ready for the UI.
 */
export async function getPartyDetails(partyId: string) {
  const { data: party, error: partyError } = await supabase
    .from('partys')
    .select('id, name, status, leader_id')
    .eq('id', partyId)
    .single()

  if (partyError) throw new Error(`Party not found: ${partyError.message}`)

  const { data: expense } = await supabase
    .from('expenses')
    .select('id, restaurant_name, amount, tax_amount, paid_by, created_at')
    .eq('party_id', partyId)
    .maybeSingle()

  let splits: any[] = []
  if (expense) {
    const { data: splitsData, error: splitsError } = await supabase
      .from('splits')
      .select(`
        id,
        user_id,
        amount_owed,
        payment_status,
        covered_by,
        profiles!splits_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('expense_id', expense.id)

    if (splitsError) console.error('Error fetching splits:', splitsError)
    splits = splitsData || []
  }

  const normalizedSplits = splits.map(s => {
    const prof = s.profiles as any
    const profile = Array.isArray(prof) ? prof[0] : prof
    return {
      id: s.id as string,
      userId: s.user_id as string,
      amountOwed: s.amount_owed as number,
      paymentStatus: s.payment_status as string,
      coveredBy: s.covered_by as string | null,
      profile: {
        id: (profile?.id || s.user_id) as string,
        fullName: (profile?.full_name || 'Unknown') as string,
        avatarUrl: (profile?.avatar_url || null) as string | null,
      }
    }
  })

  return {
    party: party as { id: string; name: string; status: string | null; leader_id: string | null },
    expense: expense as { id: string; restaurant_name: string | null; amount: number; tax_amount: number | null; paid_by: string | null; created_at: string | null } | null,
    splits: normalizedSplits
  }
}

/**
 * Member self-reports their payment status (paid or unpaid).
 * Only the member themselves can update their own status.
 */
export async function updateSplitStatus(splitId: string, userId: string, status: 'paid' | 'unpaid') {
  const { error } = await supabase
    .from('splits')
    .update({ payment_status: status })
    .eq('id', splitId)
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to update status: ${error.message}`)
  return { success: true }
}

/**
 * A member requests cover from another party member.
 * Creates a debt record (debtor → creditor) and marks the split as 'covered'.
 */
export async function requestCover(splitId: string, debtorId: string, creditorId: string) {
  const { data: split, error: splitError } = await supabase
    .from('splits')
    .select('amount_owed, expense_id')
    .eq('id', splitId)
    .eq('user_id', debtorId)
    .single()

  if (splitError || !split) throw new Error('Split not found or unauthorized')

  const { error: updateError } = await supabase
    .from('splits')
    .update({ payment_status: 'covered', covered_by: creditorId })
    .eq('id', splitId)

  if (updateError) throw new Error(`Failed to update split: ${updateError.message}`)

  const { error: debtError } = await supabase
    .from('debts')
    .insert({
      creditor_id: creditorId,
      debtor_id: debtorId,
      amount: split.amount_owed,
      origin_expense_id: split.expense_id,
      is_settled: false
    })

  if (debtError) throw new Error(`Failed to create debt record: ${debtError.message}`)
  return { success: true }
}

/**
 * Leader override: forcibly marks any member's payment status.
 * Only the party leader can call this.
 */
export async function leaderOverrideSplitStatus(splitId: string, leaderId: string, partyId: string, newStatus: 'paid' | 'unpaid') {
  const { data: party } = await supabase
    .from('partys')
    .select('leader_id')
    .eq('id', partyId)
    .single()

  if (!party || party.leader_id !== leaderId) throw new Error('Only the party leader can override payment statuses')

  const { error } = await supabase
    .from('splits')
    .update({ payment_status: newStatus })
    .eq('id', splitId)

  if (error) throw new Error(`Failed to override status: ${error.message}`)
  return { success: true }
}

/**
 * Leader closes the match. Marks the party as 'settled'.
 */
export async function confirmMatch(partyId: string, leaderId: string) {
  const { data: party } = await supabase
    .from('partys')
    .select('leader_id')
    .eq('id', partyId)
    .single()

  if (!party || party.leader_id !== leaderId) throw new Error('Only the party leader can close the match')

  const { error } = await supabase
    .from('partys')
    .update({ status: 'settled' })
    .eq('id', partyId)

  if (error) throw new Error(`Failed to confirm match: ${error.message}`)
  return { success: true }
}
