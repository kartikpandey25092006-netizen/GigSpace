import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const NAME_REGEX = /^[a-zA-Z\s'.\-]+$/

type PaymentStatus = 'created' | 'paid' | 'refunded'
interface PaymentRecord {
  id: string
  userId: string
  amount: number
  currency: string
  status: PaymentStatus
  createdAt: Date
  updatedAt: Date
}

const paymentsStore = new Map<string, PaymentRecord>()

// Middleware
app.use(cors())
app.use(express.json())

// Types
interface DecodedToken {
  userId: string
  email: string
}

// Auth middleware
const authMiddleware = (req: any, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

const adminMiddleware = async (req: any, res: Response, next: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, role: true, email: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ data: null, message: 'Admin access required' })
    }

    req.admin = user
    next()
  } catch (error) {
    return res.status(500).json({ data: null, message: 'Failed to verify admin access' })
  }
}

// ==================== AUTH ROUTES ====================
app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password, city } = req.body

    if (!firstName || !NAME_REGEX.test(firstName)) {
      return res.status(400).json({ data: null, message: 'First name can only contain letters and special characters (no numbers)' })
    }
    if (!lastName || !NAME_REGEX.test(lastName)) {
      return res.status(400).json({ data: null, message: 'Last name can only contain letters and special characters (no numbers)' })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ data: null, message: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        city,
        role: 'WORKER',
      },
    })

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({
      data: {
        user: { ...user, password: undefined },
        token,
      },
      message: 'Registration successful',
    })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Internal server error' })
  }
})

app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ data: null, message: 'Invalid credentials' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ data: null, message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({
      data: {
        user: { ...user, password: undefined },
        token,
      },
      message: 'Login successful',
    })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Internal server error' })
  }
})

app.post('/auth/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ data: null, message: 'Invalid admin credentials' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ data: null, message: 'Invalid admin credentials' })
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ data: null, message: 'Admin access denied' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({
      data: {
        user: { ...user, password: undefined },
        token,
      },
      message: 'Admin login successful',
    })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Internal server error' })
  }
})

app.get('/auth/profile', authMiddleware, async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    })

    if (!user) {
      return res.status(404).json({ data: null, message: 'User not found' })
    }

    res.json({
      data: { user: { ...user, password: undefined } },
      message: 'Profile fetched',
    })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Internal server error' })
  }
})

app.put('/auth/profile', authMiddleware, async (req: any, res: Response) => {
  try {
    const { firstName, lastName, phone, city } = req.body

    if (firstName && !NAME_REGEX.test(firstName)) {
      return res.status(400).json({ data: null, message: 'First name can only contain letters and special characters (no numbers)' })
    }
    if (lastName && !NAME_REGEX.test(lastName)) {
      return res.status(400).json({ data: null, message: 'Last name can only contain letters and special characters (no numbers)' })
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        phone: phone ?? undefined,
        city: city ?? undefined,
      },
    })

    res.json({
      data: { user: { ...user, password: undefined } },
      message: 'Profile updated',
    })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to update profile' })
  }
})

// ==================== ADMIN GIG CONTROL ROUTES ====================
app.get('/admin/gigs/logs', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query
    const where: any = {}
    if (status) where.status = status

    const gigs = await prisma.gig.findMany({
      where,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        applications: {
          include: {
            worker: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
          orderBy: { appliedAt: 'desc' },
        },
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { updatedAt: 'desc' },
    })

    const total = await prisma.gig.count({ where })
    res.json({ data: { gigs, total }, message: 'Admin gig logs fetched' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch admin gig logs' })
  }
})

app.get('/admin/gigs/:id/log', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const gig = await prisma.gig.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        applications: {
          include: {
            worker: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
          orderBy: { appliedAt: 'desc' },
        },
      },
    })

    if (!gig) {
      return res.status(404).json({ data: null, message: 'Gig not found' })
    }

    res.json({ data: { gig }, message: 'Admin gig log fetched' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch gig log' })
  }
})

app.put('/admin/gigs/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, description, budget, deadline, category, location, priority, status, adminMessage } = req.body

    const existing = await prisma.gig.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ data: null, message: 'Gig not found' })
    }

    const gig = await prisma.gig.update({
      where: { id },
      data: {
        title: title ?? undefined,
        description: description ?? undefined,
        budget: budget !== undefined ? parseFloat(String(budget)) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        category: category ?? undefined,
        location: location ?? undefined,
        priority: priority ?? undefined,
        status: status ?? undefined,
      },
    })

    // Notify the listing owner
    await prisma.adminNotification.create({
      data: {
        userId: existing.ownerId,
        type: 'LISTING_MODIFIED',
        title: `Your gig "${existing.title}" was modified by admin`,
        message: adminMessage || 'An administrator has modified your gig listing. Please review the changes.',
      },
    })

    res.json({ data: { gig }, message: 'Gig updated by admin' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to update gig' })
  }
})

app.post('/admin/gigs/:id/status', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const allowedStatuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ data: null, message: 'Invalid status' })
    }

    const gig = await prisma.gig.update({
      where: { id },
      data: { status },
    })

    res.json({ data: { gig }, message: 'Gig status updated by admin' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to update gig status' })
  }
})

app.post('/admin/gigs/:id/assign', authMiddleware, adminMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const { workerId } = req.body

    const gig = await prisma.gig.findUnique({ where: { id } })
    if (!gig) {
      return res.status(404).json({ data: null, message: 'Gig not found' })
    }

    const worker = await prisma.user.findUnique({ where: { id: workerId } })
    if (!worker) {
      return res.status(404).json({ data: null, message: 'Worker not found' })
    }

    const application = await prisma.gigApplication.upsert({
      where: { gigId_workerId: { gigId: id, workerId } },
      create: {
        gigId: id,
        workerId,
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      update: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    })

    const updatedGig = await prisma.gig.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    })

    res.json({ data: { gig: updatedGig, application }, message: 'Worker assigned by admin' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to assign worker' })
  }
})

app.delete('/admin/gigs/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const gig = await prisma.gig.findUnique({ where: { id } })
    if (!gig) {
      return res.status(404).json({ data: null, message: 'Gig not found' })
    }

    // Notify the listing owner before deleting
    await prisma.adminNotification.create({
      data: {
        userId: gig.ownerId,
        type: 'LISTING_DELETED',
        title: `Your gig "${gig.title}" was removed by admin`,
        message: 'An administrator has removed your gig listing due to policy violations or other reasons.',
      },
    })

    await prisma.gig.delete({ where: { id } })
    res.json({ data: { deleted: true, gigId: id }, message: 'Gig deleted by admin' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to delete gig' })
  }
})

// ==================== ADMIN USER MANAGEMENT ====================
app.get('/admin/users', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { search, status, role, limit = 50, offset = 0 } = req.query
    const where: any = {}
    if (status) where.status = status
    if (role) where.role = role
    if (search) {
      where.OR = [
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
        { email: { contains: search as string } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true,
        city: true, role: true, status: true, rating: true, completedGigs: true,
        totalEarnings: true, activeRentals: true, createdAt: true, updatedAt: true,
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.user.count({ where })
    res.json({ data: { users, total }, message: 'Users fetched' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch users' })
  }
})

app.get('/admin/users/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true,
        city: true, role: true, status: true, rating: true, completedGigs: true,
        totalEarnings: true, activeRentals: true, leaderboardRank: true,
        createdAt: true, updatedAt: true,
      },
    })
    if (!user) {
      return res.status(404).json({ data: null, message: 'User not found' })
    }
    res.json({ data: { user }, message: 'User fetched' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch user' })
  }
})

app.put('/admin/users/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { firstName, lastName, email, phone, city, role } = req.body

    if (firstName && !NAME_REGEX.test(firstName)) {
      return res.status(400).json({ data: null, message: 'First name can only contain letters and special characters (no numbers)' })
    }
    if (lastName && !NAME_REGEX.test(lastName)) {
      return res.status(400).json({ data: null, message: 'Last name can only contain letters and special characters (no numbers)' })
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
        city: city ?? undefined,
        role: role ?? undefined,
      },
    })
    res.json({ data: { user: { ...user, password: undefined } }, message: 'User updated by admin' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to update user' })
  }
})

app.put('/admin/users/:id/password', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ data: null, message: 'Password must be at least 6 characters' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    await prisma.adminNotification.create({
      data: {
        userId: id,
        type: 'GENERAL',
        title: 'Your password was reset',
        message: 'An administrator has reset your password. Please contact support if this was unexpected.',
      },
    })

    res.json({ data: null, message: 'Password reset successfully' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to reset password' })
  }
})

app.put('/admin/users/:id/status', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const allowedStatuses = ['ACTIVE', 'SUSPENDED', 'BLACKLISTED']
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ data: null, message: 'Invalid status. Must be ACTIVE, SUSPENDED, or BLACKLISTED' })
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status },
    })

    const notifType = status === 'ACTIVE' ? 'ACCOUNT_REACTIVATED' : 'ACCOUNT_SUSPENDED'
    const notifTitle = status === 'ACTIVE'
      ? 'Your account has been reactivated'
      : status === 'SUSPENDED'
        ? 'Your account has been suspended'
        : 'Your account has been banned'
    const notifMsg = status === 'ACTIVE'
      ? 'Your account is now active again. You can resume using the platform.'
      : 'Your account has been restricted by an administrator. Contact support for more information.'

    await prisma.adminNotification.create({
      data: { userId: id, type: notifType, title: notifTitle, message: notifMsg },
    })

    res.json({ data: { user: { ...user, password: undefined } }, message: `User status updated to ${status}` })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to update user status' })
  }
})

// ==================== ADMIN RENTAL MANAGEMENT ====================
app.get('/admin/rentals', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query
    const where: any = {}
    if (status) where.status = status

    const rentals = await prisma.rental.findMany({
      where,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        bookings: { select: { id: true, status: true } },
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { updatedAt: 'desc' },
    })

    const total = await prisma.rental.count({ where })
    res.json({ data: { rentals, total }, message: 'Admin rentals fetched' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch rentals' })
  }
})

app.put('/admin/rentals/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, description, category, location, pricePerHour, pricePerDay, deposit, status, adminMessage } = req.body

    const existing = await prisma.rental.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ data: null, message: 'Rental not found' })
    }

    const rental = await prisma.rental.update({
      where: { id },
      data: {
        title: title ?? undefined,
        description: description ?? undefined,
        category: category ?? undefined,
        location: location ?? undefined,
        pricePerHour: pricePerHour !== undefined ? parseFloat(String(pricePerHour)) : undefined,
        pricePerDay: pricePerDay !== undefined ? parseFloat(String(pricePerDay)) : undefined,
        deposit: deposit !== undefined ? parseFloat(String(deposit)) : undefined,
        status: status ?? undefined,
      },
    })

    await prisma.adminNotification.create({
      data: {
        userId: existing.ownerId,
        type: 'LISTING_MODIFIED',
        title: `Your rental "${existing.title}" was modified by admin`,
        message: adminMessage || 'An administrator has modified your rental listing. Please review the changes.',
      },
    })

    res.json({ data: { rental }, message: 'Rental updated by admin' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to update rental' })
  }
})

app.delete('/admin/rentals/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const rental = await prisma.rental.findUnique({ where: { id } })
    if (!rental) {
      return res.status(404).json({ data: null, message: 'Rental not found' })
    }

    await prisma.adminNotification.create({
      data: {
        userId: rental.ownerId,
        type: 'LISTING_DELETED',
        title: `Your rental "${rental.title}" was removed by admin`,
        message: 'An administrator has removed your rental listing due to policy violations or other reasons.',
      },
    })

    await prisma.rental.delete({ where: { id } })
    res.json({ data: { deleted: true, rentalId: id }, message: 'Rental deleted by admin' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to delete rental' })
  }
})

// ==================== ADMIN REPORTS ====================
app.get('/admin/reports', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, type, limit = 50, offset = 0 } = req.query
    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    const reports = await prisma.report.findMany({
      where,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.report.count({ where })
    res.json({ data: { reports, total }, message: 'Reports fetched' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch reports' })
  }
})

app.put('/admin/reports/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, adminNote } = req.body

    const allowedStatuses = ['OPEN', 'RESOLVED', 'DISMISSED']
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ data: null, message: 'Invalid status' })
    }

    const report = await prisma.report.update({
      where: { id },
      data: {
        status: status ?? undefined,
        adminNote: adminNote ?? undefined,
      },
    })

    res.json({ data: { report }, message: 'Report updated' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to update report' })
  }
})

// ==================== ADMIN ANALYTICS ====================
app.get('/admin/analytics', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } })
    const suspendedUsers = await prisma.user.count({ where: { status: 'SUSPENDED' } })
    const bannedUsers = await prisma.user.count({ where: { status: 'BLACKLISTED' } })

    const totalGigs = await prisma.gig.count()
    const openGigs = await prisma.gig.count({ where: { status: 'OPEN' } })
    const inProgressGigs = await prisma.gig.count({ where: { status: 'IN_PROGRESS' } })
    const completedGigs = await prisma.gig.count({ where: { status: 'COMPLETED' } })

    const totalRentals = await prisma.rental.count()
    const availableRentals = await prisma.rental.count({ where: { status: 'AVAILABLE' } })
    const rentedRentals = await prisma.rental.count({ where: { status: 'RENTED' } })

    const openReports = await prisma.report.count({ where: { status: 'OPEN' } })
    const totalReports = await prisma.report.count()

    const earningsAgg = await prisma.user.aggregate({ _sum: { totalEarnings: true } })
    const totalEarnings = earningsAgg._sum.totalEarnings || 0

    res.json({
      data: {
        users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, banned: bannedUsers },
        gigs: { total: totalGigs, open: openGigs, inProgress: inProgressGigs, completed: completedGigs },
        rentals: { total: totalRentals, available: availableRentals, rented: rentedRentals },
        reports: { total: totalReports, open: openReports },
        totalEarnings,
      },
      message: 'Analytics fetched',
    })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch analytics' })
  }
})

// ==================== ADMIN NOTIFY ====================
app.post('/admin/notify', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, type, title, message } = req.body

    if (!userId || !title || !message) {
      return res.status(400).json({ data: null, message: 'userId, title, and message are required' })
    }

    const notification = await prisma.adminNotification.create({
      data: { userId, type: type || 'GENERAL', title, message },
    })

    res.json({ data: { notification }, message: 'Notification sent' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to send notification' })
  }
})

// ==================== USER NOTIFICATIONS ====================
app.get('/notifications', authMiddleware, async (req: any, res: Response) => {
  try {
    const notifications = await prisma.adminNotification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = await prisma.adminNotification.count({
      where: { userId: req.user.userId, read: false },
    })

    res.json({ data: { notifications, unreadCount }, message: 'Notifications fetched' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch notifications' })
  }
})

app.put('/notifications/:id/read', authMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const notification = await prisma.adminNotification.update({
      where: { id },
      data: { read: true },
    })
    res.json({ data: { notification }, message: 'Notification marked as read' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to update notification' })
  }
})

app.put('/notifications/read-all', authMiddleware, async (req: any, res: Response) => {
  try {
    await prisma.adminNotification.updateMany({
      where: { userId: req.user.userId, read: false },
      data: { read: true },
    })
    res.json({ data: null, message: 'All notifications marked as read' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to mark all as read' })
  }
})

// ==================== USER REPORT SUBMISSION ====================
app.post('/reports/create', authMiddleware, async (req: any, res: Response) => {
  try {
    const { type, targetId, reason, description } = req.body

    const allowedTypes = ['USER', 'GIG', 'RENTAL']
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ data: null, message: 'Invalid report type. Must be USER, GIG, or RENTAL' })
    }
    if (!targetId || !reason) {
      return res.status(400).json({ data: null, message: 'targetId and reason are required' })
    }

    const report = await prisma.report.create({
      data: {
        type,
        targetId,
        reporterId: req.user.userId,
        reason,
        description: description || null,
      },
    })

    res.json({ data: { report }, message: 'Report submitted' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to submit report' })
  }
})

// ==================== GIG ROUTES ====================
app.post('/gigs/create', authMiddleware, async (req: any, res: Response) => {
  try {
    const { title, description, budget, deadline, category, location, priority } = req.body

    const gig = await prisma.gig.create({
      data: {
        title,
        description,
        budget: parseFloat(budget),
        deadline: new Date(deadline),
        category,
        location,
        priority: priority || 'MEDIUM',
        ownerId: req.user.userId,
      },
    })

    res.json({ data: { gig }, message: 'Gig created successfully' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to create gig' })
  }
})

app.get('/gigs/list', async (req: Request, res: Response) => {
  try {
    const { status, category, limit = 10, offset = 0 } = req.query

    const where: any = {}
    if (status) where.status = status
    if (category) where.category = category

    const gigs = await prisma.gig.findMany({
      where,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, rating: true } },
        applications: { select: { id: true, status: true } },
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.gig.count({ where })

    res.json({
      data: { gigs, total, limit: parseInt(limit as string) },
      message: 'Gigs fetched',
    })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch gigs' })
  }
})

app.get('/gigs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const gig = await prisma.gig.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, rating: true, completedGigs: true } },
        applications: {
          include: { worker: { select: { id: true, firstName: true, lastName: true, rating: true } } },
        },
      },
    })

    if (!gig) {
      return res.status(404).json({ data: null, message: 'Gig not found' })
    }

    res.json({ data: { gig }, message: 'Gig fetched' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch gig' })
  }
})

app.post('/gigs/accept', authMiddleware, async (req: any, res: Response) => {
  try {
    const { gigId } = req.body

    const gig = await prisma.gig.findUnique({ where: { id: gigId } })
    if (!gig) {
      return res.status(404).json({ data: null, message: 'Gig not found' })
    }

    const existingApp = await prisma.gigApplication.findFirst({
      where: { gigId, workerId: req.user.userId },
    })

    if (existingApp) {
      return res.status(400).json({ data: null, message: 'Already applied for this gig' })
    }

    const application = await prisma.gigApplication.create({
      data: {
        gigId,
        workerId: req.user.userId,
        status: 'PENDING',
      },
    })

    res.json({ data: { application }, message: 'Application submitted' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to apply for gig' })
  }
})

app.post('/gigs/start', authMiddleware, async (req: any, res: Response) => {
  try {
    const { gigId } = req.body

    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: { applications: true },
    })
    if (!gig) {
      return res.status(404).json({ data: null, message: 'Gig not found' })
    }

    const isOwner = gig.ownerId === req.user.userId
    const isAcceptedWorker = gig.applications.some(
      (app) => app.workerId === req.user.userId && app.status === 'ACCEPTED'
    )
    if (!isOwner && !isAcceptedWorker) {
      return res.status(403).json({ data: null, message: 'Not allowed to start this gig' })
    }

    const updatedGig = await prisma.gig.update({
      where: { id: gigId },
      data: { status: 'IN_PROGRESS' },
    })

    res.json({ data: { gig: updatedGig }, message: 'Gig started' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to start gig' })
  }
})

app.post('/gigs/complete', authMiddleware, async (req: any, res: Response) => {
  try {
    const { gigId } = req.body

    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: { applications: true },
    })
    if (!gig) {
      return res.status(404).json({ data: null, message: 'Gig not found' })
    }
    if (gig.ownerId !== req.user.userId) {
      return res.status(403).json({ data: null, message: 'Only gig owner can complete this gig' })
    }

    const updatedGig = await prisma.gig.update({
      where: { id: gigId },
      data: { status: 'COMPLETED' },
    })

    const acceptedApps = gig.applications.filter((app) => app.status === 'ACCEPTED')
    if (acceptedApps.length > 0) {
      await prisma.gigApplication.updateMany({
        where: { gigId, status: 'ACCEPTED' },
        data: { status: 'COMPLETED', completedAt: new Date() },
      })

      for (const appItem of acceptedApps) {
        await prisma.user.update({
          where: { id: appItem.workerId },
          data: {
            completedGigs: { increment: 1 },
            totalEarnings: { increment: gig.budget },
          },
        })
      }
    }

    res.json({ data: { gig: updatedGig }, message: 'Gig completed' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to complete gig' })
  }
})

app.post('/gigs/cancel', authMiddleware, async (req: any, res: Response) => {
  try {
    const { gigId } = req.body

    const gig = await prisma.gig.findUnique({ where: { id: gigId } })
    if (!gig) {
      return res.status(404).json({ data: null, message: 'Gig not found' })
    }
    if (gig.ownerId !== req.user.userId) {
      return res.status(403).json({ data: null, message: 'Only gig owner can cancel this gig' })
    }
    if (gig.status === 'COMPLETED') {
      return res.status(400).json({ data: null, message: 'Completed gig cannot be cancelled' })
    }

    const updatedGig = await prisma.gig.update({
      where: { id: gigId },
      data: { status: 'CANCELLED' },
    })

    await prisma.gigApplication.updateMany({
      where: { gigId, status: { in: ['PENDING', 'ACCEPTED'] } },
      data: { status: 'REJECTED' },
    })

    res.json({ data: { gig: updatedGig }, message: 'Gig cancelled' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to cancel gig' })
  }
})

// ==================== RENTAL ROUTES ====================
app.post('/rentals/create', authMiddleware, async (req: any, res: Response) => {
  try {
    const { title, description, category, location, pricePerHour, pricePerDay, deposit } = req.body

    const rental = await prisma.rental.create({
      data: {
        title,
        description,
        category,
        location,
        pricePerHour: pricePerHour ? parseFloat(pricePerHour) : null,
        pricePerDay: pricePerDay ? parseFloat(pricePerDay) : null,
        deposit: parseFloat(deposit),
        ownerId: req.user.userId,
      },
    })

    res.json({ data: { rental }, message: 'Rental created successfully' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to create rental' })
  }
})

app.get('/rentals/list', async (req: Request, res: Response) => {
  try {
    const { status, category, limit = 10, offset = 0 } = req.query

    const where: any = {}
    if (status) where.status = status
    if (category) where.category = category

    const rentals = await prisma.rental.findMany({
      where,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, rating: true } },
        bookings: { select: { id: true, status: true } },
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.rental.count({ where })

    res.json({
      data: { rentals, total, limit: parseInt(limit as string) },
      message: 'Rentals fetched',
    })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch rentals' })
  }
})

app.get('/rentals/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const item = await prisma.rental.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, rating: true } },
        bookings: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      },
    })

    if (!item) {
      return res.status(404).json({ data: null, message: 'Rental not found' })
    }

    res.json({ data: { item }, message: 'Rental fetched' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch rental' })
  }
})

app.post('/rentals/book', authMiddleware, async (req: any, res: Response) => {
  try {
    const { rentalId, startDate, endDate, rentalType } = req.body

    const rental = await prisma.rental.findUnique({ where: { id: rentalId } })
    if (!rental) {
      return res.status(404).json({ data: null, message: 'Rental not found' })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    let totalAmount = 0
    if (rentalType === 'daily' && rental.pricePerDay) {
      totalAmount = rental.pricePerDay * days
    } else if (rentalType === 'hourly' && rental.pricePerHour) {
      totalAmount = rental.pricePerHour * (days * 24)
    }

    const booking = await prisma.rentalBooking.create({
      data: {
        rentalId,
        userId: req.user.userId,
        startDate: start,
        endDate: end,
        rentalType,
        totalAmount,
      },
    })

    res.json({ data: { booking }, message: 'Rental booking created' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to book rental' })
  }
})

app.post('/rentals/start', authMiddleware, async (req: any, res: Response) => {
  try {
    const { orderId } = req.body

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: orderId },
      include: { rental: true },
    })
    if (!booking) {
      return res.status(404).json({ data: null, message: 'Booking not found' })
    }
    if (booking.rental.ownerId !== req.user.userId) {
      return res.status(403).json({ data: null, message: 'Only rental owner can start rental' })
    }

    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED', confirmedAt: new Date() },
    })

    await prisma.rental.update({
      where: { id: booking.rentalId },
      data: { status: 'RENTED' },
    })

    res.json({ data: { booking: updatedBooking }, message: 'Rental started' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to start rental' })
  }
})

app.post('/rentals/return', authMiddleware, async (req: any, res: Response) => {
  try {
    const { orderId } = req.body

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: orderId },
      include: { rental: true },
    })
    if (!booking) {
      return res.status(404).json({ data: null, message: 'Booking not found' })
    }
    if (booking.rental.ownerId !== req.user.userId) {
      return res.status(403).json({ data: null, message: 'Only rental owner can close rental' })
    }

    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: orderId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })

    await prisma.rental.update({
      where: { id: booking.rentalId },
      data: { status: 'AVAILABLE' },
    })

    res.json({ data: { booking: updatedBooking }, message: 'Rental returned' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to complete rental return' })
  }
})

app.post('/rentals/report-damage', authMiddleware, async (req: any, res: Response) => {
  try {
    const { orderId } = req.body

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: orderId },
      include: { rental: true },
    })
    if (!booking) {
      return res.status(404).json({ data: null, message: 'Booking not found' })
    }
    if (booking.rental.ownerId !== req.user.userId) {
      return res.status(403).json({ data: null, message: 'Only rental owner can report damage' })
    }

    const updatedBooking = await prisma.rentalBooking.update({
      where: { id: orderId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })

    await prisma.rental.update({
      where: { id: booking.rentalId },
      data: { status: 'MAINTENANCE' },
    })

    res.json({ data: { booking: updatedBooking }, message: 'Damage reported for rental' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to report damage' })
  }
})

// ==================== CHAT ROUTES ====================
app.post('/chat/create', authMiddleware, async (req: any, res: Response) => {
  try {
    const { participantId } = req.body

    const chat = await prisma.chat.create({
      data: {
        participants: {
          create: [
            { userId: req.user.userId },
            { userId: participantId }
          ]
        }
      },
      include: {
        participants: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } }
        }
      },
    })

    res.json({ data: { chat }, message: 'Chat created' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to create chat' })
  }
})

app.get('/chat/list', authMiddleware, async (req: any, res: Response) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: { userId: req.user.userId },
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } }
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    })

    res.json({ data: { chats }, message: 'Chats fetched' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch chats' })
  }
})

app.get('/chat/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { limit = 50 } = req.query

    const messages = await prisma.chatMessage.findMany({
      where: { chatId: id },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    })

    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        participants: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } }
        }
      },
    })

    res.json({ data: { messages: messages.reverse(), chat }, message: 'Messages fetched' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch messages' })
  }
})

app.post('/chat/:id/message', authMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const { content } = req.body

    const message = await prisma.chatMessage.create({
      data: {
        chatId: id,
        senderId: req.user.userId,
        content,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    await prisma.chat.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    res.json({ data: { message }, message: 'Message sent' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to send message' })
  }
})

app.delete('/chat/message/:messageId', authMiddleware, async (req: any, res: Response) => {
  try {
    const { messageId } = req.params

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    })
    if (!message) {
      return res.status(404).json({ data: null, message: 'Message not found' })
    }
    if (message.senderId !== req.user.userId) {
      return res.status(403).json({ data: null, message: 'Not allowed to delete this message' })
    }

    await prisma.chatMessage.delete({ where: { id: messageId } })
    res.json({ data: { deleted: true }, message: 'Message deleted' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to delete message' })
  }
})

// ==================== PAYMENT ROUTES ====================
app.post('/payments/create-order', authMiddleware, async (req: any, res: Response) => {
  try {
    if (!RAZORPAY_KEY_ID) {
      return res.status(503).json({
        data: null,
        message: 'Payment gateway is not configured. Add Razorpay keys in backend .env',
      })
    }

    const amount = Number(req.body?.amount || 0)
    if (!amount || amount <= 0) {
      return res.status(400).json({ data: null, message: 'Invalid amount' })
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const record: PaymentRecord = {
      id: orderId,
      userId: req.user.userId,
      amount,
      currency: req.body?.currency || 'INR',
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    paymentsStore.set(orderId, record)

    res.json({ data: { order: record, keyId: RAZORPAY_KEY_ID }, message: 'Payment order created' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to create payment order' })
  }
})

app.post('/payments/verify', authMiddleware, async (req: any, res: Response) => {
  try {
    if (!RAZORPAY_KEY_ID) {
      return res.status(503).json({
        data: null,
        message: 'Payment gateway is not configured. Add Razorpay keys in backend .env',
      })
    }

    const orderId = req.body?.orderId as string
    const record = orderId ? paymentsStore.get(orderId) : undefined
    if (!record) {
      return res.status(404).json({ data: null, message: 'Order not found' })
    }

    record.status = 'paid'
    record.updatedAt = new Date()
    paymentsStore.set(orderId, record)

    res.json({ data: { payment: record, verified: true }, message: 'Payment verified' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to verify payment' })
  }
})

app.post('/payments/refund', authMiddleware, async (req: any, res: Response) => {
  try {
    if (!RAZORPAY_KEY_ID) {
      return res.status(503).json({
        data: null,
        message: 'Payment gateway is not configured. Add Razorpay keys in backend .env',
      })
    }

    const paymentId = req.body?.paymentId as string
    const record = paymentId ? paymentsStore.get(paymentId) : undefined
    if (!record) {
      return res.status(404).json({ data: null, message: 'Payment not found' })
    }

    record.status = 'refunded'
    record.updatedAt = new Date()
    paymentsStore.set(paymentId, record)

    res.json({ data: { payment: record }, message: 'Refund processed' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to refund payment' })
  }
})

app.get('/payments/history', authMiddleware, async (req: any, res: Response) => {
  try {
    const items = Array.from(paymentsStore.values())
      .filter((item) => item.userId === req.user.userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

    res.json({ data: { payments: items }, message: 'Payment history fetched' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch payment history' })
  }
})

// ==================== RATING ROUTES ====================
app.post('/ratings/create', authMiddleware, async (req: any, res: Response) => {
  try {
    const { userId, rating } = req.body
    const normalizedRating = Number(rating)

    if (!userId || Number.isNaN(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ data: null, message: 'Invalid rating payload' })
    }

    const target = await prisma.user.findUnique({ where: { id: userId } })
    if (!target) {
      return res.status(404).json({ data: null, message: 'Target user not found' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        rating: Number(((target.rating + normalizedRating) / 2).toFixed(2)),
      },
    })

    const leaderboard = await prisma.leaderboard.upsert({
      where: { userId },
      create: {
        userId,
        rank: target.leaderboardRank || 0,
        completedGigs: target.completedGigs,
        totalEarnings: target.totalEarnings,
        rating: updatedUser.rating,
        period: 'all_time',
      },
      update: {
        completedGigs: updatedUser.completedGigs,
        totalEarnings: updatedUser.totalEarnings,
        rating: updatedUser.rating,
      },
    })

    res.json({ data: { user: updatedUser, leaderboard }, message: 'Rating submitted' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to create rating' })
  }
})

app.get('/ratings/leaderboard/my-rank', authMiddleware, async (req: any, res: Response) => {
  try {
    const entry = await prisma.leaderboard.findUnique({
      where: { userId: req.user.userId },
    })

    if (!entry) {
      return res.status(404).json({ data: null, message: 'No leaderboard entry found' })
    }

    res.json({ data: { rank: entry.rank, entry }, message: 'My rank fetched' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch rank' })
  }
})

// ==================== LEADERBOARD ROUTES ====================
app.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { period = 'all_time', limit = 10 } = req.query

    const leaderboard = await prisma.leaderboard.findMany({
      where: { period: period as string },
      orderBy: { rank: 'asc' },
      take: parseInt(limit as string),
    })

    res.json({ data: { leaderboard }, message: 'Leaderboard fetched' })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch leaderboard' })
  }
})

// ==================== DASHBOARD ROUTES ====================
app.get('/dashboard', authMiddleware, async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    })

    const upcomingGigs = await prisma.gig.findMany({
      where: {
        applications: {
          some: { workerId: req.user.userId, status: 'ACCEPTED' },
        },
      },
      take: 3,
      orderBy: { deadline: 'asc' },
    })

    res.json({
      data: { user, upcomingGigs },
      message: 'Dashboard data fetched',
    })
  } catch (error) {
    res.status(500).json({ data: null, message: 'Failed to fetch dashboard data' })
  }
})

// ==================== HEALTH CHECK ====================
app.get('/health', (req: Request, res: Response) => {
  res.json({ message: 'Backend is running', timestamp: new Date() })
})

// Start server in non-test environments.
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📊 API documentation: http://localhost:${PORT}/health`)
  })
}

export default app
