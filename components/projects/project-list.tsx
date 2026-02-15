'use client'

import { useState, useRef } from 'react'
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
import { MoreHorizontal, Pencil, Trash2, Search, ListTodo, User, Users, Plus, Upload, Download, ArrowUpDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ProjectDialog } from './project-dialog'
import { TaskDialog } from './task-dialog'
import { deleteProject, deleteProjects, createProjects } from '@/lib/actions/projects'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import {
    BarChart3,
    Table as TableIcon,
    FileText,
    Wallet,
    CalendarDays
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Project {
    project_id: string
    project_name: string
    description: string | null
    start_date: string | null
    end_date: string | null
    status: string | null
    manager_name: string | null
    member_names: string[] | null
    total_planned_budget: number | null
    contingency_budget: number | null
    currency_code: string | null
    planned_duration: number | null
    actual_start_date: string | null
    actual_end_date: string | null
    progress_percent: number | null
    actual_cost: number | null
}

interface ProjectListProps {
    initialProjects: Project[]
    users: any[]
}

type SortKey = keyof Project | 'id' // 'id' for project_id alias if needed

export function ProjectList({ initialProjects, users }: ProjectListProps) {
    const router = useRouter()
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [selectedProjects, setSelectedProjects] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Sort state
    const [sortConfig, setSortConfig] = useState<{ key: keyof Project; direction: 'asc' | 'desc' } | null>(null)

    const handleSort = (key: keyof Project) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const filteredProjects = initialProjects.filter((project) => {
        const matchesSearch =
            project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            project.project_id.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || project.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const formatDynamicBudget = (value: number | null) => {
        if (!value) return '0'
        const millionVal = value / 1000000
        if (millionVal >= 1000) {
            return (millionVal / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ'
        }
        return millionVal.toLocaleString('vi-VN') + ' triệu'
    }

    const formatDateMonthYear = (dateStr: string | null) => {
        if (!dateStr) return '...'
        try {
            return format(new Date(dateStr), 'MM/yyyy')
        } catch (e) {
            return '...'
        }
    }

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (!sortConfig) return 0

        const { key, direction } = sortConfig
        let aValue: any = a[key]
        let bValue: any = b[key]

        if (aValue === null || aValue === undefined) aValue = ''
        if (bValue === null || bValue === undefined) bValue = ''

        // Handle array length for members
        if (key === 'member_names') {
            aValue = (a.member_names || []).length
            bValue = (b.member_names || []).length
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return direction === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue)
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1
        if (aValue > bValue) return direction === 'asc' ? 1 : -1
        return 0
    })

    const handleEdit = (project: Project) => {
        setEditingProject(project)
        setIsDialogOpen(true)
    }

    const handleManageTasks = (projectId: string) => {
        setSelectedProjectId(projectId)
        setIsTaskDialogOpen(true)
    }

    const handleDelete = async (projectId: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
            try {
                await deleteProject(projectId)
                router.refresh()
            } catch (error) {
                console.error('Error deleting project:', error)
                alert('Có lỗi xảy ra khi xóa dự án.')
            }
        }
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedProjects(sortedProjects.map(p => p.project_id))
        } else {
            setSelectedProjects([])
        }
    }

    const handleSelectProject = (projectId: string, checked: boolean) => {
        if (checked) {
            setSelectedProjects([...selectedProjects, projectId])
        } else {
            setSelectedProjects(selectedProjects.filter(id => id !== projectId))
        }
    }

    const handleBulkDelete = async () => {
        if (confirm(`Bạn có chắc chắn muốn xóa ${selectedProjects.length} dự án đã chọn?`)) {
            try {
                await deleteProjects(selectedProjects)
                setSelectedProjects([])
                router.refresh()
            } catch (error) {
                console.error('Error deleting projects:', error)
                alert('Có lỗi xảy ra khi xóa các dự án.')
            }
        }
    }

    const handleExportExcel = () => {
        const data = sortedProjects.map((p, index) => ({
            'STT': index + 1,
            'Mã dự án': p.project_id,
            'Tên dự án': p.project_name,
            'Người quản lý': p.manager_name,
            'Ngày bắt đầu (KH)': p.start_date,
            'Ngày kết thúc (KH)': p.end_date,
            'Tổng mức đầu tư': p.total_planned_budget,
            'Tiền tệ': p.currency_code,
            '% Hoàn thành': p.progress_percent,
            'Ngày bắt đầu (TT)': p.actual_start_date,
            'Ngày kết thúc (TT)': p.actual_end_date,
            'Trạng thái': p.status,
            'Mô tả': p.description,
            'Chi phí thực tế': p.actual_cost,
            'Thành viên': (p.member_names || []).join(', ')
        }))

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Danh_sach_du_an")
        XLSX.writeFile(wb, "Danh_sach_du_an.xlsx")
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

                const projectsToCreate = data.map((row: any) => {
                    // Check mandatory fields
                    if (!row['Mã dự án'] || !row['Tên dự án']) {
                        console.warn('Skipping row due to missing ID or Name', row)
                        return null
                    }

                    return {
                        project_id: String(row['Mã dự án']),
                        project_name: String(row['Tên dự án']),
                        manager_name: row['Người quản lý'] || null,
                        start_date: row['Ngày bắt đầu'] || null,
                        end_date: row['Ngày kết thúc'] || null,
                        status: row['Trạng thái'] || 'Đang thực hiện',
                        description: row['Mô tả'] || null,
                        member_names: row['Thành viên'] ? String(row['Thành viên']).split(',').map(s => s.trim()) : [],
                        total_planned_budget: row['Tổng mức đầu tư'] || 0,
                        currency_code: row['Tiền tệ'] || 'VND',
                        progress_percent: row['% Hoàn thành'] || 0,
                        actual_start_date: row['Ngày bắt đầu (TT)'] || null,
                        actual_end_date: row['Ngày kết thúc (TT)'] || null,
                        actual_cost: row['Chi phí thực tế'] || 0,
                    }
                }).filter(p => p !== null)

                if (projectsToCreate.length > 0) {
                    await createProjects(projectsToCreate)
                    alert(`Đã nhập thành công ${projectsToCreate.length} dự án!`)
                    router.refresh()
                } else {
                    alert('Không tìm thấy dữ liệu hợp lệ.')
                }
            } catch (error) {
                console.error('Import error:', error)
                alert('Có lỗi xảy ra khi nhập file Excel.')
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        }
        reader.readAsBinaryString(file)
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-'
        try {
            return format(new Date(dateStr), 'dd/MM/yyyy')
        } catch (e) {
            return dateStr
        }
    }

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case 'Đang thực hiện':
                return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none">Đang thực hiện</Badge>
            case 'Hoàn thành':
                return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none">Hoàn thành</Badge>
            case 'Tạm dừng':
                return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none">Tạm dừng</Badge>
            case 'Hủy bỏ':
                return <Badge variant="destructive" className="border-none">Hủy bỏ</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getManagerDisplay = (managerName: string | null) => {
        if (!managerName) return <span className="text-xs text-muted-foreground italic">Chưa chỉ định</span>

        const isEmail = managerName.includes('@')

        // Find user by email or name if possible (users prop might need to be enriched in parent or searched here)
        // For now, if it's email, try to find in users list
        const user = users.find(u => u.email === managerName || u.full_name === managerName)

        return (
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    {user?.avatar_url ? (
                        <AvatarImage src={user.avatar_url} />
                    ) : (
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${managerName}`} />
                    )}
                    <AvatarFallback className="text-[10px]">{managerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-xs font-medium truncate max-w-[120px]" title={managerName}>
                        {user?.full_name || managerName}
                    </span>
                    {isEmail && user?.full_name && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                            {managerName}
                        </span>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6" >
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                {/* Search locally */}
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-start md:items-center">
                    <div className="relative w-full md:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Tìm kiếm dự án..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-card/50 border-border/50 rounded-xl focus:ring-primary/20"
                        />
                    </div>

                    {/* Status Filter Dropdown */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[200px] h-10 rounded-xl bg-card/50 border-border/50 focus:ring-primary/20 text-sm">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/50 backdrop-blur-xl bg-card/95">
                            <SelectItem value="all" className="rounded-lg">Tất cả trạng thái</SelectItem>
                            <SelectItem value="Đang thực hiện" className="rounded-lg">Đang thực hiện</SelectItem>
                            <SelectItem value="Hoàn thành" className="rounded-lg">Hoàn thành</SelectItem>
                            <SelectItem value="Tạm dừng" className="rounded-lg">Tạm dừng</SelectItem>
                            <SelectItem value="Hủy bỏ" className="rounded-lg">Hủy bỏ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto shrink-0 justify-end">
                    <div className="w-[1px] h-4 bg-border mx-1 hidden md:block" />

                    {selectedProjects.length > 0 && (
                        <>
                            <Button
                                onClick={handleBulkDelete}
                                variant="destructive"
                                size="sm"
                                className="rounded-full px-4 h-8 text-xs"
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Xóa ({selectedProjects.length})
                            </Button>
                            <div className="w-[1px] h-4 bg-border mx-1" />
                        </>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportExcel}
                        className="rounded-full px-4 h-8 text-xs bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20"
                        title="Xuất Excel"
                    >
                        <Download className="h-3.5 w-3.5 mr-2" />
                    </Button>
                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-full px-4 h-8 text-xs bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20"
                            title="Nhập Excel"
                        >
                            <Upload className="h-3.5 w-3.5 mr-2" />
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImportExcel}
                            className="hidden"
                            accept=".xlsx, .xls"
                        />
                    </div>

                    <Button
                        onClick={() => {
                            setEditingProject(null)
                            setIsDialogOpen(true)
                        }}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-full px-4 h-8 w-full md:w-auto text-xs"
                    >
                        <Plus className="h-3.5 w-3.5 mr-2" />
                        Thêm dự án
                    </Button>
                </div>
            </div>

            <div className="border border-border/50 rounded-xl overflow-hidden bg-card/40 backdrop-blur-xl shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="w-[50px] pl-4">
                                <Checkbox
                                    checked={filteredProjects.length > 0 && selectedProjects.length === filteredProjects.length}
                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                    aria-label="Select all"
                                />
                            </TableHead>

                            <TableHead
                                className="w-[120px] cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('project_id')}
                            >
                                <div className="flex items-center gap-1">
                                    Mã dự án
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('project_name')}
                            >
                                <div className="flex items-center gap-1">
                                    Tên dự án
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="w-[120px] cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('total_planned_budget')}
                            >
                                <div className="flex items-center gap-1">
                                    Giá trị hợp đồng
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="w-[100px] cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('progress_percent')}
                            >
                                <div className="flex items-center gap-1">
                                    Tiến độ
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="w-[200px] cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('start_date')}
                            >
                                <div className="flex items-center gap-1">
                                    Tiến độ theo kế hoạch
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('manager_name')}
                            >
                                <div className="flex items-center gap-1">
                                    Nhân sự tham gia
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center gap-1">
                                    Trạng thái
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>

                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedProjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                                    Không tìm thấy dự án nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedProjects.map((project) => (
                                <TableRow
                                    key={project.project_id}
                                    className="group hover:bg-foreground/[0.02] transition-colors border-border/50 cursor-pointer"
                                    onClick={() => router.push(`/dashboard/projects/${project.project_id}`)}
                                >
                                    <TableCell className="pl-4">
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedProjects.includes(project.project_id)}
                                                onCheckedChange={(checked) => handleSelectProject(project.project_id, !!checked)}
                                                aria-label={`Select project ${project.project_name}`}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs font-medium text-muted-foreground uppercase">{project.project_id}</TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-foreground text-sm">{project.project_name}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-primary">
                                                {formatDynamicBudget(project.total_planned_budget)}
                                            </span>
                                            {project.total_planned_budget && project.total_planned_budget > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 transition-all duration-500"
                                                            style={{ width: `${Math.min(100, (project.actual_cost || 0) / project.total_planned_budget * 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[9px] text-muted-foreground font-medium">
                                                        {Math.round((project.actual_cost || 0) / project.total_planned_budget * 100)}% vốn
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {project.progress_percent !== undefined && project.progress_percent !== null ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-500"
                                                        style={{ width: `${project.progress_percent}%` }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-bold">{project.progress_percent}%</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                                {formatDateMonthYear(project.start_date)} - {formatDateMonthYear(project.end_date)}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground bg-muted/50 w-fit px-1.5 py-0.5 rounded font-medium">
                                                {project.planned_duration || 0} ngày
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                {project.manager_name || 'Chưa phân công'}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium bg-primary/5 text-primary w-fit px-1.5 py-0.5 rounded border border-primary/10">
                                                <Users className="h-3 w-3" />
                                                {project.member_names?.length || 0} nhân sự
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg border-primary/20 text-primary hover:bg-primary/5 transition-all shadow-sm"
                                                onClick={() => router.push(`/dashboard/projects/${project.project_id}/report`)}
                                                title="Báo cáo"
                                            >
                                                <BarChart3 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg border-slate-200 hover:bg-slate-50 transition-all text-slate-700 shadow-sm"
                                                onClick={() => handleEdit(project)}
                                                title="Sửa"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[160px] rounded-xl p-1.5 backdrop-blur-xl bg-card/95">
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(project.project_id)}
                                                        className="rounded-lg text-destructive focus:text-destructive cursor-pointer"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span className="text-sm font-medium">Xóa dự án</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ProjectDialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) setEditingProject(null)
                }}
                project={editingProject}
                onSuccess={() => router.refresh()}
            />

            <TaskDialog
                open={isTaskDialogOpen}
                onOpenChange={setIsTaskDialogOpen}
                projectId={selectedProjectId || ''}
                onSuccess={() => router.refresh()}
            />
        </div >
    )
}
