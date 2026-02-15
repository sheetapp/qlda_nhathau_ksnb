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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, FolderKanban, FileText } from 'lucide-react'
import { ArrowUpDown } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface PYCDetail {
    id: string
    request_id: string
    item_name: string
    unit: string | null
    quantity: number | string | null
    unit_price: number | string | null
    line_total: number | string | null
    notes: string | null
    pyc?: {
        request_id: string
        title: string
        project_id: string | null
        projects?: {
            project_name: string
        } | null
    } | null
}

interface PYCDetailListProps {
    initialDetails: PYCDetail[]
    projects: { project_id: string; project_name: string }[]
    externalFilters?: {
        searchTerm: string
        projectFilter: string
    }
}

type SortKey = keyof PYCDetail | 'project_name' | 'request_title' | 'request_id_display';

export function PYCDetailList({ initialDetails, projects, externalFilters }: PYCDetailListProps) {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null)

    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const filteredDetails = initialDetails.filter((item) => {
        const currentSearchTerm = externalFilters?.searchTerm ?? ''
        const currentProjectFilter = externalFilters?.projectFilter ?? 'all'

        const matchesSearch =
            item.item_name.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            (item.pyc?.request_id.toLowerCase() || '').includes(currentSearchTerm.toLowerCase()) ||
            (item.pyc?.title.toLowerCase() || '').includes(currentSearchTerm.toLowerCase()) ||
            (item.pyc?.projects?.project_name.toLowerCase() || '').includes(currentSearchTerm.toLowerCase())

        const matchesProject = currentProjectFilter === 'all' || item.pyc?.project_id === currentProjectFilter

        return matchesSearch && matchesProject
    })

    const sortedDetails = [...filteredDetails].sort((a, b) => {
        if (!sortConfig) return 0

        const { key, direction } = sortConfig
        let aValue: any = a[key as keyof PYCDetail]
        let bValue: any = b[key as keyof PYCDetail]

        if (key === 'project_name') {
            aValue = a.pyc?.projects?.project_name || ''
            bValue = b.pyc?.projects?.project_name || ''
        } else if (key === 'request_title') {
            aValue = a.pyc?.title || ''
            bValue = b.pyc?.title || ''
        } else if (key === 'request_id_display') {
            aValue = a.pyc?.request_id || ''
            bValue = b.pyc?.request_id || ''
        }

        if (aValue === null || aValue === undefined) aValue = ''
        if (bValue === null || bValue === undefined) bValue = ''

        // Handle numeric fields
        if (['quantity', 'unit_price', 'line_total'].includes(key as string)) {
            aValue = Number(aValue)
            bValue = Number(bValue)
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1
        if (aValue > bValue) return direction === 'asc' ? 1 : -1
        return 0
    })


    return (
        <div className="space-y-6">

            <div className="border border-border/50 rounded-xl overflow-hidden bg-card/40 backdrop-blur-xl shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="w-[50px] text-center">STT</TableHead>
                            <TableHead
                                className="w-[100px] cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('request_id_display')}
                            >
                                <div className="flex items-center gap-1">
                                    Mã phiếu
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('project_name')}
                            >
                                <div className="flex items-center gap-1">
                                    Dự án
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('item_name')}
                            >
                                <div className="flex items-center gap-1">
                                    Nội dung chi tiết
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>
                            <TableHead className="text-center">ĐVT</TableHead>
                            <TableHead
                                className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('quantity')}
                            >
                                <div className="flex items-center justify-end gap-1">
                                    KL
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('unit_price')}
                            >
                                <div className="flex items-center justify-end gap-1">
                                    Đơn giá
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSort('line_total')}
                            >
                                <div className="flex items-center justify-end gap-1">
                                    Thành tiền
                                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </TableHead>
                            <TableHead>Ghi chú</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedDetails.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    Không tìm thấy dữ liệu chi tiết nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedDetails.map((item, index) => (
                                <TableRow key={item.id} className="group hover:bg-foreground/[0.02] transition-colors border-border/50">
                                    <TableCell className="text-center text-xs text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-mono text-xs font-medium text-muted-foreground uppercase">{item.pyc?.request_id}</TableCell>
                                    <TableCell>
                                        {item.pyc?.projects?.project_name ? (
                                            <div className="flex items-center gap-2 text-[11px] text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-full w-fit">
                                                <FolderKanban className="h-3 w-3" />
                                                <span className="truncate max-w-[100px]">{item.pyc.projects.project_name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-muted-foreground italic">Dùng chung</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-sm">{item.item_name}</div>
                                        <div className="text-[11px] text-muted-foreground truncate max-w-[200px]" title={item.pyc?.title}>
                                            Phiếu: {item.pyc?.title}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center text-xs">{item.unit || '-'}</TableCell>
                                    <TableCell className="text-right font-mono text-xs">
                                        {item.quantity ? new Intl.NumberFormat('vi-VN').format(Number(item.quantity)) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs">
                                        {item.unit_price ? new Intl.NumberFormat('vi-VN').format(Number(item.unit_price)) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                                        {item.line_total ? new Intl.NumberFormat('vi-VN').format(Number(item.line_total)) : '-'}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]" title={item.notes || ''}>
                                        {item.notes || '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
