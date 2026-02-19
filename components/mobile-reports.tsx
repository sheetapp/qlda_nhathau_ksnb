'use client'

import { BarChart3, PieChart, LineChart, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileReports() {
    const mockReports = [
        { name: 'Tiến độ dự án', icon: TrendingUp, color: 'bg-emerald-500' },
        { name: 'Dòng tiền outflow', icon: LineChart, color: 'bg-rose-500' },
        { name: 'Cấu trúc chi phí', icon: PieChart, color: 'bg-blue-500' },
    ]

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden">
            <div className="px-1">
                <h1 className="text-xl font-bold text-slate-900">Báo cáo & Thống kê</h1>
                <p className="text-[13px] text-slate-500 font-medium mt-1">Tổng hợp dữ liệu theo thời gian thực</p>
            </div>

            <div className="space-y-4 pb-20">
                {mockReports.map((report) => (
                    <div key={report.name} className="flex flex-col gap-4 p-1 focus-within:ring-2 ring-primary/20 rounded-[2.5rem] transition-all">
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", report.color)}>
                                    <report.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[15px] font-bold text-slate-800">{report.name}</h3>
                                    <p className="text-[11px] text-slate-400 font-medium tracking-tight">Cập nhật 5 phút trước</p>
                                </div>
                            </div>

                            {/* Visual placeholder for report content */}
                            <div className="h-32 w-full bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Đang khởi tạo biểu đồ...</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

