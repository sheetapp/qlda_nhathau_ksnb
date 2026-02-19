'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LogoutButton({ className, children }: { className?: string, children?: React.ReactNode }) {
    const supabase = createClient()
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <Button
            variant="ghost"
            size={children ? "default" : "icon"}
            onClick={handleLogout}
            className={cn("rounded-xl text-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all", className)}
            title="Đăng xuất"
        >
            {children || <LogOut className="h-5 w-5" />}
        </Button>
    )
}
