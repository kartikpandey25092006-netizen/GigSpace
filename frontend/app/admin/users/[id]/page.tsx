'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { apiClient } from '@/services/api'
import { ArrowLeft, Save, Key } from 'lucide-react'

interface UserProfile {
    id: string; firstName: string; lastName: string; email: string; phone: string
    city: string; role: string; status: string; rating: number; completedGigs: number
    totalEarnings: number; activeRentals: number; leaderboardRank: number
    createdAt: string; updatedAt: string
}

export default function AdminUserDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', city: '', role: '' })
    const [newPassword, setNewPassword] = useState('')
    const [resettingPassword, setResettingPassword] = useState(false)

    useEffect(() => { fetchUser() }, [id])

    const fetchUser = async () => {
        try {
            setLoading(true)
            const res = await apiClient.getAdminUserById(id)
            const u = res.data?.data?.user; setUser(u)
            setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone, city: u.city, role: u.role })
        } catch { toast.error('Failed to load user') } finally { setLoading(false) }
    }

    const handleSave = async () => {
        setSaving(true)
        try { await apiClient.updateAdminUser(id, form); toast.success('User profile updated'); fetchUser() }
        catch (error: any) { toast.error(error.response?.data?.message || 'Failed to update user') }
        finally { setSaving(false) }
    }

    const handlePasswordReset = async () => {
        if (!newPassword || newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
        if (!confirm('Are you sure you want to reset this user\'s password?')) return
        setResettingPassword(true)
        try { await apiClient.updateAdminUserPassword(id, newPassword); toast.success('Password reset successfully'); setNewPassword('') }
        catch (error: any) { toast.error(error.response?.data?.message || 'Failed to reset password') }
        finally { setResettingPassword(false) }
    }

    if (loading) return <div className="text-gray-400">Loading user...</div>
    if (!user) return <div className="text-gray-400">User not found.</div>

    const inputClass = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"

    return (
        <div>
            <button onClick={() => router.push('/admin/users')} className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6">
                <ArrowLeft size={18} /> Back to Users
            </button>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-100">{user.firstName} {user.lastName}</h1>
                <p className="text-gray-500 mt-1">User ID: {user.id}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="card text-center"><p className="text-2xl font-bold text-gray-100">{user.rating.toFixed(1)}</p><p className="text-sm text-gray-500">Rating</p></div>
                <div className="card text-center"><p className="text-2xl font-bold text-gray-100">{user.completedGigs}</p><p className="text-sm text-gray-500">Completed Gigs</p></div>
                <div className="card text-center"><p className="text-2xl font-bold text-gray-100">₹{user.totalEarnings.toLocaleString()}</p><p className="text-sm text-gray-500">Total Earnings</p></div>
                <div className="card text-center"><p className="text-2xl font-bold text-gray-100">#{user.leaderboardRank || 'N/A'}</p><p className="text-sm text-gray-500">Leaderboard Rank</p></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-100 mb-4">Edit Profile</h2>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-sm font-medium text-gray-400 mb-1">First Name</label><input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} /></div>
                            <div><label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label><input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} /></div>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-400 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} /></div>
                        <div><label className="block text-sm font-medium text-gray-400 mb-1">Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} /></div>
                        <div><label className="block text-sm font-medium text-gray-400 mb-1">City</label><input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} /></div>
                        <div><label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
                                {['WORKER', 'BUYER', 'RENTAL_OWNER', 'ADMIN'].map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 w-full justify-center"><Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2"><Key size={18} /> Reset Password</h2>
                        <div className="space-y-3">
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 6 characters)" className={inputClass} />
                            <button onClick={handlePasswordReset} disabled={resettingPassword} className="btn-danger flex items-center gap-2 w-full justify-center">{resettingPassword ? 'Resetting...' : 'Reset Password'}</button>
                            <p className="text-xs text-gray-500">The user will be notified that their password was reset.</p>
                        </div>
                    </div>
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-100 mb-3">Account Info</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Status</span><span className={`font-medium ${user.status === 'ACTIVE' ? 'text-green-400' : user.status === 'SUSPENDED' ? 'text-yellow-400' : 'text-red-400'}`}>{user.status}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Created</span><span className="text-gray-300">{new Date(user.createdAt).toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Updated</span><span className="text-gray-300">{new Date(user.updatedAt).toLocaleString()}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
