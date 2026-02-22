import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getContracts, getActiveBookingsForContract } from './actions'
import CreateContractForm from './CreateContractForm'

export const dynamic = 'force-dynamic'

export default async function OwnerContractsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { contracts } = await getContracts()
    const { bookings } = await getActiveBookingsForContract()

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            expired: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
            terminated: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        }
        const labels: Record<string, string> = {
            active: 'Aktif',
            expired: 'Kedaluwarsa',
            terminated: 'Dihentikan',
        }
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.expired}`}>
                {labels[status] || status}
            </span>
        )
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Kontrak</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Buat dan kelola kontrak sewa digital dengan tenant Anda.</p>
                </div>
                <CreateContractForm bookings={bookings as any[]} />
            </div>

            {contracts.length === 0 ? (
                <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow p-16">
                    <span className="text-5xl">📄</span>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">Belum ada kontrak. Buat kontrak pertama Anda.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                {['Tenant', 'Properti / Kamar', 'Periode', 'Sewa/Bulan', 'Status', 'Aksi'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {contracts.map((c: any) => {
                                const daysLeft = Math.ceil((new Date(c.end_date).getTime() - Date.now()) / 86400000)
                                return (
                                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {c.tenant_id?.split('-')[0] || 'Tenant'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="font-medium text-gray-900 dark:text-white">{c.property_name}</div>
                                            <div>{c.room_name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            <div>{new Date(c.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            <div>s/d {new Date(c.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            {c.status === 'active' && daysLeft <= 30 && daysLeft > 0 && (
                                                <span className="mt-1 inline-block text-xs text-orange-600 dark:text-orange-400">⏰ {daysLeft} hari lagi</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            Rp {Number(c.monthly_rent).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {statusBadge(c.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex gap-2">
                                                <ContractPdfClientButton contract={c} />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// Inline client component for PDF action (imported from another file)
import ContractPdfClientButton from '@/components/ContractPdfButton'
