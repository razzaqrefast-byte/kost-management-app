import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Verify admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        redirect('/login')
    }

    // Global stats
    const [
        { count: totalUsers },
        { count: totalProperties },
        { count: totalBookings },
        { count: totalPayments },
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
    ])

    // Total revenue
    const { data: revenueData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'verified')

    const totalRevenue = revenueData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

    // Recent users
    const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

    const formatIDR = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

    const roleBadge = (role: string) => {
        const map: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            owner: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            tenant: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        }
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[role] || map.tenant}`}>
                {role}
            </span>
        )
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🛡️</span>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Selamat datang, {profile.full_name}. Pantau seluruh sistem KostKu.</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {[
                    { label: 'Total User', value: totalUsers || 0, color: 'border-blue-500', icon: '👥' },
                    { label: 'Total Properti', value: totalProperties || 0, color: 'border-green-500', icon: '🏠' },
                    { label: 'Total Booking', value: totalBookings || 0, color: 'border-yellow-500', icon: '📋' },
                    { label: 'Pembayaran Verified', value: totalPayments || 0, color: 'border-teal-500', icon: '✅' },
                    { label: 'Total Pendapatan', value: formatIDR(totalRevenue), color: 'border-purple-500', icon: '💰', wide: true },
                ].map((s, i) => (
                    <div key={i} className={`bg-white dark:bg-gray-800 rounded-xl shadow p-5 border-l-4 ${s.color} ${(s as any).wide ? 'col-span-2 lg:col-span-1' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{s.icon}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Users */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="font-semibold text-gray-900 dark:text-white">User Terbaru</h2>
                </div>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            {['Nama', 'Email', 'Role', 'Bergabung'].map(h => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {(recentUsers || []).map((u: any) => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{u.full_name || '—'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{u.email || '—'}</td>
                                <td className="px-6 py-4">{roleBadge(u.role || 'tenant')}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
