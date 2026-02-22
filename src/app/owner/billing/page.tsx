import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SendReminderButton from './SendReminderButton'

export const dynamic = 'force-dynamic'

export default async function OwnerBillingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get properties for this owner
    const { data: properties } = await supabase.from('properties').select('id').eq('owner_id', user.id)
    const propertyIds = properties?.map(p => p.id) || []

    // Get all active bookings with last payment info
    let overdueList: any[] = []
    let currentMonth: any[] = []

    if (propertyIds.length > 0) {
        const now = new Date()
        const thisMonth = now.getMonth() + 1
        const thisYear = now.getFullYear()

        const { data: bookings } = await supabase
            .from('bookings')
            .select(`
                id,
                tenant_id,
                tenant:profiles!tenant_id(full_name, phone),
                rooms(
                    name,
                    price_monthly,
                    properties(name)
                )
            `)
            .in('rooms.properties.id', propertyIds)
            .in('status', ['approved', 'active'])

        const allBookings = bookings || []

        // For each booking, check if they have paid this month
        for (const b of allBookings) {
            const { count } = await supabase
                .from('payments')
                .select('*', { count: 'exact', head: true })
                .eq('booking_id', b.id)
                .in('status', ['pending', 'verified'])
                .eq('period_month', thisMonth)
                .eq('period_year', thisYear)

            const hasPaid = (count || 0) > 0
            const room = b.rooms as any
            const tenant = b.tenant as any

            const entry = {
                id: b.id,
                tenant_id: b.tenant_id,
                tenant_name: tenant?.full_name || 'Tenant',
                tenant_phone: tenant?.phone || '-',
                room_name: room?.name || '-',
                property_name: room?.properties?.name || '-',
                monthly_rent: room?.price_monthly || 0,
                paid_this_month: hasPaid,
            }

            if (!hasPaid) {
                overdueList.push(entry)
            } else {
                currentMonth.push(entry)
            }
        }
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Status Tagihan</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Pantau status pembayaran sewa tenant Anda bulan ini.
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">Belum Bayar Bulan Ini</p>
                    <p className="text-4xl font-bold text-red-700 dark:text-red-400 mt-1">{overdueList.length}</p>
                    <p className="text-xs text-red-500 mt-1">tenant</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Sudah Bayar Bulan Ini</p>
                    <p className="text-4xl font-bold text-green-700 dark:text-green-400 mt-1">{currentMonth.length}</p>
                    <p className="text-xs text-green-500 mt-1">tenant</p>
                </div>
            </div>

            {/* Overdue list */}
            {overdueList.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900 dark:text-white text-red-600 dark:text-red-400">
                            ⚠️ Belum Membayar ({overdueList.length})
                        </h2>
                        <SendReminderButton tenants={overdueList} />
                    </div>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                {['Tenant', 'Properti / Kamar', 'Tagihan/Bulan', 'Aksi'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {overdueList.map(t => (
                                <tr key={t.id} className="hover:bg-red-50/30 dark:hover:bg-red-900/10">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{t.tenant_name}</div>
                                        <div className="text-xs text-gray-500">{t.tenant_phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div>{t.property_name}</div>
                                        <div>{t.room_name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        Rp {Number(t.monthly_rent).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <SendReminderButton tenants={[t]} single />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Paid list */}
            {currentMonth.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="font-semibold text-green-600 dark:text-green-400">✅ Sudah Membayar ({currentMonth.length})</h2>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                {['Tenant', 'Properti / Kamar', 'Tagihan/Bulan'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {currentMonth.map(t => (
                                <tr key={t.id} className="hover:bg-green-50/30 dark:hover:bg-green-900/10">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t.tenant_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div>{t.property_name}</div>
                                        <div>{t.room_name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        Rp {Number(t.monthly_rent).toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {overdueList.length === 0 && currentMonth.length === 0 && (
                <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow p-16">
                    <p className="text-gray-500 dark:text-gray-400">Tidak ada booking aktif saat ini.</p>
                </div>
            )}
        </div>
    )
}
