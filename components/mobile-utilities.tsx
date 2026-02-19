'use client'

import { cn } from '@/lib/utils'
import {
    FolderKanban,
    Layers,
    CheckSquare,
    Users,
    Package,
    Settings2,
    ChevronRight,
    ShieldCheck
} from 'lucide-react'
import Link from 'next/link'

export function MobileUtilities() {
    const sections = [
        {
            title: 'Quản lý Dự án',
            items: [
                { name: 'Danh sách dự án', href: '/dashboard/projects', icon: FolderKanban, detail: 'Quản lý thông tin, tiến độ dự án' },
                { name: 'Hạng mục dự án', href: '/dashboard/project-items', icon: Layers, detail: 'Danh sách hạng mục công việc' },
                { name: 'Danh sách công việc', href: '/dashboard/tasks', icon: CheckSquare, detail: 'Theo dõi chi tiết công việc' },
            ]
        },
        {
            title: 'Hệ thống & Đối tác',
            items: [
                { name: 'Nhà cung cấp', href: '/dashboard/system/suppliers', icon: Users, detail: 'Quản lý thông tin đối tác' },
                { name: 'Tài nguyên vật tư', href: '/dashboard/resources', icon: Package, detail: 'Quản lý máy móc, thiết bị' },
                { name: 'Kiểm soát nội bộ', href: '/dashboard/control', icon: ShieldCheck, detail: 'Hệ thống báo cáo quản trị' },
                { name: 'Cài đặt hệ thống', href: '/dashboard/system', icon: Settings2, detail: 'Tổ chức, phòng ban, phân quyền' },
            ]
        }
    ]

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="px-1">
                <h1 className="text-xl font-bold text-slate-900">Tiện ích hệ thống</h1>
                <p className="text-[13px] text-slate-500 font-medium mt-1">Truy cập nhanh các chức năng quản lý</p>
            </div>

            <div className="space-y-8 pb-20">
                {sections.map((section) => (
                    <div key={section.title} className="space-y-4">
                        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.15em] px-1">
                            {section.title}
                        </h3>
                        <div className="space-y-2">
                            {section.items.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-3xl active:bg-slate-50 transition-all shadow-sm"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <item.icon className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-0.5">
                                        <span className="text-[14px] font-bold text-slate-800">{item.name}</span>
                                        <span className="text-[12px] text-slate-400 font-normal leading-relaxed">{item.detail}</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300" />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
