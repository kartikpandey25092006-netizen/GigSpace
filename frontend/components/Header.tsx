'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { apiClient } from '@/services/api'
import { Menu, X, User, LogOut, Bell } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function Header() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.getNotifications()
      setNotifications(res.data?.data?.notifications || [])
      setUnreadCount(res.data?.data?.unreadCount || 0)
    } catch { }
  }

  const markAsRead = async (id: string) => {
    try {
      await apiClient.markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch { }
  }

  const markAllRead = async () => {
    try {
      await apiClient.markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch { }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-400">
            Vubble
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-300 hover:text-indigo-400 font-medium">Home</Link>
            <Link href="/gigs" className="text-gray-300 hover:text-indigo-400 font-medium">Gigs</Link>
            <Link href="/rentals" className="text-gray-300 hover:text-indigo-400 font-medium">Rentals</Link>
            <Link href="/leaderboard" className="text-gray-300 hover:text-indigo-400 font-medium">Leaderboard</Link>

            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'ADMIN' ? (
                  <Link href="/admin/dashboard" className="text-gray-300 hover:text-indigo-400 font-medium">Admin</Link>
                ) : (
                  <Link href="/dashboard" className="text-gray-300 hover:text-indigo-400 font-medium">Dashboard</Link>
                )}
                <Link href="/chat" className="text-gray-300 hover:text-indigo-400 font-medium">Messages</Link>

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications() }}
                    className="relative text-gray-300 hover:text-indigo-400"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-lg border border-gray-700 z-50 max-h-96 overflow-y-auto">
                      <div className="flex justify-between items-center p-3 border-b border-gray-800">
                        <span className="font-semibold text-gray-100 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => !n.read && markAsRead(n.id)}
                            className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition ${!n.read ? 'bg-indigo-950/40' : ''}`}
                          >
                            <p className={`text-sm ${!n.read ? 'font-semibold text-gray-100' : 'text-gray-300'}`}>{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.message.length > 80 ? n.message.slice(0, 80) + '...' : n.message}</p>
                            <p className="text-[10px] text-gray-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="border-l border-gray-700 pl-4 flex items-center gap-4">
                  <Link href="/profile" className="flex items-center gap-2 text-gray-300 hover:text-indigo-400">
                    <User size={20} />
                    <span className="font-medium">{user.firstName}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-red-400 hover:text-red-300">
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="text-gray-300 hover:text-indigo-400 font-medium">Sign In</Link>
                <Link href="/auth/register" className="btn-primary">Sign Up</Link>
              </div>
            )}
          </div>

          <button className="md:hidden text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            <Link href="/" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded">Home</Link>
            <Link href="/gigs" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded">Gigs</Link>
            <Link href="/rentals" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded">Rentals</Link>
            <Link href="/leaderboard" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded">Leaderboard</Link>
            {user ? (
              <>
                {user.role === 'ADMIN' ? (
                  <Link href="/admin/dashboard" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded">Admin</Link>
                ) : (
                  <Link href="/dashboard" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded">Dashboard</Link>
                )}
                <Link href="/chat" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded">Messages</Link>
                <Link href="/profile" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded">Profile</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-950 rounded">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded">Sign In</Link>
                <Link href="/auth/register" className="block px-4 py-2 bg-indigo-600 text-white rounded font-medium text-center">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
