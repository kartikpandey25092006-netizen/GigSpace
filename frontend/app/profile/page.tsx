'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { User, Mail, Phone, MapPin, Star, LogOut, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setProfileData(user)
    setLoading(false)
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push('/')
    toast.success('Logged out successfully')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600 mt-1">
                {user.role === 'BUYER' && 'Buyer'}
                {user.role === 'WORKER' && 'Worker'}
                {user.role === 'RENTAL_OWNER' && 'Rental Owner'}
                {user.role === 'ADMIN' && 'Admin'}
              </p>
            </div>
            <button className="btn-secondary flex items-center gap-2">
              <Edit size={18} />
              Edit
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="text-indigo-600" size={20} />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="text-indigo-600" size={20} />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="text-indigo-600" size={20} />
              <span>{user.city}</span>
            </div>
            {user.rating && (
              <div className="flex items-center gap-3 text-gray-700">
                <Star className="text-yellow-400" size={20} fill="currentColor" />
                <span>{user.rating.toFixed(1)} / 5.0</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {user.completedGigs || 0}
            </p>
            <p className="text-gray-600 text-sm">Gigs Done</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">
              ₹{user.totalEarnings || 0}
            </p>
            <p className="text-gray-600 text-sm">Earnings</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-orange-600">
              {user.activeRentals || 0}
            </p>
            <p className="text-gray-600 text-sm">Rentals</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-yellow-600">
              #{user.leaderboardRank || 'N/A'}
            </p>
            <p className="text-gray-600 text-sm">Rank</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button className="w-full btn-secondary">
            Change Password
          </button>
          <button className="w-full btn-secondary">
            Payment Methods
          </button>
          <button className="w-full btn-secondary">
            Account Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full btn-danger flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
