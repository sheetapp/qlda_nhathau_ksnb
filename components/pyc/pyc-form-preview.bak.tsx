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
        created_at?: string
        details: any[]
    }
}

export const PYCFormPreview = React.forwardRef<HTMLDivElement, PYCFormPreviewProps>(({ data }, ref) => {
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

    const totalQty = data.details.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

    return (
        <div ref={ref} className="bg-white p-[1cm] w-full max-w-[29.7cm] mx-auto text-black font-['Inter',sans-serif] print:p-0 print:shadow-none min-h-[21cm] flex flex-col relative overflow-hidden">
            {/* Part 1: Header */}
            <div className="flex justify-between items-start mb-6 gap-6">
                <div className="w-[180px] flex flex-col shrink-0">
                    <div className="w-40 h-16 bg-slate-50 border border-slate-200 rounded flex items-center justify-center mb-2">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Logo Công Ty</span>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center text-center mt-2">
                    <h1 className="text-2xl font-black uppercase mb-2 tracking-wide leading-tight">PHIẾU YÊU CẦU MUA VẬT TƯ</h1>
                    <div className="space-y-1 text-[13px] text-slate-800">
                        <p className="font-bold uppercase tracking-tight">{data.project_name} ({data.project_code})</p>
                        <p className="font-medium italic">Sử dụng cho: {data.details[0]?.muc_dich_sd || 'Công trình'}</p>
                    </div>
                </div>

                <div className="w-[220px] shrink-0 text-right bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <div className="space-y-1.5 text-[12px]">
                        <p className="flex justify-between">
                            <span className="text-slate-500">Số phiếu:</span>
                            <span className="font-bold text-[13px]">{data.request_id}</span>
                        </p>
                        <p className="flex justify-between border-t border-slate-200/50 pt-1.5">
                            <span className="text-slate-500">Ngày in phiếu:</span>
                            <span className="font-medium">{printDate}</span>
                        </p>
                        <p className="flex justify-between border-t border-slate-200/50 pt-1.5">
                            <span className="text-slate-500">Phòng ban:</span>
                            <span className="font-bold uppercase text-primary/80">{data.department || 'DỰ ÁN'}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Part 2: Request Content */}
            <div className="flex-1 mb-8 overflow-hidden">
                <Table className="border-collapse border-[1.5px] border-black w-full mb-0 table-fixed">
                    <TableHeader>
                        <TableRow className="border-b-[1.5px] border-black bg-slate-50/90 h-10">
                            <TableHead className="border-r border-black w-[40px] text-center font-bold text-black uppercase text-[10px] p-2 leading-tight">STT</TableHead>
                            <TableHead className="border-r border-black w-[80px] text-center font-bold text-black uppercase text-[10px] p-2 leading-tight">MSP</TableHead>
                            <TableHead className="border-r border-black w-[180px] text-left font-bold text-black uppercase text-[10px] p-2 leading-tight">Tên SP / Quy cách</TableHead>
                            <TableHead className="border-r border-black w-[45px] text-center font-bold text-black uppercase text-[10px] p-2 leading-tight">ĐVT</TableHead>
                            <TableHead className="border-r border-black w-[60px] text-right font-bold text-black uppercase text-[10px] p-2 leading-tight">Số lượng</TableHead>
                            <TableHead className="border-r border-black w-[95px] text-right font-bold text-black uppercase text-[10px] p-2 leading-tight">Đơn giá</TableHead>
                            <TableHead className="border-r border-black w-[110px] text-right font-bold text-black uppercase text-[10px] p-2 leading-tight">Thành tiền</TableHead>
                            <TableHead className="border-r border-black w-[110px] text-left font-bold text-black uppercase text-[10px] p-2 leading-tight">Mục đích SD</TableHead>
                            <TableHead className="border-r border-black w-[100px] text-left font-bold text-black uppercase text-[10px] p-2 leading-tight">Hạng mục</TableHead>
                            <TableHead className="w-[120px] text-left font-bold text-black uppercase text-[10px] p-2 leading-tight">Tên công việc</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.details.map((detail, index) => (
                            <TableRow key={index} className="border-b border-black/80 hover:bg-transparent min-h-[32px]">
                                <TableCell className="border-r border-black/80 text-center text-[10px] p-2 py-2.5 align-middle">{index + 1}</TableCell>
                                <TableCell className="border-r border-black/80 text-center text-[10px] p-2 py-2.5 align-middle font-mono">{detail.material_code || '---'}</TableCell>
                                <TableCell className="border-r border-black/80 text-left p-2 py-2.5 align-middle leading-tight">
                                    <div className="font-bold text-[11px] mb-0.5">{detail.custom_item_name || detail.item_name}</div>
                                    <div className="text-[10px] italic text-slate-700">{detail.notes || ''}</div>
                                </TableCell>
                                <TableCell className="border-r border-black/80 text-center text-[10px] p-2 py-2.5 align-middle">{detail.unit || '---'}</TableCell>
                                <TableCell className="border-r border-black/80 text-right text-[11px] p-2 py-2.5 align-middle font-bold tabular-nums">{formatNumber(detail.quantity)}</TableCell>
                                <TableCell className="border-r border-black/80 text-right text-[11px] p-2 py-2.5 align-middle tabular-nums">{formatNumber(detail.unit_price)}</TableCell>
                                <TableCell className="border-r border-black/80 text-right text-[11px] p-2 py-2.5 align-middle font-black tabular-nums bg-slate-50/30">
                                    {formatNumber(Number(detail.quantity || 0) * Number(detail.unit_price || 0) * (1 + (Number(detail.vat_value || 0) / 100)))}
                                </TableCell>
                                <TableCell className="border-r border-black/80 text-left text-[10px] p-2 py-2.5 align-middle">{detail.muc_dich_sd || '---'}</TableCell>
                                <TableCell className="border-r border-black/80 text-left text-[10px] p-2 py-2.5 align-middle">{detail.category || '---'}</TableCell>
                                <TableCell className="text-left text-[10px] p-2 py-2.5 align-middle leading-tight">{detail.task_description || '---'}</TableCell>
                            </TableRow>
                        ))}
                        {/* Total Row */}
                        <TableRow className="bg-slate-50/90 font-black h-10 border-t-[1.5px] border-black">
                            <TableCell colSpan={4} className="border-r border-black text-right text-[10px] uppercase p-2 align-middle tracking-wider">Tông cộng chi phí dự kiến</TableCell>
                            <TableCell className="border-r border-black text-right text-[11px] p-2 align-middle tabular-nums">{formatNumber(totalQty)}</TableCell>
                            <TableCell className="border-r border-black bg-slate-200/20"></TableCell>
                            <TableCell className="border-r border-black text-right text-[13px] p-2 align-middle tabular-nums bg-slate-200/50">{formatNumber(totalAmount)}</TableCell>
                            <TableCell colSpan={3} className="px-3 text-[10px] italic font-medium align-middle">Bằng chữ: (Chưa bao gồm diễn giải số tiền bằng chữ)</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
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

            {/* Footer: Page Number indicator for print */}
            <div className="page-footer hidden print:block fixed bottom-4 left-0 right-0 text-center text-[10px] text-slate-400">
                <span className="after:content-[counter(page)]">Trang </span>
            </div>

            <style jsx global>{`
                @page {
                    size: landscape;
                    margin: 1cm;
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
                    }
                    .page-footer {
                        display: block !important;
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
            `}</style>
        </div>
    )
})

PYCFormPreview.displayName = 'PYCFormPreview'
