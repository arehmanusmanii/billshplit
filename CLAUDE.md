@AGENTS.md

# Project Context: BillShplit (MVP)

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database/Auth:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **State Management:** TypeScript
- **Receipt OCR:** Llama 4 Scout via Hugging Face Inference API (replacing local Ollama/moondream). OpenAI SDK already installed as fallback reference.

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

## The Core User Flow (MVP)
1. **Leader pays the bill at the restaurant** (IRL, upfront).
2. Leader opens app → creates a Lobby/Party → scans the receipt.
3. Receipt is parsed by AI into claimable line items (taxes/totals/change filtered out).
4. Leader invites party members (suggested from recent parties together).
5. Each member sees the receipt and **selects the items they ordered** — they cannot claim more than what exists on the receipt.
6. Tax is divided equally across all members automatically.
7. Members set their own payment status.
8. **Cover Request:** A member who can't pay can request another party member to cover them. If accepted, a `debt` record is created (debtor → creditor). The split shows as 'covered' but the debt is tracked publicly on both profiles.
9. **Leader Confirmation:** Leader sees everyone's self-reported statuses and hits "Everyone Paid" to close the match — OR manually overrides any member's status to reflect the honest truth.
10. Settled party is archived to Match History.

## Feature Roadmap for AI Generation
1. **Lobby System & Auth (Completed):** Real Supabase Auth implemented (`/login`), Snapchat-style recent friend suggestions based on shared party history (WIP).
2. **Receipt Parsing (AI Vision):** Llama 4 Scout via Hugging Face Inference API. Parse receipt image into distinct claimable items. Filter out totals, taxes, change lines. Expand quantities (e.g., "2x Burger" → two separate claimable items).
   - **Fallback & Editability:** Always provide manual add/edit capabilities in case OCR fails or misses items.
   - **Future:** Reinforcement Learning feedback loop — manual corrections train future parsing accuracy.
3. **Item Claiming UI:** Members tap to claim items from the receipt. Claimed items are locked (others can't also claim the same item). Total auto-calculates as items are selected + equal tax share.
4. **Cover Request System:** Member requests cover → another member accepts → `debt` record created, split marked 'covered', both profiles updated with net balance.
5. **Auto-Split Logic:** Divide total + tax, insert into `expenses` and `splits`.
6. **Debt Trigger:** If split is 'covered', auto-insert into `debts`.
7. **Match History:** Query for a user's `splits` showing their specific share and status.

## Business Logic Rules
1. **The Leader Rule:** Default payer for any expense in a party is the `leader_id`. Only one expense per party/meal for MVP.
2. **The Tax Rule:** Tax is split equally across all members in the party (for MVP).
3. **The Claim Rule:** A member cannot claim items whose total exceeds what is on the receipt. Items claimed by one member are no longer available to others.
4. **The Cover Rule:** Only a party member can cover another party member. The covered person's split is marked 'covered'; a `debt` record is created between them.
5. **The Web of Trust:** Only the `creditor_id` can mark a debt as settled.
6. **The Leader Override:** The leader has final say on payment status for any member. Their confirmation closes the match.
7. **The Snapshot Rule:** Menu item prices are saved to the expense at the time of creation; global menu changes do not affect history.
8. **Transparency:** All match history, debt totals, and profiles are publicly visible — no auth required to view.
