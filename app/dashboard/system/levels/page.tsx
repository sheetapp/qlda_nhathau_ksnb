'use client'

import { useState, useEffect } from 'react'
import { Layers } from 'lucide-react'
import { getJobLevels, addJobLevel } from '@/lib/actions/system'
import { toast } from 'sonner'
import { DataManagementTable } from '@/components/system/data-management-table'

export default function JobLevelsPage() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)
            const result = await getJobLevels()
            setData(result || [])
        } catch (error) {
            toast.error("Không thể tải danh sách cấp bậc")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (formData: any) => {
        try {
            await addJobLevel({
                ...formData,
                level_score: Number(formData.level_score)
            })
            toast.success("Thêm cấp bậc thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi thêm cấp bậc")
            throw error
        }
    }

    return (
        <DataManagementTable
            title="Quản lý Cấp bậc"
            subtitle="Hệ thống thang bảng lương và level nhân sự."
            icon={Layers}
            columns={[
                { header: 'Tên cấp bậc', key: 'name' },
                { header: 'Điểm Level', key: 'level_score' },
                { header: 'Mô tả', key: 'description' },
            ]}
            data={data}
            loading={loading}
            onAdd={handleAdd}
            fields={[
                { id: 'name', label: 'Tên cấp bậc', required: true, placeholder: 'VD: Level 1, Senior...' },
                { id: 'level_score', label: 'Điểm Level (Sắp xếp)', type: 'number', required: true, placeholder: 'VD: 100, 200...' },
                { id: 'description', label: 'Mô tả', placeholder: 'Ghi chú thêm...' },
            ]}
        />
    )
}
