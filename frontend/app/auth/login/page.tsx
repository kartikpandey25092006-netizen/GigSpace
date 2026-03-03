'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { Mail, Lock, Loader } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [loading, setLoading] = useState(false)
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const endpoint = loginType === 'admin' ? '/auth/admin/login' : '/auth/login'
      const response = await apiClient.post(endpoint, {
        email: formData.email,
        password: formData.password,
      })

      const { token, user } = response.data.data

      login(user, token)
      toast.success(loginType === 'admin' ? 'Welcome, Admin!' : 'Welcome back!')
      router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-950">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100">Sign In</h1>
            <p className="text-gray-400 mt-2">
              Welcome back to Vubble
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-gray-800 p-1">
              <button
                type="button"
                onClick={() => setLoginType('user')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${loginType === 'user'
                  ? 'bg-gray-900 text-indigo-400 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                User Login
              </button>
              <button
                type="button"
                onClick={() => setLoginType('admin')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${loginType === 'admin'
                  ? 'bg-gray-900 text-indigo-400 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                Admin Login
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              {loading ? 'Signing in...' : loginType === 'admin' ? 'Sign In as Admin' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-indigo-400 font-medium hover:text-indigo-300">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Test account: test@example.com / password123
        </p>
      </div>
    </div>
  )
}
