import { supabase } from "@/lib/supabase"
import { Database } from "@/lib/database.types"

/**
 * Calculates the user's current Net Balance based on UNSETTLED debts.
 * Net Balance = (Amount owed TO you) - (Amount you owe OTHERS)
 */
export async function getUserNetBalance(userId: string) {
  // 1. Get debts where user is the creditor (money owed TO them)
  const { data: credits, error: creditError } = await supabase
    .from('debts')
    .select('amount')
    .eq('creditor_id', userId)
    .eq('is_settled', false);

  if (creditError) throw new Error(`Failed to fetch credits: ${creditError.message}`);

  // 2. Get debts where user is the debtor (money they OWE)
  const { data: debts, error: debtError } = await supabase
    .from('debts')
    .select('amount')
    .eq('debtor_id', userId)
    .eq('is_settled', false);

  if (debtError) throw new Error(`Failed to fetch debts: ${debtError.message}`);

  const totalOwedToUser = credits.reduce((sum, record) => sum + record.amount, 0);
  const totalUserOwes = debts.reduce((sum, record) => sum + record.amount, 0);

  return {
    netBalance: totalOwedToUser - totalUserOwes,
    totalOwedToUser,
    totalUserOwes
  };
}

/**
 * U.GG Style Match History
 * Fetches the user's past expenses, focusing on their specific share and status.
 */
export async function getMatchHistory(userId: string, limit: number = 20) {
  const { data: matches, error } = await supabase
    .from('splits')
    .select(`
      id,
      amount_owed,
      payment_status,
      expenses!inner (
        id,
        restaurant_name,
        amount,
        created_at,
        paid_by,
        partys (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .order('id', { ascending: false }) // Ordering by split ID assuming it correlates with recency
    .limit(limit);

  if (error) throw new Error(`Failed to fetch match history: ${error.message}`);

  // Format the data to be easier for the UI to digest
  return matches.map(match => ({
    splitId: match.id,
    userShare: match.amount_owed,
    status: match.payment_status,
    expenseId: match.expenses?.id,
    restaurantName: match.expenses?.restaurant_name,
    totalBill: match.expenses?.amount,
    date: match.expenses?.created_at,
    payerId: match.expenses?.paid_by,
    partyName: match.expenses?.partys?.name || 'Unknown Party'
  }));
}
