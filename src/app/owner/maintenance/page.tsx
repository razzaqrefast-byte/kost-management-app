import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OwnerMaintenanceList from './OwnerMaintenanceList'

export default async function OwnerMaintenancePage() {
    const supabase = await createClient()

    // 1. Get current owner
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Fetch requests related to owner's properties
    const { data: requestsData, error } = await supabase
        .from('maintenance_requests')
        .select(`
            *,
            properties!inner ( name, owner_id ),
            rooms ( name ),
            profiles ( full_name )
        `)
        .eq('properties.owner_id', user.id)
        .order('created_at', { ascending: false })

    // Generate signed URLs for private images
    const requests = await Promise.all((requestsData || []).map(async (request) => {
        if (request.image_url && !request.image_url.startsWith('http')) {
            const { data } = await supabase.storage
                .from('maintenance-photos')
                .createSignedUrl(request.image_url, 3600)
            return { ...request, signed_url: data?.signedUrl }
        }
        return { ...request, signed_url: request.image_url }
    }))

    if (error) {
        console.error('Fetch maintenance requests error:', JSON.stringify(error, null, 2))
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Daftar Perbaikan & Keluhan
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Kelola semua laporan masalah dari penyewa di kost Anda.</p>
                </div>
            </div>

            {requests && requests.length > 0 ? (
                <OwnerMaintenanceList initialRequests={requests} />
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <p className="text-gray-500">Belum ada laporan keluhan masuk.</p>
                </div>
            )}
        </div>
    )
}
