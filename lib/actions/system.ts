'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'

const adminClient = getAdminClient()

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
        .select(`
            *,
            project:projects(project_name),
            issuing_department:departments!issuing_department_id(name)
        `)
        .order('name')
    if (error) throw error
    return data
}

export async function getTemplateFiles(templateId: string) {
    const { data, error } = await adminClient
        .from('files')
        .select('*')
        .eq('table_name', 'system_templates')
        .eq('ref_id', templateId)
    if (error) throw error
    return data
}

export async function addSystemTemplate(data: {
    name: string,
    type: string,
    file_url: string,
    description?: string,
    project_id?: string,
    category?: string,
    template_code?: string,
    issuing_department_id?: string,
    status?: string,
    effective_from?: string,
    effective_to?: string
}) {
    // Xử lý project_id và issuing_department_id: Nếu là chuỗi rỗng thì chuyển thành null
    const cleanData = {
        ...data,
        project_id: data.project_id || null,
        issuing_department_id: data.issuing_department_id || null,
        status: data.status || 'Hiệu lực'
    }

    const { data: result, error } = await adminClient
        .from('system_templates')
        .insert([cleanData])
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system')
    return result
}

export async function updateSystemTemplate(id: string, data: any) {
    // Loại bỏ các trường hệ thống và các object từ join (project)
    const { id: _id, created_at: _ca, updated_at: _ua, project: _p, issuing_department: _idp, ...rest } = data

    // Xử lý project_id và issuing_department_id
    const cleanData = {
        ...rest,
        project_id: rest.project_id || null,
        issuing_department_id: rest.issuing_department_id || null
    }

    const { data: result, error } = await adminClient
        .from('system_templates')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system')
    return result
}

export async function deleteSystemTemplate(id: string) {
    const { error } = await adminClient
        .from('system_templates')
        .delete()
        .eq('id', id)
    if (error) throw error
    revalidatePath('/dashboard/system')
    return true
}
/**
 * CHECKLIST DATA (Mẫu biểu Checklist)
 */
export async function getChecklistData() {
    const { data, error } = await adminClient
        .from('checklist_data')
        .select('id, document_code, payment_method, document_type, payment_group, file_id, created_at')
        .order('document_code')
    if (error) throw error
    return data
}

export async function addChecklistData(data: any) {
    // Loại bỏ các trường cũ nếu có
    const { index: _idx, merged_type: _mt, ...cleanData } = data

    const { data: result, error } = await adminClient
        .from('checklist_data')
        .insert([cleanData])
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system/checklist')
    return result
}

export async function addChecklistDataBulk(data: any[]) {
    // Loại bỏ các trường cũ cho từng dòng
    const cleanData = data.map(item => {
        const { index: _idx, merged_type: _mt, ...rest } = item
        return rest
    })

    const { data: result, error } = await adminClient
        .from('checklist_data')
        .insert(cleanData)
        .select()
    if (error) throw error
    revalidatePath('/dashboard/system/checklist')
    return result
}

export async function updateChecklistData(id: string, data: any) {
    // Loại bỏ các trường không còn tồn tại hoặc không muốn update
    const { id: _id, created_at: _ca, index: _idx, merged_type: _mt, ...cleanData } = data

    const { data: result, error } = await adminClient
        .from('checklist_data')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system/checklist')
    return result
}

export async function deleteChecklistData(id: string) {
    const { error } = await adminClient
        .from('checklist_data')
        .delete()
        .eq('id', id)
    if (error) throw error
    revalidatePath('/dashboard/system/checklist')
    return true
}

/**
 * NCC (Nhà cung cấp)
 */
export async function getSuppliers(projectId?: string) {
    let query = adminClient
        .from('ncc')
        .select('*')

    if (projectId) {
        query = query.eq('project_id', projectId)
    }

    const { data, error } = await query.order('supplier_name')
    if (error) throw error
    return data
}

export async function addSupplier(data: any) {
    const { data: result, error } = await adminClient
        .from('ncc')
        .insert([data])
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system/suppliers')
    if (data.project_id) {
        revalidatePath(`/dashboard/projects/${data.project_id}`)
    }
    return result
}

export async function addSuppliers(suppliers: any[]) {
    const { data: result, error } = await adminClient
        .from('ncc')
        .upsert(suppliers, { onConflict: 'id' })
        .select()
    if (error) {
        console.error("Error in addSuppliers:", error)
        throw error
    }
    revalidatePath('/dashboard/system/suppliers')
    return result
}

export async function updateSupplier(id: string, data: any) {
    const { id: _id, created_at: _ca, ...rest } = data
    const { data: result, error } = await adminClient
        .from('ncc')
        .update(rest)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system/suppliers')
    if (rest.project_id) {
        revalidatePath(`/dashboard/projects/${rest.project_id}`)
    }
    return result
}

export async function deleteSupplier(id: string, projectId?: string) {
    const { error } = await adminClient
        .from('ncc')
        .delete()
        .eq('id', id)
    if (error) throw error
    revalidatePath('/dashboard/system/suppliers')
    if (projectId) {
        revalidatePath(`/dashboard/projects/${projectId}`)
    }
    return true
}

/**
 * EXPENSE CATEGORIES (Danh mục chi phí)
 */
export async function getExpenseCategories() {
    const { data, error } = await adminClient
        .from('expense_categories')
        .select(`
            *,
            department:departments!responsible_department_id(name)
        `)
        .order('type_name')
    if (error) throw error
    return data
}

export async function addExpenseCategory(data: any) {
    const { data: result, error } = await adminClient
        .from('expense_categories')
        .insert([data])
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system')
    return result
}

export async function updateExpenseCategory(id: string, data: any) {
    const { id: _id, created_at: _ca, department: _dept, ...rest } = data
    const { data: result, error } = await adminClient
        .from('expense_categories')
        .update(rest)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system')
    return result
}

export async function deleteExpenseCategory(id: string) {
    const { error } = await adminClient
        .from('expense_categories')
        .delete()
        .eq('id', id)
    if (error) throw error
    revalidatePath('/dashboard/system')
    return true
}

export async function addExpenseCategories(categories: any[]) {
    const { data: result, error } = await adminClient
        .from('expense_categories')
        .upsert(categories, { onConflict: 'id' })
        .select()
    if (error) {
        console.error("Error in addExpenseCategories:", error)
        throw error
    }
    revalidatePath('/dashboard/system')
    return result
}

/**
 * WAREHOUSES (Quản lý kho)
 */
export async function getWarehouses() {
    const { data: warehouses, error } = await adminClient
        .from('warehouses')
        .select(`
            *,
            project:projects(project_name)
        `)
        .order('name')

    if (error) throw error
    return warehouses
}

export async function addWarehouse(data: any) {
    const cleanData = {
        ...data,
        project_id: data.project_id || null
    }
    const { data: result, error } = await adminClient
        .from('warehouses')
        .insert([cleanData])
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system')
    return result
}

export async function updateWarehouse(id: string, data: any) {
    const { id: _id, created_at: _ca, project: _proj, ...rest } = data
    const cleanData = {
        ...rest,
        project_id: rest.project_id || null
    }
    const { data: result, error } = await adminClient
        .from('warehouses')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    revalidatePath('/dashboard/system')
    return result
}

export async function deleteWarehouse(id: string) {
    const { error } = await adminClient
        .from('warehouses')
        .delete()
        .eq('id', id)
    if (error) throw error
    revalidatePath('/dashboard/system')
    return true
}
