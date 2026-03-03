'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { MapPin, Clock, DollarSign, Star, MessageCircle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

interface Gig {
  id: string
  title: string
  description: string
  budget: number
  deadline: string
  status: string
  location: string
  category: string
  priority: string
  creator: any
  createdAt: string
}

export default function GigDetailPage() {
  const params = useParams()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [gig, setGig] = useState<Gig | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    fetchGig()
  }, [params.id])

  const fetchGig = async () => {
    try {
      const response = await apiClient.getGigById(params.id as string)
      setGig(response.data.data?.gig)
    } catch (error) {
      toast.error('Failed to load gig')
      router.push('/gigs')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    setAccepting(true)
    try {
      await apiClient.acceptGig(params.id as string, {})
      toast.success('Gig accepted! Contact the creator to discuss details.')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept gig')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>
  if (!gig) return <div className="text-center py-12">Gig not found</div>

  const isCreator = user?.id === gig.creator?.id

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-indigo-600 hover:text-indigo-700 font-medium mb-6"
        >
          ← Back to Gigs
        </button>

        <div className="card mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{gig.title}</h1>
              <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-sm font-medium">
                {gig.status}
              </span>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-600">₹{gig.budget}</p>
              <p className="text-sm text-gray-600">Budget</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin size={20} className="text-indigo-600" />
              {gig.location}
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Clock size={20} className="text-indigo-600" />
              Due: {new Date(gig.deadline).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <span className="inline-block px-3 py-1 bg-gray-200 rounded text-sm">
                {gig.category}
              </span>
              <span className="inline-block px-3 py-1 bg-yellow-200 rounded text-sm">
                Priority: {gig.priority}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{gig.description}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Creator Info */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Posted by</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-full"></div>
              <div>
                <p className="font-bold text-gray-900">
                  {gig.creator?.firstName} {gig.creator?.lastName}
                </p>
                {gig.creator?.rating && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Star size={14} className="text-yellow-400" />
                    {gig.creator.rating.toFixed(1)} / 5.0
                  </p>
                )}
                <p className="text-sm text-gray-600">{gig.creator?.completedGigs || 0} gigs</p>
              </div>
            </div>
            {!isCreator && gig.status === 'OPEN' && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 mb-2"
                >
                  {accepting && <Loader size={18} className="animate-spin" />}
                  {accepting ? 'Accepting...' : 'Accept Gig'}
                </button>
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <MessageCircle size={18} />
                  Contact Creator
                </button>
              </>
            )}
            {isCreator && (
              <p className="text-center text-gray-600 text-sm">This is your gig</p>
            )}
          </div>

          {/* Quick Info */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Posted on</p>
                <p className="font-semibold text-gray-900">{new Date(gig.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-gray-900 capitalize">{gig.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-semibold text-gray-900">{gig.category}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
