'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/services/api'
import { Package, MapPin, Clock, DollarSign, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface RentalItem {
  id: string
  title: string
  description: string
  pricePerHour?: number
  pricePerDay?: number
  location: string
  owner: any
  images: string[]
  available: boolean
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<RentalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchRentals()
  }, [search])

  const fetchRentals = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/rentals/list', {
        params: { search, limit: 12 },
      })
      setRentals(response.data.data?.items || [])
    } catch (error) {
      toast.error('Failed to load rentals')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-900">Browse Rentals</h1>
          <Link href="/rentals/create" className="btn-primary">
            List an Item
          </Link>
        </div>

        {/* Search */}
        <div className="mb-8 card">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search rental items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading rentals...</p>
          </div>
        ) : rentals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals.map((item) => (
              <Link key={item.id} href={`/rentals/${item.id}`}>
                <div className="card-hover h-full flex flex-col">
                  {item.images && item.images[0] && (
                    <div className="relative h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                    {item.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {item.pricePerHour && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign size={16} className="text-green-600" />
                        <span>₹{item.pricePerHour}/hour</span>
                      </div>
                    )}
                    {item.pricePerDay && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign size={16} className="text-green-600" />
                        <span>₹{item.pricePerDay}/day</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <MapPin size={16} />
                      {item.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                    <span className="text-xs text-gray-500">
                      by {item.owner?.firstName}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No rental items found</p>
          </div>
        )}
      </div>
    </div>
  )
}
