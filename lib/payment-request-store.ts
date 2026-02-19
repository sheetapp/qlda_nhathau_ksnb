'use client'

import { getAllPaymentRequests } from './actions/payment-requests'

export interface PaymentRequest {
    payment_request_id: string
    request_date: string
    payment_reason: string
    supplier_name: string
    total_gross: number
    status: string
    requester_name: string
    project_id: string | null
    [key: string]: any
}

class PaymentRequestStore {
    private static instance: PaymentRequestStore
    private requests: PaymentRequest[] = []
    private isLoading: boolean = false
    private lastUpdated: number = 0
    private CACHE_DURATION = 1000 * 60 * 5 // 5 minutes
    private listeners: Set<(requests: PaymentRequest[]) => void> = new Set()

    private constructor() { }

    public static getInstance(): PaymentRequestStore {
        if (!PaymentRequestStore.instance) {
            PaymentRequestStore.instance = new PaymentRequestStore()
        }
        return PaymentRequestStore.instance
    }

    public subscribe(listener: (requests: PaymentRequest[]) => void) {
        this.listeners.add(listener)
        if (this.requests.length > 0) {
            listener(this.requests)
        }
        return () => {
            this.listeners.delete(listener)
        }
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.requests))
    }

    public async getRequests(projectId?: string | null, forceRefresh = false): Promise<PaymentRequest[]> {
        const now = Date.now()
        if (this.requests.length > 0 && !forceRefresh && (now - this.lastUpdated < this.CACHE_DURATION)) {
            return this.requests
        }

        if (this.isLoading) {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!this.isLoading) {
                        clearInterval(checkInterval)
                        resolve(this.requests)
                    }
                }, 100)
            })
        }

        return this.refresh(projectId)
    }

    public async refresh(projectId?: string | null): Promise<PaymentRequest[]> {
        this.isLoading = true
        this.notify()

        try {
            const data = await getAllPaymentRequests(projectId)
            this.requests = data as PaymentRequest[]
            this.lastUpdated = Date.now()
            return this.requests
        } catch (error) {
            console.error(`[PaymentRequestStore] Refresh FAILED:`, error)
            return this.requests
        } finally {
            this.isLoading = false
            this.notify()
        }
    }

    public getIsLoading() {
        return this.isLoading
    }

    public getCachedRequests() {
        return this.requests
    }
}

export const paymentRequestStore = PaymentRequestStore.getInstance()
