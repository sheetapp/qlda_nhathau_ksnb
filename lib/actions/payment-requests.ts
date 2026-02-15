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

    // Calculate offset
    const offset = (page - 1) * pageSize

    // Build query with count
    let query = adminClient
        .from('dntt')
        .select(`
            *
        `, { count: 'exact' })

    // Apply project filter if provided
    // Note: The schema provided doesn't explicitly show a project_id field, 
    // but the task-list.tsx and page.tsx imply its existence or relation.
    // I will check if project_id exists in the future if it fails.
    // Based on the user's provided schema, there is NO project_id.
    // However, the tab is inside a project detail view.
    // Wait, the user's provided schema for dntt:
    /*
    create table public.dntt (
      payment_request_id text not null,
      request_date date not null,
      document_date date null,
      document_reference text null,
      invoice_number text null,
      payment_reason text null,
      quantity numeric(15, 2) null,
      unit_price_gross numeric(15, 2) null,
      vat_rate numeric(5, 2) null,
      unit_price_net numeric(15, 2) null,
      vat_amount numeric(15, 2) null,
      total_net numeric(15, 2) null,
      total_gross numeric(15, 2) null,
      payment_method text null,
      payer text null,
      requester_name text null,
      supplier_name text null,
      expense_type text null,
      expense_group text null,
      contract_type text null,
      pyc_classification text null,
      notes text null,
      created_at timestamp with time zone null default now(),
      constraint dntt_pkey primary key (payment_request_id),
      constraint dntt_requester_name_fkey foreign KEY (requester_name) references users (email) on delete set null
    )
    */
    // There is NO project_id field in the schema provided.
    // I should check if there's a join or if I should just ignore it for now.
    // But ProjectDetailPage suggests getTasksByProject(projectId) etc.
    // If I filter by projectId on a table without project_id, it will error.
    // I'll skip project filtering for dntt for now unless I find how they are linked.

    if (searchTerm && searchTerm.trim()) {
        query = query.or(`payment_reason.ilike.%${searchTerm}%,payment_request_id.ilike.%${searchTerm}%,supplier_name.ilike.%${searchTerm}%`)
    }

    // Apply sorting
    query = query.order('request_date', { ascending: false })

    // Apply pagination
    if (pageSize > 0) {
        query = query.range(offset, offset + pageSize - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { data: data || [], count: count || 0 }
}
