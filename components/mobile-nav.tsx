'use client'

import { cn } from '@/lib/utils'
import { Home, LayoutGrid, BarChart3, Bell, User } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface MobileBottomNavProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
    const tabs = [
        { id: 'home', label: 'Trang chủ', icon: Home },
        { id: 'utilities', label: 'Tiện ích', icon: LayoutGrid },
        { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
        { id: 'notifications', label: 'Thông báo', icon: Bell },
        { id: 'profile', label: 'Tài khoản', icon: User },
    ]

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-50 transition-all duration-300 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-200 relative",
                                isActive ? "text-primary" : "text-muted-foreground/60"
                            )}
                        >
                            {/* Animated Background for active tab */}
                            {isActive && (
                                <span className="absolute inset-x-2 top-1 bottom-1 bg-primary/5 rounded-2xl animate-in fade-in zoom-in-95 duration-200" />
                            )}

                            <Icon className={cn(
                                "h-5 w-5 transition-transform duration-200",
                                isActive ? "scale-110" : "scale-100"
                            )} />
                            <span className={cn(
                                "text-[10px] font-medium transition-all duration-200",
                                isActive ? "opacity-100 translate-y-0" : "opacity-80"
                            )}>
                                {tab.label}
                            </span>

                            {/* Dot indicator */}
                            {isActive && (
                                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </button>
                    )
                })}
            </div>
            {/* Safe area for mobile browsers (iOS handle) */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
    )
}
