'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Upload, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PaymentRequestActionsProps {
    data: any[]
}

export function PaymentRequestActions({ data }: PaymentRequestActionsProps) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleExportExcel = () => {
        // Placeholder for export logic
        alert('Tính năng Xuất Excel đang được phát triển')
    }

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // Placeholder for import logic
        alert('Tính năng Nhập Excel đang được phát triển')
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={handleExportExcel}
                className="rounded-xl h-9 w-9 bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20"
                title="Xuất Excel"
            >
                <Download className="h-4 w-4" />
            </Button>
            <div className="relative">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl h-9 w-9 bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20"
                    title="Nhập Excel"
                >
                    <Upload className="h-4 w-4" />
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportExcel}
                    className="hidden"
                    accept=".xlsx, .xls"
                />
            </div>

            <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-4 h-9 text-xs"
                onClick={() => alert('Tính năng Tạo đề nghị đang được phát triển')}
            >
                <Plus className="h-4 w-4 mr-2" />
                Tạo đề nghị
            </Button>
        </div>
    )
}
