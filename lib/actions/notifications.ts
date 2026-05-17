"use server"

import { supabaseAdmin as supabase } from "@/lib/supabase"

export interface Notification {
  id: string
  type: string
  title: string
  body: string
  is_read: boolean
  related_party_id: string | null
  created_at: string
}

export interface ActiveReminder {
  id: string
  kind: 'you_owe' | 'owed_to_you'
  amount: number
  restaurantName: string | null
  partyName: string
  counterpartyName: string | null
  counterpartyId: string | null
  relatedPartyId: string | null
  createdAt: string | null
}

/** Insert notifications silently — never throws, so main flows never break. */
export async function queueNotifications(
  notifications: {
    user_id: string
    type: string
    title: string
    body: string
    related_party_id?: string | null
  }[]
) {
  if (!notifications.length) return
  try {
    await supabase.from('notifications').insert(notifications)
  } catch (e) {
    console.error('Failed to queue notifications:', e)
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  return count ?? 0
}

export async function getNotifications(userId: string, limit = 30): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, body, is_read, related_party_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) { console.error('getNotifications error:', error); return [] }
  return (data ?? []) as Notification[]
}

export async function markAsRead(notificationId: string, userId: string) {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
}

export async function markAllAsRead(userId: string) {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
}

/**
 * Live-derived reminders — always reflects current unpaid state regardless of
 * whether a notification record was ever created. This covers pre-existing data
 * and ensures nothing is ever missed.
 */
export async function getActiveReminders(userId: string): Promise<ActiveReminder[]> {
  const reminders: ActiveReminder[] = []

  // 1. Splits where the user owes money (payment_status = 'unpaid', they're not the payer)
  const { data: oweSplits } = await supabase
    .from('splits')
    .select(`
      id,
      amount_owed,
      expenses!splits_expense_id_fkey (
        restaurant_name,
        paid_by,
        created_at,
        party_id,
        partys!expenses_party_id_fkey ( name ),
        profiles!expenses_paid_by_fkey ( id, full_name )
      )
    `)
    .eq('user_id', userId)
    .eq('payment_status', 'unpaid')

  for (const s of oweSplits ?? []) {
    const exp = s.expenses as any
    const expense = Array.isArray(exp) ? exp[0] : exp
    if (!expense || expense.paid_by === userId) continue

    const party = Array.isArray(expense.partys) ? expense.partys[0] : expense.partys
    const payer = Array.isArray(expense.profiles) ? expense.profiles[0] : expense.profiles

    reminders.push({
      id: s.id,
      kind: 'you_owe',
      amount: s.amount_owed,
      restaurantName: expense.restaurant_name,
      partyName: party?.name ?? 'Unknown Party',
      counterpartyName: payer?.full_name ?? null,
      counterpartyId: payer?.id ?? null,
      relatedPartyId: expense.party_id ?? null,
      createdAt: expense.created_at,
    })
  }

  // 2. Debts where the user is the creditor and it's not settled (someone owes them)
  const { data: ownedDebts } = await supabase
    .from('debts')
    .select(`
      id,
      amount,
      created_at,
      origin_expense_id,
      profiles!debts_orig_debtor_id_fkey ( id, full_name ),
      expenses!debts_orig_origin_expense_id_fkey (
        restaurant_name,
        party_id,
        partys!expenses_party_id_fkey ( name )
      )
    `)
    .eq('creditor_id', userId)
    .eq('is_settled', false)

  for (const d of ownedDebts ?? []) {
    const debtor = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles as any
    const exp = d.expenses as any
    const expense = Array.isArray(exp) ? exp[0] : exp
    const party = expense ? (Array.isArray(expense.partys) ? expense.partys[0] : expense.partys) : null

    reminders.push({
      id: d.id,
      kind: 'owed_to_you',
      amount: d.amount,
      restaurantName: expense?.restaurant_name ?? null,
      partyName: party?.name ?? 'Unknown Party',
      counterpartyName: debtor?.full_name ?? null,
      counterpartyId: debtor?.id ?? null,
      relatedPartyId: expense?.party_id ?? null,
      createdAt: d.created_at,
    })
  }

  return reminders
}
