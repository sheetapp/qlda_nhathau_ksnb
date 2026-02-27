'use client'

import { useState, useMemo, useRef } from 'react'
import {
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    eachWeekOfInterval,
    format,
    differenceInDays,
    isWeekend,
    isSameMonth,
    parseISO,
    startOfWeek,
    endOfWeek,
    addDays,
} from 'date-fns'
import { vi } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarDays, Calendar, Plus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface GanttItem {
    id: string
    label: string
    subLabel?: string
    startDate: string | null
    endDate: string | null
    progress?: number      // 0–100
    status?: string
    color?: string
    group?: string         // group header label
    isGroup?: boolean      // true → render as group header row
    projectId?: string     // project association
}

interface GanttChartProps {
    items: GanttItem[]
    viewMode?: 'week' | 'month'
    onAddItem?: () => void
    onAddTask?: (itemId: string, itemLabel: string) => void
    selectedId?: string | null
    onSelect?: (item: GanttItem | null) => void
    addItemLabel?: string
}

export const STATUS_COLORS: Record<string, string> = {
    'Chờ thực hiện': 'bg-slate-400',
    'Chưa thực hiện': 'bg-slate-400',
    'Đang thực hiện': 'bg-blue-500',
    'Tạm dừng': 'bg-amber-400',
    'Hủy': 'bg-red-500',
    'Hoàn tất': 'bg-emerald-500',
    'Hoàn thành': 'bg-emerald-500',
    'default': 'bg-blue-500',
}

const LABEL_COL_W = 220 // px, width of frozen left column
const ROW_H = 40        // px

function getColor(item: GanttItem): string {
    if (item.color) return item.color
    if (item.isGroup) return 'bg-slate-700'
    if (item.status && STATUS_COLORS[item.status]) return STATUS_COLORS[item.status]
    return STATUS_COLORS['default']
}

export function GanttChart({
    items,
    viewMode: initialView = 'month',
    onAddItem,
    onAddTask,
    selectedId,
    onSelect,
    addItemLabel = 'Thêm hạng mục mới'
}: GanttChartProps) {
    const [viewMode, setViewMode] = useState<'week' | 'month'>(initialView)
    const [baseDate, setBaseDate] = useState<Date>(new Date())
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
    const [tooltip, setTooltip] = useState<{ item: GanttItem; x: number; y: number } | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    const toggleGroup = (groupId: string) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev)
            if (next.has(groupId)) next.delete(groupId)
            else next.add(groupId)
            return next
        })
    }

    const validItems = useMemo(() => {
        return items.filter(item => {
            if (item.startDate && item.endDate) return true
            if (item.isGroup) return true
            return false
        }).filter(item => {
            if (!item.group || item.isGroup) return true
            return !collapsedGroups.has(item.group)
        })
    }, [items, collapsedGroups])

    // Compute visible date range: for 'month' show 3 months, for 'week' show 6 weeks
    const { rangeStart, rangeEnd, days } = useMemo(() => {
        if (viewMode === 'week') {
            const s = startOfWeek(baseDate, { weekStartsOn: 1 })
            const e = endOfWeek(addDays(s, 41), { weekStartsOn: 1 }) // 6 weeks
            return {
                rangeStart: s,
                rangeEnd: e,
                days: eachDayOfInterval({ start: s, end: e }),
            }
        } else {
            const s = startOfMonth(subMonths(baseDate, 0))
            const e = endOfMonth(addMonths(s, 2))
            return {
                rangeStart: s,
                rangeEnd: e,
                days: eachDayOfInterval({ start: s, end: e }),
            }
        }
    }, [baseDate, viewMode])

    const totalDays = days.length
    const dayWidth = viewMode === 'week' ? 32 : 22 // px per day
    const totalTimelineW = totalDays * dayWidth

    // Month groups for header
    const monthGroups = useMemo(() => {
        const groups: { label: string; start: number; count: number }[] = []
        let currentMonth = ''
        let start = 0
        days.forEach((d, i) => {
            const m = format(d, 'MM/yyyy')
            if (m !== currentMonth) {
                if (currentMonth !== '') groups.push({ label: format(days[start], 'MMMM yyyy', { locale: vi }), start, count: i - start })
                currentMonth = m
                start = i
            }
        })
        groups.push({ label: format(days[start], 'MMMM yyyy', { locale: vi }), start, count: days.length - start })
        return groups
    }, [days])

    // Compute bar position for an item
    function getBarStyle(item: GanttItem): React.CSSProperties | null {
        if (!item.startDate && !item.endDate) return null
        const start = item.startDate ? parseISO(item.startDate) : rangeStart
        const end = item.endDate ? parseISO(item.endDate) : start

        const offsetDays = differenceInDays(start, rangeStart)
        const durationDays = Math.max(1, differenceInDays(end, start) + 1)

        const left = offsetDays * dayWidth
        const width = durationDays * dayWidth

        return { left: `${left}px`, width: `${Math.max(width, dayWidth)}px` }
    }

    const navigate = (dir: -1 | 1) => {
        if (viewMode === 'month') setBaseDate(d => addMonths(d, dir * 2))
        else setBaseDate(d => addDays(d, dir * 14))
    }

    return (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm select-none">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-muted/20">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-[13px] font-semibold text-slate-700 min-w-[120px] text-center">
                        {viewMode === 'month'
                            ? `${format(rangeStart, 'MM/yyyy')} – ${format(rangeEnd, 'MM/yyyy')}`
                            : `Tuần ${format(rangeStart, 'dd/MM')} – ${format(rangeEnd, 'dd/MM/yyyy')}`
                        }
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => navigate(1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-3 text-xs rounded-lg" onClick={() => setBaseDate(new Date())}>
                        Hôm nay
                    </Button>
                </div>
                <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                    <button
                        onClick={() => setViewMode('week')}
                        className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all',
                            viewMode === 'week' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                        )}
                    >
                        <CalendarDays className="h-3.5 w-3.5" /> Tuần
                    </button>
                    <button
                        onClick={() => setViewMode('month')}
                        className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all',
                            viewMode === 'month' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                        )}
                    >
                        <Calendar className="h-3.5 w-3.5" /> Tháng
                    </button>
                </div>
            </div>

            {validItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <CalendarDays className="h-10 w-10 opacity-30 mb-2" />
                    <p className="text-sm">Không có dữ liệu ngày để hiển thị Gantt</p>
                    <p className="text-xs mt-1">Hãy nhập ngày bắt đầu / kết thúc cho các mục</p>
                </div>
            ) : (
                <div className="flex overflow-hidden">
                    {/* Frozen left column */}
                    <div className="shrink-0 border-r border-border/40 bg-card z-10" style={{ width: LABEL_COL_W }}>
                        {/* Header spacer */}
                        <div className="border-b border-border/40 bg-muted/30" style={{ height: ROW_H * 2 }}>
                            <div className="flex items-center h-full px-3">
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Hạng mục / Công việc</span>
                            </div>
                        </div>
                        {/* Rows */}
                        {validItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => onSelect?.(item)}
                                className={cn(
                                    'flex flex-col justify-center px-3 border-b border-border/30 overflow-hidden cursor-pointer selection-none',
                                    item.isGroup ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-muted/30 transition-colors',
                                    selectedId === item.id && 'bg-primary/5 border-l-2 border-l-primary'
                                )}
                                style={{ height: ROW_H }}
                            >
                                {item.isGroup ? (
                                    <div className="flex items-center justify-between group/row">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleGroup(item.label)
                                                }}
                                                className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                                            >
                                                {collapsedGroups.has(item.label) ? (
                                                    <ChevronRight className="h-3 w-3 text-slate-400" />
                                                ) : (
                                                    <ChevronDown className="h-3 w-3 text-slate-400" />
                                                )}
                                            </button>
                                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide truncate">{item.label}</span>
                                        </div>
                                        {onAddTask && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onAddTask(item.id, item.label)
                                                }}
                                                className="opacity-0 group-hover/row:opacity-100 p-1 hover:bg-primary/10 rounded-md text-primary transition-all"
                                                title="Thêm công việc vào hạng mục này"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-[12px] font-medium text-slate-700 truncate leading-tight">{item.label}</span>
                                        {item.subLabel && (
                                            <span className="text-[10px] text-slate-400 truncate">{item.subLabel}</span>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}

                        {/* Inline Add Button for Items */}
                        {onAddItem && (
                            <button
                                onClick={onAddItem}
                                className="w-full flex items-center gap-2 px-3 hover:bg-muted/50 text-[12px] font-medium text-primary border-b border-border/30 transition-colors"
                                style={{ height: ROW_H }}
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>{addItemLabel}</span>
                            </button>
                        )}
                    </div>

                    {/* Scrollable timeline */}
                    <div ref={scrollRef} className="overflow-x-auto flex-1 relative" style={{ maxHeight: `${(validItems.length + (onAddItem ? 1 : 0) + 2) * ROW_H + ROW_H * 2}px` }}>
                        <div style={{ width: totalTimelineW, minWidth: '100%' }}>
                            {/* Month header */}
                            <div className="flex border-b border-border/40 bg-muted/30 sticky top-0 z-10" style={{ height: ROW_H }}>
                                {monthGroups.map((mg, i) => (
                                    <div
                                        key={i}
                                        className="border-r border-border/30 flex items-center justify-center"
                                        style={{ width: mg.count * dayWidth, minWidth: mg.count * dayWidth }}
                                    >
                                        <span className="text-[11px] font-semibold text-slate-600 capitalize truncate px-2">{mg.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Day header */}
                            <div className="flex border-b border-border/40 sticky top-[40px] z-10 bg-muted/20">
                                {days.map((d, i) => {
                                    const isToday = format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                                    const weekend = isWeekend(d)
                                    return (
                                        <div
                                            key={i}
                                            className={cn(
                                                'border-r border-border/20 flex items-center justify-center shrink-0',
                                                weekend ? 'bg-slate-50/80 dark:bg-slate-800/30' : '',
                                                isToday ? 'bg-blue-50 dark:bg-blue-900/20' : '',
                                            )}
                                            style={{ width: dayWidth, height: ROW_H }}
                                        >
                                            <span className={cn(
                                                'text-[9px] font-medium',
                                                isToday ? 'text-blue-600 font-bold' : weekend ? 'text-slate-300' : 'text-slate-400'
                                            )}>
                                                {viewMode === 'week' ? format(d, 'EEE\ndd', { locale: vi }) : format(d, 'd')}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Today line */}
                            {(() => {
                                const todayOffset = differenceInDays(new Date(), rangeStart)
                                if (todayOffset < 0 || todayOffset > totalDays) return null
                                return (
                                    <div
                                        className="absolute top-0 bottom-0 w-px bg-blue-500/60 z-20 pointer-events-none"
                                        style={{ left: (todayOffset + 0.5) * dayWidth + LABEL_COL_W - LABEL_COL_W }}
                                    />
                                )
                            })()}

                            {/* Grid + Bars */}
                            <div className="relative">
                                {/* Background grid */}
                                <div className="absolute inset-0 flex pointer-events-none">
                                    {days.map((d, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                'border-r border-border/20 shrink-0',
                                                isWeekend(d) ? 'bg-slate-50/60 dark:bg-slate-800/20' : '',
                                                format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
                                            )}
                                            style={{ width: dayWidth, height: (validItems.length + (onAddItem ? 1 : 0)) * ROW_H }}
                                        />
                                    ))}
                                </div>

                                {/* Rows with bars */}
                                {validItems.map((item) => {
                                    const barStyle = getBarStyle(item)
                                    const color = getColor(item)
                                    return (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                'relative border-b border-border/30 flex items-center',
                                                item.isGroup ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''
                                            )}
                                            style={{ height: ROW_H }}
                                        >
                                            {!item.isGroup && barStyle && (
                                                <div
                                                    className={cn('absolute rounded-md flex items-center overflow-hidden cursor-pointer shadow-sm transition-all hover:brightness-110 hover:shadow-md', color)}
                                                    style={{ ...barStyle, top: 8, height: ROW_H - 16 }}
                                                    onMouseEnter={(e) => setTooltip({ item, x: e.clientX, y: e.clientY })}
                                                    onMouseMove={(e) => setTooltip({ item, x: e.clientX, y: e.clientY })}
                                                    onMouseLeave={() => setTooltip(null)}
                                                >
                                                    {/* Progress overlay */}
                                                    {item.progress !== undefined && item.progress > 0 && (
                                                        <div
                                                            className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-l-md"
                                                            style={{ width: `${Math.min(item.progress, 100)}%` }}
                                                        />
                                                    )}
                                                    <span className="px-2 text-[10px] text-white font-semibold truncate z-10">
                                                        {item.label}
                                                        {item.progress !== undefined ? ` (${Math.round(item.progress)}%)` : ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                {/* Spacer for Add Button row in timeline */}
                                {onAddItem && (
                                    <div className="border-b border-border/30" style={{ height: ROW_H }} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 pointer-events-none bg-slate-900 text-white text-[12px] rounded-xl px-3 py-2.5 shadow-xl border border-slate-700 max-w-[220px]"
                    style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
                >
                    <p className="font-semibold truncate">{tooltip.item.label}</p>
                    {tooltip.item.subLabel && <p className="text-slate-400 text-[11px]">{tooltip.item.subLabel}</p>}
                    <div className="mt-1.5 space-y-0.5 text-slate-300 text-[11px]">
                        {tooltip.item.startDate && (
                            <p>📅 Bắt đầu: {format(parseISO(tooltip.item.startDate), 'dd/MM/yyyy')}</p>
                        )}
                        {tooltip.item.endDate && (
                            <p>🏁 Kết thúc: {format(parseISO(tooltip.item.endDate), 'dd/MM/yyyy')}</p>
                        )}
                        {tooltip.item.startDate && tooltip.item.endDate && (
                            <p>⏱ Thời gian: {differenceInDays(parseISO(tooltip.item.endDate), parseISO(tooltip.item.startDate)) + 1} ngày</p>
                        )}
                        {tooltip.item.progress !== undefined && (
                            <p>✅ Tiến độ: {Math.round(tooltip.item.progress)}%</p>
                        )}
                        {tooltip.item.status && (
                            <p>🔖 Trạng thái: {tooltip.item.status}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
