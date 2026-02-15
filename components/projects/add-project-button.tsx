'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ProjectDialog } from './project-dialog'
import { useRouter } from 'next/navigation'

export function AddProjectButton() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
            >
                <Plus className="mr-2 h-4 w-4" />
                Thêm dự án mới
            </Button>
            <ProjectDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                onSuccess={() => router.refresh()}
            />
        </>
    )
}
