'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { apiClient } from '@/services/api'
import { Search, Shield, Ban, CheckCircle, Eye } from 'lucide-react'

interface UserItem {
    id: string; firstName: string; lastName: string; email: string; phone: string
    city: string; role: string; status: string; rating: number
    completedGigs: number; totalEarnings: number; createdAt: string
}

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-900/50 text-green-400',
    SUSPENDED: 'bg-yellow-900/50 text-yellow-400',
    BLACKLISTED: 'bg-red-900/50 text-red-400',
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserItem[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    useEffect(() => { fetchUsers() }, [statusFilter])

    const fetchUsers = async (searchQuery?: string) => {
        try {
            setLoading(true)
            const params: any = { limit: 100 }
            if (searchQuery || search) params.search = searchQuery ?? search
            if (statusFilter) params.status = statusFilter
            const res = await apiClient.getAdminUsers(params)
            setUsers(res.data?.data?.users || []); setTotal(res.data?.data?.total || 0)
        } catch { toast.error('Failed to load users') } finally { setLoading(false) }
    }

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchUsers(search) }

    const updateStatus = async (userId: string, status: string) => {
        const label = status === 'ACTIVE' ? 'reactivate' : status === 'SUSPENDED' ? 'suspend' : 'ban'
        if (!confirm(`Are you sure you want to ${label} this user?`)) return
        try {
            await apiClient.updateAdminUserStatus(userId, status)
            toast.success(`User ${label}d successfully`); fetchUsers()
        } catch (error: any) { toast.error(error.response?.data?.message || `Failed to ${label} user`) }
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-100">User Management</h1>
                <p className="text-gray-500 mt-1">View, edit, suspend, or ban users ({total} total)</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
                    </div>
                    <button type="submit" className="btn-primary">Search</button>
                </form>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200">
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="BLACKLISTED">Banned</option>
                </select>
            </div>

            {loading ? <div className="card text-gray-400">Loading users...</div> : users.length === 0 ? <div className="card text-gray-400">No users found.</div> : (
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-800/50 border-b border-gray-800">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Name</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Email</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Role</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Status</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Rating</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Gigs</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Joined</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-800/50">
                                        <td className="px-4 py-3 font-medium text-gray-100">{u.firstName} {u.lastName}</td>
                                        <td className="px-4 py-3 text-gray-400">{u.email}</td>
                                        <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-900/50 text-indigo-400">{u.role}</span></td>
                                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[u.status] || 'bg-gray-800 text-gray-400'}`}>{u.status}</span></td>
                                        <td className="px-4 py-3 text-gray-400">{u.rating.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-gray-400">{u.completedGigs}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Link href={`/admin/users/${u.id}`} className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-indigo-400" title="View / Edit"><Eye size={16} /></Link>
                                                {u.status !== 'ACTIVE' && <button onClick={() => updateStatus(u.id, 'ACTIVE')} className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-green-400" title="Reactivate"><CheckCircle size={16} /></button>}
                                                {u.status !== 'SUSPENDED' && u.role !== 'ADMIN' && <button onClick={() => updateStatus(u.id, 'SUSPENDED')} className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-yellow-400" title="Suspend"><Shield size={16} /></button>}
                                                {u.status !== 'BLACKLISTED' && u.role !== 'ADMIN' && <button onClick={() => updateStatus(u.id, 'BLACKLISTED')} className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400" title="Ban"><Ban size={16} /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
