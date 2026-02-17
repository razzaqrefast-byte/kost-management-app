'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitPayment } from '../../actions'

export default function SubmitPaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Get current month and year
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await submitPayment(resolvedParams.bookingId, formData)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            alert('Pembayaran berhasil disubmit! Menunggu verifikasi dari pemilik kost.')
            router.push('/tenant/payments')
            router.refresh()
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Submit Pembayaran</h1>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
                {error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                )}

                {/* Period Month */}
                <div>
                    <label htmlFor="periodMonth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bulan Pembayaran
                    </label>
                    <select
                        id="periodMonth"
                        name="periodMonth"
                        defaultValue={currentMonth}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="1">Januari</option>
                        <option value="2">Februari</option>
                        <option value="3">Maret</option>
                        <option value="4">April</option>
                        <option value="5">Mei</option>
                        <option value="6">Juni</option>
                        <option value="7">Juli</option>
                        <option value="8">Agustus</option>
                        <option value="9">September</option>
                        <option value="10">Oktober</option>
                        <option value="11">November</option>
                        <option value="12">Desember</option>
                    </select>
                </div>

                {/* Period Year */}
                <div>
                    <label htmlFor="periodYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tahun
                    </label>
                    <select
                        id="periodYear"
                        name="periodYear"
                        defaultValue={currentYear}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value={currentYear - 1}>{currentYear - 1}</option>
                        <option value={currentYear}>{currentYear}</option>
                        <option value={currentYear + 1}>{currentYear + 1}</option>
                    </select>
                </div>

                {/* Amount */}
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Jumlah Pembayaran (Rp)
                    </label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        required
                        min="0"
                        step="1000"
                        placeholder="Contoh: 1500000"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Masukkan jumlah yang Anda bayarkan</p>
                </div>

                {/* Payment Proof */}
                <div>
                    <label htmlFor="proofFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bukti Pembayaran
                    </label>
                    <input
                        type="file"
                        id="proofFile"
                        name="proofFile"
                        accept="image/*"
                        required
                        className="mt-1 block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Upload screenshot/foto bukti transfer</p>
                </div>

                {/* Notes */}
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Catatan (Opsional)
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        placeholder="Tambahkan catatan jika diperlukan"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Mengirim...' : 'Submit Pembayaran'}
                    </button>
                </div>
            </form>
        </div>
    )
}
