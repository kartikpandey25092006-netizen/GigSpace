'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { apiClient } from '@/services/api'
import { Users, Briefcase, Home, Flag, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface Analytics {
  users: { total: number; active: number; suspended: number; banned: number }
  gigs: { total: number; open: number; inProgress: number; completed: number }
  rentals: { total: number; available: number; rented: number }
  reports: { total: number; open: number }
  totalEarnings: number
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.getAdminAnalytics()
        setAnalytics(res.data?.data)
      } catch { toast.error('Failed to load analytics') } finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <div className="text-gray-400">Loading dashboard...</div>
  if (!analytics) return null

  const statCards = [
    { label: 'Total Users', value: analytics.users.total, icon: Users, color: 'bg-blue-950/50 text-blue-400', link: '/admin/users' },
    { label: 'Active Users', value: analytics.users.active, icon: CheckCircle, color: 'bg-green-950/50 text-green-400', link: '/admin/users' },
    { label: 'Total Gigs', value: analytics.gigs.total, icon: Briefcase, color: 'bg-indigo-950/50 text-indigo-400', link: '/admin/listings' },
    { label: 'Open Gigs', value: analytics.gigs.open, icon: TrendingUp, color: 'bg-purple-950/50 text-purple-400', link: '/admin/listings' },
    { label: 'Total Rentals', value: analytics.rentals.total, icon: Home, color: 'bg-orange-950/50 text-orange-400', link: '/admin/listings' },
    { label: 'Total Earnings', value: `₹${analytics.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-950/50 text-emerald-400', link: '/admin/analytics' },
    { label: 'Open Reports', value: analytics.reports.open, icon: AlertTriangle, color: 'bg-red-950/50 text-red-400', link: '/admin/reports' },
    { label: 'Suspended', value: analytics.users.suspended + analytics.users.banned, icon: Flag, color: 'bg-amber-950/50 text-amber-400', link: '/admin/users' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and quick actions</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.label} href={card.link} className="card hover:border-gray-700 transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-100">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.label}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-100 mb-3">Gig Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Open</span><span className="font-medium text-gray-200">{analytics.gigs.open}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">In Progress</span><span className="font-medium text-gray-200">{analytics.gigs.inProgress}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Completed</span><span className="font-medium text-gray-200">{analytics.gigs.completed}</span></div>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-100 mb-3">Rental Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Available</span><span className="font-medium text-gray-200">{analytics.rentals.available}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Rented</span><span className="font-medium text-gray-200">{analytics.rentals.rented}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
