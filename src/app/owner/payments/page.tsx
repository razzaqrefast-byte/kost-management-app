import { getPropertyPayments } from './actions'
import PaymentActions from './PaymentActions'
import StatusFilter from './StatusFilter'

export const dynamic = 'force-dynamic'

export default async function OwnerPaymentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
    const resolvedParams = await searchParams
    const statusFilter = resolvedParams.status || 'all'

    let payments: any[] = []
    let paymentsError: string | undefined

    try {
        const result = await getPropertyPayments(statusFilter)
        payments = result.payments || []
        paymentsError = result.error
    } catch (error) {
        console.error('Error loading owner payments page:', error)
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
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pembayaran</h1>

                {/* Filter */}
                <div className="mt-4 sm:mt-0">
                    <StatusFilter defaultValue={statusFilter} />
                </div>
            </div>

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

            {payments && payments.length > 0 ? (
                <>
                    {/* Mobile: Card View */}
                    <div className="block lg:hidden space-y-4">
                        {payments.map((payment: any) => (
                            <div key={payment.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-gray-900 dark:text-white truncate">
                                            {payment.bookings?.tenant?.full_name || 'Tanpa Nama'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {payment.bookings?.rooms?.properties?.name} - {payment.bookings?.rooms?.name}
                                        </div>
                                    </div>
                                    {statusBadge(payment.status)}
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Periode</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {monthNames[payment.period_month - 1]} {payment.period_year}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Jumlah</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            Rp {Number(payment.amount).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>

                                {payment.signed_proof_url && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bukti Pembayaran</p>
                                        <a href={payment.signed_proof_url} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={payment.signed_proof_url}
                                                alt="Bukti Pembayaran"
                                                className="w-full h-32 object-contain bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 hover:opacity-75"
                                            />
                                        </a>
                                    </div>
                                )}

                                {payment.notes && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Catatan</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{payment.notes}</p>
                                    </div>
                                )}

                                {payment.status === 'pending' && (
                                    <PaymentActions paymentId={payment.id} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Desktop: Table View */}
                    <div className="hidden lg:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Penyewa</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Properti / Kamar</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Periode</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Jumlah</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Bukti</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Aksi</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                {payments.map((payment: any) => (
                                    <tr key={payment.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {payment.bookings?.tenant?.full_name || 'Tanpa Nama'}
                                            </div>
                                            <div className="text-gray-500 dark:text-gray-400">
                                                {payment.bookings?.tenant?.phone || '-'}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {payment.bookings?.rooms?.properties?.name || '-'}
                                            </div>
                                            <div className="text-gray-500 dark:text-gray-400">
                                                {payment.bookings?.rooms?.name || '-'}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {monthNames[payment.period_month - 1]} {payment.period_year}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            Rp {Number(payment.amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            {payment.signed_proof_url ? (
                                                <a
                                                    href={payment.signed_proof_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-500 underline"
                                                >
                                                    Lihat Bukti
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            {statusBadge(payment.status)}
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            {payment.status === 'pending' && (
                                                <PaymentActions paymentId={payment.id} />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow p-12">
                    <p className="text-gray-500 dark:text-gray-400">
                        {statusFilter === 'all' ? 'Belum ada pembayaran masuk.' : `Tidak ada pembayaran dengan status "${statusFilter}".`}
                    </p>
                </div>
            )}
        </div>
    )
}
