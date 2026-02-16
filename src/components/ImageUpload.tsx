'use client'

import { useState } from 'react'
import { uploadImage } from '@/app/actions/storage'

export default function ImageUpload({
    bucket,
    defaultValue,
    onUploadComplete
}: {
    bucket: 'property-images' | 'room-images',
    defaultValue?: string | null,
    onUploadComplete: (url: string) => void
}) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(defaultValue || null)
    const [error, setError] = useState<string | null>(null)

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        // 1. Show local preview
        const localPreview = URL.createObjectURL(file)
        setPreview(localPreview)
        setError(null)

        // 2. Upload to storage
        setUploading(true)
        try {
            const publicUrl = await uploadImage(file, bucket)
            onUploadComplete(publicUrl)
        } catch (err: any) {
            setError(err.message)
            setPreview(defaultValue || null)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-x-4">
                {preview ? (
                    <div className="relative h-32 w-48 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                        <img
                            src={preview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                        />
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <span className="text-xs font-semibold text-white">Mengunggah...</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex h-32 w-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                <div>
                    <label className="cursor-pointer rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        Pilih Foto
                        <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>
                    <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
            </div>
            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        </div>
    )
}
