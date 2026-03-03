'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { DollarSign, Briefcase, Package, TrendingUp, Plus, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import AnimatedCard from '@/components/AnimatedCard'
import AnimatedSkeleton from '@/components/AnimatedSkeleton'

interface DashboardData {
  completedGigs: number
  totalEarnings: number
  activeRentals: number
  currentRank: number
  upcomingGigs: any[]
  recentEarnings: any[]
}

export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (user.role === 'ADMIN') {
      router.push('/admin/dashboard')
      return
    }

    fetchDashboardData()
  }, [user, router])

  const fetchDashboardData = async () => {
    try {
      const [gigsRes, paymentsRes] = await Promise.all([
        apiClient.get('/gigs/list?status=accepted,in_progress'),
        apiClient.get('/payments/history?limit=5'),
      ])

      setData({
        completedGigs: user?.completedGigs || 0,
        totalEarnings: user?.totalEarnings || 0,
        activeRentals: user?.activeRentals || 0,
        currentRank: user?.leaderboardRank || 0,
        upcomingGigs: gigsRes.data.data?.gigs || [],
        recentEarnings: paymentsRes.data.data?.payments || [],
      })
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome */}
        <motion.div className="mb-8" initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5}}>
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your account
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div className="grid md:grid-cols-4 gap-4 mb-8" initial="hidden" animate="visible" variants={{hidden: {opacity: 0}, visible: {opacity: 1, transition: {staggerChildren: 0.1}}}}>
          {[
            {label: 'Completed Gigs', value: data?.completedGigs || 0, icon: Briefcase, color: 'text-indigo-600'},
            {label: 'Total Earnings', value: `₹${data?.totalEarnings || 0}`, icon: DollarSign, color: 'text-green-600'},
            {label: 'Active Rentals', value: data?.activeRentals || 0, icon: Package, color: 'text-orange-600'},
            {label: 'Leaderboard Rank', value: `#${data?.currentRank || 'N/A'}`, icon: TrendingUp, color: 'text-yellow-600'}
          ].map((stat, i) => (
            <motion.div key={i} variants={{hidden: {opacity: 0, y: 20}, visible: {opacity: 1, y: 0}}}>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={stat.color} size={32} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div className="grid md:grid-cols-3 gap-4 mb-8" initial="hidden" animate="visible" variants={{hidden: {opacity: 0}, visible: {opacity: 1, transition: {staggerChildren: 0.1, delayChildren: 0.3}}}}>
          {[
            {href: '/gigs/create', icon: Plus, title: 'Post a Gig', desc: 'Need help? Post a job', bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600'},
            {href: '/gigs', icon: Briefcase, title: 'Find Gigs', desc: 'Browse available jobs', bgColor: 'bg-green-100', iconColor: 'text-green-600'},
            {href: '/rentals', icon: Package, title: 'Browse Rentals', desc: 'Rent items or list yours', bgColor: 'bg-orange-100', iconColor: 'text-orange-600'}
          ].map((action, i) => (
            <motion.div key={i} variants={{hidden: {opacity: 0, x: -20}, visible: {opacity: 1, x: 0}}} whileHover={{scale: 1.02}}>
              <Link href={action.href} className="card-hover flex items-center gap-4">
                <div className={`${action.bgColor} p-3 rounded-lg`}>
                  <action.icon className={action.iconColor} size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Upcoming Gigs */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Upcoming Gigs
            </h2>
            {data?.upcomingGigs && data.upcomingGigs.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingGigs.map((gig) => (
                  <div key={gig.id} className="border-l-4 border-indigo-600 pl-4 py-2">
                    <p className="font-bold text-gray-900">{gig.title}</p>
                    <p className="text-sm text-gray-600">₹{gig.budget}</p>
                    <span className="inline-block mt-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      {gig.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No upcoming gigs. <Link href="/gigs/create" className="text-indigo-600 font-medium">Post one now</Link></p>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Earnings
            </h2>
            {data?.recentEarnings && data.recentEarnings.length > 0 ? (
              <div className="space-y-3">
                {data.recentEarnings.map((earning) => (
                  <div key={earning.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                    <div>
                      <p className="font-bold text-gray-900">{earning.type}</p>
                      <p className="text-sm text-gray-600">{new Date(earning.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="font-bold text-green-600">+₹{earning.amount}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No earnings yet. Complete gigs to earn money!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
