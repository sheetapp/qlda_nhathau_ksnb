'use client'

import { useState, useEffect } from 'react'
import {
    BookOpen, Calculator, CalendarDays, RefreshCcw, FileBarChart, Settings,
    FileDown, FileUp, Wallet, CreditCard, CheckSquare,
    Target, PieChart, TrendingUp, BarChart3,
    Coins, Landmark, LineChart, Check, FileText, Receipt,
    Search, Star, HelpCircle, Wallet2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface FinanceItem {
    id: string
    title: string
    description: string
    icon: any
    color: string
    href: string
}

interface FinanceSection {
    title: string
    items: FinanceItem[]
}

const FINANCE_SECTIONS: FinanceSection[] = [
    {
        title: 'Kế toán tổng hợp',
        items: [
            { id: 'sc', title: 'Số cái', description: 'Số cái tài khoản, đối chiếu số dư.', icon: BookOpen, color: 'text-blue-500 bg-blue-50', href: '#' },
            { id: 'dk', title: 'Định khoản / Hạch toán', description: 'Chứng từ, bút toán, luồng duyệt.', icon: Calculator, color: 'text-indigo-500 bg-indigo-50', href: '#' },
            { id: 'kkt', title: 'Kỳ kế toán', description: 'Đóng kỳ, khóa sổ, mở kỳ mới.', icon: CalendarDays, color: 'text-purple-500 bg-purple-50', href: '#' },
            { id: 'dssl', title: 'Đối soát số liệu', description: 'Đối chiếu nội bộ, số liệu liên kết.', icon: RefreshCcw, color: 'text-emerald-500 bg-emerald-50', href: '#' },
            { id: 'bctc', title: 'Báo cáo tài chính', description: 'BCKQKD, CĐKT, Lưu chuyển tiền tệ.', icon: FileBarChart, color: 'text-cyan-500 bg-cyan-50', href: '#' },
            { id: 'tlkt', title: 'Thiết lập kế toán', description: 'Danh mục tài khoản, kỳ, phân quyền.', icon: Settings, color: 'text-slate-500 bg-slate-50', href: '#' },
        ]
    },
    {
        title: 'Công nợ & Thu chi',
        items: [
            { id: 'cnpt', title: 'Công nợ phải thu', description: 'Công nợ khách hàng, theo dõi thu, đối soát.', icon: FileDown, color: 'text-emerald-500 bg-emerald-50', href: '#' },
            { id: 'cnptr', title: 'Công nợ phải trả', description: 'Công nợ nhà cung cấp, lịch thanh toán.', icon: FileUp, color: 'text-orange-500 bg-orange-50', href: '#' },
            { id: 'ttpt', title: 'Thu tiền / Phiếu thu', description: 'Phiếu thu, đối ứng công nợ, quỹ.', icon: Wallet, color: 'text-blue-500 bg-blue-50', href: '#' },
            { id: 'ctpc', title: 'Chi tiền / Phiếu chi', description: 'Phiếu chi, tạm ứng, thanh toán.', icon: CreditCard, color: 'text-rose-500 bg-rose-50', href: '#' },
            { id: 'dscno', title: 'Đối soát công nợ', description: 'Đối chiếu công nợ, số dư, điều chỉnh.', icon: CheckSquare, color: 'text-indigo-500 bg-indigo-50', href: '#' },
            { id: 'tlcn', title: 'Thiết lập công nợ', description: 'Loại chứng từ, quy trình duyệt.', icon: Settings, color: 'text-slate-500 bg-slate-50', href: '#' },
        ]
    },
    {
        title: 'Ngân sách',
        items: [
            { id: 'khns', title: 'Kế hoạch ngân sách', description: 'Lập ngân sách năm, quý theo phòng ban, mục.', icon: Target, color: 'text-purple-500 bg-purple-50', href: '#' },
            { id: 'pbns', title: 'Phân bổ ngân sách', description: 'Phân bổ theo dự án, chi phí, điều chuyển.', icon: PieChart, color: 'text-indigo-500 bg-indigo-50', href: '#' },
            { id: 'tdtc', title: 'Theo dõi thực chi', description: 'So sánh dự toán vs thực chi, cảnh báo vượt.', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50', href: '#' },
            { id: 'bcns', title: 'Báo cáo ngân sách', description: 'Báo cáo sử dụng, còn lại, biến động.', icon: BarChart3, color: 'text-cyan-500 bg-cyan-50', href: '#' },
            { id: 'tlns', title: 'Thiết lập ngân sách', description: 'Cấu trúc ngân sách, mẫu, quy trình phê duyệt.', icon: Settings, color: 'text-slate-500 bg-slate-50', href: '#' },
        ]
    },
    {
        title: 'Quỹ, Ngân hàng & Thuế',
        items: [
            { id: 'qtm', title: 'Quỹ tiền mặt', description: 'Sổ quỹ, thu chi tiền mặt, tồn quỹ.', icon: Coins, color: 'text-emerald-500 bg-emerald-50', href: '#' },
            { id: 'tknh', title: 'Tài khoản ngân hàng', description: 'Số phụ ngân hàng, giao dịch, số dư.', icon: Landmark, color: 'text-blue-500 bg-blue-50', href: '#' },
            { id: 'dbdt', title: 'Dự báo dòng tiền', description: 'Dự báo thu chi theo kỳ, kịch bản.', icon: LineChart, color: 'text-teal-500 bg-teal-50', href: '#' },
            { id: 'dsnh', title: 'Đối soát ngân hàng', description: 'Đối chiếu số sách vs sao kê.', icon: Check, color: 'text-cyan-500 bg-cyan-50', href: '#' },
            { id: 'kkt', title: 'Kê khai thuế', description: 'Tờ khai GTGT, TNCN, TNDN, tạm tính.', icon: FileText, color: 'text-orange-500 bg-orange-50', href: '#' },
            { id: 'hd', title: 'Hóa đơn', description: 'Hóa đơn điện tử, phát hành, hủy, đối soát.', icon: Receipt, color: 'text-rose-500 bg-rose-50', href: '#' },
            { id: 'tlqt', title: 'Thiết lập quỹ & thuế', description: 'Thuế suất, mã thuế, tài khoản ngân hàng.', icon: Settings, color: 'text-slate-500 bg-slate-50', href: '#' },
        ]
    }
]

export default function FinanceDashboardPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [favorites, setFavorites] = useState<string[]>([])

    // Load favorites from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('finance-module-favorites')
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
        localStorage.setItem('finance-module-favorites', JSON.stringify(newFavorites))
    }

    const filteredSections = FINANCE_SECTIONS.map(section => ({
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
                        <div className="p-2.5 rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-500/20">
                            <Wallet2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tài chính</h1>
                            <p className="text-[13px] text-slate-500 mt-0.5">Quản lý kế toán, công nợ, ngân sách và dòng tiền.</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-[380px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm công việc tài chính..."
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
                            <div className="h-4 w-1 bg-violet-500 rounded-full" />
                            <h2 className="text-[15px] font-bold text-slate-800 uppercase tracking-wider">{section.title}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {section.items.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.href}
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
                                </Link>
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
