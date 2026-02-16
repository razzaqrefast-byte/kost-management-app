'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createBooking(roomId: string, formData: FormData) {
    const supabase = await createClient()

    // 1. Get current user & profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Anda harus login untuk melakukan booking.' }
    }

    // 2. Extract form data
    const startDate = formData.get('startDate') as string
    const durationMonths = parseInt(formData.get('duration') as string)

    if (!startDate || isNaN(durationMonths)) {
        return { error: 'Data booking tidak lengkap.' }
    }

    // 3. Fetch room price
    const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('price_monthly, property_id')
        .eq('id', roomId)
        .single()

    if (roomError || !room) {
        return { error: 'Kamar tidak ditemukan.' }
    }

    // 4. Calculate total price and end date
    const totalPrice = Number(room.price_monthly) * durationMonths

    // Simple end date calculation (adding months)
    const start = new Date(startDate)
    const end = new Date(start)
    end.setMonth(start.getMonth() + durationMonths)
    const endDate = end.toISOString().split('T')[0]

    // 5. Insert booking
    const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
            room_id: roomId,
            tenant_id: user.id,
            start_date: startDate,
            end_date: endDate,
            total_price: totalPrice,
            status: 'pending'
        })

    if (bookingError) {
        return { error: `Gagal membuat booking: ${bookingError.message}` }
    }

    revalidatePath('/tenant/bookings')
    revalidatePath(`/tenant/properties/${room.property_id}`)

    redirect('/tenant/bookings')
}
