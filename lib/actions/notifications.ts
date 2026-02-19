'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getNotifications() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()



    if (!user?.email) {

        return []
    }

    try {
        // Use admin client to bypass RLS
        const { getAdminClient } = await import('@/lib/supabase/admin')
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
            .from('notifications')
            .select('*')
            .eq('user_id', user.email)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[getNotifications] Supabase error:', error)
            throw error
        }



        return data || []
    } catch (error) {
        console.error('[getNotifications] Failed to fetch notifications:', error)
        return []
    }
}

export async function getUnreadCount() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
        return 0
    }

    try {
        const { getAdminClient } = await import('@/lib/supabase/admin')
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
            .from('notifications')
            .select('*', { count: 'exact', head: false })
            .eq('user_id', user.email)
            .eq('is_read', false)

        if (error) throw error
        return data?.length || 0
    } catch (error) {
        console.error('Failed to fetch unread count:', error)
        return 0
    }
}

export async function markAsRead(id: string) {
    try {
        const { getAdminClient } = await import('@/lib/supabase/admin')
        const adminClient = getAdminClient()

        const { error } = await adminClient
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (error) throw error
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Failed to mark notification as read:', error)
        return { success: false, error }
    }
}

export async function markAllAsRead() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
        return { success: false, error: 'User not found' }
    }

    try {
        const { getAdminClient } = await import('@/lib/supabase/admin')
        const adminClient = getAdminClient()

        const { error } = await adminClient
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.email)
            .eq('is_read', false)

        if (error) throw error
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Failed to mark all as read:', error)
        return { success: false, error }
    }
}

export async function createNotification(data: {
    userId: string
    title: string
    message: string
    type?: 'info' | 'success' | 'warning' | 'error'
    link?: string
}) {
    try {
        const { getAdminClient } = await import('@/lib/supabase/admin')
        const adminClient = getAdminClient()

        const { error } = await adminClient
            .from('notifications')
            .insert({
                user_id: data.userId,
                title: data.title,
                message: data.message,
                type: data.type || 'info',
                link: data.link,
            })

        if (error) throw error
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Failed to create notification:', error)
        return { success: false, error }
    }
}

export async function deleteNotification(id: string) {
    try {
        const { getAdminClient } = await import('@/lib/supabase/admin')
        const adminClient = getAdminClient()

        const { error } = await adminClient
            .from('notifications')
            .delete()
            .eq('id', id)

        if (error) throw error
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete notification:', error)
        return { success: false, error }
    }
}

export async function markMultipleAsRead(ids: string[]) {
    try {
        const { getAdminClient } = await import('@/lib/supabase/admin')
        const adminClient = getAdminClient()

        const { error } = await adminClient
            .from('notifications')
            .update({ is_read: true })
            .in('id', ids)

        if (error) throw error
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Failed to mark multiple notifications as read:', error)
        return { success: false, error }
    }
}

