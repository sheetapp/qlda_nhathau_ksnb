'use client'

import { useState, useEffect } from 'react'
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { createProject, updateProject, getUsers } from '@/lib/actions/projects'
import { MultiSelect } from '@/components/ui/multi-select'
import { StandardDialogLayout } from '@/components/ui/dialog-layout'
import { addDays, differenceInDays, parseISO, format as formatDateFns } from 'date-fns'

interface Project {
    project_id: string
    project_name: string
    description: string | null
    start_date: string | null
    end_date: string | null
    status: string | null
    manager_name: string | null
    member_names: string[] | null
    total_planned_budget: number | null
    contingency_budget: number | null
    currency_code: string | null
    planned_duration: number | null
    actual_start_date: string | null
    actual_end_date: string | null
    progress_percent: number | null
    actual_cost: number | null
}

interface ProjectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    project?: Project | null
    onSuccess: () => void
}

export function ProjectDialog({
    open,
    onOpenChange,
    project,
    onSuccess,
}: ProjectDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [users, setUsers] = useState<{ email: string; full_name: string | null }[]>([])
    const isEdit = !!project

    const [formData, setFormData] = useState({
        project_id: '',
        project_name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'Đang thực hiện',
        manager_name: '',
        member_names: [] as string[],
        total_planned_budget: 0,
        contingency_budget: 0,
        currency_code: 'VND',
        planned_duration: 0,
        actual_start_date: '',
        actual_end_date: '',
        progress_percent: 0,
        actual_cost: 0,
    })

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers()
                setUsers(data || [])
            } catch (error) {
                console.error('Error fetching users:', error)
            }
        }
        if (open) {
            fetchUsers()
        }
    }, [open])

    useEffect(() => {
        if (open) {
            if (project) {
                setFormData({
                    project_id: project.project_id || '',
                    project_name: project.project_name || '',
                    description: project.description || '',
                    start_date: project.start_date || '',
                    end_date: project.end_date || '',
                    status: project.status || 'Đang thực hiện',
                    manager_name: project.manager_name || '',
                    member_names: project.member_names || [],
                    total_planned_budget: project.total_planned_budget || 0, // This is Contract Value in DB
                    contingency_budget: project.contingency_budget || 0,
                    currency_code: project.currency_code || 'VND',
                    planned_duration: project.planned_duration || 0,
                    actual_start_date: project.actual_start_date || '',
                    actual_end_date: project.actual_end_date || '',
                    progress_percent: project.progress_percent || 0,
                    actual_cost: project.actual_cost || 0,
                })
            } else {
                setFormData({
                    project_id: '',
                    project_name: '',
                    description: '',
                    start_date: '',
                    end_date: '',
                    status: 'Đang thực hiện',
                    manager_name: '',
                    member_names: [],
                    total_planned_budget: 0,
                    contingency_budget: 0,
                    currency_code: 'VND',
                    planned_duration: 0,
                    actual_start_date: '',
                    actual_end_date: '',
                    progress_percent: 0,
                    actual_cost: 0,
                })
            }
        }
    }, [project, open])

    // Dynamic calculations
    const handleStartDateChange = (val: string) => {
        const nextData = { ...formData, start_date: val }
        if (val && formData.planned_duration) {
            try {
                const startDate = parseISO(val)
                const endDate = addDays(startDate, formData.planned_duration)
                nextData.end_date = formatDateFns(endDate, 'yyyy-MM-dd')
            } catch (e) { }
        } else if (val && formData.end_date) {
            try {
                const startDate = parseISO(val)
                const endDate = parseISO(formData.end_date)
                const diff = differenceInDays(endDate, startDate)
                nextData.planned_duration = diff > 0 ? diff : 0
            } catch (e) { }
        }
        setFormData(nextData)
    }

    const handleEndDateChange = (val: string) => {
        const nextData = { ...formData, end_date: val }
        if (val && formData.start_date) {
            try {
                const startDate = parseISO(formData.start_date)
                const endDate = parseISO(val)
                const diff = differenceInDays(endDate, startDate)
                nextData.planned_duration = diff > 0 ? diff : 0
            } catch (e) { }
        }
        setFormData(nextData)
    }

    const handleDurationChange = (val: number) => {
        const nextData = { ...formData, planned_duration: val }
        if (val && formData.start_date) {
            try {
                const startDate = parseISO(formData.start_date)
                const endDate = addDays(startDate, val)
                nextData.end_date = formatDateFns(endDate, 'yyyy-MM-dd')
            } catch (e) { }
        }
        setFormData(nextData)
    }

    const formatNumber = (val: number | string) => {
        if (!val && val !== 0) return ''
        const num = typeof val === 'string' ? parseFloat(val.replace(/\./g, '').replace(/,/g, '')) : val
        if (isNaN(num)) return ''
        return num.toLocaleString('vi-VN')
    }

    const parseNumber = (val: string) => {
        if (!val) return 0
        const cleanVal = val.replace(/\./g, '').replace(/,/g, '')
        const num = parseFloat(cleanVal)
        return isNaN(num) ? 0 : num
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const submitData = {
                ...formData,
                start_date: formData.start_date || undefined,
                end_date: formData.end_date || undefined,
                manager_name: formData.manager_name && formData.manager_name.trim() !== "" ? formData.manager_name : undefined,
                actual_start_date: formData.actual_start_date || undefined,
                actual_end_date: formData.actual_end_date || undefined,
            }



            if (isEdit && project) {
                await updateProject(project.project_id, submitData)
            } else {
                await createProject(submitData)
            }
            onSuccess()
            onOpenChange(false)
        } catch (error: any) {
            console.error('Error saving project:', error)
            const errorMsg = error.message || 'Có lỗi xảy ra khi lưu dự án.'
            alert(errorMsg)
        } finally {
            setIsLoading(false)
        }
    }

    const userOptions = users.map(u => ({
        label: u.full_name || u.email,
        value: u.email
    }))

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
                <StandardDialogLayout
                    title={isEdit ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}
                    onClose={() => onOpenChange(false)}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    isEdit={isEdit}
                >
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                            <TabsTrigger value="budget">Tài chính</TabsTrigger>
                            <TabsTrigger value="timeline">Tiến độ</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {!isEdit && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="project_id">Mã dự án</Label>
                                        <Input
                                            id="project_id"
                                            value={formData.project_id}
                                            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                            placeholder="VD: DA-2024-001"
                                            required
                                        />
                                    </div>
                                )}
                                <div className={isEdit ? "col-span-2 grid gap-2" : "grid gap-2"}>
                                    <Label htmlFor="project_name">Tên dự án</Label>
                                    <Input
                                        id="project_name"
                                        value={formData.project_name}
                                        onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                                        placeholder="Nhập tên dự án"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="manager_name">Người phụ trách (Manager)</Label>
                                    <Select
                                        value={formData.manager_name || " "}
                                        onValueChange={(value) => setFormData({ ...formData, manager_name: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn người phụ trách" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">Không có</SelectItem>
                                            {users.map((user) => (
                                                <SelectItem key={user.email} value={user.email}>
                                                    {user.full_name || user.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Trạng thái</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Đang thực hiện">Đang thực hiện</SelectItem>
                                            <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                                            <SelectItem value="Tạm dừng">Tạm dừng</SelectItem>
                                            <SelectItem value="Hủy bỏ">Hủy bỏ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Nhập mô tả dự án"
                                    rows={3}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Người thực hiện (Members)</Label>
                                <MultiSelect
                                    options={userOptions}
                                    selected={formData.member_names}
                                    onChange={(selected) => setFormData({ ...formData, member_names: selected })}
                                    placeholder="Chọn thành viên tham gia..."
                                />
                            </div>
                        </TabsContent>

                        {/* Budget Tab */}
                        <TabsContent value="budget" className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="total_planned_budget">Giá trị hợp đồng (VND)</Label>
                                    <Input
                                        id="total_planned_budget"
                                        type="text"
                                        value={formatNumber(formData.total_planned_budget)}
                                        onChange={(e) => setFormData({ ...formData, total_planned_budget: parseNumber(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="currency_code">Tiền tệ</Label>
                                    <Select
                                        value={formData.currency_code || 'VND'}
                                        onValueChange={(val) => setFormData({ ...formData, currency_code: val })}
                                    >
                                        <SelectTrigger id="currency_code">
                                            <SelectValue placeholder="Chọn tiền tệ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="VND">VND (Việt Nam Đồng)</SelectItem>
                                            <SelectItem value="USD">USD (Đô la Mỹ)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="actual_cost">Chi phí thực tế</Label>
                                    <Input
                                        id="actual_cost"
                                        type="text"
                                        value={formatNumber(formData.actual_cost)}
                                        onChange={(e) => setFormData({ ...formData, actual_cost: parseNumber(e.target.value) })}
                                        placeholder="0"
                                        className="border-emerald-200 focus:ring-emerald-500/20"
                                    />
                                </div>
                                <div className="grid gap-2 items-end">
                                    {formData.total_planned_budget > 0 && (
                                        <div className="flex items-center gap-2 mb-2 p-2 bg-emerald-50 dark:bg-emerald-500/5 rounded-lg border border-emerald-100 dark:border-emerald-500/10">
                                            <div className="flex-1 h-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-500"
                                                    style={{ width: `${Math.min(100, (formData.actual_cost || 0) / formData.total_planned_budget * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                {Math.round((formData.actual_cost || 0) / formData.total_planned_budget * 100)}% giá trị HĐ
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="contingency_budget">Ngân sách dự phòng</Label>
                                    <Input
                                        id="contingency_budget"
                                        type="text"
                                        value={formatNumber(formData.contingency_budget)}
                                        onChange={(e) => setFormData({ ...formData, contingency_budget: parseNumber(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-center text-sm text-muted-foreground border border-dashed">
                                    Quản lý ngân sách giúp kiểm soát chi phí thực tế không vượt định mức.
                                </div>
                            </div>
                        </TabsContent>

                        {/* Timeline Tab */}
                        <TabsContent value="timeline" className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="start_date">Ngày bắt đầu (Kế hoạch)</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => handleStartDateChange(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end_date">Ngày kết thúc (Kế hoạch)</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => handleEndDateChange(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="planned_duration">Tổng số ngày dự kiến</Label>
                                    <Input
                                        id="planned_duration"
                                        type="text"
                                        value={formatNumber(formData.planned_duration)}
                                        onChange={(e) => handleDurationChange(parseNumber(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="progress_percent">% Hoàn thành tổng thể</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="progress_percent"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.progress_percent}
                                            onChange={(e) => setFormData({ ...formData, progress_percent: Number(e.target.value) })}
                                            className="w-24"
                                        />
                                        <span className="text-sm font-medium">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="actual_start_date">Ngày thực tế khởi công</Label>
                                    <Input
                                        id="actual_start_date"
                                        type="date"
                                        value={formData.actual_start_date}
                                        onChange={(e) => setFormData({ ...formData, actual_start_date: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="actual_end_date">Ngày thực tế bàn giao</Label>
                                    <Input
                                        id="actual_end_date"
                                        type="date"
                                        value={formData.actual_end_date}
                                        onChange={(e) => setFormData({ ...formData, actual_end_date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </StandardDialogLayout>
            </DialogContent>
        </Dialog>
    )
}
