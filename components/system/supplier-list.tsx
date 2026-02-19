'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Truck, Upload, Download } from 'lucide-react'
import { getSuppliers, addSupplier, addSuppliers, updateSupplier, deleteSupplier } from '@/lib/actions/system'
import { toast } from 'sonner'
import { DataManagementTable } from './data-management-table'
import { Badge } from '@/components/ui/badge'
import * as XLSX from 'xlsx'

interface SupplierListProps {
    projectId?: string
    projects?: { project_id: string, project_name: string }[]
}

export function SupplierList({ projectId, projects }: SupplierListProps) {
    const [suppliers, setSuppliers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const data = await getSuppliers(projectId)
            setSuppliers(data || [])
        } catch (error) {
            console.error(error)
            toast.error("Không thể tải danh sách nhà cung cấp")
        } finally {
            setLoading(false)
        }
    }, [projectId])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleAdd = async (formData: any) => {
        try {
            const dataToSave = {
                ...formData,
                project_id: projectId || formData.project_id || null,
                id: formData.id || `NCC${Date.now().toString().slice(-6)}`
            }
            await addSupplier(dataToSave)
            toast.success("Thêm nhà cung cấp thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi thêm nhà cung cấp")
            throw error
        }
    }

    const handleEdit = async (id: string, formData: any) => {
        try {
            await updateSupplier(id, formData)
            toast.success("Cập nhật nhà cung cấp thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi cập nhật nhà cung cấp")
            throw error
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteSupplier(id, projectId)
            toast.success("Xóa nhà cung cấp thành công")
            loadData()
        } catch (error) {
            toast.error("Lỗi khi xóa nhà cung cấp")
            throw error
        }
    }

    const handleExportExcel = () => {
        try {
            const data = suppliers.map((s, index) => ({
                'STT': index + 1,
                'Mã NCC': s.id,
                'Tên nhà cung cấp': s.supplier_name,
                'Mã số thuế': s.tax_code,
                'Phân loại': s.supplier_group,
                'Nhóm mặt hàng': s.commodity_group,
                'Khu vực': s.supply_region,
                'Người liên hệ': s.contact_person,
                'Số điện thoại': s.phone_number,
                'Địa chỉ': s.address,
                'Dự án': s.project_id || 'Dùng chung'
            }))

            const ws = XLSX.utils.json_to_sheet(data)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, "Danh_sach_NCC")
            XLSX.writeFile(wb, "Danh_sach_NCC.xlsx")
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

                const loadingToast = toast.loading(`Đang nhập ${data.length} nhà cung cấp...`)

                // Map header to database fields
                // Column mapping:
                // Tên nhà cung cấp -> supplier_name
                // Mã số thuế -> tax_code
                // Phân loại -> supplier_group
                // Nhóm mặt hàng -> commodity_group
                // Khu vực -> supply_region
                // Người liên hệ -> contact_person
                // Số điện thoại -> phone_number
                // Địa chỉ -> address
                // Mã NCC -> id

                const seenIds = new Set()
                const seenTaxCodes = new Set()
                const suppliersToInsert: any[] = []

                for (let i = data.length - 1; i >= 0; i--) {
                    const row = data[i]
                    const supplierName = (row['Tên nhà cung cấp'] || row['Tên NCC'] || row['Supplier Name'])?.toString().trim()
                    if (!supplierName) continue

                    const id = (row['Mã NCC'] || row['Mã'] || `NCC${Math.random().toString(36).substring(2, 8).toUpperCase()}`).toString().trim()
                    const rawTaxCode = (row['Mã số thuế'] || row['MST'])?.toString().trim()
                    const taxCode = (rawTaxCode === '' || !rawTaxCode) ? null : rawTaxCode

                    const excelProj = row['Dự án'] || row['Mã dự án']
                    const finalProjId = (excelProj === 'Dùng chung' || !excelProj) ? (projectId || null) : excelProj

                    // Basic deduplication in current batch
                    if (seenIds.has(id)) continue
                    if (taxCode && seenTaxCodes.has(taxCode)) continue

                    seenIds.add(id)
                    if (taxCode) seenTaxCodes.add(taxCode)

                    suppliersToInsert.unshift({
                        id,
                        supplier_name: supplierName,
                        tax_code: taxCode,
                        supplier_group: (row['Phân loại'] || row['Nhóm'])?.toString().trim() || null,
                        commodity_group: (row['Nhóm mặt hàng'] || row['Mặt hàng'])?.toString().trim() || null,
                        supply_region: (row['Khu vực'])?.toString().trim() || null,
                        contact_person: (row['Người liên hệ'])?.toString().trim() || null,
                        phone_number: (row['Số điện thoại'] || row['SĐT'])?.toString().trim() || null,
                        address: (row['Địa chỉ'])?.toString().trim() || null,
                        project_id: finalProjId,
                        created_at: new Date().toISOString()
                    })
                }

                if (suppliersToInsert.length === 0) {
                    toast.dismiss(loadingToast)
                    toast.error("Không tìm thấy dữ liệu nhà cung cấp hợp lệ (Thiếu cột Tên nhà cung cấp)")
                    return
                }

                const { addSuppliers } = await import('@/lib/actions/system')
                await addSuppliers(suppliersToInsert)

                toast.dismiss(loadingToast)
                toast.success(`Đã nhập thành công ${suppliersToInsert.length} nhà cung cấp`)
                loadData()
            } catch (error: any) {
                console.error("Import error detail:", error)
                toast.dismiss()
                const msg = error.message || ""
                if (msg.includes("23505")) {
                    toast.error("Lỗi: Trùng mã số thuế hoặc mã nhà cung cấp đã tồn tại trong hệ thống.")
                } else {
                    toast.error("Lỗi khi xử lý file Excel hoặc lưu dữ liệu")
                }
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        }
        reader.readAsBinaryString(file)
    }

    const fields = useMemo(() => {
        const baseFields = [
            { id: 'id', label: 'Mã NCC (để trống để tự sinh)', placeholder: 'VD: NCC-001...' },
            { id: 'supplier_name', label: 'Tên nhà cung cấp *', required: true, placeholder: 'Tên đầy đủ của công ty/hộ kinh doanh...' },
            { id: 'tax_code', label: 'Mã số thuế', placeholder: 'Mã số thuế doanh nghiệp...' },
            { id: 'supplier_group', label: 'Phân loại', placeholder: 'VD: Vật tư, Nhân công, Máy móc...' },
            { id: 'commodity_group', label: 'Nhóm mặt hàng cung cấp', placeholder: 'VD: Thép, Xi măng, Thiết thiết bị điện...' },
            { id: 'supply_region', label: 'Khu vực cung cấp', placeholder: 'VD: Miền Bắc, Toàn quốc...' },
            { id: 'contact_person', label: 'Người liên hệ', placeholder: 'Họ tên người đại diện...' },
            { id: 'phone_number', label: 'Số điện thoại', placeholder: 'Số liên lạc...' },
            { id: 'address', label: 'Địa chỉ', placeholder: 'Địa chỉ trụ sở/kho...' },
        ]

        if (!projectId && projects) {
            return [
                ...baseFields,
                {
                    id: 'project_id',
                    label: 'Dự án (tùy chọn)',
                    type: 'select',
                    options: [
                        { value: '', label: 'Dùng chung (Toàn hệ thống)' },
                        ...projects.map(p => ({ value: p.project_id, label: p.project_name }))
                    ]
                }
            ]
        }
        return baseFields
    }, [projectId, projects])

    const filters = useMemo(() => {
        const base = [
            { id: 'supply_region', label: 'Khu vực', options: Array.from(new Set(suppliers.map(s => s.supply_region).filter(Boolean))).map(v => ({ label: v, value: v })) },
            { id: 'supplier_group', label: 'Phân loại', options: Array.from(new Set(suppliers.map(s => s.supplier_group).filter(Boolean))).map(v => ({ label: v, value: v })) },
            { id: 'commodity_group', label: 'Mặt hàng', options: Array.from(new Set(suppliers.map(s => s.commodity_group).filter(Boolean))).map(v => ({ label: v, value: v })) },
        ]
        if (!projectId && projects) {
            return [
                { id: 'project_id', label: 'Dự án', options: projects.map(p => ({ label: p.project_name, value: p.project_id })) },
                ...base
            ]
        }
        return base
    }, [projectId, projects, suppliers])

    const columns = useMemo(() => {
        const cols = [
            { header: 'Mã NCC', key: 'id', width: '120px' },
            {
                header: 'Tên nhà cung cấp',
                key: 'supplier_name',
                render: (val: string, item: any) => (
                    <div className="flex flex-col py-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{val}</span>
                        <div className="flex flex-col gap-0.5 mt-1">
                            {item.tax_code && (
                                <span className="text-[11px] text-slate-500 font-mono">MST: {item.tax_code}</span>
                            )}
                            {item.address && (
                                <span className="text-[11px] text-slate-400 italic line-clamp-1">{item.address}</span>
                            )}
                        </div>
                    </div>
                )
            },
            {
                header: 'Mặt hàng',
                key: 'commodity_group',
                render: (val: string) => <span className="text-[12px] font-medium text-slate-600">{val || "-"}</span>
            },
            { header: 'Khu vực', key: 'supply_region' },
            { header: 'Phân loại', key: 'supplier_group' },
            {
                header: 'Số điện thoại',
                key: 'phone_number',
                render: (val: string) => <span className="font-mono text-[12px]">{val || "-"}</span>
            },
        ]

        if (!projectId) {
            cols.splice(2, 0, {
                header: 'Dự án',
                key: 'project_id',
                render: (val: string) => {
                    const project = projects?.find(p => p.project_id === val)
                    return val ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-medium text-[11px]">
                            {project?.project_name || val}
                        </Badge>
                    ) : (
                        <span className="text-[11px] text-slate-400 italic">Dùng chung</span>
                    )
                }
            })
        }

        return cols
    }, [projectId, projects])

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
                title={projectId ? "Nhà cung cấp Dự án" : "Quản lý Nhà cung cấp"}
                subtitle={projectId ? "Danh sách các đơn vị cung cấp cho dự án này." : "Danh mục đối tác và nhà cung cấp vật tư/dịch vụ."}
                icon={Truck}
                columns={columns}
                data={suppliers}
                loading={loading}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                fields={fields}
                filters={filters}
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
                defaultValues={{}}
                searchKey="supplier_name"
            />
        </>
    )
}
