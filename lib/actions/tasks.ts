'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'

const adminClient = getAdminClient()

export async function createOneTask(formData: {
    project_id: string
    task_name: string
    task_category?: string | null
    task_unit?: string | null
    wbs?: string | null
    description?: string | null
    start_date?: string | null
    end_date?: string | null
    status?: string | null
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const task_id = `TASK-${Date.now()}`

    const { error } = await adminClient
        .from('tasks')
        .insert({
            task_id,
            ...formData,
            status: formData.status || 'Chờ thực hiện'
        })

    if (error) throw error
    revalidatePath('/dashboard/projects')
}

export async function updateOneTask(taskId: string, formData: {
    task_name?: string
    task_category?: string | null
    task_unit?: string | null
    wbs?: string | null
    description?: string | null
    start_date?: string | null
    end_date?: string | null
    status?: string | null
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await adminClient
        .from('tasks')
        .update(formData)
        .eq('task_id', taskId)

    if (error) throw error
    revalidatePath('/dashboard/projects')
}

export async function deleteOneTask(taskId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await adminClient
        .from('tasks')
        .delete()
        .eq('task_id', taskId)

    if (error) throw error
    revalidatePath('/dashboard/projects')
}

/**
 * Get tasks with server-side pagination and filtering
 */
export async function getTasks(
    projectId?: string | null,
    page: number = 1,
    pageSize: number = 20,
    searchTerm?: string,
    categoryFilter?: string,
    statusFilter?: string,
    projectFilter?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Calculate offset
    const offset = (page - 1) * pageSize

    // Build query with count
    let query = adminClient
        .from('tasks')
        .select(`
            *,
            projects (
                project_name
            )
        `, { count: 'exact' })

    // Apply filters
    if (projectId) {
        query = query.eq('project_id', projectId)
    }

    if (searchTerm && searchTerm.trim()) {
        query = query.or(`task_name.ilike.%${searchTerm}%,task_id.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('task_category', categoryFilter)
    }

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
    }

    if (projectFilter && projectFilter !== 'all') {
        query = query.eq('project_id', projectFilter)
    }

    // Apply sorting
    query = query.order('created_at', { ascending: false })

    // Apply pagination (0 means get all)
    if (pageSize > 0) {
        query = query.range(offset, offset + pageSize - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { data: data || [], count: count || 0 }
}

/**
 * Get all tasks without pagination (for export)
 */
export async function getAllTasks(projectId?: string | null) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const BATCH_SIZE = 1000
    let allTasks: any[] = []
    let offset = 0
    let hasMore = true

    while (hasMore) {
        let query = adminClient
            .from('tasks')
            .select(`
                *,
                projects (
                    project_name
                )
            `)
            .range(offset, offset + BATCH_SIZE - 1)
            .order('created_at', { ascending: false })

        if (projectId) {
            query = query.eq('project_id', projectId)
        }

        const { data, error } = await query

        if (error) throw error

        if (data && data.length > 0) {
            allTasks = [...allTasks, ...data]
            if (data.length < BATCH_SIZE) {
                hasMore = false
            } else {
                offset += BATCH_SIZE
            }
        } else {
            hasMore = false
        }
    }
    return allTasks
}

export async function getProjects() {
    const { data, error } = await adminClient
        .from('projects')
        .select('project_id, project_name')
        .order('project_name')

    if (error) throw error
    return data
}

/**
 * Get tasks by project (for project detail page)
 */
export async function getTasksByProject(projectId: string) {
    return getTasks(projectId, 1, 20)
}

/**
 * Get tasks filtered by category
 */
export async function getTasksByCategory(category: string) {
    const { data, error } = await adminClient
        .from('tasks')
        .select('task_id, task_name, task_category, description')
        .eq('task_category', category)
        .order('task_name')

    if (error) throw error
    return data
}

export async function createTasks(tasks: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const dataToInsert = tasks.map(t => ({
        task_id: `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...t,
        status: t.status || 'Chờ thực hiện'
    }))

    const { error } = await adminClient
        .from('tasks')
        .insert(dataToInsert)

    if (error) throw error
    revalidatePath('/dashboard/projects')
}
