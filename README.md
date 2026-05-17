# 🧾 BillShplit
> **"League of Legends" style bill-splitting. Every meal is a Match. Every debt is transparent.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![AI Vision](https://img.shields.io/badge/AI_Vision-Meta_Llama_Scout-blue?style=for-the-badge&logo=meta)](https://ai.meta.com/)

---

## 🎮 The Concept
BillShplit moves away from boring spreadsheets and awkward group chats. We treat social dining like a competitive sport. 

- **Matches, not Meals:** Every shared expense is recorded as a "Match."
- **U.GG for your Wallet:** Public profiles show your "Match History" and "Net Balance" (Total Owed vs. Total You Owe).
- **The Web of Trust:** No more disputes. Only the person who is owed money (the Creditor) can mark a debt as paid.

## ✨ Key Features

### 👁️ Smart Receipt Parsing
Powered by **Meta Llama Scout** via Hugging Face. Just snap a photo. The AI identifies line items, prices, and quantities, filtering out the noise (taxes, totals, and change).

### 🤝 The Lobby System
Create a party, invite your "teammates" via Snapchat-style recent suggestions, and let everyone claim their own items. 

### 🛡️ Cover & Debt Tracking
Can't pay right now? Request a "Cover." The app creates a formal IOU in the debt system, updating both users' public stats instantly.

## 🛠️ Tech Stack
*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Real-time)
*   **AI Vision:** [Meta Llama Scout](https://ai.meta.com/llama/) (via Hugging Face Inference API)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)

## 🚀 Roadmap
- [x] **Lobby System & Supabase Auth**
- [x] **AI Receipt Parsing Engine** (Meta Llama Scout)
- [ ] **Item Claiming UI** (Tap-to-claim logic)
- [ ] **Cover Request System**
- [ ] **Global Restaurant & Menu Registry**
- [ ] **Reinforcement Learning Loop** (Manual OCR corrections train the AI)

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run the development server
npm run dev
```

---
*Built for the socially transparent. See you on the leaderboard.*
