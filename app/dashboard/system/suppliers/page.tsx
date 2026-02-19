'use client'

import { useState, useEffect } from 'react'
import { SupplierList } from '@/components/system/supplier-list'
import { getProjects } from '@/lib/actions/projects'

export default function SuppliersPage() {
    const [projects, setProjects] = useState<any[]>([])

    useEffect(() => {
        async function loadProjects() {
            try {
                const data = await getProjects()
                setProjects(data || [])
            } catch (error) {
                console.error("Error loading projects:", error)
            }
        }
        loadProjects()
    }, [])

    return (
        <SupplierList projects={projects} />
    )
}
