# Hướng dẫn Deployment - KSNB XD

Tài liệu này hướng dẫn các bước để đưa ứng dụng KSNB XD lên môi trường Production sử dụng GitHub và Vercel.

## 1. Chuẩn bị mã nguồn (GitHub)

Để triển khai lên Vercel, bạn cần đẩy mã nguồn lên một kho lưu trữ (Repository) trên GitHub.

### Bước 1: Khởi tạo Git (nếu chưa có)
Mở terminal tại thư mục gốc của dự án và chạy:
```bash
git init
git add .
git commit -m "Initial commit for deployment"
```

### Bước 2: Tạo Repository trên GitHub
1. Truy cập [github.com/new](https://github.com/new).
2. Tên repository: `ksnb_xd`.
3. Chọn **Public** hoặc **Private** tùy nhu cầu.
4. Nhấn **Create repository**.

### Bước 3: Đẩy mã nguồn lên GitHub
Copy lệnh từ GitHub (ví dụ):
```bash
git remote add origin https://github.com/[Tên_User]/ksnb_xd.git
git branch -M main
git push -u origin main
```

---

## 2. Triển khai lên Vercel

### Bước 1: Kết nối GitHub với Vercel
1. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
2. Nhấn **Add New...** -> **Project**.
3. Tìm repository `ksnb_xd` và nhấn **Import**.

### Bước 2: Cấu hình biến môi trường (Environment Variables)
Tại bước cấu hình (Configure Project), mở phần **Environment Variables** và nhập các thông tin sau từ file `.env.local`:

| Key | Value (Ví dụ) |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | https://ktwnpnyvrcrlcrciwits.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Copy từ .env.local* |
| `SUPABASE_SERVICE_ROLE_KEY` | *Copy từ .env.local* |
| `DATABASE_URL` | *postgresql://postgres.ktwnpnyvrcrlcrciwits...* |
| `NEXT_PUBLIC_APP_URL` | https://[tên-app].vercel.app |

> [!IMPORTANT]
> - Lưu ý: `NEXT_PUBLIC_APP_URL` trên Vercel nên là link domain mà Vercel cung cấp sau khi build xong (hoặc domain riêng của bạn).
> - Đảm bảo đã thay mật khẩu database trong `DATABASE_URL`.

### Bước 3: Build & Deploy
1. Nhấn **Deploy**.
2. Vercel sẽ tự động cài đặt dependencies và thực hiện `npm run build`.
3. Sau khi hoàn tất, bạn sẽ nhận được một đường link truy cập chính thức.

---

## 3. Cập nhật ứng dụng sau này

Mỗi khi bạn có thay đổi code:
1. Commit và push lên GitHub:
   ```bash
   git add .
   git commit -m "Mô tả thay đổi"
   git push origin main
   ```
2. Vercel sẽ tự động nhận diện thay đổi trên nhánh `main` và thực hiện redeploy tự động.

---

## 4. Lưu ý quan trọng cho Supabase
- Truy cập Supabase Dashboard -> **Settings** -> **Authentication**.
- Tại phần **Site URL**, cập nhập URL của Vercel (ví dụ: `https://ksnb-xd.vercel.app`).
- Thêm URL của Vercel vào **Redirect URLs** để Auth hoạt động chính xác.
