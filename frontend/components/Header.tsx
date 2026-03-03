'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/')
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Vubble
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-indigo-600 font-medium">
              Home
            </Link>
            <Link href="/gigs" className="text-gray-700 hover:text-indigo-600 font-medium">
              Gigs
            </Link>
            <Link href="/rentals" className="text-gray-700 hover:text-indigo-600 font-medium">
              Rentals
            </Link>
            <Link href="/leaderboard" className="text-gray-700 hover:text-indigo-600 font-medium">
              Leaderboard
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'ADMIN' ? (
                  <Link href="/admin/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">
                    Admin
                  </Link>
                ) : (
                  <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">
                    Dashboard
                  </Link>
                )}
                <Link href="/chat" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Messages
                </Link>
                <div className="border-l border-gray-200 pl-4 flex items-center gap-4">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"
                  >
                    <User size={20} />
                    <span className="font-medium">{user.firstName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Home
            </Link>
            <Link href="/gigs" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Gigs
            </Link>
            <Link href="/rentals" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Rentals
            </Link>
            <Link href="/leaderboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Leaderboard
            </Link>

            {user ? (
              <>
                {user.role === 'ADMIN' ? (
                  <Link href="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                    Admin
                  </Link>
                ) : (
                  <Link href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                    Dashboard
                  </Link>
                )}
                <Link href="/chat" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  Messages
                </Link>
                <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  Sign In
                </Link>
                <Link href="/auth/register" className="block px-4 py-2 bg-indigo-600 text-white rounded font-medium text-center">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
