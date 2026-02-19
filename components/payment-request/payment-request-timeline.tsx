'use client'

import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, Clock, ArrowDown } from 'lucide-react'

interface TimelineItem {
    status: string
    title: string
    date: string
    user?: string
    message?: string
    isLast?: boolean
    isCompleted?: boolean
}

interface PaymentRequestTimelineProps {
    items: TimelineItem[]
    className?: string
}

export function PaymentRequestTimeline({ items, className }: PaymentRequestTimelineProps) {
    return (
        <div className={cn("space-y-0", className)}>
            {items.map((item, index) => (
                <div key={index} className="relative pl-8 pb-8 group last:pb-0">
                    {/* Line */}
                    {!item.isLast && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800 transition-colors group-hover:bg-primary/20" />
                    )}

                    {/* Dot */}
                    <div className={cn(
                        "absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 transition-all",
                        item.isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                    )}>
                        {item.isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <h5 className={cn(
                                "text-[13px] font-semibold transition-colors",
                                item.isCompleted ? "text-slate-900 dark:text-slate-100" : "text-slate-500"
                            )}>
                                {item.title}
                            </h5>
                            <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-full">
                                {item.date}
                            </span>
                        </div>
                        {item.user && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{item.user}</span>
                            </p>
                        )}
                        {item.message && (
                            <p className="text-[11px] text-slate-400 italic bg-slate-50/50 dark:bg-slate-900/50 p-2 rounded-lg mt-1 border border-slate-100/50 dark:border-slate-800/50">
                                "{item.message}"
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
