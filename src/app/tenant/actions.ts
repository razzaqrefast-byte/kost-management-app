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

export async function updateBookingBiodata(bookingId: string, formData: FormData) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Anda harus login untuk mengakses fitur ini.' }
    }

    // 2. Extract data
    const occupantName = formData.get('name') as string
    const occupantKtpNumber = formData.get('ktpNumber') as string
    const ktpFile = formData.get('ktpFile') as File

    if (!occupantName || !occupantKtpNumber) {
        return { error: 'Nama dan Nomor KTP wajib diisi.' }
    }

    let ktpUrl = ''
    if (ktpFile && ktpFile.size > 0) {
        // Generate unique filename
        const fileExt = ktpFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        // Upload to Supabase Storage - Use 'property-images' for now as it likely exists
        // In a real app, we'd use a private 'documents' bucket
        const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, ktpFile)

        if (uploadError) {
            console.error('Upload error:', uploadError)
            // Continue without URL or return error? Let's return error for KTP.
            return { error: 'Gagal mengunggah foto KTP: ' + uploadError.message }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath)

        ktpUrl = publicUrl
    }

    // 3. Update Booking
    const { error: updateError } = await supabase
        .from('bookings')
        .update({
            occupant_name: occupantName,
            occupant_ktp_number: occupantKtpNumber,
            occupant_ktp_url: ktpUrl || undefined
        })
        .eq('id', bookingId)
        .eq('tenant_id', user.id)

    if (updateError) {
        console.error('Update booking error:', updateError)
        return { error: 'Gagal menyimpan biodata.' }
    }

    revalidatePath('/tenant/bookings')
    return { success: true }
}
