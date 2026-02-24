'use client'

import Link from 'next/link'
import { Star, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AppItem } from '@/lib/constants/apps'

interface AppGridProps {
    apps: AppItem[]
    favorites: string[]
    onToggleFavorite: (id: string, e: React.MouseEvent) => void
    detailed?: boolean
}

export function AppGrid({ apps, favorites, onToggleFavorite, detailed = false }: AppGridProps) {
    return (
        <div className={cn(
            "grid gap-6",
            detailed
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        )}>
            {apps.map((app) => {
                const CardContent = (
                    <div
                        className={cn(
                            "group relative flex flex-col items-center bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden h-full",
                            detailed ? "p-8 rounded-[2.5rem]" : "p-8 rounded-[2rem]"
                        )}
                    >
                        <div className="absolute top-4 right-4 z-10">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white shadow-md hover:bg-slate-50 border border-slate-50",
                                    detailed ? "h-11 w-11" : "h-10 w-10",
                                    favorites.includes(app.id) ? "text-yellow-500 opacity-100" : "text-slate-300"
                                )}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    onToggleFavorite(app.id, e)
                                }}
                            >
                                <Star className={cn(detailed ? "h-5 w-5" : "h-4.5 w-4.5", favorites.includes(app.id) && "fill-current")} />
                            </Button>
                        </div>

                        <div className={cn(
                            "rounded-2xl text-white shadow-xl group-hover:scale-110 transition-transform duration-500",
                            app.color,
                            detailed ? "p-6 mb-8 rounded-[2rem]" : "p-5 mb-6 rounded-2xl"
                        )}>
                            <app.icon className={detailed ? "h-10 w-10" : "h-8 w-8"} />
                        </div>

                        <div className="text-center">
                            <h3 className={cn(
                                "font-bold group-hover:text-primary transition-colors",
                                detailed ? "text-xl mb-2" : "text-lg mb-1.5"
                            )}>
                                {app.title}
                            </h3>
                            <p className={cn(
                                "text-slate-400 line-clamp-2 leading-relaxed px-2",
                                detailed ? "text-[13px]" : "text-xs"
                            )}>
                                {app.description}
                            </p>
                        </div>

                        <div className={cn(
                            "absolute bottom-0 left-0 w-full bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center",
                            detailed ? "h-1.5" : "h-1"
                        )} />
                    </div>
                )

                return app.href ? (
                    <Link key={app.id} href={app.href} className="block h-full">
                        {CardContent}
                    </Link>
                ) : (
                    <div key={app.id} className="h-full">
                        {CardContent}
                    </div>
                )
            })}
        </div>
    )
}
