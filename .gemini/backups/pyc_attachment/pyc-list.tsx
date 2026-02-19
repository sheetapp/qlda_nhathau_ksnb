'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MoreHorizontal, Pencil, Trash2, Search, FileText, Layers, FolderKanban, Calendar, CreditCard, ArrowUpDown, Printer, Mail, Phone, Shield, RotateCcw, X, Info, User, Briefcase, Tag, Clock, CheckCircle, XCircle, ChevronRight, Package, Calculator, Paperclip, History } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AttachmentList } from '@/components/shared/attachment-list'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { deletePYC, deletePYCs, updatePYCStatus } from '@/lib/actions/pyc'
import { PYCSheet } from './pyc-sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import { TRANG_THAI_PHIEU, LOAI_PHIEU, MUC_DO_UU_TIEN } from '@/Config/thongso'
import { cn } from '@/lib/utils'

interface PYC {
    request_id: string
    title: string
    request_type: string | null
    status: string | null
    total_amount: string | number | null
    priority: string | null
    project_id: string | null
    task_category?: string | null
    muc_dich_sd?: string | null
    notes: string | null
    created_at: string
    created_by?: string | null
    vat_display?: string | null
    vat_value?: number | null
    projects?: {
        project_name: string
    } | null
    pyc_detail?: any[]
    author?: {
        full_name: string
        avatar_url: string | null
    } | null
    approved_by?: string | null
    approved_at?: string | null
    approver?: {
        full_name: string
        avatar_url: string | null
    } | null
    approved_message?: string | null
    approved_history?: any
    attachments?: { name: string; description: string; url: string }[] | null
}

interface Personnel {
    email: string
    full_name: string
    avatar_url?: string | null
}

interface PYCListProps {
    initialPYCs: PYC[]
    projects: { project_id: string; project_name: string }[]
    personnel: Personnel[]
    projectId?: string
    externalFilters?: {
        searchTerm: string
        statusFilter: string
        typeFilter: string
        priorityFilter: string
        projectFilter: string
        createdByFilter: string
        approvedByFilter: string
    }
}

type SortKey = keyof PYC | 'project_name';

export function PYCList({ initialPYCs, projects, personnel, projectId, externalFilters }: PYCListProps) {
    const router = useRouter()
    const [isInfoOpen, setIsInfoOpen] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingPYC, setEditingPYC] = useState<PYC | null>(null)
    const [selectedPYC, setSelectedPYC] = useState<PYC | null>(null)
    const [selectedPYCs, setSelectedPYCs] = useState<string[]>([])
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null)
    const [attachmentPYC, setAttachmentPYC] = useState<PYC | null>(null)
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
    const [historyPYC, setHistoryPYC] = useState<PYC | null>(null)

    const [isConfirmApproveOpen, setIsConfirmApproveOpen] = useState(false)
    const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false)
    const [revisionMessage, setRevisionMessage] = useState('')
    const [pendingAction, setPendingAction] = useState<{ id: string, status: string } | null>(null)

    // Extract unique creators and approvers from actual data and use joined info
    const uniqueCreators = Array.from(new Set(initialPYCs.map(p => p.created_by).filter(Boolean)))
    const uniqueApprovers = Array.from(new Set(initialPYCs.map(p => p.approved_by).filter(Boolean)))

    const creatorOptions = uniqueCreators.map(email => {
        const pyc = initialPYCs.find(p => p.created_by === email)
        return {
            email: email as string,
            full_name: pyc?.author?.full_name || (email as string),
            avatar_url: pyc?.author?.avatar_url
        }
    })

    const approverOptions = uniqueApprovers.map(email => {
        const pyc = initialPYCs.find(p => p.approved_by === email)
        return {
            email: email as string,
            full_name: pyc?.approver?.full_name || (email as string),
            avatar_url: pyc?.approver?.avatar_url
        }
    })

    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const filteredPYCs = initialPYCs.filter((pyc) => {
        const currentSearchTerm = externalFilters?.searchTerm ?? ''
        const currentProjectFilter = externalFilters?.projectFilter ?? 'all'
        const currentStatusFilter = externalFilters?.statusFilter ?? 'all'
        const currentTypeFilter = externalFilters?.typeFilter ?? 'all'
        const currentPriorityFilter = externalFilters?.priorityFilter ?? 'all'
        const currentCreatedByFilter = externalFilters?.createdByFilter ?? 'all'
        const currentApprovedByFilter = externalFilters?.approvedByFilter ?? 'all'

        const matchesSearch =
            pyc.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            pyc.request_id.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            (pyc.projects?.project_name?.toLowerCase() || '').includes(currentSearchTerm.toLowerCase()) ||
            (pyc.created_by?.toLowerCase() || '').includes(currentSearchTerm.toLowerCase())

        const matchesProject = projectId
            ? pyc.project_id === projectId
            : currentProjectFilter === 'all' || pyc.project_id === currentProjectFilter

        const matchesStatus = currentStatusFilter === 'all' || pyc.status === currentStatusFilter
        const matchesType = currentTypeFilter === 'all' || pyc.request_type === currentTypeFilter
        const matchesPriority = currentPriorityFilter === 'all' || pyc.priority === currentPriorityFilter
        const matchesCreatedBy = currentCreatedByFilter === 'all' || pyc.created_by === currentCreatedByFilter
        const matchesApprovedBy = currentApprovedByFilter === 'all' || pyc.approved_by === currentApprovedByFilter

        return matchesSearch && matchesProject && matchesStatus && matchesType && matchesPriority && matchesCreatedBy && matchesApprovedBy
    })

    const sortedPYCs = [...filteredPYCs].sort((a, b) => {
        if (!sortConfig) return 0

        const { key, direction } = sortConfig
        let aValue: any = a[key as keyof PYC]
        let bValue: any = b[key as keyof PYC]

        if (key === 'project_name') {
            aValue = a.projects?.project_name || ''
            bValue = b.projects?.project_name || ''
        }

        if (aValue === null || aValue === undefined) aValue = ''
        if (bValue === null || bValue === undefined) bValue = ''

        // Handle numeric fields
        if (key === 'total_amount') {
            aValue = Number(aValue)
            bValue = Number(bValue)
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1
        if (aValue > bValue) return direction === 'asc' ? 1 : -1
        return 0
    })

    const handleEdit = (pyc: PYC) => {
        setEditingPYC(pyc)
        setIsDialogOpen(true)
    }

    const handleDelete = async (requestId: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa phiếu yêu cầu này?')) {
            try {
                await deletePYC(requestId)
                router.refresh()
            } catch (error) {
                console.error('Error deleting pyc:', error)
                alert('Có lỗi xảy ra khi xóa phiếu yêu cầu.')
            }
        }
    }

    const handleStatusChange = async (requestId: string, status: string, message?: string) => {
        try {
            await updatePYCStatus(requestId, status, message)
            router.refresh()
            // Update selectedPYC state to reflect change immediately in sheet
            if (selectedPYC && selectedPYC.request_id === requestId) {
                setSelectedPYC({ ...selectedPYC, status })
            }
            // Clear message and pending action
            setRevisionMessage('')
            setPendingAction(null)
            setIsConfirmApproveOpen(false)
            setIsRevisionDialogOpen(false)
        } catch (error) {
            console.error('Failed to update status:', error)
            alert('Có lỗi xảy ra khi cập nhật trạng thái')
        }
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedPYCs(filteredPYCs.map(p => p.request_id))
        } else {
            setSelectedPYCs([])
        }
    }

    const handleSelectPYC = (requestId: string, checked: boolean) => {
        if (checked) {
            setSelectedPYCs(prev => [...prev, requestId])
        } else {
            setSelectedPYCs(prev => prev.filter(id => id !== requestId))
        }
    }

    const handleBulkDelete = async () => {
        if (confirm(`Bạn có chắc chắn muốn xóa ${selectedPYCs.length} phiếu yêu cầu đã chọn?`)) {
            try {
                await deletePYCs(selectedPYCs)
                setSelectedPYCs([])
                router.refresh()
            } catch (error) {
                console.error('Error deleting pycs:', error)
                alert('Có lỗi xảy ra khi xóa các phiếu yêu cầu.')
            }
        }
    }


    return (
        <div className="space-y-3">


            {selectedPYCs.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm font-medium text-destructive">Đã chọn {selectedPYCs.length} phiếu</span>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="h-8 rounded-lg text-xs"
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Xóa hàng loạt
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPYCs([])}
                        className="h-8 rounded-lg text-xs"
                    >
                        Hủy chọn
                    </Button>
                </div>
            )}

            <div className="border border-border/50 rounded-xl overflow-hidden bg-card/40 backdrop-blur-xl shadow-sm font-sans">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50 bg-muted/20">
                            <TableHead className="w-[40px] pl-4">
                                <Checkbox
                                    checked={filteredPYCs.length > 0 && selectedPYCs.length === filteredPYCs.length}
                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead className="w-[50px] text-center text-[12px] text-muted-foreground">STT</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 transition-colors text-[12px] text-muted-foreground"
                                onClick={() => handleSort('priority')}
                            >
                                <div className="flex items-center gap-1">
                                    Ưu tiên
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="w-[100px] cursor-pointer hover:bg-muted/50 transition-colors text-[12px] text-muted-foreground"
                                onClick={() => handleSort('request_id')}
                            >
                                <div className="flex items-center gap-1">
                                    Mã phiếu
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 transition-colors text-[12px] text-muted-foreground"
                                onClick={() => handleSort('project_name')}
                            >
                                <div className="flex items-center gap-1">
                                    Dự án
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 transition-colors text-[12px] text-muted-foreground"
                                onClick={() => handleSort('request_type')}
                            >
                                <div className="flex items-center gap-1">
                                    Phân loại
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 transition-colors text-[12px] text-muted-foreground"
                                onClick={() => handleSort('title')}
                            >
                                <div className="flex items-center gap-1">
                                    Nội dung
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>

                            <TableHead className="text-[12px] text-muted-foreground">Tài liệu</TableHead>

                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 transition-colors text-[12px] text-muted-foreground"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center gap-1">
                                    Trạng thái
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="text-right cursor-pointer hover:bg-muted/50 transition-colors text-[12px] text-muted-foreground"
                                onClick={() => handleSort('total_amount')}
                            >
                                <div className="flex items-center justify-end gap-1">
                                    Thành tiền
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>

                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 transition-colors text-[12px] text-muted-foreground"
                                onClick={() => handleSort('created_by')}
                            >
                                <div className="flex items-center gap-1">
                                    Người tạo
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>

                            <TableHead className="text-right text-[12px] text-muted-foreground">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedPYCs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                                    Không tìm thấy phiếu yêu cầu nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedPYCs.map((pyc, index) => (
                                <TableRow
                                    key={pyc.request_id}
                                    className="group hover:bg-foreground/[0.02] transition-colors border-border/50 cursor-pointer"
                                    onClick={() => {
                                        setSelectedPYC(pyc)
                                        setIsInfoOpen(true)
                                    }}
                                >
                                    <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedPYCs.includes(pyc.request_id)}
                                            onCheckedChange={(checked) => handleSelectPYC(pyc.request_id, !!checked)}
                                            aria-label={`Select pyc ${pyc.request_id}`}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center text-[13px] text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            "text-[10px] w-fit",
                                            pyc.priority === 'Khẩn cấp' ? "text-red-500 border-red-200 bg-red-50" :
                                                pyc.priority === 'Cao' ? "text-orange-500 border-orange-200 bg-orange-50" :
                                                    "text-blue-500 border-blue-200 bg-blue-50"
                                        )}>
                                            {pyc.priority || 'Thường'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-[13px] text-primary">{pyc.request_id}</TableCell>
                                    <TableCell>
                                        {pyc.projects?.project_name ? (
                                            <div className="flex items-center gap-2 text-[11px] text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-full w-fit">
                                                <FolderKanban className="h-3 w-3" />
                                                <span className="truncate max-w-[100px]">{pyc.projects.project_name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground italic">
                                                <Layers className="h-3 w-3" />
                                                <span>Dùng chung</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs">{pyc.request_type || '-'}</TableCell>
                                    <TableCell className="max-w-[200px]">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium truncate" title={pyc.title}>{pyc.title}</div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {pyc.attachments && pyc.attachments.length > 0 ? (
                                            <div className="flex items-center gap-1.5 text-primary">
                                                <FileText className="h-3.5 w-3.5" />
                                                <span className="text-[11px] font-medium">{pyc.attachments.length}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground italic">-</span>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant="secondary" className={cn(
                                            "rounded-full px-2.5 py-0.5 text-[10px] tracking-tight border-none",
                                            pyc.status === 'Đã duyệt' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                                pyc.status === 'Từ chối' ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                                                    pyc.status === 'Cần chỉnh sửa' ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                                                        "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                        )}>
                                            {pyc.status || 'Chờ duyệt'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-[13px] text-foreground">
                                        {new Intl.NumberFormat('vi-VN').format(Number(pyc.total_amount || 0))}
                                    </TableCell>
                                    <TableCell className="text-[13px] text-muted-foreground py-2">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-7 w-7 border border-border/50">
                                                    <AvatarImage src={pyc.author?.avatar_url || ''} />
                                                    <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                                                        {(pyc.author?.full_name || pyc.created_by || 'U')
                                                            .split(' ')
                                                            .pop()
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="truncate max-w-[120px] text-foreground/80 font-medium">
                                                    {pyc.author?.full_name || pyc.created_by || '-'}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-muted-foreground/60 pl-9">
                                                {new Date(pyc.created_at).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-0.5">
                                            {pyc.status === 'Chờ duyệt' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                                    onClick={() => {
                                                        setPendingAction({ id: pyc.request_id, status: 'Đã duyệt' })
                                                        setIsConfirmApproveOpen(true)
                                                    }}
                                                    title="Phê duyệt"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                                                onClick={() => {
                                                    window.open(`/pyc-print/${pyc.request_id}`, '_blank')
                                                }}
                                                title="In phiếu"
                                            >
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-primary hover:text-primary hover:bg-primary/5 transition-colors"
                                                onClick={() => setAttachmentPYC(pyc)}
                                                title="Đính kèm tài liệu"
                                            >
                                                <Paperclip className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                                onClick={() => handleEdit(pyc)}
                                                title="Sửa"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                                onClick={() => {
                                                    setHistoryPYC(pyc)
                                                    setIsHistoryDialogOpen(true)
                                                }}
                                                title="Lịch sử phê duyệt"
                                            >
                                                <History className="h-4 w-4" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/50 transition-colors">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1.5 backdrop-blur-xl bg-card/95 border-border/50">
                                                    <DropdownMenuItem className="rounded-lg cursor-pointer transition-colors">
                                                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">Gửi Email</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="rounded-lg text-red-600 focus:text-red-700 cursor-pointer transition-colors"
                                                        onClick={() => {
                                                            setPendingAction({ id: pyc.request_id, status: 'Từ chối' })
                                                            setRevisionMessage('')
                                                            setIsRevisionDialogOpen(true)
                                                        }}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        <span className="text-sm">Từ chối</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setPendingAction({ id: pyc.request_id, status: 'Cần chỉnh sửa' })
                                                            setRevisionMessage('')
                                                            setIsRevisionDialogOpen(true)
                                                        }}
                                                        className="rounded-lg cursor-pointer transition-colors"
                                                    >
                                                        <RotateCcw className="mr-2 h-4 w-4 text-amber-600" />
                                                        <span className="text-sm">Yêu cầu sửa</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(pyc.request_id)}
                                                        className="rounded-lg text-destructive focus:text-destructive cursor-pointer transition-colors"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span className="text-sm">Xóa phiếu</span>
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

            <PYCSheet
                open={isDialogOpen}
                onOpenChange={(open: boolean) => {
                    setIsDialogOpen(open)
                    if (!open) setEditingPYC(null)
                }}
                pyc={editingPYC}
                projects={projects}
                projectId={projectId}
                onSuccess={() => router.refresh()}
            />

            {/* Attachments Dialog */}
            <Dialog open={!!attachmentPYC} onOpenChange={(open) => !open && setAttachmentPYC(null)}>
                <DialogContent className="sm:max-w-[550px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <div className="p-8 pb-4">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                                <Paperclip className="h-5 w-5 text-primary" />
                                Đính kèm: {attachmentPYC?.request_id}
                            </DialogTitle>
                            <DialogDescription className="text-[13px] text-slate-500">
                                {attachmentPYC?.title}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="px-8 pb-8 pt-4">
                        {attachmentPYC && (
                            <AttachmentList
                                tableName="pyc"
                                refId={attachmentPYC.request_id}
                                title="Danh sách tài liệu đính kèm"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Info Sheet (Personnel Style) */}
            <Sheet open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                <SheetContent side="right" className="sm:max-w-3xl p-0 flex flex-col h-full border-l border-border/50">
                    {selectedPYC && (
                        <>
                            <div className="flex-1 overflow-y-auto">
                                {/* Header Section */}
                                <div className="p-8 pb-6 border-b border-border/50 bg-card/30 relative">
                                    <div className="flex items-start gap-6">
                                        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                                            <FileText className="h-10 w-10 text-primary" />
                                        </div>

                                        <div className="flex-1 space-y-2 pt-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{selectedPYC.title}</h2>
                                                    <div className="flex items-center gap-2 text-sm text-primary font-medium mt-2">
                                                        <Layers className="h-3.5 w-3.5" />
                                                        {selectedPYC.projects?.project_name || 'Dùng chung'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            handleEdit(selectedPYC!)
                                                            setIsInfoOpen(false)
                                                        }}
                                                        className="h-9 rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 px-4"
                                                    >
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            handleDelete(selectedPYC!.request_id)
                                                            setIsInfoOpen(false)
                                                        }}
                                                        className="h-9 rounded-xl border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 px-4"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </div>
                                            <Badge className={cn(
                                                "rounded-full px-3 py-0.5 text-[11px] font-medium border-none",
                                                selectedPYC.status === 'Đã duyệt' ? "bg-emerald-500/10 text-emerald-600" :
                                                    selectedPYC.status === 'Từ chối' ? "bg-red-500/10 text-red-600" :
                                                        selectedPYC.status === 'Cần chỉnh sửa' ? "bg-blue-500/10 text-blue-600" :
                                                            "bg-amber-500/10 text-amber-600"
                                            )}>
                                                {selectedPYC.status || 'Chờ duyệt'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Quick Actions Bar */}
                                    <div className="flex items-center justify-between mt-10 px-4">
                                        {[
                                            { icon: Printer, label: 'In phiếu', color: 'text-blue-600', bg: 'bg-blue-50', action: () => window.open(`/pyc-print/${selectedPYC.request_id}`, '_blank') },
                                            { icon: FileText, label: 'Đính kèm', color: 'text-cyan-600', bg: 'bg-cyan-50' },
                                            { icon: Mail, label: 'Gửi Email', color: 'text-purple-600', bg: 'bg-purple-50' },
                                            { icon: CheckCircle, label: 'Phê duyệt', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                            { icon: XCircle, label: 'Từ chối', color: 'text-red-600', bg: 'bg-red-50' },
                                            { icon: RotateCcw, label: 'Y/c sửa', color: 'text-amber-600', bg: 'bg-amber-50' }
                                        ].map((action, i) => (
                                            <div
                                                key={i}
                                                className="flex flex-col items-center gap-2 group cursor-pointer"
                                                onClick={() => {
                                                    if ((action as any).action) (action as any).action()
                                                    if (action.label === 'Phê duyệt') {
                                                        setPendingAction({ id: selectedPYC.request_id, status: 'Đã duyệt' })
                                                        setIsConfirmApproveOpen(true)
                                                    }
                                                    if (action.label === 'Từ chối') {
                                                        setPendingAction({ id: selectedPYC.request_id, status: 'Từ chối' })
                                                        setRevisionMessage('')
                                                        setIsRevisionDialogOpen(true)
                                                    }
                                                    if (action.label === 'Y/c sửa') {
                                                        setPendingAction({ id: selectedPYC.request_id, status: 'Cần chỉnh sửa' })
                                                        setRevisionMessage('')
                                                        setIsRevisionDialogOpen(true)
                                                    }
                                                    if (action.label === 'Đính kèm') {
                                                        setAttachmentPYC(selectedPYC)
                                                        setIsInfoOpen(false)
                                                    }
                                                    if (action.label === 'Lịch sử') {
                                                        setHistoryPYC(selectedPYC)
                                                        setIsHistoryDialogOpen(true)
                                                        setIsInfoOpen(false)
                                                    }
                                                }}
                                            >
                                                <div className={cn(
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border border-border/50",
                                                    "hover:scale-110",
                                                    action.bg
                                                )}>
                                                    <action.icon className={cn("h-5 w-5", action.color)} />
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-semibold tracking-tight">{action.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-8 space-y-12">
                                    {/* Section 1: Thông tin cơ bản */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 text-primary border-b border-primary/10 pb-2">
                                            <Info className="h-4 w-4" />
                                            <h3 className="text-sm font-semibold tracking-tight">THÔNG TIN CƠ BẢN</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                            <div className="space-y-1.5">
                                                <div className="text-[12px] font-medium text-slate-500 tracking-wide">Mã phiếu</div>
                                                <div className="text-[14px] font-semibold text-foreground px-3 py-2 rounded-lg bg-muted/30 border border-border/30">{selectedPYC.request_id}</div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="text-[12px] font-medium text-slate-500 tracking-wide">Dự án áp dụng</div>
                                                <div className="text-[14px] font-medium text-foreground">{selectedPYC.projects?.project_name || 'Dùng chung'}</div>
                                            </div>
                                            <div className="space-y-1.5 col-span-2">
                                                <div className="text-[12px] font-medium text-slate-500 tracking-wide">Tiêu đề phiếu</div>
                                                <div className="text-[15px] font-semibold text-foreground leading-tight">{selectedPYC.title}</div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="text-[12px] font-medium text-slate-500 tracking-wide">Loại yêu cầu</div>
                                                <div className="text-[14px] font-medium text-foreground">{selectedPYC.request_type || '-'}</div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="text-[12px] font-medium text-slate-500 tracking-wide">Độ ưu tiên</div>
                                                <Badge variant="outline" className={cn(
                                                    "font-semibold",
                                                    selectedPYC.priority === 'Khẩn cấp' ? "text-red-600 border-red-200 bg-red-50" :
                                                        selectedPYC.priority === 'Cao' ? "text-orange-600 border-orange-200 bg-orange-50" :
                                                            "text-blue-600 border-blue-200 bg-blue-50"
                                                )}>
                                                    {selectedPYC.priority || 'Thường'}
                                                </Badge>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="text-[12px] font-medium text-slate-500 tracking-wide">VAT mặc định</div>
                                                <div className="text-[14px] font-medium text-foreground">{selectedPYC.vat_display || '10%'}</div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="text-[12px] font-medium text-slate-500 tracking-wide">Hạng mục công việc</div>
                                                <div className="text-[14px] font-medium text-foreground">{selectedPYC.task_category || 'Chưa chọn'}</div>
                                            </div>
                                            <div className="space-y-1.5 col-span-2">
                                                <div className="text-[12px] font-medium text-slate-500 tracking-wide">Mục đích sử dụng</div>
                                                <div className="text-[14px] font-medium text-foreground bg-primary/5 p-4 rounded-xl border border-primary/10">
                                                    {selectedPYC.muc_dich_sd || 'Chưa cập nhật mục đích'}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 2: Chi tiết vật tư / Công việc */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 text-primary border-b border-primary/10 pb-2">
                                            <Package className="h-4 w-4" />
                                            <h3 className="text-sm font-semibold tracking-tight">CHI TIẾT PHIẾU</h3>
                                        </div>

                                        <div className="rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                                            <Table>
                                                <TableHeader className="bg-muted/50">
                                                    <TableRow className="hover:bg-transparent border-none">
                                                        <TableHead className="text-[12px] h-10 font-medium text-slate-500">Tên vật tư</TableHead>
                                                        <TableHead className="text-[12px] h-10 w-[60px] text-center font-medium text-slate-500">Đvt</TableHead>
                                                        <TableHead className="text-[12px] h-10 w-[60px] text-center font-medium text-slate-500">Số lượng</TableHead>
                                                        <TableHead className="text-[12px] h-10 text-right font-medium text-slate-500">Đơn giá</TableHead>
                                                        <TableHead className="text-[12px] h-10 text-right font-medium text-slate-500">Thành tiền</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedPYC.pyc_detail && selectedPYC.pyc_detail.length > 0 ? (
                                                        selectedPYC.pyc_detail.map((detail: any, idx: number) => (
                                                            <TableRow key={idx} className="hover:bg-muted/20 border-border/30">
                                                                <TableCell className="py-3">
                                                                    <div className="text-[13px] font-semibold text-foreground leading-tight">{detail.item_name}</div>
                                                                    <div className="text-[10px] text-muted-foreground mt-0.5">{detail.category}</div>
                                                                </TableCell>
                                                                <TableCell className="py-3 text-[12px] text-center font-medium">{detail.unit}</TableCell>
                                                                <TableCell className="py-3 text-[12px] text-center font-semibold text-primary">{detail.quantity}</TableCell>
                                                                <TableCell className="py-3 text-[12px] text-right font-medium">
                                                                    {new Intl.NumberFormat('vi-VN').format(detail.unit_price || 0)}
                                                                </TableCell>
                                                                <TableCell className="py-3 text-[12px] text-right font-semibold text-primary">
                                                                    {new Intl.NumberFormat('vi-VN').format(detail.line_total || 0)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic text-xs">
                                                                Chưa có dữ liệu chi tiết vật tư
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </section>

                                    {/* Section 3: Tiến độ tài chính & Ghi chú */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 text-primary border-b border-primary/10 pb-2">
                                            <Calculator className="h-4 w-4" />
                                            <h3 className="text-sm font-semibold tracking-tight">TÀI CHÍNH - GHI CHÚ</h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-y-6">
                                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <div className="text-[12px] font-medium text-primary tracking-wide">Tổng cộng tiền phiếu</div>
                                                    <div className="text-2xl font-semibold text-primary">
                                                        {new Intl.NumberFormat('vi-VN').format(Number(selectedPYC.total_amount || 0))}
                                                        <span className="text-xs ml-1 font-semibold">VNĐ</span>
                                                    </div>
                                                </div>
                                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    <CreditCard className="h-6 w-6 text-primary" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-[12px] font-medium text-slate-500 tracking-wide ml-1">Ghi chú phiếu</div>
                                                <div className="text-[14px] font-medium text-foreground bg-muted/30 p-4 rounded-xl border border-border/30 min-h-[80px]">
                                                    {selectedPYC.notes || 'Không có ghi chú bổ sung'}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 4: Nhân sự liên quan */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 text-primary border-b border-primary/10 pb-2">
                                            <User className="h-4 w-4" />
                                            <h3 className="text-sm font-semibold tracking-tight">NHÂN SỰ</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="p-4 rounded-2xl bg-muted/30 border border-border/30 flex items-center gap-4 transition-all hover:bg-muted/50">
                                                <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                                                    <AvatarImage src={selectedPYC.author?.avatar_url || ''} />
                                                    <AvatarFallback className="text-xs font-semibold">U</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] text-primary font-medium tracking-tight">Người lập phiếu</span>
                                                    <span className="text-[14px] font-semibold">{selectedPYC.author?.full_name || selectedPYC.created_by}</span>
                                                    <span className="text-[10px] text-primary font-medium">
                                                        {selectedPYC.created_at ? new Date(selectedPYC.created_at).toLocaleString('vi-VN') : '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            {(() => {
                                                const approverInfo = selectedPYC.approved_by
                                                    ? personnel.find(p => p.email === selectedPYC.approved_by)
                                                    : null;

                                                if (selectedPYC.status === 'Đã duyệt') {
                                                    return (
                                                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/30 flex items-center gap-4 transition-all hover:bg-muted/50">
                                                            <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                                                                <AvatarImage src={approverInfo?.avatar_url || ''} />
                                                                <AvatarFallback className="text-xs font-semibold">A</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] text-primary font-medium tracking-tight">Người duyệt phiếu</span>
                                                                <span className="text-[14px] font-semibold">{approverInfo?.full_name || selectedPYC.approved_by || 'Hệ thống'}</span>
                                                                {selectedPYC.approved_at && (
                                                                    <span className="text-[10px] text-primary font-medium">
                                                                        {new Date(selectedPYC.approved_at).toLocaleString('vi-VN')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/30 flex flex-col justify-center items-center gap-3 transition-all hover:bg-muted/50">
                                                        <span className="text-[11px] text-primary font-medium tracking-tight uppercase">Trạng thái phê duyệt</span>
                                                        <span className="text-[14px] font-semibold text-amber-600">Chưa phê duyệt</span>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </section>

                                    {/* Section 5: Tài liệu đính kèm (Thông tin chi tiết) */}
                                    <section className="space-y-6 pb-12">
                                        <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                            <div className="flex items-center gap-2 text-primary">
                                                <FileText className="h-4 w-4" />
                                                <h3 className="text-sm font-semibold tracking-tight uppercase">Tài liệu đính kèm</h3>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-primary hover:bg-primary/5"
                                                onClick={() => {
                                                    setAttachmentPYC(selectedPYC)
                                                    setIsInfoOpen(false)
                                                }}
                                            >
                                                <Paperclip className="h-3.5 w-3.5 mr-2" />
                                                Quản lý đính kèm
                                            </Button>
                                        </div>

                                        {/* Display a small preview of current attachments list records */}
                                        <div className="bg-muted/10 rounded-2xl border border-dashed border-border/40 p-1">
                                            <AttachmentList
                                                tableName="pyc"
                                                refId={selectedPYC.request_id}
                                                title=""
                                            />
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
            {/* Confirmation Dialog for Approval */}
            <Dialog open={isConfirmApproveOpen} onOpenChange={setIsConfirmApproveOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận phê duyệt</DialogTitle>
                        <DialogDescription>
                            Bạn có muốn phê duyệt phiếu yêu cầu <strong>{pendingAction?.id}</strong> này không?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsConfirmApproveOpen(false)}>Hủy</Button>
                        <Button onClick={() => pendingAction && handleStatusChange(pendingAction.id, 'Đã duyệt')}>Đồng ý</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Approval History Dialog */}
            <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl border-border/50 shadow-2xl">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            Lịch sử phê duyệt
                        </DialogTitle>
                        <DialogDescription className="text-[13px] text-muted-foreground mt-1 font-medium">
                            Chi tiết quá trình xử lý phiếu <strong>{historyPYC?.request_id}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {(() => {
                            if (!historyPYC?.approved_history) {
                                return (
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
                                        <Clock className="h-10 w-10 opacity-20" />
                                        <p className="text-sm font-medium">Chưa có lịch sử phê duyệt</p>
                                    </div>
                                )
                            }

                            let history = []
                            try {
                                history = typeof historyPYC.approved_history === 'string'
                                    ? JSON.parse(historyPYC.approved_history)
                                    : historyPYC.approved_history
                            } catch (e) {
                                console.error('Failed to parse history:', e)
                            }

                            if (!Array.isArray(history) || history.length === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
                                        <Clock className="h-10 w-10 opacity-20" />
                                        <p className="text-sm font-medium">Chưa có lịch sử phê duyệt</p>
                                    </div>
                                )
                            }

                            return (
                                <div className="relative space-y-0 pb-4">
                                    {/* Timeline Line */}
                                    <div className="absolute left-4 top-2 bottom-6 w-[2px] bg-primary/10 rounded-full" />

                                    {history.slice().reverse().map((entry: any, index: number) => (
                                        <div key={index} className="relative pl-10 pb-8 last:pb-2 group">
                                            {/* dot */}
                                            <div className={cn(
                                                "absolute left-[9px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background z-10 transition-transform group-hover:scale-110 shadow-sm",
                                                entry.status === 'Đã duyệt' ? 'bg-emerald-500' :
                                                    entry.status === 'Từ chối' ? 'bg-red-500' :
                                                        entry.status === 'Cần chỉnh sửa' ? 'bg-amber-500' : 'bg-primary'
                                            )} />

                                            <div className="flex flex-col gap-1.5 antialiased">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className={cn(
                                                        "text-[14px] font-semibold tracking-tight",
                                                        entry.status === 'Đã duyệt' ? 'text-emerald-600' :
                                                            entry.status === 'Từ chối' ? 'text-red-600' :
                                                                entry.status === 'Cần chỉnh sửa' ? 'text-amber-600' : 'text-primary'
                                                    )}>
                                                        {entry.status}
                                                    </span>
                                                    <span className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        {entry.at ? new Date(entry.at).toLocaleString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : 'N/A'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {(() => {
                                                        const userInfo = personnel.find(p => p.email === entry.user)
                                                        return (
                                                            <>
                                                                <Avatar className="h-6 w-6 border border-border/50">
                                                                    <AvatarImage src={userInfo?.avatar_url || ''} />
                                                                    <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                                                                        {userInfo?.full_name?.charAt(0) || entry.user?.charAt(0) || 'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-[13px] text-foreground font-medium">
                                                                    {userInfo?.full_name || entry.user || 'Hệ thống'}
                                                                </span>
                                                            </>
                                                        )
                                                    })()}
                                                </div>

                                                {entry.message && (
                                                    <div className="mt-1 p-3 rounded-xl bg-muted/30 border border-border/30 text-[13px] text-foreground leading-relaxed shadow-sm italic font-normal">
                                                        "{entry.message}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        })()}
                    </div>

                    <div className="p-4 bg-muted/30 border-t border-border/50 flex justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setIsHistoryDialogOpen(false)}
                            className="h-9 px-6 rounded-xl text-[13px] font-semibold border-border/50 bg-background hover:bg-muted transition-all active:scale-95"
                        >
                            Đóng
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
