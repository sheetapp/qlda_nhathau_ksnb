import { Building2, Users2, Megaphone, Wallet, ShoppingCart, Box, Settings2, Sparkles, Workflow, MessageSquare } from 'lucide-react'

export interface AppItem {
    id: string
    title: string
    description: string
    category: 'function' | 'system'
    icon: any
    color: string
    href?: string
}

export const APPS: AppItem[] = [
    {
        id: 'hc',
        title: 'Hành chính tổng hợp',
        description: 'Công văn, hợp đồng, văn thư lưu trữ.',
        category: 'function',
        icon: Building2,
        color: 'bg-orange-500',
        href: '/dashboard/app-store/administration'
    },
    {
        id: 'ns',
        title: 'Nhân sự tổng hợp',
        description: 'Quản lý kế hoạch, tuyển dụng, đào tạo và phát triển.',
        category: 'function',
        icon: Users2,
        color: 'bg-emerald-500',
        href: '/dashboard/app-store/personnel'
    },
    {
        id: 'mkt',
        title: 'Marketing',
        description: 'Chiễu dịch, khách hàng, báo cáo marketing.',
        category: 'function',
        icon: Megaphone,
        color: 'bg-rose-500',
        href: '/dashboard/app-store/marketing'
    },
    {
        id: 'tc',
        title: 'Tài chính',
        description: 'Kế toán, ngân sách, báo cáo tài chính.',
        category: 'function',
        icon: Wallet,
        color: 'bg-violet-500',
        href: '/dashboard/app-store/finance'
    },
    {
        id: 'mh',
        title: 'Mua hàng',
        description: 'Đặt hàng, nhà cung cấp, đấu thầu.',
        category: 'function',
        icon: ShoppingCart,
        color: 'bg-orange-600',
        href: '/dashboard/app-store/purchasing'
    },
    {
        id: 'kv',
        title: 'Kho vận',
        description: 'Tồn kho, xuất nhập kho, vận chuyển.',
        category: 'function',
        icon: Box,
        color: 'bg-cyan-500',
        href: '/dashboard/app-store/logistics'
    },
    {
        id: 'qtp',
        title: 'Quản trị quy trình',
        description: 'Quản trị quy trình phê duyệt giữa các hệ thống.',
        category: 'system',
        icon: Workflow,
        color: 'bg-blue-600'
    },
    {
        id: 'tdnb',
        title: 'Trao đổi nội bộ',
        description: 'Hệ thống trao đổi văn bản và thông tin nội bộ.',
        category: 'system',
        icon: MessageSquare,
        color: 'bg-indigo-600'
    },
    {
        id: 'ht',
        title: 'Hệ thống',
        description: 'Cấu hình, phân quyền và nhân sự.',
        category: 'system',
        icon: Settings2,
        color: 'bg-slate-700',
        href: '/dashboard/system'
    },
    {
        id: 'ai',
        title: 'Trợ lý AI',
        description: 'Hỗ trợ nghiệp vụ, phân tích dữ liệu thông minh.',
        category: 'system',
        icon: Sparkles,
        color: 'bg-indigo-500'
    }
]
