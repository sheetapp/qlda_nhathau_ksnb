'use client'

import { useState, useEffect } from 'react'
import { Building2 } from 'lucide-react'
import { getDepartments, addDepartment, updateDepartment, deleteDepartment } from '@/lib/actions/system'
import { toast } from 'sonner'
import { DataManagementTable } from '@/components/system/data-management-table'

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)
            const data = await getDepartments()
            setDepartments(data || [])
        } catch (error) {
            console.error(error)
            toast.error("Không thể tải danh sách phòng ban")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (formData: any) => {
        try {
            await addDepartment(formData)
            toast.success("Thêm phòng ban thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi thêm phòng ban")
            throw error
        }
    }

    const handleEdit = async (id: string, formData: any) => {
        try {
            // Remove parent information from formData if it exists as an object
            const { parent, ...dataToUpdate } = formData
            await updateDepartment(id, dataToUpdate)
            toast.success("Cập nhật phòng ban thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi cập nhật phòng ban")
            throw error
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteDepartment(id)
            toast.success("Xóa phòng ban thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi xóa phòng ban")
            throw error
        }
    }

    const parentOptions = departments
        .filter(d => !d.parent_id) // Only top-level for now, or allow nesting
        .map(d => ({ label: d.name, value: d.id }))

    return (
        <DataManagementTable
            title="Quản lý Phòng ban"
            subtitle="Cơ cấu tổ chức đơn vị."
            icon={Building2}
            columns={[
                { header: 'Tên phòng ban', key: 'name' },
                { header: 'Mô tả', key: 'description' },
            ]}
            data={departments}
            loading={loading}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            hierarchical={true}
            fields={[
                { id: 'name', label: 'Tên phòng ban *', required: true, placeholder: 'VD: Phòng Kế toán...' },
                {
                    id: 'parent_id',
                    label: 'Phòng ban cha',
                    type: 'select',
                    options: parentOptions,
                    placeholder: 'Chọn phòng ban cha (nếu có)'
                },
                { id: 'description', label: 'Mô tả', placeholder: 'Ghi chú thêm...' },
            ]}
        />
    )
}
