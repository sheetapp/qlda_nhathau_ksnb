'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createPersonnel, updatePersonnel } from '@/lib/actions/personnel'
import { MultiSelect } from '@/components/ui/multi-select'
import { StandardDialogLayout } from '@/components/ui/dialog-layout'

interface User {
    email: string
    fullName: string
    phoneNumber: string | null
    department: string | null
    position: string | null
    accessLevel: number
    avatarUrl: string | null
    projectIds: string[]
}

interface PersonnelDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
    projects: { project_id: string; project_name: string }[]
    onSuccess: () => void
}

const ACCESS_LEVELS = [
    { value: 1, label: 'Quản trị viên (Admin)' },
    { value: 2, label: 'Giám đốc' },
    { value: 3, label: 'Trưởng phòng' },
    { value: 4, label: 'Nhân viên' }
]

export function PersonnelDialog({
    open,
    onOpenChange,
    user,
    projects,
    onSuccess,
}: PersonnelDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        phone_number: '',
        department: '',
        position: '',
        access_level: 4,
        project_ids: [] as string[],
    })

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email,
                full_name: user.fullName,
                phone_number: user.phoneNumber || '',
                department: user.department || '',
                position: user.position || '',
                access_level: user.accessLevel,
                project_ids: user.projectIds || [],
            })
        } else {
            setFormData({
                email: '',
                full_name: '',
                phone_number: '',
                department: '',
                position: '',
                access_level: 4,
                project_ids: [],
            })
        }
    }, [user, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (user) {
                const { email, ...updateData } = formData
                await updatePersonnel(user.email, updateData)
            } else {
                await createPersonnel(formData)
            }
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error('Error saving personnel:', error)
            alert('Có lỗi xảy ra khi lưu thông tin nhân sự.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
                <StandardDialogLayout
                    title={user ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự mới'}
                    onClose={() => onOpenChange(false)}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    isEdit={!!user}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="email">Email đăng nhập <span className="text-destructive">*</span></Label>
                            <Input
                                id="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="example@company.com"
                                required
                                readOnly={!!user}
                                className={user ? 'opacity-60 cursor-not-allowed' : ''}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Họ và tên <span className="text-destructive">*</span></Label>
                            <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="Nguyễn Văn A"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone_number">Số điện thoại</Label>
                            <Input
                                id="phone_number"
                                value={formData.phone_number}
                                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                placeholder="09xx xxx xxx"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="department">Phòng ban</Label>
                            <Input
                                id="department"
                                value={formData.department}
                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                placeholder="Phòng Kỹ thuật"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="position">Chức vụ</Label>
                            <Input
                                id="position"
                                value={formData.position}
                                onChange={e => setFormData({ ...formData, position: e.target.value })}
                                placeholder="Kỹ sư"
                            />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="access_level">Quyền hạn truy cập</Label>
                            <Select
                                value={formData.access_level.toString()}
                                onValueChange={v => setFormData({ ...formData, access_level: parseInt(v) })}
                            >
                                <SelectTrigger id="access_level">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACCESS_LEVELS.map(level => (
                                        <SelectItem key={level.value} value={level.value.toString()}>
                                            {level.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label>Dự án tham gia</Label>
                            <MultiSelect
                                options={projects.map((p: any) => ({ label: p.project_name, value: p.project_id }))}
                                selected={formData.project_ids}
                                onChange={(vals) => setFormData({ ...formData, project_ids: vals })}
                                placeholder="Chọn các dự án..."
                            />
                        </div>
                    </div>
                </StandardDialogLayout>
            </DialogContent>
        </Dialog>
    )
}
