'use client'

import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getNotifications, markAllAsRead, markAsRead, deleteNotification } from '@/lib/actions/notifications'
import { NotificationItem } from './notification-item'

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    const fetchNotifications = async () => {
        const data = await getNotifications()
        setNotifications(data)
        setUnreadCount(data.filter((n: any) => !n.is_read).length)
    }

    useEffect(() => {
        if (isOpen) {
            fetchNotifications()
        }
    }, [isOpen])

    // Initial fetch for badge count
    useEffect(() => {
        fetchNotifications()
        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])


    const handleMarkAllRead = async () => {
        await markAllAsRead()
        await fetchNotifications()
    }

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id)
        await fetchNotifications()
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        await deleteNotification(id)
        await fetchNotifications()
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border border-background">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
                    <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">Thông báo</span>
                        {unreadCount > 0 && (
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={handleMarkAllRead}
                                title="Đánh dấu đã đọc tất cả"
                            >
                                <CheckCheck className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
                <div className="h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground px-4">
                            <Bell className="h-10 w-10 opacity-20 mb-3" />
                            <p className="text-sm">Bạn chưa có thông báo nào</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 p-2">
                            {notifications.map((notification) => (
                                <div key={notification.id} className="relative group">
                                    <NotificationItem notification={notification} onRead={handleMarkAsRead} />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                                        onClick={(e) => handleDelete(notification.id, e)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-2 border-t bg-muted/20 text-center">
                    <Link href="/dashboard/notifications">
                        <Button variant="link" className="text-xs h-auto py-1 text-primary">
                            Xem tất cả thông báo
                        </Button>
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    )
}
