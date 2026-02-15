'use client'

import { ShieldCheck, ArrowLeft, Construction } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SecurityPlaceholderPage({ title, description }: { title: string, description: string }) {
    return (
        <div className="p-4 max-w-full space-y-12 font-sans">
            {/* Header section removed - handled by DynamicHeader */}

            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[1.5rem] p-20 text-center space-y-6 max-w-4xl">
                <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <Construction className="h-10 w-10 text-slate-300" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Đang phát triển</h2>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Tính năng này đang được xây dựng kỹ lưỡng để đảm bảo an toàn bảo mật cho hệ thống.
                    </p>
                </div>
                <Button asChild variant="outline" className="rounded-xl px-8 h-12 border-slate-200">
                    <Link href="/dashboard/system">Quay lại danh mục</Link>
                </Button>
            </div>
        </div>
    )
}
