/**
 * Marketing Store
 * Client-side state management for marketing campaigns
 */

import { getAllCampaigns, getCampaigns } from '@/lib/actions/marketing'

export interface Campaign {
    campaign_id: string
    campaign_name: string
    description: string | null
    objective: string
    channels: string[]
    total_budget: number
    spent_amount: number
    currency_code: string
    status: string
    start_date: string
    end_date: string | null
    target_audience: string | null
    project_id: string | null
    created_at: string
    updated_at: string
    created_by?: string
    project?: {
        project_id: string
        project_name: string
    }
}

export interface CampaignMetrics {
    campaign_id: string
    total_impressions: number
    total_clicks: number
    total_conversions: number
    conversion_rate: number
    cost_per_click: number
    cost_per_conversion: number
    roi: number
    revenue_generated: number
}

type CampaignListener = (campaigns: Campaign[]) => void

class MarketingStore {
    private cachedCampaigns: Campaign[] = []
    private isLoading = false
    private listeners: Set<CampaignListener> = new Set()

    /**
     * Get cached campaigns
     */
    getCachedCampaigns(): Campaign[] {
        return this.cachedCampaigns
    }

    /**
     * Get loading state
     */
    getIsLoading(): boolean {
        return this.isLoading
    }

    /**
     * Subscribe to campaign changes
     */
    subscribe(listener: CampaignListener): () => void {
        this.listeners.add(listener)
        return () => {
            this.listeners.delete(listener)
        }
    }

    /**
     * Notify all listeners
     */
    private notify() {
        this.listeners.forEach(listener => listener(this.cachedCampaigns))
    }

    /**
     * Get all campaigns with pagination
     */
    async getCampaigns(projectId?: string | null, page: number = 1, limit: number = 20) {
        this.isLoading = true
        this.notify()

        try {
            const result = await getCampaigns(projectId, page, limit)
            this.cachedCampaigns = result.data
            this.isLoading = false
            this.notify()
            return result
        } catch (error) {
            console.error('Error fetching campaigns:', error)
            this.isLoading = false
            this.notify()
            return { data: [], total: 0, page, limit, totalPages: 0 }
        }
    }

    /**
     * Get all campaigns (no pagination)
     */
    async getAllCampaigns(projectId?: string | null): Promise<Campaign[]> {
        this.isLoading = true
        this.notify()

        try {
            const data = await getAllCampaigns(projectId)
            this.cachedCampaigns = data
            this.isLoading = false
            this.notify()
            return data
        } catch (error) {
            console.error('Error fetching all campaigns:', error)
            this.isLoading = false
            this.notify()
            return []
        }
    }

    /**
     * Refresh campaigns
     */
    async refresh(projectId?: string | null) {
        return this.getAllCampaigns(projectId)
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cachedCampaigns = []
        this.notify()
    }

    /**
     * Calculate campaign metrics
     */
    calculateMetrics(campaign: Campaign, metrics: {
        total_impressions: number
        total_clicks: number
        total_conversions: number
        revenue_generated: number
    }): CampaignMetrics {
        const impressions = metrics.total_impressions || 0
        const clicks = metrics.total_clicks || 0
        const conversions = metrics.total_conversions || 0
        const spent = campaign.spent_amount || 0
        const revenue = metrics.revenue_generated || 0

        return {
            campaign_id: campaign.campaign_id,
            total_impressions: impressions,
            total_clicks: clicks,
            total_conversions: conversions,
            conversion_rate: impressions > 0 ? (conversions / impressions) * 100 : 0,
            cost_per_click: clicks > 0 ? spent / clicks : 0,
            cost_per_conversion: conversions > 0 ? spent / conversions : 0,
            roi: spent > 0 ? ((revenue - spent) / spent) * 100 : 0,
            revenue_generated: revenue
        }
    }

    /**
     * Get campaign by ID
     */
    getCampaignById(campaignId: string): Campaign | undefined {
        return this.cachedCampaigns.find(c => c.campaign_id === campaignId)
    }

    /**
     * Filter campaigns
     */
    filterCampaigns(filters: {
        search?: string
        status?: string
        type?: string
        projectId?: string
    }): Campaign[] {
        let filtered = [...this.cachedCampaigns]

        if (filters.search) {
            const search = filters.search.toLowerCase()
            filtered = filtered.filter(c =>
                c.campaign_name.toLowerCase().includes(search) ||
                c.description?.toLowerCase().includes(search)
            )
        }

        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(c => c.status === filters.status)
        }

        if (filters.type && filters.type !== 'all') {
            filtered = filtered.filter(c => c.channels.includes(filters.type!))
        }

        if (filters.projectId && filters.projectId !== 'all') {
            filtered = filtered.filter(c => c.project_id === filters.projectId)
        }

        return filtered
    }

    /**
     * Sort campaigns
     */
    sortCampaigns(campaigns: Campaign[], sortBy: string = '-created_at'): Campaign[] {
        const sorted = [...campaigns]
        const isDesc = sortBy.startsWith('-')
        const key = isDesc ? sortBy.slice(1) : sortBy

        sorted.sort((a, b) => {
            let aVal: any = a[key as keyof Campaign]
            let bVal: any = b[key as keyof Campaign]

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase()
                bVal = bVal.toLowerCase()
            }

            if (aVal < bVal) return isDesc ? 1 : -1
            if (aVal > bVal) return isDesc ? -1 : 1
            return 0
        })

        return sorted
    }
}

// Export singleton instance
export const marketingStore = new MarketingStore()
