'use client'

import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { getSystemTemplates, addSystemTemplate } from '@/lib/actions/system'
import { toast } from 'sonner'
import { DataManagementTable } from '@/components/system/data-management-table'

export default function SystemTemplatesPage({ searchParams }: { searchParams: { type?: string } }) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const typeFilter = searchParams.type

    useEffect(() => {
        loadData()
    }, [typeFilter])

    async function loadData() {
        try {
            setLoading(true)
            const result = await getSystemTemplates()
            const filtered = typeFilter
                ? result.filter((t: any) => t.type === typeFilter)
                : result
            setData(filtered || [])
        } catch (error) {
            toast.error("Không thể tải danh sách mẫu biểu")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (formData: any) => {
        try {
            await addSystemTemplate(formData)
            toast.success("Thêm mẫu biểu thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi thêm mẫu biểu")
            throw error
        }
    }

    return (
        <DataManagementTable
            title="Mẫu biểu Hệ thống"
            subtitle="Quản lý các biểu mẫu chuẩn cho các nghiệp vụ trong công ty."
            icon={FileText}
            columns={[
                { header: 'Tên mẫu biểu', key: 'name' },
                { header: 'Loại', key: 'type' },
                { header: 'Mô tả', key: 'description' },
                { header: 'Link file', key: 'file_url', render: (val) => <a href={val} target="_blank" className="text-primary hover:underline">Tải về</a> },
            ]}
            data={data}
            loading={loading}
            onAdd={handleAdd}
            fields={[
                { id: 'name', label: 'Tên mẫu biểu', required: true, placeholder: 'VD: Mẫu phiếu yêu cầu mua vật tư...' },
                {
                    id: 'type',
                    label: 'Loại nghiệp vụ',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'Yêu cầu (PYC)', value: 'PYC' },
                        { label: 'Thanh toán (DNTT)', value: 'DNTT' },
                        { label: 'Xuất kho', value: 'EXPORT' },
                        { label: 'Nhập kho', value: 'IMPORT' },
                        { label: 'Checklist', value: 'CHECKLIST' },
                    ]
                },
                { id: 'file_url', label: 'Link URL File mẫu', required: true, placeholder: 'https://drive.google.com/...' },
                { id: 'description', label: 'Ghi chú', placeholder: 'Hướng dẫn sử dụng...' },
            ]}
        />
    )
}
