'use server'

import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function uploadImage(file: File, bucket: 'property-images' | 'room-images') {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 2. Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // 3. Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

    if (error) {
        throw new Error('Gagal mengunggah gambar: ' + error.message)
    }

    // 4. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

    return publicUrl
}
