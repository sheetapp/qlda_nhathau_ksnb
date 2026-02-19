'use client'

import { cn } from '@/lib/utils'
import {
    FolderKanban,
    Layers,
    CheckSquare,
    FileText,
    Wallet,
    Warehouse,
    Plus,
    Search
} from 'lucide-react'
import Link from 'next/link'

interface MobileHomeProps {
    user: any
}

export function MobileHome({ user }: MobileHomeProps) {
    const features = [
        { name: 'Dự án', href: '/dashboard/projects', icon: FolderKanban, color: 'bg-blue-50 text-blue-600 border-blue-100' },
        { name: 'Hạng mục', href: '/dashboard/project-items', icon: Layers, color: 'bg-purple-50 text-purple-600 border-purple-100' },
        { name: 'Công việc', href: '/dashboard/tasks', icon: CheckSquare, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        { name: 'Phiếu yêu cầu', href: '/dashboard/pyc', icon: FileText, color: 'bg-orange-50 text-orange-600 border-orange-100' },
        { name: 'Thanh toán', href: '/dashboard/dntt', icon: Wallet, color: 'bg-rose-50 text-rose-600 border-rose-100' },
        { name: 'Kho vật tư', href: '/dashboard/warehouse', icon: Warehouse, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
    ]

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Chào buổi sáng'
        if (hour < 18) return 'Chào buổi chiều'
        return 'Chào buổi tối'
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-1 px-1">
                <h2 className="text-[14px] font-medium text-slate-500 lowercase leading-relaxed">
                    {getGreeting()},
                </h2>
                <h1 className="text-xl font-bold text-slate-900">
                    {user.full_name}
                </h1>
            </div>

            {/* Quick Actions / Featured Grid */}
            <div className="grid grid-cols-2 gap-3">
                {features.map((feature) => (
                    <Link
                        key={feature.name}
                        href={feature.href}
                        className={cn(
                            "flex flex-col gap-3 p-4 rounded-3xl border transition-all active:scale-95 duration-200",
                            feature.color
                        )}
                    >
                        <div className="w-10 h-10 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-sm">
                            <feature.icon className="h-5 w-5" />
                        </div>
                        <span className="text-[13px] font-bold tracking-tight">
                            {feature.name}
                        </span>
                    </Link>
                ))}
            </div>

            {/* Recent Activity or Placeholder */}
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-bold text-slate-800">Hoạt động gần đây</h3>
                    <Link href="#" className="text-[12px] font-medium text-primary">Xem tất cả</Link>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                        <Plus className="h-5 w-5 text-slate-300" />
                    </div>
                    <p className="text-[12px] text-slate-400 font-medium">Chưa có thông tin mới nào hôm nay</p>
                </div>
            </div>

            <div className="h-20 md:hidden" /> {/* Spacer for bottom nav */}
        </div>
    )
}
