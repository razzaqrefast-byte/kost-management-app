'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitPayment(bookingId: string, formData: FormData) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Anda harus login untuk mengakses fitur ini.' }
    }

    // 2. Verify booking belongs to user and is active
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('id, tenant_id, status, total_price')
        .eq('id', bookingId)
        .eq('tenant_id', user.id)
        .single()

    if (bookingError || !booking) {
        return { error: 'Booking tidak ditemukan.' }
    }

    if (!['approved', 'active'].includes(booking.status)) {
        return { error: 'Booking belum disetujui atau sudah tidak aktif.' }
    }

    // 3. Extract form data
    const amount = parseFloat(formData.get('amount') as string)
    const periodMonth = parseInt(formData.get('periodMonth') as string)
    const periodYear = parseInt(formData.get('periodYear') as string)
    const notes = formData.get('notes') as string
    const proofFile = formData.get('proofFile') as File

    if (!amount || !periodMonth || !periodYear) {
        return { error: 'Data pembayaran tidak lengkap.' }
    }

    // 4. Check if payment for this period already exists
    const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('period_month', periodMonth)
        .eq('period_year', periodYear)
        .single()

    if (existingPayment) {
        return { error: 'Pembayaran untuk periode ini sudah pernah disubmit.' }
    }

    // 5. Upload proof file if provided
    let proofUrl = ''
    if (proofFile && proofFile.size > 0) {
        const fileExt = proofFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('payment-proofs')
            .upload(filePath, proofFile)

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return { error: 'Gagal mengunggah bukti pembayaran: ' + uploadError.message }
        }

        proofUrl = filePath
    }

    // 6. Insert payment record
    const { error: insertError } = await supabase
        .from('payments')
        .insert({
            booking_id: bookingId,
            amount: amount,
            period_month: periodMonth,
            period_year: periodYear,
            proof_url: proofUrl || null,
            notes: notes || null,
            status: 'pending'
        })

    if (insertError) {
        console.error('Insert payment error:', insertError)
        return { error: 'Gagal menyimpan data pembayaran: ' + insertError.message }
    }

    revalidatePath('/tenant/payments')
    return { success: true }
}

export async function getMyPayments() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { payments: [] }

    const { data: payments } = await supabase
        .from('payments')
        .select(`
            *,
            bookings(
                id,
                rooms(
                    name,
                    properties(name)
                )
            )
        `)
        .order('created_at', { ascending: false })

    // Filter for user's bookings
    const myPayments = payments?.filter((p: any) => {
        return p.bookings?.id
    }) || []

    return { payments: myPayments }
}

export async function getMyActiveBookings() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { bookings: [] }

    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            *,
            rooms(
                name,
                price_monthly,
                properties(name)
            )
        `)
        .eq('tenant_id', user.id)
        .in('status', ['approved', 'active'])
        .order('created_at', { ascending: false })

    return { bookings: bookings || [] }
}
