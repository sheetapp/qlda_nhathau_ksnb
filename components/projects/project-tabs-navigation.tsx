'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
    BarChart3,
    Wallet,
    CheckSquare,
    Users,
    Package
} from 'lucide-react'
import { useTransition } from 'react'

interface TabItem {
    value: string
    label: string
    count?: number
}

interface ProjectTabsNavigationProps {
    tabs: TabItem[]
    activeTab: string
}

const tabIcons: Record<string, any> = {
    dashboard: BarChart3,
    inflow: Wallet,
    outflow: Wallet,
    tasks: CheckSquare,
    personnel: Users,
    resources: Package,
}

export function ProjectTabsNavigation({ tabs, activeTab }: ProjectTabsNavigationProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    const handleTabChange = (value: string) => {
        startTransition(() => {
            const params = new URLSearchParams(window.location.search)
            params.set('tab', value)
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    return (
        <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
        >
            <TabsList className={cn(
                "bg-white dark:bg-slate-900 p-1.5 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-x-auto flex-nowrap w-full justify-start md:w-auto h-auto shadow-sm transition-opacity",
                isPending && "opacity-70"
            )}>
                {tabs.map((tab) => {
                    const Icon = tabIcons[tab.value]
                    return (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="rounded-xl px-5 h-10 flex items-center gap-2.5 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-none border-none transition-all font-medium text-[13px]"
                        >
                            {Icon && <Icon className="h-4 w-4" />}
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-primary/10 text-primary border-none font-bold">
                                    {tab.count}
                                </Badge>
                            )}
                        </TabsTrigger>
                    )
                })}
            </TabsList>
        </Tabs>
    )
}
