'use client'

import { useState, useMemo, useEffect } from 'react'
import { Layers, Plus, Search, Calendar, User, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { DataManagementTable } from '../system/data-management-table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { addProjectItem, updateProjectItem, deleteProjectItem } from '@/lib/actions/project-items'
import { getUsers } from '@/lib/actions/projects'
import { ProjectItemDialog } from './project-item-dialog'

interface ProjectItemListProps {
    initialItems?: any[]
    projects?: { project_id: string, project_name: string }[]
    projectId?: string
}

export function ProjectItemList({ initialItems = [], projects = [], projectId }: ProjectItemListProps) {
    const [items, setItems] = useState(initialItems)
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchUsers = async () => {
            const data = await getUsers()
            setUsers(data || [])
        }
        fetchUsers()
    }, [])

    const fields = useMemo(() => {
        const base = [
            { id: 'wbs_code', label: 'Mã hạng mục (WBS)', placeholder: 'VD: HM-01, 1.1...' },
            { id: 'item_name', label: 'Tên hạng mục *', required: true, placeholder: 'Tên chi tiết hạng mục...' },
            { id: 'unit', label: 'Đơn vị tính', placeholder: 'VD: m2, kg, trọn gói...' },
            { id: 'quantity', label: 'Khối lượng', type: 'number', placeholder: '0.00' },
            { id: 'planned_start_date', label: 'Ngày bắt đầu kế hoạch', type: 'date' },
            { id: 'duration_days', label: 'Số ngày thực hiện', type: 'number', placeholder: '0' },
            { id: 'planned_end_date', label: 'Ngày kết thúc kế hoạch', type: 'date' },
            { id: 'planned_cost', label: 'Chi phí kế hoạch', type: 'number', placeholder: '0' },
            { id: 'responsible_user_id', label: 'Người phụ trách (Email)', placeholder: 'Email nhân sự...' },
        ]

        if (!projectId && projects.length > 0) {
            return [
                {
                    id: 'project_id',
                    label: 'Dự án *',
                    type: 'select',
                    required: true,
                    options: projects.map(p => ({ value: p.project_id, label: p.project_name }))
                },
                ...base
            ]
        }
        return base
    }, [projectId, projects])

    const columns = useMemo(() => {
        const cols = [
            {
                header: 'WBS',
                key: 'wbs_code',
                width: '80px',
                render: (val: string) => <span className="font-mono text-[11px] text-slate-500">{val || "-"}</span>
            },
            {
                header: 'Tên hạng mục',
                key: 'item_name',
                render: (val: string, row: any) => (
                    <div className="flex flex-col py-0.5">
                        <span className="text-[13px] font-medium text-slate-700">{val}</span>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {row.planned_start_date ? new Date(row.planned_start_date).toLocaleDateString('vi-VN') : '...'}
                            </span>
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {row.responsible_user_id || 'Chưa phân công'}
                            </span>
                        </div>
                    </div>
                )
            },
            {
                header: 'ĐVT',
                key: 'unit',
                render: (val: string) => <span className="text-[12px] text-slate-500">{val || "-"}</span>
            },
            {
                header: 'Khối lượng',
                key: 'quantity',
                render: (val: number) => <span className="text-[12px] font-medium text-slate-700">{val?.toLocaleString('vi-VN') || "0"}</span>
            },
            {
                header: 'Chi phí (Kế hoạch)',
                key: 'planned_cost',
                render: (val: number) => (
                    <span className="text-[12px] font-semibold text-blue-600">
                        {val?.toLocaleString('vi-VN')}
                    </span>
                )
            },
            {
                header: 'Tiến độ',
                key: 'completed_quantity',
                render: (val: number, row: any) => {
                    const percent = row.quantity > 0 ? Math.round((val / row.quantity) * 100) : 0
                    return (
                        <div className="flex flex-col gap-1 w-24">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="font-medium text-slate-500">{percent}%</span>
                                <span className="text-slate-400">{val?.toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500/60 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(percent, 100)}%` }}
                                />
                            </div>
                        </div>
                    )
                }
            }
        ]

        if (!projectId) {
            cols.splice(1, 0, {
                header: 'Dự án',
                key: 'project_id',
                render: (val: string, row: any) => (
                    <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md border border-slate-100">
                        {row.project?.project_name || val}
                    </span>
                )
            })
        }

        return cols
    }, [projectId])

    const sanitizeData = (data: any) => {
        const cleaned = { ...data }
        const numericFields = ['quantity', 'duration_days', 'planned_cost', 'completed_quantity', 'actual_cost']
        const dateFields = ['planned_start_date', 'planned_end_date', 'actual_start_date', 'actual_end_date']

        numericFields.forEach(field => {
            if (cleaned[field] === '' || cleaned[field] === undefined) {
                cleaned[field] = null
            } else if (typeof cleaned[field] === 'string') {
                cleaned[field] = parseFloat(cleaned[field].replace(/,/g, '')) || 0
            }
        })

        dateFields.forEach(field => {
            if (cleaned[field] === '' || cleaned[field] === undefined) {
                cleaned[field] = null
            }
        })

        if (!cleaned.responsible_user_id) cleaned.responsible_user_id = null

        return cleaned
    }

    const handleAdd = async (data: any) => {
        try {
            const cleanedData = sanitizeData(data)
            const result = await addProjectItem({
                ...cleanedData,
                project_id: projectId || cleanedData.project_id
            })
            setItems([result, ...items])
            toast.success('Đã thêm hạng mục mới')
        } catch (error) {
            toast.error('Lỗi khi thêm hạng mục')
            throw error
        }
    }

    const handleEdit = async (id: string, data: any) => {
        try {
            const cleanedData = sanitizeData(data)
            const result = await updateProjectItem(id, cleanedData)
            setItems(items.map(i => i.id === id ? result : i))
            toast.success('Đã cập nhật hạng mục')
        } catch (error) {
            toast.error('Lỗi khi cập nhật hạng mục')
            throw error
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteProjectItem(id)
            setItems(items.filter(i => i.id !== id))
            toast.success('Đã xóa hạng mục')
        } catch (error) {
            toast.error('Lỗi khi xóa hạng mục')
            throw error
        }
    }

    return (
        <DataManagementTable
            title={projectId ? "Hạng mục dự án" : "Dòng Hạng mục"}
            subtitle="Phân cấp dự án thành các phần việc chính để quản lý khối lượng và chi phí."
            icon={Layers}
            columns={columns}
            data={items}
            loading={loading}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            fields={fields}
            searchKey="item_name"
            defaultValues={{
                quantity: 0,
                duration_days: 1,
                planned_cost: 0
            }}
            renderDialog={(props: any) => (
                <ProjectItemDialog
                    {...props}
                    projects={projects}
                    users={users}
                    projectId={projectId}
                />
            )}
        />
    )
}
