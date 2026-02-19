'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'

const adminClient = getAdminClient()

/**
 * PROJECT ITEMS (Hạng mục)
 */

export async function getProjectItems(projectId?: string) {
    let query = adminClient
        .from('project_items')
        .select(`
            *,
            project:projects(project_name)
        `)

    if (projectId) {
        query = query.eq('project_id', projectId)
    }

    const { data, error } = await query.order('wbs_code')
    if (error) throw error
    return data
}

export async function addProjectItem(data: any) {
    const { data: result, error } = await adminClient
        .from('project_items')
        .insert([data])
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard/project-items')
    return result
}

export async function updateProjectItem(id: string, data: any) {
    const { id: _id, created_at: _ca, project: _p, ...rest } = data
    const { data: result, error } = await adminClient
        .from('project_items')
        .update(rest)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard/project-items')
    return result
}

export async function deleteProjectItem(id: string) {
    const { error } = await adminClient
        .from('project_items')
        .delete()
        .eq('id', id)
    if (error) throw error
    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard/project-items')
    return true
}

export async function createProjectItemsBulk(items: any[]) {
    const { data: result, error } = await adminClient
        .from('project_items')
        .insert(items)
        .select()
    if (error) throw error
    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard/project-items')
    return result
}
export async function deleteProjectItemsBulk(ids: string[]) {
    const { error } = await adminClient
        .from('project_items')
        .delete()
        .in('id', ids)
    if (error) throw error
    revalidatePath('/dashboard/projects')
    revalidatePath('/dashboard/project-items')
    return true
}
