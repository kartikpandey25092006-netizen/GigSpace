'use client'

import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { ArrowRight, Zap, Users, TrendingUp, Heart } from 'lucide-react'

export default function Home() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-950/50 to-transparent">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-100 mb-6">
            Welcome to <span className="text-indigo-400">Vubble</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Your campus marketplace for gigs, rentals, and services. Connect with students, earn money, and grow your skills.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {user ? (
              <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link href="/auth/register" className="btn-primary inline-flex items-center gap-2">
                  Get Started <ArrowRight size={18} />
                </Link>
                <Link href="/auth/login" className="btn-secondary">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-100 mb-16">How Vubble Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: 'Post a Gig', description: 'Need help? Post a gig and get responses from skilled workers in your campus.' },
              { icon: Users, title: 'Find Workers', description: 'Looking for work? Browse available gigs and start earning immediately.' },
              { icon: Heart, title: 'Rent Items', description: 'Need something? Rent items from others or rent yours out and earn passive income.' },
              { icon: TrendingUp, title: 'Build Reputation', description: 'Complete gigs, collect ratings, and climb the leaderboard to unlock rewards.' },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="card-hover">
                  <Icon className="text-indigo-400 mb-4" size={32} />
                  <h3 className="text-lg font-bold text-gray-100 mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-6xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-16">Trusted by Campus Community</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: '5K+', label: 'Active Users' },
              { number: '10K+', label: 'Gigs Completed' },
              { number: '$50K+', label: 'Money Earned' },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-5xl font-bold mb-2">{stat.number}</p>
                <p className="text-indigo-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-gray-100">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8">Join thousands of students already earning money and finding help on Vubble.</p>
            <Link href="/auth/register" className="btn-primary inline-block">Sign Up Now</Link>
          </div>
        </section>
      )}
    </div>
  )
}
