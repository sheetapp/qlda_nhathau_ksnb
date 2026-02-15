'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Upload, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { createPYCs } from '@/lib/actions/pyc'
import { PYCSheet } from './pyc-sheet'

interface PYCActionsProps {
    projects: { project_id: string; project_name: string }[]
    pycs: any[]
}

export function PYCActions({ projects, pycs }: PYCActionsProps) {
    const router = useRouter()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleExportExcel = () => {
        const data = pycs.map((p, index) => ({
            'STT': index + 1,
            'Mã phiếu': p.request_id,
            'Tiêu đề': p.title,
            'Dự án': p.projects?.project_name || 'Dùng chung',
            'Phân loại': p.request_type,
            'Mức độ ưu tiên': p.priority,
            'Trạng thái': p.status,
            'Tổng tiền': p.total_amount,
            'Tạo bởi': p.created_by,
            'Ngày tạo': new Date(p.created_at).toLocaleDateString('vi-VN')
        }))

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Danh_sach_PYC")
        XLSX.writeFile(wb, "Danh_sach_PYC.xlsx")
    }

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws) as any[]

                const pycsToCreate = data.map((row: any) => {
                    if (!row['Mã phiếu'] || !row['Tiêu đề']) {
                        return null
                    }

                    const projectName = row['Dự án']
                    const project = projects.find(p => p.project_name === projectName)

                    return {
                        request_id: String(row['Mã phiếu']),
                        title: String(row['Tiêu đề']),
                        request_type: row['Phân loại'] || null,
                        status: row['Trạng thái'] || 'Chờ duyệt',
                        priority: row['Mức độ ưu tiên'] || 'Thường',
                        project_id: project ? project.project_id : null,
                        total_amount: row['Tổng tiền'] || 0,
                        created_at: null
                    }
                }).filter(r => r !== null)

                if (pycsToCreate.length > 0) {
                    await createPYCs(pycsToCreate)
                    alert(`Đã nhập thành công ${pycsToCreate.length} phiếu yêu cầu!`)
                    router.refresh()
                } else {
                    alert('Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra lại file Excel.')
                }
            } catch (error) {
                console.error('Import error:', error)
                alert('Có lỗi xảy ra khi nhập file Excel.')
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        }
        reader.readAsBinaryString(file)
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleExportExcel}
                    className="rounded-xl h-10 w-10 bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20"
                    title="Xuất Excel"
                >
                    <Download className="h-5 w-5" />
                </Button>
                <div className="relative">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl h-10 w-10 bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20"
                        title="Nhập Excel"
                    >
                        <Upload className="h-5 w-5" />
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
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-4 h-10"
                >
                    <FileText className="h-4 w-4 mr-2" />
                    Tạo phiếu
                </Button>
            </div>

            <PYCSheet
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                pyc={null}
                projects={projects}
                onSuccess={() => router.refresh()}
            />
        </>
    )
}
