'use client'

import { useState, useEffect } from 'react'
import {
    Users, Calendar, TreePine, FileText, Settings,
    Megaphone, UserPlus, CalendarDays, Send, BarChart2,
    GraduationCap, BookOpen, UserCheck, Star, Award,
    ClipboardCheck, Target, Gavel, ArrowRightLeft,
    LayoutGrid, Search, HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PersonnelItem {
    id: string
    title: string
    description: string
    icon: any
    color: string
}

interface PersonnelSection {
    title: string
    items: PersonnelItem[]
}

const PERSONNEL_SECTIONS: PersonnelSection[] = [
    {
        title: 'Kế hoạch nhân sự',
        items: [
            { id: 'db', title: 'Định biên', description: 'Số lượng vị trí theo phòng ban, so sánh thực tế.', icon: Users, color: 'text-blue-500 bg-blue-50' },
            { id: 'khns', title: 'Kế hoạch nhân sự', description: 'Kế hoạch tuyển, giảm, đào tạo theo năm, quý.', icon: Calendar, color: 'text-indigo-500 bg-indigo-50' },
            { id: 'sdtc', title: 'Sơ đồ tổ chức', description: 'Xem sơ đồ tổ chức, cây phòng ban.', icon: TreePine, color: 'text-emerald-500 bg-emerald-50' },
            { id: 'bcns', title: 'Báo cáo nhân sự', description: 'Headcount, biến động, turnover.', icon: FileText, color: 'text-cyan-500 bg-cyan-50' },
            { id: 'tlkh', title: 'Thiết lập kế hoạch', description: 'Mẫu kế hoạch, quy trình phê duyệt.', icon: Settings, color: 'text-slate-500 bg-slate-50' },
        ]
    },
    {
        title: 'Tuyển dụng',
        items: [
            { id: 'ttd', title: 'Tin tuyển dụng', description: 'Đăng tin, vị trí tuyển dụng, yêu cầu.', icon: Megaphone, color: 'text-blue-600 bg-blue-50' },
            { id: 'hsuv', title: 'Hồ sơ ứng viên', description: 'Quản lý hồ sơ, trạng thái ứng viên.', icon: UserPlus, color: 'text-indigo-600 bg-indigo-50' },
            { id: 'lpv', title: 'Lịch phỏng vấn', description: 'Đặt lịch, phòng vấn, người vấn.', icon: CalendarDays, color: 'text-purple-600 bg-purple-50' },
            { id: 'txtd', title: 'Đề xuất tuyển dụng', description: 'Yêu cầu tuyển từ phòng ban, phê duyệt.', icon: Send, color: 'text-emerald-600 bg-emerald-50' },
            { id: 'bctd', title: 'Báo cáo tuyển dụng', description: 'Thống kê theo kênh, vị trí, thời gian.', icon: BarChart2, color: 'text-orange-600 bg-orange-50' },
            { id: 'tltd', title: 'Thiết lập tuyển dụng', description: 'Mẫu tin, quy trình, phản hồi mặc định.', icon: Settings, color: 'text-slate-600 bg-slate-50' },
        ]
    },
    {
        title: 'Đào tạo',
        items: [
            { id: 'khdt', title: 'Kế hoạch đào tạo', description: 'Kế hoạch năm, quý, chủ đề, ngân sách.', icon: CalendarCheck, color: 'text-blue-500 bg-blue-50' },
            { id: 'kdt', title: 'Khóa đào tạo', description: 'Danh sách khóa, giảng viên, thời lượng.', icon: GraduationCap, color: 'text-indigo-500 bg-indigo-50' },
            { id: 'dkdn', title: 'Đăng ký / Ghi danh', description: 'Nhân viên đăng ký, duyệt, danh sách lớp.', icon: UserCheck, color: 'text-emerald-500 bg-emerald-50' },
            { id: 'dgdt', title: 'Đánh giá đào tạo', description: 'Đánh giá khóa học, chất lượng.', icon: Star, color: 'text-yellow-500 bg-yellow-50' },
            { id: 'ccc', title: 'Chứng chỉ / Bằng cấp', description: 'Lưu chứng chỉ nhân viên, hạn hiệu lực.', icon: Award, color: 'text-rose-500 bg-rose-50' },
            { id: 'tldt', title: 'Thiết lập đào tạo', description: 'Loại khóa, danh mục kỹ năng, quy trình.', icon: Settings, color: 'text-slate-500 bg-slate-50' },
        ]
    },
    {
        title: 'Đánh giá & Phát triển',
        items: [
            { id: 'dgnv', title: 'Đánh giá nhân viên', description: 'Kỳ đánh giá, form đánh giá.', icon: ClipboardCheck, color: 'text-blue-600 bg-blue-50' },
            { id: 'kpi', title: 'Mục tiêu KPI / OKR', description: 'Giao mục tiêu, tiến độ, đánh giá hoàn thành.', icon: Target, color: 'text-rose-600 bg-rose-50' },
            { id: 'ktkl', title: 'Khen thưởng & Kỷ luật', description: 'Quyết định khen thưởng, kỷ luật, lưu hồ sơ.', icon: Gavel, color: 'text-orange-600 bg-orange-50' },
            { id: 'ttlc', title: 'Thăng tiến & Luân chuyển', description: 'Đề xuất thăng tiến, luân chuyển, bổ nhiệm.', icon: ArrowRightLeft, color: 'text-purple-600 bg-purple-50' },
            { id: 'tldg', title: 'Thiết lập đánh giá', description: 'Chu kỳ đánh giá, thang điểm, quy trình.', icon: Settings, color: 'text-slate-600 bg-slate-50' },
        ]
    }
]

import { CalendarCheck } from 'lucide-react'

export default function PersonnelPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [favorites, setFavorites] = useState<string[]>([])

    // Load favorites from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('personnel-module-favorites')
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
        localStorage.setItem('personnel-module-favorites', JSON.stringify(newFavorites))
    }

    const filteredSections = PERSONNEL_SECTIONS.map(section => ({
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
                        <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nhân sự tổng hợp</h1>
                            <p className="text-[13px] text-slate-500 mt-0.5">Quản lý kế hoạch, tuyển dụng, đào tạo và phát triển nhân sự.</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-[380px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm biểu mẫu, chức năng..."
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
                            <div className="h-4 w-1 bg-emerald-500 rounded-full" />
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
