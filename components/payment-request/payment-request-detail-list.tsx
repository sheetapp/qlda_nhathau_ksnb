'use client'

import { useState, useTransition, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { FileText, FolderKanban, ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPaymentRequests } from '@/lib/actions/payment-requests'

interface PaymentRequestDetail {
    payment_request_id: string
    request_date: string
    payment_reason: string | null
    supplier_name: string | null
    quantity: number | null
    unit_price_gross: number | null
    total_gross: number | null
    payment_method: string | null
}

interface PaymentRequestDetailListProps {
    initialData: PaymentRequestDetail[]
    projectId?: string
    externalSearchTerm?: string
}

export function PaymentRequestDetailList({ initialData, projectId, externalSearchTerm = '' }: PaymentRequestDetailListProps) {
    const [isPending, startTransition] = useTransition()
    const [data, setData] = useState(initialData)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0) // Will be updated on fetch
    const itemsPerPage = 20

    const fetchPage = async (page: number, search: string) => {
        startTransition(async () => {
            try {
                const result = await getPaymentRequests(
                    projectId || null,
                    page,
                    itemsPerPage,
                    search
                )
                setData(result.data as any)
                setTotalCount(result.count)
            } catch (error) {
                console.error('Error fetching payment request details:', error)
            }
        })
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1)
            fetchPage(1, externalSearchTerm)
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [externalSearchTerm])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        fetchPage(page, externalSearchTerm)
    }

    const totalPages = Math.ceil(totalCount / itemsPerPage)

    return (
        <div className="space-y-4 relative">
            {isPending && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            <div className="border border-border/50 rounded-xl overflow-hidden bg-card/40 backdrop-blur-xl shadow-sm font-sans">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50 bg-muted/20">
                            <TableHead className="w-[50px] text-center text-[12px] text-muted-foreground">STT</TableHead>
                            <TableHead className="w-[120px] text-[12px] text-muted-foreground uppercase">Mã phiếu</TableHead>
                            <TableHead className="text-[12px] text-muted-foreground uppercase">Nội dung chi tiết</TableHead>
                            <TableHead className="w-[120px] text-center text-[12px] text-muted-foreground uppercase">Số lượng</TableHead>
                            <TableHead className="w-[150px] text-right text-[12px] text-muted-foreground uppercase">Đơn giá</TableHead>
                            <TableHead className="w-[150px] text-right text-[12px] text-muted-foreground uppercase">Thành tiền</TableHead>
                            <TableHead className="w-[120px] text-center text-[12px] text-muted-foreground uppercase">Ngày</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    Không tìm thấy dữ liệu chi tiết nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, index) => (
                                <TableRow key={item.payment_request_id + index} className="group hover:bg-foreground/[0.02] transition-colors border-border/50">
                                    <TableCell className="text-center text-xs text-muted-foreground">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs font-medium text-primary uppercase">
                                        {item.payment_request_id}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-[13px]">{item.payment_reason || '-'}</div>
                                        <div className="text-[11px] text-muted-foreground">{item.supplier_name || 'Không xác định'}</div>
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-xs">
                                        {item.quantity ? new Intl.NumberFormat('vi-VN').format(Number(item.quantity)) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs">
                                        {item.unit_price_gross ? new Intl.NumberFormat('vi-VN').format(Number(item.unit_price_gross)) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                                        {item.total_gross ? new Intl.NumberFormat('vi-VN').format(Number(item.total_gross)) : '-'}
                                    </TableCell>
                                    <TableCell className="text-center text-xs text-muted-foreground">
                                        {item.request_date ? new Date(item.request_date).toLocaleDateString('vi-VN') : '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 px-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isPending}
                        className="h-8 rounded-lg text-xs"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Trước
                    </Button>
                    <div className="text-[11px] font-medium text-muted-foreground px-2">
                        Trang {currentPage} / {totalPages}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isPending}
                        className="h-8 rounded-lg text-xs"
                    >
                        Sau
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    )
}
