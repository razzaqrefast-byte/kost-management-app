'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(bookingId: string, content: string) {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    if (!content.trim()) return { error: 'Pesan tidak boleh kosong' }

    // 2. Insert Message
    // Security: Handled by RLS policy "Users can insert messages for their bookings"
    const { error } = await supabase.from('messages').insert({
        booking_id: bookingId,
        sender_id: user.id,
        content: content.trim()
    })

    if (error) {
        console.error('Send Message Error:', error)
        return { error: 'Gagal mengirim pesan: ' + error.message }
    }

    revalidatePath(`/tenant/bookings/${bookingId}`)
    revalidatePath(`/owner/bookings/${bookingId}`)
    return { success: true }
}

export async function getMessages(bookingId: string) {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Fetch Messages
    // Security: Handled by RLS policy "Users can view messages for their bookings"
    const { data: messages, error } = await supabase
        .from('messages')
        .select(`
            *,
            sender:profiles(full_name, avatar_url)
        `)
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Fetch Messages Error:', error)
        return { error: 'Gagal mengambil pesan' }
    }

    return { messages }
}
