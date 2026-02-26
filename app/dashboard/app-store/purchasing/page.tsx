'use client'

import { useState, useEffect } from 'react'
import {
    Users, Group, Star, FileCheck, Settings,
    ClipboardList, ShoppingCart, CheckCircle, Truck, BarChart3,
    Box, Send, FileEdit, Trophy, FileText,
    Search, HelpCircle, ShoppingBag, List, Tag, FileSignature, Receipt, History
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface PurchasingItem {
    id: string
    title: string
    description: string
    icon: any
    color: string
    href: string
}

interface PurchasingSection {
    title: string
    items: PurchasingItem[]
}

const PURCHASING_SECTIONS: PurchasingSection[] = [
    {
        title: 'Nhà cung cấp',
        items: [
            { id: 'dsncc', title: 'Danh sách nhà cung cấp', description: 'Hồ sơ NCC, liên hệ, điều kiện thanh toán.', icon: Users, color: 'text-orange-500 bg-orange-50', href: '#' },
            { id: 'plncc', title: 'Phân loại nhà cung cấp', description: 'Nhóm, hạng, ngành hàng.', icon: Group, color: 'text-indigo-500 bg-indigo-50', href: '#' },
            { id: 'dgncc', title: 'Đánh giá nhà cung cấp', description: 'Chất lượng, giao hàng, điểm số.', icon: Star, color: 'text-yellow-500 bg-yellow-50', href: '#' },
            { id: 'hdk', title: 'Hợp đồng khung', description: 'Hợp đồng khung, giá, thời hạn.', icon: FileCheck, color: 'text-emerald-500 bg-emerald-50', href: '#' },
            { id: 'tlncc', title: 'Thiết lập nhà cung cấp', description: 'Trường tùy chỉnh, quy trình duyệt, phân quyền.', icon: Settings, color: 'text-slate-500 bg-slate-50', href: '#' },
        ]
    },
    {
        title: 'Đặt hàng & Mua hàng',
        items: [
            { id: 'ycmh', title: 'Yêu cầu mua hàng', description: 'Đề xuất mua, duyệt, chuyển thành đơn đặt hàng.', icon: ClipboardList, color: 'text-orange-500 bg-orange-50', href: '#' },
            { id: 'ddh', title: 'Đơn đặt hàng', description: 'Tạo PO, gửi NCC, theo dõi trạng thái.', icon: ShoppingCart, color: 'text-blue-500 bg-blue-50', href: '#' },
            { id: 'dddh', title: 'Duyệt đơn đặt hàng', description: 'Luồng duyệt theo giá trị, phòng ban.', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50', href: '#' },
            { id: 'tddh', title: 'Theo dõi đơn hàng', description: 'Tiến độ giao hàng, nhắc hẹn, nhập kho.', icon: Truck, color: 'text-cyan-500 bg-cyan-50', href: '#' },
            { id: 'bcdh', title: 'Báo cáo đặt hàng', description: 'Thống kê theo NCC, mặt hàng, thời gian.', icon: BarChart3, color: 'text-indigo-500 bg-indigo-50', href: '#' },
            { id: 'tldh', title: 'Thiết lập đặt hàng', description: 'Mẫu PO, hạn mức, quy tắc duyệt.', icon: Settings, color: 'text-slate-500 bg-slate-50', href: '#' },
        ]
    },
    {
        title: 'Đấu thầu / Mời thầu',
        items: [
            { id: 'gt', title: 'Gói thầu', description: 'Tạo gói thầu, nội dung, thời hạn.', icon: Box, color: 'text-orange-600 bg-orange-50', href: '#' },
            { id: 'mt', title: 'Mời thầu', description: 'Mời NCC, hồ sơ mời thầu, deadline.', icon: Send, color: 'text-indigo-600 bg-indigo-50', href: '#' },
            { id: 'hsdt', title: 'Hồ sơ dự thầu', description: 'Nhận hồ sơ, đánh giá, so sánh.', icon: FileEdit, color: 'text-emerald-600 bg-emerald-50', href: '#' },
            { id: 'kqhd', title: 'Kết quả & Hợp đồng', description: 'Trúng thầu, ký hợp đồng, lưu trữ.', icon: Trophy, color: 'text-yellow-600 bg-yellow-50', href: '#' },
            { id: 'bcdt', title: 'Báo cáo đấu thầu', description: 'Tổng hợp đấu thầu, tỷ lệ trúng.', icon: BarChart3, color: 'text-cyan-600 bg-cyan-50', href: '#' },
            { id: 'tldt', title: 'Thiết lập đấu thầu', description: 'Quy trình, tiêu chí đánh giá.', icon: Settings, color: 'text-slate-600 bg-slate-50', href: '#' },
        ]
    },
    {
        title: 'Hợp đồng & Thanh toán',
        items: [
            { id: 'hdmh', title: 'Hợp đồng mua hàng', description: 'Hợp đồng, điều khoản, phụ lục.', icon: FileText, color: 'text-orange-500 bg-orange-50', href: '#' },
            { id: 'tlgh', title: 'Thanh lý & Gia hạn', description: 'Thanh lý, gia hạn, điều chỉnh.', icon: FileSignature, color: 'text-emerald-500 bg-emerald-50', href: '#' },
            { id: 'dstt', title: 'Đối soát thanh toán', description: 'Đối chiếu PO - Hóa đơn - Thanh toán.', icon: RefreshCcw, color: 'text-blue-500 bg-blue-50', href: '#' },
            { id: 'bchd', title: 'Báo cáo hợp đồng', description: 'Thời hạn, giá trị, thực hiện.', icon: BarChart3, color: 'text-indigo-500 bg-indigo-50', href: '#' },
            { id: 'tlhd', title: 'Thiết lập hợp đồng', description: 'Mẫu hợp đồng, quy trình ký.', icon: Settings, color: 'text-slate-500 bg-slate-50', href: '#' },
        ]
    }
]

import { RefreshCcw } from 'lucide-react'

export default function PurchasingDashboardPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [favorites, setFavorites] = useState<string[]>([])

    // Load favorites from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('purchasing-module-favorites')
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
        localStorage.setItem('purchasing-module-favorites', JSON.stringify(newFavorites))
    }

    const filteredSections = PURCHASING_SECTIONS.map(section => ({
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
                        <div className="p-2.5 rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/20">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mua hàng</h1>
                            <p className="text-[13px] text-slate-500 mt-0.5">Quản lý nhà cung cấp, đơn hàng, đấu thầu và hợp đồng mua hàng.</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-[380px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm công việc mua hàng..."
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
                            <div className="h-4 w-1 bg-orange-600 rounded-full" />
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
