import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function TenantBookingsPage() {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 2. Fetch bookings with room and property data
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            *,
            rooms (
                name,
                properties (
                    name
                )
            )
        `)
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false })

    const statusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Menunggu Persetujuan</span>
            case 'approved':
                return <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800 ring-1 ring-inset ring-blue-600/20">Disetujui</span>
            case 'active':
                return <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-800 ring-1 ring-inset ring-green-600/20">Aktif</span>
            case 'cancelled':
                return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20">Dibatalkan</span>
            case 'completed':
                return <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-800 ring-1 ring-inset ring-gray-600/20">Selesai</span>
            default:
                return null
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Booking Saya</h1>

            {bookings && bookings.length > 0 ? (
                <div className="space-y-4">
                    {/* Mobile: Card View */}
                    <div className="block sm:hidden space-y-4">
                        {bookings.map((booking: any) => (
                            <div key={booking.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="min-w-0">
                                        <div className="font-bold text-gray-900 dark:text-white truncate">{booking.rooms.properties.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{booking.rooms.name}</div>
                                    </div>
                                    {statusBadge(booking.status)}
                                </div>

                                {booking.status === 'cancelled' && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <div className="text-xs font-semibold text-red-600 mb-1">Keterangan:</div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300 italic">
                                            {booking.rejection_reason || 'Kamar sudah terisi atau alasan lainnya.'}
                                        </div>
                                    </div>
                                )}

                                {booking.status === 'approved' && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <div className="text-xs font-semibold text-blue-600 mb-1">Keterangan:</div>
                                        {booking.occupant_name ? (
                                            <div className="text-sm text-green-600 font-medium">Biodata sudah terisi</div>
                                        ) : (
                                            <Link href={`/tenant/bookings/${booking.id}/biodata`} className="text-sm text-blue-600 hover:underline font-medium">
                                                Lengkapi Biodata &rarr;
                                            </Link>
                                        )}
                                    </div>
                                )}

                                <div className="mt-3 flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <div className="text-xs text-gray-500">Mulai: {new Date(booking.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                    <div className="text-sm font-bold text-blue-600">Rp {Number(booking.total_price).toLocaleString('id-ID')}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: Table View */}
                    <div className="hidden sm:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Kost / Kamar</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Tanggal Mulai</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Keterangan</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Total Harga</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                {bookings.map((booking: any) => (
                                    <tr key={booking.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="font-medium text-gray-900 dark:text-white">{booking.rooms.properties.name}</div>
                                            <div className="text-gray-500 dark:text-gray-400">{booking.rooms.name}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(booking.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            {statusBadge(booking.status)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            {booking.status === 'cancelled' && (
                                                <div className="text-xs text-red-600 italic max-w-xs truncate" title={booking.rejection_reason}>
                                                    {booking.rejection_reason || 'Kamar sudah terisi'}
                                                </div>
                                            )}
                                            {booking.status === 'approved' && (
                                                <>
                                                    {booking.occupant_name ? (
                                                        <span className="text-xs text-green-600 font-medium">Biodata terisi</span>
                                                    ) : (
                                                        <Link href={`/tenant/bookings/${booking.id}/biodata`} className="text-xs text-blue-600 hover:text-blue-500 font-medium underline">
                                                            Lengkapi Biodata
                                                        </Link>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                            Rp {Number(booking.total_price).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow p-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Anda belum memiliki riwayat booking.</p>
                    <Link href="/tenant" className="text-blue-600 font-medium hover:text-blue-500">
                        Cari Kost Sekarang &rarr;
                    </Link>
                </div>
            )}
        </div>
    )
}
