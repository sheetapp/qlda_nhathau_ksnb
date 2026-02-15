'use client'

import { getAllTasks } from './actions/tasks'

export interface Task extends Record<string, any> {
    task_id: string
    project_id: string
    task_name: string
    task_category: string | null
    task_unit: string | null
    wbs: string | null
    description: string | null
    start_date: string | null
    end_date: string | null
    status: string | null
    projects?: {
        project_name: string
    } | null
}

class TaskStore {
    private static instance: TaskStore
    private tasks: Task[] = []
    private isLoading: boolean = false
    private lastUpdated: number = 0
    private CACHE_DURATION = 1000 * 60 * 5 // 5 minutes
    private listeners: Set<(tasks: Task[]) => void> = new Set()

    private constructor() { }

    public static getInstance(): TaskStore {
        if (!TaskStore.instance) {
            TaskStore.instance = new TaskStore()
        }
        return TaskStore.instance
    }

    public subscribe(listener: (tasks: Task[]) => void) {
        this.listeners.add(listener)
        // Immediately trigger with current data
        if (this.tasks.length > 0) {
            listener(this.tasks)
        }
        return () => {
            this.listeners.delete(listener)
        }
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.tasks))
    }

    public async getTasks(forceRefresh = false): Promise<Task[]> {
        const now = Date.now()
        // If data exists and not forcing refresh and within cache duration, return cached
        if (this.tasks.length > 0 && !forceRefresh && (now - this.lastUpdated < this.CACHE_DURATION)) {
            return this.tasks
        }

        // Avoid multiple simultaneous loads
        if (this.isLoading) {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!this.isLoading) {
                        clearInterval(checkInterval)
                        resolve(this.tasks)
                    }
                }, 100)
            })
        }

        return this.refresh()
    }

    public async refresh(): Promise<Task[]> {
        this.isLoading = true
        try {
            const data = await getAllTasks()
            this.tasks = data as Task[]
            this.lastUpdated = Date.now()
            this.notify()
            return this.tasks
        } catch (error) {
            console.error('Failed to fetch tasks:', error)
            return this.tasks // Return stale data on error if exists
        } finally {
            this.isLoading = false
        }
    }

    public getIsLoading() {
        return this.isLoading
    }

    public getCachedTasks() {
        return this.tasks
    }
}

export const taskStore = TaskStore.getInstance()
