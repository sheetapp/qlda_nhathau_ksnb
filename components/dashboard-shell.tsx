'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-nav'
import { MobileHome } from '@/components/mobile-home'
import { MobileUtilities } from '@/components/mobile-utilities'
import { MobileReports } from '@/components/mobile-reports'
import { MobileNotifications } from '@/components/mobile-notifications'
import { MobileProfile } from '@/components/mobile-profile'
import { DynamicHeader } from '@/components/dynamic-header'
import { NotificationDropdown } from '@/components/notification-dropdown'
import { UserNav } from '@/components/user-nav'
import { cn } from '@/lib/utils'

interface DashboardShellProps {
    user: any
    children: React.ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Mobile tab state
    const [activeTab, setActiveTab] = useState(searchParams.get('mtab') || 'home')
    const [isMobile, setIsMobile] = useState(false)

    // Check for mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Sync tab with URL for deep linking if needed
    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        if (pathname !== '/dashboard') {
            router.push('/dashboard')
        }
    }

    // Determine what to render on mobile
    const renderMobileContent = () => {
        // If we are on a sub-page (like /dashboard/projects), show the content
        if (pathname !== '/dashboard') {
            return children
        }

        // Otherwise show the active tab
        switch (activeTab) {
            case 'home': return <MobileHome user={user} />
            case 'utilities': return <MobileUtilities />
            case 'reports': return <MobileReports />
            case 'notifications': return <MobileNotifications />
            case 'profile': return <MobileProfile user={user} />
            default: return <MobileHome user={user} />
        }
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col h-full">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* TopBar - Desktop & Mobile specialized */}
                <header className={cn(
                    "min-h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 py-3 shrink-0 z-10",
                    isMobile && pathname === '/dashboard' && "border-none bg-transparent" // Cleaner look for mobile home
                )}>
                    <div className="flex items-center gap-4 flex-1">
                        <DynamicHeader />
                    </div>

                    {!isMobile && (
                        <div className="flex items-center gap-3">
                            <NotificationDropdown />
                            <div className="h-8 w-[1px] bg-border mx-1" />
                            <UserNav user={user} />
                        </div>
                    )}
                </header>

                {/* Content Area */}
                <main className={cn(
                    "flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6",
                    isMobile && "p-4 pb-24" // Extra padding for bottom nav
                )}>
                    {isMobile ? renderMobileContent() : children}
                </main>

                {/* Mobile Bottom Navigation */}
                {isMobile && (
                    <MobileBottomNav
                        activeTab={pathname !== '/dashboard' ? 'home' : activeTab}
                        onTabChange={handleTabChange}
                    />
                )}
            </div>
        </div>
    )
}
