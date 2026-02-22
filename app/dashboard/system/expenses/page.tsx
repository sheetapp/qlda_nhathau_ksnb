'use client'

import { useState, useEffect, useMemo } from 'react'
import { Wallet, Upload, Download } from 'lucide-react'
import {
    getExpenseCategories,
    addExpenseCategory,
    addExpenseCategories,
    updateExpenseCategory,
    deleteExpenseCategory,
    getDepartments
} from '@/lib/actions/system'
import { getProjects } from '@/lib/actions/projects'
import { DataManagementTable } from '@/components/system/data-management-table'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import * as XLSX from 'xlsx'
import { useRef } from 'react'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function ExpenseManagementPage() {
    const [categories, setCategories] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)

            // Tải từng phần để dễ debug lỗi
            let cats: any[] = []
            let projs: any[] = []
            let depts: any[] = []

            try {
                cats = await getExpenseCategories()
            } catch (e: any) {
                console.error("Error fetching categories:", e)
                toast.error("Lỗi khi tải Danh mục chi phí. Vui lòng kiểm tra đã chạy lệnh SQL chưa.")
            }

            try {
                projs = await getProjects()
            } catch (e) {
                console.error("Error fetching projects:", e)
                toast.error("Lỗi khi tải danh sách Dự án")
            }

            try {
                depts = await getDepartments()
            } catch (e) {
                console.error("Error fetching departments:", e)
                toast.error("Lỗi khi tải danh sách Phòng ban")
            }

            setCategories(cats || [])
            setProjects(projs || [])
            setDepartments(depts || [])
        } catch (error) {
            console.error(error)
            toast.error("Lỗi hệ thống khi tải dữ liệu")
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (formData: any) => {
        const data = {
            ...formData,
            project_id: formData.project_id === 'all' || !formData.project_id ? null : formData.project_id,
            responsible_department_id: formData.responsible_department_id === 'none' || !formData.responsible_department_id ? null : formData.responsible_department_id
        }
        await addExpenseCategory(data)
        toast.success("Thêm mới thành công")
        loadData()
    }

    const handleEdit = async (id: string, formData: any) => {
        const data = {
            ...formData,
            project_id: formData.project_id === 'all' || !formData.project_id ? null : formData.project_id,
            responsible_department_id: formData.responsible_department_id === 'none' || !formData.responsible_department_id ? null : formData.responsible_department_id
        }
        await updateExpenseCategory(id, data)
        toast.success("Cập nhật thành công")
        loadData()
    }

    const handleQuickUpdateDept = async (id: string, currentData: any, newDeptId: string) => {
        try {
            const finalDeptId = newDeptId === 'none' ? null : newDeptId;
            const dataToUpdate = {
                ...currentData,
                responsible_department_id: finalDeptId
            };
            await updateExpenseCategory(id, dataToUpdate);
            toast.success("Đã cập nhật bộ phận phụ trách");
            loadData();
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi cập nhật nhanh");
        }
    }

    const handleDelete = async (id: string) => {
        await deleteExpenseCategory(id)
        toast.success("Đã xóa danh mục")
        loadData()
    }

    const handleExportExcel = () => {
        try {
            const data = categories.map((c, index) => ({
                'STT': index + 1,
                'Tên chi phí': c.type_name,
                'Nhóm chi phí': c.group_name,
                'Phụ trách': c.department?.name || '',
                'Dự án': c.project_id ? (projects.find(p => p.project_id === c.project_id)?.project_name || c.project_id) : 'Tất cả dự án',
                'Mô tả/Ghi chú': c.description || ''
            }))

            const headers = ['STT', 'Tên chi phí', 'Nhóm chi phí', 'Phụ trách', 'Dự án', 'Mô tả/Ghi chú'];
            const ws = XLSX.utils.json_to_sheet(data, { header: headers })
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Danh_muc_chi_phi")
            XLSX.writeFile(wb, "Danh_muc_chi_phi.xlsx")
            toast.success("Xuất file Excel thành công")
        } catch (error) {
            console.error(error)
            toast.error("Lỗi khi xuất file Excel")
        }
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

                if (data.length === 0) {
                    toast.error("File Excel không có dữ liệu")
                    return
                }

                const loadingToast = toast.loading(`Đang nhập ${data.length} danh mục chi phí...`)

                const categoriesToInsert = data.map(row => {
                    const deptName = (row['Phụ trách'] || row['Phòng ban'] || row['Department'])?.toString().trim()
                    const deptId = departments.find((d: any) => d.name === deptName)?.id || null

                    return {
                        type_name: (row['Tên chi phí'] || row['Loại chi phí'] || row['Type Name'])?.toString().trim(),
                        group_name: (row['Nhóm chi phí'] || row['Group Name'])?.toString().trim(),
                        description: (row['Mô tả'] || row['Ghi chú'] || row['Description'] || row['Mô tả/Ghi chú'])?.toString().trim() || null,
                        responsible_department_id: deptId,
                        project_id: null,
                        created_at: new Date().toISOString()
                    }
                }).filter(c => c.type_name && c.group_name)

                if (categoriesToInsert.length === 0) {
                    toast.dismiss(loadingToast)
                    toast.error("Không tìm thấy dữ liệu hợp lệ")
                    return
                }

                await addExpenseCategories(categoriesToInsert)
                toast.dismiss(loadingToast)
                toast.success(`Đã nhập thành công ${categoriesToInsert.length} danh mục chi phí`)
                loadData()
            } catch (error) {
                console.error(error)
                toast.dismiss()
                toast.error("Lỗi khi xử lý file Excel")
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        }
        reader.readAsBinaryString(file)
    }

    const columns = useMemo(() => [
        {
            header: 'STT',
            key: 'index',
            width: '80px',
            render: (_: any, __: any, index: number) => <span className="text-slate-400 font-medium text-[13px]">{index + 1}</span>
        },
        {
            header: 'Tên chi phí',
            key: 'type_name',
            render: (val: string) => <span className="font-semibold text-slate-800 text-[13px]">{val}</span>
        },
        {
            header: 'Nhóm chi phí',
            key: 'group_name',
            render: (val: string) => <span className="text-slate-600 text-[13px]">{val}</span>
        },
        {
            header: 'Phụ trách',
            key: 'responsible_department_id',
            render: (val: string, item: any) => (
                <Select
                    value={val || 'none'}
                    onValueChange={(newValue) => handleQuickUpdateDept(item.id, item, newValue)}
                >
                    <SelectTrigger className="h-8 w-full min-w-[140px] text-[13px] border-transparent hover:border-slate-200 bg-transparent hover:bg-white transition-all shadow-none focus:ring-0 px-2 group">
                        <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none" className="text-[13px]">Không phân bộ phận</SelectItem>
                        {departments.map(d => (
                            <SelectItem key={d.id} value={d.id} className="text-[13px]">{d.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        },
        {
            header: 'Dự án',
            key: 'project_id',
            width: '200px',
            render: (val: string) => {
                const project = projects.find(p => p.project_id === val)
                return val ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-medium text-[11px]">
                        {project?.project_name || val}
                    </Badge>
                ) : (
                    <span className="text-[11px] text-slate-400 italic">Tất cả dự án</span>
                )
            }
        },
        {
            header: 'Mô tả',
            key: 'description',
            render: (val: string) => <span className="text-[12px] text-slate-500 line-clamp-1">{val || "-"}</span>
        },
    ], [projects, departments])

    const fields = useMemo(() => [
        { id: 'type_name', label: 'Tên chi phí *', required: true, placeholder: 'VD: Chi phí vật tư, Chi phí nhân công...' },
        { id: 'group_name', label: 'Nhóm chi phí *', required: true, placeholder: 'VD: Thép xây dựng, Bê tông thương phẩm...' },
        {
            id: 'responsible_department_id',
            label: 'Phụ trách',
            type: 'select',
            options: [
                { value: 'none', label: 'Không phân bộ phận' },
                ...departments.map(d => ({ value: d.id, label: d.name }))
            ]
        },
        {
            id: 'project_id',
            label: 'Dự án',
            type: 'select',
            options: [
                { value: 'all', label: 'Tất cả dự án' },
                ...projects.map(p => ({ value: p.project_id, label: p.project_name }))
            ]
        },
        { id: 'description', label: 'Mô tả', placeholder: 'Nhập mô tả chi tiết nếu có...', fullWidth: true }
    ], [projects, departments])

    const filters = useMemo(() => [
        {
            id: 'project_id',
            label: 'Dự án',
            options: projects.map(p => ({ label: p.project_name, value: p.project_id }))
        },
        {
            id: 'group_name',
            label: 'Nhóm chi phí',
            options: Array.from(new Set(categories.map(c => c.group_name).filter(Boolean)))
                .map(v => ({ label: String(v), value: v }))
        },
        {
            id: 'responsible_department_id',
            label: 'Phụ trách',
            options: departments.map(d => ({ label: d.name, value: d.id }))
        }
    ], [projects, categories, departments])

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportExcel}
                className="hidden"
                accept=".xlsx, .xls"
            />
            <DataManagementTable
                title="Quản lý chi phí"
                subtitle="Cấu hình danh mục loại chi phí và nhóm chi phí hệ thống."
                icon={Wallet}
                columns={columns}
                data={categories}
                loading={loading}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                fields={fields}
                filters={filters}
                searchKey="type_name"
                defaultValues={{ project_id: 'all' }}
                actions={[
                    {
                        label: '',
                        icon: Upload,
                        onClick: () => fileInputRef.current?.click(),
                        variant: "outline",
                        className: "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20 rounded-full px-3 h-8"
                    },
                    {
                        label: '',
                        icon: Download,
                        onClick: () => handleExportExcel(),
                        variant: "outline",
                        className: "bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20 rounded-full px-3 h-8"
                    },
                ]}
            />
        </>
    )
}
