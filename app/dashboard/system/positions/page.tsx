'use client'

import { useState, useEffect } from 'react'
import { Briefcase } from 'lucide-react'
import { getJobPositions, addJobPosition } from '@/lib/actions/system'
import { toast } from 'sonner'
import { DataManagementTable } from '@/components/system/data-management-table'

export default function JobPositionsPage() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)
            const result = await getJobPositions()
            setData(result || [])
        } catch (error) {
            toast.error("Không thể tải danh sách chức vụ")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (formData: any) => {
        try {
            await addJobPosition(formData)
            toast.success("Thêm chức vụ thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi thêm chức vụ")
            throw error
        }
    }

    return (
        <DataManagementTable
            title="Quản lý Chức vụ"
            subtitle="Quản lý danh sách các vị trí công việc trong công ty."
            icon={Briefcase}
            columns={[
                { header: 'Tên chức vụ', key: 'name' },
                { header: 'Mô tả', key: 'description' },
            ]}
            data={data}
            loading={loading}
            onAdd={handleAdd}
            fields={[
                { id: 'name', label: 'Tên chức vụ', required: true, placeholder: 'VD: Trưởng phòng, Kế toán trưởng...' },
                { id: 'description', label: 'Mô tả', placeholder: 'Phạm vi công việc...' },
            ]}
        />
    )
}
