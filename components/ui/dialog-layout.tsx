'use client'

import * as React from 'react'
import {
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface StandardDialogLayoutProps {
    title: string
    description?: string
    children: React.ReactNode
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
    isLoading?: boolean
    submitLabel?: string
    cancelLabel?: string
    isEdit?: boolean
}

export function StandardDialogLayout({
    title,
    description,
    children,
    onClose,
    onSubmit,
    isLoading,
    submitLabel,
    cancelLabel = 'Hủy',
    isEdit = false,
}: StandardDialogLayoutProps) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col">
            <DialogHeader className="px-6 py-4 border-b border-border/50">
                <DialogTitle className="text-xl font-semibold tracking-tight">
                    {title}
                </DialogTitle>
                {description && (
                    <p className="text-sm text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </DialogHeader>

            <div className="p-6">
                {children}
            </div>

            <DialogFooter className="px-6 py-4 border-t border-border/50 bg-secondary/10 gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    className="rounded-lg h-10 px-6 font-medium"
                >
                    {cancelLabel}
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-lg h-10 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20"
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitLabel || (isEdit ? 'Cập nhật' : 'Tạo mới')}
                </Button>
            </DialogFooter>
        </form>
    )
}
