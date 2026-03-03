# 🎯 Quick Reference - Test User Workflows

## User A (Gig Poster) - usera@test.com / password123

### Dashboard Stats
- ✅ 12 Completed Gigs
- 💰 $0 Total Earnings (poster, doesn't earn from gigs)
- 🔝 Rank #5 on Leaderboard
- ⭐ 4.8 Rating

### Posted Gigs
1. **Website Redesign** - $2500 (IN_PROGRESS)
   - User B has accepted this
   - Due in 30 days
   
2. **Mobile App Development** - $5000 (IN_PROGRESS)
   - User B has accepted this
   - Due in 60 days
   
3. **Content Writing** - $800 (OPEN)
   - Available for application
   - Due in 14 days

### Rental Items
1. **Canon EOS 5D Mark IV** - RENTED
   - $50/hour or $200/day
   - Booked by User B (confirmed)
   
2. **MacBook Pro 16" M3 Max** - AVAILABLE
   - $150/day
   - Open for bookings
   
3. **Professional Lighting Kit** - RENTED
   - $25/hour or $100/day
   - Booked by User B (confirmed)

### Chat
- Active conversation with User B
- 3 messages in history

---

## User B (Gig Acceptor) - userb@test.com / password123

### Dashboard Stats
- ✅ 25 Completed Gigs
- 💰 $5000 Total Earnings
- 🔝 Rank #2 on Leaderboard
- ⭐ 4.9 Rating

### Accepted Gigs (from User A)
1. **Website Redesign** - $2500
   - Status: IN_PROGRESS
   - Accepted: User B
   - Due: 30 days
   
2. **Mobile App Development** - $5000
   - Status: PENDING (application submitted)
   - Awaiting acceptance from User A
   
3. **Content Writing** - $800
   - Status: IN_PROGRESS
   - Accepted: User B
   - Due: 14 days

### Booked Rentals (from User A)
1. **Canon EOS 5D Mark IV**
   - Status: CONFIRMED
   - Duration: 3 days
   - Cost: $600
   
2. **MacBook Pro 16"**
   - Status: PENDING
   - Duration: 5 days
   - Cost: $750
   
3. **Professional Lighting Kit**
   - Status: CONFIRMED
   - Duration: 2 days
   - Cost: $200

### Chat
- Active conversation with User A
- 3 messages in history

---

## Test Workflows to Try

### 1️⃣ View Gig Applications (User A)
1. Login as User A (usera@test.com)
2. Click "Gigs" in navigation
3. Click on "Website Redesign" gig
4. See User B's application status: ACCEPTED

### 2️⃣ Check Accepted Gigs (User B)
1. Login as User B (userb@test.com)
2. Go to Dashboard
3. See "Upcoming Gigs" section
4. Shows gigs accepted from User A

### 3️⃣ Browse All Rentals (User B)
1. Login as User B
2. Click "Rentals" in navigation
3. See all 3 rental items from User A
4. Click item to see booking details

### 4️⃣ View Booking Details (User A)
1. Login as User A
2. Click "Rentals" in navigation
3. See which of your items are rented
4. View booking dates and amounts

### 5️⃣ Check Leaderboard
1. Any user can click "Leaderboard"
2. See both users ranked:
   - User B #2 with $5000 earnings
   - User A #5 with 12 completed gigs

### 6️⃣ Message Between Users
1. Login as User A
2. Click "Chat" in navigation
3. See conversation with User B
4. View message history

### 7️⃣ Register & Invite New User
1. Click "Register" to create new account
2. Fill form with new email
3. Login with new account
4. Empty dashboard (no gigs/rentals yet)
5. Can post new gig or apply to existing ones

---

## API Test Commands

### Login User A
```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usera@test.com",
    "password": "password123"
  }'
```

### Get All Gigs
```bash
curl http://localhost:3002/gigs/list
```

### Get Specific Gig
```bash
curl http://localhost:3002/gigs/{gigId}
```

### Get All Rentals
```bash
curl http://localhost:3002/rentals/list
```

### Get Leaderboard
```bash
curl http://localhost:3002/leaderboard
```

---

## Database Status

### Current Data
- **Users**: 2 (User A + User B)
- **Gigs**: 3 (posted by User A)
- **Gig Applications**: 3 (User B applied to all)
- **Rentals**: 3 (owned by User A)
- **Rental Bookings**: 3 (User B booked all)
- **Chat**: 1 (between User A & B)
- **Messages**: 3 (in User A-B chat)
- **Leaderboard**: 2 entries

### Reset Data
```bash
cd backend
npm run db:reset
```

This resets everything and recreates seed data.

---

## What's Pre-configured ✅

- ✅ Two test users with profiles
- ✅ Multiple gigs with different statuses
- ✅ User B has accepted/applied for gigs
- ✅ Multiple rental items with bookings
- ✅ Active chat history between users
- ✅ Leaderboard rankings
- ✅ Database migrations
- ✅ JWT authentication
- ✅ CORS enabled
- ✅ Password hashing

---

**Start testing now! 🚀**
