-- Check what user email is currently logged in
-- Run this in Supabase SQL Editor to see all notifications and users

-- 1. Show all users
SELECT email, full_name FROM users ORDER BY email;

-- 2. Show all notifications with user info
SELECT 
    n.id,
    n.user_id,
    u.full_name as user_name,
    n.title,
    n.message,
    n.type,
    n.is_read,
    n.created_at
FROM notifications n
LEFT JOIN users u ON n.user_id = u.email
ORDER BY n.created_at DESC;

-- 3. Count notifications per user
SELECT 
    user_id,
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE is_read = false) as unread_count
FROM notifications
GROUP BY user_id;

-- 4. If you need to update user_id for all notifications to match your current user:
-- UNCOMMENT and replace 'your-actual-email@gmail.com' with your logged-in email
-- UPDATE notifications 
-- SET user_id = 'your-actual-email@gmail.com' 
-- WHERE user_id = 'sheetappai@gmail.com';
