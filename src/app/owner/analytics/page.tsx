import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExportReportButton from '@/components/ExportReportButton'

export const dynamic = 'force-dynamic'

export default async function OwnerAnalyticsPage() {
    const supabase = await createClient()

    // 1. Get current owner
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Fetch all payments for owner's properties
    const { data: payments, error } = await supabase
        .from('payments')
        .select(`
            id,
            amount,
            status,
            period_month,
            period_year,
            bookings!inner (
                rooms!inner (
                    property_id,
                    properties!inner (
                        id,
                        name,
                        owner_id
                    )
                )
            )
        `)
        .eq('bookings.rooms.properties.owner_id', user.id)

    if (error) {
        console.error('Fetch analytics error:', error)
    }

    // 3. Calculate statistics
    const verifiedRevenue = payments
        ?.filter(p => p.status === 'verified')
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0

    const pendingRevenue = payments
        ?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0

    const totalProjected = verifiedRevenue + pendingRevenue

    // 4. Flatten payments for export
    const flattenedPayments = payments?.map((p: any) => ({
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        period_month: p.period_month,
        period_year: p.period_year,
        property_name: p.bookings?.rooms?.properties?.name || 'Unknown'
    })) || []

    // Format currency
    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Laporan Keuangan
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Analisis pendapatan dan performa kost Anda.</p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <ExportReportButton
                        verifiedRevenue={verifiedRevenue}
                        pendingRevenue={pendingRevenue}
                        totalProjected={totalProjected}
                        payments={flattenedPayments}
                    />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border-l-4 border-green-500">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Pendapatan (Verified)</dt>
                                    <dd className="text-lg font-bold text-gray-900 dark:text-white">{formatIDR(verifiedRevenue)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Menunggu Verifikasi</dt>
                                    <dd className="text-lg font-bold text-gray-900 dark:text-white">{formatIDR(pendingRevenue)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Proyeksi Pendapatan</dt>
                                    <dd className="text-lg font-bold text-gray-900 dark:text-white">{formatIDR(totalProjected)}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progres Visual */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Realisasi Pendapatan</h3>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                                Terverifikasi
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-green-600">
                                {totalProjected > 0 ? Math.round((verifiedRevenue / totalProjected) * 100) : 0}%
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                        <div
                            style={{ width: `${totalProjected > 0 ? (verifiedRevenue / totalProjected) * 100 : 0}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                        ></div>
                        <div
                            style={{ width: `${totalProjected > 0 ? (pendingRevenue / totalProjected) * 100 : 0}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-400"
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Berdasarkan total pembayaran masuk (Verified + Pending)</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Tips Analitik</h3>
                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                            <p>Segera verifikasi pembayaran yang masuk agar realisasi pendapatan Anda tercatat dengan akurat.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
