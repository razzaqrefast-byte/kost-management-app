import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import BookingActions from './BookingActions'

export default async function OwnerBookingsPage() {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 2. Fetch bookings for rooms belonging to this owner's properties
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
        .order('created_at', { ascending: false })

    // Filter manually because Supabase complex join filter is tricky with current schema
    const filteredBookings = bookings?.filter((b: any) => b.rooms.properties.owner_id === user.id)

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
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Booking Masuk</h1>

            {filteredBookings && filteredBookings.length > 0 ? (
                <div className="space-y-4">
                    {/* Mobile: Card View */}
                    <div className="block sm:hidden space-y-4">
                        {filteredBookings.map((booking: any) => (
                            <div key={booking.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="min-w-0">
                                        <div className="font-bold text-gray-900 dark:text-white truncate">{booking.tenant?.full_name || 'Tanpa Nama'}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{booking.rooms.properties.name} - {booking.rooms.name}</div>
                                    </div>
                                    {statusBadge(booking.status)}
                                </div>
                                <div className="flex justify-between items-center text-sm mb-4">
                                    <div className="text-gray-500">Mulai: {new Date(booking.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                                    <div className="font-semibold text-gray-900 dark:text-gray-200">Rp {Number(booking.total_price).toLocaleString('id-ID')}</div>
                                </div>
                                {booking.status === 'cancelled' && (
                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 mb-3">
                                        <div className="text-xs font-semibold text-red-600 mb-1">Keterangan:</div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300 italic">{booking.rejection_reason || 'Kamar sudah terisi atau alasan lainnya.'}</div>
                                    </div>
                                )}
                                {booking.status === 'approved' && booking.occupant_name && (
                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 mb-3">
                                        <div className="text-xs font-semibold text-green-600 mb-1">Biodata Penghuni:</div>
                                        <div className="text-sm text-gray-900 dark:text-white font-medium">{booking.occupant_name}</div>
                                        <div className="text-xs text-gray-500">NIK: {booking.occupant_ktp_number}</div>
                                    </div>
                                )}
                                {booking.status === 'pending' && (
                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <BookingActions bookingId={booking.id} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Desktop: Table View */}
                    <div className="hidden sm:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Penyewa / Kamar</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Kost</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Tanggal Mulai</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Keterangan</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Total Harga</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Aksi</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                {filteredBookings.map((booking: any) => (
                                    <tr key={booking.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="font-medium text-gray-900 dark:text-white">{booking.tenant?.full_name || 'Tanpa Nama'}</div>
                                            <div className="text-gray-500 dark:text-gray-400">{booking.rooms.name}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {booking.rooms.properties.name}
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
                                                    Ket: {booking.rejection_reason || 'Kamar sudah terisi'}
                                                </div>
                                            )}
                                            {booking.status === 'approved' && (
                                                <div className="text-xs">
                                                    {booking.occupant_name ? (
                                                        <div className="text-green-600 font-medium truncate max-w-[150px]" title={booking.occupant_name}>
                                                            {booking.occupant_name}
                                                        </div>
                                                    ) : (
                                                        <span className="text-yellow-600 italic">Menunggu Biodata</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                            Rp {Number(booking.total_price).toLocaleString('id-ID')}
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex items-center justify-end gap-3">
                                            <Link href={`/owner/bookings/${booking.id}`} className="text-blue-600 hover:text-blue-500">
                                                Detail & Chat
                                            </Link>
                                            {booking.status === 'pending' && (
                                                <BookingActions bookingId={booking.id} />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow p-12">
                    <p className="text-gray-500 dark:text-gray-400">Belum ada booking masuk untuk properti Anda.</p>
                </div>
            )}
        </div>
    )
}
