'use client'

import { useState, useMemo, useEffect } from 'react'
import { Layers, Plus, Search, Calendar, User, MoreHorizontal, Pencil, Trash2, Download, Upload, FileDown, FileUp, Loader2 } from 'lucide-react'
import { DataManagementTable } from '../system/data-management-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { addProjectItem, updateProjectItem, deleteProjectItem, deleteProjectItemsBulk, createProjectItemsBulk } from '@/lib/actions/project-items'
import { getUsers } from '@/lib/actions/projects'
import { ProjectItemDialog } from './project-item-dialog'
import * as XLSX from 'xlsx'
import { useRef } from 'react'

interface ProjectItemListProps {
    initialItems?: any[]
    projects?: { project_id: string, project_name: string }[]
    projectId?: string
}

export function ProjectItemList({ initialItems = [], projects = [], projectId }: ProjectItemListProps) {
    const [items, setItems] = useState(initialItems)
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const fetchUsers = async () => {
            const data = await getUsers()
            setUsers(data || [])
        }
        fetchUsers()
    }, [])

    const handleExportExcel = () => {
        try {
            const data = items.map((item, index) => ({
                'STT': index + 1,
                'Dự án': item.project?.project_name || item.project_id,
                'WBS': item.wbs_code,
                'Tên hạng mục': item.item_name,
                'Đơn vị tính': item.unit,
                'Khối lượng': item.quantity,
                'Ngày bắt đầu': item.planned_start_date,
                'Số ngày': item.duration_days,
                'Ngày kết thúc': item.planned_end_date,
                'Chi phí kế hoạch': item.planned_cost,
                'Người phụ trách': item.responsible_user_id
            }))

            const ws = XLSX.utils.json_to_sheet(data)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Hạng mục")
            XLSX.writeFile(wb, "Danh_sach_hang_muc.xlsx")
            toast.success('Đã xuất file Excel')
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Lỗi khi xuất file Excel')
        }
    }

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (evt) => {
            try {
                setLoading(true)
                const bstr = evt.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws) as any[]

                const itemsToCreate = data.map((row: any) => {
                    // Find project
                    const projectName = row['Dự án']
                    const project = projects.find(p => p.project_name === projectName)
                    const targetProjectId = project?.project_id || projectId

                    if (!targetProjectId && !projectId) {
                        return null
                    }

                    return {
                        project_id: targetProjectId,
                        wbs_code: row['WBS'] || row['M mã WBS'] || null,
                        item_name: row['Tên hạng mục'] || row['Hạng mục'] || 'Chưa đặt tên',
                        unit: row['Đơn vị tính'] || row['ĐVT'] || null,
                        quantity: parseFloat(row['Khối lượng'] || 0),
                        planned_start_date: row['Ngày bắt đầu'] || null,
                        duration_days: parseInt(row['Số ngày'] || 0),
                        planned_end_date: row['Ngày kết thúc'] || null,
                        planned_cost: parseFloat(row['Chi phí kế hoạch'] || 0),
                        responsible_user_id: row['Người phụ trách'] || null
                    }
                }).filter(t => t !== null)

                if (itemsToCreate.length > 0) {
                    const results = await createProjectItemsBulk(itemsToCreate)
                    setItems([...results, ...items])
                    toast.success(`Đã nhập ${itemsToCreate.length} hạng mục`)
                } else {
                    toast.error('Không tìm thấy dữ liệu hợp lệ')
                }
            } catch (error) {
                console.error('Import error:', error)
                toast.error('Lỗi khi nhập file Excel')
            } finally {
                setLoading(false)
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        }
        reader.readAsBinaryString(file)
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return
        if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} hạng mục đã chọn?`)) return

        try {
            setLoading(true)
            await deleteProjectItemsBulk(selectedIds)
            setItems(items.filter(i => !selectedIds.includes(i.id)))
            setSelectedIds([])
            toast.success('Đã xóa các hạng mục đã chọn')
        } catch (error) {
            toast.error('Lỗi khi xóa hàng loạt')
        } finally {
            setLoading(false)
        }
    }

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
        <div className="space-y-4">
            {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl mb-4 animate-in fade-in slide-in-from-top-2">
                    <span className="text-[13px] font-medium text-blue-700">
                        Đã chọn {selectedIds.length} hạng mục
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 text-[12px] font-bold"
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Xóa hàng loạt
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedIds([])}
                        className="h-8 text-slate-500 hover:bg-slate-100 text-[12px]"
                    >
                        Hủy chọn
                    </Button>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportExcel}
                className="hidden"
                accept=".xlsx, .xls"
            />

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
                showSelection={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                filters={!projectId ? [
                    {
                        id: 'project_id',
                        label: 'Dự án',
                        options: projects.map(p => ({ value: p.project_id, label: p.project_name }))
                    }
                ] : []}
                actions={[
                    {
                        label: 'Xuất Excel',
                        icon: Download,
                        onClick: handleExportExcel,
                        className: "bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20"
                    },
                    {
                        label: 'Nhập Excel',
                        icon: Upload,
                        onClick: () => fileInputRef.current?.click(),
                        className: "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20"
                    }
                ]}
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
        </div>
    )
}
