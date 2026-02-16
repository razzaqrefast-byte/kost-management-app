'use client'

import { useState } from 'react'
import { updateBookingStatus } from './actions'

export default function BookingActions({ bookingId }: { bookingId: string }) {
    const [loading, setLoading] = useState(false)

    async function handleUpdate(status: 'approved' | 'cancelled') {
        if (!confirm(`Apakah Anda yakin ingin ${status === 'approved' ? 'menerima' : 'menolak'} booking ini?`)) {
            return
        }

        setLoading(true)
        const result = await updateBookingStatus(bookingId, status)

        if (result?.error) {
            alert(result.error)
            setLoading(false)
        }
        // No need to setLoading(false) on success as revalidatePath will refresh the Server Component
    }

    return (
        <div className="flex justify-end gap-x-2">
            <button
                onClick={() => handleUpdate('approved')}
                disabled={loading}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 font-medium disabled:opacity-50"
            >
                Terima
            </button>
            <button
                onClick={() => handleUpdate('cancelled')}
                disabled={loading}
                className="text-red-600 hover:text-red-900 dark:text-red-400 font-medium disabled:opacity-50"
            >
                Tolak
            </button>
        </div>
    )
}
