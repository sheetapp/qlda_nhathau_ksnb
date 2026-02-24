'use client'

import { useState, useEffect } from 'react'
import { LayoutGrid, Star, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { APPS, AppItem } from '@/lib/constants/apps'
import { AppGrid } from '@/components/app-grid'

export default function AppStorePage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [favorites, setFavorites] = useState<string[]>([])

    // Load favorites from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('app-store-favorites')
        if (saved) {
            try {
                setFavorites(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to parse favorites', e)
            }
        }
    }, [])

    // Save favorites to localStorage
    const toggleFavorite = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const newFavorites = favorites.includes(id)
            ? favorites.filter(f => f !== id)
            : [...favorites, id]

        setFavorites(newFavorites)
        localStorage.setItem('app-store-favorites', JSON.stringify(newFavorites))
    }

    const filteredApps = APPS.filter(app =>
        app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const favoriteApps = APPS.filter(app => favorites.includes(app.id))

    return (
        <div className="flex flex-col h-full bg-slate-50/10">
            <div className="flex flex-col gap-6 p-6">
                <Tabs defaultValue="functions" className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                        <TabsList className="bg-slate-100/50 p-1 gap-1 h-auto shrink-0">
                            <TabsTrigger
                                value="functions"
                                className="rounded-xl px-6 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                            >
                                Chức năng
                            </TabsTrigger>
                            <TabsTrigger
                                value="favorites"
                                className="rounded-xl px-6 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                            >
                                Yêu thích
                            </TabsTrigger>
                            <TabsTrigger
                                value="all"
                                className="rounded-xl px-6 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                            >
                                Tất cả
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative w-full sm:w-[320px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm ứng dụng..."
                                className="pl-10 h-10 bg-slate-50/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <TabsContent value="functions" className="focus-visible:outline-none">
                        <AppGrid
                            apps={filteredApps}
                            favorites={favorites}
                            onToggleFavorite={toggleFavorite}
                            detailed
                        />
                    </TabsContent>

                    <TabsContent value="favorites" className="focus-visible:outline-none">
                        {favoriteApps.length > 0 ? (
                            <AppGrid
                                apps={favoriteApps.filter(app => filteredApps.includes(app))}
                                favorites={favorites}
                                onToggleFavorite={toggleFavorite}
                                detailed
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-3xl border border-dashed border-slate-200 text-muted-foreground">
                                <Star className="h-16 w-16 opacity-5 mb-4" />
                                <p className="font-medium">Chưa có ứng dụng yêu thích nào</p>
                                <p className="text-xs">Đánh dấu sao các ứng dụng bạn thường xuyên sử dụng để truy cập nhanh.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="all" className="focus-visible:outline-none">
                        <AppGrid
                            apps={filteredApps}
                            favorites={favorites}
                            onToggleFavorite={toggleFavorite}
                            detailed
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

