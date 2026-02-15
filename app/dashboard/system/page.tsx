'use client'

import {
    Users,
    Building2,
    Layers,
    Briefcase,
    ClipboardList,
    ShieldCheck,
    MapPin,
    Lock,
    RefreshCcw,
    Smartphone,
    FileText,
    Wallet,
    ArrowUpToLine,
    ArrowDownToLine,
    CheckSquare,
    ChevronRight,
    Settings2
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SystemCardProps {
    title: string
    description: string
    icon: any
    href: string
    color?: string
}

function SystemCard({ title, description, icon: Icon, href, color = "bg-primary/10 text-primary" }: SystemCardProps) {
    return (
        <Link
            href={href}
            className="group p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex items-start gap-5 relative overflow-hidden"
        >
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm", color)}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors tracking-tight">
                    {title}
                </h3>
                <p className="text-[12px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-medium opacity-80">
                    {description}
                </p>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <ChevronRight className="h-4 w-4 text-primary" />
            </div>
        </Link>
    )
}

function SectionHeader({ title, icon: Icon }: { title: string, icon?: any }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-5 bg-primary/40 rounded-full" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 flex items-center gap-2">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {title}
            </h2>
        </div>
    )
}

export default function SystemManagementPage() {
    return (
        <div className="p-4 max-w-full space-y-12 pb-20 font-sans">
            {/* Redundant header removed - handled by DynamicHeader */}

            {/* Sơ đồ */}
            <section>
                <SectionHeader title="Sơ đồ" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SystemCard
                        title="Phòng ban"
                        description="Cơ cấu tổ chức đơn vị, phòng ban trong doanh nghiệp."
                        icon={Building2}
                        href="/dashboard/system/departments"
                        color="bg-blue-50 text-blue-600 dark:bg-blue-500/10"
                    />
                    <SystemCard
                        title="Cấp bậc"
                        description="Hệ thống thang bảng lương và level nhân sự."
                        icon={Layers}
                        href="/dashboard/system/levels"
                        color="bg-orange-50 text-orange-600 dark:bg-orange-500/10"
                    />
                    <SystemCard
                        title="Chức vụ"
                        description="Quản lý danh sách các vị trí công việc."
                        icon={Briefcase}
                        href="/dashboard/system/positions"
                        color="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10"
                    />
                    <SystemCard
                        title="Chức năng nhiệm vụ"
                        description="Sứ mệnh, chức năng phòng ban và nhiệm vụ, bộ chỉ số KPI."
                        icon={ClipboardList}
                        href="/dashboard/system/functions"
                        color="bg-slate-100 text-slate-600 dark:bg-slate-800"
                    />
                    <SystemCard
                        title="Nhân viên"
                        description="Hồ sơ và thông tin chi tiết nhân sự."
                        icon={Users}
                        href="/dashboard/personnel"
                        color="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                    />
                </div>
            </section>

            {/* Bảo mật & Cấu hình */}
            <section>
                <SectionHeader title="Bảo mật & Cấu hình" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SystemCard
                        title="Thông tin công ty"
                        description="Thiết lập thông tin pháp nhân và thương hiệu."
                        icon={Building2}
                        href="/dashboard/system/company"
                        color="bg-purple-50 text-purple-600 dark:bg-purple-500/10"
                    />
                    <SystemCard
                        title="Chi nhánh"
                        description="Quản lý danh sách chi nhánh và địa điểm làm việc."
                        icon={MapPin}
                        href="/dashboard/system/branches"
                        color="bg-slate-100 text-slate-600 dark:bg-slate-800"
                    />
                    <SystemCard
                        title="Phân quyền"
                        description="Quản lý vai trò và quyền hạn truy cập hệ thống."
                        icon={ShieldCheck}
                        href="/dashboard/system/permissions"
                        color="bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                    />
                    <SystemCard
                        title="Sao lưu & Khôi phục"
                        description="Xuất, nhập và khôi phục dữ liệu hệ thống."
                        icon={RefreshCcw}
                        href="/dashboard/system/backup"
                        color="bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10"
                    />
                    <SystemCard
                        title="Thiết bị đăng nhập"
                        description="Quản lý tài khoản đang đăng nhập trên các thiết bị."
                        icon={Smartphone}
                        href="/dashboard/system/devices"
                        color="bg-teal-50 text-teal-600 dark:bg-teal-500/10"
                    />
                </div>
            </section>

            {/* Mẫu biểu */}
            <section>
                <SectionHeader title="Mẫu biểu" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <SystemCard
                        title="Mẫu phiếu Yêu cầu"
                        description="Biểu mẫu chuẩn cho yêu cầu mua sắm/thi công."
                        icon={FileText}
                        href="/dashboard/system/templates?type=PYC"
                    />
                    <SystemCard
                        title="Đề nghị thanh toán"
                        description="Biểu mẫu chuẩn cho các yêu cầu thanh toán."
                        icon={Wallet}
                        href="/dashboard/system/templates?type=DNTT"
                    />
                    <SystemCard
                        title="Xuất kho"
                        description="Biểu mẫu chuẩn cho nghiệp vụ xuất kho vật tư."
                        icon={ArrowUpToLine}
                        href="/dashboard/system/templates?type=EXPORT"
                    />
                    <SystemCard
                        title="Nhập kho"
                        description="Biểu mẫu chuẩn cho nghiệp vụ nhập kho vật tư."
                        icon={ArrowDownToLine}
                        href="/dashboard/system/templates?type=IMPORT"
                    />
                    <SystemCard
                        title="Checklist"
                        description="Các danh mục kiểm tra quy trình nghiệp vụ."
                        icon={CheckSquare}
                        href="/dashboard/system/templates?type=CHECKLIST"
                    />
                </div>
            </section>
        </div>
    )
}
