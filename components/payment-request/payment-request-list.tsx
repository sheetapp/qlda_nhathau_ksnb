'use client'

import { useState, useTransition, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Search, FileText, Download, Upload, ChevronLeft, ChevronRight, Loader2, Paperclip } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getPaymentRequests } from '@/lib/actions/payment-requests'
import { useRouter } from 'next/navigation'
import { AttachmentList } from '@/components/shared/attachment-list'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface PaymentRequest {
    payment_request_id: string
    request_date: string
    payment_reason: string | null
    supplier_name: string | null
    total_gross: number | null
    payment_method: string | null
    requester_name: string | null
    status?: string | null
}

interface PaymentRequestListProps {
    initialData: PaymentRequest[]
    totalCount: number
    projectId?: string
    externalSearchTerm?: string
}

export function PaymentRequestList({ initialData, totalCount: initialTotalCount, projectId, externalSearchTerm }: PaymentRequestListProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [data, setData] = useState(initialData)
    const [totalCount, setTotalCount] = useState(initialTotalCount)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const [attachmentDNTT, setAttachmentDNTT] = useState<PaymentRequest | null>(null)

    const fetchPage = async (page: number, size: number, search?: string) => {
        startTransition(async () => {
            try {
                const result = await getPaymentRequests(
                    projectId || null,
                    page,
                    size,
                    search || (externalSearchTerm !== undefined ? externalSearchTerm : searchTerm)
                )
                setData(result.data as any)
                setTotalCount(result.count)
            } catch (error) {
                console.error('Error fetching payment requests:', error)
            }
        })
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1)
            fetchPage(1, itemsPerPage, externalSearchTerm !== undefined ? externalSearchTerm : searchTerm)
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [searchTerm, externalSearchTerm])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        fetchPage(page, itemsPerPage)
    }

    const totalPages = Math.ceil(totalCount / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage

    return (
        <div className="space-y-4 relative">
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
                        <Button variant="outline" size="sm" className="rounded-full w-8 h-8 p-0" title="Xuất Excel">
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full w-8 h-8 p-0" title="Nhập Excel">
                            <Upload className="h-4 w-4" />
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-4 h-11">
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
                            <TableHead className="w-[50px] text-center text-xs font-medium">STT</TableHead>
                            <TableHead className="w-[120px] text-xs font-medium">Mã ĐNTT</TableHead>
                            <TableHead className="w-[100px] text-xs font-medium">Ngày</TableHead>
                            <TableHead className="text-xs font-medium">Nội dung thanh toán</TableHead>
                            <TableHead className="text-right text-xs font-medium">Số tiền (Tổng)</TableHead>
                            <TableHead className="text-xs font-medium">Hình thức</TableHead>
                            <TableHead className="text-xs font-medium">Người đề nghị</TableHead>
                            <TableHead className="w-[80px] text-right text-xs font-medium">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <FileText className="h-8 w-8 opacity-20" />
                                        <p>Chưa có dữ liệu đề nghị thanh toán.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, index) => (
                                <TableRow key={item.payment_request_id} className="group hover:bg-foreground/[0.02] transition-colors border-border/50">
                                    <TableCell className="text-center text-xs text-muted-foreground">{startIndex + index + 1}</TableCell>
                                    <TableCell className="font-mono text-xs font-medium text-primary">{item.payment_request_id}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {item.request_date ? new Date(item.request_date).toLocaleDateString('vi-VN') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">{item.payment_reason || '-'}</p>
                                            <p className="text-[11px] text-muted-foreground">{item.supplier_name || 'Không xác định'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm font-bold text-foreground">
                                        {new Intl.NumberFormat('vi-VN').format(item.total_gross || 0)}
                                    </TableCell>
                                    <TableCell className="text-xs">{item.payment_method || '-'}</TableCell>
                                    <TableCell className="text-xs font-medium text-muted-foreground">{item.requester_name || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg text-primary hover:text-primary hover:bg-primary/5 transition-colors"
                                            onClick={() => setAttachmentDNTT(item)}
                                            title="Đính kèm tài liệu"
                                        >
                                            <Paperclip className="h-4 w-4" />
                                        </Button>
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
        </div>
    )
}
