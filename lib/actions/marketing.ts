'use server'

import { getAdminClient } from '@/lib/supabase/admin'

const adminClient = getAdminClient()
import { revalidatePath } from 'next/cache'

/**
 * CAMPAIGNS (Chiến dịch)
 * Các hàm quản lý chiến dịch marketing
 */

export async function getCampaigns(projectId?: string | null, page: number = 1, limit: number = 20) {
    try {
        let query = adminClient
            .from('marketing_campaigns')
            .select(`
                *,
                project:projects(project_id, project_name)
            `, { count: 'exact' })

        if (projectId) {
            query = query.eq('project_id', projectId)
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1)

        if (error) throw error

        return {
            data: data || [],
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit)
        }
    } catch (error) {
        console.error('Error fetching campaigns:', error)
        return { data: [], total: 0, page, limit, totalPages: 0 }
    }
}

export async function getAllCampaigns(projectId?: string | null) {
    try {
        let query = adminClient
            .from('marketing_campaigns')
            .select(`
                *,
                project:projects(project_id, project_name)
            `)

        if (projectId) {
            query = query.eq('project_id', projectId)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching all campaigns:', error)
        return []
    }
}

export async function getCampaignById(campaignId: string) {
    try {
        const { data, error } = await adminClient
            .from('marketing_campaigns')
            .select(`
                *,
                project:projects(project_id, project_name),
                email_campaigns(*)
            `)
            .eq('campaign_id', campaignId)
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error fetching campaign:', error)
        return null
    }
}

export async function createCampaign(data: {
    campaign_name: string
    description?: string
    objective: string
    channels: string[]
    total_budget: number
    currency_code: string
    status: string
    start_date: string
    end_date?: string
    target_audience?: string
    project_id?: string
}) {
    try {
        const { data: campaign, error } = await adminClient
            .from('marketing_campaigns')
            .insert([{
                campaign_name: data.campaign_name.trim(),
                description: data.description?.trim() || null,
                objective: data.objective,
                channels: data.channels,
                total_budget: data.total_budget,
                spent_amount: 0,
                currency_code: data.currency_code || 'VND',
                status: data.status || 'Draft',
                start_date: data.start_date,
                end_date: data.end_date || null,
                target_audience: data.target_audience || null,
                project_id: data.project_id || null
            }])
            .select()
            .single()

        if (error) throw error

        revalidatePath('/dashboard/app-store/marketing')
        return { success: true, data: campaign }
    } catch (error) {
        console.error('Error creating campaign:', error)
        return { success: false, error: 'Failed to create campaign' }
    }
}

export async function updateCampaign(campaignId: string, data: Partial<{
    campaign_name: string
    description: string
    objective: string
    channels: string[]
    total_budget: number
    spent_amount: number
    currency_code: string
    status: string
    start_date: string
    end_date: string
    target_audience: string
}>) {
    try {
        const { data: campaign, error } = await adminClient
            .from('marketing_campaigns')
            .update(data)
            .eq('campaign_id', campaignId)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/dashboard/app-store/marketing')
        return { success: true, data: campaign }
    } catch (error) {
        console.error('Error updating campaign:', error)
        return { success: false, error: 'Failed to update campaign' }
    }
}

export async function deleteCampaign(campaignId: string) {
    try {
        const { error } = await adminClient
            .from('marketing_campaigns')
            .delete()
            .eq('campaign_id', campaignId)

        if (error) throw error

        revalidatePath('/dashboard/app-store/marketing')
        return { success: true }
    } catch (error) {
        console.error('Error deleting campaign:', error)
        return { success: false, error: 'Failed to delete campaign' }
    }
}

export async function deleteCampaignsBulk(campaignIds: string[]) {
    try {
        const { error } = await adminClient
            .from('marketing_campaigns')
            .delete()
            .in('campaign_id', campaignIds)

        if (error) throw error

        revalidatePath('/dashboard/app-store/marketing')
        return { success: true, deleted: campaignIds.length }
    } catch (error) {
        console.error('Error bulk deleting campaigns:', error)
        return { success: false, error: 'Failed to delete campaigns' }
    }
}

export async function updateCampaignStatus(campaignId: string, status: string) {
    try {
        const { data, error } = await adminClient
            .from('marketing_campaigns')
            .update({ status })
            .eq('campaign_id', campaignId)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/dashboard/app-store/marketing')
        return { success: true, data }
    } catch (error) {
        console.error('Error updating campaign status:', error)
        return { success: false, error: 'Failed to update status' }
    }
}

/**
 * CAMPAIGN METRICS
 * Các hàm quản lý metrics của chiến dịch
 */

export async function getCampaignMetrics(campaignId: string) {
    try {
        const { data, error } = await adminClient
            .from('campaign_metrics')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('date', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching campaign metrics:', error)
        return []
    }
}

export async function addCampaignMetric(data: {
    campaign_id: string
    date: string
    impressions: number
    clicks: number
    conversions: number
    spent: number
    revenue: number
}) {
    try {
        const { data: metric, error } = await adminClient
            .from('campaign_metrics')
            .insert([data])
            .select()
            .single()

        if (error) throw error
        return { success: true, data: metric }
    } catch (error) {
        console.error('Error adding campaign metric:', error)
        return { success: false, error: 'Failed to add metric' }
    }
}

/**
 * EMAIL CAMPAIGNS
 */

export async function getEmailCampaigns(campaignId: string) {
    try {
        const { data, error } = await adminClient
            .from('email_campaigns')
            .select('*')
            .eq('campaign_id', campaignId)

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching email campaigns:', error)
        return []
    }
}

export async function createEmailCampaign(data: {
    campaign_id: string
    template_id?: string
    recipient_count: number
    scheduled_time?: string
    status: string
}) {
    try {
        const { data: emailCampaign, error } = await adminClient
            .from('email_campaigns')
            .insert([data])
            .select()
            .single()

        if (error) throw error
        return { success: true, data: emailCampaign }
    } catch (error) {
        console.error('Error creating email campaign:', error)
        return { success: false, error: 'Failed to create email campaign' }
    }
}

/**
 * EMAIL TEMPLATES
 */

export async function getEmailTemplates(projectId?: string) {
    try {
        let query = adminClient
            .from('email_templates')
            .select('*')

        if (projectId) {
            query = query.eq('project_id', projectId)
        }

        const { data, error } = await query.order('name')

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching email templates:', error)
        return []
    }
}

export async function createEmailTemplate(data: {
    name: string
    subject: string
    body: string
    type: string
    project_id?: string
}) {
    try {
        const { data: template, error } = await adminClient
            .from('email_templates')
            .insert([data])
            .select()
            .single()

        if (error) throw error

        revalidatePath('/dashboard/app-store/marketing')
        return { success: true, data: template }
    } catch (error) {
        console.error('Error creating email template:', error)
        return { success: false, error: 'Failed to create template' }
    }
}

/**
 * SOCIAL MEDIA POSTS
 */

export async function getSocialPosts(campaignId: string) {
    try {
        const { data, error } = await adminClient
            .from('social_posts')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('scheduled_time', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching social posts:', error)
        return []
    }
}

export async function createSocialPost(data: {
    campaign_id: string
    platform: string
    content: string
    scheduled_time: string
    status: string
    media_ids?: string[]
}) {
    try {
        const { data: post, error } = await adminClient
            .from('social_posts')
            .insert([data])
            .select()
            .single()

        if (error) throw error

        revalidatePath('/dashboard/app-store/marketing')
        return { success: true, data: post }
    } catch (error) {
        console.error('Error creating social post:', error)
        return { success: false, error: 'Failed to create post' }
    }
}

/**
 * LANDING PAGES
 */

export async function getLandingPages(projectId?: string) {
    try {
        let query = adminClient
            .from('landing_pages')
            .select(`
                *,
                campaign:marketing_campaigns(campaign_id, campaign_name)
            `)

        if (projectId) {
            query = query.eq('project_id', projectId)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching landing pages:', error)
        return []
    }
}

export async function createLandingPage(data: {
    title: string
    slug: string
    campaign_id?: string
    project_id?: string
    status: string
}) {
    try {
        const { data: page, error } = await adminClient
            .from('landing_pages')
            .insert([data])
            .select()
            .single()

        if (error) throw error

        revalidatePath('/dashboard/app-store/marketing')
        return { success: true, data: page }
    } catch (error) {
        console.error('Error creating landing page:', error)
        return { success: false, error: 'Failed to create landing page' }
    }
}
