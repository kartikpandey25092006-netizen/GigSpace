'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { apiClient } from '@/services/api'
import { Users, Briefcase, Home, Flag, DollarSign, TrendingUp } from 'lucide-react'

interface Analytics {
    users: { total: number; active: number; suspended: number; banned: number }
    gigs: { total: number; open: number; inProgress: number; completed: number }
    rentals: { total: number; available: number; rented: number }
    reports: { total: number; open: number }
    totalEarnings: number
}

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<Analytics | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => { try { const res = await apiClient.getAdminAnalytics(); setData(res.data?.data) } catch { toast.error('Failed to load analytics') } finally { setLoading(false) } }
        load()
    }, [])

    if (loading) return <div className="text-gray-400">Loading analytics...</div>
    if (!data) return null

    const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
        <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
        </div>
    )

    return (
        <div>
            <div className="mb-8"><h1 className="text-3xl font-bold text-gray-100">Analytics</h1><p className="text-gray-500 mt-1">Platform-wide statistics and insights</p></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                    { label: 'Total Users', value: data.users.total, icon: Users, color: 'text-blue-400' },
                    { label: 'Total Gigs', value: data.gigs.total, icon: Briefcase, color: 'text-indigo-400' },
                    { label: 'Total Rentals', value: data.rentals.total, icon: Home, color: 'text-orange-400' },
                    { label: 'Total Reports', value: data.reports.total, icon: Flag, color: 'text-red-400' },
                    { label: 'Open Reports', value: data.reports.open, icon: TrendingUp, color: 'text-amber-400' },
                    { label: 'Total Earnings', value: `₹${data.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
                ].map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="card text-center">
                            <Icon size={20} className={`mx-auto mb-2 ${stat.color}`} />
                            <p className="text-xl font-bold text-gray-100">{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                    )
                })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                    <h3 className="font-semibold text-gray-100 mb-4">Users</h3>
                    <div className="space-y-3">
                        <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Active</span><span className="font-medium text-green-400">{data.users.active}</span></div><ProgressBar value={data.users.active} max={data.users.total} color="bg-green-500" /></div>
                        <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Suspended</span><span className="font-medium text-yellow-400">{data.users.suspended}</span></div><ProgressBar value={data.users.suspended} max={data.users.total} color="bg-yellow-500" /></div>
                        <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Banned</span><span className="font-medium text-red-400">{data.users.banned}</span></div><ProgressBar value={data.users.banned} max={data.users.total} color="bg-red-500" /></div>
                    </div>
                </div>
                <div className="card">
                    <h3 className="font-semibold text-gray-100 mb-4">Gigs</h3>
                    <div className="space-y-3">
                        <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Open</span><span className="font-medium text-gray-200">{data.gigs.open}</span></div><ProgressBar value={data.gigs.open} max={data.gigs.total} color="bg-green-500" /></div>
                        <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">In Progress</span><span className="font-medium text-gray-200">{data.gigs.inProgress}</span></div><ProgressBar value={data.gigs.inProgress} max={data.gigs.total} color="bg-yellow-500" /></div>
                        <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Completed</span><span className="font-medium text-gray-200">{data.gigs.completed}</span></div><ProgressBar value={data.gigs.completed} max={data.gigs.total} color="bg-blue-500" /></div>
                    </div>
                </div>
                <div className="card">
                    <h3 className="font-semibold text-gray-100 mb-4">Rentals</h3>
                    <div className="space-y-3">
                        <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Available</span><span className="font-medium text-gray-200">{data.rentals.available}</span></div><ProgressBar value={data.rentals.available} max={data.rentals.total} color="bg-green-500" /></div>
                        <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Rented</span><span className="font-medium text-gray-200">{data.rentals.rented}</span></div><ProgressBar value={data.rentals.rented} max={data.rentals.total} color="bg-blue-500" /></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
