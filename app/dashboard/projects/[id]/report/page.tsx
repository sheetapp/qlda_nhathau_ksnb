import { ArrowLeft, Calendar, FileText, TrendingUp, AlertCircle, CheckCircle2, Clock, BarChart3, Wallet, ArrowRight, TrendingDown, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { getProjectReportData } from '@/lib/actions/projects'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

// Custom SVG Gauge Component (Refined)
const Gauge = ({ value, label, size = 160 }: { value: number; label: string; size?: number }) => {
    const radius = 70
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference

    return (
        <div className="flex flex-col items-center gap-2 relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 160 160" className="transform -rotate-90">
                <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{Math.round(value)}%</span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
        </div>
    )
}

// Custom Comparison Bar Chart (Revenue vs Cost vs Profit)
const ComparisonChart = ({ revenue, cost, profit }: { revenue: number, cost: number, profit: number }) => {
    const max = Math.max(revenue, cost, Math.abs(profit), 1)
    const h = 120
    const scale = h / max

    return (
        <div className="flex items-end gap-8 h-[160px] px-4">
            <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 bg-blue-500/20 border border-blue-500/30 rounded-t-lg transition-all duration-1000" style={{ height: revenue * scale }} />
                <span className="text-[10px] font-medium text-slate-500 uppercase">Hợp đồng</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 bg-amber-500/20 border border-amber-500/30 rounded-t-lg transition-all duration-1000" style={{ height: cost * scale }} />
                <span className="text-[10px] font-medium text-slate-500 uppercase">Chi phí</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
                <div className={`w-12 ${profit >= 0 ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-red-500/20 border-red-500/30'} rounded-t-lg transition-all duration-1000`} style={{ height: Math.abs(profit) * scale }} />
                <span className="text-[10px] font-medium text-slate-500 uppercase">Lợi nhuận</span>
            </div>
        </div>
    )
}

// Custom Cashflow Line Chart (Inflow vs Outflow)
const CashflowChart = ({ data }: { data: { month: string, inflow: number, outflow: number }[] }) => {
    if (!data || data.length === 0) return <div className="h-40 flex items-center justify-center text-slate-400 text-xs italic">Chưa có dữ liệu dòng tiền</div>

    const max = Math.max(...data.map(d => Math.max(d.inflow, d.outflow)), 1)
    const w = 400
    const h = 120
    const padding = 20

    const getX = (i: number) => (i / (data.length - 1)) * (w - padding * 2) + padding
    const getY = (v: number) => h - (v / max) * (h - padding * 2) - padding

    const inflowPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.inflow)}`).join(' ')
    const outflowPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.outflow)}`).join(' ')

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40 overflow-visible">
                {/* Horizontal Guide Lines */}
                {[0, 0.5, 1].map((p, i) => (
                    <line key={i} x1={padding} y1={getY(max * p)} x2={w - padding} y2={getY(max * p)} stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800" strokeDasharray="4" />
                ))}

                {/* Inflow Line (Emerald) */}
                <path d={inflowPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm" />
                {/* Outflow Line (Rose) */}
                <path d={outflowPath} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm" />

                {/* Points */}
                {data.map((d, i) => (
                    <g key={i}>
                        <circle cx={getX(i)} cy={getY(d.inflow)} r="3" fill="#10b981" />
                        <circle cx={getX(i)} cy={getY(d.outflow)} r="3" fill="#f43f5e" />
                        <text x={getX(i)} y={h} textAnchor="middle" className="text-[8px] fill-slate-400 font-medium">{d.month.split('-')[1]}/{d.month.split('-')[0].slice(2)}</text>
                    </g>
                ))}
            </svg>
            <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-medium text-slate-500 uppercase">Tiền vào (Thu)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-[10px] font-medium text-slate-500 uppercase">Tiền ra (Chi)</span>
                </div>
            </div>
        </div>
    )
}

interface Params {
    id: string
}

export default async function ProjectReportPage(props: { params: Promise<Params> }) {
    const params = await props.params
    const id = params.id
    const reportData = await getProjectReportData(id)

    if (!reportData) notFound()

    const { project, financials, categoryAnalysis, taskStatusCounts, topItems, pendingPYCs, chartData } = reportData

    const formatCurrency = (val: number) => {
        if (Math.abs(val) >= 1000000000) return (val / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ'
        return (val / 1000000).toLocaleString('vi-VN') + ' triệu'
    }

    return (
        <div className="p-8 pb-16 animate-in fade-in duration-700 min-h-screen bg-[#fcfcfd] dark:bg-slate-950 font-sans selection:bg-primary/10">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-10">
                <Link
                    href={`/dashboard/projects/${id}`}
                    className="flex items-center text-[13px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors group px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Quay lại dự án
                </Link>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold uppercase tracking-widest bg-white dark:bg-slate-900 px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                    <BarChart3 className="h-3.5 w-3.5 text-primary" />
                    Contractor Analytics Platform
                </div>
            </div>

            {/* Title Section */}
            <div className="mb-12">
                <div className="flex items-baseline gap-4 mb-2">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                        {project.project_name}
                    </h1>
                    <Badge variant="outline" className="rounded-full border-slate-200 dark:border-slate-800 text-slate-500 bg-white dark:bg-slate-900 text-[10px] font-medium px-3 h-6">Live Status</Badge>
                </div>
                <p className="text-[14px] text-slate-500 max-w-2xl leading-relaxed">
                    Hệ thống báo cáo nhà thầu: Giá trị hợp đồng, quản trị dòng tiền (In/Out) và phân tích rủi ro tài chính.
                </p>
            </div>

            {/* Primary Stats - Executive Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Giá trị hợp đồng', value: financials.contractValue, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Doanh thu đã thu', value: financials.totalInflow, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Chi phí đã chi', value: financials.totalOutflow, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                    { label: 'Dòng tiền ròng', value: financials.netCashflow, icon: Wallet, color: financials.netCashflow >= 0 ? 'text-blue-600' : 'text-amber-600', bg: 'bg-slate-50 dark:bg-slate-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                        <div className={`p-2 w-fit rounded-lg ${stat.bg} mb-4`}>
                            <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                        </div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">{stat.label}</p>
                        <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{formatCurrency(stat.value)}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Financial Health Analysis */}
                <div className="lg:col-span-2 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Phân tích Hiệu quả Hợp đồng</h2>
                        <div className="flex items-center gap-4 text-[11px] font-medium">
                            <div className="flex items-center gap-1.5">
                                <span className="text-slate-400">Tỉ lệ lãi dự kiến:</span>
                                <span className="text-emerald-600">{Math.round((financials.profit / (financials.contractValue || 1)) * 100)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <ComparisonChart
                            revenue={financials.contractValue}
                            cost={financials.committedCost}
                            profit={financials.profit}
                        />
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-[11px] font-medium text-slate-400 uppercase mb-2">Lợi nhuận cam kết (HĐ - PYC)</p>
                                <p className="text-xl font-semibold text-slate-900 dark:text-slate-50">{formatCurrency(financials.profit)}</p>
                            </div>
                            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/10">
                                <p className="text-[11px] font-medium text-emerald-600/70 uppercase mb-2">Lợi nhuận thực tế (HĐ - DNTT)</p>
                                <p className="text-xl font-semibold text-emerald-600">{formatCurrency(financials.actualProfit)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress & Timeline */}
                <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col items-center justify-between">
                    <div className="w-full flex justify-between items-center mb-6">
                        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Tiến độ thực hiện</h2>
                        <Clock className="h-4 w-4 text-slate-300" />
                    </div>
                    <Gauge value={project.progress_percent || 0} label="Hoàn thành" />
                    <div className="w-full mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex justify-between items-center text-[12px]">
                            <span className="text-slate-400 font-medium">Bàn giao dự kiến</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {project.end_date ? new Date(project.end_date).toLocaleDateString('vi-VN') : '--'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-[12px]">
                            <span className="text-slate-400 font-medium">Thời gian còn lại</span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                                {project.end_date ? Math.max(0, Math.ceil((new Date(project.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : '0'} ngày
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Cashflow Trend */}
                <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
                    <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500 mb-8">Xu hướng Dòng tiền (Cashflow)</h2>
                    <CashflowChart data={chartData} />
                </div>

                {/* Task Distribution */}
                <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
                    <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500 mb-8">Trạng thái Công việc</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(taskStatusCounts).map(([status, count], i) => {
                            const styles = [
                                'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-600',
                                'bg-blue-50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/10 text-blue-600',
                                'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 text-emerald-600',
                                'bg-rose-50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/10 text-rose-600'
                            ]
                            return (
                                <div key={i} className={`p-6 rounded-2xl border ${styles[i]} flex flex-col items-center justify-center gap-1`}>
                                    <span className="text-3xl font-semibold tracking-tight">{count}</span>
                                    <span className="text-[10px] font-medium uppercase tracking-widest opacity-60">{status}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Pending Requests & Procurement */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Phiếu yêu cầu mua vật tư & chi phí (Level 3)</h2>
                        <Button variant="ghost" size="sm" asChild className="text-[11px] font-semibold text-primary hover:bg-primary/5 rounded-lg px-3">
                            <Link href={`/dashboard/projects/${id}?tab=pyc`}>Tất cả yêu cầu <ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Link>
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {pendingPYCs.length === 0 ? (
                            <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                                <p className="text-[13px] text-slate-400 italic">Hiện không có phiếu yêu cầu nào đang chờ xử lý.</p>
                            </div>
                        ) : (
                            pendingPYCs.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl group hover:border-primary/20 transition-all cursor-pointer">
                                    <div className="space-y-1.5">
                                        <p className="text-[14px] font-medium text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{p.title}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase">{p.request_id}</span>
                                            <span className="text-[10px] font-medium text-slate-400">•</span>
                                            <span className="text-[10px] font-medium text-slate-400">{new Date(p.created_at).toLocaleDateString('vi-VN')}</span>
                                            {p.priority === 'Khẩn cấp' && <Badge className="bg-rose-500/10 text-rose-500 text-[9px] font-bold border-none h-4 px-1.5 px-1.5">Khẩn cấp</Badge>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(p.total_amount)}</p>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Giá trị dự kiến</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
                    <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500 mb-8">Cảnh báo hạng mục Chi phí</h2>
                    <div className="space-y-5">
                        {topItems.map((item, i) => (
                            <div key={i} className="flex flex-col gap-1 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200 truncate">{item.name}</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-[14px] font-semibold text-slate-900 dark:text-slate-50">{formatCurrency(item.total)}</span>
                                    <span className="text-[10px] font-medium text-slate-400 uppercase">{item.requestId}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {topItems.length === 0 && <p className="text-xs text-slate-400 italic text-center py-8">Chưa có dữ liệu chi tiết.</p>}
                </div>
            </div>

            {/* Footer Insights */}
            <div className="mt-16 flex justify-center text-[10px] font-medium text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">
                Contractor Management Information System • {new Date().getFullYear()}
            </div>
        </div>
    )
}
