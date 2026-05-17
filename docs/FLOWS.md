# BillShplit System Flows

This document contains the logic flows for the two primary systems in BillShplit: **The Match Lifecycle** and **The Debt/IOU System**.

## 1. The Match Lifecycle (Creation to History)
This flow describes how a bill is created, parsed, and finalized.

```mermaid
graph TD
    A[Leader Pays IRL] --> B[Create Party/Lobby]
    B --> C[Upload Receipt Image]
    C --> D{Meta Llama Scout OCR}
    D --> E[Parsed Line Items]
    E --> F[Invite Friends]
    F --> G[Members Claim Items]
    G --> H[Tax Split Equally]
    H --> I[Leader Finalizes Match]
    I --> J[Archived to Match History]
```

## 2. The Debt & "Web of Trust" Flow
This flow describes what happens when a user cannot pay their share immediately.

```mermaid
graph TD
    A[Member Requests 'Cover'] --> B[Target Friend Accepts]
    B --> C[Split Marked 'Covered']
    C --> D[Create Debt Record]
    D --> E[Update Net Balance on Profiles]
    E --> F{Time Passes}
    F --> G[IRL Payment Made]
    G --> H[Creditor Marks Paid]
    H --> I[Net Balance Restored]
```
