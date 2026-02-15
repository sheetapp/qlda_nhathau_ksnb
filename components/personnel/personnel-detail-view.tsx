'use client'

import {
    Sheet,
    SheetContent,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    RefreshCw, Printer, Key, Mail, Phone, Shield,
    X, Pencil, Trash2, User, Briefcase, Calendar, MapPin
} from 'lucide-react'

interface PersonnelDetailViewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: any | null
    onEdit: (user: any) => void
    onDelete: (email: string) => void
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    'Đang làm việc': { label: 'Đang làm việc', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
    'Tạm dừng': { label: 'Tạm dừng', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
    'Nghỉ việc': { label: 'Nghỉ việc', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400' }
}

export function PersonnelDetailView({
    open,
    onOpenChange,
    user,
    onEdit,
    onDelete
}: PersonnelDetailViewProps) {
    if (!user) return null

    const quickActions = [
        { icon: RefreshCw, label: 'Trạng thái', color: 'text-blue-600', onClick: () => { } },
        { icon: Printer, label: 'In hồ sơ', color: 'text-slate-600', onClick: () => window.print() },
        { icon: Key, label: 'Đổi MK', color: 'text-amber-600', onClick: () => { } },
        { icon: Mail, label: 'Gửi Email', color: 'text-primary', onClick: () => window.location.href = `mailto:${user.email}` },
        { icon: Phone, label: 'Gọi điện', color: 'text-emerald-600', onClick: () => user.phone_number && (window.location.href = `tel:${user.phone_number}`) },
        { icon: Shield, label: 'Phân quyền', color: 'text-purple-600', onClick: () => { } },
    ]

    const handleDelete = () => {
        if (confirm(`Xác nhận xóa nhân sự "${user.full_name}"?`)) {
            onDelete(user.email)
            onOpenChange(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-xl overflow-y-auto p-0 border-l">
                {/* Header */}
                <div className="p-6 border-b bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                            <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-sm">
                                <AvatarFallback className="text-xl font-medium bg-primary/10 text-primary">
                                    {user.full_name?.split(' ').slice(-2).map((n: string) => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-slate-800 mb-1 truncate">{user.full_name}</h2>
                                <p className="text-[13px] font-semibold text-primary/80 mb-1">{user.position || 'Chưa cập nhật'}</p>
                                <Badge
                                    variant="outline"
                                    className={`rounded-full text-xs font-medium border-none ${STATUS_MAP[user.work_status || 'Đang làm việc']?.color}`}
                                >
                                    {STATUS_MAP[user.work_status || 'Đang làm việc']?.label}
                                </Badge>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="rounded-full shrink-0 ml-2"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-6 gap-2 mt-4">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={action.onClick}
                                className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-background/80 transition-colors group"
                            >
                                <div className="h-10 w-10 rounded-full bg-background border border-border/50 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                                    <action.icon className={`h-4 w-4 ${action.color}`} />
                                </div>
                                <span className="text-[10px] font-medium text-center leading-tight text-muted-foreground">
                                    {action.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 pb-32">
                    {/* THÔNG TIN CÁ NHÂN */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <User className="h-4 w-4 text-primary" />
                            <h3 className="text-[13px] font-bold text-primary tracking-tight">
                                Thông tin cá nhân
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoField label="Họ tên" value={user.full_name} />
                            <InfoField label="Ngày sinh" value={formatDate(user.birthday)} />
                            <InfoField label="Giới tính" value={user.gender} />
                            <InfoField label="CMND/CCCD" value={user.id_card_number} />
                            <InfoField label="Ngày cấp" value={formatDate(user.id_card_date)} />
                            <InfoField label="Nơi cấp" value={user.id_card_place} className="col-span-2" />
                            <InfoField label="Quốc tịch" value={user.nationality} />
                            <InfoField label="Dân tộc" value={user.ethnicity} />
                            <InfoField label="Tôn giáo" value={user.religion} className="col-span-2" />
                        </div>
                    </div>

                    {/* THÔNG TIN CÔNG VIỆC */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <h3 className="text-[13px] font-bold text-primary tracking-tight">
                                Thông tin công việc
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoField label="Mã nhân viên" value={user.employee_id} />
                            <InfoField label="Chức vụ" value={user.position} />
                            <InfoField label="Phòng ban" value={user.department} />
                            <InfoField label="Cấp bậc" value={user.level} />
                            <InfoField label="Email công việc" value={user.email} className="col-span-2" />
                            <InfoField label="Số điện thoại" value={user.phone_number} />
                            <InfoField label="Ngày vào làm" value={formatDate(user.join_date)} />
                        </div>
                    </div>

                    {/* LIÊN HỆ */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="h-4 w-4 text-primary" />
                            <h3 className="text-[13px] font-bold text-primary tracking-tight">
                                Thông tin liên hệ
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoField label="Email cá nhân" value={user.personal_email} className="col-span-2" />
                            <InfoField label="Tỉnh/Thành phố" value={user.province} />
                            <InfoField label="Quận/Huyện" value={user.district} />
                            <InfoField label="Địa chỉ chi tiết" value={user.address_detail} className="col-span-2" />
                        </div>
                    </div>

                    {/* HỢP ĐỒNG */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-4 w-4 text-primary" />
                            <h3 className="text-xs font-medium text-primary uppercase tracking-wide">
                                Hợp đồng & Bảo hiểm
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoField label="Loại hợp đồng" value={user.contract_type} />
                            <InfoField label="Ngày hết hạn" value={formatDate(user.contract_end_date)} />
                            <InfoField label="Mã số thuế" value={user.tax_id} />
                            <InfoField label="Số BHXH" value={user.social_insurance_id} />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="fixed bottom-0 right-0 w-full sm:w-[576px] p-6 bg-background/95 backdrop-blur-sm border-t flex items-center justify-between gap-3 z-20">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 h-11 rounded-xl font-medium"
                    >
                        Đóng
                    </Button>
                    <Button
                        variant="default"
                        onClick={() => {
                            onOpenChange(false)
                            onEdit(user)
                        }}
                        className="flex-1 h-11 rounded-xl font-medium"
                    >
                        <Pencil className="h-4 w-4 mr-1.5" />
                        Sửa
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        className="flex-1 h-11 rounded-xl font-medium"
                    >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Xóa
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

// Helper component
function InfoField({ label, value, className = '' }: { label: string, value?: string | null, className?: string }) {
    return (
        <div className={className}>
            <p className="text-[11.5px] font-semibold text-slate-500/80 mb-0.5">{label}</p>
            <p className="text-[13.5px] font-semibold text-slate-800 tracking-tight leading-relaxed">
                {value || <span className="italic font-normal text-slate-400">Chưa cập nhật</span>}
            </p>
        </div>
    )
}

// Helper function
function formatDate(dateStr?: string | null): string {
    if (!dateStr) return ''
    try {
        const date = new Date(dateStr)
        return date.toLocaleDateString('vi-VN')
    } catch {
        return dateStr
    }
}
