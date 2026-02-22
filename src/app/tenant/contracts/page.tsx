import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTenantContracts } from './actions'
import { FileText } from 'lucide-react'
import ContractPdfButton from '@/components/ContractPdfButton'

export const dynamic = 'force-dynamic'

export default async function TenantContractsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { contracts } = await getTenantContracts()

    const statusBadge = (status: string) => {
        const map: Record<string, { cls: string; label: string }> = {
            active: { cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Aktif' },
            expired: { cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', label: 'Kedaluwarsa' },
            terminated: { cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Dihentikan' },
        }
        const { cls, label } = map[status] || map.expired
        return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-7 h-7 text-blue-600" />
                    Kontrak Sewa Saya
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Daftar kontrak sewa yang berlaku untuk Anda.
                </p>
            </div>

            {contracts.length === 0 ? (
                <div className="text-center bg-white dark:bg-gray-800 rounded-xl shadow p-16">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Belum ada kontrak sewa.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {contracts.map((c: any) => {
                        const daysLeft = Math.ceil((new Date(c.end_date).getTime() - Date.now()) / 86400000)
                        return (
                            <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{c.property_name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{c.room_name}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {statusBadge(c.status)}
                                        <ContractPdfButton contract={c} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Harga Sewa</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            Rp {Number(c.monthly_rent).toLocaleString('id-ID')}/bulan
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Periode</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {new Date(c.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {' — '}
                                            {new Date(c.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {c.status === 'active' && daysLeft <= 30 && daysLeft > 0 && (
                                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                        <p className="text-sm text-orange-700 dark:text-orange-400">
                                            ⏰ Kontrak Anda akan berakhir dalam <strong>{daysLeft} hari</strong>. Hubungi pemilik untuk perpanjangan.
                                        </p>
                                    </div>
                                )}

                                {c.notes && (
                                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 italic">
                                        <span className="font-medium not-italic text-gray-700 dark:text-gray-300">Catatan: </span>
                                        {c.notes}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
