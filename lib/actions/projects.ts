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

async function ensureUserExists(email: string, fullName: string, avatarUrl?: string) {
    try {
        const { data: existingUser, error } = await adminClient
            .from('users')
            .select('email')
            .eq('email', email)
            .maybeSingle()

        if (error) {
            console.error('ensureUserExists: Error checking user:', error)
            return // Non-critical, let's try to proceed
        }

        if (!existingUser) {
            console.log(`ensureUserExists: Creating new user for ${email}`)
            const { error: insertError } = await adminClient
                .from('users')
                .insert({
                    email: email,
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    access_level: 4, // Default to Staff
                    created_at: new Date().toISOString(),
                })
            if (insertError) {
                console.error('ensureUserExists: Error creating user:', insertError)
            }
        }
    } catch (e) {
        console.error('ensureUserExists: Exception:', e)
    }
}

export async function getUsers() {
    const { data: users, error } = await adminClient
        .from('users')
        .select('email, full_name, avatar_url')
        .order('full_name')

    if (error) throw error
    return users
}

export async function getProjects() {
    const { data: projects, error } = await adminClient
        .from('projects')
        .select('project_id, project_name')
        .order('project_name')

    if (error) throw error
    return projects
}

export async function getProjectById(projectId: string) {
    const { data: project, error } = await adminClient
        .from('projects')
        .select('*')
        .eq('project_id', projectId)
        .single()

    if (error) return null
    return project
}

export async function createProject(formData: {
    project_id: string
    project_name: string
    description?: string
    start_date?: string
    end_date?: string
    status?: string
    manager_name?: string
    member_names?: string[]
    total_planned_budget?: number
    contingency_budget?: number
    currency_code?: string
    planned_duration?: number
    actual_start_date?: string
    actual_end_date?: string
    progress_percent?: number
    actual_cost?: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Self-healing: Ensure current user exists in public.users
    await ensureUserExists(
        user.email!,
        user.user_metadata.full_name || user.email?.split('@')[0] || 'New User',
        user.user_metadata.avatar_url
    )

    // Sanitize optional fields: convert empty strings to null or omit
    const insertData: any = {
        project_id: formData.project_id.trim(),
        project_name: formData.project_name.trim(),
        description: formData.description?.trim() || null,
        status: formData.status || 'Đang thực hiện',
        created_by: user.email,
        member_names: formData.member_names || [],
        total_planned_budget: formData.total_planned_budget || 0,
        contingency_budget: formData.contingency_budget || 0,
        currency_code: formData.currency_code || 'VND',
        planned_duration: formData.planned_duration || 0,
        actual_start_date: formData.actual_start_date || null,
        actual_end_date: formData.actual_end_date || null,
        progress_percent: formData.progress_percent || 0,
        actual_cost: formData.actual_cost || 0,
    }

    if (formData.start_date) insertData.start_date = formData.start_date
    if (formData.end_date) insertData.end_date = formData.end_date

    // Crucial: Only set manager_name if it's a non-empty string
    if (formData.manager_name && formData.manager_name.trim() !== "") {
        insertData.manager_name = formData.manager_name.trim()
    } else {
        insertData.manager_name = null
    }

    const { error } = await adminClient
        .from('projects')
        .insert(insertData)

    if (error) {
        console.error('CRITICAL: Error in createProject:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            insertData,
            timestamp: new Date().toISOString()
        })
        throw new Error(`Database error: ${error.message} (${error.code})`)
    }

    revalidatePath('/dashboard/projects')
}

export async function updateProject(projectId: string, formData: {
    project_name?: string
    description?: string
    start_date?: string
    end_date?: string
    status?: string
    manager_name?: string
    member_names?: string[]
    total_planned_budget?: number
    contingency_budget?: number
    currency_code?: string
    planned_duration?: number
    actual_start_date?: string
    actual_end_date?: string
    progress_percent?: number
    actual_cost?: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Ensure current user exists (in case of updates by potentially "missing" users)
    await ensureUserExists(
        user.email!,
        user.user_metadata.full_name || user.email?.split('@')[0] || 'New User',
        user.user_metadata.avatar_url
    )

    // Sanitize data
    const updateData: any = {}
    if (formData.project_name) updateData.project_name = formData.project_name.trim()
    if (formData.description !== undefined) updateData.description = formData.description?.trim() || null
    if (formData.status) updateData.status = formData.status
    if (formData.start_date !== undefined) updateData.start_date = formData.start_date || null
    if (formData.end_date !== undefined) updateData.end_date = formData.end_date || null
    if (formData.member_names !== undefined) updateData.member_names = formData.member_names

    // Add new fields
    if (formData.total_planned_budget !== undefined) updateData.total_planned_budget = formData.total_planned_budget
    if (formData.contingency_budget !== undefined) updateData.contingency_budget = formData.contingency_budget
    if (formData.currency_code !== undefined) updateData.currency_code = formData.currency_code
    if (formData.planned_duration !== undefined) updateData.planned_duration = formData.planned_duration
    if (formData.actual_start_date !== undefined) updateData.actual_start_date = formData.actual_start_date || null
    if (formData.actual_end_date !== undefined) updateData.actual_end_date = formData.actual_end_date || null
    if (formData.progress_percent !== undefined) updateData.progress_percent = formData.progress_percent
    if (formData.actual_cost !== undefined) updateData.actual_cost = formData.actual_cost

    if (formData.manager_name !== undefined) {
        updateData.manager_name = (formData.manager_name && formData.manager_name.trim() !== "")
            ? formData.manager_name.trim()
            : null
    }

    const { error } = await adminClient
        .from('projects')
        .update(updateData)
        .eq('project_id', projectId)

    if (error) {
        console.error('CRITICAL: Error in updateProject:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            updateData,
            projectId,
            timestamp: new Date().toISOString()
        })
        throw new Error(`Database error: ${error.message} (${error.code})`)
    }

    revalidatePath('/dashboard/projects')
}

export async function deleteProject(projectId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await adminClient
        .from('projects')
        .delete()
        .eq('project_id', projectId)

    if (error) throw error

    revalidatePath('/dashboard/projects')
}

export async function deleteProjects(projectIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await adminClient
        .from('projects')
        .delete()
        .in('project_id', projectIds)

    if (error) throw error

    revalidatePath('/dashboard/projects')
}

export async function createProjects(projects: {
    project_id: string
    project_name: string
    description?: string
    start_date?: string
    end_date?: string
    status?: string
    manager_name?: string
    member_names?: string[]
    total_planned_budget?: number
    contingency_budget?: number
    currency_code?: string
    planned_duration?: number
    actual_start_date?: string
    actual_end_date?: string
    progress_percent?: number
    actual_cost?: number
}[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Simplify: Assume user exists or is handled by ensureUserExists in a real bulk scenario individually, 
    // but for bulk insert we might skip individual checks for performance or do it once.
    // For now, let's just insert. User existence check is good but might be slow for 100s of rows.
    // Let's do a quick check for the current user once.
    await ensureUserExists(
        user.email!,
        user.user_metadata.full_name || user.email?.split('@')[0] || 'New User',
        user.user_metadata.avatar_url
    )

    const insertData = projects.map(p => ({
        project_id: p.project_id.trim(),
        project_name: p.project_name.trim(),
        description: p.description?.trim() || null,
        status: p.status || 'Đang thực hiện',
        created_by: user.email,
        member_names: p.member_names || [],
        start_date: p.start_date || null,
        end_date: p.end_date || null,
        manager_name: (p.manager_name && p.manager_name.trim() !== "") ? p.manager_name.trim() : null,
        total_planned_budget: p.total_planned_budget || 0,
        contingency_budget: p.contingency_budget || 0,
        currency_code: p.currency_code || 'VND',
        planned_duration: p.planned_duration || 0,
        actual_start_date: p.actual_start_date || null,
        actual_end_date: p.actual_end_date || null,
        progress_percent: p.progress_percent || 0,
        actual_cost: p.actual_cost || 0,
    }))

    const { error } = await adminClient
        .from('projects')
        .insert(insertData)

    if (error) {
        console.error('Error in createProjects:', error)
        throw error
    }

    revalidatePath('/dashboard/projects')
}

export async function getProjectReportData(projectId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Fetch Project
    const { data: project, error: pError } = await adminClient
        .from('projects')
        .select('*')
        .eq('project_id', projectId)
        .single()
    if (pError) throw pError

    // 2. Fetch PYCs with Details
    const { data: pycs, error: pycError } = await adminClient
        .from('pyc')
        .select('*, pyc_detail(*)')
        .eq('project_id', projectId)
    if (pycError) throw pycError

    // 3. Fetch Tasks
    const { data: tasks, error: tError } = await adminClient
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
    if (tError) throw tError

    // 4. Fetch Inflows
    const { data: inflows, error: inflowError } = await adminClient
        .from('project_inflows')
        .select('*')
        .eq('project_id', projectId)
    if (inflowError) throw inflowError

    // 5. Fetch DNTTs (Outflows) linked to project
    const { data: dntts, error: dnttError } = await adminClient
        .from('dntt')
        .select('*')
        .eq('project_id', projectId)
    if (dnttError) throw dnttError

    // Aggregate Financials
    const contractValue = Number(project.total_planned_budget) || 0 // total_planned_budget is used as contractValue
    const totalInflow = inflows?.reduce((sum, inf) => sum + (Number(inf.amount) || 0), 0) || 0
    const totalOutflow = dntts?.reduce((sum, d) => sum + (Number(d.total_gross) || 0), 0) || 0
    const committedCost = pycs?.reduce((sum, p) => p.status === 'Đã duyệt' ? sum + (Number(p.total_amount) || 0) : sum, 0) || 0
    const netCashflow = totalInflow - totalOutflow
    const profit = contractValue - committedCost // Profit based on committed costs vs contract
    const actualProfit = contractValue - totalOutflow // Profit based on actual payments vs contract

    // Aggregate Budget Breakdown (Level 1/2 from pyc_detail.category)
    const categoryAnalysis: { [key: string]: { budget: number, committed: number, actual: number } } = {}

    pycs?.forEach(p => {
        p.pyc_detail?.forEach((d: any) => {
            const cat = d.category || 'Khác'
            if (!categoryAnalysis[cat]) {
                categoryAnalysis[cat] = { budget: 0, committed: 0, actual: 0 }
            }
            if (p.status === 'Đã duyệt') {
                categoryAnalysis[cat].committed += Number(d.line_total) || 0
            }
        })
    })

    // Task Status
    const taskStatusCounts = {
        'Chưa bắt đầu': 0,
        'Đang thực hiện': 0,
        'Hoàn thành': 0,
        'Trễ hạn': 0
    }
    tasks?.forEach(t => {
        const status = t.status || 'Chưa bắt đầu'
        if (Object.prototype.hasOwnProperty.call(taskStatusCounts, status)) {
            taskStatusCounts[status as keyof typeof taskStatusCounts]++
        }
    })

    // Top 5 expensive pyc items
    const allItems: any[] = []
    pycs?.forEach(p => {
        p.pyc_detail?.forEach((d: any) => {
            allItems.push({
                name: d.item_name,
                total: Number(d.line_total) || 0,
                requestId: p.request_id,
                status: p.status
            })
        })
    })
    const topItems = allItems.sort((a, b) => b.total - a.total).slice(0, 5)

    // Pending PYCs
    const pendingPYCs = pycs?.filter(p => p.status === 'Chờ duyệt').sort((a, b) => {
        const priorityOrder: { [key: string]: number } = { 'Khẩn cấp': 0, 'Cao': 1, 'Thường': 2, 'Thấp': 3 }
        return (priorityOrder[a.priority || 'Thường'] || 2) - (priorityOrder[b.priority || 'Thường'] || 2)
    }).slice(0, 5) || []

    // Monthly Data for Charts
    const monthlyData: { [key: string]: { month: string, inflow: number, outflow: number } } = {}
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Process Inflows by Month
    inflows?.forEach(inf => {
        const d = new Date(inf.date)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (!monthlyData[key]) monthlyData[key] = { month: key, inflow: 0, outflow: 0 }
        monthlyData[key].inflow += Number(inf.amount) || 0
    })

    // Process Outflows (DNTT) by Month
    dntts?.forEach(dntt => {
        const d = new Date(dntt.request_date)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (!monthlyData[key]) monthlyData[key] = { month: key, inflow: 0, outflow: 0 }
        monthlyData[key].outflow += Number(dntt.total_gross) || 0
    })

    const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)

    return {
        project,
        financials: {
            contractValue,
            totalInflow,
            totalOutflow,
            committedCost,
            netCashflow,
            profit,
            actualProfit,
            remainingBudget: contractValue - committedCost
        },
        categoryAnalysis: Object.entries(categoryAnalysis).map(([name, data]) => ({ name, ...data })),
        taskStatusCounts,
        topItems,
        pendingPYCs,
        chartData
    }
}

export async function addProjectInflow(data: {
    project_id: string
    amount: number
    date: string
    description?: string
    type?: string
}) {
    const { error } = await adminClient
        .from('project_inflows')
        .insert([data])
    if (error) throw error
    revalidatePath(`/dashboard/projects/${data.project_id}`)
}

export async function getProjectInflows(projectId: string) {
    const { data, error } = await adminClient
        .from('project_inflows')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false })
    if (error) throw error
    return data
}

export async function updateProjectInflow(id: string, projectId: string, data: any) {
    const { error } = await adminClient
        .from('project_inflows')
        .update(data)
        .eq('id', id)
    if (error) throw error
    revalidatePath(`/dashboard/projects/${projectId}`)
}

export async function deleteProjectInflow(id: string, projectId: string) {
    const { error } = await adminClient
        .from('project_inflows')
        .delete()
        .eq('id', id)
    if (error) throw error
    revalidatePath(`/dashboard/projects/${projectId}`)
}
