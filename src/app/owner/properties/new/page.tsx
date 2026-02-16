'use client'

import { createProperty } from '../actions'
import Link from 'next/link'
import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'

export default function NewPropertyPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imageUrl, setImageUrl] = useState<string>('')

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        // Server action will handle redirect on success
        const result = await createProperty(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Tambah Kost Baru
                    </h2>
                </div>
            </div>

            <form action={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                        Nama Kost
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="Contoh: Kost Bahagia 1"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                        Alamat Lengkap
                    </label>
                    <div className="mt-2">
                        <textarea
                            name="address"
                            id="address"
                            rows={3}
                            required
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="Jl. Mawar No. 12, Jakarta Selatan..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                        Foto Kost
                    </label>
                    <ImageUpload
                        bucket="property-images"
                        onUploadComplete={(url) => setImageUrl(url)}
                    />
                    <input type="hidden" name="imageUrl" value={imageUrl} />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                        Deskripsi (Opsional)
                    </label>
                    <div className="mt-2">
                        <textarea
                            name="description"
                            id="description"
                            rows={4}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="Ceritakan kelebihan kost Anda..."
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-4 dark:border-gray-700">
                    <Link href="/owner/properties" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-300">
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Kost'}
                    </button>
                </div>
            </form>
        </div>
    )
}
