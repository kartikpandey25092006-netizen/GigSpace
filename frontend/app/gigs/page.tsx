'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { Briefcase, MapPin, Clock, DollarSign, Filter, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import AnimatedSkeleton from '@/components/AnimatedSkeleton'

interface Gig {
  id: string
  title: string
  description: string
  budget: number
  deadline: string
  status: string
  location: string
  creator: any
}

export default function GigsPage() {
  const user = useAuthStore((state) => state.user)
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchGigs()
  }, [search, filter])

  const fetchGigs = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/gigs/list', {
        params: {
          search,
          status: filter !== 'all' ? filter : undefined,
          limit: 12,
        },
      })
      setGigs(response.data.data?.gigs || [])
    } catch (error) {
      toast.error('Failed to load gigs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8 flex justify-between items-center" initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5}}>
          <h1 className="text-4xl font-bold text-gray-100">Find Gigs</h1>
          {user && (
            <Link href="/gigs/create" className="btn-primary">
              Post a Gig
            </Link>
          )}
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8 card space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search gigs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'open', 'accepted', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-300 hover:bg-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gigs Grid */}
        {loading ? (
          <div className="text-center py-12">
            <AnimatedSkeleton count={6} height="h-64" />
          </div>
        ) : gigs.length > 0 ? (
          <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" initial="hidden" animate="visible" variants={{hidden: {opacity: 0}, visible: {opacity: 1, transition: {staggerChildren: 0.1}}}}>
            {gigs.map((gig) => (
              <motion.div key={gig.id} variants={{hidden: {opacity: 0, y: 20}, visible: {opacity: 1, y: 0}}}>
                <Link href={`/gigs/${gig.id}`}>
                  <motion.div className="card-hover h-full flex flex-col" whileHover={{y: -4}}>
                  <h3 className="text-lg font-bold text-gray-100 mb-2 line-clamp-2">
                    {gig.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {gig.description}
                  </p>

                  <div className="space-y-2 mb-4 flex-grow">
                    <div className="flex items-center gap-2 text-gray-300">
                      <DollarSign size={16} className="text-green-400" />
                      <span className="font-bold">₹{gig.budget}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <MapPin size={16} />
                      {gig.location}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Clock size={16} />
                      {new Date(gig.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded">
                      {gig.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      by {gig.creator?.firstName}
                    </span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-400 text-lg">No gigs found</p>
            <p className="text-gray-500">Try adjusting your filters or search</p>
          </div>
        )}
      </div>
    </div>
  )
}
