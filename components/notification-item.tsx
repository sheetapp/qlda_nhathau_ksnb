'use client'

import { cn } from '@/lib/utils'
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface NotificationItemProps {
    notification: {
        id: string
        title: string
        message: string
        type: string | null
        is_read: boolean | null
        created_at: string | null
        link: string | null
    }
    onRead?: (id: string) => void
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
    const Icon = () => {
        switch (notification.type) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-amber-500" />
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />
            default:
                return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    const getBgColor = () => {
        if (notification.is_read) return 'bg-background'
        switch (notification.type) {
            case 'success': return 'bg-green-50/50 dark:bg-green-900/10'
            case 'warning': return 'bg-amber-50/50 dark:bg-amber-900/10'
            case 'error': return 'bg-red-50/50 dark:bg-red-900/10'
            default: return 'bg-blue-50/50 dark:bg-blue-900/10'
        }
    }

    const getBorderColor = () => {
        switch (notification.type) {
            case 'success': return 'border-green-200 dark:border-green-800'
            case 'warning': return 'border-amber-200 dark:border-amber-800'
            case 'error': return 'border-red-200 dark:border-red-800'
            default: return 'border-blue-200 dark:border-blue-800'
        }
    }

    const content = (
        <div
            className={cn(
                'flex gap-3 p-3 rounded-xl border transition-colors relative group',
                getBgColor(),
                getBorderColor(),
                notification.is_read ? 'opacity-70 hover:opacity-100' : 'shadow-sm'
            )}
        >
            <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-background border",
                getBorderColor()
            )}>
                <Icon />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className={cn("text-sm font-semibold", notification.is_read ? "text-muted-foreground" : "text-foreground")}>
                    {notification.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {notification.message}
                </p>
                <span className="text-[10px] text-muted-foreground mt-1.5 block">
                    {notification.created_at && formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: vi })}
                </span>
            </div>
            {!notification.is_read && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500" />
            )}
        </div>
    )

    if (notification.link) {
        return (
            <Link href={notification.link} onClick={() => onRead?.(notification.id)}>
                {content}
            </Link>
        )
    }

    return <div onClick={() => onRead?.(notification.id)} className="cursor-default">{content}</div>
}
