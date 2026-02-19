'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(formData: FormData) {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Get Input
    const bookingId = formData.get('bookingId') as string
    const rating = parseInt(formData.get('rating') as string)
    const comment = formData.get('comment') as string
    const propertyId = formData.get('propertyId') as string

    if (!bookingId || !rating || !propertyId) {
        return { error: 'Data review tidak lengkap' }
    }

    if (rating < 1 || rating > 5) {
        return { error: 'Rating harus antara 1 sampai 5 bintang' }
    }

    // 3. Insert Review
    const { error } = await supabase
        .from('reviews')
        .insert({
            booking_id: bookingId,
            tenant_id: user.id,
            property_id: propertyId,
            rating,
            comment
        })

    if (error) {
        console.error('Submit Review Error:', error)
        if (error.code === '23505') {
            return { error: 'Anda sudah memberikan ulasan untuk booking ini' }
        }
        return { error: 'Gagal mengirim ulasan: ' + error.message }
    }

    // 4. Revalidate
    revalidatePath(`/tenant/bookings/${bookingId}`)
    revalidatePath(`/tenant/bookings`)
    revalidatePath(`/`) // Assuming public home shows ratings

    return { success: true }
}
