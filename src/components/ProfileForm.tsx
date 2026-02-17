'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { useRouter } from 'next/navigation'

interface ProfileFormProps {
    initialProfile: {
        full_name: string | null
        phone: string | null
        avatar_url: string | null
        email: string
    }
    signedAvatarUrl?: string | null
}

export default function ProfileForm({ initialProfile, signedAvatarUrl }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(signedAvatarUrl || null)
    const router = useRouter()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        setSuccess(false)

        const result = await updateProfile(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
            router.refresh()
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
            <input type="hidden" name="currentAvatarUrl" value={initialProfile.avatar_url || ''} />

            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-8">
                <div className="relative group">
                    <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white dark:border-gray-700 shadow-lg">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600">
                                <span className="text-4xl font-bold">{initialProfile.full_name?.charAt(0) || initialProfile.email.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                    <label htmlFor="avatarFile" className="absolute bottom-0 right-0 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 shadow-md transition-all">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                            type="file"
                            id="avatarFile"
                            name="avatarFile"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>

                <div className="flex-1 text-center sm:text-left pt-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{initialProfile.full_name || 'User'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{initialProfile.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div className="sm:col-span-2">
                    <label htmlFor="fullName" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                        Nama Lengkap
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        defaultValue={initialProfile.full_name || ''}
                        required
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                        Nomor WhatsApp
                    </label>
                    <input
                        type="text"
                        name="phone"
                        id="phone"
                        defaultValue={initialProfile.phone || ''}
                        placeholder="Contoh: 081234567890"
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">Profil berhasil diperbarui!</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-all"
                >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>
        </form>
    )
}
