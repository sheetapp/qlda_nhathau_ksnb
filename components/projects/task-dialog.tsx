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
import { createOneTask, updateOneTask, getProjects } from '@/lib/actions/tasks'
import { StandardDialogLayout } from '@/components/ui/dialog-layout'
import { TASK_CATEGORIES, TASK_STATUS } from '@/Config/thongso'

interface Task {
    task_id: string
    project_id: string
    task_name: string
    task_category: string | null
    task_unit: string | null
    wbs: string | null
    description: string | null
    start_date: string | null
    end_date: string | null
    status: string | null
}

interface TaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId?: string // Optional for global task view
    task?: Task | null
    onSuccess: () => void
}

export function TaskDialog({
    open,
    onOpenChange,
    projectId: propProjectId,
    task,
    onSuccess,
}: TaskDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [projects, setProjects] = useState<{ project_id: string; project_name: string }[]>([])
    const isEdit = !!task

    const [formData, setFormData] = useState({
        project_id: propProjectId || '',
        task_name: '',
        task_category: '',
        task_unit: '',
        wbs: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'Chờ thực hiện',
    })

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects()
                setProjects(data || [])
            } catch (error) {
                console.error('Error fetching projects:', error)
            }
        }
        if (open && !propProjectId) {
            fetchProjects()
        }
    }, [open, propProjectId])

    useEffect(() => {
        if (open) {
            if (task) {
                setFormData({
                    project_id: task.project_id || propProjectId || '',
                    task_name: task.task_name || '',
                    task_category: task.task_category || '',
                    task_unit: task.task_unit || '',
                    wbs: task.wbs || '',
                    description: task.description || '',
                    start_date: task.start_date || '',
                    end_date: task.end_date || '',
                    status: task.status || 'Chờ thực hiện',
                })
            } else {
                setFormData({
                    project_id: propProjectId || '',
                    task_name: '',
                    task_category: '',
                    task_unit: '',
                    wbs: '',
                    description: '',
                    start_date: '',
                    end_date: '',
                    status: 'Chờ thực hiện',
                })
            }
        }
    }, [task, open, propProjectId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const data = {
                ...formData,
                project_id: formData.project_id || propProjectId || '',
                task_category: formData.task_category || null,
                task_unit: formData.task_unit || null,
                wbs: formData.wbs || null,
                description: formData.description || null,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
            }

            if (!data.project_id) {
                alert('Vui lòng chọn dự án.')
                setIsLoading(false)
                return
            }

            if (isEdit && task) {
                await updateOneTask(task.task_id, data)
            } else {
                await createOneTask(data)
            }
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error('Error saving task:', error)
            alert('Có lỗi xảy ra khi lưu công việc.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                <StandardDialogLayout
                    title={isEdit ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
                    onClose={() => onOpenChange(false)}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    isEdit={isEdit}
                >
                    <div className="grid gap-4 font-sans text-[14px]">
                        {!propProjectId && (
                            <div className="grid gap-2">
                                <Label htmlFor="project_id">Dự án</Label>
                                <Select
                                    value={formData.project_id}
                                    onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn dự án" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((p) => (
                                            <SelectItem key={p.project_id} value={p.project_id}>
                                                {p.project_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="task_name">Tên công việc</Label>
                            <Input
                                id="task_name"
                                value={formData.task_name}
                                onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                                placeholder="Nhập tên công việc"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="task_category">Hạng mục</Label>
                                <Select
                                    value={formData.task_category}
                                    onValueChange={(value) => setFormData({ ...formData, task_category: value })}
                                >
                                    <SelectTrigger id="task_category">
                                        <SelectValue placeholder="Chọn hạng mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TASK_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="task_unit">Đơn vị tính</Label>
                                <Input
                                    id="task_unit"
                                    value={formData.task_unit}
                                    onChange={(e) => setFormData({ ...formData, task_unit: e.target.value })}
                                    placeholder="VD: m², m³, cái"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="wbs">Mã WBS</Label>
                                <Input
                                    id="wbs"
                                    value={formData.wbs}
                                    onChange={(e) => setFormData({ ...formData, wbs: e.target.value })}
                                    placeholder="1.1.1"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="task_status">Trạng thái</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger id="task_status">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TASK_STATUS.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="task_description">Mô tả</Label>
                            <Textarea
                                id="task_description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Nhập mô tả chi tiết"
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="task_start_date">Ngày bắt đầu</Label>
                                <Input
                                    id="task_start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="task_end_date">Ngày kết thúc</Label>
                                <Input
                                    id="task_end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </StandardDialogLayout>
            </DialogContent>
        </Dialog>
    )
}
