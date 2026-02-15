'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

/**
 * Get resources with server-side pagination and filtering
 */
export async function getResources(
    projectId?: string | null,
    page: number = 1,
    pageSize: number = 20,
    searchTerm?: string,
    groupFilter?: string,
    projectFilter?: string,
    sortBy: string = 'resource_name',
    sortDirection: 'asc' | 'desc' = 'asc'
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Calculate offset
    const offset = (page - 1) * pageSize

    // Build query with count
    let query = adminClient
        .from('resources')
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
        query = query.or(`resource_name.ilike.%${searchTerm}%,resource_id.ilike.%${searchTerm}%`)
    }

    if (groupFilter && groupFilter !== 'all') {
        query = query.eq('group_name', groupFilter)
    }

    if (projectFilter && projectFilter !== 'all') {
        if (projectFilter === 'shared') {
            query = query.is('project_id', null)
        } else {
            query = query.eq('project_id', projectFilter)
        }
    }

    // Apply sorting
    if (sortBy === 'project_name') {
        // Special case for project name which is a joined field
        query = query.order('project_name', { foreignTable: 'projects', ascending: sortDirection === 'asc', nullsFirst: false })
    } else {
        query = query.order(sortBy, { ascending: sortDirection === 'asc', nullsFirst: false })
    }

    // Apply pagination (0 means get all)
    if (pageSize > 0) {
        query = query.range(offset, offset + pageSize - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { data: data || [], count: count || 0 }
}

/**
 * Get all resources without pagination (for export)
 * Note: Supabase has a default limit of 1000 rows, so we explicitly set a higher limit
 */
export async function getAllResources(
    projectId?: string | null,
    sortBy: string = 'resource_name',
    sortDirection: 'asc' | 'desc' = 'asc'
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const BATCH_SIZE = 1000
    let allResources: any[] = []
    let offset = 0
    let hasMore = true

    console.log('[getAllResources] Starting to fetch all resources...')

    while (hasMore) {
        let query = adminClient
            .from('resources')
            .select(`
                *,
                projects (
                    project_name
                )
            `)
            .range(offset, offset + BATCH_SIZE - 1)

        if (sortBy === 'project_name') {
            query = query.order('project_name', { foreignTable: 'projects', ascending: sortDirection === 'asc', nullsFirst: false })
        } else {
            query = query.order(sortBy, { ascending: sortDirection === 'asc', nullsFirst: false })
        }

        if (projectId) {
            query = query.eq('project_id', projectId)
        }

        const { data, error } = await query

        if (error) throw error

        if (data && data.length > 0) {
            allResources = [...allResources, ...data]
            console.log(`[getAllResources] Fetched batch: ${data.length} resources (total so far: ${allResources.length})`)

            // If we got less than BATCH_SIZE, we've reached the end
            if (data.length < BATCH_SIZE) {
                hasMore = false
            } else {
                offset += BATCH_SIZE
            }
        } else {
            hasMore = false
        }
    }

    console.log(`[getAllResources] ✅ Completed! Total fetched: ${allResources.length} resources`)
    return allResources
}
/**
 * Get resources by project (for project detail page)
 * Returns paginated result with total count
 */
export async function getResourcesByProject(projectId: string) {
    return getResources(projectId, 1, 20)
}

/**
 * Search resources by name or ID
 * Used for material code autocomplete in PYC dialog
 */
export async function searchResources(query: string) {
    if (!query || query.length < 2) return []

    const { data, error } = await adminClient
        .from('resources')
        .select('resource_id, resource_name, unit, unit_price')
        .or(`resource_name.ilike.%${query}%,resource_id.ilike.%${query}%`)
        .limit(20)
        .order('resource_name')

    if (error) throw error
    return data
}


export async function createResource(formData: {
    resource_id: string
    resource_name: string
    group_name?: string | null
    unit?: string | null
    start_date?: string | null
    end_date?: string | null
    manager?: string | null
    priority?: string | null
    status?: string | null
    notes?: string | null
    quantity_in?: number | string | null
    quantity_out?: number | string | null
    quantity_balance?: number | string | null
    project_id?: string | null
    unit_price?: number | string | null
    documents?: { name: string; description: string; url: string }[] | null
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Sanitize data: empty strings to null
    const insertData = {
        resource_id: formData.resource_id,
        resource_name: formData.resource_name,
        group_name: formData.group_name || null,
        unit: formData.unit || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        manager: formData.manager || null,
        priority: formData.priority || null,
        status: formData.status || 'Hoạt động',
        notes: formData.notes || null,
        quantity_in: formData.quantity_in ? Number(formData.quantity_in) : 0,
        quantity_out: formData.quantity_out ? Number(formData.quantity_out) : 0,
        quantity_balance: formData.quantity_balance ? Number(formData.quantity_balance) : 0,
        project_id: formData.project_id || null,
        unit_price: formData.unit_price ? Number(formData.unit_price) : 0,
        documents: formData.documents || null,
        created_at: new Date().toISOString()
    }

    const { error } = await adminClient
        .from('resources')
        .insert(insertData)

    if (error) {
        console.error('Error in createResource:', error)
        throw error
    }
    revalidatePath('/dashboard/resources')
}

export async function updateResource(resourceId: string, formData: {
    resource_name?: string
    group_name?: string | null
    unit?: string | null
    start_date?: string | null
    end_date?: string | null
    manager?: string | null
    priority?: string | null
    status?: string | null
    notes?: string | null
    quantity_in?: number | string | null
    quantity_out?: number | string | null
    quantity_balance?: number | string | null
    project_id?: string | null
    unit_price?: number | string | null
    documents?: { name: string; description: string; url: string }[] | null
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Sanitize data: empty strings to null
    const updateData: any = { ...formData }

    // Convert empty strings to null for specific fields
    const fieldsToSanitize = [
        'group_name', 'unit', 'start_date', 'end_date',
        'manager', 'priority', 'status', 'notes', 'project_id'
    ]

    fieldsToSanitize.forEach(field => {
        if (updateData[field] === "") {
            updateData[field] = null
        }
    })

    if (updateData.unit_price !== undefined) {
        updateData.unit_price = updateData.unit_price ? Number(updateData.unit_price) : 0
    }

    const { error } = await adminClient
        .from('resources')
        .update(updateData)
        .eq('resource_id', resourceId)

    if (error) {
        console.error('Error in updateResource:', error)
        throw error
    }
    revalidatePath('/dashboard/resources')
}

export async function deleteResource(resourceId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await adminClient
        .from('resources')
        .delete()
        .eq('resource_id', resourceId)

    if (error) throw error
    revalidatePath('/dashboard/resources')
}

export async function deleteResources(resourceIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await adminClient
        .from('resources')
        .delete()
        .in('resource_id', resourceIds)

    if (error) throw error
    revalidatePath('/dashboard/resources')
}

export async function createResources(resources: {
    resource_id: string
    resource_name: string
    group_name?: string | null
    unit?: string | null
    start_date?: string | null
    end_date?: string | null
    manager?: string | null
    priority?: string | null
    status?: string | null
    notes?: string | null
    quantity_in?: number | string | null
    quantity_out?: number | string | null
    quantity_balance?: number | string | null
    project_id?: string | null
    unit_price?: number | string | null
}[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const insertData = resources.map(r => ({
        resource_id: r.resource_id,
        resource_name: r.resource_name,
        group_name: r.group_name || null,
        unit: r.unit || null,
        start_date: r.start_date || null,
        end_date: r.end_date || null,
        manager: r.manager || null,
        priority: r.priority || null,
        status: r.status || 'Hoạt động',
        notes: r.notes || null,
        quantity_in: r.quantity_in ? Number(r.quantity_in) : 0,
        quantity_out: r.quantity_out ? Number(r.quantity_out) : 0,
        quantity_balance: r.quantity_balance ? Number(r.quantity_balance) : 0,
        project_id: r.project_id || null,
        unit_price: r.unit_price ? Number(r.unit_price) : 0,
        created_at: new Date().toISOString()
    }))

    const { error } = await adminClient
        .from('resources')
        .insert(insertData)

    if (error) throw error
    revalidatePath('/dashboard/resources')
}
