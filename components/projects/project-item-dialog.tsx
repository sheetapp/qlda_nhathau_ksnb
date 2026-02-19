'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectItemDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    isEditMode: boolean
    formData: any
    setFormData: (data: any) => void
    handleSubmit: (e: React.FormEvent) => Promise<void>
    isSubmitting: boolean
    projects: { project_id: string, project_name: string }[]
    users: { email: string, full_name: string }[]
    projectId?: string
}

export function ProjectItemDialog({
    open,
    onOpenChange,
    isEditMode,
    formData,
    setFormData,
    handleSubmit,
    isSubmitting,
    projects,
    users,
    projectId
}: ProjectItemDialogProps) {

    // Initialize default start date to today if creating new
    useEffect(() => {
        if (!isEditMode && !formData.planned_start_date && open) {
            const today = new Date().toISOString().split('T')[0]
            setFormData({ ...formData, planned_start_date: today })
        }
    }, [open, isEditMode, formData.planned_start_date])

    // Date calculation logic
    const handleStartDateChange = (val: string) => {
        const start = new Date(val)
        if (formData.duration_days > 0 && !isNaN(start.getTime())) {
            const end = new Date(start)
            end.setDate(end.getDate() + parseInt(formData.duration_days))
            setFormData({ ...formData, planned_start_date: val, planned_end_date: end.toISOString().split('T')[0] })
        } else {
            setFormData({ ...formData, planned_start_date: val })
        }
    }

    const handleDurationChange = (val: string) => {
        const days = parseInt(val) || 0
        const start = new Date(formData.planned_start_date)
        if (days > 0 && !isNaN(start.getTime())) {
            const end = new Date(start)
            end.setDate(end.getDate() + days)
            setFormData({ ...formData, duration_days: days, planned_end_date: end.toISOString().split('T')[0] })
        } else {
            setFormData({ ...formData, duration_days: days })
        }
    }

    const handleEndDateChange = (val: string) => {
        const end = new Date(val)
        const start = new Date(formData.planned_start_date)
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const diffTime = end.getTime() - start.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            setFormData({ ...formData, planned_end_date: val, duration_days: Math.max(0, diffDays) })
        } else {
            setFormData({ ...formData, planned_end_date: val })
        }
    }

    // Currency Formatting (Thousand separator)
    const formatNumber = (val: number | string) => {
        if (!val) return ''
        const num = val.toString().replace(/\D/g, '')
        return new Intl.NumberFormat('vi-VN').format(parseInt(num) || 0)
    }

    const handleCostChange = (val: string, field: string) => {
        const num = val.replace(/\D/g, '')
        setFormData({ ...formData, [field]: parseInt(num) || 0 })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {!isEditMode && (
                <DialogTrigger asChild>
                    <Button className="h-10 rounded-xl px-5 bg-primary hover:bg-primary/95 text-primary-foreground shadow-md shadow-primary/10 font-medium transition-all active:scale-[0.98] text-xs flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Thêm mới
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-2xl rounded-[1.5rem] border-border/40 bg-card overflow-hidden text-slate-900 font-sans">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-800">
                        {isEditMode ? 'Cập nhật hạng mục' : 'Thêm hạng mục mới'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        Nhập thông tin chi tiết hạng mục dự án. Các trường có dấu * là bắt buộc.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                        {!projectId && (
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-[12px] font-semibold text-slate-600 pl-1">Dự án *</Label>
                                <select
                                    required
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"
                                    value={formData.project_id || ''}
                                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                >
                                    <option value="">Chọn dự án...</option>
                                    {projects.map(p => (
                                        <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label className="text-[12px] font-semibold text-slate-600 pl-1">Mã hạng mục (WBS)</Label>
                            <Input
                                placeholder="VD: HM-01..."
                                className="h-10 rounded-xl text-[13px] text-slate-900 border-slate-200"
                                value={formData.wbs_code || ''}
                                onChange={(e) => setFormData({ ...formData, wbs_code: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[12px] font-semibold text-slate-600 pl-1">Tên hạng mục *</Label>
                            <Input
                                required
                                placeholder="Nhập tên hạng mục..."
                                className="h-10 rounded-xl text-[13px] text-slate-900 border-slate-200"
                                value={formData.item_name || ''}
                                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[12px] font-semibold text-slate-600 pl-1">Đơn vị tính</Label>
                            <Input
                                placeholder="VD: m2, kg..."
                                className="h-10 rounded-xl text-[13px] text-slate-900 border-slate-200"
                                value={formData.unit || ''}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[12px] font-semibold text-slate-600 pl-1">Khối lượng</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="h-10 rounded-xl text-[13px] text-slate-900 border-slate-200"
                                value={formData.quantity || ''}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[12px] font-semibold text-slate-600 pl-1">Ngày bắt đầu kế hoạch</Label>
                            <Input
                                type="date"
                                className="h-10 rounded-xl text-[13px] text-slate-900 border-slate-200"
                                value={formData.planned_start_date || ''}
                                onChange={(e) => handleStartDateChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[12px] font-semibold text-slate-600 pl-1">Số ngày thực hiện</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                className="h-10 rounded-xl text-[13px] text-slate-900 border-slate-200"
                                value={formData.duration_days || ''}
                                onChange={(e) => handleDurationChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[12px] font-semibold text-slate-600 pl-1">Ngày kết thúc kế hoạch</Label>
                            <Input
                                type="date"
                                className="h-10 rounded-xl text-[13px] text-slate-900 border-slate-200"
                                value={formData.planned_end_date || ''}
                                onChange={(e) => handleEndDateChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[12px] font-semibold text-slate-600 pl-1">Chi phí kế hoạch</Label>
                            <Input
                                placeholder="0"
                                className="h-10 rounded-xl text-[13px] text-slate-900 border-slate-200 font-medium"
                                value={formatNumber(formData.planned_cost)}
                                onChange={(e) => handleCostChange(e.target.value, 'planned_cost')}
                            />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-[12px] font-semibold text-slate-600 pl-1">Nhân sự phụ trách</Label>
                            <select
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"
                                value={formData.responsible_user_id || ''}
                                onChange={(e) => setFormData({ ...formData, responsible_user_id: e.target.value })}
                            >
                                <option value="">Chọn nhân sự...</option>
                                {users.map(u => (
                                    <option key={u.email} value={u.email}>{u.full_name} ({u.email})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 rounded-xl bg-primary text-sm font-bold shadow-lg shadow-primary/20"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Lưu hạng mục
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
