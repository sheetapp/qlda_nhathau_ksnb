import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, FolderKanban, CheckCircle2, FileText, Wallet, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskList } from '@/components/tasks/task-list'
import { PersonnelList } from '@/components/personnel/personnel-list'
import { ResourceList } from '@/components/resources/resource-list'
import { PYCList } from '@/components/pyc/pyc-list'
import { PaymentRequestList } from '@/components/payment-request/payment-request-list'
import { PaymentRequestContainer } from '@/components/payment-request/payment-request-container'
import { ProjectInflowTab } from '@/components/projects/financials/project-inflow-tab'
import { ProjectOutflowTab } from '@/components/projects/financials/project-outflow-tab'
import { ProjectTabsNavigation } from '@/components/projects/project-tabs-navigation'
import { SupplierList } from '@/components/system/supplier-list'
import { ProjectItemList } from '@/components/projects/project-item-list'
import {
    getProjectById,
    getProjects,
    getProjectReportData
} from '@/lib/actions/projects'
import { getTasksByProject } from '@/lib/actions/tasks'
import { getPersonnelByProject } from '@/lib/actions/personnel'
import { getResourcesByProject } from '@/lib/actions/resources'
import { getPYCsByProject } from '@/lib/actions/pyc'
import { getPaymentRequests } from '@/lib/actions/payment-requests'
import { getProjectItems } from '@/lib/actions/project-items'

// Fix for Next.js 15 params type
type Params = Promise<{ id: string }>
type SearchParams = Promise<{ tab?: string }>

export default async function ProjectDetailPage(props: {
    params: Params,
    searchParams: SearchParams
}) {
    const params = await props.params
    const searchParams = await props.searchParams
    const projectId = params.id
    const activeTab = searchParams.tab || 'dashboard'

    const [project, tasks, personnel, resources, pycs, dnttResult, allProjects, reportData, projectItems] = await Promise.all([
        getProjectById(projectId),
        getTasksByProject(projectId),
        getPersonnelByProject(projectId),
        getResourcesByProject(projectId),
        getPYCsByProject(projectId),
        getPaymentRequests(projectId, 1, 100),
        getProjects(),
        getProjectReportData(projectId),
        getProjectItems(projectId)
    ])

    if (!project) {
        notFound()
    }

    const { financials, chartData, taskStatusCounts, topItems, pendingPYCs } = reportData

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Đang thực hiện': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900'
            case 'Hoàn thành': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900'
            case 'Tạm dừng': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900'
            default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
        }
    }

    return (
        <div className="p-6 pt-2 animate-in fade-in duration-500 space-y-6 bg-[#fcfcfd] dark:bg-slate-950 font-sans">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link
                    href="/dashboard/projects"
                    className="flex items-center text-[13px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all w-fit group"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Quay lại dự án
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200/60 dark:border-slate-800/60 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                                {project.project_name}
                            </h1>
                            <Badge variant="outline" className={`rounded-xl border-none font-medium px-3 py-1 ${getStatusColor(project.status || '')}`}>
                                {project.status || 'Chưa xác định'}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-y-3 gap-x-8 text-[13px] text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2 font-mono text-[11px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 px-2.5 py-1 rounded-lg">
                                <FolderKanban className="h-3.5 w-3.5 text-primary/70" />
                                {project.project_id}
                            </div>
                            {project.manager_name && (
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary/60" />
                                    <span>QL: <span className="font-medium text-slate-900 dark:text-slate-100">{project.manager_name}</span></span>
                                </div>
                            )}
                            {(project.start_date || project.end_date) && (
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Calendar className="h-4 w-4 text-primary/60" />
                                    <span>
                                        {project.start_date ? new Date(project.start_date).toLocaleDateString('vi-VN') : '...'}
                                        {' - '}
                                        {project.end_date ? new Date(project.end_date).toLocaleDateString('vi-VN') : '...'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col gap-1 min-w-[200px]">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Giá trị hợp đồng</span>
                            <div className="flex items-center gap-3">
                                <Wallet className="h-4 w-4 text-primary" />
                                <span className="text-base font-semibold text-slate-900 dark:text-slate-50">
                                    {project.total_planned_budget?.toLocaleString('vi-VN')} {project.currency_code || 'VND'}
                                </span>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="h-12 rounded-2xl border-slate-200/60 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm px-5">
                            <Link href={`/dashboard/projects/${projectId}/report`} className="flex items-center gap-2.5">
                                <BarChart3 className="h-4 w-4 text-primary/70" />
                                <span className="font-medium">Phân tích Báo cáo</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs & Content */}
            <ProjectTabsNavigation
                activeTab={activeTab}
                tabs={[
                    { value: 'dashboard', label: 'Dòng tiền ròng' },
                    { value: 'inflow', label: 'Dòng Thu', count: reportData.financials.totalInflow > 0 ? 1 : 0 },
                    { value: 'outflow', label: 'Dòng Chi' },
                    { value: 'items', label: 'Hạng mục', count: projectItems?.length || 0 },
                    { value: 'tasks', label: 'Công việc', count: tasks?.count || 0 },
                    { value: 'personnel', label: 'Nhân sự', count: personnel?.count || 0 },
                    { value: 'resources', label: 'Vật tư', count: resources?.count || 0 },
                    { value: 'suppliers', label: 'Nhà cung cấp' },
                ]}
            />

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Giá trị hợp đồng', value: financials.contractValue, color: 'text-indigo-600' },
                                { label: 'Tổng tiền thu', value: financials.totalInflow, color: 'text-emerald-600' },
                                { label: 'Tổng tiền chi', value: financials.totalOutflow, color: 'text-rose-600' },
                                { label: 'Dòng tiền ròng', value: financials.netCashflow, color: financials.netCashflow >= 0 ? 'text-blue-600' : 'text-amber-600' },
                            ].map((stat, i) => (
                                <div key={i} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                                    <p className={`text-xl font-bold tracking-tight ${stat.color}`}>
                                        {(stat.value / 1000000).toLocaleString('vi-VN')} <span className="text-[10px] opacity-70 ml-0.5">Tr.đ</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Xu hướng Dòng tiền (Quick View)</h2>
                                <Link href={`/dashboard/projects/${projectId}/report`} className="text-[11px] font-medium text-primary hover:underline">Xem báo cáo đầy đủ</Link>
                            </div>
                            <div className="h-48 flex items-center justify-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                                Dữ liệu đồ thị tích hợp
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'inflow' && (
                    <ProjectInflowTab projectId={projectId} />
                )}

                {activeTab === 'outflow' && (
                    <ProjectOutflowTab
                        projectId={projectId}
                        pycs={pycs}
                        dnttData={dnttResult.data}
                        dnttCount={dnttResult.count}
                        allProjects={allProjects}
                        personnel={personnel.data}
                    />
                )}

                {activeTab === 'items' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                        <ProjectItemList initialItems={projectItems} projectId={projectId} projects={allProjects} />
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                        <TaskList projects={allProjects} projectId={projectId} />
                    </div>
                )}

                {activeTab === 'personnel' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden text-slate-900 dark:text-slate-100">
                        <PersonnelList initialUsers={personnel.data} projects={allProjects} projectId={projectId} />
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                        <ResourceList users={personnel.data} projects={allProjects} projectId={projectId} />
                    </div>
                )}

                {activeTab === 'suppliers' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                        <SupplierList projectId={projectId} />
                    </div>
                )}
            </div>
        </div>
    )
}
