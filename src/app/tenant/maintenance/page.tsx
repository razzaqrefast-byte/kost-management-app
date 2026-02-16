import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TenantMaintenancePage() {
    const supabase = await createClient()

    // 1. Get current tenant
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Fetch requests
    const { data: requests, error } = await supabase
        .from('maintenance_requests')
        .select(`
            *,
            properties ( name ),
            rooms ( name )
        `)
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Riwayat Keluhan
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link
                        href="/tenant/maintenance/new"
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                        Buat Laporan Baru
                    </Link>
                </div>
            </div>

            {requests && requests.length > 0 ? (
                <div className="overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                        {requests.map((request) => (
                            <li key={request.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="truncate text-sm font-medium text-blue-600 dark:text-blue-400">{request.title}</p>
                                        <div className="ml-2 flex flex-shrink-0">
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${request.status === 'open' ? 'bg-red-100 text-red-800' :
                                                    request.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                {request.properties?.name} {request.rooms ? ` - ${request.rooms.name}` : '(Area Umum)'}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                                            <p>Dilaporkan pada {new Date(request.created_at).toLocaleDateString('id-ID')}</p>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{request.description}</p>
                                    {request.image_url && (
                                        <div className="mt-3">
                                            <a href={request.image_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                                                Lihat Foto Lampiran
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <p className="text-gray-500">Belum ada laporan keluhan.</p>
                </div>
            )}
        </div>
    )
}
