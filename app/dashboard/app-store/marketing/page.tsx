'use client'

import { useState, useEffect } from 'react'
import {
    Megaphone, Mail, MessageSquare, Share2, BarChart2,
    Settings, PenTool, Image as ImageIcon, Globe, Layout,
    Search, Star, HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface MarketingItem {
    id: string
    title: string
    description: string
    icon: any
    color: string
    href: string
}

interface MarketingSection {
    title: string
    items: MarketingItem[]
}

const MARKETING_SECTIONS: MarketingSection[] = [
    {
        title: 'Chiến dịch Marketing',
        items: [
            { id: 'cd', title: 'Chiến dịch', description: 'Tạo chiến dịch, mục tiêu, thời gian, ngân sách.', icon: Megaphone, color: 'text-blue-500 bg-blue-50', href: '/dashboard/app-store/marketing/campaigns' },
            { id: 'email', title: 'Email Marketing', description: 'Gửi email hàng loạt, mẫu, A/B test.', icon: Mail, color: 'text-indigo-500 bg-indigo-50', href: '#' },
            { id: 'sms', title: 'SMS & Thông báo', description: 'SMS, push, tin nhắn trong app.', icon: MessageSquare, color: 'text-purple-500 bg-purple-50', href: '#' },
            { id: 'mxh', title: 'Mạng xã hội', description: 'Lịch đăng bài, đa kênh, lịch sử đăng.', icon: Share2, color: 'text-sky-500 bg-sky-50', href: '#' },
            { id: 'bccd', title: 'Báo cáo chiến dịch', description: 'Hiệu quả, tỷ lệ mở/click, chuyển đổi.', icon: BarChart2, color: 'text-teal-500 bg-teal-50', href: '#' },
            { id: 'tlcd', title: 'Thiết lập chiến dịch', description: 'Kênh, mẫu, giới hạn gửi.', icon: Settings, color: 'text-slate-500 bg-slate-50', href: '#' },
        ]
    },
    {
        title: 'Nội dung & Truyền thông',
        items: [
            { id: 'qlnd', title: 'Quản lý nội dung', description: 'Bài viết, landing page, bài quảng cáo.', icon: PenTool, color: 'text-rose-500 bg-rose-50', href: '#' },
            { id: 'tvts', title: 'Thư viện tài sản', description: 'Hình ảnh, video, file tài sử dụng.', icon: ImageIcon, color: 'text-pink-500 bg-pink-50', href: '#' },
            { id: 'lp', title: 'Landing page', description: 'Tạo trang đích, form đăng ký, theo dõi.', icon: Globe, color: 'text-emerald-500 bg-emerald-50', href: '#' },
            { id: 'form', title: 'Form thu thập lead', description: 'Form nhúng, popup, tích hợp.', icon: Layout, color: 'text-orange-500 bg-orange-50', href: '#' },
            { id: 'tlnd', title: 'Thiết lập nội dung', description: 'Mẫu, thư viện thương hiệu.', icon: Settings, color: 'text-slate-500 bg-slate-50', href: '#' },
        ]
    }
]

export default function MarketingDashboardPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [favorites, setFavorites] = useState<string[]>([])

    // Load favorites from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('marketing-module-favorites')
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
        localStorage.setItem('marketing-module-favorites', JSON.stringify(newFavorites))
    }

    const filteredSections = MARKETING_SECTIONS.map(section => ({
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
                        <div className="p-2.5 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20">
                            <Megaphone className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Marketing</h1>
                            <p className="text-[13px] text-slate-500 mt-0.5">Quản lý chiến dịch, nội dung và truyền thông đa kênh.</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-[380px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm chức năng marketing..."
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
                            <div className="h-4 w-1 bg-rose-500 rounded-full" />
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
