'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'

const adminClient = getAdminClient()

/**
 * Get personnel with server-side pagination and filtering
 */
export async function getPersonnel(
    projectId?: string | null,
    page: number = 1,
    pageSize: number = 20,
    searchTerm?: string,
    departmentFilter?: string,
    accessLevelFilter?: number,
    statusFilter?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Calculate offset
    const offset = (page - 1) * pageSize

    // Build query with count
    let query = adminClient
        .from('users')
        .select('*', { count: 'exact' })

    // Apply filters
    if (projectId) {
        query = query.contains('project_ids', [projectId])
    }

    if (searchTerm && searchTerm.trim()) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    }

    if (departmentFilter && departmentFilter !== 'all') {
        query = query.eq('department', departmentFilter)
    }

    if (accessLevelFilter && accessLevelFilter !== 0) {
        query = query.eq('access_level', accessLevelFilter)
    }

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('work_status', statusFilter)
    }

    // Apply sorting
    query = query.order('full_name')

    // Apply pagination (0 means get all)
    if (pageSize > 0) {
        query = query.range(offset, offset + pageSize - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { data: data || [], count: count || 0 }
}

/**
 * Get all personnel without pagination (for export)
 * Note: Supabase has a hard limit of 1000 rows per query, so we use pagination to fetch all data
 */
export async function getAllPersonnel(projectId?: string | null) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const BATCH_SIZE = 1000
    let allPersonnel: any[] = []
    let offset = 0
    let hasMore = true



    while (hasMore) {
        let query = adminClient
            .from('users')
            .select('*')
            .range(offset, offset + BATCH_SIZE - 1)
            .order('full_name')

        if (projectId) {
            query = query.contains('project_ids', [projectId])
        }

        const { data, error } = await query

        if (error) throw error

        if (data && data.length > 0) {
            allPersonnel = [...allPersonnel, ...data]


            if (data.length < BATCH_SIZE) {
                hasMore = false
            } else {
                offset += BATCH_SIZE
            }
        } else {
            hasMore = false
        }
    }


    return allPersonnel
}

/**
 * Legacy function for backward compatibility
 */
export async function getPersonnelList() {
    const result = await getPersonnel(null, 1, 1000)
    return result.data
}

/**
 * Get personnel by project (for project detail page)
 * Returns paginated result with total count
 */
export async function getPersonnelByProject(projectId: string) {
    return getPersonnel(projectId, 1, 20)
}

/**
 * Create personnel in bulk (for Excel import)
 */
export async function createPersonnelBulk(personnel: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const dataToInsert = personnel.map(p => ({
        ...p,
        created_at: new Date().toISOString()
    }))

    const { error } = await adminClient
        .from('users')
        .insert(dataToInsert)

    if (error) throw error
    revalidatePath('/dashboard/personnel')
}

export async function createPersonnel(formData: any) {
    // Note: Creating a user here only adds them to the public.users table.
    // In a real app, you might also want to invite them via Supabase Auth.
    const { error } = await adminClient
        .from('users')
        .insert({
            ...formData,
            created_at: new Date().toISOString()
        })

    if (error) throw error
    revalidatePath('/dashboard/personnel')
}

export async function updatePersonnel(email: string, formData: any) {
    const { error } = await adminClient
        .from('users')
        .update(formData)
        .eq('email', email)

    if (error) {
        console.error('Supabase Error Details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
        })
        throw error
    }
    revalidatePath('/dashboard/personnel')
    revalidatePath('/dashboard/projects') // Projects often fetch users
    revalidatePath('/dashboard/resources')
}

export async function deletePersonnel(email: string) {
    const { error } = await adminClient
        .from('users')
        .delete()
        .eq('email', email)

    if (error) throw error
    revalidatePath('/dashboard/personnel')
}
