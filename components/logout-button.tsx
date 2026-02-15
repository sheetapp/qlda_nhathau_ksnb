'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
    const supabase = createClient()
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="rounded-xl text-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all"
            title="Đăng xuất"
        >
            <LogOut className="h-5 w-5" />
        </Button>
    )
}
