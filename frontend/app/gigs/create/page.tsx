'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'
import { Loader } from 'lucide-react'

export default function CreateGigPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: 'OTHER',
    location: '',
    priority: 'MEDIUM',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.budget || !formData.deadline || !formData.location) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.createGig({
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
        deadline: formData.deadline,
        category: formData.category,
        location: formData.location,
        priority: formData.priority,
      })

      toast.success('Gig posted successfully!')
      router.push('/gigs')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create gig')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-100 mb-8">Post a New Gig</h1>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Gig Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Website Design"
              className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your gig in detail..."
              rows={5}
              className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Budget (₹)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="1000"
                className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="OTHER">Other</option>
                <option value="TUTORING">Tutoring</option>
                <option value="DESIGN">Design</option>
                <option value="WRITING">Writing</option>
                <option value="CODING">Coding</option>
                <option value="DELIVERY">Delivery</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Campus Library"
              className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader size={18} className="animate-spin" />}
            {loading ? 'Posting...' : 'Post Gig'}
          </button>
        </form>
      </div>
    </div>
  )
}
