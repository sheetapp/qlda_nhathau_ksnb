import { db } from '../lib/db'
import { notifications, users } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

async function debugNotifications() {
    console.log('=== DEBUG NOTIFICATIONS ===\n')

    // 1. Check all users
    console.log('1. All users in database:')
    const allUsers = await db.select().from(users)
    allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.fullName})`)
    })
    console.log('')

    // 2. Check all notifications
    console.log('2. All notifications in database:')
    const allNotifications = await db.select().from(notifications)
    console.log(`   Total: ${allNotifications.length} notifications`)
    allNotifications.forEach(n => {
        console.log(`   - ID: ${n.id}`)
        console.log(`     User: ${n.userId}`)
        console.log(`     Title: ${n.title}`)
        console.log(`     Read: ${n.isRead}`)
        console.log(`     Created: ${n.createdAt}`)
        console.log('')
    })

    // 3. Check notifications by user
    console.log('3. Notifications grouped by user:')
    const notificationsByUser = allNotifications.reduce((acc, n) => {
        if (!acc[n.userId!]) acc[n.userId!] = []
        acc[n.userId!].push(n)
        return acc
    }, {} as Record<string, typeof allNotifications>)

    Object.entries(notificationsByUser).forEach(([userId, notifs]) => {
        console.log(`   User: ${userId}`)
        console.log(`   Count: ${notifs.length}`)
        console.log(`   Unread: ${notifs.filter(n => !n.isRead).length}`)
        console.log('')
    })

    process.exit(0)
}

debugNotifications().catch((err) => {
    console.error('Debug failed:', err)
    process.exit(1)
})
