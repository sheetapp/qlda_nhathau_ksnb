import { getCampaignById } from '@/lib/actions/marketing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit2, Trash2, Download } from 'lucide-react'
import Link from 'next/link'
import { CAMPAIGN_STATUS_COLORS, CHANNEL_ICONS } from '@/lib/constants/marketing'
import { cn } from '@/lib/utils'

interface CampaignDetailPageProps {
    params: {
        id: string
    }
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
    const campaign = await getCampaignById(params.id)

    if (!campaign) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] p-4">
                <p className="text-lg text-muted-foreground mb-4">Không tìm thấy chiến dịch</p>
                <Link href="/dashboard/app-store/marketing">
                    <Button variant="outline" className="rounded-lg">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                </Link>
            </div>
        )
    }

    // Calculate basic metrics
    const budgetUsedPercent = campaign.total_budget > 0
        ? ((campaign.spent_amount / campaign.total_budget) * 100).toFixed(1)
        : '0'

    return (
        <div className="flex flex-col gap-6 p-4 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link href="/dashboard/app-store/marketing" className="group">
                    <Button variant="ghost" size="icon" className="rounded-lg mb-2 group-hover:bg-muted/50">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground">{campaign.campaign_name}</h1>
                    {campaign.description && (
                        <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/app-store/marketing/${campaign.campaign_id}/edit`}>
                        <Button variant="outline" className="rounded-lg gap-2" size="sm">
                            <Edit2 className="h-4 w-4" />
                            Chỉnh sửa
                        </Button>
                    </Link>
                    <Button variant="ghost" className="rounded-lg" size="sm">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Status & Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status */}
                <Card className="rounded-xl border-border/50 shadow-sm">
                    <CardContent className="pt-6">
                        <Badge
                            className={cn(
                                "rounded-full px-3 py-1 text-xs font-semibold border w-full justify-center",
                                CAMPAIGN_STATUS_COLORS[campaign.status as keyof typeof CAMPAIGN_STATUS_COLORS]?.bg,
                                CAMPAIGN_STATUS_COLORS[campaign.status as keyof typeof CAMPAIGN_STATUS_COLORS]?.text,
                                CAMPAIGN_STATUS_COLORS[campaign.status as keyof typeof CAMPAIGN_STATUS_COLORS]?.border,
                            )}
                        >
                            {CAMPAIGN_STATUS_COLORS[campaign.status as keyof typeof CAMPAIGN_STATUS_COLORS]?.icon} {campaign.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-3 text-center">Trạng thái</p>
                    </CardContent>
                </Card>

                {/* Objective */}
                <Card className="rounded-xl border-border/50 shadow-sm">
                    <CardContent className="pt-6">
                        <p className="font-semibold text-center text-sm">{campaign.objective}</p>
                        <p className="text-xs text-muted-foreground mt-3 text-center">Mục tiêu</p>
                    </CardContent>
                </Card>

                {/* Channels */}
                <Card className="rounded-xl border-border/50 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex gap-1 flex-wrap justify-center">
                            {campaign.channels.map((channel: string) => (
                                <Badge key={channel} variant="secondary" className="text-xs rounded">
                                    {CHANNEL_ICONS[channel as keyof typeof CHANNEL_ICONS]} {channel}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 text-center">Kênh</p>
                    </CardContent>
                </Card>

                {/* Duration */}
                <Card className="rounded-xl border-border/50 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center text-sm">
                            <p className="font-semibold">{new Date(campaign.start_date).toLocaleDateString('vi-VN')}</p>
                            {campaign.end_date && (
                                <p className="text-xs text-muted-foreground">đến {new Date(campaign.end_date).toLocaleDateString('vi-VN')}</p>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 text-center">Thời gian</p>
                    </CardContent>
                </Card>
            </div>

            {/* Budget */}
            <Card className="rounded-xl border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Ngân sách</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {/* Total Budget */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Tổng ngân sách</p>
                            <p className="text-2xl font-bold">
                                {campaign.total_budget.toLocaleString('vi-VN')}
                                <span className="text-lg text-muted-foreground ml-2">{campaign.currency_code}</span>
                            </p>
                        </div>

                        {/* Spent */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Đã chi tiêu</p>
                            <p className="text-2xl font-bold">
                                {campaign.spent_amount.toLocaleString('vi-VN')}
                                <span className="text-lg text-muted-foreground ml-2">{campaign.currency_code}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{budgetUsedPercent}% ngân sách</p>
                        </div>

                        {/* Remaining */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Còn lại</p>
                            <p className="text-2xl font-bold">
                                {(campaign.total_budget - campaign.spent_amount).toLocaleString('vi-VN')}
                                <span className="text-lg text-muted-foreground ml-2">{campaign.currency_code}</span>
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all"
                                style={{ width: `${Math.min(100, Number(budgetUsedPercent))}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Analytics Placeholder */}
            <Card className="rounded-xl border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Hiệu suất</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground mb-2">Impressions</p>
                            <p className="text-2xl font-bold">0</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground mb-2">Clicks</p>
                            <p className="text-2xl font-bold">0</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground mb-2">Conversions</p>
                            <p className="text-2xl font-bold">0</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground mb-2">ROI</p>
                            <p className="text-2xl font-bold">0%</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                        Metrics sẽ được cập nhật khi chiến dịch bắt đầu chạy
                    </p>
                </CardContent>
            </Card>

            {/* Project Info */}
            {campaign.project && (
                <Card className="rounded-xl border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Dự án</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{campaign.project.project_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">ID: {campaign.project.project_id}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
