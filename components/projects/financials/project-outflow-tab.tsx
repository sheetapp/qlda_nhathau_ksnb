'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PYCList } from '@/components/pyc/pyc-list'
import { PaymentRequestContainer } from '@/components/payment-request/payment-request-container'
import { FileText, Wallet, ClipboardCheck } from 'lucide-react'

interface ProjectOutflowTabProps {
    projectId: string
    pycs: any[]
    dnttData: any[]
    dnttCount: number
    allProjects: any[]
    personnel: any[]
}

export function ProjectOutflowTab({
    projectId,
    pycs,
    dnttData,
    dnttCount,
    allProjects,
    personnel
}: ProjectOutflowTabProps) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            <Tabs defaultValue="pyc" className="w-full flex-1 flex flex-col">
                <div className="px-8 border-b border-border/50 bg-card/30 backdrop-blur-sm shadow-sm relative z-10">
                    <TabsList className="bg-transparent w-full justify-start h-16 space-x-12 p-0">
                        <TabsTrigger
                            value="pyc"
                            className="h-16 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-[11px] font-medium uppercase tracking-[0.15em] px-0 transition-all hover:text-primary/70"
                        >
                            <div className="flex items-center gap-2.5">
                                <FileText className="h-4 w-4" />
                                <span>Phiếu yêu cầu (PYC)</span>
                                <span className="ml-1 opacity-40 font-semibold text-[10px]">({pycs?.length || 0})</span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="dntt"
                            className="h-16 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-[11px] font-medium uppercase tracking-[0.15em] px-0 transition-all hover:text-primary/70"
                        >
                            <div className="flex items-center gap-2.5">
                                <Wallet className="h-4 w-4" />
                                <span>Đề nghị thanh toán (DNTT)</span>
                                <span className="ml-1 opacity-40 font-semibold text-[10px]">({dnttCount || 0})</span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="checklist"
                            className="h-16 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-[11px] font-medium uppercase tracking-[0.15em] px-0 transition-all hover:text-primary/70"
                        >
                            <div className="flex items-center gap-2.5">
                                <ClipboardCheck className="h-4 w-4" />
                                <span>Kiểm soát hồ sơ</span>
                            </div>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1">
                    <TabsContent value="pyc" className="m-0 p-0 focus-visible:outline-none">
                        <PYCList
                            initialPYCs={pycs}
                            projects={allProjects}
                            personnel={personnel}
                            projectId={projectId}
                        />
                    </TabsContent>
                    <TabsContent value="dntt" className="m-0 p-0 focus-visible:outline-none">
                        <PaymentRequestContainer
                            initialData={dnttData}
                            totalCount={dnttCount}
                            projectId={projectId}
                        />
                    </TabsContent>
                    <TabsContent value="checklist" className="m-0 focus-visible:outline-none">
                        <div className="p-20 text-center space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                <ClipboardCheck className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Kiểm soát hồ sơ thanh toán</h3>
                            <p className="text-sm text-slate-500 max-w-md mx-auto italic">
                                Tính năng kiểm tra các loại hồ sơ (Hợp đồng, Biên bản nghiệm thu, Hóa đơn...) đang được phát triển để đồng bộ với từng loại DNTT.
                            </p>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
