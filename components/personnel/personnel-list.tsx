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
import { MoreHorizontal, Pencil, Trash2, Search, UserCircle, Mail, Phone, Building2, ShieldCheck, AtSign, Briefcase, FolderKanban, Loader2, ChevronLeft, ChevronRight, Download, Upload, Calendar, CircleDot, X, CheckCircle2, UserPlus, RotateCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter, useSearchParams } from 'next/navigation'
import { deletePersonnel, getPersonnel, getAllPersonnel, createPersonnelBulk } from '@/lib/actions/personnel'
import { personnelStore, Personnel } from '@/lib/personnel-store'
import { cn } from '@/lib/utils'
import { PersonnelDetailView } from './personnel-detail-view'
import { PersonnelSheet } from './personnel-sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import * as XLSX from 'xlsx'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface User {
    email: string
    full_name: string
    employee_id?: string
    phone_number?: string | null
    avatar_url?: string | null
    department?: string | null
    position?: string | null
    access_level: number
    project_ids: string[]
    work_status?: string
    join_date?: string
    contract_type?: string
}

interface PersonnelListProps {
    initialUsers: any[]
    projects: { project_id: string; project_name: string }[]
    projectId?: string // Optional projectId prop
}

const ROLE_MAP: Record<number, { label: string, color: string }> = {
    1: { label: 'Admin', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
    2: { label: 'Giám đốc', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    3: { label: 'Trưởng phòng', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    4: { label: 'Nhân viên', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' }
}

const STATUS_MAP: Record<string, { label: string, color: string }> = {
    'Đang làm việc': { label: 'Đang làm việc', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    'Tạm dừng': { label: 'Tạm dừng', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
    'Nghỉ việc': { label: 'Nghỉ việc', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' }
}

export function PersonnelList({ initialUsers, projects, projectId }: PersonnelListProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [users, setUsers] = useState<Personnel[]>(personnelStore.getCachedPersonnel())
    const [isLoadingData, setIsLoadingData] = useState(personnelStore.getIsLoading())
    const [activeTab, setActiveTab] = useState('all')
    const [statusTab, setStatusTab] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<any | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Multi-select state
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])

    // Filter state
    const [projectFilter, setProjectFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [departmentFilter, setDepartmentFilter] = useState('all')

    // Bulk delete state
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Detail view state
    const [detailViewUser, setDetailViewUser] = useState<any | null>(null)
    const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)

    // Extract unique departments from users
    const uniqueDepartments = Array.from(new Set(
        users.map(u => u.department).filter(Boolean)
    )).sort() as string[]

    // Subscribe to personnel store
    useEffect(() => {
        // Initial load if cache is empty
        if (users.length === 0) {
            setIsLoadingData(true)
            personnelStore.getPersonnel().then(p => {
                setUsers(p)
                setIsLoadingData(false)
            })
        }

        const unsubscribe = personnelStore.subscribe((p) => {
            setUsers(p)
            setIsLoadingData(personnelStore.getIsLoading())
        })
        return unsubscribe
    }, [])

    const handleRefresh = async () => {
        startTransition(async () => {
            try {
                await personnelStore.refresh()
            } catch (error) {
                console.error('Error refreshing personnel:', error)
            }
        })
    }

    // Simplified filtering logic (now purely client-side)
    const filteredUsers = users.filter(user => {
        // Project filter
        if (projectFilter !== 'all' && !user.project_ids?.includes(projectFilter)) {
            return false
        }
        // Status filter
        if (statusFilter !== 'all' && user.work_status !== statusFilter) {
            return false
        }
        // Department filter
        if (departmentFilter !== 'all' && user.department !== departmentFilter) {
            return false
        }
        // Status tab filter (backward compatibility)
        if (statusTab !== 'all' && user.work_status !== statusTab) {
            return false
        }
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            return (
                user.full_name?.toLowerCase().includes(searchLower) ||
                user.email?.toLowerCase().includes(searchLower) ||
                user.department?.toLowerCase().includes(searchLower) ||
                user.position?.toLowerCase().includes(searchLower) ||
                user.employee_id?.toLowerCase().includes(searchLower)
            )
        }
        return true
    })

    // Multi-select computed values
    const allSelected = filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length
    const someSelected = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length

    // Multi-select handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUsers(filteredUsers.map(u => u.email))
        } else {
            setSelectedUsers([])
        }
    }

    const handleSelectUser = (email: string, checked: boolean) => {
        if (checked) {
            setSelectedUsers(prev => [...prev, email])
        } else {
            setSelectedUsers(prev => prev.filter(e => e !== email))
        }
    }

    // Bulk delete handlers
    const handleBulkDelete = () => {
        setShowDeleteConfirm(true)
    }

    const confirmBulkDelete = async () => {
        setIsDeleting(true)
        try {
            await Promise.all(
                selectedUsers.map(email => deletePersonnel(email))
            )

            // Refresh store cache after batch delete
            await personnelStore.refresh()
            setSelectedUsers([])
            alert(`Đã xóa thành công ${selectedUsers.length} nhân sự.`)
        } catch (error) {
            console.error('Bulk delete error:', error)
            alert('Có lỗi xảy ra khi xóa nhân sự. Vui lòng thử lại.')
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    // Filter helpers
    const hasActiveFilters = projectFilter !== 'all' || statusFilter !== 'all' || departmentFilter !== 'all'

    const clearAllFilters = () => {
        setProjectFilter('all')
        setStatusFilter('all')
        setDepartmentFilter('all')
    }

    // Pagination calculations - use current data length
    const totalItems = filteredUsers.length
    const showAllItems = itemsPerPage === 0
    const effectiveItemsPerPage = showAllItems ? totalItems : itemsPerPage
    const totalPages = Math.ceil(totalItems / effectiveItemsPerPage)
    const startIndex = (currentPage - 1) * effectiveItemsPerPage
    const endIndex = startIndex + effectiveItemsPerPage

    // Reset to page 1 when search or filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, activeTab, projectFilter, statusFilter, departmentFilter])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleItemsPerPageChange = (value: string) => {
        const newValue = value === 'all' ? 0 : Number(value)
        setItemsPerPage(newValue)
        setCurrentPage(1)
    }

    const handleEdit = (user: any) => {
        setEditingUser(user)
        setIsSheetOpen(true)
    }

    const handleDelete = async (email: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa nhân sự này? (Hành động này không xóa tài khoản Auth nếu user đã đăng ký)')) {
            try {
                await deletePersonnel(email)
                // Refetch from store
                await personnelStore.refresh()
            } catch (error) {
                console.error('Error deleting personnel:', error)
                alert('Có lỗi xảy ra khi xóa nhân sự.')
            }
        }
    }

    // Excel Export Handler
    const handleExportExcel = async () => {
        try {
            const allUsers = await getAllPersonnel(projectId || null)

            const data = allUsers.map((u: any, index: number) => ({
                'STT': index + 1,
                'Email công việc': u.email,
                'Họ và tên': u.full_name,
                'Mã nhân viên': u.employee_id,
                'Số điện thoại': u.phone_number,
                'Phòng ban': u.department,
                'Chức vụ': u.position,
                'Level': u.level,
                'Trạng thái': u.work_status,
                'Quyền truy cập': ROLE_MAP[u.access_level]?.label,
                'Ngày vào làm': u.join_date,
                'Loại hợp đồng': u.contract_type,
                'Hạn hợp đồng': u.contract_end_date,
                'Địa điểm làm việc': u.work_location,
                'Dự án': (u.project_ids && Array.isArray(u.project_ids)) ? u.project_ids.map((pid: string) => {
                    const p = projects.find(proj => proj.project_id === pid)
                    return p?.project_name || pid
                }).join(', ') : '',
                'Giới tính': u.gender,
                'Ngày sinh': u.birthday,
                'CMND/CCCD': u.id_card_number,
                'Ngày cấp': u.id_card_date,
                'Nơi cấp': u.id_card_place,
                'Quốc tịch': u.nationality,
                'Dân tộc': u.ethnicity,
                'Tôn giáo': u.religion,
                'Email cá nhân': u.personal_email,
                'Tỉnh/Thành': u.province,
                'Quận/Huyện': u.district,
                'Phường/Xã': u.ward,
                'Địa chỉ chi tiết': u.address_detail,
                'Tạm trú': u.temporary_address,
                'Hôn nhân': u.marital_status,
                'Số người phụ thuộc': u.dependents_count,
                'LH Khẩn cấp - Tên': u.emergency_contact_name,
                'LH Khẩn cấp - SĐT': u.emergency_contact_phone,
                'LH Khẩn cấp - MQH': u.emergency_relationship,
                'Trình độ học vấn': u.education_level,
                'Chuyên ngành': u.major,
                'Trường đào tạo': u.university,
                'Năm tốt nghiệp': u.graduation_year,
                'Chứng chỉ khác': u.additional_certificates,
                'Số tài khoản': u.bank_account_number,
                'Ngân hàng': u.bank_name,
                'Chi nhánh': u.bank_branch,
                'Mã số thuế': u.tax_id,
                'Số BHXH': u.social_insurance_id,
                'Số BHYT': u.health_insurance_id,
                'Ngày tham gia BH': u.insurance_join_date,
                'Nơi đăng ký KCB': u.insurance_registration_place
            }))

            const ws = XLSX.utils.json_to_sheet(data)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Danh_sach_nhan_su")
            XLSX.writeFile(wb, "Danh_sach_nhan_su.xlsx")
        } catch (error) {
            console.error('Export error:', error)
            alert('Có lỗi xảy ra khi xuất dữ liệu.')
        }
    }

    // Excel Import Handler
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

                const personnelToCreate = data.map((row: any) => {
                    // Map access level text to number
                    let accessLevel = 4 // Default to Nhân viên
                    const accessLevelText = row['Quyền truy cập']
                    if (accessLevelText === 'Admin') accessLevel = 1
                    else if (accessLevelText === 'Giám đốc') accessLevel = 2
                    else if (accessLevelText === 'Trưởng phòng') accessLevel = 3

                    // Map project names to IDs
                    const projectNames = row['Dự án']?.split(',').map((n: string) => n.trim()) || []
                    const projectIds = projectNames.map((name: string) => {
                        const p = projects.find(proj => proj.project_name === name)
                        return p?.project_id
                    }).filter(Boolean)

                    return {
                        email: row['Email công việc'] || row['Email'],
                        full_name: row['Họ và tên'] || row['Full Name'],
                        employee_id: row['Mã nhân viên'],
                        phone_number: row['Số điện thoại'] || null,
                        department: row['Phòng ban'] || null,
                        position: row['Chức vụ'] || null,
                        level: row['Level'],
                        work_status: row['Trạng thái'] || 'Đang làm việc',
                        access_level: accessLevel,
                        project_ids: projectIds.length > 0 ? projectIds : null,
                        join_date: row['Ngày vào làm'],
                        contract_type: row['Loại hợp đồng'],
                        contract_end_date: row['Hạn hợp đồng'],
                        work_location: row['Địa điểm làm việc'],
                        gender: row['Giới tính'] || 'Nam',
                        birthday: row['Ngày sinh'],
                        id_card_number: row['CMND/CCCD'],
                        id_card_date: row['Ngày cấp'],
                        id_card_place: row['Nơi cấp'],
                        nationality: row['Quốc tịch'] || 'Việt Nam',
                        ethnicity: row['Dân tộc'] || 'Kinh',
                        religion: row['Tôn giáo'] || 'Không',
                        personal_email: row['Email cá nhân'],
                        province: row['Tỉnh/Thành'],
                        district: row['Quận/Huyện'],
                        ward: row['Phường/Xã'],
                        address_detail: row['Địa chỉ chi tiết'],
                        temporary_address: row['Tạm trú'],
                        marital_status: row['Hôn nhân'],
                        dependents_count: row['Số người phụ thuộc'] ? parseInt(row['Số người phụ thuộc']) : 0,
                        emergency_contact_name: row['LH Khẩn cấp - Tên'],
                        emergency_contact_phone: row['LH Khẩn cấp - SĐT'],
                        emergency_relationship: row['LH Khẩn cấp - MQH'],
                        education_level: row['Trình độ học vấn'],
                        major: row['Chuyên ngành'],
                        university: row['Trường đào tạo'],
                        graduation_year: row['Năm tốt nghiệp'],
                        additional_certificates: row['Chứng chỉ khác'],
                        bank_account_number: row['Số tài khoản'],
                        bank_name: row['Ngân hàng'],
                        bank_branch: row['Chi nhánh'],
                        tax_id: row['Mã số thuế'],
                        social_insurance_id: row['Số BHXH'],
                        health_insurance_id: row['Số BHYT'],
                        insurance_join_date: row['Ngày tham gia BH'],
                        insurance_registration_place: row['Nơi đăng ký KCB']
                    }
                }).filter((p: any) => p.email) // Only include rows with email

                if (personnelToCreate.length > 0) {
                    await createPersonnelBulk(personnelToCreate)
                    alert(`Đã nhập thành công ${personnelToCreate.length} nhân sự!`)
                    // Refresh store
                    await personnelStore.refresh()
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center px-1">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                    <div className="relative w-full md:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 bg-card/40 border-border/40 rounded-xl focus:ring-primary/10 shadow-sm transition-all text-[13px] font-medium placeholder:text-slate-400"
                        />
                    </div>

                    {/* Project Filter */}
                    {!projectId && (
                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                            <SelectTrigger className="w-[220px] h-10 rounded-xl border-border/40 bg-card/40 text-[13px] font-semibold text-slate-700 overflow-hidden shrink-0">
                                <FolderKanban className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                                <SelectValue placeholder="Dự án" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Tất cả dự án</SelectItem>
                                {projects.map(p => (
                                    <SelectItem key={p.project_id} value={p.project_id}>
                                        {p.project_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Department Filter */}
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-[240px] h-10 rounded-xl border-border/40 bg-card/40 text-[13px] font-semibold text-slate-700 shrink-0">
                            <Building2 className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                            <SelectValue placeholder="Phòng ban" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Tất cả phòng ban</SelectItem>
                            {uniqueDepartments.map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[200px] h-10 rounded-xl border-border/40 bg-card/40 text-[13px] font-semibold text-slate-700 shrink-0">
                            <CircleDot className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="Đang làm việc">Đang làm việc</SelectItem>
                            <SelectItem value="Tạm dừng">Tạm dừng</SelectItem>
                            <SelectItem value="Nghỉ việc">Nghỉ việc</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="h-10 px-3 rounded-xl text-slate-500 hover:text-primary transition-colors shrink-0 text-[12px] font-bold"
                        >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center bg-card/40 p-1 rounded-xl border border-border/40 shadow-sm">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isPending || isLoadingData}
                            className={cn(
                                "rounded-lg h-9 w-9 transition-all font-medium",
                                (isPending || isLoadingData) ? "text-muted-foreground/40" : "hover:bg-primary/5 hover:text-primary"
                            )}
                            title="Làm mới dữ liệu"
                        >
                            <RotateCw className={cn("h-4 w-4", (isPending || isLoadingData) && "animate-spin")} />
                        </Button>
                        <div className="w-px h-4 bg-border/40 mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleExportExcel}
                            className="rounded-lg h-9 w-9 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all font-medium"
                            title="Xuất Excel"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-4 bg-border/40 mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-lg h-9 w-9 hover:bg-blue-500/5 hover:text-blue-600 transition-all font-medium"
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
                            setEditingUser(null)
                            setIsSheetOpen(true)
                        }}
                        className="bg-primary hover:bg-primary/95 text-primary-foreground shadow-md shadow-primary/10 rounded-xl px-5 h-10 font-medium transition-all active:scale-[0.98] text-xs"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Thêm nhân sự
                    </Button>
                </div>
            </div>

            {/* Bulk Delete Toolbar */}
            {selectedUsers.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">
                                Đã chọn {selectedUsers.length} nhân sự
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Bạn có thể thực hiện các hành động với nhân sự đã chọn
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUsers([])}
                            className="h-9 rounded-lg"
                        >
                            Bỏ chọn
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="h-9 rounded-lg"
                        >
                            {isDeleting ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-1" />
                            )}
                            Xóa ({selectedUsers.length})
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 px-1">
                <div className="flex items-center gap-2 bg-card/40 px-3 py-1.5 rounded-lg border border-border/40 shadow-sm">
                    <span className="text-xs font-medium text-muted-foreground">Hiển thị</span>
                    <Select value={itemsPerPage === 0 ? 'all' : String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-[110px] h-8 rounded-lg border-none bg-transparent shadow-none focus:ring-0 font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40 shadow-xl">
                            <SelectItem value="20">20 / trang</SelectItem>
                            <SelectItem value="50">50 / trang</SelectItem>
                            <SelectItem value="100">100 / trang</SelectItem>
                            <SelectItem value="all">Xem tất cả</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-xs font-medium text-muted-foreground/50">
                    {showAllItems
                        ? `Tổng số ${totalItems} nhân sự`
                        : `${startIndex + 1} - ${Math.min(endIndex, totalItems)} trong tổng số ${totalItems}`
                    }
                </div>

                {!showAllItems && totalPages > 1 && (
                    <div className="flex items-center gap-2 ml-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isPending}
                            className="h-9 w-9 p-0 rounded-lg bg-card/40 border border-border/40 hover:bg-muted font-medium"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="px-3 py-1.5 bg-card/40 rounded-lg border border-border/40 text-[11px] font-medium min-w-[100px] text-center">
                            Trang {currentPage} / {totalPages}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages || isPending}
                            className="h-9 w-9 p-0 rounded-lg bg-card/40 border border-border/40 hover:bg-muted font-medium"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="relative">
                {isPending && (
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-sm flex items-center justify-center z-50 rounded-[1.5rem]">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
                        </div>
                    </div>
                )}

                <div className="rounded-[1.5rem] overflow-hidden border border-border/40 bg-card/30 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-border/40 bg-muted/10">
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Chọn tất cả"
                                    />
                                </TableHead>
                                <TableHead className="min-w-[280px] font-semibold text-[13px] text-slate-700">Thông tin nhân sự</TableHead>
                                <TableHead className="min-w-[200px] font-semibold text-[13px] text-slate-700">Liên hệ</TableHead>
                                <TableHead className="min-w-[150px] font-semibold text-[13px] text-slate-700">Dự án & Phòng ban</TableHead>
                                <TableHead className="min-w-[150px] font-semibold text-[13px] text-slate-700">Hợp đồng & Ngày vào</TableHead>
                                <TableHead className="w-[150px] font-semibold text-[13px] text-slate-700 text-center">Trạng thái</TableHead>
                                <TableHead className="w-[80px] text-right px-6"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center text-muted-foreground/50">
                                        <div className="flex flex-col items-center gap-2">
                                            <UserCircle className="h-10 w-10 opacity-20" />
                                            <p className="text-xs">Không tìm thấy nhân sự phù hợp</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow
                                        key={user.email}
                                        className="group hover:bg-foreground/[0.015] transition-all border-border/30 h-20 cursor-pointer"
                                        onClick={() => {
                                            setDetailViewUser(user)
                                            setIsDetailViewOpen(true)
                                        }}
                                    >
                                        <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedUsers.includes(user.email)}
                                                onCheckedChange={(checked) => handleSelectUser(user.email, checked as boolean)}
                                                aria-label={`Chọn ${user.full_name}`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-11 w-11 border border-border/50 shadow-sm group-hover:scale-[1.02] transition-transform">
                                                    <AvatarImage src={user.avatar_url || undefined} />
                                                    <AvatarFallback className="bg-primary/[0.03] text-primary text-xs font-semibold">
                                                        {user.full_name?.split(' ')?.pop()?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-[15px] text-slate-800 transition-colors group-hover:text-primary leading-tight">{user.full_name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[12px] text-slate-500 font-medium">
                                                            {user.position || 'Chưa cập nhật'}
                                                        </span>
                                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                        <Badge variant="outline" className={`rounded-full px-2 py-0 h-[18.5px] text-[10.5px] font-bold border-none shadow-none ${ROLE_MAP[user.access_level]?.color.replace('/10', '/8')}`}>
                                                            {ROLE_MAP[user.access_level]?.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-[12px] text-slate-600 lowercase group-hover:text-slate-800 transition-colors">
                                                    <Mail className="h-3 w-3 opacity-60" />
                                                    <span className="font-medium">{user.email}</span>
                                                </div>
                                                {user.phone_number && (
                                                    <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                                                        <Phone className="h-3 w-3 opacity-50" />
                                                        <span>{user.phone_number}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1.5">
                                                <div className="flex flex-wrap gap-1 items-center">
                                                    {user.project_ids && user.project_ids.length > 0 ? (
                                                        user.project_ids.map((pid: string) => {
                                                            const p = projects.find(proj => proj.project_id === pid)
                                                            return (
                                                                <div
                                                                    key={pid}
                                                                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/40 text-[10.5px] font-bold text-muted-foreground transition-colors hover:bg-muted/60"
                                                                >
                                                                    <FolderKanban className="h-2.5 w-2.5 opacity-50" />
                                                                    {p?.project_name || pid}
                                                                </div>
                                                            )
                                                        })
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground/30 font-medium">Chưa gán dự án</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[12.5px] text-slate-600 font-semibold transition-colors group-hover:text-slate-800">
                                                    <Building2 className="h-3.8 w-3.8 opacity-60" />
                                                    <span>{user.department || 'Phòng quản lý'}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-slate-700">
                                                    <Calendar className="h-3.8 w-3.8 opacity-60" />
                                                    <span>{user.join_date ? new Date(user.join_date).toLocaleDateString('vi-VN') : '---'}</span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 font-semibold pl-5">
                                                    {user.contract_type || 'Chưa cập nhật'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant="outline"
                                                className={`rounded-full px-3 py-0.5 text-[11px] font-bold border-none shadow-none ${STATUS_MAP[user.work_status || 'Đang làm việc']?.color.replace('/10', '/5')}`}>
                                                {STATUS_MAP[user.work_status || 'Đang làm việc']?.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-40 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="h-4.5 w-4.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1 shadow-2xl border-border/40">
                                                    <DropdownMenuItem onClick={() => handleEdit(user)} className="rounded-lg cursor-pointer py-2">
                                                        <Pencil className="mr-2.5 h-4 w-4 opacity-50" />
                                                        <span className="text-sm font-medium">Chỉnh sửa chi tiết</span>
                                                    </DropdownMenuItem>
                                                    <Separator className="my-1 opacity-50" />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(user.email)}
                                                        className="rounded-lg text-destructive focus:text-destructive cursor-pointer py-2"
                                                    >
                                                        <Trash2 className="mr-2.5 h-4 w-4 opacity-50" />
                                                        <span className="text-sm font-medium">Xóa nhân sự</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <PersonnelSheet
                open={isSheetOpen}
                onOpenChange={(open: boolean) => {
                    setIsSheetOpen(open)
                    if (!open) setEditingUser(null)
                }}
                user={editingUser}
                projects={projects}
                onSuccess={() => personnelStore.refresh()}
            />

            {/* Bulk Delete Confirmation Dialog */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl shadow-2xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium mb-2">Xác nhận xóa nhân sự</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Bạn đang chuẩn bị xóa <strong>{selectedUsers.length} nhân sự</strong> khỏi hệ thống.
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="rounded-xl"
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmBulkDelete}
                                disabled={isDeleting}
                                className="rounded-xl"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Đang xóa...
                                    </>
                                ) : (
                                    'Xóa vĩnh viễn'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail View Panel */}
            <PersonnelDetailView
                open={isDetailViewOpen}
                onOpenChange={setIsDetailViewOpen}
                user={detailViewUser}
                onEdit={(user) => {
                    setIsDetailViewOpen(false)
                    setEditingUser(user)
                    setIsSheetOpen(true)
                }}
                onDelete={async (email) => {
                    await deletePersonnel(email)
                    await personnelStore.refresh()
                }}
            />
        </div>
    )
}
