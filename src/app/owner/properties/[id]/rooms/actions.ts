'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createRoom(propertyId: string, formData: FormData) {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 2. Validate Owner (Optional but good for security, though RLS handles it)
    // We rely on RLS policy: "Owners can insert rooms ... EXISTS ..."

    // 3. Get Input
    const name = formData.get('name') as string
    const price = formData.get('price') as string
    const imageUrl = formData.get('imageUrl') as string

    // Facilities handling
    const facilitiesRaw = formData.get('facilities') as string
    const facilities = facilitiesRaw ? facilitiesRaw.split(',').map(f => f.trim()) : []

    if (!name || !price) {
        return { error: 'Nama kamar dan harga wajib diisi' }
    }

    // 4. Insert Room
    const { error } = await supabase.from('rooms').insert({
        property_id: propertyId,
        name: name,
        price_monthly: price,
        facilities: facilities,
        images: imageUrl ? [imageUrl] : [],
        is_occupied: false
    })

    if (error) {
        console.error('Create Room Error:', error)
        return { error: 'Gagal menambahkan kamar: ' + error.message }
    }

    // 5. Redirect
    revalidatePath(`/owner/properties/${propertyId}`)
    redirect(`/owner/properties/${propertyId}`)
}

export async function updateRoom(propertyId: string, roomId: string, formData: FormData) {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Get Input
    const name = formData.get('name') as string
    const price = formData.get('price') as string
    const isOccupied = formData.get('isOccupied') === 'on'
    const imageUrl = formData.get('imageUrl') as string
    const facilitiesRaw = formData.get('facilities') as string
    const facilities = facilitiesRaw ? facilitiesRaw.split(',').map(f => f.trim()) : []

    if (!name || !price) {
        return { error: 'Nama kamar dan harga wajib diisi' }
    }

    // 3. Update Room
    const { error } = await supabase
        .from('rooms')
        .update({
            name: name,
            price_monthly: price,
            facilities: facilities,
            is_occupied: isOccupied,
            images: imageUrl ? [imageUrl] : []
        })
        .eq('id', roomId)
        .eq('property_id', propertyId)

    if (error) {
        return { error: 'Gagal memperbarui kamar: ' + error.message }
    }

    revalidatePath(`/owner/properties/${propertyId}`)
    redirect(`/owner/properties/${propertyId}`)
}

export async function deleteRoom(propertyId: string, roomId: string) {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Delete Room
    const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)
        .eq('property_id', propertyId)

    if (error) {
        return { error: 'Gagal menghapus kamar: ' + error.message }
    }

    revalidatePath(`/owner/properties/${propertyId}`)
    redirect(`/owner/properties/${propertyId}`)
}
