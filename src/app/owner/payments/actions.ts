'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifyPayment(paymentId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Update payment status
    const { error } = await supabase
        .from('payments')
        .update({
            status: 'verified',
            verified_by: user.id,
            verified_at: new Date().toISOString()
        })
        .eq('id', paymentId)

    if (error) {
        console.error('Verify payment error:', error)
        return { error: 'Gagal memverifikasi pembayaran: ' + error.message }
    }

    revalidatePath('/owner/payments')
    return { success: true }
}

export async function rejectPayment(paymentId: string, reason: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    if (!reason) {
        return { error: 'Alasan penolakan wajib diisi.' }
    }

    const { error } = await supabase
        .from('payments')
        .update({
            status: 'rejected',
            rejection_reason: reason,
            verified_by: user.id,
            verified_at: new Date().toISOString()
        })
        .eq('id', paymentId)

    if (error) {
        console.error('Reject payment error:', error)
        return { error: 'Gagal menolak pembayaran: ' + error.message }
    }

    revalidatePath('/owner/payments')
    return { success: true }
}

export async function getPropertyPayments(statusFilter?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { payments: [] }

    let query = supabase
        .from('payments')
        .select(`
            *,
            bookings(
                id,
                tenant:profiles(full_name, phone),
                rooms(
                    name,
                    properties(
                        name,
                        owner_id
                    )
                )
            )
        `)
        .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
    }

    const { data: payments } = await query

    // Filter for owner's properties
    const ownerPayments = payments?.filter((p: any) => {
        return p.bookings?.rooms?.properties?.owner_id === user.id
    }) || []

    // Generate signed URLs for proof images
    const paymentsWithSignedUrls = await Promise.all(
        ownerPayments.map(async (payment: any) => {
            if (payment.proof_url && !payment.proof_url.startsWith('http')) {
                const { data } = await supabase.storage
                    .from('payment-proofs')
                    .createSignedUrl(payment.proof_url, 3600)

                return { ...payment, signed_proof_url: data?.signedUrl }
            }
            return { ...payment, signed_proof_url: payment.proof_url }
        })
    )

    return { payments: paymentsWithSignedUrls }
}
