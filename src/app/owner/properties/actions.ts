'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProperty(formData: FormData) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 2. Validate input
    const name = formData.get('name') as string
    const address = formData.get('address') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string

    if (!name || !address) {
        return { error: 'Nama dan Alamat wajib diisi' }
    }

    // 3. Insert into Supabase
    const { error } = await supabase.from('properties').insert({
        owner_id: user.id,
        name,
        address,
        description,
        image_url: imageUrl || null
    })

    if (error) {
        return { error: 'Gagal menambahkan properti: ' + error.message }
    }

    // 4. Revalidate & Redirect
    revalidatePath('/owner/properties')
    redirect('/owner/properties')
}

export async function updateProperty(id: string, formData: FormData) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Validate input
    const name = formData.get('name') as string
    const address = formData.get('address') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string

    if (!name || !address) {
        return { error: 'Nama dan Alamat wajib diisi' }
    }

    // 3. Update in Supabase
    const { error } = await supabase
        .from('properties')
        .update({
            name,
            address,
            description,
            image_url: imageUrl || null
        })
        .eq('id', id)
        .eq('owner_id', user.id) // Ensure security

    if (error) {
        return { error: 'Gagal memperbarui properti: ' + error.message }
    }

    revalidatePath('/owner/properties')
    revalidatePath(`/owner/properties/${id}`)
    redirect(`/owner/properties/${id}`)
}

export async function deleteProperty(id: string) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Delete from Supabase
    const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id)

    if (error) {
        return { error: 'Gagal menghapus properti: ' + error.message }
    }

    revalidatePath('/owner/properties')
    redirect('/owner/properties')
}
