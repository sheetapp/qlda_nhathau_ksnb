"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export function PaymentRequestList() {
    return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Đề nghị thanh toán (DNTT)
                </CardTitle>
                <CardDescription>
                    Danh sách các đề nghị thanh toán của dự án.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-xl border border-border/50 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-border/50 bg-secondary/20">
                                <TableHead className="w-[120px]">Mã DNTT</TableHead>
                                <TableHead>Nội dung đề nghị</TableHead>
                                <TableHead>Người đề nghị</TableHead>
                                <TableHead>Số tiền</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Ngày tạo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    Tính năng đang được phát triển...
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
