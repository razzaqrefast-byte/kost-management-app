'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleWishlist(propertyId: string) {
    const supabase = await createClient()

    // 1. Check user auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized to manage wishlist', isSaved: false }
    }

    // 2. Check if already in wishlist
    const { data: existingWishlist, error: checkError } = await supabase
        .from('wishlists')
        .select('id')
        .eq('tenant_id', user.id)
        .eq('property_id', propertyId)
        .single()

    // It's normal for it to return no rows if it's not saved
    if (checkError && checkError.code !== 'PGRST116') {
        console.error('Check wishlist error:', checkError)
        return { error: 'Gagal mengecek status wishlist', isSaved: false }
    }

    let isSaved = false;

    try {
        if (existingWishlist) {
            // 3. If exists, remove it (Unsave)
            const { error: deleteError } = await supabase
                .from('wishlists')
                .delete()
                .eq('id', existingWishlist.id)

            if (deleteError) throw deleteError
            isSaved = false
        } else {
            // 4. If doesn't exist, add it (Save)
            const { error: insertError } = await supabase
                .from('wishlists')
                .insert({
                    tenant_id: user.id,
                    property_id: propertyId
                })

            if (insertError) throw insertError
            isSaved = true
        }

        revalidatePath('/tenant/properties')
        revalidatePath(`/tenant/properties/${propertyId}`)
        revalidatePath('/tenant/wishlist')

        return { success: true, isSaved }

    } catch (err: any) {
        console.error('Toggle wishlist error:', err)
        return { error: 'Gagal memperbarui wishlist', isSaved: existingWishlist ? true : false }
    }
}

export async function getWishlistStatus(propertyId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
        .from('wishlists')
        .select('id')
        .eq('tenant_id', user.id)
        .eq('property_id', propertyId)
        .single()

    return !!data
}
