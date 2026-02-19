'use client'

import { cn } from '@/lib/utils'
import {
    User,
    Settings,
    Bell,
    FileText,
    Wallet,
    LogOut,
    ChevronRight,
    AtSign,
    Briefcase
} from 'lucide-react'
import { LogoutButton } from './logout-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface MobileProfileProps {
    user: any
}

export function MobileProfile({ user }: MobileProfileProps) {
    const menuGroups = [
        {
            title: 'Hồ sơ cá nhân',
            items: [
                { name: 'Chỉnh sửa thông tin', icon: Settings, detail: 'Tên, chức vụ, bộ phận', href: '#' },
                { name: 'Cài đặt thông báo', icon: Bell, detail: 'Quản lý cách nhận tin', href: '#' },
            ]
        },
        {
            title: 'Dữ liệu của tôi',
            items: [
                { name: 'Phiếu yêu cầu của tôi', icon: FileText, detail: 'Các PYC đã lập', href: '/dashboard/pyc' },
                { name: 'Đề nghị thanh toán của tôi', icon: Wallet, detail: 'Các DNTT đã lập', href: '/dashboard/dntt' },
            ]
        }
    ]

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-left-4 duration-500 pb-20">
            {/* Profile Header */}
            <div className="flex flex-col items-center justify-center pt-4 gap-4">
                <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                            {user.full_name?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="text-center">
                    <h1 className="text-xl font-bold text-slate-900 leading-tight">{user.full_name}</h1>
                    <div className="flex items-center justify-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                            <Briefcase className="h-3.5 w-3.5 opacity-50" />
                            {user.position}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                            <AtSign className="h-3.5 w-3.5 opacity-50" />
                            {user.email?.split('@')[0]}
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="space-y-8">
                {menuGroups.map((group) => (
                    <div key={group.title} className="space-y-4">
                        <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.15em] px-1">
                            {group.title}
                        </h3>
                        <div className="space-y-2">
                            {group.items.map((item) => (
                                <button
                                    key={item.name}
                                    className="w-full flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-3xl active:bg-slate-50 transition-all shadow-sm text-left"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                                        <item.icon className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-0.5">
                                        <span className="text-[14px] font-bold text-slate-800">{item.name}</span>
                                        <span className="text-[12px] text-slate-400 font-normal">{item.detail}</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Logout Button */}
                <div className="pt-4">
                    <LogoutButton className="w-full h-14 rounded-3xl border border-rose-100 text-rose-600 hover:bg-rose-50 hover:text-rose-700 bg-rose-50/30 font-bold flex items-center justify-center gap-2">
                        <LogOut className="h-5 w-5" />
                        Đăng xuất tài khoản
                    </LogoutButton>
                </div>
            </div>
        </div>
    )
}
