'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { MapPin, Clock, DollarSign, Star, MessageCircle, ShoppingCart, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

interface RentalItem {
  id: string
  title: string
  description: string
  pricePerHour?: number
  pricePerDay?: number
  deposit: number
  location: string
  category: string
  available: boolean
  owner: any
  images: string[]
  createdAt: string
}

export default function RentalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [item, setItem] = useState<RentalItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    rentalType: 'hourly',
  })

  useEffect(() => {
    fetchRental()
  }, [params.id])

  const fetchRental = async () => {
    try {
      const response = await apiClient.getRentalById(params.id as string)
      setItem(response.data.data?.item)
    } catch (error) {
      toast.error('Failed to load rental')
      router.push('/rentals')
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!bookingData.startDate || !bookingData.endDate) {
      toast.error('Please select dates')
      return
    }

    setBooking(true)
    try {
      await apiClient.bookRental(params.id as string, {
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        rentalType: bookingData.rentalType,
      })
      toast.success('Booking request sent! Owner will confirm shortly.')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>
  if (!item) return <div className="text-center py-12">Item not found</div>

  const isOwner = user?.id === item.owner?.id

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-indigo-400 hover:text-indigo-300 font-medium mb-6"
        >
          ← Back to Rentals
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Images & Details */}
          <div className="md:col-span-2">
            <div className="card mb-6">
              {item.images && item.images[0] ? (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-96 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}

              <h1 className="text-4xl font-bold text-gray-100 mb-2">{item.title}</h1>
              
              <div className="flex gap-4 mb-4">
                {item.pricePerHour && (
                  <span className="text-2xl font-bold text-green-400">₹{item.pricePerHour}/hr</span>
                )}
                {item.pricePerDay && (
                  <span className="text-2xl font-bold text-green-400">₹{item.pricePerDay}/day</span>
                )}
              </div>

              <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                item.available ? 'bg-green-900/50 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {item.available ? 'Available' : 'Unavailable'}
              </span>

              <div className="border-t border-gray-800 mt-6 pt-6">
                <h2 className="text-xl font-bold text-gray-100 mb-4">Description</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{item.description}</p>
              </div>

              <div className="border-t border-gray-800 mt-6 pt-6">
                <h3 className="font-bold text-gray-100 mb-3">Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin size={20} className="text-indigo-400" />
                    {item.location}
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <DollarSign size={20} className="text-indigo-400" />
                    Deposit: ₹{item.deposit}
                  </div>
                  <div className="inline-block px-3 py-1 bg-gray-200 rounded text-sm">
                    {item.category}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking & Owner Info */}
          <div>
            {/* Owner Info */}
            <div className="card mb-6">
              <h3 className="text-lg font-bold text-gray-100 mb-4">Owner</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-full"></div>
                <div>
                  <p className="font-bold text-gray-100">
                    {item.owner?.firstName} {item.owner?.lastName}
                  </p>
                  {item.owner?.rating && (
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Star size={14} className="text-yellow-400" />
                      {item.owner.rating.toFixed(1)} / 5.0
                    </p>
                  )}
                </div>
              </div>
              {!isOwner && (
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <MessageCircle size={18} />
                  Contact Owner
                </button>
              )}
            </div>

            {/* Booking Form */}
            {!isOwner && item.available && (
              <div className="card">
                <h3 className="text-lg font-bold text-gray-100 mb-4">Book This Item</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Rental Type</label>
                    <select
                      value={bookingData.rentalType}
                      onChange={(e) => setBookingData({ ...bookingData, rentalType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {item.pricePerHour && <option value="hourly">Hourly</option>}
                      {item.pricePerDay && <option value="daily">Daily</option>}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                    <input
                      type="date"
                      value={bookingData.endDate}
                      onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <button
                    onClick={handleBook}
                    disabled={booking}
                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {booking && <Loader size={18} className="animate-spin" />}
                    {booking ? 'Booking...' : 'Request Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
