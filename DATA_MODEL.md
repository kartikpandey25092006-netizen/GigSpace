# 📊 GigSpace Data Model & Relationships

## Visual Database Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GIGSPACE DATABASE                         │
│                     (SQLite - gigspace.db)                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   USER_A     │         │   USER_B     │         │   OTHER      │
│              │         │              │         │   USERS      │
│ usera@...    │         │ userb@...    │         │   (empty)    │
│ Gig Poster   │         │ Gig Acceptor │         │              │
│ 4.8★ Rank#5  │         │ 4.9★ Rank#2  │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
       │                         │                       │
       │ owns (1-to-many)        │ applies (many-to-1)  │
       │                         │                      │
       ├─────────────────────────┴──────────────────────┤
       │                                                  │
       ▼                                                  ▼
┌─────────────────────────┐              ┌──────────────────────┐
│        GIGS (3)         │              │ GIG_APPLICATIONS     │
│  ─────────────────────  │              │ ─────────────────────│
│ 1. Website Redesign     │──────────────│ User B → Gig 1       │
│    $2500 IN_PROGRESS ✓  │              │ Status: ACCEPTED     │
│    (accepted by User B) │              │ User B → Gig 2       │
│                         │              │ Status: PENDING      │
│ 2. Mobile App Dev       │              │ User B → Gig 3       │
│    $5000 IN_PROGRESS ✓  │              │ Status: ACCEPTED     │
│    (accepted by User B) │              │                      │
│                         │              │ (User B applied to   │
│ 3. Content Writing      │              │  all 3 gigs!)        │
│    $800 OPEN            │              │                      │
│    (available)          │              └──────────────────────┘
└─────────────────────────┘
       │
       │ has applications
       │ (1-to-many)
       │
       └──────────────────────────────────────┬──────────────────┐
                                              │                  │
                                              ▼                  ▼
                          ┌──────────────────────────────────────────┐
                          │    GIG APPLICATION STATUS BREAKDOWN      │
                          │ ─────────────────────────────────────────│
                          │ Gig 1: User B - ACCEPTED ✅ (in progress)│
                          │ Gig 2: User B - PENDING ⏳ (awaiting)    │
                          │ Gig 3: User B - ACCEPTED ✅ (in progress)│
                          └──────────────────────────────────────────┘


┌──────────────────────────┐        ┌─────────────────────────┐
│     RENTALS (3)          │        │  RENTAL_BOOKINGS (3)    │
│  ─────────────────────── │        │  ───────────────────────│
│ 1. Canon EOS Camera      │────────│ User B → Rental 1       │
│    RENTED ✓              │        │ Status: CONFIRMED       │
│    $50/hr or $200/day    │        │ Duration: 3 days        │
│    (booked by User B)    │        │ Amount: $600            │
│                          │        │                         │
│ 2. MacBook Pro           │        │ User B → Rental 2       │
│    AVAILABLE             │        │ Status: PENDING         │
│    $150/day              │        │ Duration: 5 days        │
│                          │        │ Amount: $750            │
│                          │        │                         │
│ 3. Lighting Kit          │        │ User B → Rental 3       │
│    RENTED ✓              │        │ Status: CONFIRMED       │
│    $25/hr or $100/day    │        │ Duration: 2 days        │
│    (booked by User B)    │        │ Amount: $200            │
└──────────────────────────┘        └─────────────────────────┘


┌────────────────────────────────────────────────┐
│          CHAT (1 conversation)                 │
│  ────────────────────────────────────────────  │
│                                                │
│  Participants: User A ←→ User B                │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ User A: "Hi! I think you'd be perfect..." │ │
│  │ User B: "Thanks! Can we discuss details?"  │ │
│  │ User A: "Budget $2500, 30 days deadline"  │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Total Messages: 3                             │
└────────────────────────────────────────────────┘


┌────────────────────────────────────────────────┐
│    LEADERBOARD (both users ranked)             │
│  ────────────────────────────────────────────  │
│                                                │
│  🥇 Rank #2: User B (4.9★)                     │
│     • 25 completed gigs                        │
│     • $5000 total earnings                     │
│     • 4.9 rating                               │
│                                                │
│  🥉 Rank #5: User A (4.8★)                     │
│     • 12 completed gigs                        │
│     • $0 total earnings                        │
│     • 4.8 rating                               │
│                                                │
└────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    GIG WORKFLOW                                  │
│                                                                  │
│  USER A (Poster)              USER B (Acceptor)                 │
│      │                              │                           │
│      │ 1. Creates Gig               │                           │
│      ├──────────────────────────────┤                           │
│      │                              │                           │
│      │                         2. Sees gig in list              │
│      │                              │                           │
│      │                         3. Applies for gig               │
│      │                              │                           │
│      │ 4. Receives application ◄────┤                           │
│      │                              │                           │
│      │ 5. Accepts application       │                           │
│      ├──────────────────────────────►                           │
│      │                              │                           │
│      │                         6. Sees accepted gig             │
│      │                              │                           │
│      │                         7. Works on gig                  │
│      │                              │                           │
│      │                         8. Marks as complete             │
│      │                              │                           │
│      │ 9. Confirms completion ◄────┤                           │
│      │                              │                           │
│      │ 10. Marks gig COMPLETED      │                           │
│      ├──────────────────────────────►                           │
│      │                              │                           │
│      │                    Both earn badges & rating             │
│      │                              │                           │
└──────┴──────────────────────────────┴──────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                  RENTAL WORKFLOW                                 │
│                                                                  │
│  USER A (Owner)               USER B (Booker)                   │
│      │                              │                           │
│      │ 1. Lists rental item         │                           │
│      ├──────────────────────────────┤                           │
│      │                              │                           │
│      │                         2. Sees rental in list           │
│      │                              │                           │
│      │                         3. Selects dates & books         │
│      │                              │                           │
│      │ 4. Receives booking ◄────────┤                           │
│      │                              │                           │
│      │ 5. Confirms booking          │                           │
│      ├──────────────────────────────►                           │
│      │                              │                           │
│      │                         6. Pays deposit + rental          │
│      │                              │                           │
│      │                         7. Picks up item                 │
│      │                              │                           │
│      │ (item marked RENTED)         │                           │
│      │                              │                           │
│      │                         8. Uses item                     │
│      │                              │                           │
│      │                         9. Returns item                  │
│      │                              │                           │
│      │ 10. Marks returned/completed │                           │
│      │                              │                           │
│      │ (item marked AVAILABLE)      │                           │
│      │                              │                           │
│      │                   11. Refund processed                   │
│      │                              │                           │
│      │                    Both view on dashboard                │
│      │                              │                           │
└──────┴──────────────────────────────┴──────────────────────────┘
```

## Current State Summary

### Users
```
┌──────────────────────────────────────┐
│ Total Users: 2                       │
├──────────────────────────────────────┤
│ User A (usera@test.com)              │
│  - Role: BUYER (posts gigs/rentals)  │
│  - Status: ACTIVE                    │
│  - Rating: 4.8 ⭐                    │
│  - Completed Gigs: 12                │
│  - Leaderboard Rank: #5              │
│                                      │
│ User B (userb@test.com)              │
│  - Role: WORKER (accepts gigs/books) │
│  - Status: ACTIVE                    │
│  - Rating: 4.9 ⭐                    │
│  - Completed Gigs: 25                │
│  - Total Earnings: $5000             │
│  - Leaderboard Rank: #2              │
└──────────────────────────────────────┘
```

### Gigs Activity
```
┌──────────────────────────────────────┐
│ Total Gigs: 3                        │
├──────────────────────────────────────┤
│ Status: OPEN      │  1 gig           │
│ Status: IN_PROGRESS│  2 gigs          │
│                  │                   │
│ User A (owner):   │  3 gigs          │
│ User B (acceptor):│  3 applications  │
│  - Accepted:      │  2 gigs          │
│  - Pending:       │  1 application   │
└──────────────────────────────────────┘
```

### Rentals Activity
```
┌──────────────────────────────────────┐
│ Total Rentals: 3                     │
├──────────────────────────────────────┤
│ Status: AVAILABLE │  1 item          │
│ Status: RENTED    │  2 items         │
│                  │                   │
│ User A (owner):   │  3 items         │
│ User B (booker):  │  3 bookings      │
│  - Confirmed:     │  2 bookings      │
│  - Pending:       │  1 booking       │
└──────────────────────────────────────┘
```

### Communication
```
┌──────────────────────────────────────┐
│ Total Chats: 1                       │
├──────────────────────────────────────┤
│ Between: User A ◄─► User B           │
│ Messages: 3                          │
│ Last Activity: Recently              │
└──────────────────────────────────────┘
```

## API Endpoints Map

```
Authentication
├── POST   /auth/register        → Create account
├── POST   /auth/login           → Login
└── GET    /auth/profile         → Get profile

Gigs
├── GET    /gigs/list            → Browse all gigs
├── GET    /gigs/:id             → View gig details
├── POST   /gigs/create          → Post new gig
└── POST   /gigs/accept          → Apply for gig

Rentals
├── GET    /rentals/list         → Browse all rentals
├── GET    /rentals/:id          → View rental details
├── POST   /rentals/create       → List rental item
└── POST   /rentals/book         → Book rental

Chat
├── GET    /chat/list            → Get conversations
├── GET    /chat/:id/messages    → Get chat messages
├── POST   /chat/create          → Start new chat
└── POST   /chat/:id/message     → Send message

Leaderboard
└── GET    /leaderboard          → Get rankings
```

## Seed Data Distribution

```
Database Tables Distribution:
┌─────────────────────────────────────────────┐
│ users (2)                                   │
│ ├─ User A (gig poster + rental owner)      │
│ └─ User B (gig acceptor + rental booker)   │
│                                            │
│ gigs (3)                                   │
│ ├─ Owned by User A                         │
│ ├─ 2 IN_PROGRESS (User B accepted)        │
│ └─ 1 OPEN (waiting for applicants)        │
│                                            │
│ gigApplications (3)                        │
│ ├─ All by User B                          │
│ ├─ 2 ACCEPTED                             │
│ └─ 1 PENDING                              │
│                                            │
│ rentals (3)                                │
│ ├─ Owned by User A                         │
│ ├─ 2 RENTED (User B booked)               │
│ └─ 1 AVAILABLE                            │
│                                            │
│ rentalBookings (3)                         │
│ ├─ All by User B                          │
│ ├─ 2 CONFIRMED                            │
│ └─ 1 PENDING                              │
│                                            │
│ chat (1)                                   │
│ └─ Between User A & User B                │
│                                            │
│ chatMessages (3)                           │
│ └─ In User A ◄─► User B conversation      │
│                                            │
│ leaderboard (2)                            │
│ ├─ User A (rank #5)                       │
│ └─ User B (rank #2)                       │
└─────────────────────────────────────────────┘
