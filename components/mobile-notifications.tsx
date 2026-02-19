'use client'

import { Bell, Info } from 'lucide-react'

export function MobileNotifications() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <div className="px-1">
                <h1 className="text-xl font-bold text-slate-900">Thông báo</h1>
                <p className="text-[13px] text-slate-500 font-medium mt-1">Cập nhật những diễn biến mới nhất</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="relative">
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                        <Bell className="h-8 w-8 text-slate-200" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[15px] font-bold text-slate-700">Tạm thời hết tin!</p>
                    <p className="text-[12px] text-slate-400 font-medium max-w-[200px] leading-relaxed">
                        Bạn sẽ nhận được thông báo khi có công việc mới hoặc các phê duyệt cần xử lý.
                    </p>
                </div>
            </div>
        </div>
    )
}
