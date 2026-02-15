import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    User,
    Briefcase,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Camera,
    ShieldCheck,
    Building2,
    Clock,
    Edit,
    LogOut
} from 'lucide-react'
import { format, differenceInYears, differenceInMonths } from 'date-fns'
import { vi } from 'date-fns/locale'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()

    if (error) {
        console.error('Supabase error fetching profile:', error)
    }

    if (!profile) {
        return (
            <div className="p-8 text-center space-y-4">
                <h2 className="text-2xl font-bold">Không tìm thấy thông tin tài khoản</h2>
                <div className="p-4 bg-muted/50 rounded-2xl max-w-lg mx-auto text-left space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Email hiện tại: <span className="font-mono font-bold text-foreground">{user.email}</span>
                    </p>
                    {error && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                Error Code: <span className="font-mono text-destructive">{error.code}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Error Message: <span className="text-destructive">{error.message}</span>
                            </p>
                        </>
                    )}
                </div>
                <p className="text-muted-foreground">
                    Vui lòng kiểm tra lại bảng <code className="bg-muted px-1 rounded">users</code> hoặc cấu hình RLS.
                </p>
                <Button variant="outline" className="rounded-xl" asChild>
                    <a href="/dashboard/profile">Thử lại</a>
                </Button>
            </div>
        )
    }

    const formatValue = (value: any) => value || 'Chưa cập nhật'
    const formatDate = (date: string | null) => date ? format(new Date(date), 'dd/MM/yyyy') : 'Chưa cập nhật'

    const calculateSeniority = (joinDate: string | null) => {
        if (!joinDate) return 'Chưa cập nhật'
        const start = new Date(joinDate)
        const end = new Date()
        const years = differenceInYears(end, start)
        const months = differenceInMonths(end, start) % 12

        let result = ''
        if (years > 0) result += `${years} năm `
        if (months > 0) result += `${months} tháng`
        return result || 'Mới gia nhập'
    }

    const initials = profile.full_name
        ? profile.full_name
            .split(' ')
            .filter(Boolean)
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : 'U'

    return (
        <div className="p-4">
            <div className="max-w-full space-y-6 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Sidebar Profile Card - Sticky */}
                    <div className="lg:col-span-3 lg:sticky lg:top-6 space-y-6">
                        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-2xl overflow-hidden">
                            <div className="h-32 bg-gradient-to-b from-blue-50/80 to-transparent" />
                            <CardContent className="p-4 -mt-20">
                                <div className="flex flex-col items-start">
                                    <div className="relative mb-3">
                                        <Avatar className="h-40 w-40 rounded-[24px] border-[6px] border-white shadow-2xl ring-1 ring-slate-100">
                                            <AvatarImage src={profile.avatar_url || ''} className="object-cover" />
                                            <AvatarFallback className="text-5xl font-bold bg-slate-100 text-slate-400">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="absolute bottom-3 right-3 h-5 w-5 rounded-full border-[3px] border-white bg-emerald-500 shadow-sm" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 w-full mb-4">
                                        <Button variant="outline" size="sm" className="rounded-lg text-[11px] font-medium border-slate-200 bg-white hover:bg-slate-50">
                                            <Camera className="h-3.5 w-3.5 mr-1.5" />
                                            Đổi ảnh
                                        </Button>
                                        <Button variant="outline" size="sm" className="rounded-lg text-[11px] font-medium border-slate-200 bg-white hover:bg-slate-50">
                                            <Edit className="h-3.5 w-3.5 mr-1.5" />
                                            Chỉnh sửa
                                        </Button>
                                    </div>

                                    <h2 className="text-lg font-semibold text-slate-900">{profile.full_name}</h2>
                                    <Badge variant="secondary" className="mt-2 text-[11px] font-medium bg-blue-600/10 text-blue-600 border-none px-3 py-0.5 rounded-full">
                                        {profile.position || 'Nhân viên'}
                                    </Badge>

                                    <div className="w-full space-y-5 mt-10">
                                        <InfoRow icon={Mail} text={profile.email} />
                                        <InfoRow icon={Phone} text={formatValue(profile.phone_number)} />
                                        <InfoRow icon={Building2} text={formatValue(profile.department)} />
                                        <InfoRow icon={Briefcase} text={formatValue(profile.position)} />
                                        <InfoRow icon={Clock} text={`Tham gia ${formatDate(profile.join_date)}`} />
                                        <InfoRow icon={ShieldCheck} text="Tài khoản xác thực" isVerified />
                                    </div>

                                    <Button variant="outline" className="w-full mt-8 rounded-lg text-[13px] font-medium border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Đăng xuất
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Areas */}
                    <div className="lg:col-span-9 space-y-8">
                        {/* Thông tin cá nhân */}
                        <SectionCard
                            icon={User}
                            title="THÔNG TIN CÁ NHÂN"
                            items={[
                                { label: "Họ tên", value: profile.full_name },
                                { label: "Ngày sinh", value: formatDate(profile.birthday) },
                                {
                                    label: "Giới tính",
                                    value: <Badge variant="secondary" className="bg-blue-600/10 text-blue-600 border-none font-medium text-[11px] px-3 py-0.5 rounded-full">{profile.gender || 'Nam'}</Badge>
                                },
                                { label: "CMND/CCCD", value: formatValue(profile.id_card_number) },
                                { label: "Ngày cấp", value: formatDate(profile.id_card_date) },
                                { label: "Nơi cấp", value: formatValue(profile.id_card_place) },
                                { label: "Quốc tịch", value: formatValue(profile.nationality) },
                                { label: "Dân tộc", value: formatValue(profile.ethnicity) },
                                { label: "Tôn giáo", value: formatValue(profile.religion) },
                            ]}
                        />

                        {/* Thông tin công việc */}
                        <SectionCard
                            icon={Briefcase}
                            title="THÔNG TIN CÔNG VIỆC"
                            items={[
                                { label: "Mã nhân viên", value: formatValue(profile.employee_id), isBold: true },
                                { label: "Chức vụ", value: formatValue(profile.position), isBold: true },
                                { label: "Phòng ban", value: formatValue(profile.department), isBold: true },
                                { label: "Cấp bậc", value: formatValue(profile.level) },
                                { label: "Ngày vào làm", value: formatDate(profile.join_date), isBold: true },
                                { label: "Thâm niên", value: calculateSeniority(profile.join_date), isBold: true },
                                { label: "Loại hợp đồng", value: formatValue(profile.contract_type) },
                                { label: "Ngày hết hạn HĐ", value: formatDate(profile.contract_end_date) },
                                { label: "Nơi làm việc", value: formatValue(profile.work_location) },
                            ]}
                        />

                        {/* Thông tin liên hệ & Địa chỉ */}
                        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[20px] overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
                                    <div className="h-5 w-5 text-blue-600">
                                        <Phone className="h-full w-full" />
                                    </div>
                                    <h3 className="font-semibold text-blue-600 text-[13px]">THÔNG TIN LIÊN HỆ</h3>
                                </div>

                                <div className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12">
                                        <InfoItem label="Email công việc" value={profile.email} isBold />
                                        <InfoItem label="Email cá nhân" value={formatValue(profile.personal_email)} />
                                        <InfoItem label="Điện thoại" value={formatValue(profile.phone_number)} isBold />
                                        <InfoItem label="Người liên hệ khẩn cấp" value={formatValue(profile.emergency_contact_name)} />
                                        <InfoItem label="SĐT khẩn cấp" value={formatValue(profile.emergency_contact_phone)} />
                                        <InfoItem label="Quan hệ" value={formatValue(profile.emergency_relationship)} />
                                    </div>

                                    <div className="pt-8 border-t border-slate-50">
                                        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
                                            <MapPin className="h-5 w-5 text-blue-600" />
                                            <h3 className="font-semibold text-blue-600 text-[13px]">ĐỊA CHỈ</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12">
                                            <InfoItem label="Tỉnh/Thành phố" value={formatValue(profile.province)} />
                                            <InfoItem label="Quận/Huyện" value={formatValue(profile.district)} />
                                            <InfoItem label="Phường/Xã" value={formatValue(profile.ward)} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SectionCard({ icon: Icon, title, items }: { icon: any, title: string, items: { label: string, value: any, isBold?: boolean }[] }) {
    return (
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[20px] overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
                    <div className="h-5 w-5 text-blue-600">
                        <Icon className="h-full w-full" />
                    </div>
                    <h3 className="font-semibold text-blue-600 text-[13px]">{title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-8">
                    {items.map((item, i) => (
                        <InfoItem key={i} label={item.label} value={item.value} isBold={item.isBold} />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function InfoItem({ label, value, isBold }: { label: string, value: any, isBold?: boolean }) {
    return (
        <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-slate-400">{label}</p>
            <div className={`text-[13px] leading-relaxed text-slate-700 break-words ${isBold ? 'font-semibold text-slate-900' : ''}`}>
                {value}
            </div>
        </div>
    )
}

function InfoRow({ icon: Icon, text, isVerified }: { icon: any, text: any, isVerified?: boolean }) {
    return (
        <div className="flex items-center gap-3 text-slate-600 group">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Icon className="h-4 w-4" />
            </div>
            <span className={`text-[13px] truncate ${isVerified ? 'text-emerald-600 font-medium' : ''}`}>
                {text}
            </span>
        </div>
    )
}
