'use client'

import { useState, useEffect } from 'react'
import {
    LayoutGrid, Star, Search,
    Calendar, FileText, ClipboardList, Target, Banknote, Scale, Settings2,
    Archive, FolderOpen, UserCheck, UserCog, BarChart3,
    Building, ArrowLeftRight, ClipboardCheck, Wrench, Calculator,
    Car, CalendarCheck, CalendarClock, Fuel, UserCircle,
    ChevronRight, HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface AdminItem {
    id: string
    title: string
    description: string
    icon: any
    color: string
}

interface AdminSection {
    title: string
    items: AdminItem[]
}

const ADMIN_SECTIONS: AdminSection[] = [
    {
        title: 'Công lương',
        items: [
            { id: 'cc', title: 'Chấm công', description: 'Quản lý chấm công, ca làm việc.', icon: Calendar, color: 'text-blue-500 bg-blue-50' },
            { id: 'thcc', title: 'Tổng hợp chấm công', description: 'Tổng hợp và báo cáo chấm công theo nhân viên.', icon: FileText, color: 'text-orange-500 bg-orange-50' },
            { id: 'phc', title: 'Phiếu hành chính', description: 'Phiếu đề xuất, xác nhận hành chính.', icon: ClipboardList, color: 'text-indigo-500 bg-indigo-50' },
            { id: 'kpi', title: 'Chấm điểm KPI', description: 'Đánh giá và chấm điểm KPI theo kỳ, nhân viên.', icon: Target, color: 'text-purple-500 bg-purple-50' },
            { id: 'bl', title: 'Bảng lương', description: 'Tính lương, phiếu lương, báo cáo.', icon: Banknote, color: 'text-emerald-500 bg-emerald-50' },
            { id: 'dct', title: 'Điểm cộng trừ', description: 'Ghi nhận điểm cộng, trừ của nhân viên theo tháng.', icon: Scale, color: 'text-violet-500 bg-violet-50' },
            { id: 'tlcl', title: 'Thiết lập công lương', description: 'Cấu hình hệ số, quy tắc tính lương.', icon: Settings2, color: 'text-slate-500 bg-slate-50' },
        ]
    },
    {
        title: 'Tài liệu',
        items: [
            { id: 'dstl', title: 'Danh sách tài liệu', description: 'Nội bộ, văn bản đến - đi.', icon: FileText, color: 'text-blue-600 bg-blue-50' },
            { id: 'lths', title: 'Lưu trữ hồ sơ', description: 'Lưu trữ, tra cứu, mượn trả hồ sơ.', icon: Archive, color: 'text-emerald-600 bg-emerald-50' },
            { id: 'tltl', title: 'Thiết lập tài liệu', description: 'Quy trình, mẫu văn bản, phân quyền.', icon: Settings2, color: 'text-slate-600 bg-slate-50' },
        ]
    },
    {
        title: 'Công việc',
        items: [
            { id: 'da', title: 'Dự án', description: 'Quản lý dự án, phòng ban, thời gian, mục tiêu.', icon: FolderOpen, color: 'text-blue-500 bg-blue-50' },
            { id: 'cvct', title: 'Công việc của tôi', description: 'Công việc được giao cho tôi, theo dõi và báo cáo.', icon: UserCheck, color: 'text-emerald-500 bg-emerald-50' },
            { id: 'cvql', title: 'Công việc tôi quản lý', description: 'Công việc do tôi giao, theo dõi tiến độ và nhận báo cáo.', icon: UserCog, color: 'text-cyan-500 bg-cyan-50' },
            { id: 'bc', title: 'Báo cáo', description: 'Thống kê công việc theo dự án, phòng ban, người, thời gian.', icon: BarChart3, color: 'text-teal-500 bg-teal-50' },
            { id: 'tlcv', title: 'Thiết lập công việc', description: 'Cảnh báo đến hạn, mẫu công việc, quy tắc mặc định.', icon: Settings2, color: 'text-slate-500 bg-slate-50' },
        ]
    },
    {
        title: 'Tài sản',
        items: [
            { id: 'dmts', title: 'Danh mục tài sản', description: 'Mã tài sản, nhóm, phòng ban quản lý.', icon: Building, color: 'text-blue-600 bg-blue-50' },
            { id: 'cpth', title: 'Cấp phát / Thu hồi', description: 'Cấp phát, bàn giao, thu hồi tài sản.', icon: ArrowLeftRight, color: 'text-indigo-600 bg-indigo-50' },
            { id: 'kkts', title: 'Kiểm kê tài sản', description: 'Đợt kiểm kê, đối chiếu, biên bản.', icon: ClipboardCheck, color: 'text-emerald-600 bg-emerald-50' },
            { id: 'btsc', title: 'Bảo trì - Sửa chữa', description: 'Kế hoạch bảo trì, yêu cầu sửa chữa.', icon: Wrench, color: 'text-orange-600 bg-orange-50' },
            { id: 'khts', title: 'Khấu hao tài sản', description: 'Tính khấu hao, báo cáo khấu hao.', icon: Calculator, color: 'text-purple-600 bg-purple-50' },
            { id: 'tlts', title: 'Thiết lập tài sản', description: 'Nhóm tài sản, tham số khấu hao.', icon: Settings2, color: 'text-slate-600 bg-slate-50' },
        ]
    },
    {
        title: 'Quản lý xe',
        items: [
            { id: 'dsx', title: 'Danh sách xe', description: 'Thông tin xe, biển số, trạng thái.', icon: Car, color: 'text-blue-500 bg-blue-50' },
            { id: 'dksd', title: 'Đăng ký sử dụng xe', description: 'Đặt xe, phê duyệt, lịch sử sử dụng.', icon: CalendarCheck, color: 'text-emerald-500 bg-emerald-50' },
            { id: 'lbd', title: 'Lịch bảo dưỡng', description: 'Định kỳ bảo dưỡng, nhắc lịch.', icon: CalendarClock, color: 'text-orange-500 bg-orange-50' },
            { id: 'pxcx', title: 'Phiếu xăng - Chi phí xe', description: 'Đổ xăng, chi phí đi lại, đối soát.', icon: Fuel, color: 'text-rose-500 bg-rose-50' },
            { id: 'qllx', title: 'Quản lý lái xe', description: 'Danh sách lái xe, phân công, bằng lái.', icon: UserCircle, color: 'text-pink-500 bg-pink-50' },
            { id: 'tlqx', title: 'Thiết lập quản lý xe', description: 'Loại xe, quy trình đặt xe, phân quyền.', icon: Settings2, color: 'text-slate-500 bg-slate-50' },
        ]
    }
]

export default function AdministrationPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [favorites, setFavorites] = useState<string[]>([])

    // Load favorites from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('admin-module-favorites')
        if (saved) {
            try {
                setFavorites(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to parse favorites', e)
            }
        }
    }, [])

    const toggleFavorite = (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const newFavorites = favorites.includes(id)
            ? favorites.filter(f => f !== id)
            : [...favorites, id]
        setFavorites(newFavorites)
        localStorage.setItem('admin-module-favorites', JSON.stringify(newFavorites))
    }

    const filteredSections = ADMIN_SECTIONS.map(section => ({
        ...section,
        items: section.items.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(section => section.items.length > 0)

    return (
        <div className="flex flex-col h-full bg-[#f8fafc]">
            {/* Header / Search */}
            <div className="px-8 pt-8 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                            <LayoutGrid className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hành chính tổng hợp</h1>
                            <p className="text-[13px] text-slate-500 mt-0.5">Quản lý nghiệp vụ hành chính, công lương và tài sản.</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-[380px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm chức năng..."
                            className="pl-11 h-12 bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-primary/10 rounded-2xl shadow-sm text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content Areas */}
            <div className="flex-1 overflow-y-auto px-8 pb-12 space-y-10">
                {filteredSections.map((section, idx) => (
                    <div key={idx} className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="h-4 w-1 bg-primary rounded-full" />
                            <h2 className="text-[15px] font-bold text-slate-800 uppercase tracking-wider">{section.title}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {section.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="group relative flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                >
                                    {/* Icon */}
                                    <div className={cn(
                                        "shrink-0 p-3.5 rounded-xl transition-transform duration-500 group-hover:scale-110",
                                        item.color
                                    )}>
                                        <item.icon className="h-6 w-6" />
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 min-w-0 pr-6">
                                        <h3 className="font-bold text-[15px] text-slate-900 mb-1 group-hover:text-primary transition-colors truncate">
                                            {item.title}
                                        </h3>
                                        <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="absolute top-3 right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-7 w-7 rounded-full hover:bg-slate-100",
                                                favorites.includes(item.id) ? "text-yellow-500" : "text-slate-300"
                                            )}
                                            onClick={(e) => toggleFavorite(item.id, e)}
                                        >
                                            <Star className={cn("h-3.5 w-3.5", favorites.includes(item.id) && "fill-current")} />
                                        </Button>
                                    </div>

                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <div className="text-slate-300 hover:text-slate-500">
                                            <HelpCircle className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredSections.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Search className="h-12 w-12 opacity-10 mb-4" />
                        <p>Không tìm thấy chức năng nào phù hợp</p>
                    </div>
                )}
            </div>
        </div>
    )
}
