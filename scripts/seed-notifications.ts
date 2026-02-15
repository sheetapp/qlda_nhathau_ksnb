
import { db } from '../lib/db'
import { notifications, users } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

async function seed() {
    console.log('Seeding notifications...')

    // 1. Get a user to assign notifications to
    const allUsers = await db.select().from(users).limit(1)
    if (allUsers.length === 0) {
        console.error('No users found. Please create a user first.')
        process.exit(1)
    }
    const user = allUsers[0]
    console.log(`Assigning notifications to user: ${user.email}`)

    // 2. Clear existing notifications for this user
    await db.delete(notifications).where(eq(notifications.userId, user.email))

    // 3. Insert sample notifications
    const sampleNotifications = [
        // System & General
        {
            userId: user.email,
            title: 'Chào mừng trở lại',
            message: 'Hệ thống đã cập nhật tính năng mới. Khám phá ngay!',
            type: 'info',
            isRead: false,
            createdAt: new Date(),
        },

        // 1. Projects (Dự án)
        {
            userId: user.email,
            title: 'Dự án mới: KSNB Giai đoạn 2',
            message: 'Bạn đã được thêm vào dự án "Tiếp nhận KSNB Giai đoạn 2" với vai trò Quản trị viên.',
            type: 'info',
            link: '/dashboard/projects/PROJ-2024-001',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        },
        {
            userId: user.email,
            title: 'Cảnh báo tiến độ: Dự án A',
            message: 'Dự án "Xây dựng hạ tầng KCN" đang chậm tiến độ 5 ngày so với kế hoạch.',
            type: 'warning',
            link: '/dashboard/projects/PROJ-2024-002',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        },

        // 2. PYC (Phiếu yêu cầu)
        {
            userId: user.email,
            title: 'Phê duyệt PYC #REQ-001',
            message: 'Phiếu yêu cầu mua sắm thiết bị CNTT đã được Giám đốc phê duyệt.',
            type: 'success',
            link: '/dashboard/pyc/REQ-001',
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        },
        {
            userId: user.email,
            title: 'Yêu cầu bổ sung thông tin PYC',
            message: 'PYC #REQ-005 "Vật tư văn phòng" cần bổ sung báo giá chi tiết từ nhà cung cấp.',
            type: 'warning',
            link: '/dashboard/pyc/REQ-005',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26), // 1 day, 2 hours ago
        },

        // 3. DNTT (Đề nghị thanh toán)
        {
            userId: user.email,
            title: 'Thanh toán thành công',
            message: 'Đề nghị thanh toán #PAY-102 cho hợp đồng số HĐ-2024/05 đã được ngân hàng xử lý.',
            type: 'success',
            link: '/dashboard/dntt/PAY-102',
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        },
        {
            userId: user.email,
            title: 'Từ chối thanh toán',
            message: 'DNTT #PAY-109 bị từ chối do thiếu hóa đơn GTGT hợp lệ.',
            type: 'error',
            link: '/dashboard/dntt/PAY-109',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50), // 2 days, 2 hours ago
        },

        // Resources & Maintenance
        {
            userId: user.email,
            title: 'Bảo trì định kỳ',
            message: 'Hệ thống sẽ bảo trì từ 23:00 ngày 15/02 đến 02:00 ngày 16/02. Vui lòng lưu dữ liệu trước...',
            type: 'warning',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        },
    ]

    // @ts-ignore
    await db.insert(notifications).values(sampleNotifications)

    console.log('Seeded notifications successfully!')
    process.exit(0)
}

seed().catch((err) => {
    console.error('Seeding failed:', err)
    process.exit(1)
})
