'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
    CheckCircle,
    AlertTriangle,
    Info,
    XCircle,
    Trash2,
    CheckCheck,
    MoreHorizontal,
    ExternalLink
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { markAsRead, markMultipleAsRead, deleteNotification } from '@/lib/actions/notifications'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Notification {
    id: string
    title: string
    message: string
    type: string | null
    is_read: boolean | null
    created_at: string | null
    link: string | null
}

interface NotificationTableProps {
    initialNotifications: Notification[]
}

export function NotificationTable({ initialNotifications }: NotificationTableProps) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('unread')

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'unread') return !n.is_read
        if (activeTab === 'read') return n.is_read
        return true
    })

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredNotifications.map(n => n.id))
        } else {
            setSelectedIds([])
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id)
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        )
    }

    const handleMarkSelectedAsRead = async () => {
        if (selectedIds.length === 0) return
        await markMultipleAsRead(selectedIds)
        setNotifications(prev =>
            prev.map(n => selectedIds.includes(n.id) ? { ...n, is_read: true } : n)
        )
        setSelectedIds([])
    }

    const handleDelete = async (id: string) => {
        await deleteNotification(id)
        setNotifications(prev => prev.filter(n => n.id !== id))
        setSelectedIds(prev => prev.filter(i => i !== id))
    }

    const getIcon = (type: string | null) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    return (
        <Card className="shadow-sm border-muted/40">
            <CardHeader className="pb-3 bg-muted/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold">Trung tâm Thông báo</CardTitle>
                        <CardDescription>Quản lý tất cả các thông báo của bạn tại đây</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedIds.length > 0 && activeTab !== 'read' && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-primary border-primary/20 hover:bg-primary/5"
                                onClick={handleMarkSelectedAsRead}
                            >
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Đánh dấu đã đọc ({selectedIds.length})
                            </Button>
                        )}
                        <Tabs defaultValue="unread" className="w-[380px]" onValueChange={(v) => {
                            setActiveTab(v as any)
                            setSelectedIds([])
                        }}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="all" className="flex items-center gap-2">
                                    Tất cả
                                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 min-w-[1.25rem] justify-center h-5 bg-muted-foreground/10 text-muted-foreground">
                                        {notifications.length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="unread" className="flex items-center gap-2">
                                    Chưa đọc
                                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 min-w-[1.25rem] justify-center h-5 bg-red-500/10 text-red-500 font-bold border-red-500/20">
                                        {notifications.filter(n => !n.is_read).length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="read" className="flex items-center gap-2">
                                    Đã đọc
                                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 min-w-[1.25rem] justify-center h-5 bg-green-500/10 text-green-500 border-green-500/20">
                                        {notifications.filter(n => n.is_read).length}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                />
                            </TableHead>
                            <TableHead className="w-[80px]">Loại</TableHead>
                            <TableHead>Tiêu đề & Nội dung</TableHead>
                            <TableHead className="w-[150px]">Thời gian</TableHead>
                            <TableHead className="w-[80px] text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredNotifications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center">
                                        <Info className="h-8 w-8 opacity-20 mb-2" />
                                        <p>Không có thông báo nào trong mục này</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredNotifications.map((n) => (
                                <TableRow key={n.id} className={cn(
                                    "transition-colors group",
                                    !n.is_read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
                                )}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.includes(n.id)}
                                            onCheckedChange={() => toggleSelect(n.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center">
                                            {getIcon(n.type)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "text-sm font-semibold",
                                                    !n.is_read ? "text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {n.title}
                                                </span>
                                                {!n.is_read && (
                                                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-[10px] py-0 px-2 uppercase font-bold">
                                                        Mới
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {n.message}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {n.created_at && formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: vi })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {n.link && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                    asChild
                                                    title="Xem chi tiết"
                                                >
                                                    <Link href={n.link}>
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {!n.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handleMarkAsRead(n.id)}
                                                    title="Đánh dấu đã đọc"
                                                >
                                                    <CheckCheck className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(n.id)}
                                                title="Xóa thông báo"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
