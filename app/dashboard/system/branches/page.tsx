'use client'

import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { getBranches, addBranch } from '@/lib/actions/system'
import { toast } from 'sonner'
import { DataManagementTable } from '@/components/system/data-management-table'

export default function BranchesPage() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)
            const result = await getBranches()
            setData(result || [])
        } catch (error) {
            toast.error("Không thể tải danh sách chi nhánh")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (formData: any) => {
        try {
            await addBranch(formData)
            toast.success("Thêm chi nhánh thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi thêm chi nhánh")
            throw error
        }
    }

    return (
        <DataManagementTable
            title="Quản lý Chi nhánh"
            subtitle="Hệ thống các văn phòng, chi nhánh và kho bãi của công ty."
            icon={MapPin}
            columns={[
                { header: 'Tên chi nhánh', key: 'name' },
                { header: 'Địa chỉ', key: 'address' },
                { header: 'Điện thoại', key: 'phone' },
                { header: 'Quản lý', key: 'manager_name' },
            ]}
            data={data}
            loading={loading}
            onAdd={handleAdd}
            fields={[
                { id: 'name', label: 'Tên chi nhánh', required: true, placeholder: 'VD: Chi nhánh miền Bắc...' },
                { id: 'address', label: 'Địa chỉ', placeholder: 'Số 1, đường A, quận B...' },
                { id: 'phone', label: 'Số điện thoại', placeholder: '024...' },
                { id: 'manager_name', label: 'Người phụ trách', placeholder: 'Họ và tên...' },
                { id: 'description', label: 'Ghi chú', placeholder: 'Thông tin thêm...' },
            ]}
        />
    )
}
