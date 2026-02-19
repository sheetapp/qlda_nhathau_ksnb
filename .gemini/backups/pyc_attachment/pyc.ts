'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'

const adminClient = getAdminClient()

export async function getPYCs() {
    const BATCH_SIZE = 1000
    let allPYCs: any[] = []
    let offset = 0
    let hasMore = true



    while (hasMore) {
        const { data, error } = await adminClient
            .from('pyc')
            .select(`
                *,
                projects (
                    project_name
                ),
                pyc_detail (*),
                author:users!created_by (
                    full_name,
                    avatar_url
                )
            `)
            .range(offset, offset + BATCH_SIZE - 1)
            .order('created_at', { ascending: false })

        if (error) throw error

        if (data && data.length > 0) {
            allPYCs = [...allPYCs, ...data]


            if (data.length < BATCH_SIZE) {
                hasMore = false
            } else {
                offset += BATCH_SIZE
            }
        } else {
            hasMore = false
        }
    }


    return allPYCs
}

export async function getPYCsByProject(projectId: string) {
    const BATCH_SIZE = 1000
    let allPYCs: any[] = []
    let offset = 0
    let hasMore = true



    while (hasMore) {
        const { data, error } = await adminClient
            .from('pyc')
            .select(`
                *,
                projects (
                    project_name
                ),
                pyc_detail (*),
                author:users!created_by (
                    full_name,
                    avatar_url
                )
            `)
            .eq('project_id', projectId)
            .range(offset, offset + BATCH_SIZE - 1)
            .order('created_at', { ascending: false })

        if (error) throw error

        if (data && data.length > 0) {
            allPYCs = [...allPYCs, ...data]


            if (data.length < BATCH_SIZE) {
                hasMore = false
            } else {
                offset += BATCH_SIZE
            }
        } else {
            hasMore = false
        }
    }


    return allPYCs
}

export async function getPYCDetails() {
    const { data, error } = await adminClient
        .from('pyc_detail')
        .select(`
            *,
            pyc(
                request_id,
                title,
                project_id,
                projects(
                    project_name
                )
            )
                `)
        .order('id', { ascending: false })

    if (error) throw error
    return data
}

export async function getPYCById(requestId: string) {
    const { data, error } = await adminClient
        .from('pyc')
        .select(`
            *,
            projects (
                project_name
            ),
            pyc_detail (*),
            author:users!created_by (
                full_name,
                avatar_url,
                department
            )
        `)
        .eq('request_id', requestId)
        .maybeSingle()

    if (error) throw error
    return data
}

export async function createPYC(
    headerData: {
        request_id: string
        title: string
        request_type?: string | null
        status?: string | null
        priority?: string | null
        project_id?: string | null
        task_category?: string | null
        muc_dich_sd?: string | null
        notes?: string | null
        attachments?: { name: string; description: string; url: string }[] | null
        vat_display?: string | null
        vat_value?: number | string | null
    },
    details: {
        item_name: string
        category?: string | null
        task_description?: string | null
        material_code?: string | null
        unit?: string | null
        quantity?: number | string | null
        unit_price?: number | string | null
        vat_status?: string | null
        vat_display?: string | null
        vat_value?: number | string | null
        muc_dich_sd?: string | null
        notes?: string | null
    }[]
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Calculated total
    const totalAmount = details.reduce((sum, item) => {
        const qty = Number(item.quantity || 0)
        const price = Number(item.unit_price || 0)
        return sum + (qty * price)
    }, 0)

    // 1. Insert/Upsert Header
    const { error: headerError } = await adminClient
        .from('pyc')
        .upsert({
            request_id: headerData.request_id,
            title: headerData.title,
            request_type: headerData.request_type || null,
            status: headerData.status || 'Chờ duyệt',
            priority: headerData.priority || 'Thường',
            project_id: headerData.project_id || null,
            task_category: headerData.task_category || null,
            muc_dich_sd: headerData.muc_dich_sd || null,
            notes: headerData.notes || null,
            attachments: headerData.attachments || null,
            vat_display: headerData.vat_display || null,
            vat_value: headerData.vat_value !== undefined ? Number(headerData.vat_value) : null,
            total_amount: totalAmount,
            created_by: user.email,
            created_at: new Date().toISOString(),
            approved_history: JSON.stringify([{
                status: headerData.status || 'Chờ duyệt',
                user: user.email,
                message: 'Khởi tạo phiếu',
                at: new Date().toISOString()
            }])
        }, { onConflict: 'request_id' })

    if (headerError) throw headerError

    // 2. Insert Details
    if (details.length > 0) {
        const detailsToInsert = details.map(item => {
            return {
                request_id: headerData.request_id,
                item_name: item.item_name,
                category: item.category || null,
                task_description: item.task_description || null,
                material_code: item.material_code || null,
                unit: item.unit || null,
                quantity: Number(item.quantity || 0),
                unit_price: Number(item.unit_price || 0),
                vat_display: item.vat_display || null,
                vat_value: item.vat_value !== undefined ? Number(item.vat_value) : null,
                muc_dich_sd: item.muc_dich_sd || null,
                notes: item.notes || null
                // line_total is a generated column in DB
            }
        })

        const { error: detailsError } = await adminClient
            .from('pyc_detail')
            .insert(detailsToInsert)

        if (detailsError) throw detailsError
    }

    revalidatePath('/dashboard/pyc')
}

export async function updatePYC(
    requestId: string,
    headerData: {
        title: string
        request_type?: string | null
        status?: string | null
        priority?: string | null
        project_id?: string | null
        task_category?: string | null
        muc_dich_sd?: string | null
        notes?: string | null
        attachments?: { name: string; description: string; url: string }[] | null
        vat_display?: string | null
        vat_value?: number | string | null
    },
    details: {
        id?: string // Existing items will have an ID
        item_name: string
        category?: string | null
        task_description?: string | null
        material_code?: string | null
        unit?: string | null
        quantity?: number | string | null
        unit_price?: number | string | null
        vat_status?: string | null
        vat_display?: string | null
        vat_value?: number | string | null
        muc_dich_sd?: string | null
        notes?: string | null
    }[]
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const totalAmount = details.reduce((sum, item) => {
        const qty = Number(item.quantity || 0)
        const price = Number(item.unit_price || 0)
        return sum + (qty * price)
    }, 0)

    // 1. Update Header
    const { data: pyc, error: fetchError } = await adminClient
        .from('pyc')
        .select('approved_history')
        .eq('request_id', requestId)
        .single()

    if (fetchError) throw fetchError

    let history = []
    try {
        history = typeof pyc.approved_history === 'string'
            ? JSON.parse(pyc.approved_history)
            : (pyc.approved_history || [])
    } catch (e) {
        history = []
    }

    history.push({
        status: headerData.status || 'Chờ duyệt',
        user: user.email,
        message: 'Cập nhật nội dung phiếu',
        at: new Date().toISOString()
    })

    const { error: headerError } = await adminClient
        .from('pyc')
        .update({
            title: headerData.title,
            request_type: headerData.request_type || null,
            status: headerData.status || null,
            priority: headerData.priority || null,
            project_id: headerData.project_id || null,
            task_category: headerData.task_category || null,
            muc_dich_sd: headerData.muc_dich_sd || null,
            notes: headerData.notes || null,
            attachments: headerData.attachments || null,
            vat_display: headerData.vat_display || null,
            vat_value: headerData.vat_value !== undefined ? Number(headerData.vat_value) : null,
            total_amount: totalAmount,
            approved_history: JSON.stringify(history)
        })
        .eq('request_id', requestId)

    if (headerError) throw headerError

    // 2. Sync Details (Delete then Re-insert is simplest for small lists, or handle updates/inserts/deletes)
    // For reliability with minimal code, we delete existing and re-insert
    const { error: deleteError } = await adminClient
        .from('pyc_detail')
        .delete()
        .eq('request_id', requestId)

    if (deleteError) throw deleteError

    if (details.length > 0) {
        const detailsToInsert = details.map(item => {
            return {
                request_id: requestId,
                item_name: item.item_name,
                category: item.category || null,
                task_description: item.task_description || null,
                material_code: item.material_code || null,
                unit: item.unit || null,
                quantity: Number(item.quantity || 0),
                unit_price: Number(item.unit_price || 0),
                vat_display: item.vat_display || null,
                vat_value: item.vat_value !== undefined ? Number(item.vat_value) : null,
                muc_dich_sd: item.muc_dich_sd || null,
                notes: item.notes || null
                // line_total is a generated column in DB
            }
        })

        const { error: detailsError } = await adminClient
            .from('pyc_detail')
            .insert(detailsToInsert)

        if (detailsError) throw detailsError
    }

    revalidatePath('/dashboard/pyc')
}

export async function deletePYC(requestId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // cascade delete handles pyc_detail if configured in DB
    const { error } = await adminClient
        .from('pyc')
        .delete()
        .eq('request_id', requestId)

    if (error) throw error
    revalidatePath('/dashboard/pyc')
    revalidatePath('/dashboard/projects/[id]', 'page')
}

export async function deletePYCs(requestIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await adminClient
        .from('pyc')
        .delete()
        .in('request_id', requestIds)

    if (error) throw error
    revalidatePath('/dashboard/pyc')
    revalidatePath('/dashboard/projects/[id]', 'page')
}

export async function createPYCs(pycs: {
    request_id: string
    title: string
    request_type?: string | null
    status?: string | null
    priority?: string | null
    project_id?: string | null
    total_amount?: number | string | null
    created_at?: string | null
}[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const insertData = pycs.map(p => ({
        request_id: p.request_id,
        title: p.title,
        request_type: p.request_type || null,
        status: p.status || 'Chờ duyệt',
        priority: p.priority || 'Thường',
        project_id: p.project_id || null,
        total_amount: p.total_amount ? Number(p.total_amount) : 0,
        created_by: user.email,
        created_at: p.created_at || new Date().toISOString()
    }))

    const { error } = await adminClient
        .from('pyc')
        .insert(insertData)

    if (error) throw error
    revalidatePath('/dashboard/pyc')
}

export async function updatePYCStatus(
    requestId: string,
    status: string,
    message?: string | null,
    approvedBy?: string | null
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Get current history
    const { data: pyc, error: fetchError } = await adminClient
        .from('pyc')
        .select('approved_history')
        .eq('request_id', requestId)
        .single()

    if (fetchError) throw fetchError

    let history = []
    try {
        history = typeof pyc.approved_history === 'string'
            ? JSON.parse(pyc.approved_history)
            : (pyc.approved_history || [])
    } catch (e) {
        history = []
    }

    // 2. Add new entry
    const newEntry = {
        status,
        user: user.email,
        message: message || (status === 'Đã duyệt' ? 'Đã phê duyệt' : status === 'Cần chỉnh sửa' ? 'Yêu cầu chỉnh sửa' : status),
        at: new Date().toISOString()
    }
    history.push(newEntry)

    const updateData: any = {
        status,
        approved_by: approvedBy !== undefined ? approvedBy : (status === 'Đã duyệt' ? user.email : null),
        approved_at: status === 'Đã duyệt' ? new Date().toISOString() : null,
        approved_message: message || null,
        approved_history: JSON.stringify(history)
    }

    const { error } = await adminClient
        .from('pyc')
        .update(updateData)
        .eq('request_id', requestId)

    if (error) throw error
    revalidatePath('/dashboard/pyc')
}

export async function getNextPYCSequence(projectId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1).toISOString()
    const endDate = new Date(year, month, 1).toISOString()

    const { data, error } = await adminClient
        .from('pyc')
        .select('request_id')
        .eq('project_id', projectId)
        .gte('created_at', startDate)
        .lt('created_at', endDate)

    if (error) throw error

    // ID format: PYC/PROJECT_CODE/YYYY/MM/XXXX
    // We need to find the max XXXX
    let maxSeq = 0
    data?.forEach(p => {
        const parts = p.request_id.split('/')
        if (parts.length === 5) {
            const seq = parseInt(parts[4])
            if (!isNaN(seq) && seq > maxSeq) {
                maxSeq = seq
            }
        }
    })

    return maxSeq + 1
}
