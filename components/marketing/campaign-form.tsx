'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createCampaign, updateCampaign } from '@/lib/actions/marketing'
import { marketingStore } from '@/lib/marketing-store'
import { CAMPAIGN_OBJECTIVES, CHANNELS, CURRENCY_CODES, DEFAULT_CAMPAIGN } from '@/lib/constants/marketing'

interface CampaignFormProps {
    campaign?: any
    projects: { project_id: string; project_name: string }[]
    isEdit?: boolean
}

export function CampaignForm({ campaign, projects, isEdit = false }: CampaignFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        campaign_name: campaign?.campaign_name || '',
        description: campaign?.description || '',
        objective: campaign?.objective || 'Lead Generation',
        channels: campaign?.channels || ['Email'],
        total_budget: campaign?.total_budget || '',
        currency_code: campaign?.currency_code || 'VND',
        start_date: campaign?.start_date || new Date().toISOString().split('T')[0],
        end_date: campaign?.end_date || '',
        project_id: campaign?.project_id || '',
        target_audience: campaign?.target_audience || '',
        status: campaign?.status || 'Draft',
    })

    const handleChannelToggle = (channel: string) => {
        setFormData(prev => ({
            ...prev,
            channels: prev.channels.includes(channel)
                ? prev.channels.filter((c: string) => c !== channel)
                : [...prev.channels, channel]
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const submitData = {
                ...formData,
                total_budget: Number(formData.total_budget) || 0,
                project_id: formData.project_id || null,
            }

            let result
            if (isEdit && campaign?.campaign_id) {
                result = await updateCampaign(campaign.campaign_id, submitData)
            } else {
                result = await createCampaign(submitData)
            }

            if (result.success) {
                await marketingStore.refresh(formData.project_id || null)
                router.push('/dashboard/app-store/marketing')
                router.refresh()
            } else {
                alert(result.error || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Có lỗi xảy ra khi lưu chiến dịch')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Link href="/dashboard/app-store/marketing">
                    <Button variant="ghost" size="icon" className="rounded-lg">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">
                    {isEdit ? 'Chỉnh sửa chiến dịch' : 'Tạo chiến dịch mới'}
                </h1>
            </div>

            {/* Basic Info */}
            <Card className="rounded-xl border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="campaign_name" className="text-[13px] font-semibold">
                            Tên chiến dịch *
                        </Label>
                        <Input
                            id="campaign_name"
                            placeholder="VD: Campaign Valentine 2026"
                            value={formData.campaign_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, campaign_name: e.target.value }))}
                            className="rounded-lg h-10"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-[13px] font-semibold">
                            Mô tả
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Mô tả chi tiết về chiến dịch..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="rounded-lg min-h-24 text-[13px]"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="objective" className="text-[13px] font-semibold">
                                Mục tiêu *
                            </Label>
                            <Select value={formData.objective} onValueChange={(value) => setFormData(prev => ({ ...prev, objective: value }))}>
                                <SelectTrigger className="rounded-lg h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    {CAMPAIGN_OBJECTIVES.map(obj => (
                                        <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="project" className="text-[13px] font-semibold">
                                Dự án
                            </Label>
                            <Select value={formData.project_id} onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}>
                                <SelectTrigger className="rounded-lg h-10">
                                    <SelectValue placeholder="Chọn dự án" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="">Không chọn dự án</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.project_id} value={p.project_id}>
                                            {p.project_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Channels */}
            <Card className="rounded-xl border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Kênh truyền thông *</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {CHANNELS.map(channel => (
                            <div key={channel} className="flex items-center space-x-2">
                                <Checkbox
                                    id={channel}
                                    checked={formData.channels.includes(channel)}
                                    onCheckedChange={() => handleChannelToggle(channel)}
                                />
                                <Label htmlFor={channel} className="text-[13px] font-medium cursor-pointer">
                                    {channel}
                                </Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Budget & Timeline */}
            <Card className="rounded-xl border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Ngân sách & Lịch trình</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="total_budget" className="text-[13px] font-semibold">
                                Ngân sách *
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="total_budget"
                                    type="number"
                                    placeholder="0"
                                    value={formData.total_budget}
                                    onChange={(e) => setFormData(prev => ({ ...prev, total_budget: e.target.value }))}
                                    className="rounded-lg h-10 flex-1"
                                />
                                <Select value={formData.currency_code} onValueChange={(value) => setFormData(prev => ({ ...prev, currency_code: value }))}>
                                    <SelectTrigger className="rounded-lg h-10 w-[100px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg">
                                        {CURRENCY_CODES.map(code => (
                                            <SelectItem key={code} value={code}>{code}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-[13px] font-semibold">
                                Trạng thái
                            </Label>
                            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                                <SelectTrigger className="rounded-lg h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="Draft">Nháp</SelectItem>
                                    <SelectItem value="Scheduled">Lên lịch</SelectItem>
                                    <SelectItem value="Running">Đang chạy</SelectItem>
                                    <SelectItem value="Paused">Tạm dừng</SelectItem>
                                    <SelectItem value="Completed">Hoàn thành</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date" className="text-[13px] font-semibold">
                                Ngày bắt đầu *
                            </Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                className="rounded-lg h-10"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_date" className="text-[13px] font-semibold">
                                Ngày kết thúc
                            </Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                className="rounded-lg h-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end">
                <Link href="/dashboard/app-store/marketing">
                    <Button variant="outline" className="rounded-lg" disabled={isLoading}>
                        Hủy
                    </Button>
                </Link>
                <Button type="submit" className="rounded-lg gap-2" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            Lưu chiến dịch
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
