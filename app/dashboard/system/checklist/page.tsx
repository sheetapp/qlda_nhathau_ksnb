'use client'

import { useState, useEffect, useRef } from 'react'
import { ClipboardCheck, FileSpreadsheet, Download, Upload } from 'lucide-react'
import {
    getChecklistData,
    addChecklistData,
    updateChecklistData,
    deleteChecklistData,
    addChecklistDataBulk
} from '@/lib/actions/system'
import { toast } from 'sonner'
import { DataManagementTable } from '@/components/system/data-management-table'
import { PAYMENT_METHODS, CHECKLIST_DOCUMENT_TYPES, CHECKLIST_PAYMENT_GROUPS } from '@/lib/constants/checklist'
import * as XLSX from 'xlsx'

export default function ChecklistManagementPage() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)
            const result = await getChecklistData()
            setData(result || [])
        } catch (error) {
            toast.error("Không thể tải danh sách checklist")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (formData: any) => {
        try {
            await addChecklistData(formData)
            toast.success("Thêm checklist thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi thêm checklist")
            throw error
        }
    }

    const handleUpdate = async (id: string, formData: any) => {
        try {
            await updateChecklistData(id, formData)
            toast.success("Cập nhật checklist thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi cập nhật checklist")
            throw error
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteChecklistData(id)
            toast.success("Xóa checklist thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi xóa checklist")
        }
    }

    const handleExport = () => {
        try {
            const exportData = data.map((item, index) => ({
                'STT': index + 1,
                'Mã hồ sơ': item.document_code,
                'Hình thức thanh toán': item.payment_method,
                'Loại hồ sơ': item.document_type,
                'Nhóm thanh toán': item.payment_group,
                'Mã file': item.file_id
            }))

            const ws = XLSX.utils.json_to_sheet(exportData)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Checklist")
            XLSX.writeFile(wb, "Mau_Checklist_KSNB.xlsx")
            toast.success("Xuất file Excel thành công")
        } catch (error) {
            toast.error("Lỗi khi xuất file Excel")
        }
    }

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                const bstr = event.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const result = XLSX.utils.sheet_to_json(ws) as any[]

                const mappedData = result.map(row => ({
                    document_code: row['Mã hồ sơ'] || row['document_code'],
                    payment_method: row['Hình thức thanh toán'] || row['payment_method'],
                    document_type: row['Loại hồ sơ'] || row['document_type'],
                    payment_group: row['Nhóm thanh toán'] || row['payment_group'],
                    file_id: row['Mã file'] || row['file_id']
                })).filter(row => row.document_code)

                if (mappedData.length === 0) {
                    toast.error("Không tìm thấy dữ liệu hợp lệ trong file")
                    return
                }

                await addChecklistDataBulk(mappedData)
                toast.success(`Đã nhập thành công ${mappedData.length} dòng dữ liệu`)
                loadData()
            } catch (error) {
                toast.error("Lỗi khi xử lý file Excel")
                console.error(error)
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        }
        reader.readAsBinaryString(file)
    }

    return (
        <div className="relative">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleImport}
            />

            <DataManagementTable
                title="Quản lý Mẫu Checklist"
                subtitle="Cấu hình danh mục kiểm tra hồ sơ, chứng từ và các điều kiện nghiệm thu/thanh toán."
                icon={ClipboardCheck}
                searchKey="document_code"
                filters={[
                    { id: 'payment_method', label: 'Hình thức TT', options: PAYMENT_METHODS },
                    { id: 'document_type', label: 'Loại hồ sơ', options: CHECKLIST_DOCUMENT_TYPES },
                    { id: 'payment_group', label: 'Nhóm thanh toán', options: CHECKLIST_PAYMENT_GROUPS }
                ]}
                actions={[
                    {
                        label: 'Nhập Excel',
                        icon: Upload,
                        onClick: () => fileInputRef.current?.click(),
                        variant: "outline"
                    },
                    {
                        label: 'Xuất Excel',
                        icon: Download,
                        onClick: handleExport,
                        variant: "outline"
                    }
                ]}
                columns={[
                    {
                        header: 'STT',
                        key: 'id',
                        width: '60px',
                        render: (_, __, index) => <span className="text-slate-500 font-medium">{index + 1}</span>
                    },
                    { header: 'Mã hồ sơ', key: 'document_code', width: '130px' },
                    { header: 'Hình thức thanh toán', key: 'payment_method', width: '200px' },
                    { header: 'Loại hồ sơ', key: 'document_type', width: '250px' },
                    { header: 'Nhóm thanh toán', key: 'payment_group' },
                    { header: 'Mã file', key: 'file_id', width: '100px' },
                ]}
                data={data}
                loading={loading}
                onAdd={handleAdd}
                onEdit={handleUpdate}
                onDelete={handleDelete}
                fields={[
                    { id: 'document_code', label: 'Mã hồ sơ', required: true, placeholder: 'VD: HS-01...' },
                    {
                        id: 'payment_method',
                        label: 'Hình thức thanh toán',
                        type: 'select',
                        options: PAYMENT_METHODS,
                        placeholder: 'Chọn hình thức...'
                    },
                    {
                        id: 'document_type',
                        label: 'Loại hồ sơ',
                        type: 'select',
                        options: CHECKLIST_DOCUMENT_TYPES,
                        placeholder: 'Chọn loại hồ sơ...'
                    },
                    {
                        id: 'payment_group',
                        label: 'Nhóm thanh toán',
                        type: 'select',
                        options: CHECKLIST_PAYMENT_GROUPS,
                        placeholder: 'Chọn nhóm thanh toán...'
                    },
                    { id: 'file_id', label: 'Mã File ID', placeholder: 'VD: FILE-001...' },
                ]}
            />
        </div>
    )
}
