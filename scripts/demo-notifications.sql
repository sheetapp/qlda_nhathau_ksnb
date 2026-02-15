-- 1. Notifications related to Projects (Dự án)
INSERT INTO notifications (title, message, type, link, user_id)
SELECT 
    'Dự án mới: KSNB Giai đoạn 2', 
    'Bạn đã được thêm vào dự án "Tiếp nhận KSNB Giai đoạn 2" với vai trò Quản trị viên.', 
    'info', 
    '/dashboard/projects/PROJ-2024-001', 
    email 
FROM users LIMIT 1;

INSERT INTO notifications (title, message, type, link, user_id)
SELECT 
    'Cảnh báo tiến độ: Dự án A', 
    'Dự án "Xây dựng hạ tầng KCN" đang chậm tiến độ 5 ngày so với kế hoạch.', 
    'warning', 
    '/dashboard/projects/PROJ-2024-002', 
    email 
FROM users LIMIT 1;

-- 2. Notifications related to PYC (Phiếu yêu cầu)
INSERT INTO notifications (title, message, type, link, user_id)
SELECT 
    'Phê duyệt PYC #REQ-001', 
    'Phiếu yêu cầu mua sắm thiết bị CNTT đã được Giám đốc phê duyệt.', 
    'success', 
    '/dashboard/pyc/REQ-001', 
    email 
FROM users LIMIT 1;

INSERT INTO notifications (title, message, type, link, user_id)
SELECT 
    'Yêu cầu bổ sung thông tin PYC', 
    'PYC #REQ-005 "Vật tư văn phòng" cần bổ sung báo giá chi tiết từ nhà cung cấp.', 
    'warning', 
    '/dashboard/pyc/REQ-005', 
    email 
FROM users LIMIT 1;

-- 3. Notifications related to DNTT (Đề nghị thanh toán)
INSERT INTO notifications (title, message, type, link, user_id)
SELECT 
    'Thanh toán thành công', 
    'Đề nghị thanh toán #PAY-102 cho hợp đồng số HĐ-2024/05 đã được ngân hàng xử lý.', 
    'success', 
    '/dashboard/dntt/PAY-102', 
    email 
FROM users LIMIT 1;

INSERT INTO notifications (title, message, type, link, user_id)
SELECT 
    'Từ chối thanh toán', 
    'DNTT #PAY-109 bị từ chối do thiếu hóa đơn GTGT hợp lệ.', 
    'error', 
    '/dashboard/dntt/PAY-109', 
    email 
FROM users LIMIT 1;
