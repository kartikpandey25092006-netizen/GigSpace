'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { LayoutDashboard, Users, List, Flag, BarChart3, ChevronRight } from 'lucide-react'

const adminLinks = [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/listings', label: 'Listings', icon: List },
    { href: '/admin/reports', label: 'Reports', icon: Flag },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const user = useAuthStore((state) => state.user)

    useEffect(() => {
        if (!user) { router.push('/auth/login'); return }
        if (user.role !== 'ADMIN') { router.push('/dashboard') }
    }, [user, router])

    if (!user || user.role !== 'ADMIN') return null

    return (
        <div className="min-h-screen bg-gray-950 flex">
            <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen sticky top-0">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-indigo-400">Admin Panel</h2>
                    <p className="text-xs text-gray-500 mt-1">Manage your platform</p>
                </div>
                <nav className="px-3 space-y-1">
                    {adminLinks.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                        const Icon = link.icon
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-indigo-950/60 text-indigo-400'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="flex-1">{link.label}</span>
                                {isActive && <ChevronRight size={14} />}
                            </Link>
                        )
                    })}
                </nav>
            </aside>
            <main className="flex-1 p-8">{children}</main>
        </div>
    )
}
