'use client'

import { useState } from 'react'
import { updateMaintenanceStatus } from '@/app/actions/maintenance'

export default function OwnerMaintenanceList({
    initialRequests
}: {
    initialRequests: any[]
}) {
    const [requests, setRequests] = useState(initialRequests)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    async function handleStatusChange(requestId: string, newStatus: 'in_progress' | 'resolved') {
        setUpdatingId(requestId)
        const result = await updateMaintenanceStatus(requestId, newStatus)
        if (result.success) {
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r))
        } else {
            alert(result.error || 'Gagal memperbarui status')
        }
        setUpdatingId(null)
    }

    return (
        <div className="overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                {requests.map((request) => (
                    <li key={request.id}>
                        <div className="px-4 py-5 sm:px-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-x-3">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{request.title}</p>
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${request.status === 'open' ? 'bg-red-100 text-red-800' :
                                            request.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {request.properties?.name} {request.rooms ? ` - ${request.rooms.name}` : '(Area Umum)'}
                                    </p>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{request.description}</p>
                                    <div className="mt-2 flex items-center gap-x-4 text-xs text-gray-500">
                                        <span>Oleh: {request.profiles?.full_name || 'Tenant'}</span>
                                        <span>{new Date(request.created_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    {request.signed_url && (
                                        <div className="mt-3">
                                            <a href={request.signed_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                                                Lihat Foto Lampiran
                                            </a>
                                        </div>
                                    )}
                                </div>
                                <div className="ml-4 flex-shrink-0 flex flex-col gap-2">
                                    {request.status === 'open' && (
                                        <button
                                            onClick={() => handleStatusChange(request.id, 'in_progress')}
                                            disabled={updatingId === request.id}
                                            className="rounded bg-yellow-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-yellow-500 disabled:opacity-50"
                                        >
                                            Proses
                                        </button>
                                    )}
                                    {(request.status === 'open' || request.status === 'in_progress') && (
                                        <button
                                            onClick={() => handleStatusChange(request.id, 'resolved')}
                                            disabled={updatingId === request.id}
                                            className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
                                        >
                                            Selesai
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
