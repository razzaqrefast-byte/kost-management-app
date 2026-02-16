'use client'

import { useState } from 'react'
import { updateRoom, deleteRoom } from '../../actions'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'

export default function EditRoomForm({
    propertyId,
    room
}: {
    propertyId: string,
    room: {
        id: string;
        name: string;
        price_monthly: number;
        facilities: string[];
        is_occupied: boolean;
        images: string[];
    }
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imageUrl, setImageUrl] = useState<string>(room.images?.[0] || '')

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        const result = await updateRoom(propertyId, room.id, formData)
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!confirm('Apakah Anda yakin ingin menghapus kamar ini?')) {
            return
        }
        setLoading(true)
        const result = await deleteRoom(propertyId, room.id)
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                    Nama/Nomor Kamar
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="name"
                        id="name"
                        defaultValue={room.name}
                        required
                        placeholder="Contoh: Kamar A1 atau Lantai 1 - No 5"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                    Harga Per Bulan (Rp)
                </label>
                <div className="mt-2 text-gray-900">
                    <input
                        type="number"
                        name="price"
                        id="price"
                        defaultValue={room.price_monthly}
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                    Foto Kamar
                </label>
                <ImageUpload
                    bucket="room-images"
                    defaultValue={room.images?.[0]}
                    onUploadComplete={(url) => setImageUrl(url)}
                />
                <input type="hidden" name="imageUrl" value={imageUrl} />
            </div>

            <div>
                <label htmlFor="facilities" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                    Fasilitas (Pisahkan dengan koma)
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="facilities"
                        id="facilities"
                        defaultValue={room.facilities?.join(', ')}
                        placeholder="Contoh: AC, Kamar Mandi Dalam, WiFi"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    />
                </div>
            </div>

            <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                    <input
                        id="isOccupied"
                        name="isOccupied"
                        type="checkbox"
                        defaultChecked={room.is_occupied}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                </div>
                <div className="ml-3 text-sm leading-6">
                    <label htmlFor="isOccupied" className="font-medium text-gray-900 dark:text-gray-200">
                        Kamar Terisi
                    </label>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Centang jika kamar sudah dihuni dan tidak tersedia di marketplace.</p>
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
                    Hapus Kamar
                </button>
                <div className="flex gap-x-6">
                    <Link href={`/owner/properties/${propertyId}`} className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-300">
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
