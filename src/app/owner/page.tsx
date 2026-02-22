import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import RevenueChart from '@/components/RevenueChart'

export const dynamic = 'force-dynamic'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default async function OwnerDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // ── Fetch properties ───────────────────────────────────────────
    const { data: properties } = await supabase
        .from('properties')
        .select('id, name')
        .eq('owner_id', user.id)

    const propertyIds = properties?.map(p => p.id) || []
    const propertyCount = propertyIds.length

    // ── Rooms & Occupancy ──────────────────────────────────────────
    let totalRooms = 0
    let occupiedRooms = 0
    let availableRooms = 0
    let roomIds: string[] = []

    if (propertyIds.length > 0) {
        const { data: rooms } = await supabase
            .from('rooms')
            .select('id, is_occupied')
            .in('property_id', propertyIds)

        totalRooms = rooms?.length || 0
        occupiedRooms = rooms?.filter(r => r.is_occupied).length || 0
        availableRooms = totalRooms - occupiedRooms
        roomIds = rooms?.map(r => r.id) || []
    }

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    // ── Pending Bookings ───────────────────────────────────────────
    let bookingCount = 0
    if (roomIds.length > 0) {
        const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .in('room_id', roomIds)
            .eq('status', 'pending')
        bookingCount = count || 0
    }

    // ── Revenue Chart Data (last 6 months) ────────────────────────
    const now = new Date()
    const chartData = []

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const month = d.getMonth() + 1
        const year = d.getFullYear()

        // Revenue: verified payments for this month
        let monthRevenue = 0
        if (roomIds.length > 0) {
            const { data: payments } = await supabase
                .from('payments')
                .select('amount, bookings!inner(room_id)')
                .eq('status', 'verified')
                .eq('period_month', month)
                .eq('period_year', year)
                .in('bookings.room_id', roomIds)

            monthRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
        }

        // Expenses: manual expenses for this month
        const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
        const nextMonth = new Date(year, month, 1)
        const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`

        const { data: expenses } = await supabase
            .from('expenses')
            .select('amount')
            .eq('owner_id', user.id)
            .gte('expense_date', monthStart)
            .lt('expense_date', monthEnd)

        const monthExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

        chartData.push({
            month: `${MONTH_NAMES[month - 1]} ${year}`,
            pendapatan: monthRevenue,
            pengeluaran: monthExpenses,
        })
    }

    // ── This Month Revenue ─────────────────────────────────────────
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const currentMonthRevenue = chartData[chartData.length - 1]?.pendapatan || 0

    // ── Unread notifications count ─────────────────────────────────
    const { count: unreadNotifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    const formatIDR = (amount: number) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount)

    return (
        <div className="px-4 py-8 sm:px-0 max-w-7xl mx-auto">

            {/* ── Greeting ─────────────────────────────────────────── */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Selamat datang! 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Berikut ringkasan performa properti Anda hari ini.
                </p>
            </div>

            {/* ── Stat Cards ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
                {/* Total Properti */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 border-l-4 border-blue-500">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Properti</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{propertyCount}</p>
                    <Link href="/owner/properties" className="text-xs text-blue-600 dark:text-blue-400 mt-2 inline-block hover:underline">
                        Kelola properti →
                    </Link>
                </div>

                {/* Tingkat Hunian */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 border-l-4 border-green-500">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Tingkat Hunian</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{occupancyRate}%</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{occupiedRooms}/{totalRooms} kamar terisi</p>
                </div>

                {/* Booking Pending */}
                <div className={`bg-white dark:bg-gray-800 rounded-xl shadow p-5 border-l-4 ${bookingCount > 0 ? 'border-yellow-500' : 'border-gray-300'}`}>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Booking Menunggu</p>
                    <p className={`text-3xl font-bold mt-1 ${bookingCount > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>{bookingCount}</p>
                    <Link href="/owner/bookings" className="text-xs text-blue-600 dark:text-blue-400 mt-2 inline-block hover:underline">
                        Kelola booking →
                    </Link>
                </div>

                {/* Pendapatan Bulan Ini */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 border-l-4 border-purple-500">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pendapatan Bulan Ini</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 truncate">{formatIDR(currentMonthRevenue)}</p>
                    <Link href="/owner/analytics" className="text-xs text-blue-600 dark:text-blue-400 mt-2 inline-block hover:underline">
                        Lihat laporan →
                    </Link>
                </div>
            </div>

            {/* ── Occupancy Bar ─────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-gray-900 dark:text-white">Hunian Kamar</h2>
                    <span className="text-sm text-gray-500">{occupiedRooms} terisi, {availableRooms} tersedia</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                        className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${occupancyRate}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>0%</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{occupancyRate}% Terisi</span>
                    <span>100%</span>
                </div>
            </div>

            {/* ── Revenue Chart ─────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">Grafik Keuangan</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pendapatan & Pengeluaran 6 bulan terakhir</p>
                    </div>
                    <Link
                        href="/owner/analytics"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Detail laporan →
                    </Link>
                </div>
                <RevenueChart data={chartData} />
            </div>

            {/* ── Quick Actions ────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Menu Cepat</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { href: '/owner/properties/new', label: 'Tambah Properti', icon: '🏠' },
                        { href: '/owner/bookings', label: 'Booking', icon: '📋', badge: bookingCount },
                        { href: '/owner/payments', label: 'Pembayaran', icon: '💰' },
                        { href: '/owner/maintenance', label: 'Keluhan', icon: '🔧' },
                        { href: '/owner/analytics', label: 'Laporan', icon: '📊' },
                        { href: '/owner/contracts', label: 'Kontrak', icon: '📄' },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-center group"
                        >
                            {item.badge && item.badge > 0 ? (
                                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                    {item.badge}
                                </span>
                            ) : null}
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 leading-tight">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
