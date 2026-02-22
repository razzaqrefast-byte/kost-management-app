'use client'

import { useState } from 'react'
import { createContract } from './actions'
import { Plus, X } from 'lucide-react'

interface Booking {
    id: string
    tenant_id: string
    start_date: string | null
    end_date: string | null
    total_price: number | null
    tenant: { full_name: string } | null
    rooms: {
        name: string
        price_monthly: number
        properties: { name: string }
    } | null
}

export default function CreateContractForm({ bookings }: { bookings: Booking[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

    const handleBookingSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const b = bookings.find(bk => bk.id === e.target.value) || null
        setSelectedBooking(b)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedBooking) return
        setLoading(true)
        setError(null)

        const fd = new FormData(e.currentTarget)
        fd.set('tenant_id', selectedBooking.tenant_id)
        fd.set('property_name', (selectedBooking.rooms as any)?.properties?.name || '')
        fd.set('room_name', (selectedBooking.rooms as any)?.name || '')
        fd.set('monthly_rent', String((selectedBooking.rooms as any)?.price_monthly || 0))

        const result = await createContract(fd)
        setLoading(false)

        if (result?.error) {
            setError(result.error)
        } else {
            setOpen(false)
            setSelectedBooking(null)
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
                <Plus className="w-4 h-4" /> Buat Kontrak
            </button>

            {open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Buat Kontrak Sewa</h2>
                            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Booking Aktif</label>
                                <select
                                    name="booking_id"
                                    required
                                    onChange={handleBookingSelect}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Pilih booking...</option>
                                    {bookings.map(b => (
                                        <option key={b.id} value={b.id}>
                                            {(b.tenant as any)?.full_name || 'Tenant'} — {(b.rooms as any)?.name} ({(b.rooms as any)?.properties?.name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedBooking && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
                                    <p className="text-blue-800 dark:text-blue-300">
                                        <strong>Sewa:</strong> Rp {Number((selectedBooking.rooms as any)?.price_monthly).toLocaleString('id-ID')}/bulan
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        required
                                        defaultValue={selectedBooking?.start_date?.split('T')[0] || ''}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Selesai</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan (opsional)</label>
                                <textarea
                                    name="notes"
                                    rows={3}
                                    placeholder="Syarat dan ketentuan tambahan..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Menyimpan...' : 'Buat Kontrak'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
