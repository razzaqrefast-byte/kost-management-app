'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Get Input
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const avatarFile = formData.get('avatarFile') as File
    const currentAvatarUrl = formData.get('currentAvatarUrl') as string

    if (!fullName) {
        return { error: 'Nama Lengkap wajib diisi' }
    }

    let avatarPath = currentAvatarUrl

    // 3. Handle Avatar Upload if exists
    if (avatarFile && avatarFile.size > 0) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        // Upload new avatar
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile)

        if (uploadError) {
            console.error('Upload Avatar Error:', uploadError)
            return { error: 'Gagal mengunggah foto profil: ' + uploadError.message }
        }

        // Delete old avatar if it exists and is in our storage
        if (currentAvatarUrl && !currentAvatarUrl.startsWith('http')) {
            await supabase.storage.from('avatars').remove([currentAvatarUrl])
        }

        avatarPath = filePath
    }

    // 4. Update Profile
    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            phone: phone,
            avatar_url: avatarPath,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        console.error('Update Profile Error:', error)
        return { error: 'Gagal memperbarui profil: ' + error.message }
    }

    revalidatePath('/tenant/profile')
    revalidatePath('/owner/profile')
    revalidatePath('/', 'layout')

    return { success: true }
}
