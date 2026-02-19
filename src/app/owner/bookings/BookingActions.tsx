'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { updateBookingStatus } from './actions'

export default function BookingActions({ bookingId, status }: { bookingId: string, status?: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleUpdate(status: 'approved' | 'cancelled' | 'completed') {
        let reason = ''
        if (status === 'cancelled') {
            const inputReason = prompt('Silakan tulis alasan penolakan (contoh: Kamar sudah penuh):', 'Kamar sudah terisi')
            if (inputReason === null) return // User cancelled prompt
            reason = inputReason
        } else if (status === 'completed') {
            if (!confirm('Apakah Anda yakin ingin menyelesaikan booking ini?')) {
                return
            }
        } else {
            if (!confirm('Apakah Anda yakin ingin menerima booking ini?')) {
                return
            }
        }

        setLoading(true)
        const result = await updateBookingStatus(bookingId, status, reason)

        if (result?.error) {
            alert(result.error)
            setLoading(false)
        } else {
            // Force a refresh to show the updated status
            router.refresh()
        }
    }

    return (
        <div className="flex justify-end gap-x-2">
            {status === 'pending' && (
                <>
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
                </>
            )}
            {(status === 'approved' || status === 'active') && (
                <button
                    onClick={() => handleUpdate('completed')}
                    disabled={loading}
                    className="text-green-600 hover:text-green-900 dark:text-green-400 font-medium disabled:opacity-50"
                >
                    Selesaikan
                </button>
            )}
        </div>
    )
}
