'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

const ROUTE_METADATA: Record<string, { title: string; description: string }> = {
    '/dashboard': {
        title: 'Tổng quan hệ thống',
        description: 'Theo dõi các chỉ số quan trọng, dự án và tài chính của công ty.'
    },
    '/dashboard/projects': {
        title: 'Quản lý Dự án',
        description: 'Quản lý danh sách, tiến độ và thông tin chi tiết các dự án đang triển khai.'
    },
    '/dashboard/tasks': {
        title: 'Quản lý Công việc',
        description: 'Theo dõi phân công, tiến độ và trạng thái công việc của các dự án.'
    },
    '/dashboard/resources': {
        title: 'Quản lý Tài nguyên',
        description: 'Theo dõi thiết bị, vật liệu và quản lý tồn kho tài nguyên.'
    },
    '/dashboard/pyc': {
        title: 'Phiếu yêu cầu (PYC)',
        description: 'Quản lý quy trình yêu cầu vật tư, hồ sơ và phê duyệt mua sắm.'
    },
    '/dashboard/dntt': {
        title: 'Thanh toán (DNTT)',
        description: 'Quản lý đề nghị thanh toán và đối soát chứng từ tài chính.'
    },
    '/dashboard/personnel': {
        title: 'Quản lý Nhân sự',
        description: 'Quản lý thông tin nhân viên, bộ phận và phân quyền tài khoản.'
    },
    '/dashboard/warehouse': {
        title: 'Kho vật tư',
        description: 'Quản lý xuất nhập kho và theo dõi vị trí vật liệu.'
    },
    '/dashboard/control': {
        title: 'Kiểm soát nội bộ',
        description: 'Hệ thống kiểm tra, đánh giá và quản lý checklist hồ sơ.'
    },
    '/dashboard/system': {
        title: 'Quản trị Hệ thống',
        description: 'Cấu hình sơ đồ tổ chức, bảo mật và các mẫu biểu nghiệp vụ.'
    },
    '/dashboard/system/departments': {
        title: 'Quản lý Phòng ban',
        description: 'Cơ cấu tổ chức đơn vị, phòng ban trong doanh nghiệp.'
    },
    '/dashboard/system/levels': {
        title: 'Quản lý Cấp bậc',
        description: 'Hệ thống thang bảng lương và level nhân sự.'
    },
    '/dashboard/system/positions': {
        title: 'Quản lý Chức vụ',
        description: 'Quản lý danh sách các vị trí công việc.'
    },
    '/dashboard/system/functions': {
        title: 'Chức năng nhiệm vụ',
        description: 'Sứ mệnh, chức năng phòng ban và nhiệm vụ, bộ chỉ số KPI.'
    },
    '/dashboard/system/company': {
        title: 'Thông tin công ty',
        description: 'Thiết lập thông tin pháp nhân và thương hiệu.'
    },
    '/dashboard/system/branches': {
        title: 'Quản lý Chi nhánh',
        description: 'Quản lý danh sách chi nhánh và địa điểm làm việc.'
    },
    '/dashboard/system/checklist': {
        title: 'Mẫu Checklist',
        description: 'Cấu hình danh mục kiểm tra hồ sơ và điều kiện thanh toán chuyên sâu.'
    },
    '/dashboard/system/templates': {
        title: 'Mẫu biểu Hệ thống',
        description: 'Quản lý các biểu mẫu chuẩn cho các nghiệp vụ trong công ty.'
    }
}

const TEMPLATE_NAMES: Record<string, string> = {
    'PYC': 'Mẫu phiếu Yêu cầu',
    'DNTT': 'Mẫu Đề nghị Thanh toán',
    'EXPORT': 'Mẫu phiếu Xuất kho',
    'IMPORT': 'Mẫu phiếu Nhập kho',
    'CHECKLIST': 'Mẫu biểu Checklist',
}

export function DynamicHeader() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const type = searchParams.get('type')

    // Find matching metadata or default
    const metadata = ROUTE_METADATA[pathname] || {
        title: 'Hệ thống KSNB',
        description: 'Nền tảng quản lý tài chính và kiểm soát nội bộ chuyên sâu.'
    }

    // Generate breadcrumbs segments
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs = pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`
        const item = ROUTE_METADATA[path]

        let name = item?.title || segment.charAt(0).toUpperCase() + segment.slice(1)

        // Dynamic name for templates based on query param
        if (path === '/dashboard/system/templates' && type) {
            name = TEMPLATE_NAMES[type] || name
        }

        return {
            name: name,
            href: path,
            isLast: index === pathSegments.length - 1
        }
    })

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col pl-1">
                <h1 className="text-xl font-bold tracking-tight text-foreground leading-none mb-1">
                    {metadata.title}
                </h1>
                <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                    {metadata.description}
                </p>
            </div>

            {/* Breadcrumbs */}
            <nav className="flex items-center text-[13px] font-medium text-slate-500 gap-1.5">
                <Link
                    href="/dashboard"
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 border border-slate-100/50 hover:bg-slate-100 transition-colors"
                >
                    <Home className="h-4 w-4" />
                </Link>

                {breadcrumbs.map((crumb, i) => (
                    <div key={crumb.href} className="flex items-center gap-1.5">
                        <ChevronRight className="h-3.5 w-3.5 opacity-40 shrink-0" />
                        {crumb.isLast ? (
                            <span className="px-3 py-1.5 rounded-lg bg-primary text-white font-semibold">
                                {crumb.name}
                            </span>
                        ) : (
                            <Link
                                href={crumb.href}
                                className="px-2 py-1 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-all font-semibold"
                            >
                                {crumb.name}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    )
}
