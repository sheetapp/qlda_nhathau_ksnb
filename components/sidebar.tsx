'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Package,
    FileText,
    Wallet,
    Warehouse,
    ShieldCheck,
    Users,
    Settings2,
    Layers,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Sun,
    Moon,
    Menu,
    BarChart3,
    TrendingUp,
    TrendingDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

const navigation = [
    { name: 'Trang chủ', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Dự án', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Hạng mục', href: '/dashboard/project-items', icon: Layers },
    { name: 'Công việc', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Tài nguyên', href: '/dashboard/resources', icon: Package },
    { name: 'Tiến độ', href: '/dashboard/progress', icon: TrendingUp },
    {
        name: 'Nhân sự',
        icon: Users,
        children: [
            { name: 'Người dùng hệ thống', href: '/dashboard/personnel' },
            { name: 'Công nhân', href: '/dashboard/personnel/workers' },
        ]
    },
    {
        name: 'Đối tác',
        icon: Users,
        children: [
            { name: 'Nhà cung cấp', href: '/dashboard/system/suppliers' },
            { name: 'Thầu phụ', href: '/dashboard/subcontractors' },
        ]
    },
    {
        name: 'Yêu cầu mua sắm',
        icon: FileText,
        children: [
            { name: 'Phiếu yêu cầu', href: '/dashboard/pyc' },
            { name: 'Checklist', href: '/dashboard/checklist' },
            { name: 'Đề nghị thanh toán', href: '/dashboard/dntt' },
        ]
    },
    {
        name: 'Quản lý kho',
        icon: Warehouse,
        children: [
            { name: 'Danh sách kho', href: '/dashboard/system/warehouses' },
            { name: 'Nhập kho', href: '/dashboard/inventory/in' },
            { name: 'Xuất kho', href: '/dashboard/inventory/out' },
        ]
    },
    {
        name: 'Tài chính',
        icon: Wallet,
        children: [
            { name: 'Thu', href: '/dashboard/finance/income' },
            { name: 'Chi', href: '/dashboard/system/expenses' },
            { name: 'Báo cáo', href: '/dashboard/finance/reports' },
        ]
    },
    { name: 'Hệ thống', href: '/dashboard/system', icon: Settings2 },
]

export function Sidebar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const currentTab = searchParams.get('tab') || 'dashboard'
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        'Yêu cầu mua sắm': true,
        'Đối tác': true,
        'Quản lý kho': true,
        'Tài chính': true,
        'Nhân sự': true
    })
    const { theme, setTheme } = useTheme()

    const toggleGroup = (name: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [name]: !prev[name]
        }))
    }

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-sidebar backdrop-blur-xl border-r border-sidebar-border transition-all duration-300 relative group font-sans",
                isCollapsed ? "w-20" : "w-64"
            )}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
        >
            <div className={cn(
                "flex items-center h-16 border-b border-sidebar-border px-6 transition-all duration-300",
                isCollapsed ? "justify-center" : "justify-between"
            )}>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold tracking-tight text-sidebar-primary whitespace-nowrap">
                            Kiểm soát nội bộ
                        </h1>
                        <p className="text-xs text-foreground/60 font-medium">Dự án Xây dựng</p>
                    </div>
                )}
                {isCollapsed && (
                    <h1 className="text-xl font-bold tracking-tight text-sidebar-primary">K</h1>
                )}

                {/* Manual Toggle Button (optional, can be removed if hover-only is desired) */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-6 w-6 rounded-lg text-foreground/50 hover:text-primary absolute -right-3 top-6 bg-background border border-border shadow-sm z-50 hidden opacity-0 transition-opacity",
                        // "group-hover:flex group-hover:opacity-100" // Uncomment to enable manual toggle on hover edge
                    )}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
                {/* Main Navigation */}
                <div className="space-y-1">
                    <p className={cn(
                        "text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mb-2 px-3 transition-opacity duration-300",
                        isCollapsed ? "opacity-0" : "opacity-100"
                    )}>
                        Hệ thống
                    </p>
                    {navigation.map((item) => {
                        const hasChildren = 'children' in item && item.children && item.children.length > 0
                        const isOpen = openGroups[item.name]
                        const href = 'href' in item ? (item.href as string) : undefined
                        const isActive = href ? (pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))) : false

                        // Check if any child is active
                        const isChildActive = !!(hasChildren && item.children?.some(child => pathname === child.href || (child.href !== '/dashboard' && pathname?.startsWith(child.href))))

                        if (hasChildren) {
                            return (
                                <div key={item.name} className="space-y-1">
                                    <button
                                        onClick={() => toggleGroup(item.name)}
                                        className={cn(
                                            "w-full group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                                            isChildActive
                                                ? "bg-sidebar-accent/30 text-sidebar-accent-foreground"
                                                : "text-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "mr-3 h-4.5 w-4.5 transition-colors shrink-0",
                                            isChildActive ? "text-sidebar-accent-foreground" : "text-foreground/40 group-hover:text-sidebar-accent-foreground",
                                            isCollapsed && "mr-0"
                                        )} />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 text-left whitespace-nowrap overflow-hidden">{item.name}</span>
                                                <ChevronDown className={cn(
                                                    "h-3.5 w-3.5 opacity-50 transition-transform duration-200",
                                                    isOpen ? "rotate-0" : "-rotate-90"
                                                )} />
                                            </>
                                        )}
                                    </button>
                                    {!isCollapsed && isOpen && (
                                        <div className="ml-4 space-y-1 border-l border-sidebar-border ml-7 pl-2">
                                            {item.children?.map((child) => {
                                                const isSubActive = pathname === child.href || (child.href !== '/dashboard' && pathname?.startsWith(child.href))
                                                return (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        className={cn(
                                                            "flex items-center px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200",
                                                            isSubActive
                                                                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                                                : "text-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/30"
                                                        )}
                                                    >
                                                        <span className="flex-1 whitespace-nowrap overflow-hidden">{child.name}</span>
                                                        {isSubActive && <div className="w-1 h-1 rounded-full bg-sidebar-accent-foreground" />}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        }

                        if (!href) return null

                        return (
                            <Link
                                key={item.name}
                                href={href}
                                className={cn(
                                    "group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                        : "text-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                )}
                            >
                                <item.icon className={cn(
                                    "mr-3 h-4.5 w-4.5 transition-colors shrink-0",
                                    isActive ? "text-sidebar-accent-foreground" : "text-foreground/40 group-hover:text-sidebar-accent-foreground",
                                    isCollapsed && "mr-0"
                                )} />
                                {!isCollapsed && <span className="flex-1 whitespace-nowrap overflow-hidden">{item.name}</span>}
                                {isActive && !isCollapsed && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
                            </Link>
                        )
                    })}
                </div>

                {/* Project Contextual Navigation */}
                {pathname.includes('/dashboard/projects/') && !pathname.endsWith('/projects') && (
                    <div className="space-y-1 pt-4 border-t border-sidebar-border/50">
                        <p className={cn(
                            "text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-2 px-3 transition-opacity duration-300",
                            isCollapsed ? "opacity-0" : "opacity-100"
                        )}>
                            Dự án đang xem
                        </p>
                        {[
                            { name: 'Dòng tiền ròng', tab: 'dashboard', icon: BarChart3 },
                            { name: 'Dòng Thu (Inflow)', tab: 'inflow', icon: TrendingUp },
                            { name: 'Dòng Chi (Outflow)', tab: 'outflow', icon: TrendingDown },
                            { name: 'Hạng mục', tab: 'items', icon: Layers },
                            { name: 'Công việc', tab: 'tasks', icon: CheckSquare },
                            { name: 'Nhân sự', tab: 'personnel', icon: Users },
                            { name: 'Vật tư', tab: 'resources', icon: Package },
                            { name: 'Nhà cung cấp', tab: 'suppliers', icon: Users },
                        ].map((item) => {
                            const projectId = pathname.split('/dashboard/projects/')[1]?.split('/')[0]
                            const href = `/dashboard/projects/${projectId}?tab=${item.tab}`
                            const isActiveProjectTab = pathname.startsWith(`/dashboard/projects/${projectId}`) && currentTab === item.tab

                            return (
                                <Link
                                    key={item.name}
                                    href={href}
                                    className={cn(
                                        "group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                                        isActiveProjectTab
                                            ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                                            : "text-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "mr-3 h-4 w-4 transition-colors shrink-0",
                                        isActiveProjectTab ? "text-primary" : "text-foreground/40 group-hover:text-sidebar-accent-foreground",
                                        isCollapsed && "mr-0"
                                    )} />
                                    {!isCollapsed && <span className="flex-1 whitespace-nowrap overflow-hidden text-[13px]">{item.name}</span>}
                                    {isActiveProjectTab && !isCollapsed && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-sidebar-border space-y-4">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "w-full justify-start text-foreground/60 hover:text-primary hover:bg-sidebar-accent/50",
                        isCollapsed && "justify-center px-0"
                    )}
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    {!isCollapsed && <span className="ml-3">Giao diện {theme === 'dark' ? 'Tối' : 'Sáng'}</span>}
                </Button>

                {!isCollapsed ? (
                    <div className="bg-foreground/5 rounded-2xl p-3">
                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider mb-1 px-1">Phiên bản</p>
                        <p className="text-xs px-1 font-medium italic opacity-60">v1.0.0 Alpha</p>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <p className="text-[10px] font-bold text-foreground/20">v1.0</p>
                    </div>
                )}
            </div>
        </div>
    )
}
