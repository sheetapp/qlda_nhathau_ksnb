import { useState, useEffect, useMemo } from 'react'
import { Check, ChevronsUpDown, Search, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { resourceStore, type Resource } from '@/lib/resource-store'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

interface ResourceComboboxProps {
    value: string
    onChange: (name: string, unit: string | null, price: number | null, code: string) => void
    placeholder?: string
    className?: string
    onAddNew?: () => void
}

export function ResourceCombobox({
    value,
    onChange,
    onAddNew,
    placeholder = "Chọn vật tư hoặc nhập tên...",
    className
}: ResourceComboboxProps) {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [allResources, setAllResources] = useState<Resource[]>(resourceStore.getCachedResources())
    const [isLoading, setIsLoading] = useState(resourceStore.getIsLoading())

    // Subscribe to resource store
    useEffect(() => {
        // Initial load if cache is empty
        if (allResources.length === 0) {
            setIsLoading(true)
            resourceStore.getResources().then(resources => {
                setAllResources(resources)
                setIsLoading(false)
            })
        }

        const unsubscribe = resourceStore.subscribe((resources) => {
            setAllResources(resources)
            setIsLoading(resourceStore.getIsLoading())
        })
        return unsubscribe
    }, [])

    // Optimized local filtering with limit
    const filteredResources = useMemo(() => {
        if (!inputValue.trim()) {
            return allResources.slice(0, 50)
        }

        const query = inputValue.toLowerCase()
        const filtered = []
        for (const r of allResources) {
            if (r.resource_name.toLowerCase().includes(query) ||
                r.resource_id.toLowerCase().includes(query)) {
                filtered.push(r)
                if (filtered.length >= 50) break // Limit results for performance
            }
        }
        return filtered
    }, [allResources, inputValue])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "h-10 w-full justify-between rounded-lg border-border/20 bg-card text-[13px] font-medium px-3 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all duration-200",
                        !value && "text-muted-foreground/40",
                        className
                    )}
                >
                    <span className="truncate text-left">
                        {value || placeholder}
                    </span>
                    {isLoading ? (
                        <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command shouldFilter={false}>
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            placeholder="Tìm theo tên hoặc mã..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-[13px] outline-none placeholder:text-muted-foreground/40 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {onAddNew && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 ml-1 rounded-full text-primary hover:text-primary hover:bg-primary/10"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    onAddNew()
                                }}
                                title="Thêm tài nguyên mới"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <CommandList>
                        {isLoading && allResources.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                                Đang tải danh sách tài nguyên...
                            </div>
                        ) : (
                            <>
                                <CommandEmpty className="py-6 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-[13px] text-muted-foreground">Không tìm thấy vật tư.</span>
                                        {onAddNew && (
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="text-primary font-semibold p-0 h-auto"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    onAddNew()
                                                }}
                                            >
                                                + Thêm tài nguyên mới
                                            </Button>
                                        )}
                                    </div>
                                </CommandEmpty>
                                <CommandGroup className="max-h-[280px] overflow-auto">
                                    {filteredResources.map((resource) => (
                                        <CommandItem
                                            key={resource.resource_id}
                                            value={resource.resource_id}
                                            onSelect={() => {
                                                onChange(
                                                    resource.resource_name,
                                                    resource.unit,
                                                    resource.unit_price,
                                                    resource.resource_id
                                                )
                                                setOpen(false)
                                                setInputValue('')
                                            }}
                                            className="cursor-pointer py-3"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === resource.resource_name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col flex-1 min-w-0 gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[11px] text-primary font-semibold uppercase tracking-wide">
                                                        {resource.resource_id}
                                                    </span>
                                                    {resource.unit && (
                                                        <span className="text-[11px] text-muted-foreground/60 font-medium">
                                                            ({resource.unit})
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[13px] font-medium truncate">{resource.resource_name}</span>
                                                {resource.unit_price !== null && resource.unit_price > 0 && (
                                                    <span className="text-[11px] text-muted-foreground/60 font-medium">
                                                        {new Intl.NumberFormat('vi-VN').format(resource.unit_price)} VNĐ
                                                    </span>
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                    {allResources.length > 50 && filteredResources.length === 50 && !inputValue && (
                                        <div className="py-2 px-4 text-[11px] text-muted-foreground/60 italic border-t border-border/10 mt-1">
                                            Hiển thị 50 kết quả đầu tiên. Vui lòng nhập từ khóa để tìm chính xác hơn.
                                        </div>
                                    )}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
