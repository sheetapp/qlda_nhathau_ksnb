'use client'

import { useState, useEffect } from 'react'
import { ClipboardList } from 'lucide-react'
import { getJobFunctions, addJobFunction, getDepartments, getJobPositions } from '@/lib/actions/system'
import { toast } from 'sonner'
import { DataManagementTable } from '@/components/system/data-management-table'

export default function JobFunctionsPage() {
    const [data, setData] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [positions, setPositions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)
            const [funcResult, deptResult, posResult] = await Promise.all([
                getJobFunctions(),
                getDepartments(),
                getJobPositions()
            ])
            setData(funcResult || [])
            setDepartments(deptResult || [])
            setPositions(posResult || [])
        } catch (error) {
            toast.error("Không thể tải danh sách chức năng nhiệm vụ")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (formData: any) => {
        try {
            await addJobFunction(formData)
            toast.success("Thêm chức năng nhiệm vụ thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi thêm chức năng nhiệm vụ")
            throw error
        }
    }

    return (
        <DataManagementTable
            title="Sứ mệnh & Nhiệm vụ"
            subtitle="Chức năng phòng ban và nhiệm vụ, bộ chỉ số KPI của từng vị trí."
            icon={ClipboardList}
            columns={[
                { header: 'Phòng ban', key: 'department', render: (val) => val?.name },
                { header: 'Chức vụ', key: 'position', render: (val) => val?.name },
                { header: 'Mô tả nhiệm vụ', key: 'description' },
            ]}
            data={data}
            loading={loading}
            onAdd={handleAdd}
            searchKey="description"
            fields={[
                {
                    id: 'department_id',
                    label: 'Phòng ban',
                    type: 'select',
                    required: true,
                    options: departments.map(d => ({ label: d.name, value: d.id }))
                },
                {
                    id: 'position_id',
                    label: 'Chức vụ',
                    type: 'select',
                    required: true,
                    options: positions.map(p => ({ label: p.name, value: p.id }))
                },
                { id: 'description', label: 'Nhiệm vụ chính *', required: true, placeholder: 'VD: Quản lý dòng tiền, Đảm bảo tiến độ...' },
            ]}
        />
    )
}
