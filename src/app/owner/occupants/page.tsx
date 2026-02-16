import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'

export default async function OwnerOccupantsPage() {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 2. Fetch active/approved bookings for this owner's properties
    // We want to see who is currently in the rooms
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            *,
            tenant:profiles(full_name, phone),
            rooms(
                name,
                properties(
                    name,
                    owner_id
                )
            )
        `)
        .in('status', ['approved', 'active'])
        .order('created_at', { ascending: false })

    // Filter for current owner
    const ownerOccupants = bookings?.filter((b: any) => b.rooms.properties.owner_id === user.id) || []

    // 3. Generate Signed URLs for KTP if they are in the private bucket
    const occupantsWithSignedUrls = await Promise.all(
        ownerOccupants.map(async (booking: any) => {
            if (booking.occupant_ktp_url && !booking.occupant_ktp_url.startsWith('http')) {
                const { data } = await supabase.storage
                    .from('tenant-documents')
                    .createSignedUrl(booking.occupant_ktp_url, 3600) // 1 hour access

                return { ...booking, signed_ktp_url: data?.signedUrl }
            }
            return { ...booking, signed_ktp_url: booking.occupant_ktp_url }
        })
    )

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Daftar Penghuni</h1>

            {occupantsWithSignedUrls && occupantsWithSignedUrls.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {occupantsWithSignedUrls.map((booking: any) => (
                        <div key={booking.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {booking.occupant_name || booking.tenant?.full_name || 'Tanpa Nama'}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {booking.rooms.properties.name} - {booking.rooms.name}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${booking.status === 'active' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'}`}>
                                        {booking.status === 'active' ? 'Aktif' : 'Disetujui'}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold w-24">NIK:</span>
                                        <span>{booking.occupant_ktp_number || '-'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold w-24">Kontak:</span>
                                        <span>{booking.tenant?.phone || '-'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold w-24">Mulai:</span>
                                        <span>{new Date(booking.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>

                                {booking.signed_ktp_url && (
                                    <div className="mt-6">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Foto KTP</p>
                                        <div className="relative h-40 w-full rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900">
                                            <a href={booking.signed_ktp_url} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={booking.signed_ktp_url}
                                                    alt="KTP Penghuni"
                                                    className="object-contain w-full h-full hover:opacity-75 transition-opacity"
                                                />
                                            </a>
                                        </div>
                                        <p className="mt-1 text-[10px] text-gray-400 text-center italic">Klik gambar untuk memperbesar</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow p-12">
                    <p className="text-gray-500 dark:text-gray-400">Belum ada penghuni aktif di properti Anda.</p>
                </div>
            )}
        </div>
    )
}
