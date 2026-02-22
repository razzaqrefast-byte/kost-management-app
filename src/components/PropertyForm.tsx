'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Dynamic import for Leaflet-based LocationPicker to avoid SSR issues
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">Memuat Peta...</div>
})

interface PropertyFormProps {
    initialData?: {
        id?: string
        name: string
        address: string
        description: string | null
        image_url: string | null
        latitude: number | null
        longitude: number | null
    }
    onSubmit: (formData: FormData) => Promise<{ error?: string } | void>
    loading: boolean
    title: string
    buttonText: string
}

export default function PropertyForm({ initialData, onSubmit, loading, title, buttonText }: PropertyFormProps) {
    const [imageUrl, setImageUrl] = useState<string>(initialData?.image_url || '')
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(
        initialData?.latitude && initialData?.longitude
            ? { lat: initialData.latitude, lng: initialData.longitude }
            : null
    )
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setError(null)

        // Add coordinates to formData if selected
        if (location) {
            formData.append('latitude', location.lat.toString())
            formData.append('longitude', location.lng.toString())
        }

        // Ensure imageUrl is included
        formData.set('imageUrl', imageUrl)

        const result = await onSubmit(formData)
        if (result?.error) {
            setError(result.error)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        {title}
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
                            defaultValue={initialData?.name}
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
                            defaultValue={initialData?.address}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="Jl. Mawar No. 12, Jakarta Selatan..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                        Lokasi di Peta
                    </label>
                    <LocationPicker
                        initialLat={initialData?.latitude}
                        initialLng={initialData?.longitude}
                        onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                        Foto Kost
                    </label>
                    <ImageUpload
                        bucket="property-images"
                        defaultValue={imageUrl}
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
                            defaultValue={initialData?.description || ''}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="Ceritakan kelebihan kost Anda..."
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
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
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Menyimpan...' : buttonText}
                    </button>
                </div>
            </form>
        </div>
    )
}
