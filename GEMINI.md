# Project Context: BillShplit (MVP)

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database/Auth:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **State Management:** TypeScript

## Core Concept
A "League of Legends" style bill-splitting app. Every meal is a "Match." Users have a "Match History" and a "Public Profile" showing their debt transparency (Net Balance).

## Core Logic & Vibe
- Every meal is a "Match."
- Profiles are public and transparent, showing "Match History" (U.GG style).
- The "Web of Trust": Only the person who is owed money (Creditor) can mark a debt as paid.

## Database Schema Context

### 1. Profiles & Lobbies
- **profiles:** Syncs with Supabase Auth. Stores `full_name` and `total_paid_all_time`.
- **partys:** One-off lobby templates. Includes a `leader_id` (FK to profiles).
- **History:** Keep all settled parties for "Match History" and recency suggestions.

### 2. Global Restaurant Registry
- **restaurants:** Global table. If `is_official` is true, the restaurant manages the menu.
- **menu_items:** Global items added by users or restaurants. Includes `verified_by_restaurant` flag.
- **Price Snapshot:** When a bill is created, the price is saved to the transaction. Future global menu price changes do not affect old receipts.

### 3. Transactions & Math
- **expenses:** The OG bill. Defaults `paid_by` to the `leader_id`. Stores `tax_amount` and `rating`.
- **splits:** Individual shares. Tax is split EQUALLY among all members. 
- **payment_status:** 'paid', 'unpaid', or 'covered'.

### 4. The Debt (IOU) System
- **debts:** Independent table for "Friend B covered Friend A."
- **Rules:** - If a user has no wallet, they are tagged in `splits` as 'covered'. 
  - A record is created in `debts` where `debtor_id` is the forgetful friend and `creditor_id` is the payer.
  - Net Balance on profile = (Total Owed to You) - (Total You Owe).

## Feature Roadmap for AI Generation
1. **Lobby System:** Snapchat-style recent friend suggestions.
2. **Auto-Split Logic:** Divide total + tax, insert into `expenses` and `splits`.
3. **Debt Trigger:** If split is 'covered', auto-insert into `debts`.
4. **Match History:** Query for a user's `splits` showing their specific share and status.## Business Logic Rules
1. **The Leader Rule:** Default payer for any expense in a party is the `leader_id`.
2. **The Tax Rule:** Tax is split equally across all members in the party (for MVP).
3. **The Web of Trust:** Only the `creditor_id` can mark a debt as settled.
4. **The Snapshot Rule:** Menui item prices are saved to the expense at the time of creation; global menu changes do not affect history.
5. **Transparency:** All match history and debt totals are public to all users.
