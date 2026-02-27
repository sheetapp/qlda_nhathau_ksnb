'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Layers, Search, Calendar, User, Download, Upload, Loader2, LayoutList, GanttChartSquare, Trash2, FolderKanban, Plus, Pencil } from 'lucide-react'
import { TaskDialog } from './task-dialog'
import { getAllTasks } from '@/lib/actions/tasks'
import { format, parseISO } from 'date-fns'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { DataManagementTable } from '../system/data-management-table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { addProjectItem, updateProjectItem, deleteProjectItem, deleteProjectItemsBulk, createProjectItemsBulk, getProjectItems } from '@/lib/actions/project-items'
import { getUsers } from '@/lib/actions/projects'
import { ProjectItemDialog } from './project-item-dialog'
import { GanttChart, STATUS_COLORS } from './gantt-chart'
import type { GanttItem } from './gantt-chart'
import * as XLSX from 'xlsx'
import { cn } from '@/lib/utils'

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
    const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list')
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [addFormData, setAddFormData] = useState<any>({
        item_name: '',
        wbs_code: '',
        planned_start_date: '',
        duration_days: 1,
        planned_end_date: '',
        quantity: 0,
        planned_cost: 0,
        unit: '',
        responsible_user_id: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [tasks, setTasks] = useState<any[]>([])
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<any>(null)
    const [projectFilter, setProjectFilter] = useState(projectId || 'all')
    const [selectedGanttItem, setSelectedGanttItem] = useState<GanttItem | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const refreshData = async () => {
        setLoading(true)
        const pid = projectId || (projectFilter !== 'all' ? projectFilter : null)
        try {
            const [tasksData, itemsData] = await Promise.all([
                getAllTasks(pid),
                getProjectItems(pid || undefined)
            ])
            setTasks(tasksData || [])
            setItems(itemsData || [])
        } catch (error) {
            console.error('Error refreshing data:', error)
            toast.error('Có lỗi xảy ra khi cập nhật dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const usersData = await getUsers()
            setUsers(usersData || [])

            // Fetch tasks for the project(s)
            const tasksData = await getAllTasks(projectId || (projectFilter !== 'all' ? projectFilter : null))
            setTasks(tasksData || [])
            setLoading(false)
        }
        fetchData()
    }, [projectId, projectFilter])

    const filteredItemsItems = useMemo(() => {
        return items.filter(item => {
            if (projectFilter !== 'all' && item.project_id !== projectFilter) return false
            return true
        })
    }, [items, projectFilter])

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

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await handleAdd(addFormData)
            setIsAddDialogOpen(false)
        } catch (error) {
            // handleAdd already toasts
        } finally {
            setIsSubmitting(false)
        }
    }

    const openAddItemDialog = () => {
        setAddFormData({
            item_name: '',
            wbs_code: '',
            planned_start_date: new Date().toISOString().split('T')[0],
            duration_days: 1,
            planned_end_date: '',
            quantity: 0,
            planned_cost: 0,
            unit: '',
            responsible_user_id: '',
            project_id: projectId || ''
        })
        setIsAddDialogOpen(true)
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

    // Build GanttItem list for Gantt view
    const ganttItems: GanttItem[] = filteredItemsItems.map(item => ({
        id: item.id,
        label: item.item_name,
        subLabel: item.wbs_code ? `WBS: ${item.wbs_code}` : undefined,
        startDate: item.planned_start_date,
        endDate: item.planned_end_date,
        progress: item.quantity > 0 ? (item.completed_quantity / item.quantity) * 100 : 0,
        status: item.actual_end_date ? 'Hoàn tất' : (item.actual_start_date ? 'Đang thực hiện' : 'Chưa thực hiện'),
        projectId: item.project_id
    }))

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

            {viewMode === 'gantt' ? (
                <div className="space-y-3">
                    {/* Gantt toolbar */}
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-4">
                            <div>
                                <h3 className="text-[14px] font-semibold text-slate-700">Hạng mục dự án</h3>
                                <p className="text-[12px] text-slate-400 mt-0.5">Phân cấp dự án thành các phần việc chính.</p>
                            </div>

                            {!projectId && projects.length > 0 && (
                                <Select value={projectFilter} onValueChange={setProjectFilter}>
                                    <SelectTrigger className="w-[200px] h-9 rounded-xl border-border/40 bg-card/40 text-[13px] font-medium text-slate-900 shrink-0">
                                        <FolderKanban className="h-3.5 w-3.5 mr-2 text-slate-500 shrink-0" />
                                        <SelectValue placeholder="Chọn dự án" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="all">Tất cả dự án</SelectItem>
                                        {projects.map(p => (
                                            <SelectItem key={p.project_id} value={p.project_id}>{p.project_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted p-0.5 rounded-lg">
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all',
                                    'text-slate-500 hover:text-slate-700'
                                )}
                            >
                                <LayoutList className="h-3.5 w-3.5" /> Danh sách
                            </button>
                            <button
                                onClick={() => setViewMode('gantt')}
                                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all',
                                    viewMode === 'gantt' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                                )}
                            >
                                <GanttChartSquare className="h-3.5 w-3.5" /> Gantt
                            </button>
                        </div>
                    </div>
                    <GanttChart
                        items={ganttItems}
                        onAddItem={() => {
                            if (selectedGanttItem) {
                                // Add Task to current group
                                setEditingTask({
                                    project_item_id: selectedGanttItem.id,
                                    task_name: '',
                                    project_id: selectedGanttItem.projectId || projectId || (projectFilter !== 'all' ? projectFilter : ''),
                                    start_date: new Date().toISOString().split('T')[0],
                                    end_date: new Date().toISOString().split('T')[0],
                                    status: 'Chờ thực hiện'
                                })
                                setIsTaskDialogOpen(true)
                            } else {
                                openAddItemDialog()
                            }
                        }}
                        addItemLabel={selectedGanttItem ? `Thêm công việc cho "${selectedGanttItem.label}"` : "Thêm hạng mục mới"}
                        selectedId={selectedGanttItem?.id}
                        onSelect={setSelectedGanttItem}
                    />

                    {/* Selection Detail View (Properties) */}
                    {selectedGanttItem && (
                        <div className="mt-4 p-5 bg-white dark:bg-slate-900 border border-border/50 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between mb-4 border-b border-border/10 pb-3">
                                <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    Chi tiết Hạng mục (Category Properties)
                                </h4>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        className="h-7 text-[11px] rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border-none px-3"
                                        onClick={() => {
                                            setEditingTask({
                                                project_item_id: selectedGanttItem.id,
                                                task_name: '',
                                                project_id: selectedGanttItem.projectId || projectId || (projectFilter !== 'all' ? projectFilter : ''),
                                                start_date: new Date().toISOString().split('T')[0],
                                                end_date: new Date().toISOString().split('T')[0],
                                                status: 'Chờ thực hiện'
                                            })
                                            setIsTaskDialogOpen(true)
                                        }}
                                    >
                                        <Plus className="h-3 w-3 mr-1.5" /> Thêm công việc
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedGanttItem(null)} className="h-7 text-[11px] rounded-lg">Đóng</Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tên hạng mục</p>
                                    <p className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">{selectedGanttItem.label}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mã WBS / ID</p>
                                    <p className="text-[13px] font-mono text-slate-600 dark:text-slate-400">{selectedGanttItem.id}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian kế hoạch</p>
                                    <p className="text-[13px] text-slate-600 dark:text-slate-400">
                                        {selectedGanttItem.startDate ? format(parseISO(selectedGanttItem.startDate), 'dd/MM/yyyy') : '...'}
                                        {' - '}
                                        {selectedGanttItem.endDate ? format(parseISO(selectedGanttItem.endDate), 'dd/MM/yyyy') : '...'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</p>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", selectedGanttItem.status ? STATUS_COLORS[selectedGanttItem.status] || "bg-slate-300" : "bg-slate-300")} />
                                        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{selectedGanttItem.status || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Task List in detail view */}
                            <div className="mt-6 pt-4 border-t border-border/10">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Danh sách công việc trong hạng mục</p>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 font-bold">
                                        {tasks.filter(t => t.project_item_id === selectedGanttItem.id).length} công việc
                                    </span>
                                </div>
                                <div className="space-y-1.5 overflow-y-auto max-h-[150px] pr-2 custom-scrollbar">
                                    {tasks.filter(t => t.project_item_id === selectedGanttItem.id).length > 0 ? (
                                        tasks.filter(t => t.project_item_id === selectedGanttItem.id).map(task => (
                                            <div key={task.task_id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-colors group/task">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", STATUS_COLORS[task.status || ''] || "bg-slate-300")} />
                                                    <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200 truncate">{task.task_name}</span>
                                                    <span className="text-[10px] text-slate-400 shrink-0 font-mono hidden sm:inline">{task.task_id}</span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className="text-[11px] text-slate-500 font-medium">{task.status}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover/task:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setEditingTask(task)
                                                            setIsTaskDialogOpen(true)
                                                        }}
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-4 text-center text-slate-400 text-[12px] italic">
                                            Chưa có công việc nào trong hạng mục này.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border/10">
                                <div className="flex items-center gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiến độ khối lượng</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all" style={{ width: `${selectedGanttItem.progress || 0}%` }} />
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-600">{Math.round(selectedGanttItem.progress || 0)}%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WBS Code</p>
                                        <p className="text-[13px] text-slate-600 dark:text-slate-400">{selectedGanttItem.subLabel || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Dialog for Gantt View */}
                    <ProjectItemDialog
                        open={isAddDialogOpen}
                        onOpenChange={setIsAddDialogOpen}
                        isEditMode={false}
                        formData={addFormData}
                        setFormData={setAddFormData}
                        handleSubmit={handleAddSubmit}
                        isSubmitting={isSubmitting}
                        projects={projects}
                        users={users}
                        projectId={projectId || (projectFilter !== 'all' ? projectFilter : '')}
                        onSuccess={refreshData}
                    />

                    {/* Task Dialog for adding tasks from category view */}
                    <TaskDialog
                        open={isTaskDialogOpen}
                        onOpenChange={setIsTaskDialogOpen}
                        task={editingTask}
                        onSuccess={refreshData}
                        projectId={projectId || (projectFilter !== 'all' ? projectFilter : '')}
                    />
                </div>
            ) : (
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
                            label: '',
                            icon: Download,
                            onClick: handleExportExcel,
                            className: "rounded-full w-8 h-8 bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20",
                            variant: "outline"
                        },
                        {
                            label: '',
                            icon: Upload,
                            onClick: () => fileInputRef.current?.click(),
                            className: "rounded-full w-8 h-8 bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20",
                            variant: "outline"
                        },
                        {
                            label: '',
                            icon: GanttChartSquare,
                            onClick: () => setViewMode('gantt'),
                            className: "rounded-full w-8 h-8 bg-violet-500/10 text-violet-600 border-violet-200 hover:bg-violet-500/20",
                            variant: "outline"
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
                            onSuccess={refreshData}
                        />
                    )}
                />
            )}
        </div>
    )
}
