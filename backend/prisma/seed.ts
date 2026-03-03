import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Delete existing data
  await prisma.chatMessage.deleteMany()
  await prisma.chat.deleteMany()
  await prisma.gigApplication.deleteMany()
  await prisma.gig.deleteMany()
  await prisma.rentalBooking.deleteMany()
  await prisma.rental.deleteMany()
  await prisma.leaderboard.deleteMany()
  await prisma.user.deleteMany()

  console.log('✓ Cleaned database')

  // Create User A (Gig Poster/Rental Owner)
  const userA = await prisma.user.create({
    data: {
      firstName: 'User',
      lastName: 'A',
      email: 'usera@test.com',
      phone: '9999999999',
      city: 'San Francisco',
      password: await bcrypt.hash('password123', 10),
      role: 'BUYER',
      rating: 4.8,
      completedGigs: 12,
      totalEarnings: 0,
      leaderboardRank: 5,
      status: 'ACTIVE',
    },
  })

  console.log('✓ Created User A (Gig Poster):', userA.email)

  // Create User B (Gig Acceptor/Rental Booker)
  const userB = await prisma.user.create({
    data: {
      firstName: 'User',
      lastName: 'B',
      email: 'userb@test.com',
      phone: '8888888888',
      city: 'San Francisco',
      password: await bcrypt.hash('password123', 10),
      role: 'WORKER',
      rating: 4.9,
      completedGigs: 25,
      totalEarnings: 5000,
      leaderboardRank: 2,
      status: 'ACTIVE',
    },
  })

  console.log('✓ Created User B (Gig Acceptor):', userB.email)

  // Create Gigs (posted by User A)
  const gig1 = await prisma.gig.create({
    data: {
      title: 'Website Redesign - E-commerce Platform',
      description: 'Need a complete redesign of our e-commerce website. Must include modern UI/UX, responsive design, and shopping cart optimization.',
      budget: 2500,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      category: 'WEB_DESIGN',
      location: 'San Francisco, CA',
      priority: 'HIGH',
      status: 'OPEN',
      ownerId: userA.id,
    },
  })

  const gig2 = await prisma.gig.create({
    data: {
      title: 'Mobile App Development - iOS',
      description: 'Develop a native iOS app for fitness tracking. Should include workout logging, progress charts, and social features.',
      budget: 5000,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      category: 'APP_DEVELOPMENT',
      location: 'San Francisco, CA',
      priority: 'MEDIUM',
      status: 'OPEN',
      ownerId: userA.id,
    },
  })

  const gig3 = await prisma.gig.create({
    data: {
      title: 'Content Writing - Blog Posts',
      description: 'Write 10 high-quality blog posts (1500-2000 words each) about web development trends. SEO optimized.',
      budget: 800,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      category: 'WRITING',
      location: 'Remote',
      priority: 'LOW',
      status: 'OPEN',
      ownerId: userA.id,
    },
  })

  console.log('✓ Created 3 gigs by User A')

  // Create Gig Applications (User B accepts gigs)
  const app1 = await prisma.gigApplication.create({
    data: {
      gigId: gig1.id,
      workerId: userB.id,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  })

  const app2 = await prisma.gigApplication.create({
    data: {
      gigId: gig2.id,
      workerId: userB.id,
      status: 'PENDING',
    },
  })

  const app3 = await prisma.gigApplication.create({
    data: {
      gigId: gig3.id,
      workerId: userB.id,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  })

  console.log('✓ Created 3 gig applications (User B applied for User A\'s gigs)')

  // Update gig status for accepted ones
  await prisma.gig.update({
    where: { id: gig1.id },
    data: { status: 'IN_PROGRESS' },
  })

  await prisma.gig.update({
    where: { id: gig3.id },
    data: { status: 'IN_PROGRESS' },
  })

  console.log('✓ Updated gig statuses for accepted applications')

  // Create Rentals (owned by User A)
  const rental1 = await prisma.rental.create({
    data: {
      title: 'Canon EOS 5D Mark IV - Professional Camera',
      description: 'Professional DSLR camera with 4K video capability. Includes 24-70mm lens, tripod, and accessories.',
      category: 'CAMERA',
      location: 'San Francisco, CA',
      pricePerHour: 50,
      pricePerDay: 200,
      deposit: 500,
      status: 'AVAILABLE',
      ownerId: userA.id,
    },
  })

  const rental2 = await prisma.rental.create({
    data: {
      title: 'MacBook Pro 16" M3 Max - 2024',
      description: 'High-performance laptop for development and design work. 36GB RAM, 1TB SSD. Excellent condition.',
      category: 'ELECTRONICS',
      location: 'San Francisco, CA',
      pricePerDay: 150,
      deposit: 300,
      status: 'AVAILABLE',
      ownerId: userA.id,
    },
  })

  const rental3 = await prisma.rental.create({
    data: {
      title: 'Professional Lighting Kit - Studio Setup',
      description: '5-piece professional lighting kit perfect for photography and video production. Softboxes, stands, and diffusers included.',
      category: 'LIGHTING',
      location: 'San Francisco, CA',
      pricePerDay: 100,
      pricePerHour: 25,
      deposit: 400,
      status: 'AVAILABLE',
      ownerId: userA.id,
    },
  })

  console.log('✓ Created 3 rentals by User A')

  // Create Rental Bookings (User B books rentals)
  const booking1 = await prisma.rentalBooking.create({
    data: {
      rentalId: rental1.id,
      userId: userB.id,
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      rentalType: 'daily',
      status: 'CONFIRMED',
      totalAmount: 600,
      confirmedAt: new Date(),
    },
  })

  const booking2 = await prisma.rentalBooking.create({
    data: {
      rentalId: rental2.id,
      userId: userB.id,
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      rentalType: 'daily',
      status: 'PENDING',
      totalAmount: 750,
    },
  })

  const booking3 = await prisma.rentalBooking.create({
    data: {
      rentalId: rental3.id,
      userId: userB.id,
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      rentalType: 'daily',
      status: 'CONFIRMED',
      totalAmount: 200,
      confirmedAt: new Date(),
    },
  })

  console.log('✓ Created 3 rental bookings (User B booked User A\'s rentals)')

  // Update rental status for booked ones
  await prisma.rental.update({
    where: { id: rental1.id },
    data: { status: 'RENTED' },
  })

  await prisma.rental.update({
    where: { id: rental3.id },
    data: { status: 'RENTED' },
  })

  console.log('✓ Updated rental statuses')

  // Create a chat between User A and User B
  const chat = await prisma.chat.create({
    data: {
      participants: {
        create: [
          { userId: userA.id },
          { userId: userB.id }
        ]
      }
    },
  })

  // Create chat messages
  await prisma.chatMessage.create({
    data: {
      chatId: chat.id,
      senderId: userA.id,
      content: 'Hi! I love your profile. I think you\'d be perfect for my website redesign project.',
    },
  })

  await prisma.chatMessage.create({
    data: {
      chatId: chat.id,
      senderId: userB.id,
      content: 'Thanks! I\'d love to learn more about the project. What\'s the timeline and budget?',
    },
  })

  await prisma.chatMessage.create({
    data: {
      chatId: chat.id,
      senderId: userA.id,
      content: 'The budget is $2500 and deadline is 30 days. Can we schedule a call to discuss details?',
    },
  })

  console.log('✓ Created chat between User A and User B')

  // Create leaderboard entries
  await prisma.leaderboard.create({
    data: {
      userId: userA.id,
      rank: 5,
      completedGigs: 12,
      totalEarnings: 0,
      rating: 4.8,
      period: 'all_time',
    },
  })

  await prisma.leaderboard.create({
    data: {
      userId: userB.id,
      rank: 2,
      completedGigs: 25,
      totalEarnings: 5000,
      rating: 4.9,
      period: 'all_time',
    },
  })

  console.log('✓ Created leaderboard entries')

  console.log('✅ Database seed completed successfully!')
  console.log('\n📝 Test Credentials:')
  console.log('User A (Gig Poster): usera@test.com / password123')
  console.log('User B (Gig Acceptor): userb@test.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
