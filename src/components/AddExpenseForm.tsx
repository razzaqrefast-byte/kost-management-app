'use client'

import { useState } from 'react'
import { createExpense } from '@/app/actions/expenses'
import { Loader2 } from 'lucide-react'

export default function AddExpenseForm() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await createExpense(formData)

        if (result.error) {
            setError(result.error)
        } else {
            setIsOpen(false)
            // Optional: Show success toast
        }
        setLoading(false)
    }

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
            >
                + Tambah Pengeluaran
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tambah Pengeluaran Operasional</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Kategori
                                </label>
                                <select
                                    name="category"
                                    required
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">Pilih Kategori...</option>
                                    <option value="Listrik">Listrik</option>
                                    <option value="Air">Air (PDAM/Sumur)</option>
                                    <option value="Internet">Internet / WiFi</option>
                                    <option value="Gaji Pegawai">Gaji Pegawai/Penjaga</option>
                                    <option value="Kebersihan">Keamanan & Kebersihan</option>
                                    <option value="Pajak">Pajak</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Jumlah (Rp)
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    min="0"
                                    placeholder="Contoh: 150000"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tanggal Pengeluaran
                                </label>
                                <input
                                    type="date"
                                    name="expenseDate"
                                    required
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Keterangan (Opsional)
                                </label>
                                <textarea
                                    name="description"
                                    rows={2}
                                    placeholder="Catatan tambahan..."
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            {error && (
                                <p className="text-sm font-medium text-red-600">{error}</p>
                            )}

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
