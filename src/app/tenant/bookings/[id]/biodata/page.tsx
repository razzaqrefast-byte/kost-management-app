'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { updateBookingBiodata } from '../../../actions'
import Link from 'next/link'

export default function BiodataPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await updateBookingBiodata(id, formData)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            alert('Biodata berhasil disimpan!')
            router.push('/tenant/bookings')
            router.refresh()
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Link href="/tenant/bookings" className="text-blue-600 hover:text-blue-500 mb-6 inline-block font-medium">
                &lsaquo; Kembali ke Booking Saya
            </Link>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Lengkapi Biodata Penghuni</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Silakan isi data penghuni sesuai dengan Kartu Identitas Penduduk (KTP).</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nama Lengkap (Sesuai KTP)
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 dark:text-white"
                            placeholder="Contoh: Budi Santoso"
                        />
                    </div>

                    <div>
                        <label htmlFor="ktpNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nomor NIK (KTP)
                        </label>
                        <input
                            type="text"
                            id="ktpNumber"
                            name="ktpNumber"
                            required
                            pattern="[0-9]{16}"
                            maxLength={16}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 dark:text-white"
                            placeholder="16 digit nomor NIK"
                        />
                        <p className="mt-1 text-xs text-gray-500">Masukkan 16 digit nomor NIK Anda.</p>
                    </div>

                    <div>
                        <label htmlFor="ktpFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Upload Foto KTP
                        </label>
                        <input
                            type="file"
                            id="ktpFile"
                            name="ktpFile"
                            accept="image/*"
                            required
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="mt-1 text-xs text-gray-500">Format: JPG, PNG. Maksimal 2MB.</p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Biodata'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
