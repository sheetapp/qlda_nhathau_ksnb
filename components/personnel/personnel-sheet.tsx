'use client'

import { useEffect, useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { createPersonnel, updatePersonnel } from '@/lib/actions/personnel'
import { MultiSelect } from '@/components/ui/multi-select'
import {
    User,
    Briefcase,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    CreditCard,
    ShieldCheck,
    Calendar,
    ChevronRight,
    Loader2,
    Building2,
    UserCircle
} from 'lucide-react'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

interface Personnel {
    email: string
    full_name: string
    employee_id?: string
    gender?: string
    birthday?: string
    id_card_number?: string
    id_card_date?: string
    id_card_place?: string
    nationality?: string
    ethnicity?: string
    religion?: string
    phone_number?: string | null
    department?: string | null
    position?: string | null
    access_level: number
    avatar_url?: string | null
    project_ids: string[]
    level?: string
    join_date?: string
    contract_type?: string
    contract_end_date?: string
    work_location?: string
    work_status?: string
    personal_email?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    emergency_relationship?: string
    province?: string
    district?: string
    ward?: string
    address_detail?: string
    temporary_address?: string
    marital_status?: string
    dependents_count?: number
    education_level?: string
    major?: string
    university?: string
    graduation_year?: string
    additional_certificates?: string
    bank_account_number?: string
    bank_name?: string
    bank_branch?: string
    tax_id?: string
    social_insurance_id?: string
    health_insurance_id?: string
    insurance_join_date?: string
    insurance_registration_place?: string
}

interface PersonnelSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: any | null
    projects: { project_id: string; project_name: string }[]
    onSuccess: () => void
}

const ACCESS_LEVELS = [
    { value: 1, label: 'Quản trị viên (Admin)' },
    { value: 2, label: 'Giám đốc' },
    { value: 3, label: 'Trưởng phòng' },
    { value: 4, label: 'Nhân viên' }
]

export function PersonnelSheet({
    open,
    onOpenChange,
    user,
    projects,
    onSuccess,
}: PersonnelSheetProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<any>({
        email: '',
        full_name: '',
        access_level: 4,
        project_ids: [],
        work_status: 'Đang làm việc',
        gender: 'Nam',
        nationality: 'Việt Nam',
        ethnicity: 'Kinh',
        religion: 'Không',
        work_location: 'Trụ sở chính - TP.HCM',
    })

    useEffect(() => {
        if (user) {
            setFormData({
                ...user,
                full_name: user.full_name || user.fullName,
                phone_number: user.phone_number || user.phoneNumber,
                project_ids: user.project_ids || user.projectIds || [],
                gender: user.gender || 'Nam',
                nationality: user.nationality || 'Việt Nam',
                ethnicity: user.ethnicity || 'Kinh',
                religion: user.religion || 'Không',
                work_location: user.work_location || 'Trụ sở chính - TP.HCM',
                work_status: user.work_status || 'Đang làm việc',
            })
        } else {
            setFormData({
                email: '',
                full_name: '',
                employee_id: '',
                access_level: 4,
                project_ids: [],
                work_status: 'Đang làm việc',
                gender: 'Nam',
                nationality: 'Việt Nam',
                ethnicity: 'Kinh',
                religion: 'Không',
                work_location: 'Trụ sở chính - TP.HCM',
                level: 'Nhân viên',
                marital_status: 'Độc thân',
                dependents_count: 0
            })
        }
    }, [user, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (user) {
                const { email, ...updateData } = formData
                // Map frontend keys back to DB keys if necessary, but here we assume the form uses DB keys
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

    const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
        <div className="flex items-center gap-2 text-primary font-bold text-[13px] mb-4 mt-6 first:mt-0">
            <Icon className="h-4 w-4" />
            {title}
        </div>
    )

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto p-0 border-none shadow-2xl">
                <div className="bg-primary/5 p-6 border-b border-primary/10 sticky top-0 z-10 backdrop-blur-xl">
                    <SheetHeader className="flex flex-row items-center gap-4 space-y-0">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                            <UserCircle className="h-7 w-7" />
                        </div>
                        <div className="text-left">
                            <SheetTitle className="text-xl font-bold tracking-tight">
                                {user ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự mới'}
                            </SheetTitle>
                            <p className="text-xs text-muted-foreground font-medium">
                                {user ? 'Cập nhật thông tin chi tiết của nhân viên vào hệ thống' : 'Thiết lập thông tin nhân sự mới vào hệ thống'}
                            </p>
                        </div>
                    </SheetHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 pb-24">
                    {/* THÔNG TIN CÁ NHÂN */}
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <SectionTitle icon={UserCircle} title="Thông tin cơ bản" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Họ và tên <span className="text-destructive">*</span></Label>
                                <Input
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50 focus:ring-primary/20"
                                    placeholder="Nguyễn Văn A"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Email công việc <span className="text-destructive">*</span></Label>
                                <Input
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="email@company.com"
                                    type="email"
                                    required
                                    disabled={!!user}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Giới tính</Label>
                                <RadioGroup
                                    value={formData.gender}
                                    onValueChange={v => setFormData({ ...formData, gender: v })}
                                    className="flex items-center gap-6 h-10"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Nam" id="m" />
                                        <Label htmlFor="m" className="text-sm font-medium text-muted-foreground">Nam</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Nữ" id="f" />
                                        <Label htmlFor="f" className="text-sm font-medium text-muted-foreground">Nữ</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Tình trạng hôn nhân</Label>
                                <Select value={formData.marital_status} onValueChange={v => setFormData({ ...formData, marital_status: v })}>
                                    <SelectTrigger className="rounded-xl h-10 bg-muted/30 border-border/50 font-medium">
                                        <SelectValue placeholder="Chọn tình trạng..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Độc thân">Độc thân</SelectItem>
                                        <SelectItem value="Đã kết hôn">Đã kết hôn</SelectItem>
                                        <SelectItem value="Ly hôn">Ly hôn</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Ngày sinh</Label>
                                <Input
                                    type="date"
                                    value={formData.birthday}
                                    onChange={e => setFormData({ ...formData, birthday: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Số người phụ thuộc</Label>
                                <Input
                                    type="number"
                                    value={formData.dependents_count}
                                    onChange={e => setFormData({ ...formData, dependents_count: parseInt(e.target.value) || 0 })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Số CMND/CCCD</Label>
                                <Input
                                    value={formData.id_card_number}
                                    onChange={e => setFormData({ ...formData, id_card_number: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="0790..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Ngày cấp</Label>
                                <Input
                                    type="date"
                                    value={formData.id_card_date}
                                    onChange={e => setFormData({ ...formData, id_card_date: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Nơi cấp</Label>
                                <Input
                                    value={formData.id_card_place}
                                    onChange={e => setFormData({ ...formData, id_card_place: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="Cục CS QLHC về TTXH"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Quốc tịch</Label>
                                <Input
                                    value={formData.nationality}
                                    onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Dân tộc</Label>
                                <Input
                                    value={formData.ethnicity}
                                    onChange={e => setFormData({ ...formData, ethnicity: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* LIÊN HỆ & ĐỊA CHỈ */}
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <SectionTitle icon={MapPin} title="Liên hệ & Địa chỉ" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Số điện thoại</Label>
                                <Input
                                    value={formData.phone_number}
                                    onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="09xx..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Email cá nhân</Label>
                                <Input
                                    value={formData.personal_email}
                                    onChange={e => setFormData({ ...formData, personal_email: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="example@gmail.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Tỉnh/Thành phố</Label>
                                <Input
                                    value={formData.province}
                                    onChange={e => setFormData({ ...formData, province: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Quận/Huyện</Label>
                                <Input
                                    value={formData.district}
                                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Phường/Xã</Label>
                                <Input
                                    value={formData.ward}
                                    onChange={e => setFormData({ ...formData, ward: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Địa chỉ chi tiết (Thường trú)</Label>
                                <Input
                                    value={formData.address_detail}
                                    onChange={e => setFormData({ ...formData, address_detail: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="Số nhà, tên đường..."
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Địa chỉ tạm trú (Nếu khác thường trú)</Label>
                                <Input
                                    value={formData.temporary_address}
                                    onChange={e => setFormData({ ...formData, temporary_address: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                            <div className="space-y-4 pt-4 md:col-span-2 border-t border-border/30">
                                <p className="text-[11px] font-bold text-slate-500/80 tracking-tight">Liên hệ khẩn cấp</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-[12px] font-semibold text-slate-700">Họ tên người liên hệ</Label>
                                        <Input
                                            value={formData.emergency_contact_name}
                                            onChange={e => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                            className="rounded-xl h-10 bg-muted/30 border-border/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[12px] font-semibold text-slate-700">Số điện thoại khẩn cấp</Label>
                                        <Input
                                            value={formData.emergency_contact_phone}
                                            onChange={e => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                                            className="rounded-xl h-10 bg-muted/30 border-border/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[12px] font-semibold text-slate-700">Mối quan hệ</Label>
                                        <Input
                                            value={formData.emergency_relationship}
                                            onChange={e => setFormData({ ...formData, emergency_relationship: e.target.value })}
                                            className="rounded-xl h-10 bg-muted/30 border-border/50"
                                            placeholder="Bố/Mẹ, Vợ/Chồng..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* THÔNG TIN CÔNG VIỆC */}
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <SectionTitle icon={Briefcase} title="Thông tin công việc" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Mã nhân viên</Label>
                                <Input
                                    value={formData.employee_id}
                                    onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="NV001"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Quyền truy cập</Label>
                                <Select value={String(formData.access_level)} onValueChange={v => setFormData({ ...formData, access_level: Number(v) })}>
                                    <SelectTrigger className="rounded-xl h-10 bg-muted/30 border-border/50 font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ACCESS_LEVELS.map(level => (
                                            <SelectItem key={level.value} value={String(level.value)}>{level.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Phòng ban</Label>
                                <Input
                                    value={formData.department}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Chức vụ</Label>
                                <Input
                                    value={formData.position}
                                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Cấp bậc/Level</Label>
                                <Input
                                    value={formData.level}
                                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="Junior, Senior..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Trạng thái làm việc</Label>
                                <Select value={formData.work_status} onValueChange={v => setFormData({ ...formData, work_status: v })}>
                                    <SelectTrigger className="rounded-xl h-10 bg-muted/30 border-border/50 font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Đang làm việc">Đang làm việc</SelectItem>
                                        <SelectItem value="Tạm dừng">Tạm dừng</SelectItem>
                                        <SelectItem value="Nghỉ việc">Nghỉ việc</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Ngày vào làm</Label>
                                <Input
                                    type="date"
                                    value={formData.join_date}
                                    onChange={e => setFormData({ ...formData, join_date: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Loại hợp đồng</Label>
                                <Select value={formData.contract_type} onValueChange={v => setFormData({ ...formData, contract_type: v })}>
                                    <SelectTrigger className="rounded-xl h-10 bg-muted/30 border-border/50 font-medium">
                                        <SelectValue placeholder="Chọn loại..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Chính thức">Chính thức</SelectItem>
                                        <SelectItem value="Thử việc">Thử việc</SelectItem>
                                        <SelectItem value="Cộng tác viên">Cộng tác viên</SelectItem>
                                        <SelectItem value="Thực tập sinh">Thực tập sinh</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Địa điểm làm việc</Label>
                                <Input
                                    value={formData.work_location}
                                    onChange={e => setFormData({ ...formData, work_location: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Dự án tham gia</Label>
                                <MultiSelect
                                    options={projects.map(p => ({ label: p.project_name, value: p.project_id }))}
                                    onChange={vals => setFormData({ ...formData, project_ids: vals })}
                                    selected={formData.project_ids || []}
                                    placeholder="Chọn dự án..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* HỌC VẤN & CHỨNG CHỈ */}
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <SectionTitle icon={GraduationCap} title="Học vấn & Chứng chỉ" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Trình độ học vấn</Label>
                                <Select value={formData.education_level} onValueChange={v => setFormData({ ...formData, education_level: v })}>
                                    <SelectTrigger className="rounded-xl h-10 bg-muted/30 border-border/50">
                                        <SelectValue placeholder="Chọn trình độ..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Trung cấp">Trung cấp</SelectItem>
                                        <SelectItem value="Cao đẳng">Cao đẳng</SelectItem>
                                        <SelectItem value="Đại học">Đại học</SelectItem>
                                        <SelectItem value="Thạc sĩ">Thạc sĩ</SelectItem>
                                        <SelectItem value="Tiến sĩ">Tiến sĩ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Chuyên ngành</Label>
                                <Input
                                    value={formData.major}
                                    onChange={e => setFormData({ ...formData, major: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="Công nghệ thông tin"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Trường đào tạo</Label>
                                <Input
                                    value={formData.university}
                                    onChange={e => setFormData({ ...formData, university: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="Đại học Bách Khoa TP.HCM"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Năm tốt nghiệp</Label>
                                <Input
                                    value={formData.graduation_year}
                                    onChange={e => setFormData({ ...formData, graduation_year: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="2020"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Chứng chỉ bổ sung</Label>
                                <Input
                                    value={formData.additional_certificates}
                                    onChange={e => setFormData({ ...formData, additional_certificates: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="AWS, PMP, IELTS..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* TÀI CHÍNH & NGÂN HÀNG */}
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <SectionTitle icon={CreditCard} title="Tài chính & Ngân hàng" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Số tài khoản</Label>
                                <Input
                                    value={formData.bank_account_number}
                                    onChange={e => setFormData({ ...formData, bank_account_number: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="0123456789"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Tên ngân hàng</Label>
                                <Input
                                    value={formData.bank_name}
                                    onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="Vietcombank"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Chi nhánh</Label>
                                <Input
                                    value={formData.bank_branch}
                                    onChange={e => setFormData({ ...formData, bank_branch: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="Chi nhánh Sở Giao Dịch"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Mã số thuế cá nhân</Label>
                                <Input
                                    value={formData.tax_id}
                                    onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="8012345678"
                                />
                            </div>
                        </div>
                    </div>

                    {/* BẢO HIỂM */}
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <SectionTitle icon={ShieldCheck} title="Bảo hiểm" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Số BHXH</Label>
                                <Input
                                    value={formData.social_insurance_id}
                                    onChange={e => setFormData({ ...formData, social_insurance_id: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="7901234567"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Số BHYT</Label>
                                <Input
                                    value={formData.health_insurance_id}
                                    onChange={e => setFormData({ ...formData, health_insurance_id: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="HS4012345678901"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Ngày tham gia BH</Label>
                                <Input
                                    type="date"
                                    value={formData.insurance_join_date}
                                    onChange={e => setFormData({ ...formData, insurance_join_date: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[12px] font-semibold text-slate-700">Nơi đăng ký KCB</Label>
                                <Input
                                    value={formData.insurance_registration_place}
                                    onChange={e => setFormData({ ...formData, insurance_registration_place: e.target.value })}
                                    className="rounded-xl h-10 bg-muted/30 border-border/50"
                                    placeholder="Bệnh viện Đại học Y Dược"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="fixed bottom-0 right-0 left-0 md:left-auto md:w-[672px] bg-background/80 backdrop-blur-xl border-t border-border/50 p-6 flex justify-between items-center z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl px-8 h-12 font-semibold hover:bg-muted/50 transition-colors"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-xl px-12 h-12 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (user ? 'Cập nhật' : 'Tạo mới')}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}
