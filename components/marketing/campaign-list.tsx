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
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Search,
    FolderKanban,
    CircleDot,
    ChevronLeft,
    ChevronRight,
    Download,
    Loader2,
    RotateCw,
    Eye,
    Pause,
    Play,
    BarChart3,
    Megaphone,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import * as XLSX from 'xlsx'
import {
    deleteCampaign,
    deleteCampaignsBulk,
    getCampaigns,
    updateCampaignStatus,
} from '@/lib/actions/marketing'
import { marketingStore, Campaign } from '@/lib/marketing-store'
import { CAMPAIGN_STATUS_COLORS, CHANNEL_ICONS } from '@/lib/constants/marketing'

interface CampaignListProps {
    campaigns: Campaign[]
    projects: { project_id: string; project_name: string }[]
    projectId?: string
}

export function CampaignList({ campaigns: initialCampaigns, projects, projectId }: CampaignListProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [campaigns, setCampaigns] = useState<Campaign[]>(marketingStore.getCachedCampaigns())
    const [isLoadingData, setIsLoadingData] = useState(marketingStore.getIsLoading())
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [projectFilter, setProjectFilter] = useState(projectId || 'all')
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Subscribe to marketing store
    useEffect(() => {
        if (campaigns.length === 0) {
            setIsLoadingData(true)
            marketingStore.getCampaigns(projectId || null).then(result => {
                setCampaigns(result.data)
                setIsLoadingData(false)
            })
        }

        const unsubscribe = marketingStore.subscribe((campaigns) => {
            setCampaigns(campaigns)
            setIsLoadingData(marketingStore.getIsLoading())
        })
        return unsubscribe
    }, [])

    const handleRefresh = async () => {
        startTransition(async () => {
            try {
                await marketingStore.refresh(projectId || null)
            } catch (error) {
                console.error('Error refreshing campaigns:', error)
            }
        })
    }

    // Filter campaigns
    const filteredCampaigns = campaigns.filter(campaign => {
        if (projectFilter !== 'all' && campaign.project_id !== projectFilter) {
            return false
        }
        if (statusFilter !== 'all' && campaign.status !== statusFilter) {
            return false
        }
        if (typeFilter !== 'all' && !campaign.channels.includes(typeFilter)) {
            return false
        }
        if (searchTerm) {
            const search = searchTerm.toLowerCase()
            return (
                campaign.campaign_name.toLowerCase().includes(search) ||
                campaign.description?.toLowerCase().includes(search) ||
                campaign.objective.toLowerCase().includes(search)
            )
        }
        return true
    })

    // Multi-select logic
    const allSelected = filteredCampaigns.length > 0 && selectedCampaigns.length === filteredCampaigns.length
    const someSelected = selectedCampaigns.length > 0 && selectedCampaigns.length < filteredCampaigns.length

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedCampaigns(filteredCampaigns.map(c => c.campaign_id))
        } else {
            setSelectedCampaigns([])
        }
    }

    const handleSelectCampaign = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedCampaigns(prev => [...prev, id])
        } else {
            setSelectedCampaigns(prev => prev.filter(cid => cid !== id))
        }
    }

    // Pagination
    const totalItems = filteredCampaigns.length
    const effectiveItemsPerPage = itemsPerPage === 0 ? totalItems : itemsPerPage
    const totalPages = Math.ceil(totalItems / effectiveItemsPerPage)
    const startIndex = (currentPage - 1) * effectiveItemsPerPage
    const endIndex = startIndex + effectiveItemsPerPage
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex)

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, statusFilter, typeFilter, projectFilter])

    // Handlers
    const handleDelete = async (campaignId: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa chiến dịch này?')) {
            try {
                await deleteCampaign(campaignId)
                await marketingStore.refresh(projectId || null)
            } catch (error) {
                console.error('Error deleting campaign:', error)
                alert('Có lỗi xảy ra khi xóa chiến dịch.')
            }
        }
    }

    const handleBulkDelete = async () => {
        if (confirm(`Bạn có chắc chắn muốn xóa ${selectedCampaigns.length} chiến dịch?`)) {
            try {
                await deleteCampaignsBulk(selectedCampaigns)
                setSelectedCampaigns([])
                await marketingStore.refresh(projectId || null)
                alert(`Đã xóa thành công ${selectedCampaigns.length} chiến dịch.`)
            } catch (error) {
                console.error('Error bulk deleting campaigns:', error)
                alert('Có lỗi xảy ra khi xóa chiến dịch.')
            }
        }
    }

    const handleStatusUpdate = async (campaignId: string, newStatus: string) => {
        try {
            await updateCampaignStatus(campaignId, newStatus)
            await marketingStore.refresh(projectId || null)
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Có lỗi xảy ra khi cập nhật trạng thái.')
        }
    }

    const handleExportExcel = async () => {
        try {
            const dataToExport = filteredCampaigns.map((campaign, index) => ({
                'STT': index + 1,
                'Tên chiến dịch': campaign.campaign_name,
                'Mục tiêu': campaign.objective,
                'Kênh': campaign.channels.join(', '),
                'Ngân sách': campaign.total_budget,
                'Đã chi': campaign.spent_amount,
                'ROI': campaign.spent_amount > 0
                    ? (((0 - campaign.spent_amount) / campaign.spent_amount) * 100).toFixed(2)
                    : '0',
                'Trạng thái': campaign.status,
                'Ngày bắt đầu': campaign.start_date,
                'Ngày kết thúc': campaign.end_date || '-',
                'Dự án': campaign.project?.project_name || '-',
                'Mô tả': campaign.description || '',
            }))

            const worksheet = XLSX.utils.json_to_sheet(dataToExport)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Campaigns')
            XLSX.writeFile(workbook, `campaigns-${new Date().toISOString().split('T')[0]}.xlsx`)
        } catch (error) {
            console.error('Error exporting:', error)
            alert('Có lỗi xảy ra khi xuất file.')
        }
    }

    const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || projectFilter !== 'all'

    const clearAllFilters = () => {
        setStatusFilter('all')
        setTypeFilter('all')
        setProjectFilter(projectId || 'all')
    }

    return (
        <div className="space-y-6">
            {/* Controls Bar */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center px-1">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                    {/* Search */}
                    <div className="relative w-full md:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 bg-card/40 border-border/40 rounded-xl focus:ring-primary/10 shadow-sm transition-all text-[13px] font-medium placeholder:text-slate-400"
                        />
                    </div>

                    {/* Filters */}
                    {!projectId && (
                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                            <SelectTrigger className="w-[220px] h-10 rounded-xl border-border/40 bg-card/40 text-[13px] font-semibold text-slate-700 shrink-0">
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

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[200px] h-10 rounded-xl border-border/40 bg-card/40 text-[13px] font-semibold text-slate-700 shrink-0">
                            <Megaphone className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                            <SelectValue placeholder="Loại" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Tất cả loại</SelectItem>
                            <SelectItem value="Email">📧 Email</SelectItem>
                            <SelectItem value="SMS">💬 SMS</SelectItem>
                            <SelectItem value="Facebook">👍 Facebook</SelectItem>
                            <SelectItem value="Instagram">📸 Instagram</SelectItem>
                            <SelectItem value="LinkedIn">💼 LinkedIn</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] h-10 rounded-xl border-border/40 bg-card/40 text-[13px] font-semibold text-slate-700 shrink-0">
                            <CircleDot className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="Draft">📝 Nháp</SelectItem>
                            <SelectItem value="Scheduled">⏰ Lên lịch</SelectItem>
                            <SelectItem value="Running">🚀 Đang chạy</SelectItem>
                            <SelectItem value="Paused">⏸️ Tạm dừng</SelectItem>
                            <SelectItem value="Completed">✅ Hoàn thành</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="h-10 px-3 text-xs font-semibold rounded-xl hover:bg-muted/50"
                        >
                            ✕ Xóa bộ lọc
                        </Button>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isPending}
                    className="h-10 w-10 rounded-xl"
                >
                    <RotateCw className={cn("h-4 w-4", isPending && "animate-spin")} />
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-border/50 shadow-sm bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/50">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={someSelected ? 'indeterminate' : allSelected}
                                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                                />
                            </TableHead>
                            <TableHead className="font-semibold text-[13px]">Chiến dịch</TableHead>
                            <TableHead className="font-semibold text-[13px]">Loại</TableHead>
                            <TableHead className="font-semibold text-[13px]">Trạng thái</TableHead>
                            <TableHead className="font-semibold text-[13px]">Ngân sách</TableHead>
                            <TableHead className="font-semibold text-[13px]">Đã chi</TableHead>
                            <TableHead className="font-semibold text-[13px]">Bắt đầu</TableHead>
                            <TableHead className="text-center font-semibold text-[13px]">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingData ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : paginatedCampaigns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Megaphone className="h-8 w-8 opacity-30" />
                                        <p className="text-sm">Chưa có chiến dịch nào</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedCampaigns.map((campaign) => (
                                <TableRow key={campaign.campaign_id} className="border-border/50 hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedCampaigns.includes(campaign.campaign_id)}
                                            onCheckedChange={(checked) => handleSelectCampaign(campaign.campaign_id, checked === true)}
                                        />
                                    </TableCell>

                                    <TableCell className="font-medium text-[13px]">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-semibold text-foreground">{campaign.campaign_name}</span>
                                            {campaign.description && (
                                                <span className="text-xs text-muted-foreground line-clamp-1">{campaign.description}</span>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex gap-1 flex-wrap">
                                            {campaign.channels.slice(0, 2).map(channel => (
                                                <Badge key={channel} variant="secondary" className="text-xs rounded-md">
                                                    {CHANNEL_ICONS[channel as keyof typeof CHANNEL_ICONS]} {channel}
                                                </Badge>
                                            ))}
                                            {campaign.channels.length > 2 && (
                                                <Badge variant="outline" className="text-xs rounded-md">
                                                    +{campaign.channels.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            className={cn(
                                                "rounded-full px-2.5 py-1 text-xs font-semibold border",
                                                CAMPAIGN_STATUS_COLORS[campaign.status as keyof typeof CAMPAIGN_STATUS_COLORS]?.bg,
                                                CAMPAIGN_STATUS_COLORS[campaign.status as keyof typeof CAMPAIGN_STATUS_COLORS]?.text,
                                                CAMPAIGN_STATUS_COLORS[campaign.status as keyof typeof CAMPAIGN_STATUS_COLORS]?.border,
                                            )}
                                        >
                                            {CAMPAIGN_STATUS_COLORS[campaign.status as keyof typeof CAMPAIGN_STATUS_COLORS]?.icon} {campaign.status}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="font-semibold text-[13px]">
                                        {campaign.total_budget.toLocaleString('vi-VN')} {campaign.currency_code}
                                    </TableCell>

                                    <TableCell className="text-[13px]">
                                        {campaign.spent_amount.toLocaleString('vi-VN')} {campaign.currency_code}
                                        <div className="text-xs text-muted-foreground">
                                            {campaign.total_budget > 0
                                                ? `${((campaign.spent_amount / campaign.total_budget) * 100).toFixed(1)}%`
                                                : '0%'
                                            }
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-[13px]">
                                        {new Date(campaign.start_date).toLocaleDateString('vi-VN')}
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/50">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/dashboard/app-store/marketing/${campaign.campaign_id}`)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Xem chi tiết
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/dashboard/app-store/marketing/${campaign.campaign_id}`)}>
                                                    <BarChart3 className="h-4 w-4 mr-2" />
                                                    Báo cáo
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => {
                                                    setEditingCampaign(campaign)
                                                    setIsSheetOpen(true)
                                                }}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {campaign.status === 'Running' ? (
                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatusUpdate(campaign.campaign_id, 'Paused')}>
                                                        <Pause className="h-4 w-4 mr-2" />
                                                        Tạm dừng
                                                    </DropdownMenuItem>
                                                ) : campaign.status === 'Paused' ? (
                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatusUpdate(campaign.campaign_id, 'Running')}>
                                                        <Play className="h-4 w-4 mr-2" />
                                                        Tiếp tục
                                                    </DropdownMenuItem>
                                                ) : null}
                                                <DropdownMenuItem
                                                    className="text-destructive cursor-pointer"
                                                    onClick={() => handleDelete(campaign.campaign_id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Xóa
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

            {/* Footer: Pagination & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="h-9 w-9 rounded-lg"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-slate-600 font-medium px-2">
                        Trang {currentPage} / {Math.max(1, totalPages)}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="h-9 w-9 rounded-lg"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                    setItemsPerPage(value === 'all' ? 0 : Number(value))
                    setCurrentPage(1)
                }}>
                    <SelectTrigger className="w-[160px] h-9 rounded-lg text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                        <SelectItem value="10">10 mục/trang</SelectItem>
                        <SelectItem value="20">20 mục/trang</SelectItem>
                        <SelectItem value="50">50 mục/trang</SelectItem>
                        <SelectItem value="all">Hiển thị tất cả</SelectItem>
                    </SelectContent>
                </Select>

                {selectedCampaigns.length > 0 && (
                    <div className="flex gap-2">
                        <span className="text-sm text-slate-600 font-medium">
                            {selectedCampaigns.length} chiến dịch được chọn
                        </span>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="h-9 rounded-lg"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa {selectedCampaigns.length}
                        </Button>
                    </div>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportExcel}
                    className="h-9 rounded-lg"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Xuất Excel
                </Button>
            </div>
        </div>
    )
}
