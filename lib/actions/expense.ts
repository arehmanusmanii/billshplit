"use server"

import { supabase } from "@/lib/supabase"
import { Database } from "@/lib/database.types"

type PaymentStatus = Database['public']['Enums']['payment_status_types']

interface ItemShare {
  itemName: string;
  price: number;
  consumerIds: string[]; // Who ate this item
}

/**
 * The Core Math Engine: Calculates splits, applies the Tax Rule, 
 * creates the Expense, Splits, and triggers Debts.
 */
export async function createExpense(params: {
  partyId: string;
  payerId: string; // The person who paid the restaurant
  restaurantName: string;
  items: ItemShare[];
  totalTax: number;
  partyMemberIds: string[]; // All members in the party (for equal tax split)
  coveredUserIds: string[]; // IDs of users who need to pay back the payer
}) {
  const { partyId, payerId, restaurantName, items, totalTax, partyMemberIds, coveredUserIds } = params;

  // 1. Calculate the base amount for each user based on what they ate
  const userBaseAmounts = new Map<string, number>();
  partyMemberIds.forEach(id => userBaseAmounts.set(id, 0));

  let subtotal = 0;

  for (const item of items) {
    subtotal += item.price;
    const splitPrice = item.price / item.consumerIds.length;
    
    for (const consumerId of item.consumerIds) {
      const current = userBaseAmounts.get(consumerId) || 0;
      userBaseAmounts.set(consumerId, current + splitPrice);
    }
  }

  // 2. The Tax Rule: Tax is split equally across all members in the party
  const taxPerPerson = totalTax / partyMemberIds.length;
  const totalExpenseAmount = subtotal + totalTax;

  // --- DATABASE TRANSACTIONS START ---
  // Note: For production, we would use Supabase RPC (Postgres Functions) for strict transactions.
  // For the MVP, we will chain them in Node.js.

  // 3. Create the OG Bill (Expense)
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert([{
      party_id: partyId,
      paid_by: payerId,
      restaurant_name: restaurantName,
      amount: totalExpenseAmount,
      tax_amount: totalTax
    }])
    .select()
    .single();

  if (expenseError) throw new Error(`Failed to create expense: ${expenseError.message}`);

  // 4. Create the Splits & Prepare Debts
  const splitsToInsert = [];
  const debtsToInsert = [];

  for (const userId of partyMemberIds) {
    const baseAmount = userBaseAmounts.get(userId) || 0;
    const totalOwed = baseAmount + taxPerPerson;
    
    // Determine status and coverage
    let status: PaymentStatus = 'paid';
    let coveredBy: string | null = null;

    if (userId !== payerId && coveredUserIds.includes(userId)) {
      status = 'covered';
      coveredBy = payerId;

      // The Debt Trigger: Auto-queue a debt record
      debtsToInsert.push({
        creditor_id: payerId,
        debtor_id: userId,
        amount: totalOwed,
        origin_expense_id: expense.id,
        is_settled: false
      });
    }

    splitsToInsert.push({
      expense_id: expense.id,
      user_id: userId,
      amount_owed: totalOwed,
      payment_status: status,
      covered_by: coveredBy
    });
  }

  // 5. Insert Splits
  const { error: splitsError } = await supabase
    .from('splits')
    .insert(splitsToInsert);

  if (splitsError) throw new Error(`Failed to insert splits: ${splitsError.message}`);

  // 6. Insert Debts (The Web of Trust starts here)
  if (debtsToInsert.length > 0) {
    const { error: debtsError } = await supabase
      .from('debts')
      .insert(debtsToInsert);
      
    if (debtsError) throw new Error(`Failed to insert debts: ${debtsError.message}`);
  }

  return { success: true, expenseId: expense.id };
}

/**
 * The Web of Trust Settlement Logic
 * Only the creditor can mark this as settled.
 */
export async function settleDebt(debtId: string, creditorId: string) {
  // First, verify the person settling is actually the creditor
  const { data: debt, error: fetchError } = await supabase
    .from('debts')
    .select('creditor_id')
    .eq('id', debtId)
    .single();

  if (fetchError || !debt) throw new Error('Debt not found');
  if (debt.creditor_id !== creditorId) throw new Error('Web of Trust Violation: Only the creditor can settle this debt.');

  const { data: updatedDebt, error: updateError } = await supabase
    .from('debts')
    .update({ 
      is_settled: true, 
      settled_at: new Date().toISOString() 
    })
    .eq('id', debtId)
    .select()
    .single();

  if (updateError) throw new Error(`Failed to settle debt: ${updateError.message}`);

  return updatedDebt;
}
