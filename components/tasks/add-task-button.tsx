'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskDialog } from '@/components/projects/task-dialog'
import { useRouter } from 'next/navigation'

interface AddTaskButtonProps {
    projects: { project_id: string; project_name: string }[]
    projectId?: string
}

export function AddTaskButton({ projects, projectId }: AddTaskButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-4 h-10 transition-all active:scale-95 shrink-0"
            >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Thêm công việc</span>
                <span className="sm:hidden text-lg">+</span>
            </Button>
            <TaskDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                projectId={projectId}
                onSuccess={() => router.refresh()}
            />
        </>
    )
}
