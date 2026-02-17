'use client'

import { useState } from 'react'
import { verifyPayment, rejectPayment } from './actions'
import { useRouter } from 'next/navigation'

export default function PaymentActions({ paymentId }: { paymentId: string }) {
    const router = useRouter()
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleVerify() {
        if (!confirm('Apakah Anda yakin ingin memverifikasi pembayaran ini?')) return

        setLoading(true)
        const result = await verifyPayment(paymentId)

        if (result.error) {
            alert('Error: ' + result.error)
        } else {
            alert('Pembayaran berhasil diverifikasi!')
            router.refresh()
        }
        setLoading(false)
    }

    async function handleReject() {
        if (!rejectionReason.trim()) {
            alert('Alasan penolakan wajib diisi!')
            return
        }

        setLoading(true)
        const result = await rejectPayment(paymentId, rejectionReason)

        if (result.error) {
            alert('Error: ' + result.error)
        } else {
            alert('Pembayaran ditolak.')
            setShowRejectModal(false)
            setRejectionReason('')
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <>
            <div className="flex gap-2">
                <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                    Verifikasi
                </button>
                <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                    Tolak
                </button>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Tolak Pembayaran
                        </h3>
                        <div className="mb-4">
                            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Alasan Penolakan
                            </label>
                            <textarea
                                id="rejectionReason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                placeholder="Contoh: Bukti transfer tidak jelas"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false)
                                    setRejectionReason('')
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={loading}
                                className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                                {loading ? 'Menolak...' : 'Tolak Pembayaran'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
