'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { MoreHorizontal, Pencil, Trash2, Search, FolderKanban, Layers, Upload, Download, ArrowUpDown, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TaskDialog } from '@/components/projects/task-dialog'
import { useRouter } from 'next/navigation'
import { taskStore, Task } from '@/lib/task-store'
import { deleteOneTask, createTasks, getAllTasks } from '@/lib/actions/tasks'
import { TASK_CATEGORIES, TASK_STATUS } from '@/Config/thongso'
import * as XLSX from 'xlsx'
import { AddTaskButton } from './add-task-button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'


interface Project {
    project_id: string
    project_name: string
}

interface TaskListProps {
    projects: Project[]
    projectId?: string // Optional projectId prop
}

type SortKey = keyof Task | 'project_name'

export function TaskList({ projects, projectId }: TaskListProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [tasks, setTasks] = useState<Task[]>(taskStore.getCachedTasks())
    const [isLoadingData, setIsLoadingData] = useState(taskStore.getIsLoading())
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [projectFilter, setProjectFilter] = useState(projectId || 'all')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [selectedTasks, setSelectedTasks] = useState<string[]>([])
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)

    // Subscribe to task store
    useEffect(() => {
        // Initial load if cache is empty
        if (tasks.length === 0) {
            setIsLoadingData(true)
            taskStore.getTasks().then(t => {
                setTasks(t)
                setIsLoadingData(false)
            })
        }

        const unsubscribe = taskStore.subscribe((t) => {
            setTasks(t)
            setIsLoadingData(taskStore.getIsLoading())
        })
        return unsubscribe
    }, [])

    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = direction === 'asc' ? 'desc' : 'asc'
        }
        setSortConfig({ key, direction })
    }

    // Purely client-side filtering
    const filteredTasks = tasks.filter(task => {
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch =
                task.task_name?.toLowerCase().includes(searchLower) ||
                task.task_id?.toLowerCase().includes(searchLower) ||
                task.description?.toLowerCase().includes(searchLower)
            if (!matchesSearch) return false
        }

        // Category filter
        if (categoryFilter !== 'all' && task.task_category !== categoryFilter) {
            return false
        }

        // Status filter
        if (statusFilter !== 'all' && task.status !== statusFilter) {
            return false
        }

        // Project filter
        if (projectId) {
            if (task.project_id !== projectId) return false
        } else if (projectFilter !== 'all') {
            if (task.project_id !== projectFilter) return false
        }

        return true
    })

    // Purely client-side sorting
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (!sortConfig) return 0
        const { key, direction } = sortConfig
        let valA: any = a[key as keyof typeof a]
        let valB: any = b[key as keyof typeof b]

        if (key === 'project_name') {
            valA = a.projects?.project_name || ''
            valB = b.projects?.project_name || ''
        }

        if (valA < valB) return direction === 'asc' ? -1 : 1
        if (valA > valB) return direction === 'asc' ? 1 : -1
        return 0
    })

    // Client-side pagination
    const totalItems = filteredTasks.length
    const showAllItems = itemsPerPage === 0
    const effectiveItemsPerPage = showAllItems ? totalItems : itemsPerPage
    const totalPages = Math.ceil(totalItems / (effectiveItemsPerPage || 1))
    const startIndex = (currentPage - 1) * effectiveItemsPerPage
    const endIndex = startIndex + effectiveItemsPerPage
    const paginatedTasks = showAllItems ? sortedTasks : sortedTasks.slice(startIndex, startIndex + effectiveItemsPerPage)

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, categoryFilter, statusFilter, projectFilter, sortConfig])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setSelectedTasks([])
    }

    const handleItemsPerPageChange = (value: string) => {
        const newValue = value === 'all' ? 0 : Number(value)
        setItemsPerPage(newValue)
        setCurrentPage(1)
    }

    const handleEdit = (task: Task) => {
        setEditingTask(task)
        setIsDialogOpen(true)
    }

    const handleDelete = async (taskId: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
            try {
                await taskStore.refresh()
            } catch (error) {
                console.error('Error deleting task:', error)
                alert('Có lỗi xảy ra khi xóa công việc.')
            }
        }
    }

    // Multi-select handlers
    const handleSelectAll = () => {
        if (selectedTasks.length === sortedTasks.length && sortedTasks.length > 0) {
            setSelectedTasks([])
        } else {
            setSelectedTasks(sortedTasks.map(t => t.task_id))
        }
    }

    const handleSelectTask = (taskId: string) => {
        setSelectedTasks(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        )
    }

    // Bulk delete handler
    const handleBulkDelete = async () => {
        if (selectedTasks.length === 0) return

        const confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedTasks.length} công việc đã chọn?`
        if (!confirm(confirmMessage)) return

        try {
            // Delete all selected tasks
            await Promise.all(selectedTasks.map(taskId => deleteOneTask(taskId)))

            // Clear selection
            setSelectedTasks([])

            // Refetch current page
            await taskStore.refresh()
        } catch (error) {
            console.error('Error deleting tasks:', error)
            alert('Có lỗi xảy ra khi xóa công việc.')
        }
    }

    // Excel Handlers
    const handleExportExcel = async () => {
        try {
            // Fetch all tasks for export (no pagination)
            const allTasks = await getAllTasks(projectId || null)

            const data = allTasks.map((t, index) => ({
                'STT': index + 1,
                'Dự án': t.projects?.project_name,
                'Hạng mục': t.task_category,
                'Tên công việc': t.task_name,
                'Đơn vị tính': t.task_unit,
                'WBS': t.wbs,
                'Trạng thái': t.status,
                'Mô tả': t.description,
                'Ngày bắt đầu': t.start_date,
                'Ngày kết thúc': t.end_date
            }))

            const ws = XLSX.utils.json_to_sheet(data)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Danh_sach_cong_viec")
            XLSX.writeFile(wb, "Danh_sach_cong_viec.xlsx")
        } catch (error) {
            console.error('Export error:', error)
            alert('Có lỗi xảy ra khi xuất dữ liệu.')
        }
    }

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws) as any[]

                const tasksToCreate = data.map((row: any) => {
                    // Try to find project
                    const projectName = row['Dự án']
                    const project = projects.find(p => p.project_name === projectName)

                    // Use found project, or current active project/tab, or fallback to first project
                    let targetProjectId = project?.project_id

                    if (!targetProjectId) {
                        if (projectId) targetProjectId = projectId
                        else if (projectFilter !== 'all') targetProjectId = projectFilter
                    }

                    if (!targetProjectId) {
                        console.warn(`Skipping task "${row['Tên công việc']}" because project not found: ${projectName}`)
                        return null
                    }

                    return {
                        project_id: targetProjectId,
                        task_name: row['Tên công việc'],
                        task_category: row['Hạng mục'] || null,
                        task_unit: row['Đơn vị tính'] || row['ĐVT'] || null,
                        wbs: row['WBS'] || null,
                        description: row['Mô tả'] || null,
                        status: row['Trạng thái'] || 'Chưa bắt đầu',
                        start_date: row['Ngày bắt đầu'] || null,
                        end_date: row['Ngày kết thúc'] || null
                    }
                }).filter(t => t !== null)

                if (tasksToCreate.length > 0) {
                    await createTasks(tasksToCreate)
                    alert(`Đã nhập thành công ${tasksToCreate.length} công việc!`)
                    // Refetch current page to show new data
                    await taskStore.refresh()
                } else {
                    alert('Không tìm thấy dữ liệu hợp lệ hoặc không xác định được dự án.')
                }
            } catch (error) {
                console.error('Import error:', error)
                alert('Có lỗi xảy ra khi nhập file Excel.')
            } finally {
                // Reset input
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        }
        reader.readAsBinaryString(file)
    }

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case 'Chưa thực hiện':
                return <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-none">Chưa thực hiện</Badge>
            case 'Đang thực hiện':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-none">Đang thực hiện</Badge>
            case 'Tạm dừng':
                return <Badge variant="secondary" className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-none">Tạm dừng</Badge>
            case 'Hủy':
                return <Badge variant="destructive" className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-none">Hủy</Badge>
            case 'Hoàn tất':
                return <Badge variant="secondary" className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-none">Hoàn tất</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6 font-sans">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap items-center gap-2 flex-grow">
                    {/* Search locally */}
                    <div className="relative w-full md:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 bg-card/40 border-border/40 rounded-xl focus:ring-primary/10 shadow-sm transition-all text-[14px] font-medium placeholder:text-slate-500 text-slate-900"
                        />
                    </div>

                    {!projectId && (
                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                            <SelectTrigger className="w-[240px] h-10 rounded-xl border-border/40 bg-card/40 text-[14px] font-medium text-slate-900 overflow-hidden shrink-0">
                                <FolderKanban className="h-3.5 w-3.5 mr-2 text-slate-500 shrink-0" />
                                <SelectValue placeholder="Dự án" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Tất cả dự án</SelectItem>
                                {projects.map(p => (
                                    <SelectItem key={p.project_id} value={p.project_id}>{p.project_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[200px] h-10 rounded-xl border-border/40 bg-card/40 text-[14px] font-medium text-slate-900 shrink-0">
                            <Layers className="h-3.5 w-3.5 mr-2 text-slate-500 shrink-0" />
                            <SelectValue placeholder="Hạng mục" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Tất cả hạng mục</SelectItem>
                            {TASK_CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[200px] h-10 rounded-xl border-border/40 bg-card/40 text-[14px] font-medium text-slate-900 shrink-0">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            {TASK_STATUS.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div className="w-[1px] h-4 bg-border mx-1 hidden md:block" />
                    {selectedTasks.length > 0 && (
                        <>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                                className="rounded-full px-4 h-8 text-xs"
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Xóa {selectedTasks.length}
                            </Button>
                            <div className="w-[1px] h-4 bg-border mx-1" />
                        </>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportExcel}
                        className="rounded-full w-8 h-8 p-0 bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20"
                        title="Xuất Excel"
                    >
                        <Download className="h-3.5 w-3.5" />
                    </Button>
                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-full w-8 h-8 p-0 bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20"
                            title="Nhập Excel"
                        >
                            <Upload className="h-3.5 w-3.5" />
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImportExcel}
                            className="hidden"
                            accept=".xlsx, .xls"
                        />
                    </div>

                    <AddTaskButton
                        projects={projects}
                        projectId={projectId || (projectFilter !== 'all' ? projectFilter : undefined)}
                    />
                </div>
            </div>

            {/* Pagination Controls - Above Table */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center px-1">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span>Hiển thị</span>
                    <Select value={itemsPerPage === 0 ? 'all' : String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-[110px] h-8 rounded-lg text-slate-900 font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="20">20 / trang</SelectItem>
                            <SelectItem value="50">50 / trang</SelectItem>
                            <SelectItem value="100">100 / trang</SelectItem>
                            <SelectItem value="200">200 / trang</SelectItem>
                            <SelectItem value="500">500 / trang</SelectItem>
                            <SelectItem value="all">Xem tất cả</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-slate-600">
                        {showAllItems
                            ? `Tổng ${totalItems} công việc`
                            : `${startIndex + 1}-${Math.min(endIndex, totalItems)} trong tổng ${totalItems} công việc`
                        }
                    </span>
                </div>

                {!showAllItems && totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isPending}
                            className="h-8 w-8 p-0 rounded-lg"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-slate-700 font-medium min-w-[100px] text-center">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages || isPending}
                            className="h-8 w-8 p-0 rounded-lg"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="mt-4 relative">
                {/* Loading Overlay */}
                {isPending && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                )}

                <div className="border border-border/50 rounded-xl overflow-hidden bg-card/40 backdrop-blur-xl shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-border/50">
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={selectedTasks.length === sortedTasks.length && sortedTasks.length > 0}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead className="w-[60px] text-center font-medium text-slate-950">STT</TableHead>

                                <TableHead
                                    className="font-medium text-[13px] text-slate-950 w-[150px] cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSort('project_name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Dự án
                                        <ArrowUpDown className="h-3 w-3 text-slate-500" />
                                    </div>
                                </TableHead>

                                <TableHead
                                    className="font-medium text-[13px] text-slate-950 w-[120px] cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSort('task_category')}
                                >
                                    <div className="flex items-center gap-1">
                                        Hạng mục
                                        <ArrowUpDown className="h-3 w-3 text-slate-500" />
                                    </div>
                                </TableHead>

                                <TableHead
                                    className="font-medium text-[13px] text-slate-950 w-[250px] cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSort('task_name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Tên công việc
                                        <ArrowUpDown className="h-3 w-3 text-slate-500" />
                                    </div>
                                </TableHead>

                                <TableHead
                                    className="font-medium text-[13px] text-slate-950 w-[100px] cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSort('task_unit')}
                                >
                                    <div className="flex items-center gap-1">
                                        Đơn vị tính
                                        <ArrowUpDown className="h-3 w-3 text-slate-500" />
                                    </div>
                                </TableHead>

                                <TableHead
                                    className="font-medium text-[13px] text-slate-950 w-[100px] cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSort('wbs')}
                                >
                                    <div className="flex items-center gap-1">
                                        WBS
                                        <ArrowUpDown className="h-3 w-3 text-slate-500" />
                                    </div>
                                </TableHead>

                                <TableHead
                                    className="font-medium text-[13px] text-slate-950 w-[120px] cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-1">
                                        Trạng thái
                                        <ArrowUpDown className="h-3 w-3 text-slate-500" />
                                    </div>
                                </TableHead>

                                <TableHead className="w-[80px] text-right font-medium text-slate-950">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedTasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center text-slate-500">
                                        Không tìm thấy công việc nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedTasks.map((task, index) => (
                                    <TableRow key={task.task_id} className="group hover:bg-foreground/[0.02] transition-colors border-border/50">
                                        {/* Checkbox */}
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedTasks.includes(task.task_id)}
                                                onCheckedChange={() => handleSelectTask(task.task_id)}
                                                aria-label={`Select ${task.task_name}`}
                                            />
                                        </TableCell>

                                        {/* STT */}
                                        <TableCell className="text-center text-xs text-slate-600 font-mono">
                                            {index + 1}
                                        </TableCell>

                                        {/* Dự án */}
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <FolderKanban className="h-3 w-3" />
                                                <span>{task.projects?.project_name || 'N/A'}</span>
                                            </div>
                                        </TableCell>

                                        {/* Category/Item */}
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {task.project_items && (
                                                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-md border border-blue-100/50 w-fit">
                                                        <Layers className="h-3 w-3" />
                                                        {task.project_items.item_name}
                                                    </div>
                                                )}
                                                {task.task_category ? (
                                                    <Badge variant="outline" className="text-[10px] w-fit font-normal text-slate-400 border-slate-100">
                                                        {task.task_category}
                                                    </Badge>
                                                ) : (
                                                    !task.project_items && <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Tên công việc */}
                                        <TableCell>
                                            <p className="font-medium text-[14px] text-slate-950 transition-colors group-hover:text-primary leading-tight">
                                                {task.task_name}
                                            </p>
                                        </TableCell>

                                        {/* Đơn vị tính */}
                                        <TableCell>
                                            <span className="text-xs text-slate-600">
                                                {task.task_unit || '-'}
                                            </span>
                                        </TableCell>

                                        {/* WBS */}
                                        <TableCell>
                                            <span className="text-xs font-mono text-slate-600">
                                                {task.wbs || '-'}
                                            </span>
                                        </TableCell>

                                        {/* Trạng thái */}
                                        <TableCell>{getStatusBadge(task.status)}</TableCell>

                                        {/* Thao tác */}
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1.5 backdrop-blur-xl bg-card/95">
                                                    <DropdownMenuItem onClick={() => handleEdit(task)} className="rounded-lg cursor-pointer">
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        <span className="text-sm">Chỉnh sửa</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(task.task_id)}
                                                        className="rounded-lg text-destructive focus:text-destructive cursor-pointer"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span className="text-sm">Xóa công việc</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table >
                </div >
            </div >


            <TaskDialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setEditingTask(null)
                }}
                task={editingTask}
                onSuccess={() => taskStore.refresh()}
            />
        </div >
    )
}
