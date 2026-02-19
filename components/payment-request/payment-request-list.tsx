'use client'

import { useState, useTransition, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Search, FileText, Download, Upload, ChevronLeft, ChevronRight, Loader2, Paperclip, Calendar, User, CreditCard, CheckCircle2, Info, Eye, TrendingUp, RotateCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getPaymentRequests, getAllPaymentRequests } from '@/lib/actions/payment-requests'
import { useRouter } from 'next/navigation'
import { AttachmentList } from '@/components/shared/attachment-list'
import { PaymentRequestForm } from './payment-request-form'
import { PaymentRequestTimeline } from './payment-request-timeline'
import { paymentRequestStore } from '@/lib/payment-request-store'
import { deleteDNTT, deleteDNTTs } from '@/lib/actions/payment-requests'
import { toast } from 'sonner'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { PaymentRequestActions } from './payment-request-actions'

interface PaymentRequest {
    payment_request_id: string
    request_date: string
    payment_reason: string
    supplier_name: string
    total_gross: number | null
    status: string
    payment_method: string
    requester_name: string
    created_at: string
    document_number?: string
    payment_type_code?: string
    payer_type?: string
    supplier_tax_code?: string
    expense_type_name?: string
    expense_group_name?: string
    contract_type_code?: string
    pyc_classification?: string
    notes?: string
    approved_history?: any
    requester?: {
        full_name: string
        avatar_url: string
    }
    approver?: {
        full_name: string
        avatar_url: string
    }
}

interface PaymentRequestListProps {
    initialData: PaymentRequest[]
    totalCount: number
    projectId?: string
    externalSearchTerm?: string
    isFormOpen?: boolean
    onFormOpenChange?: (open: boolean) => void
}

export function PaymentRequestList({
    initialData,
    totalCount: initialTotalCount,
    projectId,
    externalSearchTerm,
    isFormOpen: externalFormOpen,
    onFormOpenChange
}: PaymentRequestListProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [requests, setRequests] = useState<any[]>(paymentRequestStore.getCachedRequests())
    const [isLoadingData, setIsLoadingData] = useState(paymentRequestStore.getIsLoading())
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const [attachmentDNTT, setAttachmentDNTT] = useState<PaymentRequest | null>(null)
    const [viewDetail, setViewDetail] = useState<PaymentRequest | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isDeleting, setIsDeleting] = useState(false)
    const [idToDelete, setIdToDelete] = useState<string | null>(null)
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)

    // Internal state if props not provided, but we prefer props
    const effectiveIsFormOpen = externalFormOpen !== undefined ? externalFormOpen : isFormOpen
    const setEffectiveIsFormOpen = (open: boolean) => {
        setIsFormOpen(open)
        onFormOpenChange?.(open)
    }

    // Subscribe to payment request store
    useEffect(() => {
        if (requests.length === 0) {
            setIsLoadingData(true)
            paymentRequestStore.getRequests(projectId).then(data => {
                setRequests(data)
                setIsLoadingData(false)
            })
        }

        const unsubscribe = paymentRequestStore.subscribe((data) => {
            setRequests(data)
            setIsLoadingData(paymentRequestStore.getIsLoading())
        })
        return unsubscribe
    }, [projectId])

    const handleRefresh = async () => {
        startTransition(async () => {
            try {
                await paymentRequestStore.refresh(projectId)
            } catch (error) {
                console.error('Error refreshing payment requests:', error)
            }
        })
    }

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true)
            await deleteDNTT(id)
            toast.success("Đã xóa đề nghị thanh toán")
            paymentRequestStore.refresh(projectId)
            setIdToDelete(null)
        } catch (error) {
            toast.error("Lỗi khi xóa đề nghị thanh toán")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return
        try {
            setIsBulkDeleting(true)
            await deleteDNTTs(selectedIds)
            toast.success(`Đã xóa ${selectedIds.length} đề nghị thanh toán`)
            paymentRequestStore.refresh(projectId)
            setSelectedIds([])
        } catch (error) {
            toast.error("Lỗi khi xóa nhiều đề nghị thanh toán")
        } finally {
            setIsBulkDeleting(false)
        }
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedRequests.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(paginatedRequests.map(r => r.payment_request_id))
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    // Purely client-side filtering
    const filteredRequests = requests.filter(item => {
        const search = (externalSearchTerm !== undefined ? externalSearchTerm : searchTerm).toLowerCase()
        if (!search) return true
        return (
            item.payment_request_id.toLowerCase().includes(search) ||
            item.payment_reason?.toLowerCase().includes(search) ||
            item.supplier_name?.toLowerCase().includes(search)
        )
    })

    const totalCount = filteredRequests.length
    const totalPages = Math.ceil(totalCount / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, externalSearchTerm])

    return (
        <div className="space-y-4 relative font-inter">
            {isPending && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {externalSearchTerm === undefined && (
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center px-1">
                    <div className="flex flex-wrap items-center gap-2 flex-grow">
                        <div className="relative w-full md:w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Tìm kiếm đề nghị..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-10 bg-card/50 border-border/50 rounded-xl focus:ring-primary/20 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {selectedIds.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setIsBulkDeleting(true)}
                                className="rounded-xl h-10 px-4"
                                disabled={isPending || isLoadingData}
                            >
                                <Plus className="h-4 w-4 mr-2 rotate-45" />
                                Xóa {selectedIds.length} mục
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isPending || isLoadingData}
                            className="h-10 w-10 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
                            title="Làm mới dữ liệu (Xóa cache)"
                        >
                            <RotateCw className={cn("h-4 w-4", (isPending || isLoadingData) && "animate-spin")} />
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-4 h-11"
                            onClick={() => setEffectiveIsFormOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo đề nghị
                        </Button>
                    </div>
                </div>
            )}

            <div className="border border-border/50 rounded-xl overflow-hidden bg-card/40 backdrop-blur-xl shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50 bg-muted/20">
                            <TableHead className="w-[40px] text-center">
                                <Checkbox
                                    checked={paginatedRequests.length > 0 && selectedIds.length === paginatedRequests.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="w-[50px] text-center text-xs font-medium">STT</TableHead>
                            <TableHead className="w-[150px] text-xs font-medium">Mã ĐNTT</TableHead>
                            <TableHead className="w-[100px] text-xs font-medium uppercase tracking-tight">Số hiệu</TableHead>
                            <TableHead className="w-[100px] text-xs font-medium">Ngày</TableHead>
                            <TableHead className="text-xs font-medium">Nội dung thanh toán</TableHead>
                            <TableHead className="text-right text-xs font-medium">Số tiền (Tổng)</TableHead>
                            <TableHead className="w-[100px] text-xs font-medium">Hình thức</TableHead>
                            <TableHead className="text-xs font-medium">Người đề nghị</TableHead>
                            <TableHead className="text-xs font-medium">Người duyệt</TableHead>
                            <TableHead className="w-[100px] text-right text-xs font-medium">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <FileText className="h-8 w-8 opacity-20" />
                                        <p>{isLoadingData ? "Đang tải dữ liệu..." : "Chưa có dữ liệu đề nghị thanh toán."}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedRequests.map((item, index) => (
                                <TableRow key={item.payment_request_id} className="group hover:bg-foreground/[0.02] transition-colors border-border/50">
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={selectedIds.includes(item.payment_request_id)}
                                            onCheckedChange={() => toggleSelect(item.payment_request_id)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center text-xs text-muted-foreground">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs font-semibold text-primary uppercase tracking-tight">
                                        {item.payment_request_id}
                                    </TableCell>
                                    <TableCell className="text-xs font-medium text-slate-600">
                                        {item.document_number || '-'}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {item.request_date ? new Date(item.request_date).toLocaleDateString('vi-VN') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-[13px] text-slate-900 group-hover:text-primary transition-colors cursor-pointer" onClick={() => setViewDetail(item)}>
                                            {item.payment_reason || '-'}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{item.supplier_name || 'Không xác định'}</span>
                                            {item.pyc_classification && <span className="text-[10px] bg-primary/5 text-primary px-1.5 py-0.5 rounded font-medium">{item.pyc_classification}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-[13px] font-semibold text-slate-700">
                                        {item.total_gross ? new Intl.NumberFormat('vi-VN').format(Number(item.total_gross)) : '-'}
                                    </TableCell>
                                    <TableCell className="text-center font-medium text-xs text-slate-500 whitespace-nowrap">
                                        {item.payment_method || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7 border border-slate-100">
                                                <AvatarImage src={item.requester?.avatar_url} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-[9px] font-bold">
                                                    {item.requester_name?.substring(0, 2).toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-medium text-slate-700 leading-none mb-0.5">{item.requester?.full_name || item.requester_name?.split('@')[0]}</span>
                                                <span className="text-[9px] text-slate-400">Người lập</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7 border border-slate-100">
                                                <AvatarImage src={item.approver?.avatar_url} />
                                                <AvatarFallback className="bg-slate-50 text-slate-400 text-[9px] font-bold">
                                                    {item.approved_by?.substring(0, 2).toUpperCase() || 'S'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-medium text-slate-700 leading-none mb-0.5">{item.approver?.full_name || item.approved_by || 'Chờ duyệt'}</span>
                                                <span className="text-[9px] text-slate-400">Người duyệt</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                                onClick={() => setViewDetail(item)}
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                                onClick={() => setAttachmentDNTT(item)}
                                                title="Đính kèm tài liệu"
                                            >
                                                <Paperclip className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                                onClick={() => setIdToDelete(item.payment_request_id)}
                                                title="Xóa đề nghị"
                                            >
                                                <Plus className="h-4 w-4 rotate-45" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isPending}
                        className="h-9 rounded-lg"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-xs font-medium px-4">
                        Trang {currentPage} / {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isPending}
                        className="h-9 rounded-lg"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {/* Attachment Dialog */}
            <Dialog open={!!attachmentDNTT} onOpenChange={(open) => !open && setAttachmentDNTT(null)}>
                <DialogContent className="sm:max-w-[550px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <div className="p-8 pb-4">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                                <Paperclip className="h-5 w-5 text-primary" />
                                Đính kèm: {attachmentDNTT?.payment_request_id}
                            </DialogTitle>
                            <DialogDescription className="text-[13px] text-slate-500">
                                {attachmentDNTT?.payment_reason}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="px-8 pb-8 pt-4">
                        {attachmentDNTT && (
                            <AttachmentList
                                tableName="payment_requests"
                                refId={attachmentDNTT.payment_request_id}
                                title="Danh sách tài liệu đính kèm"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Detail View Dialog */}
            <Dialog open={!!viewDetail} onOpenChange={(open) => !open && setViewDetail(null)}>
                <DialogContent className="sm:max-w-[700px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl font-sans">
                    {viewDetail && (
                        <>
                            <DialogHeader className="p-8 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-mono text-[10px] uppercase font-black tracking-widest px-2 py-0.5">
                                        {viewDetail.payment_request_id}
                                    </Badge>
                                    <Badge variant="outline" className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 border-none rounded-full",
                                        viewDetail.status === 'Đã duyệt' ? "bg-emerald-50 text-emerald-600" :
                                            viewDetail.status === 'Từ chối' ? "bg-rose-50 text-rose-600" :
                                                "bg-amber-50 text-amber-600"
                                    )}>
                                        {viewDetail.status || 'Chờ duyệt'}
                                    </Badge>
                                </div>
                                <DialogTitle className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                                    {viewDetail.payment_reason}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 text-sm mt-2 flex items-center gap-4">
                                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(viewDetail.request_date).toLocaleDateString('vi-VN')}</span>
                                    <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {viewDetail.requester_name}</span>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="p-8 grid grid-cols-5 gap-8 bg-white dark:bg-slate-950">
                                <div className="col-span-3 space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <Info className="h-3.5 w-3.5" /> Thông tin thanh toán
                                        </h4>
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-400 font-medium">Nhà cung cấp</p>
                                                <p className="text-[13px] font-bold text-slate-700">{viewDetail.supplier_name || '-'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-400 font-medium">Hình thức</p>
                                                <p className="text-[13px] font-bold text-slate-700">{viewDetail.payment_method || '-'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-400 font-medium">Ghi chú</p>
                                                <p className="text-[13px] font-medium text-slate-500 italic">{viewDetail.notes || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cần thanh toán</p>
                                                <p className="text-[10px] text-slate-400 italic">Tổng giá trị cuối cùng</p>
                                            </div>
                                            <p className="text-3xl font-black text-primary tracking-tighter">
                                                {new Intl.NumberFormat('vi-VN').format(Number(viewDetail.total_gross || 0))}
                                                <span className="text-[14px] ml-1 font-medium opacity-60">VNĐ</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 space-y-6">
                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <TrendingUp className="h-3.5 w-3.5" /> Tiến độ phê duyệt
                                    </h4>
                                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        <PaymentRequestTimeline
                                            items={(() => {
                                                let history = []
                                                try {
                                                    history = typeof viewDetail.approved_history === 'string'
                                                        ? JSON.parse(viewDetail.approved_history)
                                                        : (viewDetail.approved_history || [])
                                                } catch (e) {
                                                    history = []
                                                }

                                                if (history.length === 0) {
                                                    return [{
                                                        status: 'Chờ duyệt',
                                                        title: 'Yêu cầu đang chờ phê duyệt',
                                                        date: new Date(viewDetail.created_at).toLocaleString('vi-VN'),
                                                        user: viewDetail.requester_name,
                                                        message: 'Hệ thống tự động khởi tạo',
                                                        isCompleted: false,
                                                        isLast: true
                                                    }]
                                                }

                                                return history.map((h: any, i: number) => ({
                                                    status: h.status,
                                                    title: h.status,
                                                    date: new Date(h.at).toLocaleString('vi-VN'),
                                                    user: h.user,
                                                    message: h.message,
                                                    isCompleted: true,
                                                    isLast: i === history.length - 1
                                                }))
                                            })()}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <PaymentRequestForm
                open={effectiveIsFormOpen}
                onOpenChange={setEffectiveIsFormOpen}
                projectId={projectId}
                onSuccess={() => {
                    paymentRequestStore.refresh(projectId)
                }}
            />

            {/* Delete Single Alert */}
            <AlertDialog open={!!idToDelete} onOpenChange={(open: boolean) => !open && setIdToDelete(null)}>
                <AlertDialogContent className="rounded-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa đề nghị thanh toán <span className="font-bold text-primary">{idToDelete}</span>? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => idToDelete && handleDelete(idToDelete)}
                            className="bg-rose-500 hover:bg-rose-600 rounded-xl"
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Xác nhận xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Alert */}
            <AlertDialog open={isBulkDeleting && selectedIds.length > 0} onOpenChange={(open: boolean) => !open && setIsBulkDeleting(false)}>
                <AlertDialogContent className="rounded-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa nhiều mục?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn đã chọn <span className="font-bold text-primary">{selectedIds.length}</span> đề nghị thanh toán. Bạn có chắc chắn muốn xóa tất cả?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-rose-500 hover:bg-rose-600 rounded-xl"
                            disabled={isBulkDeleting}
                        >
                            {isBulkDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Xác nhận xóa {selectedIds.length} mục
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
