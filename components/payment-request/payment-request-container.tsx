'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, ListChecks, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PaymentRequestList } from './payment-request-list'
import { PaymentRequestDetailList } from './payment-request-detail-list'
import { PaymentRequestActions } from './payment-request-actions'

interface PaymentRequestContainerProps {
    initialData: any[]
    totalCount: number
    projectId?: string
}

export function PaymentRequestContainer({ initialData, totalCount, projectId }: PaymentRequestContainerProps) {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <Tabs defaultValue="list" className="h-full flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <TabsList className="bg-muted/50 p-1 rounded-xl shrink-0">
                        <TabsTrigger value="list" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Danh sách phiếu
                        </TabsTrigger>
                        <TabsTrigger value="details" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <ListChecks className="mr-2 h-4 w-4" />
                            Chi tiết
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                        <div className="relative w-full max-w-[280px] group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Tìm kiếm đề nghị..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-9 bg-card/50 border-border/50 rounded-xl focus:ring-primary/20 text-xs"
                            />
                        </div>
                    </div>
                </div>

                <PaymentRequestActions data={initialData} />
            </div>

            <TabsContent value="list" className="flex-1 m-0 p-4 overflow-y-auto">
                <PaymentRequestList
                    initialData={initialData}
                    totalCount={totalCount}
                    projectId={projectId}
                    externalSearchTerm={searchTerm}
                />
            </TabsContent>

            <TabsContent value="details" className="flex-1 m-0 p-4 overflow-y-auto">
                <PaymentRequestDetailList
                    initialData={initialData}
                    projectId={projectId}
                    externalSearchTerm={searchTerm}
                />
            </TabsContent>
        </Tabs>
    )
}
