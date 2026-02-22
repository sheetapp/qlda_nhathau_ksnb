'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Warehouse, Building2 } from 'lucide-react'
import {
    getWarehouses,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse
} from '@/lib/actions/system'
import { getProjects } from '@/lib/actions/projects'
import { DataManagementTable } from '@/components/system/data-management-table'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function WarehouseManagementPage() {
    const [warehouses, setWarehouses] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const [wData, pData] = await Promise.all([
                getWarehouses(),
                getProjects()
            ])
            setWarehouses(wData || [])
            setProjects(pData || [])
        } catch (error) {
            console.error(error)
            toast.error("Không thể tải danh sách kho")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleAdd = async (formData: any) => {
        try {
            const dataToInsert = {
                ...formData,
                project_id: formData.project_id || null
            }
            await addWarehouse(dataToInsert)
            toast.success("Thêm kho thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi thêm kho")
            throw error
        }
    }

    const handleEdit = async (id: string, formData: any) => {
        try {
            const dataToUpdate = {
                ...formData,
                project_id: formData.project_id || null
            }
            await updateWarehouse(id, dataToUpdate)
            toast.success("Cập nhật kho thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi cập nhật kho")
            throw error
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteWarehouse(id)
            toast.success("Xóa kho thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi xóa kho")
            throw error
        }
    }

    const columns = useMemo(() => [
        {
            header: 'Tên kho',
            key: 'name',
            render: (val: string) => <span className="font-semibold text-slate-800 text-[13px]">{val}</span>
        },
        {
            header: 'Địa chỉ',
            key: 'address',
            render: (val: string) => <span className="text-slate-600 text-[13px]">{val || "-"}</span>
        },
        {
            header: 'Mô tả',
            key: 'description',
            render: (val: string) => <span className="text-[12px] text-slate-500 line-clamp-1">{val || "-"}</span>
        },
        {
            header: 'Dự án',
            key: 'project_id',
            width: '200px',
            render: (val: string, item: any) => {
                const projectName = item.project?.project_name
                return val ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-medium text-[11px]">
                        {projectName || val}
                    </Badge>
                ) : (
                    <span className="text-[11px] text-slate-400 italic">Tổng kho</span>
                )
            }
        },
        {
            header: 'Thủ kho',
            key: 'manager_name',
            render: (val: string) => <span className="text-slate-600 text-[13px] font-medium">{val || "-"}</span>
        },
        {
            header: 'Số điện thoại',
            key: 'manager_phone',
            render: (val: string) => <span className="text-slate-500 text-[12px] font-mono">{val || "-"}</span>
        },
    ], [])

    const fields = useMemo(() => [
        { id: 'name', label: 'Tên kho *', required: true, placeholder: 'VD: Kho vật tư A, Kho công trường...' },
        { id: 'address', label: 'Địa chỉ kho', placeholder: 'Địa chỉ chi tiết của kho...' },
        {
            id: 'project_id',
            label: 'Dự án',
            type: 'select',
            options: [
                { value: '', label: 'Tổng kho (Của công ty)' },
                ...projects.map(p => ({ value: p.project_id, label: p.project_name }))
            ]
        },
        { id: 'manager_name', label: 'Thủ kho', placeholder: 'Họ tên thủ kho...' },
        { id: 'manager_phone', label: 'Số điện thoại thủ kho', placeholder: 'Số liên lạc...' },
        { id: 'description', label: 'Mô tả kho', placeholder: 'Mô tả đặc điểm kho...', fullWidth: true }
    ], [projects])

    const filters = useMemo(() => [
        {
            id: 'project_id',
            label: 'Dự án',
            options: projects.map(p => ({ label: p.project_name, value: p.project_id }))
        }
    ], [projects])

    return (
        <DataManagementTable
            title="Quản lý Kho bãi"
            subtitle="Danh mục các kho chứa vật tư, thiết bị của dự án hoặc công ty."
            icon={Warehouse}
            columns={columns}
            data={warehouses}
            loading={loading}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            fields={fields}
            filters={filters}
            searchKey="name"
        />
    )
}
