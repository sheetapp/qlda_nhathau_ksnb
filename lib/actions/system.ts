'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

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
 * DEPARTMENTS (Phòng ban)
 */
export async function getDepartments() {
    const { data, error } = await adminClient
        .from('departments')
        .select(`
            *,
            parent:departments!parent_id(name)
        `)
        .order('name')
    if (error) throw error
    return data
}

export async function addDepartment(data: { name: string, description?: string, parent_id?: string }) {
    const { data: result, error } = await adminClient
        .from('departments')
        .insert([data])
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system')
    return result
}

export async function updateDepartment(id: string, data: { name?: string, description?: string, parent_id?: string }) {
    const { data: result, error } = await adminClient
        .from('departments')
        .update(data)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system')
    return result
}

export async function deleteDepartment(id: string) {
    const { error } = await adminClient
        .from('departments')
        .delete()
        .eq('id', id)
    if (error) throw error
    revalidatePath('/dashboard/system')
    return true
}

/**
 * JOB LEVELS (Cấp bậc)
 */
export async function getJobLevels() {
    const { data, error } = await adminClient
        .from('job_levels')
        .select('*')
        .order('level_score', { ascending: false })
    if (error) throw error
    return data
}

export async function addJobLevel(data: { name: string, level_score: number, description?: string }) {
    const { data: result, error } = await adminClient
        .from('job_levels')
        .insert([data])
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system')
    return result
}

/**
 * JOB POSITIONS (Chức vụ)
 */
export async function getJobPositions() {
    const { data, error } = await adminClient
        .from('job_positions')
        .select('*')
        .order('name')
    if (error) throw error
    return data
}

export async function addJobPosition(data: { name: string, description?: string }) {
    const { data: result, error } = await adminClient
        .from('job_positions')
        .insert([data])
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system')
    return result
}

/**
 * JOB FUNCTIONS (Chức năng nhiệm vụ)
 */
export async function getJobFunctions() {
    const { data, error } = await adminClient
        .from('job_functions')
        .select(`
            *,
            department:departments(name),
            position:job_positions(name)
        `)
    if (error) throw error
    return data
}

export async function addJobFunction(data: { department_id: string, position_id: string, description: string }) {
    const { data: result, error } = await adminClient
        .from('job_functions')
        .insert([data])
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system')
    return result
}

/**
 * COMPANY INFO
 */
export async function getCompanyInfo() {
    const { data, error } = await adminClient
        .from('company_info')
        .select('*')
        .eq('id', 1)
        .single()
    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
    return data
}

export async function updateCompanyInfo(data: any) {
    const { data: result, error } = await adminClient
        .from('company_info')
        .upsert({ id: 1, ...data })
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system')
    return result
}

/**
 * BRANCHES
 */
export async function getBranches() {
    const { data, error } = await adminClient
        .from('branches')
        .select('*')
        .order('name')
    if (error) throw error
    return data
}

export async function addBranch(data: any) {
    const { data: result, error } = await adminClient
        .from('branches')
        .insert([data])
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system')
    return result
}

/**
 * SYSTEM TEMPLATES
 */
export async function getSystemTemplates() {
    const { data, error } = await adminClient
        .from('system_templates')
        .select('*')
        .order('name')
    if (error) throw error
    return data
}

export async function addSystemTemplate(data: { name: string, type: string, file_url: string, description?: string }) {
    const { data: result, error } = await adminClient
        .from('system_templates')
        .insert([data])
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system')
    return result
}
