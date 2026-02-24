# Tóm Tắt Dự Án: Hệ Thống Quản Lý Kiểm Soát Nội Bộ - Xây Dựng

**Tên Dự Án**: KSNB_XD (Kiểm Soát Nội Bộ - Xây Dựng)  
**Mục Đích**: Hệ thống quản lý toàn diện cho công ty Xây dựng & Nội thất bao gồm quản lý dự án, tài chính, nhân sự, kho vật tư, và kiểm soát nội bộ.

---

## 1. CÔNG NGHỆ & STACK CÔNG NGHỆ

### Frontend
- **Framework**: Next.js 16.1.6 (App Router)
- **UI Library**: React 19.2.3, React DOM 19.2.3
- **Component Library**: Radix UI, shadcn/ui
- **Styling**: 
  - Tailwind CSS 4 (Utility-first CSS)
  - OKLCH Color System (Apple Design)
  - Class-variance-authority (CVA) cho Component Variants
- **Icons**: Lucide React 0.563.0
- **Form Management**: React Hook Form 7.71.1
- **Form Validation**: Zod 4.3.6, @hookform/resolvers
- **Toast Notifications**: Sonner 2.0.7
- **Theme**: next-themes 0.4.6 (Dark/Light mode support)

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **ORM**: Drizzle ORM 0.45.1
- **Database Migration**: Drizzle Kit 0.31.9
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth (@supabase/ssr 0.8.0, @supabase/supabase-js 2.95.3)

### Dev Tools
- **Language**: TypeScript 5
- **Linting**: ESLint 9, ESLint Next.js Config
- **Bundler**: Next.js built-in bundler
- **Date Handling**: date-fns 4.1.0
- **Excel**: xlsx 0.18.5

### Package Utilities
- **CSS**: clsx 2.1.1, tailwind-merge 3.4.0
- **Database**: postgres 3.4.8
- **CLI**: cmdk 1.1.1

---

## 2. KIẾN TRÚC DỰ ÁN

### Cấu Trúc Thư Mục
```
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout với ThemeProvider
│   ├── page.tsx                  # Trang chủ
│   ├── globals.css               # Toàn cục CSS (màu sắc, theme)
│   ├── (auth)/                   # Auth group routes
│   │   ├── login/
│   │   └── callback/
│   ├── api/                      # API Routes
│   │   └── projects/
│   ├── auth/                     # Auth pages
│   │   └── callback/
│   └── dashboard/                # Main app routes
│       ├── layout.tsx
│       ├── page.tsx              # Dashboard
│       ├── dntt/                 # Đề nghị thanh toán
│       ├── notifications/
│       ├── personnel/            # Nhân sự
│       ├── profile/
│       ├── project-items/        # Hạng mục
│       ├── projects/             # Dự án
│       ├── pyc/                  # Phiếu yêu cầu
│       ├── resources/            # Tài nguyên
│       ├── system/               # Hệ thống
│       └── tasks/                # Công việc
├── components/                   # Reusable Components
│   ├── ui/                       # shadcn/ui components
│   ├── sidebar.tsx               # Navigation sidebar
│   ├── dashboard-shell.tsx
│   ├── dynamic-header.tsx
│   ├── user-nav.tsx
│   ├── forms/
│   ├── projects/                 # Project components
│   ├── personnel/                # Personnel components
│   ├── pyc/                      # PYC components
│   ├── payment-request/
│   ├── resources/
│   ├── system/
│   └── tables/
├── lib/                          # Utilities & Actions
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema definitions
│   │   └── index.ts
│   ├── supabase/
│   │   ├── server.ts
│   │   ├── client.ts
│   │   └── admin.ts
│   ├── actions/                  # Server actions
│   │   ├── projects.ts
│   │   ├── personnel.ts
│   │   ├── tasks.ts
│   │   ├── resources.ts
│   │   ├── payment-requests.ts
│   │   ├── notifications.ts
│   │   └── system.ts
│   ├── constants/
│   ├── *-store.ts               # Client-side state
│   └── utils.ts
├── public/                       # Static assets
├── supabase/                     # Database migrations
│   └── migrations/
├── Config/                       # Configuration
│   └── thongso.ts
└── scripts/                      # Database & utility scripts
```

---

## 3. DATABASE SCHEMA & LOGIC

### Core Tables

#### **Users (Nhân sự)**
- `email` (PK): Email định danh duy nhất
- `fullName`: Họ tên
- `phoneNumber`: Số điện thoại
- `avatarUrl`: URL ảnh đại diện
- `department`: Phòng ban
- `position`: Chức vụ
- `accessLevel`: Mức quyền (1: Admin, 2: Giám đốc, 3: Trưởng phòng, 4: Nhân viên)
- `projectIds[]`: Danh sách dự án tham gia
- `timestamps`: createdAt

#### **Projects (Dự án)**
- `projectId` (PK): Mã dự án
- `projectName`: Tên dự án
- `status`: Trạng thái (Đang thực hiện, Hoàn thành, Tạm dừng)
- `managerName`: FK → users.email
- `memberNames[]`: Danh sách thành viên
- `Financial Info`:
  - `contractValue`: Giá trị hợp đồng
  - `contingencyBudget`: Ngân sách dự phòng
  - `currencyCode`: Loại tiền tệ (mặc định VND)
  - `actualCost`: Chi phí thực tế
- `Dates`:
  - `startDate`, `endDate`: Kế hoạch
  - `actualStartDate`, `actualEndDate`: Thực tế
- `progressPercent`: % Hoàn thành
- `FK createdBy`: Người tạo
- `timestamps`

#### **Tasks (Công việc)**
- `taskId` (PK): Mã công việc
- `projectId` (FK): Liên kết dự án (cascade delete)
- `taskName`: Tên công việc
- `taskCategory`: Loại công việc
- `taskUnit`: Đơn vị tính
- `wbs`: WBS Code (phân cấp)
- `status`: Trạng thái (Chưa bắt đầu, Đang thực hiện, Hoàn thành)
- `startDate`, `endDate`: Kế hoạch
- `timestamps`

#### **ProjectItems (Hạng mục)**
- `id` (PK): UUID
- `projectId` (FK): Dự án
- `wbs_code`: WBS Code (phân cấp)
- `item_name`: Tên hạng mục
- `unit`: Đơn vị tính
- `quantity`: Khối lượng
- `planned_cost`: Chi phí kế hoạch
- `responsible_user_id`: Người phụ trách
- `planned_start_date`, `planned_end_date`: Kế hoạch
- `duration_days`: Số ngày
- `timestamps`

#### **Resources (Tài nguyên)**
- `id` (PK): UUID
- `resource_code`: Mã tài nguyên
- `resource_name`: Tên tài nguyên
- `resource_type`: Loại (Nhân sự, Vật tư, Thiết bị)
- `unit`: Đơn vị tính
- `unit_price`: Đơn giá
- `quantity_in`: Tổng nhập
- `quantity_out`: Tổng xuất
- `quantity_balance`: Tồn kho
- `project_id` (FK): Dự án hoặc "Dùng chung"
- `status`: Trạng thái
- `timestamps`

#### **Payment Requests (Đề nghị thanh toán)**
- `id` (PK): UUID
- `request_id`: Mã yêu cầu
- `project_id` (FK): Dự án
- `supplier_id`: Nhà cung cấp
- `amount`: Số tiền
- `status`: Trạng thái (Nháp, Gửi duyệt, Phê duyệt, Thanh toán, Từ chối)
- `payment_date`: Ngày thanh toán dự kiến
- `created_by`: Người tạo
- `notes`: Ghi chú
- `attachments[]`: Danh sách file đính kèm
- `timestamps`

#### **PYC (Phiếu Yêu Cầu Mua Sắm)**
- `request_id` (PK): Mã phiếu
- `project_id` (FK): Dự án
- `title`: Tiêu đề
- `request_type`: Loại (Mua sắm, Thi công, Dịch vụ)
- `priority`: Mức độ ưu tiên
- `status`: Trạng thái (Nháp, Gửi duyệt, Phê duyệt, Thực hiện, Hoàn thành, Từ chối)
- `vat_rate`: Tỷ lệ VAT
- `total_amount`: Tổng tiền
- `items[]`: Chi tiết các hạng mục
  - `description`: Mô tả
  - `quantity`: Số lượng
  - `unit_price`: Đơn giá
  - `total`: Thành tiền
- `created_by`: Người tạo
- `timestamps`

#### **Suppliers (Nhà cung cấp)**
- `id` (PK): UUID
- `supplier_code`: Mã NCC
- `supplier_name`: Tên nhà cung cấp
- `tax_code`: Mã số thuế
- `supplier_group`: Phân loại
- `commodity_group`: Nhóm mặt hàng
- `supply_region`: Khu vực cung cấp
- `contact_person`: Người liên hệ
- `phone_number`: Số điện thoại
- `address`: Địa chỉ
- `project_id` (FK): Dự án hoặc NULL (Dùng chung)
- `timestamps`

#### **System Tables**
- `departments`: Phòng ban (hierarchical - parent_id FK)
- `job_levels`: Cấp bậc
- `job_positions`: Chức vụ
- `job_functions`: Chức năng nhiệm vụ (nhiều-nhiều)
- `company_info`: Thông tin công ty (1 record, check constraint id=1)
- `branches`: Chi nhánh
- `constants`: Danh mục hệ thống (loại, trạng thái, etc.)
- `files`: Đính kèm (generic, FK qua tableName + refId)

### Key Relationships
- **Cascade Delete**: Projects → Tasks, ProjectItems
- **Hierarchical**: Departments (self-referencing parent_id)
- **Generic Files**: Via tableName + refId (flexible attachment system)

---

## 4. LOGIC & FEATURES CHÍNH

### A. Authentication & Authorization
- **Auth Provider**: Supabase Auth
- **Access Levels**:
  1. Admin: Full access
  2. Giám đốc: Project & financial overview
  3. Trưởng phòng: Department management
  4. Nhân viên: Assigned tasks/projects only
- **Session**: Server-side via @supabase/ssr
- **Protected Routes**: Middleware checks user session

### B. Project Management
- **Create/Update/Delete**: Server actions with ensureUserExists helper
- **Bulk Operations**: Import/Export Excel (xlsx library)
- **Filtering**: By status, manager, member
- **Progress Tracking**: % hoàn thành, dates comparison (actual vs planned)
- **Financial Overview**: Contract value, actual cost, contingency budget

### C. Task Management
- **WBS Structure**: Hierarchical task breakdown
- **Status Workflow**: Chưa bắt đầu → Đang thực hiện → Hoàn thành
- **Project Linking**: Cascade delete with project
- **Bulk Actions**: Import Excel, bulk delete

### D. Resource Management (Tài nguyên)
- **Inventory Tracking**: In/Out/Balance quantities
- **Multi-project**: Dùng chung (NULL project_id) or project-specific
- **Resource Types**: Nhân sự, Vật tư, Thiết bị
- **Cost Tracking**: Unit price, total cost calculation

### E. Financial Management
- **PYC (Phiếu Yêu Cầu)**:
  - Multi-item requests with VAT calculation
  - Status workflow (Nháp → Gửi duyệt → Phê duyệt → Thực hiện → Hoàn thành)
  - Priority levels
  - Excel export/import
- **Payment Requests**:
  - Amount tracking
  - Supplier linked
  - Status: Nháp → Gửi duyệt → Phê duyệt → Thanh toán → Từ chối
  - Attachment support
- **Payment Tracking**: Actual vs planned costs

### F. Personnel Management
- **User Management**: Create, update, delete with role assignment
- **Department Structure**: Hierarchical organization
- **Job Levels & Positions**: Master data management
- **Access Control**: Level-based permission system
- **Import/Export**: Bulk personnel operations

### G. System Management
- **Company Info**: Single record with constraint
- **Branches**: Multiple locations management
- **Constants/Enums**: Danh mục hệ thống (tái sử dụng)
- **Suppliers**: Partner management (shared or per-project)
- **Files**: Generic attachment system

### H. Notifications
- **Event-based**: Created, updated, assigned, deadline approaching
- **Status**: Read/Unread tracking
- **User-specific**: Per email

---

## 5. GIAO DIỆN & DESIGN SYSTEM

### Color Palette (OKLCH System)
```
Light Mode:
- Primary: #0071E3 (Apple Blue) - oklch(0.536 0.176 253.308)
- Background: #F5F5F7 (Nhạt) - oklch(0.975 0.002 247.858)
- Foreground: #1D1D1F (Đen) - oklch(0.141 0.005 285.823)
- Card: #FFFFFF (Trắng) - oklch(1 0 0)
- Border: #E5E5EA (Xám nhạt) - oklch(0.89 0.005 285.8)

Dark Mode:
- Background: #000000 (Đen)
- Card: rgba(26, 26, 26, 0.3) (Xám nhạt glassmorphism)
- Foreground: #FFFFFF (Trắng)

Semantic Colors:
- Success/Green: oklch(0.6 0.118 184.704)
- Warning/Orange: oklch(0.828 0.189 84.429)
- Destructive/Red: oklch(0.637 0.237 25.331)
- Sidebar: oklch(1 0 0 / 0.8) (Glassmorphism)
```

### Typography
- **Font**: Inter (Google Fonts)
- **Size Scale**: xs (10px) → base (13px) → sm (14px) → lg (16px) → xl (20px) → 2xl
- **Weight**: Regular (400), Medium (500), Bold (600), Extra Bold (700)

### Component Library
- **Button Variants**:
  - `default`: Primary blue background
  - `outline`: Border with hover accent
  - `ghost`: No background, hover accent
  - `destructive`: Red (delete actions)
  - `secondary`: Grey
  - `link`: Underlined text
- **Sizes**: xs (6px), sm (8px), default (9px), lg (10px), icon (9px), icon-xs (6px), icon-sm (8px), icon-lg (10px)
- **Button with Icon**: Auto gap and spacing adjustment

### Layout System
- **Sidebar**: Collapsible (20rem expanded, 5rem collapsed) with hover expand/collapse
  - Glassmorphism: Backdrop blur, semi-transparent
  - Rounded corners: 0.75rem (Apple style)
- **Header**: Dynamic with breadcrumb, page title, actions
- **Dashboard Grid**: Responsive (grid-cols-1 md:2 lg:3+)
- **Card System**: Rounded-3xl, border border-slate-200, hover shadow
- **Spacing**: Consistent 4px units via Tailwind

### Component Patterns
1. **DataManagementTable**: Reusable CRUD table with:
   - Inline editing (Dialog-based)
   - Bulk selection
   - Search/Filter
   - Custom actions (Export/Import)
   - Hierarchical support
   - Loading states

2. **Tabs**: Horizontal navigation (PYC items, Personnel tabs, etc.)

3. **Sheets**: Side panels for forms (right-aligned, full height)

4. **Dialogs**: Modal forms with validation

5. **Status Badges**: Color-coded status indicators
   ```
   Đang thực hiện: Blue bg-blue-500/10 text-blue-600
   Hoàn thành: Green bg-green-500/10 text-green-600
   Tạm dừng: Orange bg-orange-500/10 text-orange-600
   Nháp: Grey bg-slate-500/10 text-slate-600
   ```

6. **Icons**: Lucide React (all action/status icons from lucide-react)

### Responsive Design
- **Mobile-first**: Base styles mobile, then `md:` (768px), `lg:` (1024px)
- **Mobile Components**: MobileHome, MobileNav, MobileProfile, MobileReports (custom mobile UX)
- **Desktop**: Full sidebar + content layout

### Dark Mode
- Toggle via next-themes in sidebar
- System preference detection enabled
- All colors have dark mode variants
- Glassmorphism for dark cards

### Animation & Transitions
- **Page Entry**: `animate-in fade-in duration-500` (Framer Motion inspired)
- **Hover Effects**: Subtle shadow increase, color transitions
- **Transitions**: All using `transition-all duration-200` pattern

---

## 6. SERVER ACTIONS & DATA FLOW

### Pattern: Server Actions with Revalidation
```typescript
// lib/actions/projects.ts
export async function createProject(formData: {...}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Ensure user exists in public.users
  await ensureUserExists(user.email, ...)
  
  const { error } = await supabase.from('projects').insert(formData)
  if (error) throw error
  
  revalidatePath('/dashboard/projects')
  return result
}
```

### Key Patterns:
- **Authentication**: Always check `supabase.auth.getUser()`
- **Self-healing**: `ensureUserExists()` helper creates missing users
- **Admin Client**: Separate admin client for system-wide operations
- **Revalidation**: ISR via `revalidatePath()` after mutations
- **Error Handling**: Throw errors (caught by try-catch in components)

### Client-Side State Management
- **Zustand-like stores** (custom store implementations):
  - `payment-request-store.ts`
  - `personnel-store.ts`
  - `resource-store.ts`
  - `task-store.ts`
- **Form State**: React Hook Form + Zod validation
- **UI State**: React useState for modals, sheets, selections

---

## 7. WORKFLOW & BUSINESS LOGIC EXAMPLES

### Example 1: Create PYC (Phiếu Yêu Cầu)
1. User fills form via PYCSheet component
2. Form data validated with Zod schema
3. Server action `createPYC()` called
4. Insert into `pyc` table + `pyc_items` table
5. Notification created for approver
6. Path revalidated to fetch latest data
7. UI updates with new PYC in list

### Example 2: Approve Payment Request
1. User clicks approve button on payment request
2. Server action `updatePaymentRequest({ status: 'Phê duyệt' })`
3. Update payment_requests table
4. Create notification for finance team
5. If amount > limit, escalate to manager approval
6. Trigger notification system

### Example 3: Import Project from Excel
1. User selects Excel file (ProjectList component)
2. `handleImportExcel()` parses with XLSX library
3. Validate each row with schema
4. Bulk insert via `createProjects()` server action
5. Batch process with error reporting
6. Toast success with count: "Đã nhập 5 dự án"
7. Revalidate projects list

---

## 8. KEY FILES & DEPENDENCIES

### Critical Configuration
- **tsconfig.json**: Path alias `@/*` → root
- **drizzle.config.ts**: PostgreSQL dialect, schema location
- **next.config.ts**: Custom server config (if any)
- **postcss.config.mjs**: Tailwind CSS pipeline

### Essential Components
- **sidebar.tsx**: Main navigation with collapse/theme toggle
- **dynamic-header.tsx**: Breadcrumb + page title rendering
- **dashboard-shell.tsx**: Layout wrapper
- **DataManagementTable**: 90% of CRUD tables use this

### Critical Utilities
- **lib/utils.ts**: `cn()` (clsx wrapper), common helpers
- **lib/supabase/server.ts**: Supabase client factory
- **lib/supabase/admin.ts**: Admin-level operations
- **lib/constants/**: Status values, role mapping, VAT options

---

## 9. BEST PRACTICES DALAM DỰ ÁN

### Code Organization
1. ✅ Components co-located in feature folders (e.g., `components/projects/`)
2. ✅ Server actions grouped by domain (e.g., `lib/actions/projects.ts`)
3. ✅ Shared UI in `components/ui/` (shadcn pattern)
4. ✅ Clear naming: `project-list.tsx`, `project-dialog.tsx`, `project-sheet.tsx`

### TypeScript Usage
1. ✅ Strict mode enabled
2. ✅ Schema validation with Zod (runtime + type safety)
3. ✅ Interface definitions for props
4. ✅ Generic components with VariantProps (CVA pattern)

### Performance
1. ✅ Server-side rendering with Next.js App Router
2. ✅ Revalidation via `revalidatePath()`
3. ✅ Image optimization (future: next/image)
4. ✅ Code splitting per route

### Security
1. ✅ Supabase RLS (Row-Level Security) policies
2. ✅ Access level checks in server actions
3. ✅ User authentication on protected routes
4. ✅ Data validation with Zod schemas

### UX/DX
1. ✅ Toast notifications (Sonner) for feedback
2. ✅ Loading states on buttons/tables
3. ✅ Optimistic UI updates (where applicable)
4. ✅ Bulk operations support (import/export)
5. ✅ Responsive design with mobile-specific components
6. ✅ Dark mode support with next-themes

---

## 10. ĐIỂM MẠNH & KIẾN TRÚC

### Strengths
1. **Modular**: Components tách biệt, dễ tái sử dụng
2. **Type-safe**: TypeScript + Zod throughout
3. **Scalable**: Server actions pattern, shared utilities
4. **Modern UX**: Glassmorphism, smooth animations, dark mode
5. **Accessible**: Radix UI + semantic HTML
6. **Data Flow**: Clear unidirectional (component → server action → DB → revalidate → UI)

### Potential Improvements
1. Add error boundary per route
2. Implement optimistic UI updates
3. Add analytics tracking (Vercel Analytics)
4. Cache strategies for frequently accessed data
5. Rate limiting on server actions

---

## 11. THAM CHIẾU NHANH - THÊM FEATURE MỚI

### Thêm bảng mới:
1. Define table in `lib/db/schema.ts` (Drizzle schema)
2. Create Drizzle migration via `npm run db:generate`
3. Create server actions in `lib/actions/new-module.ts`
4. Create component folder `components/new-module/`
5. Add routes in `app/dashboard/new-module/`

### Thêm CRUD component:
1. Create component class extending DataManagementTable
2. Define columns, fields, actions props
3. Add server action handlers (create, update, delete)
4. Render custom dialog with renderDialog prop
5. Pass actions array with import/export buttons

### Thêm page route:
1. Create folder in `app/dashboard/new-route/`
2. Create `page.tsx` with component
3. Add to sidebar navigation in `components/sidebar.tsx`
4. Update dynamic-header mapping if needed

### Dark mode:
- Automatically handled by next-themes
- Add dark: variant to Tailwind classes
- Colors inherit from CSS variables

---

## 12. CONCLUSION

Dự án này là một **enterprise-grade web application** sử dụng các best practices hiện đại:
- **Frontend**: React + Next.js với TypeScript + Tailwind CSS
- **Backend**: PostgreSQL + Drizzle ORM + Supabase
- **Design**: Apple-inspired glassmorphism + OKLCH color system
- **Architecture**: Server-driven, composable components, clear data flow
- **Scalability**: Module pattern, reusable components, server actions

Phù hợp làm template cho các dự án enterprise khác với domain tương tự (CRM, ERP, project management, financial systems).

---

*Generated: 2026-02-22*
