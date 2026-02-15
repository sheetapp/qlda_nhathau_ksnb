'use client'

import { useState, useEffect } from 'react'
import { FileText, Wallet, ArrowUpToLine, ArrowDownToLine, CheckSquare, Calendar } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { getSystemTemplates, addSystemTemplate, updateSystemTemplate, deleteSystemTemplate, getDepartments } from '@/lib/actions/system'
import { getProjects } from '@/lib/actions/projects'
import { toast } from 'sonner'
import { DataManagementTable } from '@/components/system/data-management-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

const TYPE_CONFIG: Record<string, { title: string, icon: any, label: string }> = {
    'PYC': { title: 'Mẫu phiếu Yêu cầu', icon: FileText, label: 'Yêu cầu (PYC)' },
    'DNTT': { title: 'Mẫu Đề nghị Thanh toán', icon: Wallet, label: 'Thanh toán (DNTT)' },
    'EXPORT': { title: 'Mẫu phiếu Xuất kho', icon: ArrowUpToLine, label: 'Xuất kho' },
    'IMPORT': { title: 'Mẫu phiếu Nhập kho', icon: ArrowDownToLine, label: 'Nhập kho' },
    'CHECKLIST': { title: 'Mẫu biểu Checklist', icon: CheckSquare, label: 'Checklist' },
}

export default function SystemTemplatesPage() {
    const searchParams = useSearchParams()
    const typeFilter = searchParams.get('type')

    const [data, setData] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const config = typeFilter ? TYPE_CONFIG[typeFilter] : { title: 'Mẫu biểu Hệ thống', icon: FileText, label: 'Tất cả' }

    useEffect(() => {
        loadData()
        loadProjects()
        loadDepartments()
    }, [typeFilter])

    async function loadData() {
        try {
            setLoading(true)
            const result = await getSystemTemplates()
            // Lọc chính xác theo type từ URL
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

    async function loadProjects() {
        try {
            const projectList = await getProjects()
            setProjects(projectList || [])
        } catch (error) {
            console.error("Error loading projects:", error)
        }
    }

    async function loadDepartments() {
        try {
            const deptList = await getDepartments()
            setDepartments(deptList || [])
        } catch (error) {
            console.error("Error loading departments:", error)
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

    const handleUpdate = async (id: string, formData: any) => {
        try {
            await updateSystemTemplate(id, formData)
            toast.success("Cập nhật mẫu biểu thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi cập nhật mẫu biểu")
            throw error
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteSystemTemplate(id)
            toast.success("Xóa mẫu biểu thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi xóa mẫu biểu")
        }
    }

    // Lấy danh sách duy nhất các phân loại để làm bộ lọc
    const categories = Array.from(new Set(data.map(item => item.category).filter(Boolean)))
        .map(cat => ({ label: cat, value: cat }))

    return (
        <DataManagementTable
            title={config.title}
            subtitle={`Quản lý danh sách các mẫu biểu chuẩn cho nghiệp vụ ${config.label}.`}
            icon={config.icon}
            columns={[
                { header: 'Mã mẫu', key: 'template_code', width: '100px' },
                { header: 'Tên mẫu biểu', key: 'name' },
                { header: 'Phòng ban ban hành', key: 'issuing_department_id', render: (_, item) => item.issuing_department?.name || '---' },
                {
                    header: 'Trạng thái',
                    key: 'status',
                    width: '120px',
                    render: (val) => (
                        <Badge className={val === 'Hiệu lực' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-emerald-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-50 border-slate-100'}>
                            {val || 'Hiệu lực'}
                        </Badge>
                    )
                },
                {
                    header: 'Thời hạn',
                    key: 'effective_to',
                    width: '180px',
                    render: (_, item) => {
                        if (!item.effective_from && !item.effective_to) return '---'
                        const from = item.effective_from ? format(new Date(item.effective_from), 'dd/MM/yyyy') : '...'
                        const to = item.effective_to ? format(new Date(item.effective_to), 'dd/MM/yyyy') : 'vô thời hạn'
                        return `${from} - ${to}`
                    }
                },
                { header: 'Link file', key: 'file_url', width: '100px', render: (val) => <a href={val} target="_blank" className="text-primary hover:underline">Tải về</a> },
            ]}
            data={data}
            loading={loading}
            onAdd={handleAdd}
            onEdit={handleUpdate}
            onDelete={handleDelete}
            defaultValues={{ type: typeFilter, status: 'Hiệu lực' }}
            filters={[
                {
                    id: 'project_id',
                    label: 'Dự án',
                    options: [
                        { label: 'Tất cả dự án', value: '' },
                        ...projects.map(p => ({ label: p.project_name, value: p.project_id }))
                    ]
                },
                {
                    id: 'category',
                    label: 'Phân loại',
                    options: [
                        { label: 'Tất cả phân loại', value: '' },
                        ...categories
                    ]
                }
            ]}
            fields={[
                { id: 'template_code', label: 'Mã mẫu biểu', placeholder: 'VD: KSNB-PYC-01' },
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
                {
                    id: 'issuing_department_id',
                    label: 'Phòng ban ban hành',
                    type: 'select',
                    options: [
                        { label: 'Chọn phòng ban', value: '' },
                        ...departments.map(d => ({ label: d.name, value: d.id }))
                    ]
                },
                {
                    id: 'status',
                    label: 'Trạng thái',
                    type: 'select',
                    options: [
                        { label: 'Hiệu lực', value: 'Hiệu lực' },
                        { label: 'Hết hiệu lực', value: 'Hết hiệu lực' },
                    ]
                },
                { id: 'effective_from', label: 'Hiệu lực từ ngày', type: 'date' },
                { id: 'effective_to', label: 'Hiệu lực đến ngày', type: 'date' },
                {
                    id: 'project_id',
                    label: 'Dự án áp dụng',
                    type: 'select',
                    options: [
                        { label: 'Tất cả dự án', value: '' },
                        ...projects.map(p => ({ label: p.project_name, value: p.project_id }))
                    ]
                },
                { id: 'category', label: 'Phân loại', placeholder: 'VD: Pháp lý, Thi công...' },
                { id: 'file_url', label: 'Link URL File mẫu', required: true, fullWidth: true, placeholder: 'https://drive.google.com/...' },
                { id: 'description', label: 'Ghi chú', fullWidth: true, placeholder: 'Hướng dẫn sử dụng...' },
            ]}
        />
    )
}
