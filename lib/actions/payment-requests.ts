'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'

const adminClient = getAdminClient()

/**
 * Get payment requests (DNTT) with server-side pagination and filtering
 */
export async function getPaymentRequests(
    projectId?: string | null,
    page: number = 1,
    pageSize: number = 20,
    searchTerm?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const offset = (page - 1) * pageSize

    let query = adminClient
        .from('dntt')
        .select('*', { count: 'exact' })

    if (projectId) {
        query = query.eq('project_id', projectId)
    }

    if (searchTerm && searchTerm.trim()) {
        query = query.or(`payment_reason.ilike.%${searchTerm}%,payment_request_id.ilike.%${searchTerm}%,supplier_name.ilike.%${searchTerm}%`)
    }

    query = query.order('request_date', { ascending: false })

    if (pageSize > 0) {
        query = query.range(offset, offset + pageSize - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { data: data || [], count: count || 0 }
}

/**
 * Get all payment requests for client-side caching
 */
export async function getAllPaymentRequests(projectId?: string | null) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    let query = adminClient
        .from('dntt')
        .select('*')

    if (projectId) {
        query = query.eq('project_id', projectId)
    }

    query = query.order('request_date', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    return data || []
}

/**
 * Get approved PYCs for DNTT inheritance
 */
export async function getApprovedPYCs(projectId?: string | null) {
    let query = adminClient
        .from('pyc')
        .select(`
            *,
            projects (project_name),
            pyc_detail (*),
            author:users!created_by (full_name, avatar_url)
        `)
        .eq('status', 'Đã duyệt')

    if (projectId) {
        query = query.eq('project_id', projectId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) {
        console.error("Error in getApprovedPYCs:", error)
        throw error
    }
    return data
}

/**
 * Create a new Payment Request (DNTT)
 * Note: If dntt_detail doesn't exist yet, we might store details in a JSON column 
 * or assuming it's a flat structure for now. Based on user's 3-table list, 
 * I will handle it as if dntt is the main record and potentially link to pyc items.
 */
export async function createPaymentRequest(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { items, ...header } = data

    // 1. Insert Header with advanced metadata
    const dnttData = {
        ...header,
        requester_name: user.email,
        created_at: new Date().toISOString(),
        status: 'Chờ duyệt',
        approved_history: JSON.stringify([{
            status: 'Chờ duyệt',
            user: user.email,
            message: 'Khởi tạo đề nghị thanh toán',
            at: new Date().toISOString()
        }])
    }

    const { data: dnttResult, error: dnttError } = await adminClient
        .from('dntt')
        .insert(dnttData)
        .select()
        .single()

    if (dnttError) throw dnttError

    // 2. Insert Details if provided
    if (items && items.length > 0) {
        const detailData = items.map((item: any) => ({
            payment_request_id: dnttResult.payment_request_id,
            item_name: item.item_name,
            unit: item.unit,
            quantity: item.quantity,
            unit_price: item.unit_price,
            vat_value: item.vat_value,
            is_qty_from_pyc: item.is_qty_from_pyc ?? true,
            is_price_from_pyc: item.is_price_from_pyc ?? true,
            pyc_request_id: item.pyc_request_id
        }))

        const { error: detailError } = await adminClient
            .from('dntt_detail')
            .insert(detailData)

        if (detailError) throw detailError
    }

    revalidatePath('/dashboard/dntt')
    if (header.project_id) {
        revalidatePath(`/dashboard/projects/${header.project_id}`)
    }

    return dnttResult
}

/**
 * Update DNTT status and history
 */
export async function updateDNTTStatus(id: string, status: string, message: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: dntt, error: fetchError } = await adminClient
        .from('dntt')
        .select('approved_history')
        .eq('payment_request_id', id)
        .single()

    if (fetchError) throw fetchError

    let history = []
    try {
        history = typeof dntt.approved_history === 'string'
            ? JSON.parse(dntt.approved_history)
            : (dntt.approved_history || [])
    } catch (e) {
        history = []
    }

    history.push({
        status,
        user: user.email,
        message: message || status,
        at: new Date().toISOString()
    })

    const { error } = await adminClient
        .from('dntt')
        .update({
            status,
            approved_history: JSON.stringify(history)
        })
        .eq('payment_request_id', id)

    if (error) throw error
    revalidatePath('/dashboard/dntt')
}

/**
 * Delete a single DNTT
 */
export async function deleteDNTT(id: string) {
    const { error } = await adminClient
        .from('dntt')
        .delete()
        .eq('payment_request_id', id)

    if (error) throw error
    revalidatePath('/dashboard/dntt')
    return true
}

/**
 * Delete multiple DNTTs
 */
export async function deleteDNTTs(ids: string[]) {
    const { error } = await adminClient
        .from('dntt')
        .delete()
        .in('payment_request_id', ids)

    if (error) throw error
    revalidatePath('/dashboard/dntt')
    return true
}

/**
 * Get next sequence number for DNTT ID in a specific project and month
 * Logic: DNTT/Mã dự án/Tháng/Số đề nghị thanh toán + 1 (format 4 số)
 */
export async function getNextDNTTSequence(projectCode: string, month: string) {
    const prefix = `DNTT/${projectCode}/${month}/`

    const { data, error } = await adminClient
        .from('dntt')
        .select('payment_request_id')
        .like('payment_request_id', `${prefix}%`)
        .order('payment_request_id', { ascending: false })
        .limit(1)

    if (error) throw error

    if (!data || data.length === 0) {
        return 1
    }

    const lastId = data[0].payment_request_id
    const parts = lastId.split('/')
    const lastSeq = parseInt(parts[parts.length - 1], 10)

    return isNaN(lastSeq) ? 1 : lastSeq + 1
}
