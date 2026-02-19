'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createResource, updateResource } from '@/lib/actions/resources'
import { StandardDialogLayout } from '@/components/ui/dialog-layout'
import { NHOM_TAI_NGUYEN } from '@/Config/thongso'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Resource {
    resource_id: string
    resource_name: string
    group_name: string | null
    unit: string | null
    quantity_in: string | number | null
    quantity_out: string | number | null
    quantity_balance: string | number | null
    unit_price: string | number | null
    status: string | null
    priority: string | null
    notes: string | null
    manager: string | null
    project_id: string | null
    documents?: { name: string; description: string; url: string }[] | null
}

interface ResourceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    resource: Resource | null
    users: { email: string; full_name: string }[]
    projects: { project_id: string; project_name: string }[]
    projectId?: string
    onSuccess: () => void
}

export function ResourceDialog({
    open,
    onOpenChange,
    resource,
    users,
    projects,
    projectId,
    onSuccess,
}: ResourceDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        resource_id: '',
        resource_name: '',
        group_name: '',
        unit: '',
        unit_price: '',
        manager: '',
        status: 'Hoạt động',
        notes: '',
        project_id: '',
        documents: [] as { name: string; description: string; url: string }[]
    })

    // Helper function to format number with thousand separators
    const formatNumber = (value: string | number): string => {
        if (!value) return ''
        const numStr = value.toString().replace(/,/g, '')
        if (isNaN(Number(numStr))) return ''
        return Number(numStr).toLocaleString('vi-VN')
    }

    // Helper function to parse formatted number back to plain number
    const parseFormattedNumber = (value: string): string => {
        return value.replace(/,/g, '')
    }

    useEffect(() => {
        if (resource) {
            setFormData({
                resource_id: resource.resource_id,
                resource_name: resource.resource_name,
                group_name: resource.group_name || '',
                unit: resource.unit || '',
                unit_price: formatNumber(resource.unit_price || ''),
                manager: resource.manager || '',
                status: resource.status || 'Hoạt động',
                notes: resource.notes || '',
                project_id: resource.project_id || '',
                documents: resource.documents || [],
            })
        } else {
            setFormData({
                resource_id: `RES-${Date.now()}`,
                resource_name: '',
                group_name: '',
                unit: '',
                unit_price: '',
                manager: '',
                status: 'Hoạt động',
                notes: '',
                project_id: projectId || '',
                documents: [],
            })
        }
    }, [resource, open, projectId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Parse formatted unit_price back to plain number
            const submitData = {
                ...formData,
                unit_price: parseFormattedNumber(formData.unit_price)
            }



            if (resource) {
                await updateResource(resource.resource_id, submitData)

            } else {
                await createResource(submitData)

            }

            // Try to refresh the resource list

            try {
                await onSuccess()

            } catch (refreshError) {
                console.error('[ResourceDialog] Refresh FAILED:', refreshError)
                alert('Tài nguyên đã được lưu vào database, nhưng có lỗi khi cập nhật danh sách. Vui lòng refresh trang (F5) để thấy dữ liệu mới.')
                // Don't close dialog so user can see the error
                return
            }

            onOpenChange(false)
        } catch (error) {
            console.error('[ResourceDialog] Error saving resource:', error)
            alert(`Có lỗi xảy ra khi lưu tài nguyên: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                <StandardDialogLayout
                    title={resource ? 'Chỉnh sửa tài nguyên' : 'Thêm tài nguyên mới'}
                    onClose={() => onOpenChange(false)}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    isEdit={!!resource}
                >
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="resource_id">Mã tài nguyên</Label>
                                <Input
                                    id="resource_id"
                                    value={formData.resource_id}
                                    readOnly
                                    className="bg-muted font-mono text-xs cursor-not-allowed"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="project_id">Thuộc dự án</Label>
                                <Select
                                    value={formData.project_id || "global"}
                                    onValueChange={(value) => setFormData({ ...formData, project_id: value === "global" ? "" : value })}
                                >
                                    <SelectTrigger id="project_id">
                                        <SelectValue placeholder="Chọn dự án (Mặc định: Dùng chung)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="global">Dùng chung (Toàn hệ thống)</SelectItem>
                                        {projects.map((project) => (
                                            <SelectItem key={project.project_id} value={project.project_id}>
                                                {project.project_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="resource_name">Tên tài nguyên <span className="text-destructive">*</span></Label>
                            <Input
                                id="resource_name"
                                value={formData.resource_name}
                                onChange={(e) => setFormData({ ...formData, resource_name: e.target.value })}
                                required
                                placeholder="Nhập tên tài nguyên hoặc vật tư..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="unit">Đơn vị tính</Label>
                                <Input
                                    id="unit"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    placeholder="Cái, Bộ, m2..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="unit_price">Đơn giá</Label>
                                <Input
                                    id="unit_price"
                                    type="text"
                                    value={formData.unit_price}
                                    onChange={(e) => {
                                        const input = e.target.value
                                        const digitsOnly = input.replace(/[^\d]/g, '')
                                        if (digitsOnly === '') {
                                            setFormData({ ...formData, unit_price: '' })
                                        } else {
                                            const formatted = Number(digitsOnly).toLocaleString('vi-VN')
                                            setFormData({ ...formData, unit_price: formatted })
                                        }
                                    }}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="group_name">Nhóm tài nguyên</Label>
                                <Select
                                    value={formData.group_name}
                                    onValueChange={(value) => setFormData({ ...formData, group_name: value })}
                                >
                                    <SelectTrigger id="group_name">
                                        <SelectValue placeholder="Chọn nhóm tài nguyên" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {NHOM_TAI_NGUYEN.map((group) => (
                                            <SelectItem key={group} value={group}>
                                                {group}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="manager">Người quản lý</Label>
                                <Select
                                    value={formData.manager || ""}
                                    onValueChange={(value) => setFormData({ ...formData, manager: value })}
                                >
                                    <SelectTrigger id="manager">
                                        <SelectValue placeholder="Chọn người quản lý" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.email} value={user.email}>
                                                {user.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Ghi chú</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Thông tin thêm về tài nguyên này..."
                                rows={2}
                            />
                        </div>

                        {/* Documents Section */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-indigo-500" />
                                    Tài liệu liên quan ({formData.documents.length})
                                </Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFormData({
                                        ...formData,
                                        documents: [...formData.documents, { name: '', description: '', url: '' }]
                                    })}
                                    className="h-7 px-2 text-[11px] rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Thêm tài liệu
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {formData.documents.map((doc, idx) => (
                                    <div key={idx} className="p-3 rounded-xl border border-border/40 bg-slate-50 relative group animate-in fade-in slide-in-from-top-1">
                                        <div className="grid grid-cols-1 gap-2">
                                            <Input
                                                placeholder="Tên tài liệu..."
                                                value={doc.name}
                                                onChange={(e) => {
                                                    const newDocs = [...formData.documents]
                                                    newDocs[idx].name = e.target.value
                                                    setFormData({ ...formData, documents: newDocs })
                                                }}
                                                className="h-8 text-[12px] bg-background"
                                            />
                                            <Input
                                                placeholder="Đường dẫn (URL)..."
                                                value={doc.url}
                                                onChange={(e) => {
                                                    const newDocs = [...formData.documents]
                                                    newDocs[idx].url = e.target.value
                                                    setFormData({ ...formData, documents: newDocs })
                                                }}
                                                className="h-8 text-[12px] bg-background"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                const newDocs = formData.documents.filter((_, i) => i !== idx)
                                                setFormData({ ...formData, documents: newDocs })
                                            }}
                                            className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                                {formData.documents.length === 0 && (
                                    <div className="text-center py-4 border border-dashed border-border/60 rounded-xl bg-slate-50/50 text-muted-foreground text-[11px] italic">
                                        Chưa có tài liệu đính kèm.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </StandardDialogLayout>
            </DialogContent>
        </Dialog>
    )
}
