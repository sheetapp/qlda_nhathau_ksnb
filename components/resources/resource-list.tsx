'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
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
import { MoreHorizontal, Pencil, Trash2, Search, Package, Layers, Info, FolderKanban, ArrowUpDown, Upload, Download, ChevronLeft, ChevronRight, Loader2, RotateCw, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { deleteResource, deleteResources, createResources, getResources, getAllResources } from '@/lib/actions/resources'
import { Checkbox } from '@/components/ui/checkbox'
import { ResourceDialog } from './resource-dialog'
import { resourceStore } from '@/lib/resource-store'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import * as XLSX from 'xlsx'

interface Resource {
    resource_id: string
    resource_name: string
    group_name: string | null
    unit: string | null
    quantity_in: string | number | null
    quantity_out: string | number | null
    quantity_balance: string | number | null
    unit_price: string | number | null
    status: string | null
    priority: string | null
    notes: string | null
    manager: string | null
    project_id: string | null
    projects?: {
        project_name: string
    } | null
}

interface ResourceListProps {
    users: { email: string; full_name: string }[]
    projects: { project_id: string; project_name: string }[]
    projectId?: string
}

type SortKey = keyof Resource | 'project_name';

export function ResourceList({ users, projects, projectId }: ResourceListProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [resources, setResources] = useState<any[]>(resourceStore.getCachedResources())
    const [isLoadingData, setIsLoadingData] = useState(resourceStore.getIsLoading())
    const [searchTerm, setSearchTerm] = useState('')
    const [groupFilter, setGroupFilter] = useState('all')
    const [projectFilter, setProjectFilter] = useState('all')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingResource, setEditingResource] = useState<Resource | null>(null)
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null)
    const [selectedResources, setSelectedResources] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Extract unique group names for filter from ALL resources
    const uniqueGroups = Array.from(new Set(resources.map(r => r.group_name).filter(Boolean))) as string[]

    // Subscribe to resource store
    useEffect(() => {
        // Initial load if cache is empty
        if (resources.length === 0) {
            console.log('[ResourceList] Cache is empty, loading resources...')
            setIsLoadingData(true)
            resourceStore.getResources().then(data => {
                console.log(`[ResourceList] Initial load complete: ${data.length} resources`)
                setResources(data)
                setIsLoadingData(false)
            })
        } else {
            console.log(`[ResourceList] Using cached resources: ${resources.length} items`)
        }

        const unsubscribe = resourceStore.subscribe((data) => {
            console.log(`[ResourceList] Store updated: ${data.length} resources`)
            setResources(data)
            setIsLoadingData(resourceStore.getIsLoading())
        })
        return unsubscribe
    }, [])

    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    // Purely client-side filtering
    const filteredResources = resources.filter(resource => {
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch =
                resource.resource_name?.toLowerCase().includes(searchLower) ||
                resource.resource_id?.toLowerCase().includes(searchLower)
            if (!matchesSearch) return false
        }

        // Group filter
        if (groupFilter !== 'all' && resource.group_name !== groupFilter) {
            return false
        }

        // Project filter
        if (projectId) {
            // If in project detail view, only show resources for this project
            if (resource.project_id !== projectId) return false
        } else if (projectFilter !== 'all') {
            if (projectFilter === 'global') {
                if (resource.project_id !== null) return false
            } else if (resource.project_id !== projectFilter) {
                return false
            }
        }

        return true
    })

    // Log search results
    useEffect(() => {
        if (searchTerm) {
            console.log(`[ResourceList] Search for "${searchTerm}": ${filteredResources.length} results from ${resources.length} total`)
            if (filteredResources.length === 0 && resources.length > 0) {
                console.log('[ResourceList] No matches found. Sample resource names:',
                    resources.slice(0, 5).map(r => r.resource_name))
            }
        }
    }, [searchTerm, filteredResources.length, resources.length])

    // Purely client-side sorting
    const sortedResources = [...filteredResources].sort((a, b) => {
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
    const totalItems = filteredResources.length
    const showAllItems = itemsPerPage === 0
    const effectiveItemsPerPage = showAllItems ? totalItems : itemsPerPage
    const totalPages = Math.ceil(totalItems / (effectiveItemsPerPage || 1))
    const startIndex = (currentPage - 1) * effectiveItemsPerPage
    const paginatedResources = showAllItems ? sortedResources : sortedResources.slice(startIndex, startIndex + effectiveItemsPerPage)

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, groupFilter, projectFilter, sortConfig])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setSelectedResources([])
    }

    const handleItemsPerPageChange = (value: string) => {
        const newValue = value === 'all' ? 0 : Number(value)
        setItemsPerPage(newValue)
        setCurrentPage(1)
    }


    const handleEdit = (resource: Resource) => {
        setEditingResource(resource)
        setIsDialogOpen(true)
    }

    const handleDelete = async (resourceId: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa tài nguyên này?')) {
            try {
                // Perform deletion first
                await deleteResource(resourceId)
                // Then refresh the store/state to reflect change
                await resourceStore.refresh()
            } catch (error) {
                console.error('Error deleting resource:', error)
                alert('Có lỗi xảy ra khi xóa tài nguyên.')
            }
        }
    }

    const handleRefresh = async () => {
        startTransition(async () => {
            try {
                await resourceStore.refresh()
            } catch (error) {
                console.error('Error refreshing resources:', error)
            }
        })
    }

    const handleBulkDelete = async () => {
        if (selectedResources.length === 0) return

        if (confirm(`Bạn có chắc chắn muốn xóa ${selectedResources.length} tài nguyên đã chọn?`)) {
            try {
                await deleteResources(selectedResources)
                setSelectedResources([])
                // Refetch current page
                await resourceStore.refresh()
            } catch (error) {
                console.error('Error deleting resources:', error)
                alert('Có lỗi xảy ra khi xóa tài nguyên.')
            }
        }
    }

    const toggleSelection = (resourceId: string) => {
        setSelectedResources(prev =>
            prev.includes(resourceId)
                ? prev.filter(id => id !== resourceId)
                : [...prev, resourceId]
        )
    }

    const toggleSelectAll = () => {
        if (selectedResources.length === sortedResources.length) {
            setSelectedResources([])
        } else {
            setSelectedResources(sortedResources.map(r => r.resource_id))
        }
    }

    const handleExportExcel = async () => {
        try {
            // Fetch all resources for export (no pagination) with current sorting
            const allResources = await getAllResources(
                projectId || null,
                sortConfig?.key || 'resource_name',
                sortConfig?.direction || 'asc'
            )

            const data = allResources.map((r, index) => ({
                'STT': index + 1,
                'Mã tài nguyên': r.resource_id,
                'Tên tài nguyên': r.resource_name,
                'Đơn vị': r.unit,
                'Đơn giá': r.unit_price,
                'Nhóm tài nguyên': r.group_name,
                'Mã dự án': r.project_id || '',
                'Tên dự án': r.projects?.project_name || 'Dùng chung',
                'Tổng Nhập': r.quantity_in,
                'Tổng Xuất': r.quantity_out,
                'Tổng Tồn': r.quantity_balance,
                'Trạng thái': r.status
            }))

            const ws = XLSX.utils.json_to_sheet(data)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Danh_sach_tai_nguyen")
            XLSX.writeFile(wb, "Danh_sach_tai_nguyen.xlsx")
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

                const resourcesToCreate = data.map((row: any) => {
                    // Check mandatory fields
                    if (!row['Mã tài nguyên'] || !row['Tên tài nguyên']) {
                        console.warn('Skipping row due to missing ID or Name', row)
                        return null
                    }

                    // Try to match by project_id first (more reliable), then fall back to project_name
                    const projectCode = row['Mã dự án']
                    const projectName = row['Tên dự án'] || row['Dự án']

                    let project = null
                    if (projectCode) {
                        // Try to find by project code first
                        project = projects.find(p => p.project_id === projectCode)
                    }
                    if (!project && projectName && projectName !== 'Dùng chung') {
                        // Fall back to project name if code not found
                        project = projects.find(p => p.project_name === projectName)
                    }

                    return {
                        resource_id: String(row['Mã tài nguyên']),
                        resource_name: String(row['Tên tài nguyên']),
                        group_name: row['Nhóm tài nguyên'] || null,
                        unit: row['Đơn vị'] || null,
                        unit_price: row['Đơn giá'] || 0,
                        project_id: project ? project.project_id : null,
                        quantity_in: row['Tổng Nhập'] || 0,
                        quantity_out: row['Tổng Xuất'] || 0,
                        quantity_balance: row['Tổng Tồn'] || 0,
                        status: row['Trạng thái'] || 'Hoạt động',
                        notes: row['Ghi chú'] || null
                    }
                }).filter(r => r !== null)

                if (resourcesToCreate.length > 0) {
                    await createResources(resourcesToCreate)
                    alert(`Đã nhập thành công ${resourcesToCreate.length} tài nguyên!`)
                    // Refetch current page to show new data
                    await resourceStore.refresh()
                } else {
                    alert('Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra lại file Excel.')
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

    return (
        <div className="space-y-6 relative">
            {/* Loading Overlay */}
            {isPending && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-start md:items-center">
                    <div className="relative w-full md:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 bg-card/40 border-border/40 rounded-xl focus:ring-primary/10 shadow-sm transition-all text-[13px] font-medium placeholder:text-slate-400"
                        />
                    </div>

                    <Select value={groupFilter} onValueChange={setGroupFilter}>
                        <SelectTrigger className="w-[200px] h-10 rounded-xl border-border/40 bg-card/40 text-[13px] font-semibold text-slate-700 shrink-0">
                            <Layers className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                            <SelectValue placeholder="Phân loại" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Tất cả nhóm</SelectItem>
                            {uniqueGroups.map(group => (
                                <SelectItem key={group} value={group}>{group}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Project Filter - only show when not in project detail view */}
                    {!projectId && (
                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                            <SelectTrigger className="w-[240px] h-10 rounded-xl border-border/40 bg-card/40 text-[13px] font-semibold text-slate-700 overflow-hidden shrink-0">
                                <FolderKanban className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                                <SelectValue placeholder="Dự án" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Tất cả dự án</SelectItem>
                                <SelectItem value="global">Dùng chung</SelectItem>
                                {projects.map(project => (
                                    <SelectItem key={project.project_id} value={project.project_id}>
                                        {project.project_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isPending}
                        className="h-10 w-10 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                        title="Làm mới dữ liệu (Xóa cache)"
                    >
                        <RotateCw className={cn("h-4 w-4", isPending && "animate-spin")} />
                    </Button>

                    {/* Bulk Delete Button - only show when items are selected */}
                    {selectedResources.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="rounded-xl px-4 h-10"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa ({selectedResources.length})
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportExcel}
                        className="rounded-xl w-10 h-10 p-0 bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20"
                        title="Xuất Excel"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-xl w-10 h-10 p-0 bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20"
                            title="Nhập Excel"
                        >
                            <Upload className="h-4 w-4" />
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
                            setEditingResource(null)
                            setIsDialogOpen(true)
                        }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-4 h-10 w-full md:w-auto"
                    >
                        <Package className="h-4 w-4 mr-2" />
                        Thêm tài nguyên
                    </Button>
                </div>
            </div>

            {/* Pagination Controls - Moved above table */}
            {totalItems > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                    {/* Items per page selector and info */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Hiển thị</span>
                            <Select value={itemsPerPage === 0 ? 'all' : String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                                <SelectTrigger className="w-[120px] h-9 rounded-lg">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                    <SelectItem value="200">200</SelectItem>
                                    <SelectItem value="500">500</SelectItem>
                                    <SelectItem value="all">Xem tất cả</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground">tài nguyên/trang</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {itemsPerPage === 0
                                ? `Tất cả ${totalItems} tài nguyên`
                                : `${startIndex + 1}-${Math.min(startIndex + effectiveItemsPerPage, totalItems)} của ${totalItems} tài nguyên`
                            }
                        </div>
                    </div>

                    {/* Page navigation - Hide when showing all */}
                    {itemsPerPage !== 0 && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="h-9 rounded-lg"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Show pages around current page
                                    let pageNum
                                    if (totalPages <= 5) {
                                        pageNum = i + 1
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i
                                    } else {
                                        pageNum = currentPage - 2 + i
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            className="h-9 w-9 rounded-lg"
                                        >
                                            {pageNum}
                                        </Button>
                                    )
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="h-9 rounded-lg"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <div className="border border-border/50 rounded-xl overflow-hidden bg-card/40 backdrop-blur-xl shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="w-[40px]">
                                <Checkbox
                                    checked={selectedResources.length === sortedResources.length && sortedResources.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                    aria-label="Chọn tất cả"
                                />
                            </TableHead>
                            <TableHead className="w-[50px] text-center">STT</TableHead>
                            <TableHead
                                className="font-semibold text-[13px] text-slate-700 w-[120px] cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('resource_id')}
                            >
                                <div className="flex items-center gap-1">
                                    Mã
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="font-semibold text-[13px] text-slate-700 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('resource_name')}
                            >
                                <div className="flex items-center gap-1">
                                    Tên tài nguyên
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="font-semibold text-[13px] text-slate-700 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('unit')}
                            >
                                <div className="flex items-center gap-1">
                                    ĐVT
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="font-semibold text-[13px] text-slate-700 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('group_name')}
                            >
                                <div className="flex items-center gap-1">
                                    Phân loại
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="font-semibold text-[13px] text-slate-700 text-right cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('unit_price')}
                            >
                                <div className="flex items-center justify-end gap-1">
                                    Đơn giá
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="font-semibold text-[13px] text-slate-700 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('project_name')}
                            >
                                <div className="flex items-center gap-1">
                                    Dự án
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>

                            <TableHead className="text-right">Tổng Nhập</TableHead>
                            <TableHead className="text-right">Tổng Xuất</TableHead>

                            <TableHead
                                className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('quantity_balance')}
                            >
                                <div className="flex items-center justify-end gap-1">
                                    Tổng Tồn
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedResources.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                                    Không tìm thấy tài nguyên nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedResources.map((resource, index) => (
                                <TableRow key={resource.resource_id} className="group hover:bg-foreground/[0.02] transition-colors border-border/50">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedResources.includes(resource.resource_id)}
                                            onCheckedChange={() => toggleSelection(resource.resource_id)}
                                            aria-label={`Chọn ${resource.resource_name}`}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center text-xs text-muted-foreground">{startIndex + index + 1}</TableCell>
                                    <TableCell className="font-mono text-xs font-medium text-muted-foreground uppercase">{resource.resource_id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <Package className="h-4 w-4" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="font-semibold text-[15px] text-slate-800 transition-colors group-hover:text-primary leading-tight">{resource.resource_name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[12px] text-slate-500 font-medium">{resource.group_name || '-'}</p>
                                                    {resource.documents && resource.documents.length > 0 && (
                                                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                                                            <FileText className="h-3 w-3" />
                                                            <span className="text-[10px] font-bold">{resource.documents.length}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{resource.unit || '-'}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{resource.group_name || '-'}</TableCell>
                                    <TableCell className="text-right font-mono text-xs text-foreground">
                                        {resource.unit_price ? new Intl.NumberFormat('vi-VN').format(Number(resource.unit_price)) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {resource.projects?.project_name ? (
                                            <div className="flex items-center gap-2 text-[11px] text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-full w-fit">
                                                <FolderKanban className="h-3 w-3" />
                                                <span className="truncate max-w-[100px]">{resource.projects.project_name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground italic">
                                                <Layers className="h-3 w-3" />
                                                <span>Dùng chung</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                        {new Intl.NumberFormat('vi-VN').format(Number(resource.quantity_in || 0))}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                        {new Intl.NumberFormat('vi-VN').format(Number(resource.quantity_out || 0))}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                                        {new Intl.NumberFormat('vi-VN').format(Number(resource.quantity_balance || 0))}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg"
                                                onClick={() => handleEdit(resource)}
                                            >
                                                <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg"
                                                onClick={() => handleDelete(resource.resource_id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                                            </Button>

                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ResourceDialog
                open={isDialogOpen}
                onOpenChange={(open: boolean) => {
                    setIsDialogOpen(open)
                    if (!open) setEditingResource(null)
                }}
                resource={editingResource}
                users={users}
                projects={projects}
                projectId={projectId}
                onSuccess={async () => {
                    console.log('[ResourceList] onSuccess called, refreshing store...')
                    await resourceStore.refresh()
                    console.log('[ResourceList] Store refresh completed')
                }}
            />
        </div>
    )
}
