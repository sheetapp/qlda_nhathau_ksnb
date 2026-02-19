'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Printer, ChevronLeft, Settings2 } from 'lucide-react'
import Link from 'next/link'
import { PYCFormPreview } from './pyc-form-preview'

interface PYCPrintClientProps {
    data: any
}

export function PYCPrintClient({ data }: PYCPrintClientProps) {
    const [margins, setMargins] = useState({
        top: 1.0,
        bottom: 1.0,
        left: 1.0,
        right: 1.0
    })

    const previewRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        window.print()
    }

    const updateMargin = (side: keyof typeof margins, value: string) => {
        const numValue = parseFloat(value) || 0
        setMargins(prev => ({ ...prev, [side]: numValue }))
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 print:bg-white print:p-0 font-sans">
            {/* Control Panel - Hidden when printing */}
            <div className="fixed top-6 right-6 z-50 flex flex-col gap-4 print:hidden w-72">
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-5 rounded-2xl shadow-xl space-y-5">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Settings2 className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-bold text-slate-800 tracking-tight">Cấu hình trang in</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Lề Trên (cm)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                value={margins.top}
                                onChange={(e) => updateMargin('top', e.target.value)}
                                className="h-9 rounded-lg border-slate-200 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Lề Dưới (cm)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                value={margins.bottom}
                                onChange={(e) => updateMargin('bottom', e.target.value)}
                                className="h-9 rounded-lg border-slate-200 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Lề Trái (cm)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                value={margins.left}
                                onChange={(e) => updateMargin('left', e.target.value)}
                                className="h-9 rounded-lg border-slate-200 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Lề Phải (cm)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                value={margins.right}
                                onChange={(e) => updateMargin('right', e.target.value)}
                                className="h-9 rounded-lg border-slate-200 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <Button
                            onClick={handlePrint}
                            className="w-full bg-primary hover:bg-primary/90 text-white gap-2 h-11 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                            <Printer className="h-5 w-5" />
                            In phiếu ngay
                        </Button>
                        <Link href="/dashboard/pyc" className="w-full">
                            <Button variant="outline" className="w-full gap-2 h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
                                <ChevronLeft className="h-4 w-4" />
                                Quay lại danh sách
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Preview Area */}
            <div className="max-w-[29.7cm] mx-auto transition-all duration-300">
                <div className="print-area shadow-2xl print:shadow-none bg-white overflow-hidden rounded-xl print:rounded-none">
                    <PYCFormPreview data={data} margins={margins} ref={previewRef} />
                </div>
            </div>
        </div>
    )
}
