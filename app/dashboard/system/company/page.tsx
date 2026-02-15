'use client'

import { useState, useEffect } from 'react'
import { Building2, ArrowLeft, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { getCompanyInfo, updateCompanyInfo } from '@/lib/actions/system'
import { toast } from 'sonner'

export default function CompanyInfoPage() {
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        tax_code: '',
        legal_representative: '',
        phone: '',
        email: '',
        website: '',
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)
            const data = await getCompanyInfo()
            if (data) {
                setFormData({
                    name: data.name || '',
                    address: data.address || '',
                    tax_code: data.tax_code || '',
                    legal_representative: data.legal_representative || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    website: data.website || '',
                })
            }
        } catch (error) {
            toast.error("Không thể tải thông tin công ty")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsSubmitting(true)
            await updateCompanyInfo(formData)
            toast.success("Cập nhật thông tin công ty thành công")
        } catch (error) {
            toast.error("Lỗi khi cập nhật thông tin")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-4 max-w-full space-y-8 font-sans">
            {/* Header section removed - handled by DynamicHeader */}

            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[1.5rem] p-8 shadow-sm max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-1.5">
                            <Label htmlFor="name" className="text-[12px] font-semibold text-slate-600 pl-1">Tên Công ty *</Label>
                            <Input
                                id="name"
                                required
                                className="h-10 rounded-xl text-[13px]"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="tax_code" className="text-[12px] font-semibold text-slate-600 pl-1">Mã số thuế</Label>
                            <Input
                                id="tax_code"
                                className="h-10 rounded-xl text-[13px]"
                                value={formData.tax_code}
                                onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="legal_representative" className="text-[12px] font-semibold text-slate-600 pl-1">Người đại diện pháp luật</Label>
                            <Input
                                id="legal_representative"
                                className="h-10 rounded-xl text-[13px]"
                                value={formData.legal_representative}
                                onChange={(e) => setFormData({ ...formData, legal_representative: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <Label htmlFor="address" className="text-[12px] font-semibold text-slate-600 pl-1">Địa chỉ trụ sở</Label>
                            <Input
                                id="address"
                                className="h-10 rounded-xl text-[13px]"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-[12px] font-semibold text-slate-600 pl-1">Số điện thoại</Label>
                            <Input
                                id="phone"
                                className="h-10 rounded-xl text-[13px]"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-[12px] font-semibold text-slate-600 pl-1">Email liên hệ</Label>
                            <Input
                                id="email"
                                type="email"
                                className="h-10 rounded-xl text-[13px]"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <Label htmlFor="website" className="text-[12px] font-semibold text-slate-600 pl-1">Website</Label>
                            <Input
                                id="website"
                                placeholder="https://..."
                                className="h-10 rounded-xl text-[13px]"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/95 text-white px-8 h-10 rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Lưu cấu hình
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
