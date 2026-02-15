import { getNotifications } from '@/lib/actions/notifications'
import { NotificationTable } from '@/components/notifications/notification-table'

export const metadata = {
    title: 'Thông báo | KSNB',
    description: 'Quản lý thông báo của bạn',
}

export default async function NotificationsPage() {
    const notifications = await getNotifications()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Thông báo</h2>
            </div>
            <div className="grid gap-4">
                <NotificationTable initialNotifications={notifications as any} />
            </div>
        </div>
    )
}
