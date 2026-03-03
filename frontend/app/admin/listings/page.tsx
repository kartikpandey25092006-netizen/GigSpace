'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { apiClient } from '@/services/api'
import { Pencil, Trash2, Send, X } from 'lucide-react'

interface GigItem {
    id: string; title: string; status: string; budget: number; category: string; location: string
    createdAt: string; owner: { id: string; firstName: string; lastName: string; email: string }
    applications: Array<{ id: string; status: string }>
}
interface RentalItem {
    id: string; title: string; status: string; category: string; location: string
    pricePerHour: number | null; pricePerDay: number | null; deposit: number
    createdAt: string; owner: { id: string; firstName: string; lastName: string; email: string }
    bookings: Array<{ id: string; status: string }>
}

type Tab = 'gigs' | 'rentals'
const gigStatusOptions = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
const rentalStatusOptions = ['AVAILABLE', 'RENTED', 'MAINTENANCE']

export default function AdminListingsPage() {
    const [tab, setTab] = useState<Tab>('gigs')
    const [gigs, setGigs] = useState<GigItem[]>([])
    const [rentals, setRentals] = useState<RentalItem[]>([])
    const [loading, setLoading] = useState(true)
    const [editModal, setEditModal] = useState<{ type: Tab; item: any } | null>(null)
    const [editForm, setEditForm] = useState<any>({})
    const [adminMessage, setAdminMessage] = useState('')

    useEffect(() => { if (tab === 'gigs') fetchGigs(); else fetchRentals() }, [tab])

    const fetchGigs = async () => { try { setLoading(true); const res = await apiClient.getAdminGigLogs({ limit: 100 }); setGigs(res.data?.data?.gigs || []) } catch { toast.error('Failed to load gigs') } finally { setLoading(false) } }
    const fetchRentals = async () => { try { setLoading(true); const res = await apiClient.getAdminRentals({ limit: 100 }); setRentals(res.data?.data?.rentals || []) } catch { toast.error('Failed to load rentals') } finally { setLoading(false) } }

    const deleteGig = async (id: string) => { if (!confirm('Delete this gig? The owner will be notified.')) return; try { await apiClient.deleteAdminGig(id); toast.success('Gig deleted'); fetchGigs() } catch { toast.error('Failed to delete gig') } }
    const deleteRental = async (id: string) => { if (!confirm('Delete this rental? The owner will be notified.')) return; try { await apiClient.deleteAdminRental(id); toast.success('Rental deleted'); fetchRentals() } catch { toast.error('Failed to delete rental') } }

    const openEdit = (type: Tab, item: any) => {
        setEditModal({ type, item }); setAdminMessage('')
        if (type === 'gigs') setEditForm({ title: item.title, budget: item.budget, category: item.category, location: item.location, status: item.status })
        else setEditForm({ title: item.title, category: item.category, location: item.location, pricePerDay: item.pricePerDay, deposit: item.deposit, status: item.status })
    }

    const saveEdit = async () => {
        if (!editModal) return
        try {
            if (editModal.type === 'gigs') { await apiClient.updateAdminGig(editModal.item.id, { ...editForm, adminMessage }); toast.success('Gig updated & owner notified'); fetchGigs() }
            else { await apiClient.updateAdminRental(editModal.item.id, { ...editForm, adminMessage }); toast.success('Rental updated & owner notified'); fetchRentals() }
            setEditModal(null)
        } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to save') }
    }

    const inputClass = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"

    return (
        <div>
            <div className="mb-6"><h1 className="text-3xl font-bold text-gray-100">Listing Management</h1><p className="text-gray-500 mt-1">View, edit, or delete gigs and rentals</p></div>
            <div className="flex gap-1 mb-6 bg-gray-800 rounded-lg p-1 w-fit">
                {(['gigs', 'rentals'] as Tab[]).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === t ? 'bg-gray-900 text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>{t === 'gigs' ? 'Gigs' : 'Rentals'}</button>
                ))}
            </div>

            {loading ? <div className="card text-gray-400">Loading...</div> : tab === 'gigs' ? (
                gigs.length === 0 ? <div className="card text-gray-400">No gigs found.</div> : (
                    <div className="space-y-3">
                        {gigs.map((gig) => (
                            <div key={gig.id} className="card flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-100">{gig.title}</h3>
                                    <p className="text-sm text-gray-400">Owner: {gig.owner.firstName} {gig.owner.lastName} ({gig.owner.email})</p>
                                    <p className="text-sm text-gray-500">₹{gig.budget} · {gig.category} · {gig.location} · {gig.applications.length} apps</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${gig.status === 'OPEN' ? 'bg-green-900/50 text-green-400' : gig.status === 'COMPLETED' ? 'bg-blue-900/50 text-blue-400' : gig.status === 'CANCELLED' ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'}`}>{gig.status}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit('gigs', gig)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-indigo-400" title="Edit"><Pencil size={16} /></button>
                                    <button onClick={() => deleteGig(gig.id)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400" title="Delete"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                rentals.length === 0 ? <div className="card text-gray-400">No rentals found.</div> : (
                    <div className="space-y-3">
                        {rentals.map((rental) => (
                            <div key={rental.id} className="card flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-100">{rental.title}</h3>
                                    <p className="text-sm text-gray-400">Owner: {rental.owner.firstName} {rental.owner.lastName} ({rental.owner.email})</p>
                                    <p className="text-sm text-gray-500">{rental.category} · {rental.location} · ₹{rental.pricePerDay || rental.pricePerHour}/day · Deposit: ₹{rental.deposit}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${rental.status === 'AVAILABLE' ? 'bg-green-900/50 text-green-400' : rental.status === 'RENTED' ? 'bg-blue-900/50 text-blue-400' : 'bg-yellow-900/50 text-yellow-400'}`}>{rental.status}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit('rentals', rental)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-indigo-400" title="Edit"><Pencil size={16} /></button>
                                    <button onClick={() => deleteRental(rental.id)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400" title="Delete"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {editModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-100">Edit {editModal.type === 'gigs' ? 'Gig' : 'Rental'}</h2>
                            <button onClick={() => setEditModal(null)} className="p-1 hover:bg-gray-800 rounded text-gray-400"><X size={18} /></button>
                        </div>
                        <div className="space-y-3">
                            <div><label className="block text-sm font-medium text-gray-400 mb-1">Title</label><input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={inputClass} /></div>
                            {editModal.type === 'gigs' && <div><label className="block text-sm font-medium text-gray-400 mb-1">Budget (₹)</label><input type="number" value={editForm.budget || ''} onChange={(e) => setEditForm({ ...editForm, budget: Number(e.target.value) })} className={inputClass} /></div>}
                            {editModal.type === 'rentals' && (
                                <>
                                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Price Per Day (₹)</label><input type="number" value={editForm.pricePerDay || ''} onChange={(e) => setEditForm({ ...editForm, pricePerDay: Number(e.target.value) })} className={inputClass} /></div>
                                    <div><label className="block text-sm font-medium text-gray-400 mb-1">Deposit (₹)</label><input type="number" value={editForm.deposit || ''} onChange={(e) => setEditForm({ ...editForm, deposit: Number(e.target.value) })} className={inputClass} /></div>
                                </>
                            )}
                            <div><label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                                <select value={editForm.status || ''} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className={inputClass}>
                                    {(editModal.type === 'gigs' ? gigStatusOptions : rentalStatusOptions).map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-400 mb-1">Message to Owner</label>
                                <textarea value={adminMessage} onChange={(e) => setAdminMessage(e.target.value)} placeholder="Explain what was changed and why..." rows={3} className={inputClass} />
                                <p className="text-xs text-gray-500 mt-1">This message will be sent as a notification to the listing owner.</p>
                            </div>
                            <button onClick={saveEdit} className="btn-primary w-full flex items-center justify-center gap-2"><Send size={16} /> Save & Notify Owner</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
