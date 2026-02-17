'use client'

import { useState } from 'react'
import { createMaintenanceRequest } from '@/app/actions/maintenance'
import ImageUpload from '@/components/ImageUpload'
import Link from 'next/link'

export default function NewMaintenanceForm({
    properties
}: {
    properties: { id: string, name: string, rooms: { id: string, name: string }[] }[]
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedPropertyId, setSelectedPropertyId] = useState('')
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const selectedProperty = properties.find(p => p.id === selectedPropertyId)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            setImagePreview(null)
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        const result = await createMaintenanceRequest(formData)
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
            <div>
                <label htmlFor="propertyId" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                    Pilih Properti
                </label>
                <select
                    id="propertyId"
                    name="propertyId"
                    required
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                >
                    <option value="">-- Pilih Kost --</option>
                    {properties.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="roomId" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                    Kamar (Opsional)
                </label>
                <select
                    id="roomId"
                    name="roomId"
                    className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                >
                    <option value="">Area Umum</option>
                    {selectedProperty?.rooms.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                    Judul Keluhan
                </label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    placeholder="Contoh: AC Mati, Kran Bocor, Genteng Lepas"
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                    Deskripsi Detail
                </label>
                <textarea
                    name="description"
                    id="description"
                    rows={4}
                    required
                    placeholder="Ceritakan sedetail mungkin masalah yang dialami..."
                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                />
            </div>

            <div>
                <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                    Foto Bukti (Opsional)
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                    <input
                        type="file"
                        id="imageFile"
                        name="imageFile"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    />
                </div>
                {imagePreview && (
                    <div className="mt-4">
                        <img src={imagePreview} alt="Preview" className="h-40 w-auto rounded-lg object-cover border border-gray-200" />
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
            )}

            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-4 dark:border-gray-700">
                <Link href="/tenant/maintenance" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-300">
                    Batal
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
            </div>
        </form>
    )
}
