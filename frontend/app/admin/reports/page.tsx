'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { apiClient } from '@/services/api'
import { Flag, CheckCircle, XCircle, MessageSquare } from 'lucide-react'

interface ReportItem {
    id: string; type: string; targetId: string; reporterId: string
    reason: string; description: string | null; status: string
    adminNote: string | null; createdAt: string
}

const statusColors: Record<string, string> = {
    OPEN: 'bg-red-900/50 text-red-400',
    RESOLVED: 'bg-green-900/50 text-green-400',
    DISMISSED: 'bg-gray-800 text-gray-400',
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<ReportItem[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [resolveModal, setResolveModal] = useState<ReportItem | null>(null)
    const [adminNote, setAdminNote] = useState('')
    const [resolveStatus, setResolveStatus] = useState<'RESOLVED' | 'DISMISSED'>('RESOLVED')

    useEffect(() => { fetchReports() }, [statusFilter, typeFilter])

    const fetchReports = async () => {
        try {
            setLoading(true); const params: any = { limit: 100 }
            if (statusFilter) params.status = statusFilter; if (typeFilter) params.type = typeFilter
            const res = await apiClient.getAdminReports(params)
            setReports(res.data?.data?.reports || []); setTotal(res.data?.data?.total || 0)
        } catch { toast.error('Failed to load reports') } finally { setLoading(false) }
    }

    const handleResolve = async () => {
        if (!resolveModal) return
        try { await apiClient.updateAdminReport(resolveModal.id, { status: resolveStatus, adminNote }); toast.success(`Report ${resolveStatus.toLowerCase()}`); setResolveModal(null); setAdminNote(''); fetchReports() }
        catch { toast.error('Failed to update report') }
    }

    const selectClass = "bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"

    return (
        <div>
            <div className="mb-6"><h1 className="text-3xl font-bold text-gray-100">Reports</h1><p className="text-gray-500 mt-1">Review and resolve user reports ({total} total)</p></div>
            <div className="flex gap-3 mb-6">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
                    <option value="">All Statuses</option><option value="OPEN">Open</option><option value="RESOLVED">Resolved</option><option value="DISMISSED">Dismissed</option>
                </select>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClass}>
                    <option value="">All Types</option><option value="USER">User</option><option value="GIG">Gig</option><option value="RENTAL">Rental</option>
                </select>
            </div>

            {loading ? <div className="card text-gray-400">Loading...</div> : reports.length === 0 ? <div className="card text-gray-400">No reports found.</div> : (
                <div className="space-y-3">
                    {reports.map((report) => (
                        <div key={report.id} className="card">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Flag size={16} className="text-gray-500" />
                                        <span className="font-semibold text-gray-100">{report.type} Report</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[report.status]}`}>{report.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-300"><strong>Reason:</strong> {report.reason}</p>
                                    {report.description && <p className="text-sm text-gray-500 mt-1">{report.description}</p>}
                                    <p className="text-xs text-gray-600 mt-1">Target: {report.targetId} · Reporter: {report.reporterId} · {new Date(report.createdAt).toLocaleString()}</p>
                                    {report.adminNote && <div className="mt-2 p-2 bg-gray-800 rounded text-sm"><strong className="text-gray-300">Admin Note:</strong> <span className="text-gray-400">{report.adminNote}</span></div>}
                                </div>
                                {report.status === 'OPEN' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => { setResolveModal(report); setResolveStatus('RESOLVED'); setAdminNote('') }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-900/30 text-green-400 text-sm hover:bg-green-900/50"><CheckCircle size={14} /> Resolve</button>
                                        <button onClick={() => { setResolveModal(report); setResolveStatus('DISMISSED'); setAdminNote('') }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 text-sm hover:bg-gray-700"><XCircle size={14} /> Dismiss</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {resolveModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-semibold text-gray-100 mb-4">{resolveStatus === 'RESOLVED' ? 'Resolve' : 'Dismiss'} Report</h2>
                        <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Add a note (optional)..." rows={3}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 mb-4" />
                        <div className="flex gap-3">
                            <button onClick={handleResolve} className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${resolveStatus === 'RESOLVED' ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 hover:bg-gray-500'}`}><MessageSquare size={16} className="inline mr-1" /> Confirm</button>
                            <button onClick={() => setResolveModal(null)} className="flex-1 btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
