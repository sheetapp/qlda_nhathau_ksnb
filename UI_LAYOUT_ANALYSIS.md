# 📊 Phân Tích Bố Cục & Giao Diện UI

## I. KHO ỨNG DỤNG (App Store)

**File chính:** [app/dashboard/app-store/page.tsx](app/dashboard/app-store/page.tsx)  
**Component chính:** [components/app-grid.tsx](components/app-grid.tsx)

### 🎯 Cấu Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────┐
│  KHO ỨNG DỤNG                                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  [Chức năng] [Yêu thích] [Tất cả]  [🔍 Tìm] │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐         │
│  │ ★ App │ │ ★ App │ │ ★ App │ │ ★ App │         │
│  │ 🎨    │ │ 🎨    │ │ 🎨    │ │ 🎨    │         │
│  │ Name  │ │ Name  │ │ Name  │ │ Name  │         │
│  │ Desc  │ │ Desc  │ │ Desc  │ │ Desc  │         │
│  └───────┘ └───────┘ └───────┘ └───────┘         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 🔳 Layout Details

#### **1. Header Section**

| Thành phần | Kích thước | Styling |
|-----------|----------|---------|
| Container | 100% width | `p-6` |
| Nền | - | `bg-slate-50/10` |
| Chiều cao | Full screen | `h-full flex flex-col` |

#### **2. Tab Navigation Bar**

```tsx
<TabsList className="bg-slate-100/50 p-1 gap-1 h-auto shrink-0">
  <TabsTrigger
    value="functions"
    className="rounded-xl px-6 py-2 text-sm font-semibold 
               data-[state=active]:bg-white 
               data-[state=active]:text-primary 
               data-[state=active]:shadow-sm transition-all"
  >
    Chức năng
  </TabsTrigger>
  <!-- Yêu thích, Tất cả tabs -->
</TabsList>
```

**Tabs có sẵn:**
- 🔹 **Chức năng** - Hiển thị tất cả ứng dụng có sẵn
- ⭐ **Yêu thích** - Hiển thị các ứng dụng đã yêu thích
- 📋 **Tất cả** - Hiển thị toàn bộ catalog

**Styling:**
- Border radius: `rounded-xl`
- Padding: `px-6 py-2`
- Font: `text-sm font-semibold`
- Active state: White background + primary color text + shadow

#### **3. Search Bar**

```tsx
<div className="relative w-full sm:w-[320px]">
  <Search className="h-4 w-4 text-muted-foreground" />
  <Input
    placeholder="Tìm kiếm ứng dụng..."
    className="pl-10 h-10 bg-slate-50/50 
               rounded-xl focus-visible:ring-1 
               focus-visible:ring-primary/20"
  />
</div>
```

**Features:**
- 🔍 Icon search + text input
- Placeholder text: "Tìm kiếm ứng dụng..."
- Real-time filtering: Tìm theo `title` và `description`
- Responsive: Full width trên mobile, 320px trên desktop

---

### 🎨 App Grid Component

**File:** [components/app-grid.tsx](components/app-grid.tsx)

#### **Grid Layout**

```typescript
const gridClass = cn(
  "grid gap-6",
  detailed
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
)
```

**Responsive Breakpoints:**
| Screen | Detailed Mode | Normal Mode |
|--------|---------------|------------|
| Mobile | 1 cột | 1 cột |
| Tablet (sm) | 2 cột | 2 cột |
| Desktop (lg) | 3 cột | 3 cột |
| Large (xl) | 4 cột | 5 cột |
| 2XL | 5 cột | 5 cột |

#### **Card Structure**

```
┌──────────────────────────┐
│  ⭐ (Top Right Corner)   │
│                          │
│     ┌───────────────┐    │
│     │     🎨        │    │
│     │    ICON       │    │
│     └───────────────┘    │
│                          │
│      App Title           │
│     App Description      │
│                          │
│  ═══ Hover Effect ═══    │
└──────────────────────────┘
```

**Card Styling:**

| Thuộc tính | Value |
|-----------|-------|
| Background | `bg-white` |
| Border | `border-border border-slate-100` |
| Border Radius | `rounded-2xl` hoặc `rounded-[2.5rem]` |
| Padding | `p-8` |
| Shadow | `shadow-sm hover:shadow-2xl` |
| Transition | `hover:-translate-y-1.5` |

**Card Components:**
```tsx
// 1. Star Icon (Top Right)
<Button
  className="rounded-full opacity-0 group-hover:opacity-100
             bg-white shadow-md border border-slate-50"
  onClick={(e) => onToggleFavorite(app.id, e)}
>
  <Star className="fill-current" />
</Button>

// 2. Icon Container (Center)
<div className="rounded-2xl text-white shadow-xl 
                group-hover:scale-110 transition-transform">
  <app.icon className="h-8 w-8" />
</div>

// 3. Text Content (Bottom)
<h3 className="font-bold group-hover:text-primary">
  {app.title}
</h3>
<p className="text-slate-400 line-clamp-2">
  {app.description}
</p>

// 4. Bottom Hover Bar
<div className="absolute bottom-0 left-0 w-full
                bg-primary scale-x-0 group-hover:scale-x-100
                h-1 transition-transform" />
```

#### **Hover Effects**

```css
/* Group Hover Animations */
group-hover:shadow-2xl     /* Bóng đổ lớn hơn */
group-hover:-translate-y-1.5 /* Nâng lên 1.5px */
group-hover:scale-110      /* Icon phóng to 10% */
group-hover:text-primary   /* Text đổi màu */
group-hover:opacity-100    /* Star icon hiện lên */
group-hover:scale-x-100    /* Bottom bar hiển thị */
```

**Duration:** `duration-300 duration-500` smooth transitions

---

### 🌟 Features

✅ **Tab Navigation** - Chuyển giữa Chức năng, Yêu thích, Tất cả
✅ **Search/Filter** - Tìm kiếm real-time theo title & description
✅ **Favorites** - Lưu yêu thích vào localStorage
✅ **Responsive Grid** - Tự động điều chỉnh số cột theo screen size
✅ **Smooth Animations** - Hover effects mượt mà
✅ **Color Coding** - Mỗi app có color background riêng

---

---

## II. NHÂN SỰ TỔNG HỢP (Personnel Management)

**File chính:** [app/dashboard/personnel/page.tsx](app/dashboard/personnel/page.tsx)  
**Component chính:** [components/personnel/personnel-list.tsx](components/personnel/personnel-list.tsx)

### 🎯 Cấu Trúc Tổng Quan

```
┌──────────────────────────────────────────────────────────┐
│  NHÂN SỰ TỔNG HỢP                                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🔍 Tìm kiếm  [Dự án▼] [Phòng ban▼] [Trạng thái▼] │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ [✓] │ Avatar│ Tên      │ Email    │ Phòng │ ... │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ [ ] │ 👤   │ Nguyễn A │ ng@...   │ IT    │ ... │   │
│  │ [ ] │ 👤   │ Trần B   │ tr@...   │ HR    │ ... │   │
│  │ [ ] │ 👤   │ Hoàng C  │ ho@...   │ IT    │ ... │   │
│  │ [ ] │ 👤   │ Phạm D   │ ph@...   │ Sales │ ... │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ◀ Trang 1 / 5 ▶  Hiển thị: 20 mục │ ⬇️ Xuất Excel │   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 🔳 Layout Details

#### **1. Control Bar (Top)**

```tsx
<div className="space-y-6">
  <div className="flex flex-col xl:flex-row gap-4 
                  justify-between items-start xl:items-center px-1">
    
    {/* Search Input */}
    <div className="relative w-full md:w-72">
      <Search className="h-4 w-4" />
      <Input
        placeholder="Tìm kiếm..."
        className="pl-10 h-10 bg-card/40 rounded-xl"
      />
    </div>

    {/* Filters */}
    <Select value={projectFilter} onValueChange={setProjectFilter}>
      <SelectTrigger className="w-[220px] h-10 rounded-xl">
        <FolderKanban className="h-3.5 w-3.5" />
        <SelectValue placeholder="Dự án" />
      </SelectTrigger>
    </Select>

    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
      <SelectTrigger className="w-[240px] h-10 rounded-xl">
        <Building2 className="h-3.5 w-3.5" />
        <SelectValue placeholder="Phòng ban" />
      </SelectTrigger>
    </Select>

    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-[200px] h-10 rounded-xl">
        <CircleDot className="h-3.5 w-3.5" />
        <SelectValue placeholder="Trạng thái" />
      </SelectTrigger>
    </Select>
  </div>
</div>
```

**Styling:**
- Flex layout responsive: Column (mobile) → Row (xl+)
- Input width: `w-full md:w-72`
- Select width: 220px (Dự án) | 240px (Phòng ban) | 200px (Trạng thái)
- Border radius: `rounded-xl`
- Background: `bg-card/40`
- Gap: `gap-4`

#### **2. Filter Options**

**Project Filter (Dự án):**
```
┌─────────────────┐
│ 🗂 Tất cả dự án │
├─────────────────┤
│ Dự án A         │
│ Dự án B         │
│ Dự án C         │
└─────────────────┘
```

**Department Filter (Phòng ban):**
```
┌──────────────────┐
│ 🏢 Tất cả phòng  │
├──────────────────┤
│ Phòng IT         │
│ Phòng HR         │
│ Phòng Sales      │
│ Phòng Marketing  │
└──────────────────┘
```
_Lấy từ `uniqueDepartments` - tự động extract từ dữ liệu personnel_

**Status Filter (Trạng thái):**
```
┌──────────────────┐
│ ◯ Tất cả trạng   │
├──────────────────┤
│ • Đang làm việc  │
│ • Tạm dừng       │
│ • Nghỉ việc      │
└──────────────────┘
```

#### **3. Data Table**

**Table Structure:**

```tsx
<Table>
  <TableHeader>
    <TableRow className="border-border/50">
      <TableHead className="w-12">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={(checked) => handleSelectAll(!!checked)}
        />
      </TableHead>
      <TableHead className="w-12 text-center">Avatar</TableHead>
      <TableHead className="font-semibold">Tên nhân sự</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Phòng ban</TableHead>
      <TableHead>Chức vụ</TableHead>
      <TableHead>Trạng thái</TableHead>
      <TableHead className="text-center">Thao tác</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* Rows */}
  </TableBody>
</Table>
```

**Column Descriptions:**

| Column | Width | Component | Data |
|--------|-------|-----------|------|
| Checkbox | w-12 | `<Checkbox>` | Multi-select |
| Avatar | w-12 | `<Avatar>` | `avatar_url` |
| Tên nhân sự | Auto | `<span>` | `full_name` |
| Email | Auto | `<code>` | `email` |
| Phòng ban | Auto | `<Badge>` | `department` |
| Chức vụ | Auto | `<span>` | `position` |
| Trạng thái | Auto | `<Badge>` | `work_status` colored |
| Thao tác | Auto | `<DropdownMenu>` | Edit, Delete |

#### **4. Table Row - Data Cells**

**Avatar Column:**
```tsx
<TableCell className="text-center">
  <Avatar className="h-8 w-8">
    <AvatarImage src={user.avatar_url} />
    <AvatarFallback>{initials}</AvatarFallback>
  </Avatar>
</TableCell>
```

**Status Badge:**
```tsx
<Badge className={cn(
  "rounded-full px-3 py-1 text-xs font-semibold border",
  user.work_status === 'Đang làm việc' 
    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    : user.work_status === 'Tạm dừng'
    ? 'bg-orange-500/10 text-orange-600 border-orange-500/20'
    : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
)}>
  {user.work_status}
</Badge>
```

**Color Mapping:**
| Status | Color | Hex |
|--------|-------|-----|
| Đang làm việc | Emerald/Green | `emerald-600` |
| Tạm dừng | Orange | `orange-600` |
| Nghỉ việc | Slate/Gray | `slate-600` |

**Action Dropdown:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-40">
    <DropdownMenuItem 
      onClick={() => handleEdit(user)}
      className="cursor-pointer"
    >
      <Pencil className="h-4 w-4 mr-2" />
      Chỉnh sửa
    </DropdownMenuItem>
    <DropdownMenuItem
      onClick={() => handleDelete(user.email)}
      className="text-destructive cursor-pointer"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Xóa
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

#### **5. Pagination & Actions Footer**

```tsx
<div className="flex flex-col md:flex-row justify-between 
                items-center gap-4 pt-4 border-t">
  
  {/* Pagination */}
  <div className="flex items-center gap-2">
    <Button
      variant="ghost"
      size="icon"
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
    
    <span className="text-sm text-slate-600">
      Trang {currentPage} / {totalPages}
    </span>
    
    <Button
      variant="ghost"
      size="icon"
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>

  {/* Items Per Page */}
  <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
    <SelectTrigger className="w-[180px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="10">10 mục/trang</SelectItem>
      <SelectItem value="20">20 mục/trang</SelectItem>
      <SelectItem value="50">50 mục/trang</SelectItem>
      <SelectItem value="all">Hiển thị tất cả</SelectItem>
    </SelectContent>
  </Select>

  {/* Bulk Actions */}
  {selectedUsers.length > 0 && (
    <div className="flex gap-2">
      <span className="text-sm text-slate-600">
        {selectedUsers.length} mục được chọn
      </span>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleBulkDelete}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Xóa {selectedUsers.length}
      </Button>
    </div>
  )}

  {/* Export Button */}
  <Button
    variant="outline"
    size="sm"
    onClick={handleExportExcel}
  >
    <Download className="h-4 w-4 mr-2" />
    Xuất Excel
  </Button>
</div>
```

---

### 🎯 Main Features

#### **1. Search & Filtering**

```typescript
const filteredUsers = users.filter(user => {
  // Project filter
  if (projectFilter !== 'all' && !user.project_ids?.includes(projectFilter)) {
    return false
  }
  // Status filter
  if (statusFilter !== 'all' && user.work_status !== statusFilter) {
    return false
  }
  // Department filter
  if (departmentFilter !== 'all' && user.department !== departmentFilter) {
    return false
  }
  // Search term
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.department?.toLowerCase().includes(searchLower) ||
      user.position?.toLowerCase().includes(searchLower) ||
      user.employee_id?.toLowerCase().includes(searchLower)
    )
  }
  return true
})
```

**Search Fields:**
- ✅ Full name (Họ và tên)
- ✅ Email
- ✅ Department (Phòng ban)
- ✅ Position (Chức vụ)
- ✅ Employee ID (Mã nhân viên)

#### **2. Multi-Select & Bulk Actions**

- **Checkbox in Header** → Select all visible rows
- **Checkboxes in Rows** → Individual selection
- **Selection State:**
  - `allSelected` = All filtered users selected
  - `someSelected` = Some rows selected
  - `selectedUsers` = Array of selected emails
- **Bulk Delete** → Delete multiple users at once
- **Indeterminate State** → Shown when some (not all) selected

#### **3. Pagination**

```typescript
const totalItems = filteredUsers.length
const effectiveItemsPerPage = showAllItems ? totalItems : itemsPerPage
const totalPages = Math.ceil(totalItems / effectiveItemsPerPage)
const startIndex = (currentPage - 1) * effectiveItemsPerPage
const endIndex = startIndex + effectiveItemsPerPage

const paginatedUsers = filteredUsers.slice(startIndex, endIndex)
```

**Options:**
- 10 items/page
- 20 items/page (default)
- 50 items/page
- Show all

#### **4. Excel Import/Export**

**Export Structure:**
```
STT | Email công việc | Họ và tên | Mã nhân viên | Số điện thoại | Phòng ban | Chức vụ | Level | Trạng thái | ...
1   | ng@example.com  | Nguyễn A | EMP001      | 0123456789    | IT        | Dev    | 4     | Đang làm việc
```

**Import Features:**
- Parse Excel file (XLSX)
- Map columns to database fields
- Bulk create personnel records
- Validate email (required)
- Empty fields → Default values

**Export Fields (20+ columns):**
```
STT, Email công việc, Họ và tên, Mã nhân viên, Số điện thoại,
Phòng ban, Chức vụ, Level, Trạng thái, Quyền truy cập,
Ngày vào làm, Loại hợp đồng, Hạn hợp đồng, Địa điểm làm việc,
Dự án, Giới tính, Ngày sinh, CMND/CCCD, Ngày cấp, Nơi cấp,
...
```

#### **5. Form Management**

**Edit/Add Dialog:**
- Opens `PersonnelSheet` component
- Passes selected user for editing
- Refreshes personnel store after submit

**Detail View:**
- `PersonnelDetailView` component
- Shows full user information
- Read-only or editable modes

---

### 📊 Data Structures

#### **Personnel Object**
```typescript
interface Personnel {
  email: string
  full_name: string
  employee_id?: string
  phone_number?: string | null
  avatar_url?: string | null
  department?: string | null
  position?: string | null
  access_level: number           // 1=Admin, 2=Dir, 3=Manager, 4=Staff
  work_status?: string            // "Đang làm việc", "Tạm dừng", "Nghỉ việc"
  project_ids: string[]
  // 20+ additional fields...
}
```

#### **Role Mapping**
```typescript
const ROLE_MAP = {
  1: { label: 'Admin', color: 'bg-rose-500/10 text-rose-600' },
  2: { label: 'Giám đốc', color: 'bg-amber-500/10 text-amber-600' },
  3: { label: 'Trưởng phòng', color: 'bg-blue-500/10 text-blue-600' },
  4: { label: 'Nhân viên', color: 'bg-slate-500/10 text-slate-600' }
}
```

#### **Status Mapping**
```typescript
const STATUS_MAP = {
  'Đang làm việc': { color: 'emerald' },
  'Tạm dừng': { color: 'orange' },
  'Nghỉ việc': { color: 'slate' }
}
```

---

### 🎨 UI Components Used

| Component | Purpose | Import |
|-----------|---------|--------|
| `Table` | Data grid layout | @/components/ui/table |
| `Button` | Actions (Edit, Delete, etc) | @/components/ui/button |
| `Input` | Search input | @/components/ui/input |
| `Select` | Filter dropdowns | @/components/ui/select |
| `Badge` | Status/Department tags | @/components/ui/badge |
| `Checkbox` | Multi-select | @/components/ui/checkbox |
| `Avatar` | User profile pictures | @/components/ui/avatar |
| `DropdownMenu` | Row actions | @/components/ui/dropdown-menu |
| `Separator` | Visual dividers | @/components/ui/separator |
| `Sheet` | Edit dialog modal | (PersonnelSheet custom) |

---

---

## III. NHÂN SỰ TỔNG HỢP (Variant: Resources/Tài Nguyên)

**File chính:** [components/resources/resource-list.tsx](components/resources/resource-list.tsx)

### 🔳 Layout Comparison

```
PERSONNEL                          vs    RESOURCES
────────────────────────────────────────────────────
Name, Email, Department                Resource Name, Group, Unit
Avatar, Position, Status           Quantity In/Out/Balance, Price
Edit/Delete Actions                Edit/Delete Actions with sorting
```

### 🎯 Key Differences

| Aspect | Personnel | Resources |
|--------|-----------|-----------|
| Primary Table Cols | Name, Email, Dept, Position | Name, Group, Unit, Qty |
| Filters | Project, Department, Status | Group, Project |
| Sorting | Not visible in main | Click column header → Sort A-Z/Z-A |
| Cell Content | Text, Badge | Numbers, Formatted currency |
| Row Actions | Edit/Delete dropdown | Edit/Delete dropdown |
| Multi-select | ✅ Checkbox on rows | ✅ Checkbox on rows |
| Bulk Actions | Bulk delete | Bulk delete |
| Export | Excel export | Excel export |

### 📊 Resource Table Structure

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-12">
        <Checkbox checked={allSelected} />
      </TableHead>
      <TableHead 
        onClick={() => handleSort('resource_name')}
        className="cursor-pointer hover:bg-slate-100"
      >
        Tên tài nguyên
        {sortConfig?.key === 'resource_name' && (
          <ArrowUpDown className="inline ml-2 h-4 w-4" />
        )}
      </TableHead>
      <TableHead>Nhóm</TableHead>
      <TableHead>Đơn vị</TableHead>
      <TableHead className="text-right">Nhập</TableHead>
      <TableHead className="text-right">Xuất</TableHead>
      <TableHead className="text-right">Tồn kho</TableHead>
      <TableHead className="text-center">Thao tác</TableHead>
    </TableRow>
  </TableHeader>
</Table>
```

#### **Sorting Feature**
```typescript
const [sortConfig, setSortConfig] = useState<{
  key: SortKey
  direction: 'asc' | 'desc'
} | null>(null)

const handleSort = (key: SortKey) => {
  setSortConfig(prevConfig => ({
    key,
    direction: prevConfig?.key === key && prevConfig.direction === 'asc' 
      ? 'desc' 
      : 'asc'
  }))
}
```

**Sortable Columns:**
- `resource_name` - Tên tài nguyên
- `group_name` - Nhóm
- `quantity_in` - Nhập
- `quantity_out` - Xuất
- `quantity_balance` - Tồn kho
- `unit_price` - Giá
- `project_name` - Dự án

---

## IV. COMPARISON MATRIX

### 🔄 App Store vs Personnel vs Resources

```
┌─────────────────────┬────────────────┬────────────────┬────────────────┐
│ Feature             │ App Store      │ Personnel      │ Resources      │
├─────────────────────┼────────────────┼────────────────┼────────────────┤
│ Layout Type         │ Grid Cards     │ Table          │ Table          │
│ Responsive Cols     │ 1-5 (dynamic)  │ Full width     │ Full width     │
│ Search              │ ✅ Real-time   │ ✅ Real-time   │ ✅ Real-time   │
│ Filters             │ Tabs           │ Dropdowns      │ Dropdowns      │
│ Multi-select        │ ❌             │ ✅             │ ✅             │
│ Sorting             │ ❌             │ ❌             │ ✅ Column sort │
│ Pagination          │ ❌ (all)       │ ✅             │ ✅             │
│ Bulk Actions        │ ❌             │ ✅ Delete      │ ✅ Delete      │
│ Import/Export       │ ❌             │ ✅ Excel       │ ✅ Excel       │
│ Hover Effects       │ ✅ Animations  │ ❌             │ ❌             │
│ Favorites           │ ✅ Star icon   │ ❌             │ ❌             │
│ Edit Modal          │ Navigation     │ ✅ Sheet       │ ✅ Dialog      │
│ Avatar/Icons        │ Color boxes    │ ✅ User avatar │ ❌             │
└─────────────────────┴────────────────┴────────────────┴────────────────┘
```

---

## V. COLOR & STYLING SYSTEM

### **Status Colors (Personnel)**

```tsx
// Work Status
Đang làm việc → emerald-600 (Green)
Tạm dừng     → orange-600 (Orange)
Nghỉ việc    → slate-600 (Gray)

// Role Access Level
Admin (1)    → rose-600 (Red)
Director (2) → amber-600 (Amber)
Manager (3)  → blue-600 (Blue)
Staff (4)    → slate-600 (Gray)
```

### **Icon System**

| Component | Icons | Count |
|-----------|-------|-------|
| App Store | Lucide React icons | 100+ available |
| Personnel | User, Mail, Phone, Building, Shield, etc. | 14 icons |
| Resources | Package, Layers, Info, Folder, etc. | 12 icons |

**Icon Library:** `lucide-react` v0.563.0

---

## VI. ACCESSIBILITY & UX Features

✅ **Search** - Real-time filtering with keyboard input
✅ **Keyboard Navigation** - Tab through dropdowns, buttons
✅ **Screen Reader Support** - Semantic HTML structure
✅ **Visual Feedback** - Hover states, loading spinners
✅ **Pagination** - Navigate large datasets
✅ **Multi-select** - Bulk operations support
✅ **Confirmation Dialogs** - Delete confirmations
✅ **Loading States** - Visual loading indicators
✅ **Empty States** - Messages when no data (e.g., "Chưa có ứng dụng yêu thích")
✅ **Error Handling** - Alert messages on failures

---

## VII. Performance Optimizations

1. **Pagination** - Show 20 items per page by default
2. **Lazy Loading** - Only render visible table rows
3. **Memoization** - Store subscriptions prevent re-renders
4. **Caching** - Personnel/Resource store cache
5. **Real-time Search** - Client-side filtering (no API calls)

---

## VIII. File Structure Summary

```
components/
├── app-grid.tsx                    ← App grid component
├── personnel/
│   ├── personnel-list.tsx          ← Main personnel table
│   ├── personnel-detail-view.tsx   ← Detail view modal
│   ├── personnel-dialog.tsx        ← Edit form
│   └── personnel-sheet.tsx         ← Add/edit sheet
├── resources/
│   ├── resource-list.tsx           ← Main resource table
│   ├── resource-dialog.tsx         ← Edit form
│   └── resource-list.tsx.bak       ← Backup
└── ui/                             ← Shadcn UI components

app/
├── dashboard/
│   ├── app-store/
│   │   ├── page.tsx                ← App store main page
│   │   ├── administration/
│   │   └── personnel/
│   ├── personnel/
│   │   └── page.tsx                ← Personnel main page
│   └── resources/
│       └── page.tsx                ← Resources main page
```

---

**Last Updated:** 25/02/2026  
**Analyzed by:** GitHub Copilot  
**Scope:** UI/UX Layout Analysis only
