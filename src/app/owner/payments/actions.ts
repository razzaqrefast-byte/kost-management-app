'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/app/actions/notifications'

export async function verifyPayment(paymentId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Update payment status
    const { data: updatedPayment, error } = await supabase
        .from('payments')
        .update({
            status: 'verified',
            verified_by: user.id,
            verified_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select(`
            amount, period_month, period_year,
            bookings(
                tenant_id,
                rooms(
                    name,
                    properties(name)
                )
            )
        `)
        .single()

    if (error) {
        console.error('Verify payment error:', error)
        return { error: 'Gagal memverifikasi pembayaran: ' + error.message }
    }

    // Notify Tenant
    if (updatedPayment && updatedPayment.bookings) {
        const tenantId = (updatedPayment.bookings as any).tenant_id
        const roomName = (updatedPayment.bookings as any).rooms?.name
        const propertyName = (updatedPayment.bookings as any).rooms?.properties?.name
        const amountFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(updatedPayment.amount)

        await createNotification({
            userId: tenantId,
            title: 'Pembayaran Diterima ✅',
            message: `Pembayaran ${amountFormatted} untuk ${roomName} (${propertyName}) periode ${updatedPayment.period_month}/${updatedPayment.period_year} telah diverifikasi.`,
            link: '/tenant/payments'
        })
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

    const { data: updatedPayment, error } = await supabase
        .from('payments')
        .update({
            status: 'rejected',
            rejection_reason: reason,
            verified_by: user.id,
            verified_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select(`
            amount, period_month, period_year,
            bookings(
                tenant_id,
                rooms(
                    name,
                    properties(name)
                )
            )
        `)
        .single()

    if (error) {
        console.error('Reject payment error:', error)
        return { error: 'Gagal menolak pembayaran: ' + error.message }
    }

    // Notify Tenant
    if (updatedPayment && updatedPayment.bookings) {
        const tenantId = (updatedPayment.bookings as any).tenant_id
        const roomName = (updatedPayment.bookings as any).rooms?.name
        const propertyName = (updatedPayment.bookings as any).rooms?.properties?.name

        await createNotification({
            userId: tenantId,
            title: 'Pembayaran Ditolak ❌',
            message: `Pembayaran untuk ${roomName} (${propertyName}) periode ${updatedPayment.period_month}/${updatedPayment.period_year} ditolak. Alasan: ${reason}`,
            link: '/tenant/payments'
        })
    }

    revalidatePath('/owner/payments')
    return { success: true }
}

export async function getPropertyPayments(statusFilter?: string) {
    try {
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

        const { data: payments, error } = await query

        // If table doesn't exist yet, return empty array with error message
        if (error) {
            console.error('Get property payments error:', error)
            return { payments: [], error: 'Tabel pembayaran belum dibuat. Silakan jalankan setup_payments.sql di Supabase.' }
        }

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
    } catch (err) {
        console.error('Unexpected error in getPropertyPayments:', err)
        return { payments: [], error: 'Tabel pembayaran belum dibuat. Silakan jalankan setup_payments.sql di Supabase.' }
    }
}
