'use client'

import { useState } from 'react'
import { createBooking } from '../../actions'

export default function BookingForm({
    roomId,
    priceMonthly
}: {
    roomId: string,
    priceMonthly: number
}) {
    const [duration, setDuration] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const totalPrice = priceMonthly * duration

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = await createBooking(roomId, formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tanggal Mulai Sewa
                </label>
                <div className="mt-1">
                    <input
                        type="date"
                        name="startDate"
                        id="startDate"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Durasi Sewa (Bulan)
                </label>
                <div className="mt-1">
                    <select
                        id="duration"
                        name="duration"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                    >
                        {[1, 2, 3, 6, 12].map((m) => (
                            <option key={m} value={m}>{m} Bulan</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-700 dark:text-blue-300 font-medium">Total Pembayaran</span>
                    <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        Rp {totalPrice.toLocaleString('id-ID')}
                    </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    *Total estimasi biaya untuk {duration} bulan.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {loading ? 'Memproses...' : 'Konfirmasi Booking'}
            </button>
        </form>
    )
}
