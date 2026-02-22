import { getMyActiveBookings, getMyPayments } from './actions'
import Link from 'next/link'
import DownloadInvoiceButton from '@/components/DownloadInvoiceButton'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function TenantPaymentsPage() {
    let bookings: any[] = []
    let payments: any[] = []
    let paymentsError: string | undefined
    let tenantName = 'Penghuni'

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            tenantName = user.user_metadata?.full_name || 'Penghuni'
        }

        const bookingsResult = await getMyActiveBookings()
        bookings = bookingsResult.bookings || []

        const paymentsResult = await getMyPayments()
        payments = paymentsResult.payments || []
        paymentsError = paymentsResult.error
    } catch (error) {
        console.error('Error loading payments page:', error)
        paymentsError = 'Tabel pembayaran belum dibuat. Silakan jalankan setup_payments.sql di Supabase.'
    }

    const statusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Menunggu Verifikasi</span>
            case 'verified':
                return <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-800 ring-1 ring-inset ring-green-600/20">Terverifikasi</span>
            case 'rejected':
                return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20">Ditolak</span>
            default:
                return null
        }
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Pembayaran</h1>

            {paymentsError && (
                <div className="mb-6 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-6 border-2 border-yellow-400 dark:border-yellow-600">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                                Fitur Pembayaran Belum Diaktifkan
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                <p className="mb-2">Untuk mengaktifkan fitur pembayaran, admin perlu menjalankan script SQL berikut di Supabase:</p>
                                <ol className="list-decimal list-inside space-y-1 ml-2">
                                    <li>Buka Supabase Dashboard → SQL Editor</li>
                                    <li>Jalankan script <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">setup_payments.sql</code></li>
                                    <li>Refresh halaman ini</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Bookings - Submit Payment */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Aktif</h2>
                {bookings && bookings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((booking: any) => (
                            <div key={booking.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="mb-3">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{booking.rooms.properties.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{booking.rooms.name}</p>
                                </div>
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Harga per bulan</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">Rp {Number(booking.rooms.price_monthly).toLocaleString('id-ID')}</p>
                                </div>
                                <Link
                                    href={`/tenant/payments/${booking.id}/submit`}
                                    className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Bayar Sekarang
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow p-8">
                        <p className="text-gray-500 dark:text-gray-400">Tidak ada booking aktif.</p>
                    </div>
                )}
            </div>

            {/* Payment History */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Riwayat Pembayaran</h2>
                {payments && payments.length > 0 ? (
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Properti / Kamar</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Periode</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Jumlah</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                {payments.map((payment: any) => (
                                    <tr key={payment.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="font-medium text-gray-900 dark:text-white">{payment.bookings?.rooms?.properties?.name || '-'}</div>
                                            <div className="text-gray-500 dark:text-gray-400">{payment.bookings?.rooms?.name || '-'}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {monthNames[payment.period_month - 1]} {payment.period_year}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            Rp {Number(payment.amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            <div className="flex flex-col items-start gap-2">
                                                {statusBadge(payment.status)}
                                                {payment.status === 'rejected' && payment.rejection_reason && (
                                                    <div className="text-xs text-red-600 italic">{payment.rejection_reason}</div>
                                                )}
                                                {payment.status === 'verified' && (
                                                    <DownloadInvoiceButton payment={payment} tenantName={tenantName} />
                                                )}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(payment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow p-8">
                        <p className="text-gray-500 dark:text-gray-400">Belum ada riwayat pembayaran.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
