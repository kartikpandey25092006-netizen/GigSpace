'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/services/api'
import { Trophy, Medal, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface LeaderboardEntry {
  rank: number
  user: any
  points: number
  completedGigs: number
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('monthly')

  useEffect(() => {
    fetchLeaderboard()
  }, [period])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/ratings/leaderboard', {
        params: { period }
      })
      setEntries(response.data.data?.leaderboard || [])
    } catch (error) {
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={24} />
    if (rank === 2) return <Medal className="text-gray-400" size={24} />
    if (rank === 3) return <Medal className="text-orange-600" size={24} />
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600 mt-2">Top performers on Vubble</p>
        </div>

        {/* Period Selector */}
        <div className="card mb-8 flex gap-2">
          {['weekly', 'monthly', 'yearly', 'lifetime'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition ${period === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        ) : entries.length > 0 ? (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.rank}
                className="card flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 text-center">
                    {getRankIcon(entry.rank) || (
                      <span className="text-xl font-bold text-gray-600">
                        #{entry.rank}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {entry.user.firstName} {entry.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {entry.completedGigs} gigs completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-indigo-600" size={20} />
                  <span className="text-2xl font-bold text-indigo-600">
                    {entry.points}
                  </span>
                  <span className="text-gray-600 text-sm">pts</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 card">
            <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No leaderboard data yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
