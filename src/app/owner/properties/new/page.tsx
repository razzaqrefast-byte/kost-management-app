'use client'

import { createProperty } from '../actions'
import { useState } from 'react'
import PropertyForm from '@/components/PropertyForm'

export default function NewPropertyPage() {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await createProperty(formData)
        setLoading(false)
        return result
    }

    return (
        <PropertyForm
            onSubmit={handleSubmit}
            loading={loading}
            title="Tambah Kost Baru"
            buttonText="Simpan Kost"
        />
    )
}
