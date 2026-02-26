# 📊 Phân Tích Bố Cục & Giao Diện - MARKETING CAMPAIGNS

**Document:** Marketing Campaign Management UI/UX Analysis  
**Date:** 25/02/2026  
**Status:** Planned Implementation Reference  
**Based on:** App Store Marketing Section

---

## I. MARKETING CAMPAIGNS OVERVIEW

**Planned Location:** `/dashboard/app-store/marketing`  
**Category:** Marketing Management System  
**Feature Groups:** 2 categories, 10+ campaign apps

### 🎯 Cấu Trúc Tổng Quan

```
┌────────────────────────────────────────────────────────────┐
│  CHIẾN DỊCH MARKETING                                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🔍 Tìm kiếm│ [Dự án▼] [Loại▼] [Trạng thái▼] [Tháng▼]│ │
│  │ ◀ ▶ Trang 1 / 5 │ 20 mục │ ⬇️ Xuất Excel          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ [✓] │ Tên Campaign │ Loại │ Trạng  │ Kênh │ Ngân... │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ [ ] │ Campaign A   │ Email│ Đang...│ Email│ 500K... │ │
│  │ [ ] │ Campaign B   │ SMS  │ Hoàn..│ SMS  │ 200K.. │ │
│  │ [ ] │ Campaign C   │ Social│ Chờ..│ FB,IG│ 300K.. │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## II. FEATURE CATEGORIES

### **Category 1: Chiến Dịch Marketing (Marketing Campaigns)**

#### 1️⃣ **Chiến Dịch (Campaigns)**
```
┌─────────────────────────────────────┐
│ 🚀 Chiến Dịch                       │
├─────────────────────────────────────┤
│                                     │
│ Tạo chiến dịch, mục tiêu, thời     │
│ gian, ngân sách.                    │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- ✅ Create new campaigns
- ✅ Set campaign objectives (Awareness, Lead generation, Conversion, etc.)
- ✅ Define timeline (Start date, End date)
- ✅ Budget allocation & tracking
- ✅ Target audience selection
- ✅ Campaign status management (Draft, Running, Paused, Completed)
- ✅ Multi-channel campaign support

**Data Fields:**
```
Campaign {
  campaign_id: string (UUID)
  campaign_name: string
  description: text
  objective: enum (Awareness, Lead, Conversion, Retention)
  start_date: date
  end_date: date
  total_budget: decimal(15,2)
  spent_amount: decimal(15,2)
  currency_code: string (VND, USD)
  status: enum (Draft, Running, Paused, Completed)
  target_audience: text (JSON)
  channels: string[] (Email, SMS, Social, Web)
  created_by: FK -> users.email
  project_id: FK -> projects.project_id
  created_at: timestamp
  updated_at: timestamp
}
```

---

#### 2️⃣ **Email Marketing**
```
┌─────────────────────────────────────┐
│ 📧 Email Marketing                  │
├─────────────────────────────────────┤
│                                     │
│ Gửi email hàng loạt, mẫu, A/B      │
│ test.                               │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- 📋 Email template management (Create, Edit, Preview)
- 📊 A/B testing (Subject lines, content variations)
- 👥 Recipient list management & segmentation
- 📈 Delivery tracking & analytics
- ⏰ Schedule send times (Optimal send time recommendations)
- 🔄 Email automation workflows
- 📉 Unsubscribe management

**Data Fields:**
```
EmailCampaign {
  email_campaign_id: string
  campaign_id: FK -> campaigns.campaign_id
  template_id: FK -> email_templates.template_id
  recipient_count: integer
  sent_count: integer
  opened_count: integer
  clicked_count: integer
  bounced_count: integer
  unsubscribed_count: integer
  open_rate: decimal(5,2)
  click_rate: decimal(5,2)
  bounce_rate: decimal(5,2)
  scheduled_time: timestamp
  sent_time: timestamp
  status: enum (Draft, Scheduled, Sent, Failed)
}
```

**Metrics Display:**
| Metric | Display | Calculation |
|--------|---------|------------|
| Open Rate | 45.3% | opened_count / sent_count * 100 |
| Click Rate | 12.1% | clicked_count / opened_count * 100 |
| Bounce Rate | 2.5% | bounced_count / sent_count * 100 |

---

#### 3️⃣ **SMS & Thông báo (SMS & Notifications)**
```
┌─────────────────────────────────────┐
│ 💬 SMS & Thông báo                 │
├─────────────────────────────────────┤
│                                     │
│ SMS, push, tin nhắn trong app.      │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- 📱 SMS message templates
- 🔔 Push notifications
- 💭 In-app notifications
- 📞 Two-way SMS (Reply tracking)
- 🎯 By segment targeting
- ⏰ Scheduled delivery
- 📊 Delivery & engagement metrics

**Channels:**
```
Notification {
  notification_id: string
  type: enum (SMS, Push, InApp)
  content: text
  recipient_list_id: FK
  sent_count: integer
  delivered_count: integer
  failed_count: integer
  engagement_count: integer
  delivery_status: enum (Pending, Sent, Delivered, Failed)
  sent_at: timestamp
}
```

---

#### 4️⃣ **Mạng Xã Hội (Social Media)**
```
┌─────────────────────────────────────┐
│ 👥 Mạng Xã Hội                      │
├─────────────────────────────────────┤
│                                     │
│ Lịch đăng bài, đa kênh, lịch sử    │
│ đăng.                               │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- 📅 Social media post scheduling
- 🔀 Multi-platform posting (Facebook, Instagram, LinkedIn, TikTok, Twitter)
- 📸 Media asset management (Images, Videos)
- 💬 Hashtag suggestions & management
- 📊 Engagement tracking (Likes, Shares, Comments)
- 🔄 Repost scheduling
- 📱 Mobile-first content preview

**Supported Channels:**
| Channel | Features | Analytics |
|---------|----------|-----------|
| Facebook | Page posts, Stories | Likes, Comments, Shares |
| Instagram | Feed posts, Stories, Reels | Likes, Saves, Shares |
| LinkedIn | Professional posts | Connections, Clicks |
| TikTok | Video posts | Views, Likes, Shares |
| Twitter | Tweets, Threads | Retweets, Replies, Favorites |

**Data Structure:**
```
SocialPost {
  post_id: string
  campaign_id: FK -> campaigns.campaign_id
  platform: enum (Facebook, Instagram, LinkedIn, TikTok, Twitter)
  content: text
  media_ids: string[]
  scheduled_time: timestamp
  posted_time: timestamp
  status: enum (Draft, Scheduled, Published, Failed)
  likes_count: integer
  comments_count: integer
  shares_count: integer
  views_count: integer
}
```

---

#### 5️⃣ **Báo Cáo Chiến Dịch (Campaign Reports)**
```
┌─────────────────────────────────────┐
│ 📊 Báo Cáo Chiến Dịch              │
├─────────────────────────────────────┤
│                                     │
│ Hiệu quả, tỷ lệ mở/click, chuyển   │
│ đổi.                                │
│                                     │
└─────────────────────────────────────┘
```

**Report Sections:**

1. **Dashboard Overview**
   - Cross-channel performance summary
   - Multi-metric KPI cards
   - ROI calculation
   - Budget vs. Actual spending

2. **Channel Performance**
   - Individual channel metrics
   - Comparative analysis
   - Best-performing content
   - Peak engagement times

3. **Audience Analytics**
   - Demographic breakdowns
   - Engagement by segment
   - Conversion funnel analysis
   - Customer journey tracking

4. **Conversion Tracking**
   - Goal completion rates
   - Attribution modeling
   - Customer lifetime value (CLV)
   - Revenue impact

**Metrics Panel:**
```
Campaign Report {
  report_id: string
  campaign_id: FK -> campaigns.campaign_id
  report_period: enum (Daily, Weekly, Monthly)
  total_impressions: integer
  total_clicks: integer
  total_conversions: integer
  conversion_rate: decimal(5,2)
  cost_per_click: decimal(10,2)
  cost_per_conversion: decimal(10,2)
  roi: decimal(5,2)
  generated_revenue: decimal(15,2)
}
```

---

#### 6️⃣ **Thiết Lập Chiến Dịch (Campaign Settings)**
```
┌─────────────────────────────────────┐
│ ⚙️ Thiết Lập Chiến Dịch             │
├─────────────────────────────────────┤
│                                     │
│ Kênh, mẫu, gợi ý, tối ưu hóa.      │
│                                     │
└─────────────────────────────────────┘
```

**Configuration Options:**

- **Channel Configuration**
  - Enable/disable channels per campaign
  - Channel-specific settings
  - API credentials management

- **Template Management**
  - Default templates per channel
  - Custom branding options
  - Template approval workflow

- **Optimization Settings**
  - A/B testing configurations
  - Send time optimization
  - Frequency capping
  - Audience exclusions

- **Compliance & Legal**
  - GDPR compliance checks
  - CAN-SPAM compliance
  - Unsubscribe management
  - Data retention policies

---

### **Category 2: Nội Dung & Truyền Thông (Content & Communications)**

#### 7️⃣ **Quản Lý Nội Dung (Content Management)**
```
┌─────────────────────────────────────┐
│ 📝 Quản Lý Nội Dung                 │
├─────────────────────────────────────┤
│                                     │
│ Bài viết, landing page, bài quảng   │
│ cáo.                                │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- 📄 Content creation & editing (WYSIWYG editor)
- 📋 Content scheduling
- 👥 Multi-author collaboration
- 🔄 Version control & rollback
- 📊 Performance analytics per content piece
- 🏷️ Content categorization & tagging
- 🔐 Draft, Review, Published states

**Content Types:**
```
Content {
  content_id: string
  title: string
  slug: string
  content_type: enum (BlogPost, LandingPage, Ad, Email)
  body: text
  summary: text
  featured_image_id: FK -> media_assets.asset_id
  status: enum (Draft, InReview, Scheduled, Published)
  author_email: FK -> users.email
  published_at: timestamp
  scheduled_at: timestamp | null
  views_count: integer
  engagement_rate: decimal(5,2)
}
```

---

#### 8️⃣ **Thư Viện Tài Sản (Asset Library)**
```
┌─────────────────────────────────────┐
│ 🎨 Thư Viện Tài Sản                 │
├─────────────────────────────────────┤
│                                     │
│ Hình ảnh, video, file tài sử dụng.  │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- 🖼️ Image & video management
- 📂 Folder organization
- 🏷️ Smart tagging & search
- 📊 Usage analytics
- 📥 Batch upload
- 🔗 Asset linking to campaigns
- 📐 Image size optimization
- 🎬 Video thumbnail generation

**Asset Organization:**
```
MediaAsset {
  asset_id: string (UUID)
  filename: string
  file_type: enum (Image, Video, Document)
  file_size: bigint
  url: text
  thumbnail_url: text | null
  width: integer | null
  height: integer | null
  duration: decimal | null (for videos)
  tags: string[]
  folder_path: text
  usage_count: integer
  last_used_at: timestamp
}
```

**Asset Types:**
| Type | Supported Formats | Use Case |
|------|------------------|----------|
| Images | JPG, PNG, WebP, GIF | Social posts, Emails, Web |
| Videos | MP4, WebM, MOV | Social, Web, Ads |
| Documents | PDF, DOCX, XLSX | Resources, Guides |

---

#### 9️⃣ **Landing Page Builder**
```
┌─────────────────────────────────────┐
│ 🎯 Landing Page                     │
├─────────────────────────────────────┤
│                                     │
│ Tạo trang mục, form đăng ký, theo   │
│ dõi.                                │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- 🖱️ Drag-and-drop page builder
- 📱 Responsive design preview
- 🎨 Template library (50+ templates)
- 📝 Form builder with conditional logic
- 🔍 SEO optimization tools
- 📊 Conversion tracking
- 🔗 Custom domain support
- 💾 Auto-save functionality

**Page Components:**
```
LandingPage {
  page_id: string
  title: string
  slug: string
  template_id: FK -> lp_templates.template_id
  sections: SectionData[]
  campaign_id: FK -> campaigns.campaign_id
  published_at: timestamp
  status: enum (Draft, Published, Archived)
  visitors_count: integer
  conversion_count: integer
  conversion_rate: decimal(5,2)
}

SectionData {
  section_id: string
  type: enum (Hero, Features, Pricing, Testimonial, CTA, Form)
  content: JSON
  background_image_id: FK | null
  order: integer
}
```

---

#### 🔟 **Form Thu Thập Lead (Lead Capture Forms)**
```
┌─────────────────────────────────────┐
│ 📋 Form Thu Thập Lead               │
├─────────────────────────────────────┤
│                                     │
│ Form nhập, popup, tích hợp.         │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- 📝 Form builder (Drag & drop)
- 🎯 Progressive profiling
- 🔄 Lead scoring automation
- 🎨 Pop-up forms & embedded forms
- 📱 Mobile-optimized forms
- ✅ Conditional field logic
- 🤖 Auto-response emails
- 🔗 CRM integration
- 📊 Form analytics

**Form Types:**
```
LeadForm {
  form_id: string
  name: string
  form_type: enum (Embedded, Popup, Inline, Standalone)
  fields: FormField[]
  success_message: text
  confirmation_email_template_id: FK | null
  campaign_id: FK -> campaigns.campaign_id
  submissions_count: integer
  conversion_rate: decimal(5,2)
  is_published: boolean
}

FormField {
  field_id: string
  label: string
  type: enum (Text, Email, Phone, Select, Textarea, Checkbox)
  required: boolean
  placeholder: text | null
  validation: text | null
  order: integer
}
```

---

## III. MARKETING PAGE LAYOUT

### **Main Campaign List Page**

#### **1. Header & Controls**

```tsx
<div className="space-y-6">
  {/* Search & Filters */}
  <div className="flex flex-col xl:flex-row gap-4 px-1">
    
    {/* Search Input */}
    <div className="relative w-full md:w-80">
      <Search className="absolute left-3 top-1/2 h-4 w-4" />
      <Input
        placeholder="Tìm kiếm chiến dịch..."
        className="pl-10 h-10 rounded-xl"
      />
    </div>

    {/* Project Filter */}
    <Select value={projectFilter} onValueChange={setProjectFilter}>
      <SelectTrigger className="w-[240px] h-10 rounded-xl">
        <FolderKanban className="h-3.5 w-3.5 mr-2" />
        <SelectValue placeholder="Dự án" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả dự án</SelectItem>
        {projects.map(p => (
          <SelectItem key={p.project_id} value={p.project_id}>
            {p.project_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* Campaign Type Filter */}
    <Select value={typeFilter} onValueChange={setTypeFilter}>
      <SelectTrigger className="w-[220px] h-10 rounded-xl">
        <Megaphone className="h-3.5 w-3.5 mr-2" />
        <SelectValue placeholder="Loại" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả loại</SelectItem>
        <SelectItem value="Email">Email Campaign</SelectItem>
        <SelectItem value="SMS">SMS Campaign</SelectItem>
        <SelectItem value="Social">Social Media</SelectItem>
        <SelectItem value="Landing">Landing Page</SelectItem>
      </SelectContent>
    </Select>

    {/* Status Filter */}
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-[200px] h-10 rounded-xl">
        <CircleDot className="h-3.5 w-3.5 mr-2" />
        <SelectValue placeholder="Trạng thái" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả</SelectItem>
        <SelectItem value="Draft">Nháp</SelectItem>
        <SelectItem value="Running">Đang chạy</SelectItem>
        <SelectItem value="Scheduled">Lên lịch</SelectItem>
        <SelectItem value="Completed">Hoàn thành</SelectItem>
        <SelectItem value="Paused">Tạm dừng</SelectItem>
      </SelectContent>
    </Select>

    {/* Date Range Filter */}
    <DateRangePicker
      value={dateRange}
      onValueChange={setDateRange}
      placeholder="Chọn ngày"
    />

  </div>
</div>
```

---

#### **2. Campaign Table**

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-12">
        <Checkbox
          checked={allSelected}
          onCheckedChange={handleSelectAll}
        />
      </TableHead>
      <TableHead className="font-semibold">Tên Chiến Dịch</TableHead>
      <TableHead>Loại</TableHead>
      <TableHead>Trạng thái</TableHead>
      <TableHead>Kênh</TableHead>
      <TableHead className="text-right">Ngân sách</TableHead>
      <TableHead className="text-right">Đã chi</TableHead>
      <TableHead className="text-right">ROI</TableHead>
      <TableHead>Ngày bắt đầu</TableHead>
      <TableHead className="text-center">Hành động</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {campaigns.map(campaign => (
      <TableRow key={campaign.campaign_id}>
        
        {/* Checkbox */}
        <TableCell>
          <Checkbox
            checked={selectedCampaigns.includes(campaign.campaign_id)}
            onCheckedChange={(checked) => handleSelectCampaign(campaign.campaign_id, !!checked)}
          />
        </TableCell>

        {/* Campaign Name */}
        <TableCell className="font-medium">
          {campaign.campaign_name}
        </TableCell>

        {/* Type Badge */}
        <TableCell>
          <Badge className="rounded-full px-3 py-1 text-xs font-semibold">
            {campaign.type === 'Email' ? '📧' : campaign.type === 'SMS' ? '💬' : campaign.type === 'Social' ? '👥' : '🎯'} {campaign.type}
          </Badge>
        </TableCell>

        {/* Status Badge */}
        <TableCell>
          <Badge className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold border",
            campaign.status === 'Running' 
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              : campaign.status === 'Draft'
              ? 'bg-slate-500/10 text-slate-600 border-slate-500/20'
              : campaign.status === 'Scheduled'
              ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
          )}>
            {campaign.status}
          </Badge>
        </TableCell>

        {/* Channels */}
        <TableCell>
          <div className="flex gap-1">
            {campaign.channels.map(ch => (
              <span key={ch} className="text-xs px-2 py-1 bg-slate-100 rounded">
                {ch}
              </span>
            ))}
          </div>
        </TableCell>

        {/* Budget */}
        <TableCell className="text-right font-semibold">
          {formatCurrency(campaign.total_budget)}
        </TableCell>

        {/* Spent */}
        <TableCell className="text-right">
          {formatCurrency(campaign.spent_amount)}
        </TableCell>

        {/* ROI */}
        <TableCell className="text-right">
          <span className={cn(
            "font-semibold",
            campaign.roi > 0 ? "text-emerald-600" : "text-red-600"
          )}>
            {formatPercent(campaign.roi)}%
          </span>
        </TableCell>

        {/* Start Date */}
        <TableCell>
          {formatDate(campaign.start_date)}
        </TableCell>

        {/* Actions */}
        <TableCell className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="h-4 w-4 mr-2" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <BarChart3 className="h-4 w-4 mr-2" />
                Báo cáo
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Pencil className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onClick={() => handleDelete(campaign.campaign_id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>

      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

#### **3. Status Colors & Styling**

```typescript
const STATUS_COLORS = {
  'Draft': { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/20' },
  'Scheduled': { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  'Running': { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
  'Paused': { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20' },
  'Completed': { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' }
}

const CHANNEL_ICONS = {
  'Email': '📧',
  'SMS': '💬',
  'Social': '👥',
  'Push': '🔔',
  'Web': '🌐',
  'Landing': '🎯'
}

const ROI_COLORS = {
  positive: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  negative: 'text-red-600 bg-red-50 border-red-200',
  neutral: 'text-slate-600 bg-slate-50 border-slate-200'
}
```

---

#### **4. Pagination & Bulk Actions**

```tsx
<div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t">
  
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
  {selectedCampaigns.length > 0 && (
    <div className="flex gap-2">
      <span className="text-sm text-slate-600">
        {selectedCampaigns.length} chiến dịch được chọn
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleBulkPause}
      >
        <Pause className="h-4 w-4 mr-2" />
        Tạm dừng
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleBulkDelete}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Xóa {selectedCampaigns.length}
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

## IV. CAMPAIGN DETAIL VIEW

### **KPI Dashboard**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
  
  {/* Metric Card 1: Budget */}
  <MetricCard
    label="Ngân sách"
    value={formatCurrency(campaign.total_budget)}
    icon={<Wallet className="h-5 w-5" />}
    color="blue"
  />

  {/* Metric Card 2: Spent */}
  <MetricCard
    label="Đã chi"
    value={formatCurrency(campaign.spent_amount)}
    subValue={`${formatPercent((campaign.spent_amount / campaign.total_budget) * 100)}%`}
    icon={<TrendingDown className="h-5 w-5" />}
    color="orange"
  />

  {/* Metric Card 3: Impressions */}
  <MetricCard
    label="Impressions"
    value={formatNumber(campaign.total_impressions)}
    trend={campaign.impressionTrend}
    icon={<Eye className="h-5 w-5" />}
    color="purple"
  />

  {/* Metric Card 4: Conversions */}
  <MetricCard
    label="Conversions"
    value={formatNumber(campaign.conversions)}
    subValue={`${formatPercent(campaign.conversion_rate)}%`}
    icon={<CheckCircle className="h-5 w-5" />}
    color="emerald"
  />

  {/* Metric Card 5: ROI */}
  <MetricCard
    label="ROI"
    value={`${formatPercent(campaign.roi)}%`}
    trend={campaign.roi > 0 ? 'up' : 'down'}
    icon={<TrendingUp className="h-5 w-5" />}
    color={campaign.roi > 0 ? 'emerald' : 'red'}
  />

</div>
```

---

### **Charts & Analytics**

```tsx
{/* Performance Over Time */}
<Card>
  <CardHeader>
    <CardTitle className="text-base">Performance Trend</CardTitle>
  </CardHeader>
  <CardContent>
    <LineChart
      data={performanceData}
      lines={[
        { key: 'impressions', label: 'Impressions', color: '#8b5cf6' },
        { key: 'clicks', label: 'Clicks', color: '#ec4899' },
        { key: 'conversions', label: 'Conversions', color: '#10b981' }
      ]}
    />
  </CardContent>
</Card>

{/* Channel Comparison */}
<Card>
  <CardHeader>
    <CardTitle className="text-base">By Channel</CardTitle>
  </CardHeader>
  <CardContent>
    <BarChart
      data={channelData}
      categories={['Email', 'SMS', 'Social', 'Web']}
      metrics={['impressions', 'clicks', 'conversions']}
    />
  </CardContent>
</Card>

{/* Conversion Funnel */}
<Card>
  <CardHeader>
    <CardTitle className="text-base">Conversion Funnel</CardTitle>
  </CardHeader>
  <CardContent>
    <FunnelChart
      steps={[
        { label: 'Impressions', value: campaign.total_impressions },
        { label: 'Clicks', value: campaign.total_clicks },
        { label: 'Conversions', value: campaign.conversions }
      ]}
    />
  </CardContent>
</Card>
```

---

## V. QUICK COMPARISON WITH PERSONNEL

| Feature | Personnel | Marketing |
|---------|-----------|-----------|
| **Data Type** | User profiles | Campaign data |
| **Primary View** | Table list | Table + Dashboard |
| **Multi-select** | ✅ Checkboxes | ✅ Checkboxes |
| **Bulk Actions** | Delete | Pause, Delete, Archive |
| **Filters** | Project, Dept, Status | Project, Type, Status, Date Range |
| **Sorting** | ❌ | ✅ Optional |
| **Metrics** | Simple badges | Complex KPIs & Charts |
| **Export** | Excel | Excel + PDF reports |
| **Detail View** | Personnel profile | Campaign dashboard |
| **Analytics** | ❌ | ✅ Full analytics suite |
| **Automation** | ❌ | ✅ Workflow automation |

---

## VI. COMPONENTS NEEDED

### **New Components to Create**

```
components/
├── marketing/
│   ├── campaign-list.tsx              ← Main campaign table
│   ├── campaign-detail-view.tsx       ← Campaign dashboard
│   ├── campaign-dialog.tsx            ← Create/Edit form
│   ├── campaign-sheet.tsx             ← Add sheet
│   ├── metric-card.tsx                ← KPI card component
│   ├── campaign-chart.tsx             ← Chart container
│   └── email-campaign-editor.tsx      ← Email builder
├── marketing/sub-components/
│   ├── email-template-list.tsx
│   ├── social-post-scheduler.tsx
│   ├── landing-page-builder.tsx
│   └── form-builder.tsx
```

### **Existing Components to Extend**

- `Table` from shadcn/ui
- `Select` for filtering
- `Badge` for status labels
- `Button` for actions
- `Checkbox` for multi-select
- `Card` for metric display
- `Chart` libraries (Recharts, Chart.js)

---

## VII. KEY UX PATTERNS

✅ **Inline Editing** - Edit campaign details without modal  
✅ **Quick Actions** - Pause, Resume, Duplicate from dropdown  
✅ **Batch Operations** - Select multiple campaigns for bulk actions  
✅ **Real-time Metrics** - Auto-refresh KPI cards  
✅ **Dashboard Overview** - Single view of all key metrics  
✅ **Drill-down Analytics** - Click metric cards to drill into details  
✅ **Export & Scheduling** - Schedule reports delivery  
✅ **Campaign Templates** - Pre-built campaign templates  
✅ **Workflow Automation** - Trigger-based campaign actions  
✅ **A/B Testing Interface** - Easy variant management  

---

## VIII. DATA FLOW DIAGRAM

```
User Input (Search/Filter)
        ↓
Client-side Filtering
        ↓
Campaign Store (Caching)
        ↓
Table Render
        ↓
   ┌────────────────┬──────────────┐
   ↓                ↓              ↓
Row Actions    Bulk Actions   Pagination
   ↓                ↓              ↓
Detail View    Status Update  Page Change
   ↓                ↓              ↓
Analytics Dashboard  Cache Refresh  List Update
```

---

## IX. FILE STRUCTURE (Planned)

```
app/
├── dashboard/
│   └── app-store/
│       └── marketing/
│           ├── page.tsx                ← Marketing hub
│           ├── [id]/                   ← Campaign detail
│           │   └── page.tsx
│           ├── email/
│           │   └── page.tsx
│           ├── social/
│           │   └── page.tsx
│           └── landing/
│               └── page.tsx

lib/
├── actions/
│   └── marketing.ts                    ← Server actions
├── marketing-store.ts                  ← Client store
└── constants/
    └── marketing.ts                    ← Constants
```

---

## X. IMPLEMENTATION ROADMAP

### **Phase 1: Foundation** (Week 1-2)
- [ ] Campaign CRUD operations
- [ ] Basic table list with filtering
- [ ] Multi-select & bulk actions
- [ ] Export to Excel

### **Phase 2: Analytics** (Week 3-4)
- [ ] KPI dashboard
- [ ] Performance charts
- [ ] Conversion funnel
- [ ] ROI calculation

### **Phase 3: Campaign Types** (Week 5-6)
- [ ] Email campaign builder
- [ ] SMS campaign management
- [ ] Social media scheduler
- [ ] Landing page builder

### **Phase 4: Advanced Features** (Week 7-8)
- [ ] A/B testing
- [ ] Automation workflows
- [ ] Lead scoring
- [ ] CRM integration

---

**Document Version:** 1.0  
**Last Updated:** 25/02/2026  
**Prepared by:** GitHub Copilot  
**Status:** Planned Implementation Reference Document
