'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/store/auth'

interface GigItem {
  id: string
  title: string
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  budget: number
  category: string
  location: string
  createdAt: string
  updatedAt: string
  owner: {
    firstName: string
    lastName: string
    email: string
  }
  applications: Array<{ id: string; status: string }>
}

const statusOptions = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const

export default function AdminDashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [gigs, setGigs] = useState<GigItem[]>([])
  const [statusDraft, setStatusDraft] = useState<Record<string, GigItem['status']>>({})

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (user.role !== 'ADMIN') {
      toast.error('Admin access required')
      router.push('/dashboard')
      return
    }
    fetchGigLogs()
  }, [user, router])

  const fetchGigLogs = async () => {
    try {
      setLoading(true)
      const res = await apiClient.getAdminGigLogs({ limit: 100 })
      const rows = res.data?.data?.gigs || []
      setGigs(rows)
      const nextDraft: Record<string, GigItem['status']> = {}
      rows.forEach((gig: GigItem) => {
        nextDraft[gig.id] = gig.status
      })
      setStatusDraft(nextDraft)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load admin gig logs')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (gigId: string) => {
    try {
      const nextStatus = statusDraft[gigId]
      await apiClient.updateAdminGigStatus(gigId, nextStatus)
      toast.success('Gig status updated')
      fetchGigLogs()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const deleteGig = async (gigId: string) => {
    if (!confirm('Delete this gig permanently?')) return

    try {
      await apiClient.deleteAdminGig(gigId)
      toast.success('Gig deleted')
      fetchGigLogs()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete gig')
    }
  }

  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Control all gig logs and gig lifecycle actions.</p>
        </div>

        {loading ? (
          <div className="card">Loading gig logs...</div>
        ) : gigs.length === 0 ? (
          <div className="card">No gigs found.</div>
        ) : (
          <div className="space-y-4">
            {gigs.map((gig) => (
              <div key={gig.id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{gig.title}</h2>
                    <p className="text-sm text-gray-600">
                      Owner: {gig.owner.firstName} {gig.owner.lastName} ({gig.owner.email})
                    </p>
                    <p className="text-sm text-gray-600">
                      Budget: ₹{gig.budget} | Category: {gig.category} | Applications: {gig.applications.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(gig.createdAt).toLocaleString()} | Updated: {new Date(gig.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={statusDraft[gig.id] || gig.status}
                      onChange={(e) =>
                        setStatusDraft((prev) => ({
                          ...prev,
                          [gig.id]: e.target.value as GigItem['status'],
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => updateStatus(gig.id)}
                      className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => deleteGig(gig.id)}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                    >
                      Delete Gig
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
