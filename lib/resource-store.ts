'use client'

import { getAllResources } from './actions/resources'

export interface Resource {
    resource_id: string
    resource_name: string
    unit: string | null
    unit_price: number | null
    group_name?: string | null
    project_id?: string | null
    projects?: {
        project_name: string
    } | null
    quantity_in?: number | string | null
    quantity_out?: number | string | null
    quantity_balance?: number | string | null
    status?: string | null
    documents?: { name: string; description: string; url: string }[] | null
    notes?: string | null
}

class ResourceStore {
    private static instance: ResourceStore
    private resources: Resource[] = []
    private isLoading: boolean = false
    private lastUpdated: number = 0
    private CACHE_DURATION = 1000 * 60 * 5 // 5 minutes
    private listeners: Set<(resources: Resource[]) => void> = new Set()

    private constructor() { }

    public static getInstance(): ResourceStore {
        if (!ResourceStore.instance) {
            ResourceStore.instance = new ResourceStore()
        }
        return ResourceStore.instance
    }

    public subscribe(listener: (resources: Resource[]) => void) {
        this.listeners.add(listener)
        // Immediately trigger with current data
        if (this.resources.length > 0) {
            listener(this.resources)
        }
        return () => {
            this.listeners.delete(listener)
        }
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.resources))
    }

    public async getResources(forceRefresh = false): Promise<Resource[]> {
        const now = Date.now()
        // If data exists and not forcing refresh and within cache duration, return cached
        if (this.resources.length > 0 && !forceRefresh && (now - this.lastUpdated < this.CACHE_DURATION)) {
            return this.resources
        }

        // Avoid multiple simultaneous loads
        if (this.isLoading) {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!this.isLoading) {
                        clearInterval(checkInterval)
                        resolve(this.resources)
                    }
                }, 100)
            })
        }

        return this.refresh()
    }

    public async refresh(): Promise<Resource[]> {
        this.isLoading = true
        this.notify() // Notify that loading has started


        const startTime = Date.now()

        try {
            const data = await getAllResources()
            const duration = Date.now() - startTime



            this.resources = data as Resource[]
            this.lastUpdated = Date.now()
            return this.resources
        } catch (error) {
            const duration = Date.now() - startTime
            console.error(`[ResourceStore] Refresh FAILED after ${duration}ms:`, error)

            // Show error to user
            if (typeof window !== 'undefined') {
                alert(`Lỗi khi tải dữ liệu tài nguyên: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }

            return this.resources // Return stale data on error if exists
        } finally {
            this.isLoading = false
            this.notify() // Notify that loading has finished

        }
    }

    public addResource(resource: Resource) {
        // Check if exists
        const exists = this.resources.some(r => r.resource_id === resource.resource_id)
        if (!exists) {
            this.resources = [resource, ...this.resources]
            this.notify()
        }
    }

    public getIsLoading() {
        return this.isLoading
    }

    public getCachedResources() {
        return this.resources
    }
}

export const resourceStore = ResourceStore.getInstance()
