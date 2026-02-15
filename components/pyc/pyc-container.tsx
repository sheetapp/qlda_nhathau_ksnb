'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, ListChecks, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PYCList } from './pyc-list'
import { PYCDetailList } from './pyc-detail-list'
import { PYCActions } from './pyc-actions'
import { TRANG_THAI_PHIEU, LOAI_PHIEU, MUC_DO_UU_TIEN } from '@/Config/thongso'
import { cn } from '@/lib/utils'

interface PYCContainerProps {
    pycs: any[]
    projects: { project_id: string; project_name: string }[]
    pycDetails: any[]
    personnel: any[]
}

export function PYCContainer({ pycs, projects, pycDetails, personnel }: PYCContainerProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState('all')
    const [priorityFilter, setPriorityFilter] = useState('all')
    const [projectFilter, setProjectFilter] = useState('all')
    const [createdByFilter, setCreatedByFilter] = useState('all')
    const [approvedByFilter, setApprovedByFilter] = useState('all')

    // Extract unique creators and approvers from actual data for filter options
    const uniqueCreators = Array.from(new Set(pycs.map(p => p.created_by).filter(Boolean)))
    const uniqueApprovers = Array.from(new Set(pycs.map(p => p.approved_by).filter(Boolean)))

    const creatorOptions = uniqueCreators.map(email => {
        const pyc = pycs.find(p => p.created_by === email)
        return {
            email: email as string,
            full_name: pyc?.author?.full_name || (email as string),
            avatar_url: pyc?.author?.avatar_url
        }
    })

    const approverOptions = uniqueApprovers.map(email => {
        const pyc = pycs.find(p => p.approved_by === email)
        return {
            email: email as string,
            full_name: pyc?.approver?.full_name || (email as string),
            avatar_url: pyc?.approver?.avatar_url
        }
    })

    return (
        <Tabs defaultValue="list" className="h-full flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <TabsList className="bg-muted/50 p-1 rounded-xl shrink-0">
                        <TabsTrigger value="list" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Danh sách
                        </TabsTrigger>
                        <TabsTrigger value="details" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <ListChecks className="mr-2 h-4 w-4" />
                            Chi tiết
                        </TabsTrigger>
                    </TabsList>

                    {/* Filters Row - Moved from List body */}
                    <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                        <div className="relative w-full max-w-[240px] group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Tìm kiếm phiếu..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-9 bg-card/50 border-border/50 rounded-xl focus:ring-primary/20 text-xs"
                            />
                        </div>

                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                            <SelectTrigger className="w-[140px] h-9 rounded-xl bg-card/50 text-xs">
                                <SelectValue placeholder="Dự án" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả dự án</SelectItem>
                                {projects.map(p => (
                                    <SelectItem key={p.project_id} value={p.project_id} className="text-xs">{p.project_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-[130px] h-9 rounded-xl bg-card/50 text-xs">
                                <SelectValue placeholder="Ưu tiên" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">Tất cả ưu tiên</SelectItem>
                                {MUC_DO_UU_TIEN.map(priority => (
                                    <SelectItem key={priority} value={priority} className="text-xs">{priority}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[140px] h-9 rounded-xl bg-card/50 text-xs">
                                <SelectValue placeholder="Phân loại" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">Tất cả phân loại</SelectItem>
                                {LOAI_PHIEU.map(type => (
                                    <SelectItem key={type} value={type} className="text-xs">{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>


                        <Select value={createdByFilter} onValueChange={setCreatedByFilter}>
                            <SelectTrigger className="w-[140px] h-9 rounded-xl bg-card/50 text-xs">
                                <SelectValue placeholder="Người tạo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">Tất cả người tạo</SelectItem>
                                {creatorOptions.map(user => (
                                    <SelectItem key={user.email} value={user.email}>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-4 w-4">
                                                <AvatarImage src={user.avatar_url || ''} />
                                                <AvatarFallback className="text-[8px]">
                                                    {user.full_name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-[11px]">{user.full_name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={approvedByFilter} onValueChange={setApprovedByFilter}>
                            <SelectTrigger className="w-[180px] h-9 rounded-xl bg-card/50 text-xs">
                                <SelectValue placeholder="Người duyệt" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">Tất cả người duyệt</SelectItem>
                                {approverOptions.map(user => (
                                    <SelectItem key={user.email} value={user.email}>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-4 w-4">
                                                <AvatarImage src={user.avatar_url || ''} />
                                                <AvatarFallback className="text-[8px]">
                                                    {user.full_name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-[11px]">{user.full_name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <PYCActions projects={projects || []} pycs={pycs || []} />
            </div>

            <TabsContent value="list" className="flex-1 m-0 p-4 overflow-y-auto">
                <div className="mb-6">
                    <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                        <TabsList className="bg-muted/30 p-1 rounded-2xl w-full justify-start h-auto flex-wrap gap-1 border border-border/50">
                            <TabsTrigger
                                value="all"
                                className="rounded-xl px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="text-sm font-semibold">Tất cả</span>
                                    <Badge variant="secondary" className="bg-slate-500/10 text-slate-600 border-none px-2 py-0 h-5 text-[10px] font-bold">
                                        {pycs.length}
                                    </Badge>
                                </div>
                            </TabsTrigger>
                            {[
                                { id: 'Chờ duyệt', color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-500/10' },
                                { id: 'Đã duyệt', color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                                { id: 'Cần chỉnh sửa', color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-500/10' },
                                { id: 'Từ chối', color: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-500/10' },
                            ].map((status) => (
                                <TabsTrigger
                                    key={status.id}
                                    value={status.id}
                                    className="rounded-xl px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn("h-2 w-2 rounded-full", status.color)} />
                                        <span className="text-sm font-semibold">{status.id}</span>
                                        <Badge variant="secondary" className={cn("border-none px-2 py-0 h-5 text-[10px] font-bold", status.bg, status.text)}>
                                            {pycs.filter(p => p.status === status.id).length}
                                        </Badge>
                                    </div>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
                <PYCList
                    initialPYCs={pycs || []}
                    projects={projects || []}
                    personnel={personnel || []}
                    externalFilters={{
                        searchTerm,
                        statusFilter,
                        typeFilter,
                        priorityFilter,
                        projectFilter,
                        createdByFilter,
                        approvedByFilter
                    }}
                />
            </TabsContent>

            <TabsContent value="details" className="flex-1 m-0 p-4 overflow-y-auto">
                <PYCDetailList
                    initialDetails={pycDetails || []}
                    projects={projects || []}
                    externalFilters={{
                        searchTerm,
                        projectFilter
                    }}
                />
            </TabsContent>
        </Tabs>
    )
}
