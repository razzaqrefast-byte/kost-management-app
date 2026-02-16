'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createMaintenanceRequest(formData: FormData) {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Get Input
    const propertyId = formData.get('propertyId') as string
    const roomId = formData.get('roomId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string

    if (!propertyId || !title) {
        return { error: 'Properti dan Judul wajib diisi' }
    }

    // 3. Insert Request
    const { error } = await supabase.from('maintenance_requests').insert({
        property_id: propertyId,
        room_id: roomId || null,
        reporter_id: user.id,
        title,
        description,
        image_url: imageUrl || null,
        status: 'open'
    })

    if (error) {
        console.error('Create Maintenance Error:', error)
        return { error: 'Gagal membuat laporan: ' + error.message }
    }

    revalidatePath('/tenant/maintenance')
    redirect('/tenant/maintenance')
}

export async function updateMaintenanceStatus(requestId: string, status: 'open' | 'in_progress' | 'resolved') {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Update Status
    // Security: Handled by RLS policy "Owners can update maintenance status"
    const { error } = await supabase
        .from('maintenance_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)

    if (error) {
        console.error('Update Maintenance Error:', error)
        return { error: 'Gagal memperbarui status: ' + error.message }
    }

    revalidatePath('/owner/maintenance')
    revalidatePath('/tenant/maintenance')
    return { success: true }
}
