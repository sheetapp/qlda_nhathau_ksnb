'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'

interface UserNavProps {
    user: {
        email: string | undefined
        full_name: string | null
        position: string | null
        avatar_url: string | null
    }
}

export function UserNav({ user }: UserNavProps) {
    const supabase = createClient()
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    const initials = user.full_name
        ? user.full_name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : user.email?.[0].toUpperCase() || 'U'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 flex items-center gap-3 px-2 hover:bg-primary/5 rounded-xl transition-all group">
                    <div className="relative">
                        <Avatar className="h-10 w-10 rounded-xl border border-primary/20 shadow-sm transition-transform group-hover:scale-105">
                            <AvatarImage src={user.avatar_url || ''} alt={user.full_name || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
                    </div>

                    <div className="text-left hidden sm:block">
                        <p className="text-sm font-bold text-foreground leading-none mb-1">
                            {user.full_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-foreground/40 leading-none">
                            {user.position || 'Nhân viên'}
                        </p>
                    </div>

                    <ChevronDown className="h-4 w-4 text-foreground/40 group-hover:text-primary transition-colors" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-64 p-2 rounded-2xl shadow-xl border-border bg-card/95 backdrop-blur-xl" align="end" sideOffset={8}>
                <DropdownMenuLabel className="font-normal px-2 py-3">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none">{user.full_name || 'Người dùng'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50 mx-1" />

                <div className="p-1">
                    <DropdownMenuItem
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors"
                        onClick={() => router.push('/dashboard/profile')}
                    >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4" />
                        </div>
                        <span className="font-medium">Hồ sơ cá nhân</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors"
                    >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Settings className="h-4 w-4" />
                        </div>
                        <span className="font-medium">Cài đặt hệ thống</span>
                    </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-border/50 mx-1" />

                <div className="p-1">
                    <DropdownMenuItem
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive transition-colors"
                        onClick={handleLogout}
                    >
                        <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <LogOut className="h-4 w-4" />
                        </div>
                        <span className="font-bold">Đăng xuất</span>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
