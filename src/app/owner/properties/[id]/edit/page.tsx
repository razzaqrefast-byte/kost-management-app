'use client'

import { updateProperty } from '../../actions'
import { useState, useEffect, use } from 'react'
import PropertyForm from '@/components/PropertyForm'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [property, setProperty] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        async function fetchProperty() {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                setError('Properti tidak ditemukan.')
            } else {
                setProperty(data)
            }
            setFetching(false)
        }

        fetchProperty()
    }, [id])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await updateProperty(id, formData)
        setLoading(false)
        return result
    }

    if (fetching) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error || !property) {
        return (
            <div className="max-w-2xl mx-auto py-8 px-4 text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Oops!</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{error || 'Gagal memuat data properti.'}</p>
                <button
                    onClick={() => router.push('/owner/properties')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                >
                    Kembali
                </button>
            </div>
        )
    }

    return (
        <PropertyForm
            initialData={property}
            onSubmit={handleSubmit}
            loading={loading}
            title="Edit Kost"
            buttonText="Simpan Perubahan"
        />
    )
}
