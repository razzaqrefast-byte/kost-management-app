'use client'

import { useState } from 'react'
import { updateProperty, deleteProperty } from '../../actions'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'

export default function EditPropertyForm({
    property
}: {
    property: {
        id: string;
        name: string;
        address: string;
        description: string | null;
        image_url?: string | null;
    }
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imageUrl, setImageUrl] = useState<string>(property.image_url || '')

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        const result = await updateProperty(property.id, formData)
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!confirm('Apakah Anda yakin ingin menghapus properti ini? Semua data kamar dan booking terkait juga akan terhapus.')) {
            return
        }
        setLoading(true)
        const result = await deleteProperty(property.id)
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                    Nama Properti
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="name"
                        id="name"
                        defaultValue={property.name}
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
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
                        required
                        defaultValue={property.address}
                        rows={3}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                    Foto Kost
                </label>
                <ImageUpload
                    bucket="property-images"
                    defaultValue={property.image_url}
                    onUploadComplete={(url) => setImageUrl(url)}
                />
                <input type="hidden" name="imageUrl" value={imageUrl} />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                    Deskripsi Properti
                </label>
                <div className="mt-2">
                    <textarea
                        name="description"
                        id="description"
                        defaultValue={property.description || ''}
                        rows={4}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    />
                </div>
            </div>

            {error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
            )}

            <div className="flex items-center justify-between border-t border-gray-900/10 pt-4 dark:border-gray-700">
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="text-sm font-semibold leading-6 text-red-600 hover:text-red-500"
                >
                    Hapus Properti
                </button>
                <div className="flex gap-x-6">
                    <Link href={`/owner/properties/${property.id}`} className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-300">
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </form>
    )
}
