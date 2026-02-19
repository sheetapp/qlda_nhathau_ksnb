'use client'

import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface PYCFormPreviewProps {
    data: {
        request_id: string
        title: string
        project_name: string
        project_code: string
        department?: string
        requester_name?: string
        created_at?: string
        details: any[]
    }
    margins?: {
        top: number
        bottom: number
        left: number
        right: number
    }
}

export const PYCFormPreview = React.forwardRef<HTMLDivElement, PYCFormPreviewProps>(({ data, margins }, ref) => {
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '---'
        const date = new Date(dateStr)
        const d = String(date.getDate()).padStart(2, '0')
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const y = date.getFullYear()
        return `${d}/${m}/${y}`
    }

    const formatNumber = (val: number | string | null | undefined) => {
        if (val === null || val === undefined || val === '') return '0'
        return Number(val).toLocaleString('vi-VN')
    }

    const printDate = formatDate(new Date().toISOString())

    const totalAmount = data.details.reduce((sum, item) => {
        const beforeTax = Number(item.quantity || 0) * Number(item.unit_price || 0)
        const vat = 1 + (Number(item.vat_value || 0) / 100)
        return sum + (beforeTax * vat)
    }, 0)

    // Default margins if not provided
    const m = margins || { top: 1.0, bottom: 1.0, left: 1.0, right: 1.0 }

    return (
        <div
            ref={ref}
            className="bg-white mx-auto text-black font-['Inter',sans-serif] print:shadow-none min-h-[21cm] flex flex-col relative overflow-hidden"
            style={{
                paddingTop: `${m.top}cm`,
                paddingBottom: `${m.bottom}cm`,
                paddingLeft: `${m.left}cm`,
                paddingRight: `${m.right}cm`,
                width: '100%',
                maxWidth: '29.7cm'
            }}
        >
            {/* Part 1: Header */}
            <div className="flex justify-between items-start mb-6 gap-6">
                <div className="w-[180px] flex flex-col shrink-0">
                    <div className="w-40 h-16 bg-slate-50 border border-slate-200 rounded flex items-center justify-center mb-2">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Logo Công Ty</span>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center text-center mt-2">
                    <h1 className="text-2xl font-black uppercase mb-1 tracking-wide leading-tight">PHIẾU YÊU CẦU MUA VẬT TƯ</h1>
                    <div className="space-y-0.5 text-[13px] text-slate-800">
                        <p className="font-bold uppercase tracking-tight">{data.project_name} ({data.project_code})</p>
                        <p className="font-bold text-[14px]">Số: {data.request_id}</p>
                        <p className="font-medium italic">Sử dụng cho: {data.details[0]?.muc_dich_sd || 'Công trình'}</p>
                    </div>
                </div>

                <div className="w-[220px] shrink-0 text-right bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <div className="space-y-1.5 text-[12px]">
                        <p className="flex justify-between">
                            <span className="text-slate-500">Ngày in phiếu:</span>
                            <span className="font-medium">{printDate}</span>
                        </p>
                        <p className="flex justify-between border-t border-slate-200/50 pt-1.5">
                            <span className="text-slate-500">Phòng ban:</span>
                            <span className="font-bold uppercase text-primary/80">{data.department || 'DỰ ÁN'}</span>
                        </p>
                        <p className="flex justify-between border-t border-slate-200/50 pt-1.5">
                            <span className="text-slate-500">Người yêu cầu:</span>
                            <span className="font-bold">{data.requester_name}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Part 2: Request Content */}
            <div className="mb-4 overflow-hidden">
                <Table className="border-collapse border-[1.5px] border-black w-full mb-0">
                    <TableHeader>
                        <TableRow className="border-b-[1.5px] border-black bg-slate-50/90 h-10">
                            <TableHead className="border-r border-black w-[40px] text-center font-bold text-black uppercase text-[11px] p-2 leading-tight">STT</TableHead>
                            <TableHead className="border-r border-black w-[80px] text-center font-bold text-black uppercase text-[11px] p-2 leading-tight">MSP</TableHead>
                            <TableHead className="border-r border-black w-[200px] text-left font-bold text-black uppercase text-[11px] p-2 leading-tight">Tên SP / Quy cách</TableHead>
                            <TableHead className="border-r border-black w-[45px] text-center font-bold text-black uppercase text-[11px] p-2 leading-tight">ĐVT</TableHead>
                            <TableHead className="border-r border-black w-[70px] text-right font-bold text-black uppercase text-[11px] p-2 leading-tight">Số lượng</TableHead>
                            <TableHead className="border-r border-black w-[100px] text-right font-bold text-black uppercase text-[11px] p-2 leading-tight">Đơn giá</TableHead>
                            <TableHead className="border-r border-black w-[120px] text-right font-bold text-black uppercase text-[11px] p-2 leading-tight">Thành tiền</TableHead>
                            <TableHead className="border-r border-black w-[120px] text-left font-bold text-black uppercase text-[11px] p-2 leading-tight">Mục đích SD</TableHead>
                            <TableHead className="border-r border-black w-[110px] text-left font-bold text-black uppercase text-[11px] p-2 leading-tight">Hạng mục</TableHead>
                            <TableHead className="text-left font-bold text-black uppercase text-[11px] p-2 leading-tight">Tên công việc</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.details.map((detail, index) => (
                            <TableRow key={index} className="border-b border-black hover:bg-transparent min-h-[32px]">
                                <TableCell className="border-r border-black text-center text-[11px] p-2 py-2.5 align-middle">{index + 1}</TableCell>
                                <TableCell className="border-r border-black text-center text-[11px] p-2 py-2.5 align-middle font-mono">{detail.material_code || '---'}</TableCell>
                                <TableCell className="border-r border-black text-left p-2 py-2.5 align-middle leading-tight whitespace-normal break-words">
                                    <div className="font-bold text-[11px] mb-0.5">{detail.custom_item_name || detail.item_name}</div>
                                    <div className="text-[10px] italic text-slate-700">{detail.notes || ''}</div>
                                </TableCell>
                                <TableCell className="border-r border-black text-center text-[11px] p-2 py-2.5 align-middle">{detail.unit || '---'}</TableCell>
                                <TableCell className="border-r border-black text-right text-[11px] p-2 py-2.5 align-middle font-bold tabular-nums">{formatNumber(detail.quantity)}</TableCell>
                                <TableCell className="border-r border-black text-right text-[11px] p-2 py-2.5 align-middle tabular-nums">{formatNumber(detail.unit_price)}</TableCell>
                                <TableCell className="border-r border-black text-right text-[11px] p-2 py-2.5 align-middle font-black tabular-nums bg-slate-50/30">
                                    {formatNumber(Number(detail.quantity || 0) * Number(detail.unit_price || 0) * (1 + (Number(detail.vat_value || 0) / 100)))}
                                </TableCell>
                                <TableCell className="border-r border-black text-left text-[11px] p-2 py-2.5 align-middle whitespace-normal break-words">
                                    {detail.muc_dich_sd || '---'}
                                </TableCell>
                                <TableCell className="border-r border-black text-left text-[11px] p-2 py-2.5 align-middle whitespace-normal break-words">
                                    {detail.category || '---'}
                                </TableCell>
                                <TableCell className="text-left text-[11px] p-2 py-2.5 align-middle leading-tight whitespace-normal break-words">
                                    {detail.task_description || '---'}
                                </TableCell>
                            </TableRow>
                        ))}
                        {/* Total Row */}
                        <TableRow className="bg-slate-50/90 font-black h-10 border-t-[1.5px] border-black">
                            <TableCell colSpan={4} className="border-r border-black text-right text-[11px] uppercase p-2 align-middle tracking-wider">Tông cộng</TableCell>
                            <TableCell className="border-r border-black text-right text-[11px] p-2 align-middle tabular-nums"></TableCell>
                            <TableCell className="border-r border-black bg-slate-200/20"></TableCell>
                            <TableCell className="border-r border-black text-right text-[12px] p-2 align-middle tabular-nums bg-slate-200/50">{formatNumber(totalAmount)}</TableCell>
                            <TableCell colSpan={3} className="border-l border-black"></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Part 2.5: Bằng chữ Section */}
            <div className="mb-8 py-2">
                <p className="text-[12px] font-medium text-slate-800">
                    <span className="font-bold uppercase mr-2 italic underline underline-offset-4">Bằng chữ:</span>
                    <span className="italic">(Chưa bao gồm diễn giải số tiền bằng chữ)</span>
                </p>
            </div>

            {/* Part 3: Signature Section */}
            <div className="grid grid-cols-4 gap-6 text-center mt-auto pb-10">
                {[
                    { title: 'Phòng ban yêu cầu', dept: data.department || 'DỰ ÁN' },
                    { title: 'Phòng kế toán', dept: 'KẾ TOÁN' },
                    { title: 'Quản lý bộ phận', dept: 'KHỐI KỸ THUẬT' },
                    { title: 'Tổng Giám Đốc', dept: 'BAN GIÁM ĐỐC' }
                ].map((sig, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                        <div className="mb-20 min-h-[40px]">
                            <p className="font-black text-[11px] uppercase tracking-wider mb-1">{sig.title}</p>
                            <p className="text-[9px] text-slate-500 italic">(Ký và ghi rõ họ tên)</p>
                        </div>
                        <div className="w-40 border-b border-black/30 border-dashed mb-1"></div>
                        <p className="font-bold text-[10px] uppercase text-slate-400">{sig.dept}</p>
                    </div>
                ))}
            </div>

            {/* Print Headers & Footers (Corner elements) */}
            <div className="hidden print:block fixed top-2 left-4 text-[9px] text-slate-500 font-medium">
                Dự án: {data.project_name}
            </div>
            <div className="hidden print:block fixed top-2 right-4 text-[9px] text-slate-500 font-medium">
                Số: {data.request_id}
            </div>
            <div className="hidden print:block fixed bottom-2 left-4 text-[9px] text-slate-500 font-medium">
                Phòng ban: {data.department || 'DỰ ÁN'}
            </div>
            <div className="hidden print:block fixed bottom-2 right-4 text-[9px] text-slate-500 font-medium">
                Trang <span className="after:content-[counter(page)]" />
            </div>

            <style jsx global>{`
                @page {
                    size: landscape;
                    margin: ${m.top}cm ${m.right}cm ${m.bottom}cm ${m.left}cm;
                }
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    .print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    
                    /* Custom Corner Elements Positioning */
                    .fixed {
                        visibility: visible !important;
                        position: fixed !important;
                        z-index: 100;
                    }
                }
                
                /* Force background colors in print */
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                /* Consistent Typography */
                .print-area {
                    font-family: 'Inter', sans-serif !important;
                }
                
                /* Ensure table cells wrap content correctly */
                table td, table th {
                    word-wrap: break-word;
                    word-break: break-all; /* Fallback for very long words */
                }
            `}</style>
        </div>
    )
})

PYCFormPreview.displayName = 'PYCFormPreview'
