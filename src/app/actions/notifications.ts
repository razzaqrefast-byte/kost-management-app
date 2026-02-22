'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createNotification({
    userId,
    title,
    message,
    link
}: {
    userId: string
    title: string
    message: string
    link?: string
}) {
    const supabase = await createClient()

    const { error } = await supabase.from('notifications').insert({
        user_id: userId,
        title,
        message,
        link
    })

    if (error) {
        console.error('Error creating notification:', error)
        return { error: error.message }
    }

    return { success: true }
}

export async function getNotifications(limit = 10) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [], error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

    return { data, error }
}

export async function getUnreadCount() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    if (error) {
        console.error('Error getting unread count:', error)
        return 0
    }

    return count || 0
}

export async function markAsRead(notificationId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error marking as read:', error)
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function markAllAsRead() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    if (error) {
        console.error('Error marking all as read:', error)
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}
