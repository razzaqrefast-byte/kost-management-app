'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBookingStatus(
    bookingId: string,
    status: 'approved' | 'cancelled',
    rejectionReason?: string
) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Anda harus login.' }
    }

    // 2. Fetch booking and check ownership via property
    const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select(`
            id,
            room_id,
            rooms (
                property_id,
                properties (
                    owner_id
                )
            )
        `)
        .eq('id', bookingId)
        .single()

    if (fetchError || !booking) {
        return { error: 'Booking tidak ditemukan.' }
    }

    // Check if user is the owner
    const isOwner = (booking.rooms as any).properties.owner_id === user.id
    if (!isOwner) {
        return { error: 'Anda tidak memiliki akses ke booking ini.' }
    }

    // 3. Update booking status
    const updateData: any = { status }
    if (status === 'cancelled' && rejectionReason) {
        updateData.rejection_reason = rejectionReason
    }

    const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single()

    if (updateError) {
        console.error('Update booking error:', updateError)
        return { error: 'Gagal merubah status booking di database.' }
    }

    if (!updatedBooking) {
        return { error: 'Gagal memperbarui booking: Tidak ada data yang berubah.' }
    }

    // 4. If approved, mark room as occupied
    if (status === 'approved') {
        const { error: roomError } = await supabase
            .from('rooms')
            .update({ is_occupied: true })
            .eq('id', booking.room_id)

        if (roomError) {
            console.error('Update room error:', roomError)
            // Still proceed as status is updated
        }
    }

    revalidatePath('/owner/bookings')
    revalidatePath('/tenant/bookings')
    revalidatePath('/owner', 'layout')

    return { success: true }
}
