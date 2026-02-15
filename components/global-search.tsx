'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function GlobalSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const q = searchParams.get('q') || ''
    const [searchTerm, setSearchTerm] = useState(q)

    useEffect(() => {
        setSearchTerm(q)
    }, [q])

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const currentQ = searchParams.get('q') || ''
            if (searchTerm === currentQ) return

            const params = new URLSearchParams(searchParams)
            if (searchTerm) {
                params.set('q', searchTerm)
            } else {
                params.delete('q')
            }
            router.push(`?${params.toString()}`, { scroll: false })
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm, router, searchParams])

    return (
        <div className="relative max-w-md w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
            <input
                type="text"
                placeholder="Tìm kiếm dự án, yêu cầu, vật tư..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-secondary/50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-background/80 transition-all outline-none"
            />
        </div>
    )
}
