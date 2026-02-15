'use client'

import { getAllPersonnel } from '@/lib/actions/personnel'

export interface Personnel extends Record<string, any> {
    email: string
    full_name: string
    department: string | null
    position: string | null
    avatar_url: string | null
    phone_number: string | null
    work_status: string | null
    project_ids: string[] | null
    employee_id: string | null
    join_date: string | null
    contract_type: string | null
    access_level: number
}

class PersonnelStore {
    private static instance: PersonnelStore
    private personnel: Personnel[] = []
    private isLoading: boolean = false
    private lastFetched: number = 0
    private CACHE_DURATION = 1000 * 60 * 5 // 5 minutes
    private listeners: Set<(personnel: Personnel[]) => void> = new Set()

    private constructor() { }

    public static getInstance() {
        if (!PersonnelStore.instance) {
            PersonnelStore.instance = new PersonnelStore()
        }
        return PersonnelStore.instance
    }

    public async getPersonnel(forceRefresh = false): Promise<Personnel[]> {
        const now = Date.now()
        if (!forceRefresh && this.personnel.length > 0 && (now - this.lastFetched < this.CACHE_DURATION)) {
            return this.personnel
        }

        if (this.isLoading) {
            return new Promise((resolve) => {
                const checkLoading = () => {
                    if (!this.isLoading) {
                        resolve(this.personnel)
                    } else {
                        setTimeout(checkLoading, 100)
                    }
                }
                checkLoading()
            })
        }

        return this.refresh()
    }

    public async refresh(): Promise<Personnel[]> {
        this.isLoading = true
        try {
            const data = await getAllPersonnel()
            this.personnel = data.map(p => ({
                ...p,
                email: p.email,
                full_name: p.full_name,
                department: p.department,
                position: p.position,
                avatar_url: p.avatar_url,
                phone_number: p.phone_number,
                work_status: p.work_status,
                project_ids: p.project_ids || [],
                employee_id: p.employee_id,
                join_date: p.join_date,
                contract_type: p.contract_type,
                access_level: p.access_level || 4
            }))
            this.lastFetched = Date.now()
            this.notifyListeners()
            return this.personnel
        } catch (error) {
            console.error('Error fetching personnel:', error)
            return this.personnel
        } finally {
            this.isLoading = false
        }
    }

    public getCachedPersonnel() {
        return this.personnel
    }

    public getIsLoading() {
        return this.isLoading
    }

    public subscribe(listener: (personnel: Personnel[]) => void) {
        this.listeners.add(listener)
        if (this.personnel.length > 0) {
            listener(this.personnel)
        }
        return () => {
            this.listeners.delete(listener)
        }
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.personnel))
    }
}

export const personnelStore = PersonnelStore.getInstance()
